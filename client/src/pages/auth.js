/**
 * SilentCare AI - Sign In / Sign Up Page
 * Allows users to register accounts or sign in.
 * Captures Name, Age, Country, Email, and Password.
 * Saves details to local session and communicates with Express backend.
 */

import { Toast } from '../components/toast.js';
import { Storage } from '../utils/storage.js';
import { i18n } from '../utils/i18n.js';

export const AuthPage = {
  container: null,
  isSignUp: false, // Default is Sign In

  init(container) {
    this.container = container;
    this.isSignUp = false;
    this.render();
    this.bindEvents();
    
    // Listen for language changes to redraw
    window.removeEventListener('languagechanged', this.handleLangChange);
    this.handleLangChange = () => this.render();
    window.addEventListener('languagechanged', this.handleLangChange);
  },

  render() {
    const t = (key) => i18n.t(key);
    const labelTitle = this.isSignUp ? t('sign_up') : t('sign_in');
    const toggleLinkText = this.isSignUp ? t('have_account') : t('no_account');
    
    let additionalFieldsHtml = '';
    if (this.isSignUp) {
      additionalFieldsHtml = `
        <div class="auth-field" style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">${t('name')}</label>
          <input type="text" id="auth-name" required placeholder="e.g. John Doe" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); font-family: inherit; font-size: 0.9rem;">
        </div>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">${t('age')}</label>
            <input type="number" id="auth-age" required min="1" max="120" placeholder="e.g. 25" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); font-family: inherit; font-size: 0.9rem;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">${t('country')}</label>
            <input type="text" id="auth-country" required placeholder="e.g. Canada" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); font-family: inherit; font-size: 0.9rem;">
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div style="max-width: 450px; margin: 3rem auto; padding: 1.5rem;">
        <div class="glass-card fade-in" style="padding: 2.25rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 8px 32px var(--shadow-color);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="display: inline-flex; align-items: center; justify-content: center; background: var(--accent-glow); border: 1px solid var(--accent); width: 50px; height: 50px; border-radius: 50%; color: var(--accent); margin-bottom: 1rem;">
              <span class="material-symbols-outlined" style="font-size: 1.75rem;">lock_open</span>
            </div>
            <h2 style="font-family: var(--font-display); font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
              ${labelTitle}
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">${t('auth_title')}</p>
          </div>

          <form id="auth-form">
            ${additionalFieldsHtml}
            <div class="auth-field" style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">${t('email')}</label>
              <input type="email" id="auth-email" required placeholder="john@example.com" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); font-family: inherit; font-size: 0.9rem;">
            </div>
            <div class="auth-field" style="margin-bottom: 1.75rem;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">${t('password')}</label>
              <input type="password" id="auth-password" required placeholder="••••••••" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); font-family: inherit; font-size: 0.9rem;">
            </div>

            <button type="submit" class="speak-output-btn" style="width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; border-radius: 8px; border: none; background: var(--accent); color: var(--dark-bg); font-family: inherit; cursor: pointer; transition: all 0.3s ease;">
              <span class="material-symbols-outlined" style="font-size: 1.25rem;">login</span>
              ${labelTitle}
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.5rem;">
            <a href="#" id="auth-toggle-link" style="font-size: 0.85rem; color: var(--accent-light); text-decoration: none; transition: opacity 0.3s ease;">
              ${toggleLinkText}
            </a>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const form = this.container.querySelector('#auth-form');
    const toggleLink = this.container.querySelector('#auth-toggle-link');

    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.isSignUp = !this.isSignUp;
      this.render();
      this.bindEvents();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalHtml = submitBtn.innerHTML;

      const email = this.container.querySelector('#auth-email').value.trim();
      const password = this.container.querySelector('#auth-password').value;

      if (!email || !password) {
        Toast.show('Please fill in all required fields.', 'warning');
        return;
      }

      let payload = { email, password };
      let endpoint = '/api/auth/signin';

      if (this.isSignUp) {
        const name    = this.container.querySelector('#auth-name').value.trim();
        const age     = parseInt(this.container.querySelector('#auth-age').value);
        const country = this.container.querySelector('#auth-country').value.trim();

        if (!name || !age || !country) {
          Toast.show('Please fill in all signup fields.', 'warning');
          return;
        }
        payload  = { name, age, country, email, password };
        endpoint = '/api/auth/signup';
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite; font-size:1.1rem;">progress_activity</span> Processing...`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          Toast.show(data.message || 'Authentication successful.');
          Storage.saveUser(data.user);

          // Trigger global custom user state change event
          window.dispatchEvent(new CustomEvent('userchanged', { detail: data.user }));

          window.location.hash = '#landing';
        } else {
          Toast.show(data.error || 'Authentication failed.', 'error');
        }
      } catch (err) {
        console.error(err);
        Toast.show('Network error during authentication.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  },

  destroy() {
    window.removeEventListener('languagechanged', this.handleLangChange);
  }
};

export default AuthPage;
