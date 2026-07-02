/**
 * SilentCare AI - Storage Utilities
 * Manages localStorage (for persistent UI configuration).
 */

const STORAGE_KEYS = {
  THEME: 'silentcare_active_theme',
  TEXT_SIZE: 'silentcare_font_scale'
};

export const Storage = {

  // Local storage (persistent user setting overrides)
  getTheme: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  saveTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Error storing theme configuration:', e);
    }
  },

  getTextScale: () => {
    try {
      const scale = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE);
      return scale ? parseFloat(scale) : 1.0;
    } catch (e) {
      return 1.0;
    }
  },

  saveTextScale: (scale) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, scale.toString());
    } catch (e) {
      console.error('Error storing text size scale:', e);
    }
  },

  // User Session Management
  getUser: () => {
    try {
      const data = localStorage.getItem('silentcare_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveUser: (user) => {
    try {
      localStorage.setItem('silentcare_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  },

  // Custom Emergency Cards
  getCustomEmergencyCards: () => {
    try {
      const data = localStorage.getItem('silentcare_custom_cards');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCustomEmergencyCards: (cards) => {
    try {
      localStorage.setItem('silentcare_custom_cards', JSON.stringify(cards));
    } catch (e) {
      console.error('Error saving custom cards:', e);
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem('silentcare_user');
    } catch (e) {
      console.error('Error clearing user session:', e);
    }
  },

  // Language settings
  getLanguage: () => {
    try {
      return localStorage.getItem('silentcare_language') || 'en';
    } catch (e) {
      return 'en';
    }
  },

  saveLanguage: (lang) => {
    try {
      localStorage.setItem('silentcare_language', lang);
    } catch (e) {
      console.error('Error saving language selection:', e);
    }
  }
};

export default Storage;
