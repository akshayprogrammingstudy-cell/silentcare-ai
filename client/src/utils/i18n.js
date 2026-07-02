/**
 * SilentCare AI - Internationalization (i18n) Utility
 * Supports English (en) and Tamil (ta) translations.
 * Manages UI localization and maps inputs in Tamil back to sign dictionary vocabulary.
 */

import { Storage } from './storage.js';

const TRANSLATIONS = {
  en: {
    // Nav & General
    app_title: "SilentCare AI",
    home: "Home",
    sign_to_voice: "Sign-to-Voice",
    voice_to_sign: "Voice-to-Sign",
    live_call: "Live Call Relay",
    emergency: "Emergency",
    about: "About",
    sign_in: "Sign In",
    sign_up: "Sign Up",
    sign_out: "Sign Out",
    welcome: "Welcome",
    
    // Landing Page
    landing_title: "SilentCare AI",
    landing_subtitle: "Sign-to-Voice and Voice-to-Sign Assistive Communication",
    landing_desc: "Bridging the communication gap for specially-abled individuals with real-time sign language translation and interactive 2D avatar projection.",
    get_started: "Get Started",
    emergency_sos: "Emergency SOS",
    features_title: "Accessible Features Built for Impact",
    feat_s2v_title: "Sign-to-Voice Translation",
    feat_s2v_desc: "Translates camera-captured sign gestures to text and synthesized voice output dynamically.",
    feat_v2s_title: "Voice-to-Sign Avatar",
    feat_v2s_desc: "Translates speech/text inputs into real-time SVG animated sign gestures using professional virtual assistants.",
    feat_sos_title: "High-Contrast SOS",
    feat_sos_desc: "Giant rapid emergency alert triggers that speak out distress requests and log status instantly.",

    // Sign to Voice Page
    gesture_input: "Live Gesture Input",
    demo_inst: "Hackathon Demo Instructions:",
    demo_inst_1: "1. Grant camera permission to view live feedback in natural mirror mode.",
    demo_inst_2: "2. Tap on any of the 30+ Demo Sign Buttons in the panel on the right to simulate camera recognition of sign gestures.",
    translation_panel: "Sign Translation Panel",
    latest_translation: "Latest Translation",
    no_sign: "No Sign Detected",
    confidence: "Confidence Score",
    speak_translation: "Speak Translation",
    sim_keyboard: "Simulated Sign Keyboard",
    signs_loaded: "30+ Signs Loaded",
    search_placeholder: "Search signs (e.g. food, water, pain)...",
    recent_history: "Recent Translation History",
    no_history: "No recent history",
    email_transcript: "Email Transcript",

    // Voice to Sign Page
    v2s_title: "Voice/Text-to-Sign Avatar",
    v2s_desc: "Translate verbal speech or typed text into manual signs projected by Carey, your professional healthcare assistant.",
    mic_listen: "Listen (Mic)",
    listening: "Listening...",
    translate: "Translate",
    input_placeholder: "Type a sentence to translate (e.g. hello doctor need help)...",
    note_unmatched: "Note: If you enter a word not in the dictionary, the avatar will show fingerspelled guide cards.",
    avatar_title: "Carey - Virtual Assistant",
    male: "Male Profile",
    female: "Female Profile",
    scrubs: "Scrubs Uniform",
    labcoat: "Lab Coat",
    speed: "Speed",
    word_progress: "Word Progress",
    ready: "Ready",

    // Emergency Page
    sos_title: "SilentCare Emergency SOS",
    sos_desc: "Speak distress loudly & alert surrounding caretakers immediately.",
    trigger_sos: "TRIGGER SOS ALERT",
    dispatching: "Dispatching alerts to rescue agents...",
    contacts_title: "Rescue Contacts",
    add_contact: "Add Emergency Contact",
    contact_name: "Contact Name",
    contact_phone: "Phone Number",
    save: "Save",
    sos_warning: "Warning: Pressing the SOS button triggers immediate high-volume voice speech and mock alerts dispatch.",

    // Auth Page
    auth_title: "Account Credentials",
    name: "Full Name",
    age: "Age",
    country: "Country",
    email: "Email Address",
    password: "Password",
    have_account: "Already have an account? Sign In",
    no_account: "Don't have an account? Sign Up",
    no_mic_support: "Speech recognition is not supported in this browser. Please type your message."
  },
  ta: {
    // Nav & General
    app_title: "சைலண்ட்கேர் AI",
    home: "முகப்பு",
    sign_to_voice: "சைகை-முதல்-ஒலி",
    voice_to_sign: "ஒலி-முதல்-சைகை",
    live_call: "நேரடி அழைப்பு ரிலே",
    emergency: "அவசரம்",
    about: "பற்றி",
    sign_in: "உள்நுழை",
    sign_up: "பதிவு செய்",
    sign_out: "வெளியேறு",
    welcome: "வரவேற்கிறோம்",

    // Landing Page
    landing_title: "சைலண்ட்கேர் AI",
    landing_subtitle: "சைகை-முதல்-ஒலி மற்றும் ஒலி-முதல்-சைகை உதவித் தொடர்பு",
    landing_desc: "மாற்றுத்திறனாளிகளுக்கான தொடர்பு இடைவெளியை நிகழ்நேர சைகை மொழி மொழிபெயர்ப்பு மற்றும் ஊடாடும் 2D அவதார் மூலம் குறைக்கிறது.",
    get_started: "தொடங்குங்கள்",
    emergency_sos: "அவசர SOS",
    features_title: "தாக்கத்திற்காக உருவாக்கப்பட்ட அணுகக்கூடிய அம்சங்கள்",
    feat_s2v_title: "சைகை-முதல்-ஒலி மொழிபெயர்ப்பு",
    feat_s2v_desc: "கேமரா மூலம் கைப்பற்றப்பட்ட சைகைகளை உரை மற்றும் ஒலியாக மாற்றுகிறது.",
    feat_v2s_title: "ஒலி-முதல்-சைகை அவதார்",
    feat_v2s_desc: "ஒலி அல்லது உரை உள்ளீடுகளை நிகழ்நேர அனிமேஷன் சைகைகளாக அவதார் மூலம் விளக்குகிறது.",
    feat_sos_title: "அவசர SOS",
    feat_sos_desc: "அவசரகால உதவி கோரிக்கைகளை உடனடியாக ஒலிபரப்பி நிலையைப் பதிவு செய்யும் பெரிய SOS பொத்தான்.",

    // Sign to Voice Page
    gesture_input: "நேரடி சைகை உள்ளீடு",
    demo_inst: "டெமோ வழிமுறைகள்:",
    demo_inst_1: "1. கேமரா அனுமதியை வழங்கி நேரடி கேமரா காட்சியைப் பார்க்கவும்.",
    demo_inst_2: "2. சைகைகளை உருவகப்படுத்த வலதுபுறத்தில் உள்ள 30+ டெமோ பொத்தான்களைத் தட்டவும்.",
    translation_panel: "சைகை மொழிபெயர்ப்பு குழு",
    latest_translation: "சமீபத்திய மொழிபெயர்ப்பு",
    no_sign: "சைகை கண்டறியப்படவில்லை",
    confidence: "நம்பகத்தன்மை மதிப்பெண்",
    speak_translation: "ஒலிபரப்பு",
    sim_keyboard: "சைகை விசைப்பலகை",
    signs_loaded: "30+ சைகைகள் ஏற்றப்பட்டன",
    search_placeholder: "சைகைகளைத் தேடுங்கள் (உதாரணம்: உணவு, தண்ணீர், வலி)...",
    recent_history: "சமீபத்திய மொழிபெயர்ப்பு வரலாறு",
    no_history: "வரலாறு இல்லை",
    email_transcript: "மின்னஞ்சல் அனுப்பு",

    // Voice to Sign Page
    v2s_title: "ஒலி/உரை-முதல்-சைகை அவதார்",
    v2s_desc: "உங்கள் குரல் அல்லது உரையை சைகைகளாக அவதார் கேரி மூலம் மொழிபெயர்க்கவும்.",
    mic_listen: "கேள் (மைக்)",
    listening: "கேட்டுக்கொண்டிருக்கிறது...",
    translate: "மொழிபெயர்ப்பு",
    input_placeholder: "மொழிபெயர்க்க தட்டச்சு செய்யவும் (உதாரணம்: வணக்கம் மருத்துவர் உதவி தேவை)...",
    note_unmatched: "குறிப்பு: அகராதியில் இல்லாத வார்த்தை எனில், அவதார் எழுத்துக் கூட்டி காட்டும்.",
    avatar_title: "கேரி - மெய்நிகர் உதவியாளர்",
    male: "ஆண் அவதார்",
    female: "பெண் அவதார்",
    scrubs: "சீருடை",
    labcoat: "மருத்துவ கோட்",
    speed: "வேகம்",
    word_progress: "வார்த்தை முன்னேற்றம்",
    ready: "தயார்",

    // Emergency Page
    sos_title: "அவசரகால SOS அலர்ட்",
    sos_desc: "உங்கள் அவசர நிலையை உரக்க ஒலிபரப்பி சுற்றியுள்ளவர்களின் உதவியை நாடுங்கள்.",
    trigger_sos: "SOS அலர்ட்டை இயக்கு",
    dispatching: "அவசரகால உதவியாளர்களுக்கு தகவல் அனுப்பப்படுகிறது...",
    contacts_title: "அவசர தொடர்புகள்",
    add_contact: "அவசர தொடர்பை சேர்",
    contact_name: "பெயர்",
    contact_phone: "தொலைபேசி எண்",
    save: "சேமி",
    sos_warning: "எச்சரிக்கை: SOS பொத்தானை அழுத்தினால் உடனடியாக அதிக ஒலியுடன் குரல் ஒலிபரப்பும் மற்றும் போலி அலர்ட் அனுப்பப்படும்.",

    // Auth Page
    auth_title: "கணக்கு விவரங்கள்",
    name: "முழு பெயர்",
    age: "வயது",
    country: "நாடு",
    email: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    have_account: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்",
    no_account: "கணக்கு இல்லையா? பதிவு செய்யவும்",
    no_mic_support: "இந்த உலாவி பேச்சு அங்கீகாரத்தை ஆதரிக்கவில்லை. உங்கள் செய்தியை தட்டச்சு செய்யவும்."
  }
};

// Input Vocabulary translation mapper (Tamil -> English core signs)
const INPUT_MAP = {
  ta: {
    "வணக்கம்": "hello",
    "ஆம்": "yes",
    "இல்லை": "no",
    "நன்றி": "thank you",
    "உதவி": "help",
    "அவசரம்": "emergency",
    "மருத்துவர்": "doctor",
    "வலி": "pain",
    "மருந்து": "medicine",
    "தண்ணீர்": "water",
    "தண்ணி": "water",
    "உணவு": "food",
    "சாப்பாடு": "food",
    "சாப்பிடு": "food",
    "நிறுத்து": "stop",
    "சரி": "okay",
    "மன்னிக்கவும்": "sorry",
    "மீண்டும்": "please repeat",
    "குடும்பம்": "call family",
    "ஆம்புலன்ஸ்": "ambulance",
    "விபத்து": "accident",
    "காய்ச்சல்": "fever",
    "தலைச்சுற்றல்": "dizzy",
    "கழிப்பறை": "bathroom",
    "பசி": "hungry",
    "சோர்வு": "tired",
    "பயம்": "scared",
    "மருத்துவமனை": "hospital",
    "ஆபத்து": "danger",
    "காத்திரு": "wait"
  }
};

// Output Vocabulary translation mapper (English core signs -> Tamil)
const OUTPUT_MAP = {
  ta: Object.fromEntries(
    Object.entries(INPUT_MAP.ta).map(([ta, en]) => [en, ta])
  )
};

export const i18n = {
  /**
   * Get active language code (en, ta)
   * @returns {string}
   */
  getLang() {
    return Storage.getLanguage() || 'en';
  },

  /**
   * Set active language code and dispatch global custom event to trigger redraws
   * @param {string} lang 
   */
  setLang(lang) {
    if (TRANSLATIONS[lang]) {
      Storage.saveLanguage(lang);
      // Dispatch custom reload event for navbar & pages
      window.dispatchEvent(new CustomEvent('languagechanged', { detail: lang }));
    }
  },

  /**
   * Translate UI key into active language
   * @param {string} key 
   * @returns {string}
   */
  t(key) {
    const lang = this.getLang();
    return TRANSLATIONS[lang][key] || TRANSLATIONS.en[key] || key;
  },

  /**
   * Translates incoming speech/text sentence from Tamil to English sign equivalencies.
   * Keeps unrecognized words intact for fingerspelling support.
   * @param {string} sentence 
   * @returns {string} English translation sentence
   */
  translateInputSentence(sentence) {
    const lang = this.getLang();
    if (lang === 'en') return sentence;

    const mapper = INPUT_MAP[lang];
    if (!mapper) return sentence;

    // Normalize input words (split by spaces and punctuation)
    const words = sentence.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').split(/\s+/).filter(Boolean);
    const translated = words.map(w => mapper[w] || w);
    return translated.join(' ');
  },

  /**
   * Translates detected English sign text back to active language (e.g. Tamil).
   * @param {string} word English sign word
   * @returns {string} Localized sign word
   */
  translateOutputWord(word) {
    const lang = this.getLang();
    if (lang === 'en') return word;

    const mapper = OUTPUT_MAP[lang];
    if (!mapper) return word;

    return mapper[word.toLowerCase()] || word;
  }
};

export default i18n;
