/**
 * SilentCare AI - Client API Client
 * Wraps fetches to the Express backend and automatically falls back
 * to local simulated responses if the backend is unreachable.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Offline backup data for seamless demo failover
const OFFLINE_DICTIONARY = [
  { "sign": "hello", "text": "Hello", "category": "general", "confidence": 0.98, "animation_id": "anim_hello" },
  { "sign": "yes", "text": "Yes", "category": "general", "confidence": 0.95, "animation_id": "anim_yes" },
  { "sign": "no", "text": "No", "category": "general", "confidence": 0.96, "animation_id": "anim_no" },
  { "sign": "thank you", "text": "Thank you", "category": "general", "confidence": 0.97, "animation_id": "anim_thank_you" },
  { "sign": "help", "text": "Help", "category": "emergency", "confidence": 0.99, "animation_id": "anim_help" },
  { "sign": "emergency", "text": "Emergency", "category": "emergency", "confidence": 0.99, "animation_id": "anim_emergency" },
  { "sign": "doctor", "text": "Doctor", "category": "medical", "confidence": 0.94, "animation_id": "anim_doctor" },
  { "sign": "pain", "text": "Pain", "category": "medical", "confidence": 0.92, "animation_id": "anim_pain" },
  { "sign": "medicine", "text": "Medicine", "category": "medical", "confidence": 0.93, "animation_id": "anim_medicine" },
  { "sign": "water", "text": "Water", "category": "request", "confidence": 0.96, "animation_id": "anim_water" },
  { "sign": "food", "text": "Food", "category": "request", "confidence": 0.95, "animation_id": "anim_food" },
  { "sign": "stop", "text": "Stop", "category": "general", "confidence": 0.97, "animation_id": "anim_stop" },
  { "sign": "okay", "text": "Okay", "category": "general", "confidence": 0.98, "animation_id": "anim_okay" },
  { "sign": "sorry", "text": "Sorry", "category": "general", "confidence": 0.94, "animation_id": "anim_sorry" },
  { "sign": "please repeat", "text": "Please repeat", "category": "request", "confidence": 0.91, "animation_id": "anim_please_repeat" },
  { "sign": "call family", "text": "Call family", "category": "request", "confidence": 0.92, "animation_id": "anim_call_family" },
  { "sign": "ambulance", "text": "Ambulance", "category": "emergency", "confidence": 0.99, "animation_id": "anim_ambulance" },
  { "sign": "accident", "text": "Accident", "category": "emergency", "confidence": 0.98, "animation_id": "anim_accident" },
  { "sign": "breathing problem", "text": "Breathing problem", "category": "emergency", "confidence": 0.99, "animation_id": "anim_breathing_problem" },
  { "sign": "fever", "text": "Fever", "category": "medical", "confidence": 0.94, "animation_id": "anim_fever" },
  { "sign": "dizzy", "text": "Dizzy", "category": "medical", "confidence": 0.91, "animation_id": "anim_dizzy" },
  { "sign": "bathroom", "text": "Bathroom", "category": "request", "confidence": 0.95, "animation_id": "anim_bathroom" },
  { "sign": "hungry", "text": "Hungry", "category": "request", "confidence": 0.96, "animation_id": "anim_hungry" },
  { "sign": "tired", "text": "Tired", "category": "general", "confidence": 0.93, "animation_id": "anim_tired" },
  { "sign": "scared", "text": "Scared", "category": "general", "confidence": 0.92, "animation_id": "anim_scared" },
  { "sign": "need help", "text": "Need help", "category": "emergency", "confidence": 0.99, "animation_id": "anim_need_help" },
  { "sign": "I am okay", "text": "I am okay", "category": "general", "confidence": 0.96, "animation_id": "anim_i_am_okay" },
  { "sign": "hospital", "text": "Hospital", "category": "medical", "confidence": 0.95, "animation_id": "anim_hospital" },
  { "sign": "danger", "text": "Danger", "category": "emergency", "confidence": 0.99, "animation_id": "anim_danger" },
  { "sign": "wait", "text": "Wait", "category": "general", "confidence": 0.94, "animation_id": "anim_wait" }
];

// Fallback animations mapping keyframe vectors directly
// This aligns keyframes for basic animations in case server is unavailable
const OFFLINE_ANIMATIONS = {
  "anim_hello": {
    "duration": 1200,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.3, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 150, "y": 70, "rot": -45}, "mouth": "smile", "eyes": "normal", "head": {"x": -2, "y": 2, "rot": -2} },
      { "time": 0.6, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 170, "y": 55, "rot": -15}, "mouth": "smile", "eyes": "blink", "head": {"x": 2, "y": 0, "rot": 2} },
      { "time": 1.0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Bring right hand up to your temple.", "Move the hand outward in a small saluting motion.", "Lower the hand to your side."]
  },
  "anim_yes": {
    "duration": 1000,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.3, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 90, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 8, "rot": 0} },
      { "time": 0.6, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 110, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": -4, "rot": 0} },
      { "time": 0.8, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 90, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 8, "rot": 0} },
      { "time": 1.0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Form a fist with your right hand at chest height.", "Tilt the fist forward and back, nodding.", "Repeat nodding."]
  },
  "anim_no": {
    "duration": 1000,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "flat", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.3, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 135, "y": 90, "rot": 20}, "mouth": "flat", "eyes": "normal", "head": {"x": -8, "y": 0, "rot": -5} },
      { "time": 0.6, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 145, "y": 90, "rot": -20}, "mouth": "flat", "eyes": "normal", "head": {"x": 8, "y": 0, "rot": 5} },
      { "time": 1.0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "flat", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Extend index/middle fingers, tap against thumb twice.", "Shake head slightly."]
  },
  "anim_thank_you": {
    "duration": 1200,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.4, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 105, "y": 65, "rot": -10}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 2, "rot": 0} },
      { "time": 0.8, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 120, "y": 110, "rot": 45}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": -2, "rot": 0} },
      { "time": 1.2, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "smile", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Touch right fingertips to chin.", "Move hand forward and down in an arc."]
  },
  "anim_help": {
    "duration": 1200,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "neutral", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.3, "lh": {"x": 80, "y": 110, "rot": 10}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "neutral", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.6, "lh": {"x": 90, "y": 110, "rot": 0}, "rh": {"x": 100, "y": 100, "rot": 0}, "mouth": "flat", "eyes": "wide", "head": {"x": 0, "y": 4, "rot": 0} },
      { "time": 0.9, "lh": {"x": 90, "y": 90, "rot": 0}, "rh": {"x": 100, "y": 80, "rot": 0}, "mouth": "flat", "eyes": "wide", "head": {"x": 0, "y": -2, "rot": 0} },
      { "time": 1.2, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "neutral", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Place left hand out palm-up.", "Place right fist thumb-up on left hand and raise both."]
  },
  "anim_emergency": {
    "duration": 1400,
    "keyframes": [
      { "time": 0, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "flat", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} },
      { "time": 0.3, "lh": {"x": 75, "y": 80, "rot": -20}, "rh": {"x": 125, "y": 80, "rot": 20}, "mouth": "open", "eyes": "wide", "head": {"x": 0, "y": -5, "rot": 0} },
      { "time": 0.5, "lh": {"x": 50, "y": 60, "rot": -45}, "rh": {"x": 150, "y": 60, "rot": 45}, "mouth": "open", "eyes": "wide", "head": {"x": 0, "y": 5, "rot": 0} },
      { "time": 0.8, "lh": {"x": 75, "y": 80, "rot": -20}, "rh": {"x": 125, "y": 80, "rot": 20}, "mouth": "open", "eyes": "wide", "head": {"x": 0, "y": -5, "rot": 0} },
      { "time": 1.1, "lh": {"x": 50, "y": 60, "rot": -45}, "rh": {"x": 150, "y": 60, "rot": 45}, "mouth": "open", "eyes": "wide", "head": {"x": 0, "y": 5, "rot": 0} },
      { "time": 1.4, "lh": {"x": 60, "y": 150, "rot": 0}, "rh": {"x": 140, "y": 150, "rot": 0}, "mouth": "neutral", "eyes": "normal", "head": {"x": 0, "y": 0, "rot": 0} }
    ],
    "fallback_steps": ["Raise both hands chest level, fingers spread wide.", "Shake both hands rapidly in alert motion."]
  }
};



// Helper to make safe POST/GET fetches
async function postData(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`API: Fallback triggered for POST ${endpoint}. Reason:`, error.message);
    return handleOfflinePost(endpoint, body);
  }
}

async function getData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API: Fallback triggered for GET ${endpoint}. Reason:`, error.message);
    return handleOfflineGet(endpoint);
  }
}

async function deleteData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API: Fallback triggered for DELETE ${endpoint}. Reason:`, error.message);
    return handleOfflineDelete(endpoint);
  }
}

// Simulated offline routes logic
function handleOfflinePost(endpoint, body) {
  const timestamp = new Date().toISOString();
  
  if (endpoint === '/sign-to-text') {
    const { sign } = body;
    const matched = OFFLINE_DICTIONARY.find(x => x.sign.toLowerCase() === sign.toLowerCase());
    
    if (matched) {
      return {
        success: true,
        sign: matched.sign,
        text: matched.text,
        category: matched.category,
        confidence: matched.confidence,
        animation_id: matched.animation_id,
        timestamp,
        offline: true
      };
    }
    return {
      success: true,
      sign,
      text: sign.charAt(0).toUpperCase() + sign.slice(1),
      category: 'general',
      confidence: 0.85,
      animation_id: null,
      timestamp,
      offline: true
    };
  }
  
  if (endpoint === '/text-to-sign') {
    const { text } = body;
    const words = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').split(/\s+/).filter(Boolean);
    
    const STOP_WORDS = new Set([
      "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", 
      "my", "your", "his", "its", "our", "their", "am", "is", "are", "was", "were", 
      "be", "been", "being", "have", "has", "had", "do", "does", "did", "a", "an", 
      "the", "and", "but", "or", "if", "because", "as", "until", "while", "of", "at", 
      "by", "for", "with", "about", "against", "between", "into", "through", "during", 
      "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", 
      "on", "off", "over", "under", "again", "further", "then", "once", "here", 
      "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", 
      "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", 
      "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "should", "now"
    ]);

    // Helper to check if a word matches a sign (exact or word boundary match)
    const isWordMatch = (item, word) => {
      const signLower = item.sign.toLowerCase();
      const wordLower = word.toLowerCase();
      if (signLower === wordLower) return true;
      try {
        const escapedWord = wordLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp('\\b' + escapedWord + '\\b', 'i').test(signLower);
      } catch (e) {
        return signLower.includes(wordLower);
      }
    };

    // Filter out stop words if we have other words, so they don't get spelled letter by letter
    let filteredWords = words;
    const hasMatchedWords = words.some(word => 
      OFFLINE_DICTIONARY.some(item => isWordMatch(item, word))
    );

    if (hasMatchedWords || words.length > 1) {
      filteredWords = words.filter(word => {
        const hasExactMatch = OFFLINE_DICTIONARY.some(item => item.sign.toLowerCase() === word.toLowerCase());
        return hasExactMatch || !STOP_WORDS.has(word);
      });
      if (filteredWords.length === 0) {
        filteredWords = words;
      }
    }

    const sequence = filteredWords.map(word => {
      let matched = OFFLINE_DICTIONARY.find(x => x.sign.toLowerCase() === word);
      if (!matched) matched = OFFLINE_DICTIONARY.find(x => isWordMatch(x, word));
      
      if (matched && matched.animation_id) {
        const anim = OFFLINE_ANIMATIONS[matched.animation_id];
        return {
          word,
          matched: true,
          sign: matched.sign,
          animation_id: matched.animation_id,
          duration: anim ? anim.duration : 1000,
          keyframes: anim ? anim.keyframes : [],
          fallback_steps: anim ? anim.fallback_steps : [`No animation for "${word}".`]
        };
      }
      return {
        word,
        matched: false,
        sign: word,
        animation_id: null,
        duration: 1000,
        keyframes: [],
        fallback_steps: [`Spell the word "${word.toUpperCase()}" letter by letter.`, "Point outward."]
      };
    });
    
    return {
      success: true,
      input: text,
      sequence,
      timestamp,
      offline: true
    };
  }
  
  if (endpoint === '/avatar-animation') {
    const { animation_id } = body;
    const anim = OFFLINE_ANIMATIONS[animation_id];
    if (anim) {
      return {
        success: true,
        animation_id,
        duration: anim.duration,
        keyframes: anim.keyframes,
        fallback_steps: anim.fallback_steps,
        offline: true
      };
    }
    return {
      success: false,
      error: 'Animation not found in offline vault',
      offline: true
    };
  }
  

  if (endpoint === '/emergency') {
    const { phrase } = body;
    return {
      success: true,
      alertActive: true,
      dispatchStatus: "Local Alert Dispatched (Offline Mode)",
      timestamp,
      phraseTriggered: phrase,
      offline: true
    };
  }
  
  if (endpoint === '/speech-to-text') {
    return {
      success: true,
      text: "Simulated offline speech translation",
      confidence: 0.9,
      offline: true
    };
  }
  
  return { success: false, error: 'Endpoint offline handler missing' };
}

function handleOfflineGet(endpoint) {

  if (endpoint === '/emergency') {
    return {
      success: true,
      settings: {
        contacts: [
          { name: "Emergency Services (Offline)", phone: "911 / 112" },
          { name: "Family Guardian", phone: "Locally Saved" }
        ]
      },
      offline: true
    };
  }
  return { success: false, error: 'Endpoint offline handler missing' };
}

function handleOfflineDelete(endpoint) {

  return { success: false, error: 'Endpoint offline handler missing' };
}

export const API = {
  signToText: (sign) => postData('/sign-to-text', { sign }),
  textToSign: (text) => postData('/text-to-sign', { text }),

  getEmergencySettings: () => getData('/emergency'),
  triggerEmergency: (phrase, location) => postData('/emergency', { phrase, location }),
  getAvatarAnimation: (animation_id) => postData('/avatar-animation', { animation_id }),
  speechToText: (audioData) => postData('/speech-to-text', { audioData }),
  
  // Expose dictionary list directly to client demo modes
  getOfflineSigns: () => OFFLINE_DICTIONARY,

  // Returns base URL for direct fetch calls (e.g., live-call.js WebRTC)
  getBaseUrl: () => '/api'
};
export default API;
