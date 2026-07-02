/**
 * SilentCare AI - Client Bootstrap & State Router Coordinator
 * Sets up page rendering based on URL hash changes and manages global themes,
 * text sizes, and accessibility panel hooks.
 */

import { Navbar } from './components/navbar.js';
import { Storage } from './utils/storage.js';
import { Toast } from './components/toast.js';

// Import Pages
import LandingPage from './pages/landing.js';
import SignToVoicePage from './pages/sign-to-voice.js';
import VoiceToSignPage from './pages/voice-to-sign.js';
import EmergencyPage from './pages/emergency.js';
import AboutPage from './pages/about.js';
import AuthPage from './pages/auth.js';
import LiveCallPage from './pages/live-call.js';

// Router Map
const ROUTES = {
  '#landing': LandingPage,
  '#sign-to-voice': SignToVoicePage,
  '#voice-to-sign': VoiceToSignPage,
  '#emergency': EmergencyPage,
  '#about': AboutPage,
  '#auth': AuthPage,
  '#live-call': LiveCallPage
};

class AppCoordinator {
  constructor() {
    this.activePage = null;
    this.activeHash = '';
  }

  init() {
    this.setupAccessibilitySettings();
    this.bindRouter();
    this.bindAccessibilityPanel();
    
    // Listen for global redraws
    window.addEventListener('languagechanged', () => {
      const desktopHeader = document.getElementById('desktop-header');
      const mobileNav = document.getElementById('mobile-nav');
      Navbar.renderDesktop(desktopHeader, this.activeHash);
      Navbar.renderMobile(mobileNav, this.activeHash);
    });

    window.addEventListener('userchanged', () => {
      const desktopHeader = document.getElementById('desktop-header');
      const mobileNav = document.getElementById('mobile-nav');
      Navbar.renderDesktop(desktopHeader, this.activeHash);
      Navbar.renderMobile(mobileNav, this.activeHash);
    });

    // Trigger initial route
    this.handleRoute();
    
    Toast.show('SilentCare AI Loaded. Ready for communication.');
  }

  /**
   * Listens to hash shifts and switches page frames
   */
  bindRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * Coordinates page unmount, layout swaps, and active navigation indicators
   */
  handleRoute() {
    const hash = window.location.hash || '#landing';
    this.activeHash = hash;

    // Check if target page exists, fallback to home
    const TargetPage = ROUTES[hash] || LandingPage;

    // Clean up previous page streams/loops
    if (this.activePage && typeof this.activePage.destroy === 'function') {
      try {
        this.activePage.destroy();
      } catch (err) {
        console.error('Error destroying page:', err);
      }
    }

    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    // Clear content and swap views
    appContainer.innerHTML = '';
    this.activePage = TargetPage;
    
    // Inject and spin up new views
    try {
      this.activePage.init(appContainer);
    } catch (err) {
      console.error('Error initializing page:', err);
      appContainer.innerHTML = `
        <div class="glass-card" style="padding:2rem; text-align:center; max-width:600px; margin: 2rem auto; border-color: var(--emergency);">
          <span class="material-symbols-outlined" style="font-size:3rem; color:var(--emergency);">error</span>
          <h2 style="margin: 1rem 0 0.5rem 0;">Page Load Failure</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">${err.message}</p>
          <a href="#landing" class="speak-output-btn">Return to Home</a>
        </div>
      `;
    }

    // Update Desktop Header and Mobile Navigation Bars
    const desktopHeader = document.getElementById('desktop-header');
    const mobileNav = document.getElementById('mobile-nav');
    
    Navbar.renderDesktop(desktopHeader, hash);
    Navbar.renderMobile(mobileNav, hash);

    // Track active page focus switches
    window.scrollTo(0, 0);
  }

  /**
   * Binds accessibility widgets triggers (Contrast, Font scaling, themes)
   */
  setupAccessibilitySettings() {
    const body = document.body;
    
    // 1. Load active theme preferences
    const activeTheme = Storage.getTheme();
    body.className = ''; // Reset
    
    if (activeTheme === 'light') {
      body.classList.add('light-theme');
    } else if (activeTheme === 'high-contrast') {
      body.classList.add('high-contrast-theme');
    } else {
      body.classList.add('dark-theme');
    }

    // 2. Load text scale coordinates
    const scale = Storage.getTextScale();
    document.documentElement.style.setProperty('--font-scale', scale);
  }

  /**
   * Syncs click actions inside accessibility drawer
   */
  bindAccessibilityPanel() {
    const accBtn = document.getElementById('acc-btn');
    const accPanel = document.getElementById('acc-panel');
    const themeBtn = document.getElementById('theme-toggle');
    const contrastBtn = document.getElementById('contrast-toggle');
    const textIncBtn = document.getElementById('text-increase');
    const textDecBtn = document.getElementById('text-decrease');
    const body = document.body;

    // Toggle drawer display
    accBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accPanel.classList.toggle('show');
    });

    // Close on clicking outside drawer bounds
    document.addEventListener('click', (e) => {
      if (!accPanel.contains(e.target) && e.target !== accBtn) {
        accPanel.classList.remove('show');
      }
    });

    // Theme Toggle Handler (Light vs Dark)
    themeBtn.addEventListener('click', () => {
      const isLight = body.classList.contains('light-theme');
      body.className = ''; // Wipe active theme classes
      
      if (isLight) {
        body.classList.add('dark-theme');
        Storage.saveTheme('dark');
        themeBtn.textContent = 'Light Mode';
        Toast.show('Dark mode theme activated');
      } else {
        body.classList.add('light-theme');
        Storage.saveTheme('light');
        themeBtn.textContent = 'Dark Mode';
        Toast.show('Light mode theme activated');
      }
    });

    // Contrast Toggle Handler (High Contrast)
    contrastBtn.addEventListener('click', () => {
      const isHighContrast = body.classList.contains('high-contrast-theme');
      body.className = '';
      
      if (isHighContrast) {
        body.classList.add('dark-theme');
        Storage.saveTheme('dark');
        contrastBtn.textContent = 'High Contrast';
        themeBtn.textContent = 'Light Mode';
        Toast.show('Standard theme restored');
      } else {
        body.classList.add('high-contrast-theme');
        Storage.saveTheme('high-contrast');
        contrastBtn.textContent = 'Standard Mode';
        Toast.show('High-contrast accessibility activated');
      }
    });

    // Scaling Font Sizes Up
    textIncBtn.addEventListener('click', () => {
      let currentScale = Storage.getTextScale();
      if (currentScale < 1.4) {
        currentScale = parseFloat((currentScale + 0.1).toFixed(1));
        document.documentElement.style.setProperty('--font-scale', currentScale);
        Storage.saveTextScale(currentScale);
        Toast.show(`Text size increased to ${currentScale * 100}%`);
      } else {
        Toast.show('Maximum text size limit reached', 'warning');
      }
    });

    // Scaling Font Sizes Down
    textDecBtn.addEventListener('click', () => {
      let currentScale = Storage.getTextScale();
      if (currentScale > 0.8) {
        currentScale = parseFloat((currentScale - 0.1).toFixed(1));
        document.documentElement.style.setProperty('--font-scale', currentScale);
        Storage.saveTextScale(currentScale);
        Toast.show(`Text size decreased to ${currentScale * 100}%`);
      } else {
        Toast.show('Minimum text size limit reached', 'warning');
      }
    });
  }
}

// Instantiate and initialize the app
const app = new AppCoordinator();
document.addEventListener('DOMContentLoaded', () => app.init());
