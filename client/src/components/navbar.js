/**
 * SilentCare AI - Navbar Component
 * Renders top navigation for desktop views and a bottom tab bar for mobile.
 * Includes a Language Selector dropdown and Authentication state triggers.
 */

import { i18n } from '../utils/i18n.js';
import { Storage } from '../utils/storage.js';
import { Toast } from './toast.js';

const NAV_ITEMS = [
  { path: '#landing', key: 'home', icon: 'home' },
  { path: '#sign-to-voice', key: 'sign_to_voice', icon: 'linked_camera' },
  { path: '#voice-to-sign', key: 'voice_to_sign', icon: 'record_voice_over' },
  { path: '#live-call', key: 'live_call', icon: 'phone_in_talk' },
  { path: '#emergency', key: 'emergency', icon: 'emergency_share', isEmergency: true },
  { path: '#about', key: 'about', icon: 'info' }
];

export const Navbar = {
  /**
   * Render the top navigation bar for desktop screens
   */
  renderDesktop(container, activeHash) {
    if (!container) return;
    
    const active = activeHash || '#landing';
    const currentLang = i18n.getLang();
    const user = Storage.getUser();
    
    // Auth badge html
    let authHtml = '';
    if (user) {
      authHtml = `
        <div class="user-badge" style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">
            ${i18n.t('welcome')}, <strong style="color: var(--accent-light);">${user.name}</strong>
          </span>
          <button id="signout-desktop-btn" class="avatar-control-btn" style="min-height: 36px; padding: 0 0.75rem; font-size: 0.75rem; border-color: rgba(239, 68, 68, 0.4); color: var(--emergency);">
            ${i18n.t('sign_out')}
          </button>
        </div>
      `;
    } else {
      authHtml = `
        <a href="#auth" class="avatar-control-btn primary" style="min-height: 36px; padding: 0 1rem; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; text-decoration: none;">
          ${i18n.t('sign_in')}
        </a>
      `;
    }

    // Language picker html
    const langPickerHtml = `
      <select id="lang-selector-desktop" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.4rem 0.6rem; border-radius: 6px; font-family: inherit; font-size: 0.8rem; cursor: pointer; outline: none;">
        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
        <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>TA</option>
      </select>
    `;

    let html = `
      <div class="desktop-nav" style="display: flex; align-items: center; justify-content: space-between;">
        <a href="#landing" class="brand-logo" style="text-decoration: none;">
          <svg viewBox="0 0 100 100" width="32" height="32" fill="none">
            <circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="4" />
            <path d="M30 50 A 20 20 0 0 1 70 50" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
            <path d="M40 50 A 10 10 0 0 1 60 50" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
            <circle cx="50" cy="30" r="6" fill="currentColor" />
          </svg>
          ${i18n.t('app_title')}
        </a>
        <nav class="nav-links" style="display: flex; align-items: center; gap: 1rem;">
    `;

    NAV_ITEMS.forEach(item => {
      const activeClass = active === item.path ? 'active' : '';
      const emergencyStyle = item.isEmergency ? 'style="color: var(--emergency); font-weight: bold;"' : '';
      
      html += `
        <a href="${item.path}" class="nav-item ${activeClass}" ${emergencyStyle} style="text-decoration: none;">
          <span class="material-symbols-outlined">${item.icon}</span>
          ${i18n.t(item.key)}
        </a>
      `;
    });

    html += `
        </nav>
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          ${langPickerHtml}
          ${authHtml}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindDesktopEvents(container);
  },

  /**
   * Render the bottom tab navigation bar for mobile touch screens
   */
  renderMobile(container, activeHash) {
    if (!container) return;
    
    const active = activeHash || '#landing';
    const currentLang = i18n.getLang();
    const user = Storage.getUser();

    // Mobile Top Utility Header (adds lang picker and auth on small screen)
    // To make sure it fits nicely, we render a thin bar at the very top of index.html mobile layouts if needed,
    // or we can append it directly at the top of the app container.
    // Let's create an elegant header banner dynamically.
    let mobileHeader = document.getElementById('mobile-top-utility-header');
    if (!mobileHeader) {
      mobileHeader = document.createElement('div');
      mobileHeader.id = 'mobile-top-utility-header';
      mobileHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background: rgba(10, 15, 30, 0.6);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border-color);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3rem;
        z-index: 100;
      `;
      // Check if viewport is mobile before displaying
      const checkMobile = () => {
        if (window.innerWidth < 1024) {
          mobileHeader.style.display = 'flex';
          document.body.style.paddingTop = '3rem';
        } else {
          mobileHeader.style.display = 'none';
          document.body.style.paddingTop = '0px';
        }
      };
      window.addEventListener('resize', checkMobile);
      document.body.appendChild(mobileHeader);
      setTimeout(checkMobile, 50);
    }

    let authMobileHtml = '';
    if (user) {
      authMobileHtml = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.75rem; color: var(--text-secondary); max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${user.name}
          </span>
          <button id="signout-mobile-btn" style="background: transparent; border: none; padding: 0.25rem; color: var(--emergency); display: flex; align-items: center;" aria-label="Sign Out">
            <span class="material-symbols-outlined" style="font-size: 1.2rem;">logout</span>
          </button>
        </div>
      `;
    } else {
      authMobileHtml = `
        <a href="#auth" style="font-size: 0.75rem; color: var(--accent-light); text-decoration: none; border: 1px solid var(--accent); padding: 0.2rem 0.5rem; border-radius: 4px;">
          ${i18n.t('sign_in')}
        </a>
      `;
    }

    mobileHeader.innerHTML = `
      <a href="#landing" style="font-family: var(--font-display); font-weight: 700; color: var(--text-primary); text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
        <span class="material-symbols-outlined" style="font-size: 1.25rem; color: var(--accent);">assist_walker</span>
        SilentCare AI
      </a>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <select id="lang-selector-mobile" style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: inherit; font-size: 0.75rem;">
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
          <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>TA</option>
        </select>
        ${authMobileHtml}
      </div>
    `;

    // Render mobile bottom tab bar links
    let html = '';
    NAV_ITEMS.forEach(item => {
      const activeClass = active === item.path ? 'active' : '';
      const styleAttr = item.isEmergency && active !== item.path ? 'style="color: var(--emergency);"' : '';
      
      html += `
        <a href="${item.path}" class="mobile-nav-item ${activeClass}" ${styleAttr} style="text-decoration: none;">
          <span class="material-symbols-outlined">${item.icon}</span>
          <label style="cursor: pointer;">${i18n.t(item.key)}</label>
        </a>
      `;
    });

    container.innerHTML = html;
    this.bindMobileEvents(mobileHeader);
  },

  bindDesktopEvents(container) {
    const langSelect = container.querySelector('#lang-selector-desktop');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        i18n.setLang(e.target.value);
        Toast.show(`Language changed to ${e.target.value.toUpperCase()}`);
      });
    }

    const signOutBtn = container.querySelector('#signout-desktop-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        Storage.clearUser();
        Toast.show('You have been signed out.');
        window.dispatchEvent(new CustomEvent('userchanged', { detail: null }));
        window.location.hash = '#landing';
      });
    }
  },

  bindMobileEvents(mobileHeader) {
    const langSelect = mobileHeader.querySelector('#lang-selector-mobile');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        i18n.setLang(e.target.value);
        Toast.show(`Language changed to ${e.target.value.toUpperCase()}`);
      });
    }

    const signOutBtn = mobileHeader.querySelector('#signout-mobile-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        Storage.clearUser();
        Toast.show('You have been signed out.');
        window.dispatchEvent(new CustomEvent('userchanged', { detail: null }));
        window.location.hash = '#landing';
      });
    }
  }
};

export default Navbar;
