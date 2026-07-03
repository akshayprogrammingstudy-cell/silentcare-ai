/**
 * SilentCare AI - Animated SVG Avatar Component (Full-Body Professional Edition)
 * Renders Carey the virtual helper with full body professional uniforms:
 * - Teal doctor scrubs inner shirt
 * - White medical lab coat outer jackets/sleeves
 * - Silver/grey stethoscope draped around the neck
 * - Trousers and shoes
 * Synchronizes audio vocalization of words during gesture spelling.
 */

import { Toast } from './toast.js';
import { Speech } from '../utils/speech.js';
import { Fingerspelling } from '../utils/fingerspelling.js';

export class AvatarComponent {
  constructor(container) {
    this.container = container;
    
    // Avatar Configuration State
    this.gender = 'female'; // 'female' or 'male'
    
    // Animation Playback State
    this.animationQueue = [];
    this.currentAnimIndex = 0;
    this.playbackSpeed = 1.0;
    this.isPlaying = false;
    this.isPaused = false;
    
    // Animation Loop Variables
    this.rafId = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.activeKeyframes = null;
    this.activeDuration = 1000;
    this.activeFallbackSteps = [];
    
    // Animated Coordinate States (Torso coordinates range: x [40,160], y [50,150])
    this.state = {
      lh: { x: 60, y: 150, rot: 0 },
      rh: { x: 140, y: 150, rot: 0 },
      head: { x: 0, y: 0, rot: 0 },
      eyes: 'normal',
      mouth: 'neutral'
    };

    this.elements = {};
    
    // Callbacks
    this.onWordChange = null;
    this.onPlaybackComplete = null;
  }

  /**
   * Initialize layout and apply default gender settings
   */
  init() {
    this.render();
    this.cacheElements();
    this.applyGenderAppearance();
    this.applyCoordinates();
  }

  /**
   * Renders the updated Full-Body Human SVG avatar interface with professional uniforms
   */
  render() {
    this.container.innerHTML = `
      <div class="avatar-viewer">
        <!-- Gender Selection Panel -->
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.75rem; width: 100%;">
          <button class="avatar-control-btn ${this.gender === 'female' ? 'primary' : ''}" id="gender-female-btn" style="flex:1; min-height:38px; padding:0.4rem; font-size:0.8rem;">
            <span class="material-symbols-outlined" style="font-size:1.1rem;">female</span> Female Uniform
          </button>
          <button class="avatar-control-btn ${this.gender === 'male' ? 'primary' : ''}" id="gender-male-btn" style="flex:1; min-height:38px; padding:0.4rem; font-size:0.8rem;">
            <span class="material-symbols-outlined" style="font-size:1.1rem;">male</span> Male Uniform
          </button>
        </div>

        <div class="avatar-svg-container">
          <!-- 2D SVG Carey Viewport (200x200 Coordinate Space) -->
          <svg class="avatar-svg" viewBox="35 15 130 175" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            <defs>
              <!-- Clothing and coat color fills -->
              <linearGradient id="scrubs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0891b2" /> <!-- Medical Teal scrubs -->
                <stop offset="100%" stop-color="#0e7490" />
              </linearGradient>
              <linearGradient id="labcoat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" /> <!-- White Lab Coat -->
                <stop offset="100%" stop-color="#f1f5f9" />
              </linearGradient>
              <!-- Skin tones -->
              <linearGradient id="avatar-skin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffedd5" />
                <stop offset="100%" stop-color="#fddfbb" />
              </linearGradient>
              <!-- Female Auburn Hair -->
              <linearGradient id="hair-color-female" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#451a03" />
                <stop offset="100%" stop-color="#1c0a00" />
              </linearGradient>
              <!-- Male Black Hair -->
              <linearGradient id="hair-color-male" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1f2937" />
                <stop offset="100%" stop-color="#030712" />
              </linearGradient>
              <!-- Professional Trousers -->
              <linearGradient id="trousers-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#334155" /> <!-- Slate Uniform Pants -->
                <stop offset="100%" stop-color="#1e293b" />
              </linearGradient>
            </defs>

            <!-- 1. BACK HAIR (Behind neck/shoulders) -->
            <path id="avatar-ponytail-back" d="M 115,35 C 124,38 135,52 130,72 C 124,78 116,68 118,52 Z" fill="url(#hair-color-female)" style="display:none;" />

            <!-- 2. LEGS & FEET -->
            <!-- Left leg trousers -->
            <rect id="avatar-leg-l" x="83" y="120" width="13" height="60" rx="2" fill="url(#trousers-grad)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5" />
            <!-- Right leg trousers -->
            <rect id="avatar-leg-r" x="104" y="120" width="13" height="60" rx="2" fill="url(#trousers-grad)" stroke="rgba(255,255,255,0.08)" stroke-width="0.5" />
            
            <!-- Left Shoe -->
            <path d="M 77,180 L 96,180 C 96,180 96,188 87,188 C 78,188 77,180 77,180 Z" fill="#0f172a" />
            <!-- Right Shoe -->
            <path d="M 104,180 L 123,180 C 123,180 123,188 114,188 C 105,188 104,180 104,180 Z" fill="#0f172a" />

            <!-- Belt / Uniform separator -->
            <rect x="80" y="116" width="40" height="5" rx="1" fill="#0f172a" />

            <!-- 3. TORSO (Doctor professional scrubs and white lab coat overlay) -->
            <!-- Inner scrubs layer (common) -->
            <path d="M 82,65 L 118,65 L 118,120 L 82,120 Z" fill="url(#scrubs-grad)" />

            <!-- Female specific outer lab coat contours -->
            <g id="avatar-torso-female" style="display:none;">
              <!-- Left Lab Coat panel -->
              <path d="M 75,65 L 94,65 Q 98,90 94,120 L 82,120 Q 76,95 75,65 Z" fill="url(#labcoat-grad)" stroke="#cbd5e1" stroke-width="0.75" />
              <!-- Right Lab Coat panel -->
              <path d="M 125,65 L 106,65 Q 102,90 106,120 L 118,120 Q 124,95 125,65 Z" fill="url(#labcoat-grad)" stroke="#cbd5e1" stroke-width="0.75" />
            </g>

            <!-- Male specific outer lab coat contours -->
            <g id="avatar-torso-male" style="display:none;">
              <path d="M 72,65 L 92,65 Q 95,90 90,120 L 80,120 Z" fill="url(#labcoat-grad)" stroke="#cbd5e1" stroke-width="0.75" />
              <path d="M 128,65 L 108,65 Q 105,90 110,120 L 120,120 Z" fill="url(#labcoat-grad)" stroke="#cbd5e1" stroke-width="0.75" />
            </g>

            <!-- Neck and shirt collars -->
            <rect id="avatar-neck" x="97" y="48" width="6" height="20" rx="2" fill="url(#avatar-skin-grad)" />
            <path id="female-clothing-neck" d="M 94,65 C 96,70 104,70 106,65" fill="none" stroke="#0891b2" stroke-width="2" />
            <path id="male-clothing-neck" d="M 92,65 L 100,72 L 108,65" fill="none" stroke="#0891b2" stroke-width="2" style="display:none;" />

            <!-- Stethoscope accessory (Medical professional uniform detail) -->
            <path d="M 91,55 C 91,72 109,72 109,55" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" /> <!-- Tube -->
            <path d="M 100,68 L 100,78" fill="none" stroke="#475569" stroke-width="2" /> <!-- Hanging piece -->
            <circle cx="100" cy="80" r="4.5" fill="#94a3b8" stroke="#475569" stroke-width="1.2" /> <!-- Diaphragm chestpiece -->

            <!-- 4. HEAD GROUP (Heads centered at y=35) -->
            <g id="avatar-head-group">
              <!-- Face Base -->
              <circle cx="100" cy="35" r="16" fill="url(#avatar-skin-grad)" stroke="rgba(0,0,0,0.08)" stroke-width="0.5" />
              
              <!-- Female Eyelashes -->
              <g id="female-eyelashes" style="display:none;">
                <path d="M 90,29 Q 94,27 98,29" fill="none" stroke="#1c1917" stroke-width="1.2" stroke-linecap="round" />
                <path d="M 102,29 Q 106,27 110,29" fill="none" stroke="#1c1917" stroke-width="1.2" stroke-linecap="round" />
              </g>

              <!-- Left Eye -->
              <g id="avatar-left-eye">
                <circle cx="94" cy="31" r="2.2" fill="#1c1917" />
                <circle cx="93" cy="30" r="0.6" fill="#ffffff" />
              </g>
              <path id="avatar-left-blink" d="M 91,31 Q 94,31 97,31" stroke="#1c1917" stroke-width="1.8" stroke-linecap="round" style="display:none;" />
              
              <!-- Right Eye -->
              <g id="avatar-right-eye">
                <circle cx="106" cy="31" r="2.2" fill="#1c1917" />
                <circle cx="105" cy="30" r="0.6" fill="#ffffff" />
              </g>
              <path id="avatar-right-blink" d="M 103,31 Q 106,31 109,31" stroke="#1c1917" stroke-width="1.8" stroke-linecap="round" style="display:none;" />

              <!-- Cheeks Blush (Female) -->
              <circle id="female-blush-l" cx="88" cy="37" r="2.5" fill="#f43f5e" opacity="0.3" style="display:none;" />
              <circle id="female-blush-r" cx="112" cy="37" r="2.5" fill="#f43f5e" opacity="0.3" style="display:none;" />

              <!-- Nose -->
              <path d="M 99.5,33 Q 100,36 98.5,37" fill="none" stroke="#ea580c" stroke-width="1" stroke-linecap="round" opacity="0.5" />

              <!-- Mouth Path -->
              <path id="avatar-mouth" d="M 95,41 Q 100,44 105,41" fill="none" stroke="#1c1917" stroke-width="1.8" stroke-linecap="round" />

              <!-- Hairstyles -->
              <path id="avatar-hair-male" d="M 84,24 Q 100,6 116,24 Q 124,32 118,36 Q 100,32 82,36 Q 78,28 84,24 Z" fill="url(#hair-color-male)" style="display:none;" />
              <path id="avatar-hair-female" d="M 80,24 Q 100,5 120,24 Q 128,36 118,48 C 112,40 104,33 100,35 C 96,33 88,40 82,48 Q 72,36 80,24 Z" fill="url(#hair-color-female)" style="display:none;" />
            </g>

            <!-- 5. LEFT ARM & HAND (White coat sleeve matching scrubs/uniform) -->
            <path id="avatar-left-arm" d="M 75,65 Q 55,90 68,115" fill="none" stroke="url(#labcoat-grad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            <g id="avatar-left-hand" transform="translate(68, 115) scale(1.2)">
              <circle cx="0" cy="0" r="10" fill="url(#avatar-skin-grad)" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
              <path d="M -6,-2 Q -8,-12 -4,-12 Q -2,-12 -2,-2" fill="url(#avatar-skin-grad)" />
              <path d="M -2,-2 Q -2,-14 1,-14 Q 4,-14 2,-2" fill="url(#avatar-skin-grad)" />
              <path d="M 2,-2 Q 5,-12 7,-10 Q 9,-8 4,-1" fill="url(#avatar-skin-grad)" />
            </g>
 
            <!-- 6. RIGHT ARM & HAND (White coat sleeve) -->
            <path id="avatar-right-arm" d="M 125,65 Q 145,90 132,115" fill="none" stroke="url(#labcoat-grad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            <g id="avatar-right-hand" transform="translate(132, 115) scale(1.2)">
              <circle cx="0" cy="0" r="10" fill="url(#avatar-skin-grad)" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
              <path d="M 6,-2 Q 8,-12 4,-12 Q 2,-12 2,-2" fill="url(#avatar-skin-grad)" />
              <path d="M 2,-2 Q 2,-14 -1,-14 Q -4,-14 -2,-2" fill="url(#avatar-skin-grad)" />
              <path d="M -2,-2 Q -5,-12 -7,-10 Q -9,-8 -4,-1" fill="url(#avatar-skin-grad)" />
            </g>
          </svg>
        </div>

        <!-- High-Contrast Live Captions (Subtitle Box for Deaf Users) -->
        <div id="avatar-subtitle-display" class="glass-card" style="
          margin: 0.75rem 0;
          padding: 0.75rem 1rem;
          background: rgba(10, 15, 30, 0.85);
          border: 1.5px solid var(--accent);
          border-radius: var(--border-radius-md);
          text-align: center;
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text-primary);
          min-height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px var(--accent-glow);
          word-break: break-word;
        ">
          Ready
        </div>

        <!-- Progress and controls -->
        <div class="avatar-controls">
          <div class="word-progress-box" id="avatar-progress-pills">
            <span style="color: var(--text-muted); font-size: 0.85rem;">Word Progress:</span>
          </div>

          <!-- Playback Actions -->
          <div class="avatar-playback-bar">
            <button class="avatar-control-btn primary" id="avatar-play-pause-btn">
              <span class="material-symbols-outlined" id="play-pause-icon">play_arrow</span>
              <span id="play-pause-text">Play</span>
            </button>
            <button class="avatar-control-btn" id="avatar-replay-btn">
              <span class="material-symbols-outlined">replay</span>
              Replay
            </button>

            <!-- Speed selectors -->
            <div class="speed-select-group">
              <button class="speed-btn" data-speed="0.5">0.5x</button>
              <button class="speed-btn active" data-speed="1.0">1x</button>
              <button class="speed-btn" data-speed="2.0">2x</button>
            </div>
          </div>

          <!-- Fallback sign description box -->
          <div id="avatar-fallback-instructions" class="fallback-cards-container" style="display:none;"></div>
        </div>
      </div>
    `;
  }

  /**
   * Cache layout pointers
   */
  cacheElements() {
    this.elements = {
      headGroup: this.container.querySelector('#avatar-head-group'),
      leftArm: this.container.querySelector('#avatar-left-arm'),
      rightArm: this.container.querySelector('#avatar-right-arm'),
      leftHand: this.container.querySelector('#avatar-left-hand'),
      rightHand: this.container.querySelector('#avatar-right-hand'),
      leftEyeGroup: this.container.querySelector('#avatar-left-eye'),
      leftEyeBlink: this.container.querySelector('#avatar-left-blink'),
      rightEyeGroup: this.container.querySelector('#avatar-right-eye'),
      rightEyeBlink: this.container.querySelector('#avatar-right-blink'),
      mouth: this.container.querySelector('#avatar-mouth'),
      playBtn: this.container.querySelector('#avatar-play-pause-btn'),
      playIcon: this.container.querySelector('#play-pause-icon'),
      playText: this.container.querySelector('#play-pause-text'),
      replayBtn: this.container.querySelector('#avatar-replay-btn'),
      progressBox: this.container.querySelector('#avatar-progress-pills'),
      fallbackBox: this.container.querySelector('#avatar-fallback-instructions'),
      speedBtns: this.container.querySelectorAll('.speed-btn'),
      subtitleDisplay: this.container.querySelector('#avatar-subtitle-display')
    };

    // Save Carey's default cartoon hand HTML layout to restore after spelling cycles
    if (this.elements.rightHand) {
      this.defaultRightHandHtml = this.elements.rightHand.innerHTML;
    }

    // Bind playback triggers
    this.bindPlaybackControls();
    
    // Bind Gender selection triggers
    const femaleBtn = this.container.querySelector('#gender-female-btn');
    const maleBtn = this.container.querySelector('#gender-male-btn');
    
    femaleBtn.addEventListener('click', () => {
      this.gender = 'female';
      femaleBtn.classList.add('primary');
      maleBtn.classList.remove('primary');
      this.applyGenderAppearance();
      Toast.show('Switched to Female Carey (Medical Uniform)');
    });

    maleBtn.addEventListener('click', () => {
      this.gender = 'male';
      maleBtn.classList.add('primary');
      femaleBtn.classList.remove('primary');
      this.applyGenderAppearance();
      Toast.show('Switched to Male Carey (Medical Uniform)');
    });
  }

  /**
   * Show/hide gender specific SVG elements
   */
  applyGenderAppearance() {
    const isFemale = this.gender === 'female';

    const elementsToToggle = {
      '#avatar-ponytail-back': isFemale,
      '#avatar-torso-female': isFemale,
      '#avatar-torso-male': !isFemale,
      '#female-clothing-neck': isFemale,
      '#male-clothing-neck': !isFemale,
      '#female-eyelashes': isFemale,
      '#female-blush-l': isFemale,
      '#female-blush-r': isFemale,
      '#avatar-hair-female': isFemale,
      '#avatar-hair-male': !isFemale
    };

    for (const [selector, show] of Object.entries(elementsToToggle)) {
      const el = this.container.querySelector(selector);
      if (el) {
        el.style.display = show ? 'block' : 'none';
      }
    }
  }

  bindPlaybackControls() {
    // Play/Pause
    this.elements.playBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.resume();
      }
    });

    // Replay
    this.elements.replayBtn.addEventListener('click', () => {
      this.replay();
    });

    // Speed modifiers
    this.elements.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playbackSpeed = parseFloat(btn.dataset.speed);
        Toast.show(`Playback speed set to ${this.playbackSpeed}x`);
      });
    });
  }

  setSequence(sequence) {
    this.stop();
    this.animationQueue = sequence;
    this.currentAnimIndex = 0;
    this.renderProgressPills();
    this.showFallbackInstructions();

    // Reset right hand to cartoon outline when loading new sequence
    if (this.elements.rightHand && this.defaultRightHandHtml) {
      this.elements.rightHand.innerHTML = this.defaultRightHandHtml;
    }

    // Set subtitle display initial state
    if (this.elements.subtitleDisplay) {
      if (sequence.length === 0) {
        this.elements.subtitleDisplay.textContent = 'Ready';
      } else {
        const sentence = sequence.map(item => item.word).join(' ');
        this.elements.subtitleDisplay.textContent = sentence;
      }
    }
  }

  renderProgressPills() {
    const box = this.elements.progressBox;
    box.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Word Progress:</span>';
    
    if (this.animationQueue.length === 0) {
      box.innerHTML += ' <span style="font-size: 0.85rem; color: var(--text-muted);">Ready</span>';
      return;
    }

    this.animationQueue.forEach((item, idx) => {
      const span = document.createElement('span');
      span.className = 'word-pill';
      span.textContent = item.word;
      span.id = `pill-word-${idx}`;
      box.appendChild(span);
    });
  }

  showFallbackInstructions() {
    const box = this.elements.fallbackBox;
    box.innerHTML = '';
    box.style.display = 'none';

    let hasFallbacks = false;
    this.animationQueue.forEach((item, qIdx) => {
      if (!item.matched && item.fallback_steps) {
        hasFallbacks = true;
        const card = document.createElement('div');
        card.className = 'fallback-card glass-card';
        card.id = `fallback-card-${qIdx}`;
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '0.75rem';
        card.style.width = '100%';
        
        let stepsHtml = `
          <div style="width:100%">
            <div style="font-weight: 700; color: var(--accent-light); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Fingerspelling Guide: "${item.word.toUpperCase()}"
            </div>
            <div class="fingerspell-container-${qIdx}" style="margin-bottom: 0.75rem;">
              ${Fingerspelling.renderWordGrid(item.word)}
            </div>
        `;
        
        item.fallback_steps.forEach((step, idx) => {
          stepsHtml += `
            <div style="display:flex; align-items:center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
              <span class="fallback-step-num">${idx + 1}</span>
              <span>${step}</span>
            </div>
          `;
        });
        
        stepsHtml += '</div>';
        card.innerHTML = stepsHtml;
        box.appendChild(card);
      }
    });

    if (hasFallbacks) {
      box.style.display = 'flex';
    }
  }

  /**
   * Applies coordinates with linear transformations to human full body ratios
   */
  applyCoordinates() {
    const { lh, rh, head, eyes, mouth } = this.state;

    const mapX = (x) => (x - 100) * 0.8 + 100;
    const mapY = (y) => (y - 50) * 0.8 + 35;

    const mappedLh = {
      x: mapX(lh.x),
      y: mapY(lh.y),
      rot: lh.rot
    };
    const mappedRh = {
      x: mapX(rh.x),
      y: mapY(rh.y),
      rot: rh.rot
    };

    // 1. Head
    if (this.elements.headGroup) {
      const headX = head.x * 0.5;
      const headY = head.y * 0.5;
      this.elements.headGroup.setAttribute(
        'transform', 
        `translate(${headX}, ${headY}) rotate(${head.rot}, 100, 35)`
      );
    }

    // 2. Left Arm and Hand
    if (this.elements.leftArm) {
      const elbowX = Math.min(55, (75 + mappedLh.x) / 2 - 10);
      const elbowY = (65 + mappedLh.y) / 2 + 10;
      this.elements.leftArm.setAttribute('d', `M 75,65 Q ${elbowX},${elbowY} ${mappedLh.x},${mappedLh.y}`);
    }
    if (this.elements.leftHand) {
      this.elements.leftHand.setAttribute('transform', `translate(${mappedLh.x}, ${mappedLh.y}) scale(1.2) rotate(${mappedLh.rot})`);
    }

    // 3. Right Arm and Hand
    if (this.elements.rightArm) {
      const elbowX = Math.max(145, (125 + mappedRh.x) / 2 + 10);
      const elbowY = (65 + mappedRh.y) / 2 + 10;
      this.elements.rightArm.setAttribute('d', `M 125,65 Q ${elbowX},${elbowY} ${mappedRh.x},${mappedRh.y}`);
    }
    if (this.elements.rightHand) {
      this.elements.rightHand.setAttribute('transform', `translate(${mappedRh.x}, ${mappedRh.y}) scale(1.2) rotate(${mappedRh.rot})`);
    }

    // 4. Blinks
    if (this.elements.leftEyeGroup && this.elements.leftEyeBlink) {
      if (eyes === 'blink' || eyes === 'closed') {
        this.elements.leftEyeGroup.style.display = 'none';
        this.elements.leftEyeBlink.style.display = 'block';
      } else {
        this.elements.leftEyeGroup.style.display = 'block';
        this.elements.leftEyeBlink.style.display = 'none';
      }
    }
    if (this.elements.rightEyeGroup && this.elements.rightEyeBlink) {
      if (eyes === 'blink' || eyes === 'closed') {
        this.elements.rightEyeGroup.style.display = 'none';
        this.elements.rightEyeBlink.style.display = 'block';
      } else {
        this.elements.rightEyeGroup.style.display = 'block';
        this.elements.rightEyeBlink.style.display = 'none';
      }
    }

    // 5. Mouth paths
    if (this.elements.mouth) {
      let mouthD = 'M 95,41 Q 100,44 105,41';
      switch (mouth) {
        case 'smile':
          mouthD = 'M 95,40 Q 100,47 105,40';
          break;
        case 'flat':
          mouthD = 'M 95,41 L 105,41';
          break;
        case 'sad':
          mouthD = 'M 95,43 Q 100,36 105,43';
          break;
        case 'open':
          mouthD = 'M 97,41 Q 100,47 103,41 Q 100,35 97,41 Z';
          break;
      }
      this.elements.mouth.setAttribute('d', mouthD);
    }
  }

  play() {
    if (this.animationQueue.length === 0) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.updatePlayBtnUI();
    this.playNextWord();
  }

  playNextWord() {
    if (this.currentAnimIndex >= this.animationQueue.length) {
      this.completePlayback();
      return;
    }

    this.elements.progressBox.querySelectorAll('.word-pill').forEach((pill, idx) => {
      pill.classList.remove('active', 'done');
      if (idx < this.currentAnimIndex) pill.classList.add('done');
      if (idx === this.currentAnimIndex) pill.classList.add('active');
    });

    const activeItem = this.animationQueue[this.currentAnimIndex];
    if (this.onWordChange) this.onWordChange(activeItem.word, this.currentAnimIndex);

    // Highlight the active word in the subtitle box for deaf users
    if (this.elements.subtitleDisplay) {
      const sentenceHtml = this.animationQueue.map((item, idx) => {
        if (idx === this.currentAnimIndex) {
          return `<span style="color: var(--accent-light); text-decoration: underline; font-weight: 800; font-size: 1.65rem; text-shadow: 0 0 10px var(--accent-glow);">${item.word}</span>`;
        }
        return `<span style="opacity: 0.55;">${item.word}</span>`;
      }).join(' ');
      this.elements.subtitleDisplay.innerHTML = sentenceHtml;
    }

    // SPEECH INTEGRATION: Synchronously vocalize spelling words out loud!
    // Speech.speak(activeItem.word).catch(e => console.error('TTS spelling sync error:', e));

    if (!activeItem.matched || activeItem.keyframes.length === 0) {
      this.activeKeyframes = null;
      this.activeDuration = activeItem.duration || 1000;
      this.startTime = null;
      this.elapsedTime = 0;
      this.playTransitionToSpelling(activeItem);
    } else {
      if (this.currentAnimIndex > 0) {
        this.playTransitionToNextWord(activeItem);
      } else {
        this.activeKeyframes = activeItem.keyframes;
        this.activeDuration = activeItem.duration;
        this.startTime = null;
        this.elapsedTime = 0;
        this.rafId = requestAnimationFrame((t) => this.animationLoop(t));
      }
    }
  }

  playTransitionToNextWord(activeItem) {
    let start = null;
    const duration = 150; // 150ms is perfect for snappy transitions
    
    const startState = {
      lh: { ...this.state.lh },
      rh: { ...this.state.rh },
      head: { ...this.state.head }
    };
    
    const targetState = activeItem.keyframes[0] || {
      lh: { x: 60, y: 150, rot: 0 },
      rh: { x: 140, y: 150, rot: 0 },
      head: { x: 0, y: 0, rot: 0 },
      eyes: 'normal',
      mouth: 'neutral'
    };

    const transitionLoop = (timestamp) => {
      if (this.isPaused) return;
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / (duration / this.playbackSpeed), 1.0);

      const lerp = (a, b, ratio) => a + (b - a) * ratio;

      this.state.lh = {
        x: lerp(startState.lh.x, targetState.lh.x, progress),
        y: lerp(startState.lh.y, targetState.lh.y, progress),
        rot: lerp(startState.lh.rot, targetState.lh.rot, progress)
      };
      this.state.rh = {
        x: lerp(startState.rh.x, targetState.rh.x, progress),
        y: lerp(startState.rh.y, targetState.rh.y, progress),
        rot: lerp(startState.rh.rot, targetState.rh.rot, progress)
      };
      this.state.head = {
        x: lerp(startState.head.x, targetState.head.x, progress),
        y: lerp(startState.head.y, targetState.head.y, progress),
        rot: lerp(startState.head.rot, targetState.head.rot, progress)
      };
      
      this.applyCoordinates();

      if (progress < 1.0) {
        this.rafId = requestAnimationFrame(transitionLoop);
      } else {
        this.activeKeyframes = activeItem.keyframes;
        this.activeDuration = activeItem.duration;
        this.startTime = null;
        this.elapsedTime = 0;
        this.rafId = requestAnimationFrame((t) => this.animationLoop(t));
      }
    };

    this.rafId = requestAnimationFrame(transitionLoop);
  }

  playTransitionToSpelling(activeItem) {
    let start = null;
    const duration = 150;
    
    const startState = {
      lh: { ...this.state.lh },
      rh: { ...this.state.rh },
      head: { ...this.state.head }
    };
    
    // Spelling start pose: lift right hand to shoulder
    const targetState = {
      lh: { x: 60, y: 150, rot: 0 },
      rh: { x: 135, y: 75, rot: -10 },
      head: { x: 0, y: 0, rot: 0 }
    };

    const transitionLoop = (timestamp) => {
      if (this.isPaused) return;
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / (duration / this.playbackSpeed), 1.0);

      const lerp = (a, b, ratio) => a + (b - a) * ratio;

      this.state.lh = {
        x: lerp(startState.lh.x, targetState.lh.x, progress),
        y: lerp(startState.lh.y, targetState.lh.y, progress),
        rot: lerp(startState.lh.rot, targetState.lh.rot, progress)
      };
      this.state.rh = {
        x: lerp(startState.rh.x, targetState.rh.x, progress),
        y: lerp(startState.rh.y, targetState.rh.y, progress),
        rot: lerp(startState.rh.rot, targetState.rh.rot, progress)
      };
      this.state.head = {
        x: lerp(startState.head.x, targetState.head.x, progress),
        y: lerp(startState.head.y, targetState.head.y, progress),
        rot: lerp(startState.head.rot, targetState.head.rot, progress)
      };
      
      this.applyCoordinates();

      if (progress < 1.0) {
        this.rafId = requestAnimationFrame(transitionLoop);
      } else {
        this.startTime = null;
        this.elapsedTime = 0;
        this.playFallbackSpellingEffect();
      }
    };

    this.rafId = requestAnimationFrame(transitionLoop);
  }

  playFallbackSpellingEffect() {
    let start = null;
    const duration = this.activeDuration;
    const activeItem = this.animationQueue[this.currentAnimIndex];
    const word = activeItem.word.toUpperCase().replace(/[^A-Z]/g, '');
    const L = word.length;
    
    // Select the current fallback card and container if it exists
    const containerSelector = `.fingerspell-container-${this.currentAnimIndex}`;
    const gridContainer = this.container.querySelector(containerSelector);

    // Track the last rendered character to avoid redundant SVG injection loops
    let lastRenderedChar = '';

    const spellingLoop = (timestamp) => {
      if (this.isPaused) return;
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / (duration / this.playbackSpeed), 1.0);
      
      // Determine active letter index
      const letterIdx = Math.min(Math.floor(progress * L), L - 1);
      const activeChar = L > 0 ? word[letterIdx] : '';

      if (this.elements.rightHand && activeChar && activeChar !== lastRenderedChar) {
        lastRenderedChar = activeChar;
        const handPaths = Fingerspelling.getLetterPaths(activeChar);
        if (handPaths) {
          // Scale and translate the fingerspelling paths to center at (0,0) and match the full size of the hand
          this.elements.rightHand.innerHTML = `<g transform="scale(0.58) translate(-50, -55)">${handPaths}</g>`;
        }
      }

      // Update subtitle display to show spelling progress and highlight the active letter
      if (this.elements.subtitleDisplay) {
        const wordPrefix = word.slice(0, letterIdx);
        const activeLetterStr = `<span style="color: var(--accent-light); text-decoration: underline; font-weight: 800; font-size: 1.85rem; text-shadow: 0 0 10px var(--accent-glow); padding: 0 2px;">${activeChar}</span>`;
        const wordSuffix = word.slice(letterIdx + 1);
        
        const sentenceHtml = this.animationQueue.map((item, idx) => {
          if (idx === this.currentAnimIndex) {
            return `Spelling: ${wordPrefix}${activeLetterStr}${wordSuffix}`;
          }
          return `<span style="opacity: 0.55;">${item.word}</span>`;
        }).join(' ');
        
        this.elements.subtitleDisplay.innerHTML = sentenceHtml;
      }

      // Update UI highlights
      if (gridContainer) {
        gridContainer.querySelectorAll('.fingerspell-box').forEach((boxEl, idx) => {
          if (idx === letterIdx) {
            boxEl.style.borderColor = 'var(--accent)';
            boxEl.style.transform = 'scale(1.08)';
            boxEl.style.boxShadow = '0 0 12px var(--accent-glow)';
            boxEl.style.background = 'rgba(20, 184, 166, 0.1)';
          } else {
            boxEl.style.borderColor = '';
            boxEl.style.transform = '';
            boxEl.style.boxShadow = '';
            boxEl.style.background = '';
          }
        });
      }

      this.state.head = { 
        x: Math.sin(progress * Math.PI * 4) * 1.5, 
        y: Math.cos(progress * Math.PI * 2) * 0.8, 
        rot: Math.sin(progress * Math.PI * 4) * 1.5 
      };

      // Right hand position for fingerspelling (lifted up near shoulder)
      const baseSpellingRh = { x: 135, y: 75, rot: -10 };
      
      // Add slight letter-dependent variation to fingerspelling right hand coordinates
      const letterHash = activeChar.charCodeAt(0) || 65;
      const letterOffset = (letterHash % 5) - 2; // -2 to 2 offset
      
      this.state.rh = {
        x: baseSpellingRh.x + letterOffset * 2,
        y: baseSpellingRh.y + (letterHash % 3) * 3,
        rot: baseSpellingRh.rot + letterOffset * 5
      };

      // Apply emotion-based facial expressions during spelling
      if (activeItem.emotion === 'happy') {
        this.state.eyes = progress > 0.4 && progress < 0.6 ? 'blink' : 'normal';
        this.state.mouth = 'smile';
      } else if (activeItem.emotion === 'sad') {
        this.state.eyes = 'closed';
        this.state.mouth = 'sad';
      } else {
        this.state.eyes = progress > 0.4 && progress < 0.6 ? 'blink' : 'normal';
        this.state.mouth = 'open';
      }
      
      this.applyCoordinates();

      if (progress < 1.0) {
        this.rafId = requestAnimationFrame(spellingLoop);
      } else {
        // Reset grid container highlights
        if (gridContainer) {
          gridContainer.querySelectorAll('.fingerspell-box').forEach((boxEl) => {
            boxEl.style.borderColor = '';
            boxEl.style.transform = '';
            boxEl.style.boxShadow = '';
            boxEl.style.background = '';
          });
        }

        // Reset Carey's hand to default cartoon hand when spelling of this word completes
        if (this.elements.rightHand && this.defaultRightHandHtml) {
          this.elements.rightHand.innerHTML = this.defaultRightHandHtml;
        }

        this.currentAnimIndex++;
        this.playNextWord();
      }
    };
    this.rafId = requestAnimationFrame(spellingLoop);
  }

  animationLoop(timestamp) {
    if (this.isPaused) return;
    if (!this.startTime) this.startTime = timestamp - this.elapsedTime;
    this.elapsedTime = timestamp - this.startTime;
    
    const speedAdjustedDuration = this.activeDuration / this.playbackSpeed;
    const progress = Math.min(this.elapsedTime / speedAdjustedDuration, 1.0);

    this.interpolate(progress);
    this.applyCoordinates();

    if (progress < 1.0) {
      this.rafId = requestAnimationFrame((t) => this.animationLoop(t));
    } else {
      this.currentAnimIndex++;
      this.playNextWord();
    }
  }

  interpolate(progress) {
    const kfs = this.activeKeyframes;
    if (!kfs || kfs.length === 0) return;

    let frameA = kfs[0];
    let frameB = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (progress >= kfs[i].time && progress <= kfs[i+1].time) {
        frameA = kfs[i];
        frameB = kfs[i+1];
        break;
      }
    }

    const denom = frameB.time - frameA.time;
    const t = denom === 0 ? 0 : (progress - frameA.time) / denom;
    const lerp = (a, b, ratio) => a + (b - a) * ratio;

    this.state.lh = {
      x: lerp(frameA.lh.x, frameB.lh.x, t),
      y: lerp(frameA.lh.y, frameB.lh.y, t),
      rot: lerp(frameA.lh.rot, frameB.lh.rot, t)
    };
    this.state.rh = {
      x: lerp(frameA.rh.x, frameB.rh.x, t),
      y: lerp(frameA.rh.y, frameB.rh.y, t),
      rot: lerp(frameA.rh.rot, frameB.rh.rot, t)
    };
    this.state.head = {
      x: lerp(frameA.head.x, frameB.head.x, t),
      y: lerp(frameA.head.y, frameB.head.y, t),
      rot: lerp(frameA.head.rot, frameB.head.rot, t)
    };

    this.state.eyes = frameB.eyes;
    this.state.mouth = frameB.mouth;
  }

  stop() {
    this.cancelFrame();
    this.isPlaying = false;
    this.isPaused = false;
    this.state = {
      lh: { x: 60, y: 150, rot: 0 },
      rh: { x: 140, y: 150, rot: 0 },
      head: { x: 0, y: 0, rot: 0 },
      eyes: 'normal',
      mouth: 'neutral'
    };
    this.applyCoordinates();
    this.updatePlayBtnUI();

    // Restore cartoon hand shape
    if (this.elements.rightHand && this.defaultRightHandHtml) {
      this.elements.rightHand.innerHTML = this.defaultRightHandHtml;
    }
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.cancelFrame();
    this.updatePlayBtnUI();
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) {
      this.play();
      return;
    }
    this.isPaused = false;
    this.startTime = null;
    this.updatePlayBtnUI();
    
    const activeItem = this.animationQueue[this.currentAnimIndex];
    if (!activeItem.matched || activeItem.keyframes.length === 0) {
      this.rafId = requestAnimationFrame((t) => this.playFallbackSpellingEffect(t));
    } else {
      this.rafId = requestAnimationFrame((t) => this.animationLoop(t));
    }
  }

  replay() {
    this.stop();
    this.currentAnimIndex = 0;
    this.play();
    Toast.show('Replaying sign translation');
  }

  cancelFrame() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  completePlayback() {
    this.stop();
    this.elements.progressBox.querySelectorAll('.word-pill').forEach(pill => {
      pill.classList.remove('active');
      pill.classList.add('done');
    });

    // Update subtitles to indicate completion
    if (this.elements.subtitleDisplay) {
      this.elements.subtitleDisplay.innerHTML = `<span style="color: var(--primary-light);">✓ Translation Complete</span>`;
    }

    // Restore cartoon hand shape
    if (this.elements.rightHand && this.defaultRightHandHtml) {
      this.elements.rightHand.innerHTML = this.defaultRightHandHtml;
    }

    if (this.onPlaybackComplete) this.onPlaybackComplete();
  }

  updatePlayBtnUI() {
    const { playIcon, playText } = this.elements;
    if (this.isPlaying && !this.isPaused) {
      playIcon.textContent = 'pause';
      playText.textContent = 'Pause';
    } else {
      playIcon.textContent = 'play_arrow';
      playText.textContent = this.isPaused ? 'Resume' : 'Play';
    }
  }
}

export default AvatarComponent;
