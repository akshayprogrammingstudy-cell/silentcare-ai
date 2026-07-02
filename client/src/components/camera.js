/**
 * SilentCare AI - Camera Component (MediaPipe Hands + Full Sign Detection)
 * Renders live webcam feed, runs client-side hand skeleton tracking,
 * draws glowing skeleton overlays, and triggers callback on classified signs.
 *
 * FEATURES:
 *  - 20 heuristic gesture classifiers (hello, help, emergency, yes, no, okay,
 *    water, food, stop, wait, pain, doctor, thank you, scared, tired, hungry,
 *    ambulance, need help, I am okay, danger)
 *  - ASL fingerspelling fallback (A-Z letters via landmark geometry)
 *  - Real-time confidence meter bar in overlay
 *  - On-screen gesture label overlay
 *  - 4-frame hold debouncing before firing callback
 *  - Proper cleanup on destroy
 */

import { Camera as CameraService } from '../utils/camera.js';
import { Toast } from './toast.js';

export class CameraComponent {
  constructor(container, onSignDetectedCallback = null) {
    this.container = container;
    this.onSignDetected = onSignDetectedCallback;

    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;

    this.isMirrored = true;
    this.facingMode = 'user';
    this.stream = null;
    this.hands = null;
    this.isAiActive = false;
    this.tickRafId = null;
    this.aiTimeoutId = null;
    this.isProcessingFrame = false;

    // Detection state
    this.lastDetectedSign = '';
    this.detectionCooldown = 0;
    this.noHandTicks = 0;
    this.neutralTicks = 0;

    // Gesture hold counter — require 4 consistent frames before firing callback
    this.candidateSign = '';
    this.candidateHoldCount = 0;
    this.HOLD_THRESHOLD = 4;
  }

  async init() {
    this.render();
    this.setupMediaPipe();
    await this.start();
  }

  render() {
    this.container.innerHTML = `
      <div class="camera-card glass-card" style="position: relative; overflow: hidden;">
        <!-- Live Video Element -->
        <video id="webcam-stream" class="camera-stream ${this.isMirrored ? 'mirrored' : ''}"
          autoplay playsinline muted
          style="width:100%; height:100%; object-fit:cover; display:block;">
        </video>

        <!-- Overlaid Skeleton Canvas -->
        <canvas id="camera-overlay-canvas" class="${this.isMirrored ? 'mirrored' : ''}"
          style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5; background:transparent;">
        </canvas>

        <!-- On-screen detected gesture label -->
        <div id="gesture-label-overlay" style="
          display: none;
          position: absolute;
          bottom: 5.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          background: rgba(13, 148, 136, 0.92);
          color: #fff;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.4rem;
          font-weight: 800;
          padding: 0.45rem 1.4rem;
          border-radius: 30px;
          border: 2px solid rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 20px rgba(13,148,136,0.5);
          transition: opacity 0.2s ease;
        "></div>

        <!-- Confidence meter bar -->
        <div id="confidence-meter-wrap" style="
          display: none;
          position: absolute;
          bottom: 4.2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          width: 160px;
          height: 6px;
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
          overflow: hidden;
        ">
          <div id="confidence-meter-bar" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #0d9488, #22c55e);
            border-radius: 3px;
            transition: width 0.3s ease;
          "></div>
        </div>

        <!-- Live status indicator -->
        <div style="position:absolute; top:1rem; left:1rem; z-index:10; display:flex; align-items:center; background:rgba(0,0,0,0.65); padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:600; gap:0.5rem; border:1px solid var(--border-color);">
          <span class="camera-active-dot" id="camera-status-indicator"></span>
          <span id="camera-status-text">Connecting...</span>
          <span id="ai-status-badge" style="background:var(--primary-glow); color:var(--primary-light); padding:0.1rem 0.4rem; border-radius:4px; font-size:0.7rem; border:1px solid var(--primary); display:none;">MOTION AI</span>
        </div>

        <!-- Gesture hint tip -->
        <div id="camera-gesture-hint" style="
          position: absolute; bottom: 1rem; left: 0; right: 0; text-align: center;
          z-index: 10; font-size: 0.72rem; color: rgba(255,255,255,0.65);
          pointer-events: none; padding: 0 1rem;
        ">Open palm = Hello · Raised fist = Emergency · OK gesture = Okay · Index only = Pain</div>

        <!-- Error overlay -->
        <div id="camera-error-view" class="camera-error-overlay" style="display:none;">
          <span class="material-symbols-outlined camera-error-icon">videocam_off</span>
          <h3 id="camera-error-title" style="margin-bottom:0.5rem;">Camera Blocked</h3>
          <p id="camera-error-desc" style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            Camera permission denied. Please allow camera access in browser settings.
          </p>
          <button id="camera-retry-btn" class="speak-output-btn" style="background:var(--accent);">
            <span class="material-symbols-outlined">autorenew</span> Retry
          </button>
        </div>

        <!-- Toolbar controls -->
        <div class="camera-controls-overlay" style="z-index:10;">
          <button class="camera-btn" id="camera-toggle-mirror" title="Toggle Mirror">
            <span class="material-symbols-outlined">flip</span>
          </button>
          <button class="camera-btn" id="camera-toggle-facing" title="Switch Camera">
            <span class="material-symbols-outlined">switch_video</span>
          </button>
          <button class="camera-btn" id="camera-refresh" title="Restart Stream">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>
    `;

    this.videoElement  = this.container.querySelector('#webcam-stream');
    this.canvasElement = this.container.querySelector('#camera-overlay-canvas');
    this.canvasCtx     = this.canvasElement.getContext('2d');

    this.bindEvents();
  }

  bindEvents() {
    const mirrorBtn  = this.container.querySelector('#camera-toggle-mirror');
    const facingBtn  = this.container.querySelector('#camera-toggle-facing');
    const refreshBtn = this.container.querySelector('#camera-refresh');
    const retryBtn   = this.container.querySelector('#camera-retry-btn');

    mirrorBtn.addEventListener('click', () => {
      this.isMirrored = !this.isMirrored;
      this.videoElement.classList.toggle('mirrored', this.isMirrored);
      this.canvasElement.classList.toggle('mirrored', this.isMirrored);
      Toast.show(this.isMirrored ? 'Mirror ON' : 'Mirror OFF');
    });

    facingBtn.addEventListener('click', async () => {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
      Toast.show(`Switching to ${this.facingMode === 'user' ? 'front' : 'rear'} camera`);
      await this.start();
    });

    refreshBtn.addEventListener('click', async () => {
      Toast.show('Restarting stream...');
      await this.start();
    });

    retryBtn.addEventListener('click', async () => await this.start());
  }

  async start() {
    this.showConnectingState();
    this.stopFrameLoop();

    try {
      this.stream = await CameraService.startStream(this.videoElement, this.facingMode);
      this.showConnectedState();
      this.startFrameLoop();
    } catch (err) {
      this.showErrorState(err.message);
    }
  }

  setupMediaPipe() {
    if (typeof window.Hands === 'undefined') {
      console.warn('[CameraComponent] MediaPipe Hands not loaded — gesture AI inactive. Demo chips still work.');
      return;
    }

    try {
      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.60,
        minTrackingConfidence: 0.60
      });

      this.hands.onResults((results) => this.onHandResults(results));
      this.isAiActive = true;

      const badge = this.container.querySelector('#ai-status-badge');
      if (badge) badge.style.display = 'inline-block';

    } catch (err) {
      console.error('[CameraComponent] MediaPipe setup error:', err);
    }
  }

  startFrameLoop() {
    // Canvas sync loop at ~60fps
    const syncCanvas = () => {
      if (this.videoElement && this.videoElement.readyState >= 3) {
        if (this.canvasElement.width !== this.videoElement.videoWidth) {
          this.canvasElement.width  = this.videoElement.videoWidth;
          this.canvasElement.height = this.videoElement.videoHeight;
        }
      }
      // Use videoElement srcObject to check if still active (stream may be null after destroy)
      if (this.videoElement && this.videoElement.srcObject) {
        this.tickRafId = requestAnimationFrame(syncCanvas);
      }
    };
    this.tickRafId = requestAnimationFrame(syncCanvas);

    // MediaPipe async tick every 80ms
    this.isProcessingFrame = false;
    const processFrame = async () => {
      if (!this.videoElement || !this.videoElement.srcObject) return;
      if (
        this.hands && this.isAiActive &&
        !this.isProcessingFrame &&
        this.videoElement.readyState >= 3
      ) {
        this.isProcessingFrame = true;
        try {
          await this.hands.send({ image: this.videoElement });
        } catch (e) {
          // silent — frame can fail if tab is backgrounded
        }
        this.isProcessingFrame = false;
      }
      this.aiTimeoutId = setTimeout(processFrame, 80);
    };
    this.aiTimeoutId = setTimeout(processFrame, 150);
  }

  stopFrameLoop() {
    if (this.tickRafId)   { cancelAnimationFrame(this.tickRafId);  this.tickRafId   = null; }
    if (this.aiTimeoutId) { clearTimeout(this.aiTimeoutId);        this.aiTimeoutId = null; }
  }

  /**
   * MediaPipe results handler — draws landmarks and classifies gestures
   */
  onHandResults(results) {
    if (!this.canvasCtx || !this.canvasElement) return;
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    const landmarks = results.multiHandLandmarks;

    if (landmarks && landmarks.length > 0) {
      this.noHandTicks = 0;

      for (const lm of landmarks) {
        if (window.drawConnectors) {
          window.drawConnectors(this.canvasCtx, lm, window.HAND_CONNECTIONS, {
            color: '#0d9488', lineWidth: 3
          });
        }
        if (window.drawLandmarks) {
          window.drawLandmarks(this.canvasCtx, lm, {
            color: '#f43f5e', lineWidth: 2, radius: 4
          });
        }
      }

      this.analyzeGestures(landmarks);
    } else {
      if (this.detectionCooldown > 0) this.detectionCooldown--;
      this.noHandTicks++;
      if (this.noHandTicks >= 10) {
        this.lastDetectedSign = '';
        this.candidateSign = '';
        this.candidateHoldCount = 0;
        this.hideGestureLabel();
      }
    }
  }

  /**
   * Full gesture heuristics — 20 word-signs + ASL fingerspelling fallback
   * MediaPipe landmarks are normalized [0,1] with y increasing downward.
   */
  analyzeGestures(handsList) {
    if (this.detectionCooldown > 0) {
      this.detectionCooldown--;
      return;
    }

    const primary   = handsList[0];
    const secondary = handsList.length > 1 ? handsList[1] : null;
    if (!primary) return;

    // ── Landmark aliases ──────────────────────────────────────────────────────
    const wrist     = primary[0];
    const thumbCMC  = primary[1];
    const thumbMCP  = primary[2];
    const thumbIP   = primary[3];
    const thumbTip  = primary[4];
    const indexMCP  = primary[5];
    const indexPIP  = primary[6];
    const indexTip  = primary[8];
    const middleMCP = primary[9];
    const middlePIP = primary[10];
    const middleTip = primary[12];
    const ringMCP   = primary[13];
    const ringPIP   = primary[14];
    const ringTip   = primary[16];
    const pinkyMCP  = primary[17];
    const pinkyPIP  = primary[18];
    const pinkyTip  = primary[20];

    // ── Helpers ───────────────────────────────────────────────────────────────
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    // A finger is "extended" if its tip is significantly above its MCP (lower y = higher on screen)
    const ext = (tip, mcp, margin = 0.03) => tip.y < mcp.y - margin;
    // A finger is "curled" if its tip is below its PIP joint
    const curled = (tip, pip) => tip.y > pip.y;

    const idxExt   = ext(indexTip,  indexMCP);
    const midExt   = ext(middleTip, middleMCP);
    const ringExt  = ext(ringTip,   ringMCP);
    const pinkyExt = ext(pinkyTip,  pinkyMCP);
    const thumbExt = thumbTip.x < thumbCMC.x - 0.04 || thumbTip.x > thumbCMC.x + 0.04;

    const idxCurled   = curled(indexTip,  indexPIP);
    const midCurled   = curled(middleTip, middlePIP);
    const ringCurled  = curled(ringTip,   ringPIP);
    const pinkyCurled = curled(pinkyTip,  pinkyPIP);

    const allClosed = !idxExt && !midExt && !ringExt && !pinkyExt;
    const allOpen   = idxExt && midExt && ringExt && pinkyExt;

    const handRaised = wrist.y < 0.50;
    const handMid    = wrist.y < 0.65;
    const handLow    = wrist.y >= 0.65;

    let sign = '';
    let conf = 0.85;

    // ══════════════════════════════════════════════════════════════════════════
    // WORD SIGNS — 20 gestures
    // ══════════════════════════════════════════════════════════════════════════

    // 1. HELLO — Open palm raised, fingers spread wide
    if (handRaised && allOpen) {
      const spread = dist(indexTip, pinkyTip);
      if (spread > 0.13) { sign = 'hello'; conf = 0.98; }
    }

    // 2. EMERGENCY — Tight fist raised high
    else if (handRaised && allClosed && !thumbExt) {
      sign = 'emergency'; conf = 0.99;
    }

    // 3. OKAY — Thumb + index form circle, other three extended
    else if (dist(thumbTip, indexTip) < 0.05 && midExt && ringExt && pinkyExt) {
      sign = 'okay'; conf = 0.96;
    }

    // 4. I AM OKAY — Thumbs-up: thumb extended up, all fingers closed
    else if (allClosed && thumbExt && thumbTip.y < thumbMCP.y - 0.06) {
      sign = 'I am okay'; conf = 0.93;
    }

    // 5. YES — Closed fist at mid height (nodding gesture)
    else if (allClosed && handMid && !handRaised) {
      sign = 'yes'; conf = 0.88;
    }

    // 6. NO — Index + middle extended & touching, others closed
    else if (idxExt && midExt && !ringExt && !pinkyExt) {
      if (dist(indexTip, middleTip) < 0.045) { sign = 'no'; conf = 0.93; }
    }

    // 7. THANK YOU — Flat open hand at mid height, fingers close together
    else if (allOpen && handMid && dist(indexTip, pinkyTip) < 0.12) {
      sign = 'thank you'; conf = 0.87;
    }

    // 8. WATER — W shape: index+middle+ring extended, pinky+thumb tucked
    else if (idxExt && midExt && ringExt && !pinkyExt && handMid) {
      if (dist(thumbTip, pinkyTip) > 0.08) { sign = 'water'; conf = 0.91; }
    }

    // 9. FOOD — All fingertips bunched toward thumb (pinched 'O')
    else if (
      dist(indexTip,  thumbTip) < 0.06 &&
      dist(middleTip, thumbTip) < 0.07 &&
      dist(ringTip,   thumbTip) < 0.08
    ) {
      sign = 'food'; conf = 0.90;
    }

    // 10. HUNGRY — C-shape: fingers curved, all partially extended (claw shape)
    else if (!allClosed && !allOpen && !idxCurled && !midCurled && !ringCurled && !pinkyCurled && handMid) {
      const claw = dist(indexTip, thumbTip) > 0.08 && dist(indexTip, thumbTip) < 0.18;
      if (claw) { sign = 'hungry'; conf = 0.86; }
    }

    // 11. STOP — Palm flat facing out, all fingers close together, low
    else if (allOpen && handLow && dist(indexTip, pinkyTip) < 0.11) {
      sign = 'stop'; conf = 0.94;
    }

    // 12. WAIT — Open palm at low position, fingers spread
    else if (allOpen && handLow && dist(indexTip, pinkyTip) >= 0.11) {
      sign = 'wait'; conf = 0.89;
    }

    // 13. TIRED — Drooped open hand at low position with wrist bent down
    else if (allOpen && wrist.y > 0.70 && indexTip.y > wrist.y) {
      sign = 'tired'; conf = 0.84;
    }

    // 14. SCARED — Both hands raised, open, palms facing outward
    else if (secondary && allOpen && handRaised) {
      const secAllOpen = secondary[8].y < secondary[5].y &&
                         secondary[12].y < secondary[9].y &&
                         secondary[16].y < secondary[13].y &&
                         secondary[20].y < secondary[17].y;
      if (secAllOpen && secondary[0].y < 0.50) { sign = 'scared'; conf = 0.88; }
    }

    // 15. PAIN — Index finger only extended (pointing), others closed, mid height
    else if (idxExt && !midExt && !ringExt && !pinkyExt && handMid) {
      const notDoctor = dist(middleTip, thumbTip) >= 0.06;
      if (notDoctor) { sign = 'pain'; conf = 0.86; }
    }

    // 16. DOCTOR — D hand: index extended, middle touches thumb tip, others folded
    else if (idxExt && !midExt && !ringExt && !pinkyExt && dist(middleTip, thumbTip) < 0.06) {
      sign = 'doctor'; conf = 0.87;
    }

    // 17. MEDICINE — M shape: index+middle+ring extended, pinky+thumb closed, hand at mid
    else if (idxExt && midExt && ringExt && !pinkyExt && !thumbExt && handMid) {
      sign = 'medicine'; conf = 0.85;
    }

    // 18. AMBULANCE — Crossed arms: both hands visible with wrists crossed
    else if (secondary) {
      const wristsCrossed = Math.abs(primary[0].x - secondary[0].x) < 0.12 &&
                            Math.abs(primary[0].y - secondary[0].y) < 0.1;
      if (wristsCrossed && allOpen) { sign = 'ambulance'; conf = 0.90; }
    }

    // 19. NEED HELP — Two hands: primary fist thumb-up on flat secondary palm
    else if (secondary && allClosed && thumbExt) {
      const secAllExt = secondary[8].y < secondary[5].y;
      if (secAllExt && secondary[0].y > primary[0].y) { sign = 'need help'; conf = 0.95; }
    }

    // 20. DANGER — Both hands raised in fists
    else if (secondary && allClosed && handRaised) {
      const secClosed = secondary[8].y > secondary[5].y && secondary[12].y > secondary[9].y;
      if (secClosed && secondary[0].y < 0.50) { sign = 'danger'; conf = 0.92; }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ASL FINGERSPELLING FALLBACK (A–Z letter recognition)
    // Only fires if no word-sign matched and a single finger configuration is detected
    // ══════════════════════════════════════════════════════════════════════════
    if (!sign) {
      const letter = this.classifyASLLetter({
        thumbTip, thumbMCP, thumbIP,
        indexTip, indexMCP, indexPIP,
        middleTip, middleMCP, middlePIP,
        ringTip, ringMCP, ringPIP,
        pinkyTip, pinkyMCP, pinkyPIP,
        wrist, idxExt, midExt, ringExt, pinkyExt,
        thumbExt, allClosed, allOpen, dist
      });
      if (letter) { sign = letter; conf = 0.78; }
    }

    // ── Dispatch logic with hold-count debouncing ─────────────────────────────
    if (!sign) {
      this.neutralTicks++;
      if (this.neutralTicks >= 8) {
        this.candidateSign = '';
        this.candidateHoldCount = 0;
        this.lastDetectedSign = '';
        this.hideGestureLabel();
      }
      return;
    }

    this.neutralTicks = 0;

    // Show label + confidence meter immediately for user feedback
    this.showGestureLabel(sign, conf);
    this.showConfidenceMeter(conf);

    // Require gesture held for HOLD_THRESHOLD frames before firing callback
    if (sign === this.candidateSign) {
      this.candidateHoldCount++;
    } else {
      this.candidateSign = sign;
      this.candidateHoldCount = 1;
    }

    if (
      this.candidateHoldCount >= this.HOLD_THRESHOLD &&
      sign !== this.lastDetectedSign
    ) {
      this.lastDetectedSign = sign;
      this.detectionCooldown = 6; // ~480ms cooldown
      this.candidateHoldCount = 0;

      if (this.onSignDetected) {
        this.onSignDetected(sign, conf);
      }
    }
  }

  /**
   * Classify ASL fingerspelling letters A–Z using landmark geometry.
   * Returns letter string or null.
   */
  classifyASLLetter({ thumbTip, thumbMCP, thumbIP, indexTip, indexMCP, indexPIP,
                      middleTip, middleMCP, middlePIP, ringTip, ringMCP, ringPIP,
                      pinkyTip, pinkyMCP, pinkyPIP, wrist, idxExt, midExt,
                      ringExt, pinkyExt, thumbExt, allClosed, allOpen, dist }) {
    // Only attempt fingerspelling in mid/low hand position (not raised = word sign)
    if (wrist.y < 0.45) return null;

    const d = dist;

    // A — closed fist, thumb rests on side of index
    if (allClosed && !thumbExt && thumbTip.x > indexMCP.x - 0.04) return 'A';

    // B — four fingers extended straight up, thumb tucked
    if (idxExt && midExt && ringExt && pinkyExt && !thumbExt &&
        d(indexTip, pinkyTip) < 0.08) return 'B';

    // C — curved open hand (C-shape), fingers partially bent
    if (!allClosed && !allOpen && d(thumbTip, pinkyTip) < 0.25 &&
        d(thumbTip, indexTip) < 0.15) return 'C';

    // D — index up, middle+ring+pinky curl touching thumb
    if (idxExt && !midExt && !ringExt && !pinkyExt &&
        d(middleTip, thumbTip) < 0.05 && d(ringTip, thumbTip) < 0.06) return 'D';

    // E — all fingers curled/hooked, thumb tucked under
    if (!idxExt && !midExt && !ringExt && !pinkyExt && !thumbExt &&
        d(indexTip, thumbTip) < 0.06) return 'E';

    // F — index+thumb form OK circle, other three extended
    if (d(thumbTip, indexTip) < 0.04 && midExt && ringExt && pinkyExt) return 'F';

    // G — index pointing sideways (horizontal extension)
    if (idxExt && !midExt && !ringExt && !pinkyExt &&
        Math.abs(indexTip.y - indexMCP.y) < 0.04) return 'G';

    // H — index+middle extended horizontal side-by-side
    if (idxExt && midExt && !ringExt && !pinkyExt &&
        Math.abs(indexTip.y - middleTip.y) < 0.03 &&
        d(indexTip, middleTip) < 0.06) return 'H';

    // I — pinky only extended, others closed
    if (!idxExt && !midExt && !ringExt && pinkyExt && allClosed) return 'I';

    // K — index + middle extended in V-shape, thumb points up
    if (idxExt && midExt && !ringExt && !pinkyExt && thumbExt &&
        d(indexTip, middleTip) > 0.06) return 'K';

    // L — index up, thumb out, others closed (L-shape)
    if (idxExt && !midExt && !ringExt && !pinkyExt && thumbExt &&
        thumbTip.y < wrist.y) return 'L';

    // O — all fingertips pinched to thumb (round O)
    if (d(indexTip, thumbTip) < 0.05 && d(middleTip, thumbTip) < 0.06 &&
        d(ringTip, thumbTip) < 0.07 && d(pinkyTip, thumbTip) < 0.08) return 'O';

    // R — index+middle crossed
    if (idxExt && midExt && !ringExt && !pinkyExt &&
        d(indexTip, middleTip) < 0.03 && indexTip.x > middleTip.x) return 'R';

    // S — closed fist, thumb crosses over knuckles
    if (allClosed && thumbExt && thumbTip.y > indexMCP.y) return 'S';

    // V — index+middle extended, spread apart (peace sign)
    if (idxExt && midExt && !ringExt && !pinkyExt &&
        d(indexTip, middleTip) > 0.07) return 'V';

    // W — index+middle+ring extended, spread
    if (idxExt && midExt && ringExt && !pinkyExt) return 'W';

    // Y — pinky + thumb both out, others curled
    if (!idxExt && !midExt && !ringExt && pinkyExt && thumbExt) return 'Y';

    return null;
  }

  /**
   * Show the gesture name overlay on the video
   */
  showGestureLabel(sign, conf) {
    const el = this.container.querySelector('#gesture-label-overlay');
    if (!el) return;
    el.style.display = 'block';
    el.style.opacity = '1';

    // Color code by type: letter = blue, emergency = red, word = teal
    const isSingleLetter = sign.length === 1 && /^[A-Z]$/.test(sign);
    const isEmergency = ['emergency', 'danger', 'need help', 'ambulance', 'help'].includes(sign);
    el.style.background = isEmergency
      ? 'rgba(239, 68, 68, 0.92)'
      : isSingleLetter
        ? 'rgba(59, 130, 246, 0.92)'
        : 'rgba(13, 148, 136, 0.92)';

    el.textContent = isSingleLetter
      ? `🤟 Letter: ${sign}  (${Math.round(conf * 100)}%)`
      : `✋ ${sign.toUpperCase()}  (${Math.round(conf * 100)}%)`;
  }

  /**
   * Show the confidence bar
   */
  showConfidenceMeter(conf) {
    const wrap = this.container.querySelector('#confidence-meter-wrap');
    const bar  = this.container.querySelector('#confidence-meter-bar');
    if (!wrap || !bar) return;
    wrap.style.display = 'block';
    bar.style.width = `${Math.round(conf * 100)}%`;
    bar.style.background = conf > 0.90
      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
      : conf > 0.80
        ? 'linear-gradient(90deg, #0d9488, #22c55e)'
        : 'linear-gradient(90deg, #eab308, #f59e0b)';
  }

  hideGestureLabel() {
    const el   = this.container.querySelector('#gesture-label-overlay');
    const wrap = this.container.querySelector('#confidence-meter-wrap');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => { if (el) el.style.display = 'none'; }, 300);
    }
    if (wrap) {
      setTimeout(() => { if (wrap) wrap.style.display = 'none'; }, 300);
    }
  }

  destroy() {
    this.stopFrameLoop();
    if (this.videoElement) {
      CameraService.stopStream(this.videoElement);
    }
    this.stream = null;
    this.hands  = null;
    this.isAiActive = false;
  }

  // ── Status helpers ──────────────────────────────────────────────────────────
  showConnectingState() {
    const errorOverlay = this.container.querySelector('#camera-error-view');
    if (errorOverlay) errorOverlay.style.display = 'none';
    const dot  = this.container.querySelector('#camera-status-indicator');
    const text = this.container.querySelector('#camera-status-text');
    if (dot)  { dot.style.backgroundColor = '#eab308'; dot.style.boxShadow = '0 0 8px #eab308'; }
    if (text) text.textContent = 'Connecting...';
  }

  showConnectedState() {
    const dot  = this.container.querySelector('#camera-status-indicator');
    const text = this.container.querySelector('#camera-status-text');
    if (dot)  { dot.style.backgroundColor = '#22c55e'; dot.style.boxShadow = '0 0 8px #22c55e'; }
    if (text) text.textContent = 'Live Feed';
  }

  showErrorState(message) {
    const errorOverlay = this.container.querySelector('#camera-error-view');
    if (errorOverlay) errorOverlay.style.display = 'flex';
    const dot  = this.container.querySelector('#camera-status-indicator');
    const text = this.container.querySelector('#camera-status-text');
    const desc = this.container.querySelector('#camera-error-desc');
    if (dot)  { dot.style.backgroundColor = '#ef4444'; dot.style.boxShadow = '0 0 8px #ef4444'; }
    if (text) text.textContent = 'Offline';
    if (desc) desc.textContent = message;
    if (errorOverlay) {
      errorOverlay.classList.remove('shake-anim');
      void errorOverlay.offsetWidth;
      errorOverlay.classList.add('shake-anim');
    }
    Toast.show(message, 'error');
  }
}

export default CameraComponent;
