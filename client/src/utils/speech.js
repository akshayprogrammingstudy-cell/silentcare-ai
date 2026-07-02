/**
 * SilentCare AI - Speech Utilities
 * Interfaces with browser Web Speech APIs (SpeechSynthesis & SpeechRecognition).
 */

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    // Support speech recognition across browsers (Chrome, Edge, Safari, Firefox fallbacks)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    
    // Configurations
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Speak text out loud using Text-to-Speech (TTS)
   * @param {string} text - Message to read
   * @param {object} options - volume, rate, pitch overrides
   * @returns {Promise} Resolves when speech completes
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis not supported on this browser.');
        return reject('Unsupported');
      }

      // Stop any current speaking
      this.synth.cancel();

      if (!text) {
        return resolve();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;
      utterance.rate = options.rate !== undefined ? options.rate : 1.0;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;

      // Select high-quality English or Tamil voice based on active language selection
      const activeLang = localStorage.getItem('silentcare_language') || 'en';
      const isTamil = activeLang === 'ta';
      const searchPrefix = isTamil ? 'ta' : 'en';

      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.startsWith(searchPrefix) && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Tamil') || v.name.includes('Latha'))
      ) || voices.find(v => v.lang.startsWith(searchPrefix)) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (err) => reject(err);

      this.synth.speak(utterance);
    });
  }

  /**
   * Stop any running speech synthesis
   */
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Listen for vocal input from user using Speech-to-Text (STT)
   * @param {object} callbacks - { onStart, onResult, onEnd, onError }
   */
  listen({ onStart, onResult, onEnd, onError }) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please type your message instead.');
      return;
    }

    // Set dynamic language prior to starting the recognition stream
    const activeLang = localStorage.getItem('silentcare_language') || 'en';
    this.recognition.lang = activeLang === 'ta' ? 'ta-IN' : 'en-US';

    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start failed (already running):', e);
    }
  }

  /**
   * Cancel active listening session
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('SpeechRecognition stop error:', e);
      }
    }
  }

  isRecognitionSupported() {
    return this.recognition !== null;
  }
}

export const Speech = new SpeechService();
export default Speech;
