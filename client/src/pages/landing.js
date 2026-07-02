/**
 * SilentCare AI - Landing Page
 * Renders the introductory portal with beautiful glassmorphism action cards.
 * Supports multi-language translation.
 */

import { i18n } from '../utils/i18n.js';

export const LandingPage = {
  container: null,

  /**
   * Mount landing page HTML contents
   */
  init(container) {
    this.container = container;
    this.render();

    // Redraw if language changes
    window.removeEventListener('languagechanged', this.handleLangChange);
    this.handleLangChange = () => this.render();
    window.addEventListener('languagechanged', this.handleLangChange);
  },

  render() {
    const t = (key) => i18n.t(key);

    this.container.innerHTML = `
      <div class="landing-hero fade-in-content">
        <h1 class="landing-title">${t('landing_title')}</h1>
        <p class="landing-subtitle">
          ${t('landing_desc')}
        </p>
      </div>

      <div class="landing-grid">
        <!-- Card 1: Sign to Voice -->
        <div class="landing-card glass-card fade-in-content" onclick="window.location.hash='#sign-to-voice'">
          <div class="landing-card-icon">
            <span class="material-symbols-outlined">linked_camera</span>
          </div>
          <h2 class="landing-card-title">${t('feat_s2v_title')}</h2>
          <p class="landing-card-desc">
            ${t('feat_s2v_desc')}
          </p>
          <div class="landing-card-action">
            ${t('get_started')} <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>

        <!-- Card 2: Voice to Sign -->
        <div class="landing-card glass-card fade-in-content" onclick="window.location.hash='#voice-to-sign'">
          <div class="landing-card-icon">
            <span class="material-symbols-outlined">record_voice_over</span>
          </div>
          <h2 class="landing-card-title">${t('feat_v2s_title')}</h2>
          <p class="landing-card-desc">
            ${t('feat_v2s_desc')}
          </p>
          <div class="landing-card-action">
            ${t('get_started')} <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>

        <!-- Card 4: Emergency Mode -->
        <div class="landing-card glass-card emergency-card-btn fade-in-content" onclick="window.location.hash='#emergency'">
          <div class="landing-card-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--emergency);">
            <span class="material-symbols-outlined">emergency_share</span>
          </div>
          <h2 class="landing-card-title" style="color: var(--emergency);">${t('feat_sos_title')}</h2>
          <p class="landing-card-desc">
            ${t('feat_sos_desc')}
          </p>
          <div class="landing-card-action" style="color: var(--emergency);">
            ${t('get_started')} <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>

        <!-- Card 5: About -->
        <div class="landing-card glass-card fade-in-content" onclick="window.location.hash='#about'">
          <div class="landing-card-icon">
            <span class="material-symbols-outlined">info</span>
          </div>
          <h2 class="landing-card-title">${t('about')}</h2>
          <p class="landing-card-desc">
            Learn more about SilentCare AI, the underlying technology stack, security architectures, and future development scopes.
          </p>
          <div class="landing-card-action">
            Learn More <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>
      </div>

      <footer class="landing-footer">
        <p>🔒 <strong>Privacy Note:</strong> Camera and microphone streams are processed locally inside your browser and are never stored or uploaded onto servers.</p>
        <p>⚠️ <strong>Disclaimer:</strong> SilentCare AI is an assistive communication tool, not a medical diagnostic engine.</p>
        <p>© 2026 SilentCare AI. Designed for accessibility and medical inclusion.</p>
      </footer>
    `;
  },

  destroy() {
    window.removeEventListener('languagechanged', this.handleLangChange);
  }
};

export default LandingPage;
