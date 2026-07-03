import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

let openaiClient = null;
function getOpenAI() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.toLowerCase() === 'your_openai_api_key_here') return null;
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

// Local offline translations for common sign sequences
const LOCAL_PHRASE_BOOK = [
  { keys: ['hello', 'doctor', 'pain'], phrase: 'Hello doctor, I am experiencing pain.' },
  { keys: ['hello', 'doctor', 'help'], phrase: 'Hello doctor, I need your help.' },
  { keys: ['emergency', 'ambulance', 'accident'], phrase: 'Emergency! There has been an accident, please call an ambulance.' },
  { keys: ['medicine', 'fever', 'pain'], phrase: 'I need medicine for fever and pain.' },
  { keys: ['water', 'hungry', 'food'], phrase: 'I need water and food.' },
  { keys: ['bathroom', 'help'], phrase: 'Can you help me go to the bathroom, please?' },
  { keys: ['where', 'hospital'], phrase: 'Where is the nearest hospital?' }
];

// Helper to merge consecutive single characters (fingerspelling) in an array of words
function mergeFingerspelling(words) {
  const result = [];
  let currentWord = '';

  for (const w of words) {
    if (w.length === 1 && /^[a-zA-Z]$/.test(w)) {
      currentWord += w;
    } else {
      if (currentWord) {
        result.push(currentWord);
        currentWord = '';
      }
      if (w.trim() !== '') {
        result.push(w);
      }
    }
  }

  if (currentWord) {
    result.push(currentWord);
  }

  return result;
}

/**
 * @route POST /api/translate-sentence
 * @desc Translates a sequence of sign words/letters into a grammatically correct sentence
 */
router.post('/', async (req, res) => {
  const { words } = req.body;

  if (!words || !Array.isArray(words)) {
    return res.status(400).json({
      success: false,
      error: 'Words array is required'
    });
  }

  // 1. Merge fingerspelling letters (e.g. ['h', 'e', 'l', 'p'] -> 'help')
  const mergedWords = mergeFingerspelling(words.map(w => w.toLowerCase().trim()));
  const rawSentence = mergedWords.join(' ');

  if (!rawSentence) {
    return res.json({
      success: true,
      text: '',
      engine: 'empty'
    });
  }

  // 2. Try OpenAI GPT-based sentence correction
  const openai = getOpenAI();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sign language interpreter. Translate the following sequence of raw sign language words and fingerspelled letters into a grammatically correct, natural, punctuated English sentence. Preserve the original meaning. Only return the final translated sentence, nothing else.'
          },
          {
            role: 'user',
            content: `Raw signs: ${rawSentence}`
          }
        ],
        temperature: 0.3
      });

      const translatedText = response.choices[0]?.message?.content?.trim();
      return res.json({
        success: true,
        text: translatedText || rawSentence,
        engine: 'openai-gpt'
      });
    } catch (err) {
      console.warn('OpenAI sentence translation failed, falling back to local:', err.message);
    }
  }

  // 3. Fallback: Local phrasebook matching or heuristic formatter
  // Check exact/subset phrasebook match
  const matchedPhrase = LOCAL_PHRASE_BOOK.find(item => 
    item.keys.every(k => mergedWords.includes(k))
  );

  if (matchedPhrase) {
    return res.json({
      success: true,
      text: matchedPhrase.phrase,
      engine: 'local-phrasebook'
    });
  }

  // Generic heuristic formatter
  let formatted = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1);
  const isQuestion = mergedWords.some(w => ['where', 'why', 'who', 'what', 'when', 'how'].includes(w));
  const isEmergency = mergedWords.some(w => ['emergency', 'danger', 'sos', 'ambulance', 'accident', 'help'].includes(w));

  if (isQuestion) {
    formatted += '?';
  } else if (isEmergency) {
    formatted += '!';
  } else {
    formatted += '.';
  }

  return res.json({
    success: true,
    text: formatted,
    engine: 'local-heuristic'
  });
});

export default router;
