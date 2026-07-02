import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sentiment from 'sentiment';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dictionaryPath = path.join(__dirname, '../data/signDictionary.json');
const animationsPath = path.join(__dirname, '../data/animationData.json');

const loadData = () => {
  try {
    const dict = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
    const anim = JSON.parse(fs.readFileSync(animationsPath, 'utf8'));
    return { dict, anim };
  } catch (err) {
    console.error('Error loading data:', err);
    return { dict: [], anim: {} };
  }
};

/**
 * @route POST /api/text-to-sign
 * @desc Converts text input into matching sign animation descriptors
 */
router.post('/', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Text parameter is required'
    });
  }

  // TODO: Add natural language processing/stemming to map complex text into core sign vocabulary.
  
  const { dict, anim } = loadData();
  
  // Normalize and split the input string into clean words
  const words = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "but", "or", "if", "because", "as", "until", "while", "of", "at", 
    "by", "for", "with", "about", "against", "between", "into", "through", "during", 
    "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", 
    "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "all", "any", "both", "each", "few", 
    "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", 
    "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "should", "now",
    // Tamil stop words and common suffixes
    "நான்", "நீ", "அவன்", "அவள்", "அது", "நாங்கள்", "அவர்கள்", "என்னை", "அவனை", "அவளை",
    "எங்களை", "அவர்களை", "என்", "உன்", "அதன்", "எங்கள்", "அவர்களின்", "இருக்கிறேன்",
    "இருக்கிறாய்", "இருக்கிறான்", "இருக்கிறாள்", "இருக்கிறது", "இருக்கிறோம்", "இருக்கிறார்கள்",
    "இருந்தேன்", "இருந்தாய்", "இருந்தான்", "இருந்தாள்", "இருந்தது", "இருந்தோம்", "இருந்தார்கள்",
    "வேண்டும்", "வேண்டாம்", "என்று", "என", "ஆகு", "ஆயிரு", "கொண்டிருக்க", "கொண்டு",
    "எனக்கு", "உனக்கு", "அவனுக்கு", "அவளுக்கு", "அதற்கு", "எங்களுக்கு", "அவர்களுக்கு"
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
    dict.some(item => isWordMatch(item, word))
  );

  if (hasMatchedWords || words.length > 1) {
    filteredWords = words.filter(word => {
      const hasExactMatch = dict.some(item => item.sign.toLowerCase() === word.toLowerCase());
      return hasExactMatch || !STOP_WORDS.has(word);
    });
    if (filteredWords.length === 0) {
      filteredWords = words;
    }
  }

  // Use NLP Sentiment analysis
  const sentimentAnalyzer = new Sentiment();
  const sentimentResult = sentimentAnalyzer.analyze(text);
  const sentenceEmotion = sentimentResult.score > 0 ? 'happy' : (sentimentResult.score < 0 ? 'sad' : 'neutral');

  const matchedSequence = filteredWords.map(word => {
    // Try to find the exact match first
    let dictionaryEntry = dict.find(item => item.sign.toLowerCase() === word);
    
    // If not found, try to find a phrase containing the word as a full word
    if (!dictionaryEntry) {
      dictionaryEntry = dict.find(item => isWordMatch(item, word));
    }

    if (dictionaryEntry && dictionaryEntry.animation_id) {
      const animation = anim[dictionaryEntry.animation_id];
      return {
        word: word,
        matched: true,
        sign: dictionaryEntry.sign,
        animation_id: dictionaryEntry.animation_id,
        duration: animation ? animation.duration : 1000,
        keyframes: animation ? animation.keyframes : [],
        emotion: sentenceEmotion,
        fallback_steps: animation ? animation.fallback_steps : [`No animation for "${word}". Show the letter cards.`]
      };
    }

    // Return a fallback sequence if the word has no predefined animation
    return {
      word: word,
      matched: false,
      sign: word,
      animation_id: null,
      duration: 1000,
      keyframes: [],
      emotion: sentenceEmotion,
      fallback_steps: [
        `Spell the word "${word.toUpperCase()}" letter by letter.`,
        `Point outwards to indicate completion.`
      ]
    };
  });

  res.json({
    success: true,
    input: text,
    sequence: matchedSequence,
    timestamp: new Date().toISOString()
  });
});

export default router;
export { loadData };
