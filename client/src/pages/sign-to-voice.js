/**
 * SilentCare AI - Sign to Voice/Text Page
 * Captures live webcam stream and translates signs into written text and spoken voice.
 * Accumulates consecutive gestures to compile long, punctuated sentences.
 * Includes a simulated sign keyboard with 30+ items for MVP testing.
 */

import { CameraComponent } from '../components/camera.js';
import { Speech } from '../utils/speech.js';
import { API } from '../utils/api.js';
import { Toast } from '../components/toast.js';
import { i18n } from '../utils/i18n.js';
import { Storage } from '../utils/storage.js';

export const SignToVoicePage = {
  container: null,
  cameraComp: null,
  history: [],
  detectedWord: 'No Sign Detected',
  confidence: 0,
  activeCategory: 'general',
  compiledSentence: [], // Array of compiled words
  translatedSentence: '', // AI translated version of compiledSentence

  /**
   * Initialize page layout and bind camera tracks
   */
  async init(container) {
    this.container = container;
    this.history = [];
    this.detectedWord = i18n.t('no_sign');
    this.confidence = 0;
    this.activeCategory = 'general';
    this.compiledSentence = [];
    this.translatedSentence = '';

    this.render();
    
    // Initialize Camera Component inside its placeholder with real-time sign detection callback
    const camPlaceholder = this.container.querySelector('#camera-viewport-container');
    this.cameraComp = new CameraComponent(camPlaceholder, (sign) => this.translateSign(sign));
    await this.cameraComp.init();

    this.loadDemoSigns();
    this.bindEvents();

    // Redraw if language changes
    window.removeEventListener('languagechanged', this.handleLangChange);
    this.handleLangChange = async () => {
      if (this.cameraComp) {
        this.cameraComp.destroy();
      }
      this.render();
      const newPlaceholder = this.container.querySelector('#camera-viewport-container');
      this.cameraComp = new CameraComponent(newPlaceholder, (sign) => this.translateSign(sign));
      await this.cameraComp.init();
      this.loadDemoSigns();
      this.bindEvents();
    };
    window.addEventListener('languagechanged', this.handleLangChange);
  },

  /**
   * Render Sign to Voice page components
   */
  render() {
    const t = (key) => i18n.t(key);
    
    this.container.innerHTML = `
      <div class="workspace-grid">
        <!-- Left Side: Live Feed Streamer -->
        <div>
          <h2 class="panel-title">
            <span class="material-symbols-outlined" style="color: var(--primary-light);">videocam</span>
            ${t('gesture_input')}
          </h2>
          <div id="camera-viewport-container"></div>
          
          <!-- Long Sentence Compiler Bar -->
          <div class="glass-card" style="margin-top: 1.5rem; padding: 1.25rem; border-color: var(--primary);">
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em; display:flex; justify-content:space-between; align-items:center;">
              <span>Sentence Compiler (Long Sentence Analysis)</span>
              <span id="compiler-word-count" style="color:var(--primary-light); font-size:0.75rem;">0 words</span>
            </div>
            
            <div style="background: rgba(10,15,30,0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; min-height: 3rem; margin-bottom: 0.75rem; color: var(--text-primary); font-size: 1rem; line-height: 1.4; display: flex; align-items: center;" id="compiled-sentence-view">
              <span style="color: var(--text-muted); font-size: 0.9rem;">(Consecutive gesture translations compile here to form long sentences...)</span>
            </div>

            <!-- AI Translation Panel -->
            <div id="ai-translation-wrap" style="display: none; margin-bottom: 0.75rem;">
              <div style="font-size: 0.75rem; color: var(--accent-light); margin-bottom: 0.25rem; font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">
                <span class="material-symbols-outlined" style="font-size: 0.9rem;">psychology</span> AI Translated Sentence:
              </div>
              <div style="background: rgba(20, 184, 166, 0.08); border: 1.5px solid var(--accent); border-radius: 8px; padding: 0.75rem; min-height: 3rem; color: var(--accent-light); font-size: 1.1rem; font-weight: 700; line-height: 1.4; display: flex; align-items: center;" id="ai-translated-sentence-view">
              </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="avatar-control-btn" id="compiler-space-btn" style="min-height: 38px; font-size: 0.8rem; flex:1;">
                Space
              </button>
              <button class="avatar-control-btn" id="compiler-backspace-btn" style="min-height: 38px; font-size: 0.8rem; flex:1;">
                Backspace
              </button>
              <button class="avatar-control-btn" id="compiler-clear-btn" style="min-height: 38px; font-size: 0.8rem; flex:1;">
                Clear
              </button>
              <button class="speak-output-btn" id="compiler-speak-btn" style="min-height: 38px; font-size: 0.8rem; flex:2; justify-content:center;" disabled>
                <span class="material-symbols-outlined">volume_up</span> Speak Sentence
              </button>
              <button class="avatar-control-btn" id="compiler-email-btn" style="min-height: 38px; font-size: 0.8rem; flex:1.5; display:flex; align-items:center; justify-content:center; gap:0.25rem;" disabled>
                <span class="material-symbols-outlined" style="font-size:1.1rem;">mail</span> ${t('email_transcript')}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Translation Outputs & Simulators -->
        <div class="glass-card control-panel">
          <h2 class="panel-title">
            <span class="material-symbols-outlined" style="color: var(--accent);">translate</span>
            ${t('translation_panel')}
          </h2>

          <!-- Active Output Box -->
          <div class="detection-result-box">
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">
              ${t('latest_translation')}
            </div>
            <div class="detected-text-display" id="detected-word-view">
              ${t('no_sign')}
            </div>
            <div class="detected-confidence" id="detected-confidence-view">
              ${t('confidence')}: --%
            </div>
            <button class="speak-output-btn" id="tts-speak-btn" disabled>
              <span class="material-symbols-outlined">volume_up</span> ${t('speak_translation')}
            </button>
          </div>

          <!-- Simulated Demo Keys -->
          <div class="demo-signals-container">
            <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between;">
              <span>${t('sim_keyboard')}</span>
              <span style="font-size: 0.75rem; color: var(--primary-light); font-weight: normal;">${t('signs_loaded')}</span>
            </div>
            <input type="text" class="demo-search-input" id="sign-search-bar" placeholder="${t('search_placeholder')}">
            <div class="demo-signals-grid" id="sign-chips-grid">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- History Logs -->
          <div style="margin-top: 2rem;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
              ${t('recent_history')}
            </div>
            <div class="detection-history-list" id="sign-history-log">
              <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">
                ${t('no_history')}
              </div>
            </div>
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
   * Renders the 30+ demo sign chips, with search filtering
   */
  loadDemoSigns() {
    const grid = this.container.querySelector('#sign-chips-grid');
    const searchVal = this.container.querySelector('#sign-search-bar').value.toLowerCase();
    
    const signs = API.getOfflineSigns();
    grid.innerHTML = '';

    const filtered = signs.filter(item => 
      item.sign.toLowerCase().includes(searchVal) || 
      item.category.toLowerCase().includes(searchVal)
    );

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0;">No matching signs found.</div>`;
      return;
    }

    filtered.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'demo-sign-chip';
      chip.dataset.sign = item.sign;
      
      // Categorized borders to look premium
      if (item.category === 'emergency') {
        chip.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        chip.style.color = 'var(--emergency)';
      } else if (item.category === 'medical') {
        chip.style.borderColor = 'rgba(244, 63, 94, 0.4)';
        chip.style.color = 'var(--accent-light)';
      }

      chip.innerHTML = item.text;
      grid.appendChild(chip);
    });
  },

  /**
   * Bind event handlers
   */
  bindEvents() {
    // Search filter input
    const searchBar = this.container.querySelector('#sign-search-bar');
    searchBar.addEventListener('input', () => this.loadDemoSigns());

    // Demo chips clicks
    const grid = this.container.querySelector('#sign-chips-grid');
    grid.addEventListener('click', async (e) => {
      const chip = e.target.closest('.demo-sign-chip');
      if (!chip) return;

      const sign = chip.dataset.sign;
      await this.translateSign(sign);
    });

    // Speak TTS trigger for single word
    const speakBtn = this.container.querySelector('#tts-speak-btn');
    speakBtn.addEventListener('click', async () => {
      if (this.detectedWord && this.detectedWord !== i18n.t('no_sign')) {
        speakBtn.style.background = 'var(--accent)';
        await Speech.speak(this.detectedWord);
        speakBtn.style.background = '';
      }
    });

    // Compiler Action Buttons
    const spaceBtn = this.container.querySelector('#compiler-space-btn');
    const backspaceBtn = this.container.querySelector('#compiler-backspace-btn');
    const clearBtn = this.container.querySelector('#compiler-clear-btn');
    const speakSentenceBtn = this.container.querySelector('#compiler-speak-btn');
    const emailBtn = this.container.querySelector('#compiler-email-btn');

    const emailModal = this.container.querySelector('#email-modal-overlay');
    const modalCloseBtn = this.container.querySelector('#modal-close-btn');
    const modalSendBtn = this.container.querySelector('#modal-send-btn');
    const modalEmailInput = this.container.querySelector('#modal-email-input');

    spaceBtn.addEventListener('click', () => {
      if (this.compiledSentence.length > 0 && this.compiledSentence[this.compiledSentence.length - 1] !== ' ') {
        this.compiledSentence.push(' ');
        this.updateCompilerView();
      }
    });

    backspaceBtn.addEventListener('click', () => {
      if (this.compiledSentence.length > 0) {
        this.compiledSentence.pop();
        this.updateCompilerView();
      }
    });

    clearBtn.addEventListener('click', () => {
      this.compiledSentence = [];
      this.updateCompilerView();
    });

    speakSentenceBtn.addEventListener('click', async () => {
      const textToSpeak = this.translatedSentence || this.getCompiledText();
      if (textToSpeak.trim() !== '') {
        speakSentenceBtn.style.background = 'var(--accent)';
        await Speech.speak(textToSpeak);
        speakSentenceBtn.style.background = '';
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

      const content = `AI Translated Sentence:\n"${this.translatedSentence || this.getCompiledText()}"\n\nRaw Compiled Signs:\n"${this.getCompiledText()}"\n\nIndividual Detected signs:\n` + 
                      this.history.map(item => `- ${item.word} at ${item.time}`).join('\n');

      try {
        const response = await fetch('/api/email-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: targetEmail,
            history: content
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
   * Helper to get compiled sentence as a clean string
   */
  getCompiledText() {
    return this.compiledSentence.join('').replace(/\s+/g, ' ').trim();
  },

  async updateCompilerView() {
    const view = this.container.querySelector('#compiled-sentence-view');
    const aiWrap = this.container.querySelector('#ai-translation-wrap');
    const aiView = this.container.querySelector('#ai-translated-sentence-view');
    const wordCount = this.container.querySelector('#compiler-word-count');
    const speakBtn = this.container.querySelector('#compiler-speak-btn');
    const emailBtn = this.container.querySelector('#compiler-email-btn');

    const cleanText = this.getCompiledText();
    
    if (cleanText === '') {
      view.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem;">(Consecutive gesture translations compile here to form long sentences...)</span>`;
      if (aiWrap) aiWrap.style.display = 'none';
      if (aiView) aiView.textContent = '';
      this.translatedSentence = '';
      wordCount.textContent = '0 words';
      speakBtn.setAttribute('disabled', 'true');
      emailBtn.setAttribute('disabled', 'true');
    } else {
      view.innerHTML = `<strong style="color: var(--text-muted); font-size: 0.9rem;">${cleanText}</strong>`;
      const count = cleanText.split(' ').filter(Boolean).length;
      wordCount.textContent = `${count} word${count > 1 ? 's' : ''}`;
      speakBtn.removeAttribute('disabled');
      emailBtn.removeAttribute('disabled');

      // Call translation API to group fingerspelling and build correct sentence
      try {
        const wordsArray = this.compiledSentence.filter(w => w.trim() !== '');
        if (wordsArray.length > 0) {
          const res = await API.translateSentence(wordsArray);
          if (res.success && res.text) {
            this.translatedSentence = res.text;
            if (aiWrap && aiView) {
              aiWrap.style.display = 'block';
              aiView.innerHTML = `<strong style="color: var(--accent-light);">${res.text}</strong>`;
            }
          }
        }
      } catch (err) {
        console.warn('Sentence translation failed:', err.message);
      }
    }
  },

  /**
   * Call API to convert sign to text and update views
   */
  async translateSign(sign) {
    try {
      const response = await API.signToText(sign);
      if (response.success) {
        const localizedWord = i18n.translateOutputWord(response.text);
        this.detectedWord = localizedWord;
        this.confidence = Math.round(response.confidence * 100);
        this.activeCategory = response.category;

        this.updateOutputView();
        this.addToHistory(localizedWord);

        // Append to Compiled Sentence array (prevent immediate duplicates)
        const lastWord = this.compiledSentence[this.compiledSentence.length - 1];
        if (lastWord !== localizedWord) {
          if (this.compiledSentence.length > 0 && lastWord !== ' ') {
            this.compiledSentence.push(' ');
          }
          this.compiledSentence.push(localizedWord);
          this.updateCompilerView();
        }

        // Auto-speak emergency signs for extreme utility
        if (response.category === 'emergency') {
          Toast.show(`${i18n.t('emergency')}: ${localizedWord}`, 'error');
          await Speech.speak(localizedWord);
        } else {
          Toast.show(`${i18n.t('latest_translation')}: ${localizedWord}`);
        }
      }
    } catch (e) {
      console.error(e);
      Toast.show('Error translating sign gesture', 'error');
    }
  },

  /**
   * Updates output display HTML references
   */
  updateOutputView() {
    const wordView = this.container.querySelector('#detected-word-view');
    const confView = this.container.querySelector('#detected-confidence-view');
    const speakBtn = this.container.querySelector('#tts-speak-btn');

    wordView.textContent = this.detectedWord;
    confView.textContent = `${i18n.t('confidence')}: ${this.confidence}%`;
    
    // Style text color based on category
    if (this.activeCategory === 'emergency') {
      wordView.style.color = 'var(--emergency)';
    } else if (this.activeCategory === 'medical') {
      wordView.style.color = 'var(--accent)';
    } else {
      wordView.style.color = 'var(--primary-light)';
    }

    speakBtn.removeAttribute('disabled');
  },

  /**
   * Adds entry into history checklist
   */
  addToHistory(word) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.unshift({ word, time });

    if (this.history.length > 5) {
      this.history.pop();
    }

    const logBox = this.container.querySelector('#sign-history-log');
    logBox.innerHTML = '';

    this.history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <span class="history-text">${item.word}</span>
        <span class="history-time">${item.time}</span>
      `;
      logBox.appendChild(row);
    });
  },

  /**
   * Releases camera devices on tab unmount
   */
  destroy() {
    if (this.cameraComp) {
      this.cameraComp.destroy();
      this.cameraComp = null;
    }
    Speech.stopSpeaking();
    window.removeEventListener('languagechanged', this.handleLangChange);
  }
};

export default SignToVoicePage;
