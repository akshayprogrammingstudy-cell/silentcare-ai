/**
 * SilentCare AI - Fullscreen Emergency SOS Page
 * Designed with a high-contrast layout, a giant radar-pulsing SOS button,
 * and quick-tap distress phrase cards that speak distress messages loudly.
 */

import { SOSButton } from '../components/sos-button.js';
import { Speech } from '../utils/speech.js';
import { API } from '../utils/api.js';
import { Toast } from '../components/toast.js';
import { Storage } from '../utils/storage.js';

export const EmergencyPage = {
  container: null,
  sosBtn: null,
  activeOutputText: 'Select an emergency card below or tap SOS',
  
  // High-volume Distress Phrase Cards
  emergencyCards: [
    { label: 'Pain', speechText: 'Emergency. I am in severe pain. I need assistance.' },
    { label: 'Doctor', speechText: 'Please call a doctor immediately.' },
    { label: 'Medicine', speechText: 'I need my emergency medicine.' },
    { label: 'Ambulance', speechText: 'Immediate medical danger. Please call an ambulance.' },
    { label: 'Family', speechText: 'Emergency. Please contact my family members immediately.' },
    { label: 'Water', speechText: 'I need water immediately.' },
    { label: 'Breathing problem', speechText: 'Emergency. I have a severe breathing problem. Help me.' },
    { label: 'Accident', speechText: 'Emergency. I have been in an accident.' },
    { label: 'Hospital', speechText: 'Emergency. I need to go to the nearest hospital.' },
    { label: 'Help me', speechText: 'I need help immediately. I cannot hear or speak clearly.' }
  ],

  /**
   * Initialize layout and bind SOS triggers
   */
  init(container) {
    this.container = container;
    this.activeOutputText = 'Select an emergency card below or tap SOS';

    this.render();
    
    // Mount SOS Button
    const sosPlaceholder = this.container.querySelector('#sos-button-placeholder');
    this.sosBtn = new SOSButton(sosPlaceholder, () => this.handleSOSClick());
    this.sosBtn.init();

    this.bindEvents();
  },

  /**
   * Renders the bold high contrast layout
   */
  render() {
    this.container.innerHTML = `
      <div class="emergency-page-container fade-in-content">
        <!-- Emergency alert alert banner -->
        <div class="emergency-banner">
          <span class="material-symbols-outlined" style="font-size: 1.8rem; font-weight:bold;">warning</span>
          EMERGENCY ASSISTANCE ACTIVE
        </div>

        <!-- SOS Button mount -->
        <div id="sos-button-placeholder"></div>

        <!-- High-Contrast Readable Display Banner -->
        <div class="emergency-output-display">
          <div class="emergency-output-text" id="emergency-banner-display">
            ${this.activeOutputText}
          </div>
        </div>

        <!-- Quick distress cards grid -->
        <div>
          <h3 class="emergency-phrases-title">
            Quick Distress Phrase Cards (Tap to speak & alert)
          </h3>
          <div class="emergency-phrases-grid" id="emergency-chips-grid">
            <!-- Loaded dynamically -->
          </div>
        </div>

        <div class="glass-card" style="margin-top: 2rem; padding: 1.25rem; text-align: left; border-color: rgba(239, 68, 68, 0.3);">
          <h4 style="font-weight: 700; color: var(--emergency); margin-bottom: 0.5rem; display:flex; align-items:center; gap:0.5rem;">
            <span class="material-symbols-outlined">info</span> Emergency Mode Operations
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            1. Tapping the giant <strong>SOS Button</strong> speaks a distress statement loudly and fires a simulated geolocation alert to responders.
          </p>
          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.25rem;">
            2. Tapping any <strong>Distress Card</strong> prints a high-contrast readable message and translates the text into clear spoken audio.
          </p>
        </div>
      </div>
    `;

    this.loadEmergencyCards();
  },

  /**
   * Render distress cards grid
   */
  loadEmergencyCards() {
    const grid = this.container.querySelector('#emergency-chips-grid');
    grid.innerHTML = '';

    const customCards = Storage.getCustomEmergencyCards();
    const allCards = [...this.emergencyCards, ...customCards];

    allCards.forEach((card, idx) => {
      const btn = document.createElement('button');
      btn.className = 'emergency-phrase-card';
      btn.dataset.index = idx;
      btn.textContent = card.label;
      grid.appendChild(btn);
    });

    // Add Custom Card button
    const addBtn = document.createElement('button');
    addBtn.className = 'emergency-phrase-card add-custom-card';
    addBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    addBtn.style.border = '1px dashed var(--border-color)';
    addBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2rem; margin-right: 0.25rem;">add</span> Custom';
    grid.appendChild(addBtn);
  },

  /**
   * Bind event handlers
   */
  bindEvents() {
    const grid = this.container.querySelector('#emergency-chips-grid');
    grid.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-custom-card');
      if (addBtn) {
        this.handleAddCustomCard();
        return;
      }

      const btn = e.target.closest('.emergency-phrase-card');
      if (!btn) return;

      const idx = parseInt(btn.dataset.index);
      const customCards = Storage.getCustomEmergencyCards();
      const allCards = [...this.emergencyCards, ...customCards];
      const card = allCards[idx];
      if (card) {
        this.triggerDistressEvent(card.speechText, card.label);
      }
    });
  },

  handleAddCustomCard() {
    const label = prompt('Enter a short label for the card (e.g., Insulin):');
    if (!label || label.trim() === '') return;

    const speechText = prompt('Enter the full phrase to speak (e.g., I need my insulin immediately.):');
    if (!speechText || speechText.trim() === '') return;

    const customCards = Storage.getCustomEmergencyCards();
    customCards.push({ label: label.trim(), speechText: speechText.trim() });
    Storage.saveCustomEmergencyCards(customCards);
    
    Toast.show('Custom distress card saved.', 'success');
    this.loadEmergencyCards();
  },

  /**
   * Handles big SOS button trigger
   */
  async handleSOSClick() {
    const sosPhrase = 'Emergency. I need help. I cannot hear or speak clearly.';
    await this.triggerDistressEvent(sosPhrase, 'SOS ALERT ACTIVATED');
  },

  /**
   * Speaks distress message out loud and alerts mock emergency dispatch
   */
  async triggerDistressEvent(phrase, label) {
    // 1. Update text display banner with large contrast font
    this.activeOutputText = phrase;
    const banner = this.container.querySelector('#emergency-banner-display');
    if (banner) {
      banner.textContent = phrase;
      banner.style.color = '#ef4444'; // Bright warning red
    }

    Toast.show(`Distress alert triggered: ${label}`, 'error');

    // 2. Speak the phrase loudly (TTS) with a slower rate for maximum articulation
    try {
      await Speech.speak(phrase, { rate: 0.85, volume: 1.0 });
    } catch (e) {
      console.error('SOS Speak error:', e);
    }

    // 3. Fire dispatcher API call
    try {
      // Fetch user position if available
      let location = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            API.triggerEmergency(phrase, location);
            this.dispatchSMS(phrase, location);
          },
          () => {
            API.triggerEmergency(phrase, null);
            this.dispatchSMS(phrase, null);
          }
        );
      } else {
        await API.triggerEmergency(phrase, null);
        this.dispatchSMS(phrase, null);
      }
    } catch (err) {
      console.warn('Alert dispatch sync failed:', err);
    }
  },

  /**
   * Dispatches SMS via native sms: URI on mobile, or clipboard copy on desktop.
   * Also opens Google Maps link on desktop for manual sharing.
   */
  dispatchSMS(phrase, location) {
    let locationStr = 'Location unknown.';
    if (location) {
      locationStr = `My location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    }

    const message = `🚨 SilentCare SOS Alert: ${phrase} ${locationStr}`;

    // Retrieve saved user contact
    const user = Storage.getUser();
    const phone = user && user.phone ? user.phone : '';

    // Detect if device is a mobile phone
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      if (phone) {
        // For mobile: Open native SMS with pre-filled message
        const smsUri = `sms:${phone}?body=${encodeURIComponent(message)}`;
        window.open(smsUri, '_self');
      } else {
        // Mobile but no phone — open blank sms to fill number
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_self');
      }
    } else {
      // Desktop: copy to clipboard for manual pasting + show toast
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(() => {
          Toast.show('Emergency message copied to clipboard! Paste it in any messaging app.', 'success');
        }).catch(() => {
          Toast.show(`SOS Message: ${message}`, 'error');
        });
      } else {
        // Fallback — show the message text
        Toast.show(`SOS Message ready: ${message}`, 'error');
      }
    }
  },

  destroy() {
    Speech.stopSpeaking();
  }
};

export default EmergencyPage;
