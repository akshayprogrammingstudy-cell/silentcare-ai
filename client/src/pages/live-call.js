import { Toast } from '../components/toast.js';
import { API } from '../utils/api.js';
import { AvatarComponent } from '../components/avatar.js';

export const LiveCallPage = {
  container: null,
  pc: null,
  dc: null,
  audioEl: null,
  isCallActive: false,
  avatarComp: null,
  sessionId: null,

  async init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    
    const avatarPlaceholder = this.container.querySelector('#live-call-avatar-mount');
    this.avatarComp = new AvatarComponent(avatarPlaceholder);
    this.avatarComp.init();
  },

  render() {
    this.container.innerHTML = `
      <div class="live-call-container fade-in-content" style="display: flex; flex-direction: column; height: calc(100vh - 100px); max-width: 600px; margin: 0 auto; gap: 1rem;">
        
        <!-- Samsung Assist Banner -->
        <div class="glass-card" style="background: rgba(13, 148, 136, 0.1); border-color: var(--primary); padding: 0.75rem; text-align: center; border-radius: 8px;">
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
            <strong style="color: var(--primary-light);">Samsung S26 Assist Mode:</strong> Full features use the OpenAI engine. For native carrier calls, you can use Galaxy AI Live Translate outside this app.
          </p>
        </div>

        <!-- Custom Dialer -->
        <div class="glass-card" style="padding: 1rem; display: flex; gap: 0.5rem; align-items: center; border-radius: 12px;">
          <input type="tel" id="dialer-input" placeholder="Enter phone number..." style="flex-grow: 1; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); font-size: 1.1rem; outline: none;">
          <button id="dial-btn" style="background: var(--primary); color: white; border: none; border-radius: 8px; padding: 0.75rem 1.5rem; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined">call</span> Dial
          </button>
        </div>

        <div id="sip-warning" style="display:none; color: var(--accent); font-size: 0.8rem; text-align: center;">
          SIP/Twilio not connected yet. Running in OpenAI Voice Mode.
        </div>

        <!-- Avatar Area -->
        <div class="glass-card" style="flex-grow: 1; min-height: 250px; position: relative; overflow: hidden; border-radius: 12px;">
          <div id="live-call-avatar-mount" style="width: 100%; height: 100%;"></div>
        </div>

        <!-- Transcript Panel -->
        <div id="transcript-panel" class="glass-card" style="height: 180px; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; border-radius: 12px; background: rgba(0,0,0,0.3);">
          <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem;">Ready for call.</div>
        </div>

        <!-- Call Controls & Quick Replies -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; overflow-x: auto; gap: 0.5rem; padding-bottom: 0.5rem; scrollbar-width: none;" id="quick-replies">
            <button class="quick-reply-btn">I need help</button>
            <button class="quick-reply-btn">Please wait</button>
            <button class="quick-reply-btn">I cannot speak</button>
            <button class="quick-reply-btn">I use sign language</button>
            <button class="quick-reply-btn">Please repeat</button>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="live-reply-input" placeholder="Type to speak..." style="flex-grow: 1; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary);">
            <button id="send-reply-btn" style="background: var(--primary); color: white; border: none; border-radius: 8px; width: 48px; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined">send</span>
            </button>
            <button id="end-call-btn" style="background: var(--emergency); color: white; border: none; border-radius: 8px; width: 48px; display: none; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined">call_end</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add CSS for quick replies
    const style = document.createElement('style');
    style.innerHTML = `
      .quick-reply-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.4rem 0.8rem;
        border-radius: 16px;
        font-size: 0.8rem;
        white-space: nowrap;
        cursor: pointer;
      }
      .quick-reply-btn:hover { background: rgba(255,255,255,0.2); }
    `;
    this.container.appendChild(style);
  },

  bindEvents() {
    const dialBtn = this.container.querySelector('#dial-btn');
    const dialInput = this.container.querySelector('#dialer-input');
    const sipWarning = this.container.querySelector('#sip-warning');
    const endCallBtn = this.container.querySelector('#end-call-btn');
    const sendBtn = this.container.querySelector('#send-reply-btn');
    const replyInput = this.container.querySelector('#live-reply-input');

    dialBtn.addEventListener('click', async () => {
      const number = dialInput.value.trim();
      if (number) {
        sipWarning.style.display = 'block'; // Fallback warning
      }
      
      dialBtn.style.display = 'none';
      endCallBtn.style.display = 'flex';
      dialInput.disabled = true;

      await this.initOpenAICall(number);
    });

    endCallBtn.addEventListener('click', () => {
      this.endCall();
      dialBtn.style.display = 'flex';
      endCallBtn.style.display = 'none';
      dialInput.disabled = false;
      sipWarning.style.display = 'none';
    });

    const sendReply = () => {
      const text = replyInput.value.trim();
      if (!text || !this.isCallActive) return;
      this.sendToOpenAI(text);
      this.appendTranscript('You', text);
      replyInput.value = '';
    };

    sendBtn.addEventListener('click', sendReply);
    replyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendReply();
    });

    const quickReplies = this.container.querySelectorAll('.quick-reply-btn');
    quickReplies.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isCallActive) {
          this.sendToOpenAI(btn.textContent);
          this.appendTranscript('You', btn.textContent);
        }
      });
    });
  },

  async initOpenAICall(targetPhone) {
    try {
      Toast.show('Connecting to OpenAI Realtime WebRTC...', 'info');

      // 1. Register Session on Backend
      const sessionRes = await fetch(`${API.getBaseUrl()}/realtime/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'local_user', targetPhone })
      });
      const sessionData = await sessionRes.json();
      this.sessionId = sessionData.session.id;

      // 2. Fetch Ephemeral Token
      const tokenRes = await fetch(`${API.getBaseUrl()}/realtime/token`);
      const tokenData = await tokenRes.json();
      const ephemeralToken = tokenData.token;

      // 3. Initialize WebRTC Peer Connection
      this.pc = new RTCPeerConnection();
      
      this.audioEl = document.createElement('audio');
      this.audioEl.autoplay = true;
      this.pc.ontrack = e => {
        this.audioEl.srcObject = e.streams[0];
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      // 4. Setup Data Channel for Transcripts/Events
      this.dc = this.pc.createDataChannel('oai-events');
      this.dc.addEventListener('message', (e) => {
        this.handleOpenAIEvent(JSON.parse(e.data));
      });

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp'
        }
      });

      const answerSdp = await sdpResponse.text();
      const answer = { type: 'answer', sdp: answerSdp };
      await this.pc.setRemoteDescription(answer);

      this.isCallActive = true;
      Toast.show('Call connected via WebRTC.', 'success');

    } catch (err) {
      console.error('WebRTC Init Error:', err);
      Toast.show('Failed to connect call.', 'error');
      this.endCall();
    }
  },

  handleOpenAIEvent(event) {
    // Look for finished audio transcription events from the caller
    if (event.type === 'response.audio_transcript.done') {
      const text = event.transcript;
      this.appendTranscript('Caller', text);
      this.triggerAvatarSign(text);
    }
  },

  sendToOpenAI(text) {
    if (this.dc && this.dc.readyState === 'open') {
      // Create a user message to trigger TTS output to the caller
      const event = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [ { type: 'input_text', text } ]
        }
      };
      this.dc.send(JSON.stringify(event));
      this.dc.send(JSON.stringify({ type: 'response.create' }));
    }
  },

  async triggerAvatarSign(text) {
    try {
      // Send the text to our backend to get the sign language mapping & emotion
      const res = await fetch(`${API.getBaseUrl()}/realtime/text-to-sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId: this.sessionId, sender: 'Caller' })
      });
      const data = await res.json();
      
      if (data.success) {
        // Trigger the AvatarComponent to play the sequence
        window.dispatchEvent(new CustomEvent('playsign', { detail: data.data }));
      }
    } catch (err) {
      console.error('Text to sign mapping failed', err);
    }
  },

  appendTranscript(sender, text) {
    const panel = this.container.querySelector('#transcript-panel');
    const color = sender === 'You' ? 'var(--primary-light)' : 'var(--accent-light)';
    
    const div = document.createElement('div');
    div.style.fontSize = '0.9rem';
    div.innerHTML = `<strong style="color: ${color};">${sender}:</strong> <span style="color: var(--text-primary);">${text}</span>`;
    
    panel.appendChild(div);
    panel.scrollTop = panel.scrollHeight;
  },

  endCall() {
    this.isCallActive = false;
    
    // Clean up data channel
    if (this.dc) {
      try { this.dc.close(); } catch(e) {}
      this.dc = null;
    }

    // Close WebRTC peer connection
    if (this.pc) {
      try { this.pc.close(); } catch(e) {}
      this.pc = null;
    }

    // Release audio element
    if (this.audioEl) {
      this.audioEl.srcObject = null;
      this.audioEl = null;
    }

    // Mark session as ended in backend (only if session was created successfully)
    if (this.sessionId) {
      fetch(`${API.getBaseUrl()}/realtime/session/${this.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' })
      }).catch(() => {/* Silently ignore — call already ended locally */});
      this.sessionId = null;
    }

    this.appendTranscript('System', 'Call ended.');
  },

  destroy() {
    this.endCall();
  }
};

export default LiveCallPage;
