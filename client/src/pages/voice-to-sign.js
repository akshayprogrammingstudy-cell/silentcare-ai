/**
 * SilentCare AI - Voice/Text to Sign Avatar Page
 * Accepts voice speech inputs or typed text and converts them into coordinates
 * for the 2D SVG avatar helper to sign in real time.
 */

import { AvatarComponent } from '../components/avatar.js';
import { Speech } from '../utils/speech.js';
import { API } from '../utils/api.js';
import { Toast } from '../components/toast.js';
import { i18n } from '../utils/i18n.js';
import { Storage } from '../utils/storage.js';

export const VoiceToSignPage = {
  container: null,
  avatarComp: null,
  isListening: false,
  lastTranslationLog: '', // Store the last compiled translation text for email logs

  /**
   * Initialize layout and load Avatar keyframes
   */
  async init(container) {
    this.container = container;
    this.isListening = false;
    this.lastTranslationLog = '';

    this.render();
    
    // Mount Avatar Component
    const avatarPlaceholder = this.container.querySelector('#avatar-mount-container');
    this.avatarComp = new AvatarComponent(avatarPlaceholder);
    this.avatarComp.init();

    this.bindEvents();
    
    // Check Speech Recognition capability
    if (!Speech.isRecognitionSupported()) {
      const micBtn = this.container.querySelector('#speech-mic-btn');
      if (micBtn) {
        micBtn.style.background = 'var(--text-muted)';
        micBtn.style.opacity = '0.5';
        micBtn.title = i18n.t('no_mic_support');
      }
      
      const tipBox = this.container.querySelector('#browser-stt-warning');
      if (tipBox) {
        tipBox.style.display = 'block';
      }
    }

    // Redraw if language changes
    window.removeEventListener('languagechanged', this.handleLangChange);
    this.handleLangChange = () => {
      this.render();
      // Reinitialize avatar and mic bindings
      const newPlaceholder = this.container.querySelector('#avatar-mount-container');
      this.avatarComp = new AvatarComponent(newPlaceholder);
      this.avatarComp.init();
      this.bindEvents();
    };
    window.addEventListener('languagechanged', this.handleLangChange);
  },

  /**
   * Renders the basic structure of Voice to Sign
   */
  render() {
    const t = (key) => i18n.t(key);
    
    this.container.innerHTML = `
      <div class="workspace-grid">
        <!-- Left Side: SVG Avatar Viewer -->
        <div>
          <h2 class="panel-title">
            <span class="material-symbols-outlined" style="color: var(--primary-light);">smart_toy</span>
            ${t('avatar_title')}
          </h2>
          <div id="avatar-mount-container"></div>
        </div>

        <!-- Right Side: Speech and Text Inputs -->
        <div class="glass-card control-panel">
          <h2 class="panel-title">
            <span class="material-symbols-outlined" style="color: var(--accent);">keyboard_voice</span>
            ${t('translation_panel')}
          </h2>

          <div class="input-method-box">
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
              ${t('v2s_desc')}
            </p>
            
            <div id="browser-stt-warning" class="glass-card" style="display:none; padding: 0.75rem; border-color: var(--accent); background: rgba(244, 63, 94, 0.05); font-size: 0.8rem; color: var(--accent-light); margin-bottom: 0.5rem;">
              ⚠️ Web Speech Recognition is not supported by your current browser. You can type words and click "Translate" to animate.
            </div>

            <div class="speech-input-wrapper">
              <input type="text" class="text-input-field" id="voice-text-input" placeholder="${t('input_placeholder')}">
              <button class="mic-activation-btn" id="speech-mic-btn" title="${t('mic_listen')}">
                <span class="material-symbols-outlined" id="mic-icon-view">mic</span>
              </button>
            </div>

            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="speak-output-btn" style="flex:2; justify-content:center; border-radius:var(--border-radius-sm); min-height: 44px;" id="trigger-translate-btn">
                <span class="material-symbols-outlined">translate</span> ${t('translate')}
              </button>
              <button class="avatar-control-btn" id="email-history-btn" style="flex:1; min-height: 44px; display:flex; align-items:center; justify-content:center; gap:0.25rem; font-size:0.85rem;" disabled>
                <span class="material-symbols-outlined" style="font-size:1.1rem;">mail</span> ${t('email_transcript')}
              </button>
              <button class="avatar-control-btn" id="clear-input-btn" style="border-radius:var(--border-radius-sm); min-height: 44px;">
                Clear
              </button>
            </div>
          </div>

          <!-- Instruction Tip card -->
          <div class="glass-card" style="padding: 1.25rem; background: rgba(0,0,0,0.15);">
            <h4 style="font-size: 0.9rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-light);">
              Vocabulary Dictionary Guide:
            </h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.5rem;">
              The system supports a vocabulary dictionary of 30+ signs including:
            </p>
            <div style="display:flex; flex-wrap:wrap; gap: 0.35rem; font-size: 0.75rem;">
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">hello</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">help</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">emergency</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">doctor</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">pain</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">medicine</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">water</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">hospital</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">ambulance</span>
              <span style="background:rgba(255,255,255,0.06); padding:0.15rem 0.4rem; border-radius:3px;">fever</span>
              <span style="color:var(--text-muted);">...and 20+ more!</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.75rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
              * Note: If you enter a word not in the dictionary, the avatar will show spelled fallback instruction cards.
            </p>
          </div>
        </div>
      </div>

      <!-- Email Modal Overlay -->
      <div id="email-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); z-index:1000; align-items:center; justify-content:center;">
        <div class="glass-card fade-in" style="padding:2rem; max-width:400px; width:90%; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 8px 32px var(--shadow-color); background: var(--bg-card);">
          <h3 style="font-family:var(--font-display); font-weight:700; margin-bottom:0.5rem; color:var(--text-primary);">Email Transcript</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem;">Enter your email address to receive the translation history log.</p>
          <input type="email" id="modal-email-input" placeholder="name@example.com" style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:rgba(15,23,42,0.4); color:var(--text-primary); margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="avatar-control-btn" id="modal-close-btn" style="min-height: 38px;">Cancel</button>
            <button class="speak-output-btn" id="modal-send-btn" style="min-height: 38px;">Send Email</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Bind DOM triggers
   */
  bindEvents() {
    const inputField = this.container.querySelector('#voice-text-input');
    const translateBtn = this.container.querySelector('#trigger-translate-btn');
    const clearBtn = this.container.querySelector('#clear-input-btn');
    const micBtn = this.container.querySelector('#speech-mic-btn');
    const emailBtn = this.container.querySelector('#email-history-btn');
    
    const emailModal = this.container.querySelector('#email-modal-overlay');
    const modalCloseBtn = this.container.querySelector('#modal-close-btn');
    const modalSendBtn = this.container.querySelector('#modal-send-btn');
    const modalEmailInput = this.container.querySelector('#modal-email-input');

    // Trigger translation on button click
    translateBtn.addEventListener('click', () => {
      this.translateInput(inputField.value);
    });

    // Enter key submits text
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.translateInput(inputField.value);
      }
    });

    // Clear inputs
    clearBtn.addEventListener('click', () => {
      inputField.value = '';
      this.lastTranslationLog = '';
      emailBtn.setAttribute('disabled', 'true');
      if (this.avatarComp) {
        this.avatarComp.stop();
        this.avatarComp.setSequence([]);
      }
    });

    // Microphone speech listener
    micBtn.addEventListener('click', () => {
      if (!Speech.isRecognitionSupported()) {
        Toast.show('Speech recognition is not supported in this browser', 'warning');
        return;
      }

      if (this.isListening) {
        this.stopMicListening();
      } else {
        this.startMicListening();
      }
    });

    // Email trigger modal
    emailBtn.addEventListener('click', () => {
      const user = Storage.getUser();
      if (user) {
        modalEmailInput.value = user.email;
      }
      emailModal.style.display = 'flex';
    });

    modalCloseBtn.addEventListener('click', () => {
      emailModal.style.display = 'none';
    });

    modalSendBtn.addEventListener('click', async () => {
      const targetEmail = modalEmailInput.value;
      if (!targetEmail || !targetEmail.includes('@')) {
        Toast.show('Please enter a valid email address.', 'warning');
        return;
      }

      modalSendBtn.setAttribute('disabled', 'true');
      modalSendBtn.textContent = 'Sending...';

      try {
        const response = await fetch('/api/email-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: targetEmail,
            history: this.lastTranslationLog
          })
        });
        
        const data = await response.json();
        if (data.success) {
          Toast.show(data.message || 'Email sent successfully.');
          emailModal.style.display = 'none';
        } else {
          Toast.show(data.error || 'Failed to email transcript.', 'error');
        }
      } catch (err) {
        console.error(err);
        Toast.show('Network error during email dispatch.', 'error');
      } finally {
        modalSendBtn.removeAttribute('disabled');
        modalSendBtn.textContent = 'Send Email';
      }
    });
  },

  /**
   * Starts vocal stream recognition
   */
  startMicListening() {
    const micIcon = this.container.querySelector('#mic-icon-view');
    const micBtn = this.container.querySelector('#speech-mic-btn');
    const inputField = this.container.querySelector('#voice-text-input');

    Speech.listen({
      onStart: () => {
        this.isListening = true;
        micBtn.classList.add('listening');
        micIcon.textContent = 'graphic_eq'; // Waves icon
        inputField.placeholder = "Listening to speech...";
        Toast.show('Microphone listening active');
      },
      onResult: (text) => {
        inputField.value = text;
        Toast.show(`Voice captured: "${text}"`);
        this.translateInput(text);
      },
      onEnd: () => {
        this.stopMicListening();
      },
      onError: (err) => {
        Toast.show(`Microphone error: ${err}`, 'error');
        this.stopMicListening();
      }
    });
  },

  /**
   * Halts vocal stream recognition
   */
  stopMicListening() {
    this.isListening = false;
    const micIcon = this.container.querySelector('#mic-icon-view');
    const micBtn = this.container.querySelector('#speech-mic-btn');
    const inputField = this.container.querySelector('#voice-text-input');

    if (micBtn) {
      micBtn.classList.remove('listening');
    }
    if (micIcon) {
      micIcon.textContent = 'mic';
    }
    if (inputField) {
      inputField.placeholder = i18n.t('input_placeholder');
    }
    
    Speech.stopListening();
  },

  /**
   * Translate input query string to sign animation sequences
   */
  async translateInput(text) {
    if (!text || text.trim() === '') {
      Toast.show('Please enter a word or speak to translate', 'warning');
      return;
    }

    Toast.show('Loading avatar sign coordinates...');
    
    // Translate foreign input languages into English core signs
    const mappedText = i18n.translateInputSentence(text);
    
    try {
      const response = await API.textToSign(mappedText);
      if (response.success && response.sequence.length > 0) {
        // Compile logs for email feature
        let logText = `Typed Input: "${text}"\n`;
        if (mappedText !== text) {
          logText += `Internal English Mapping: "${mappedText}"\n`;
        }
        logText += `Signs projected:\n`;
        response.sequence.forEach(item => {
          logText += `- ${item.word.toUpperCase()} (${item.matched ? 'Animated Sign' : 'Fingerspelt Letter-by-Letter'})\n`;
        });
        
        this.lastTranslationLog = logText;
        
        // Enable email button
        const emailBtn = this.container.querySelector('#email-history-btn');
        if (emailBtn) {
          emailBtn.removeAttribute('disabled');
        }

        // Send coordinate sequence to avatar
        this.avatarComp.setSequence(response.sequence);
        // Play animation sequence
        this.avatarComp.play();
      } else {
        Toast.show('No sign animations found', 'warning');
      }
    } catch (e) {
      console.error(e);
      Toast.show('Translation failed', 'error');
    }
  },

  /**
   * Destroys active components on unmount
   */
  destroy() {
    this.stopMicListening();
    if (this.avatarComp) {
      this.avatarComp.stop();
      this.avatarComp = null;
    }
    window.removeEventListener('languagechanged', this.handleLangChange);
  }
};

export default VoiceToSignPage;
