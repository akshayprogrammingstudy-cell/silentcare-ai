import fs from 'fs';
import path from 'path';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

let dictionary = {};
try {
  const dictPath = path.join(process.cwd(), 'data', 'dictionary.json');
  dictionary = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
} catch (err) {
  console.warn('Could not load dictionary.json. Using empty dictionary.', err.message);
}

// Flatten dictionary for easy lookup: { "hello": "conversational", "police": "emergency" }
const flatDict = {};
for (const [category, words] of Object.entries(dictionary)) {
  for (const word of words) {
    flatDict[word.toLowerCase()] = category;
  }
}

export const TextToSignService = {
  /**
   * Processes a transcript string from OpenAI and converts it into avatar sign glosses and emotion state.
   */
  process(text) {
    if (!text) return { signs: [], emotion: 'neutral' };

    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    const signs = [];
    
    // Evaluate emotion using sentiment score and emergency keyword presence
    let isEmergency = false;

    for (const word of words) {
      if (flatDict[word]) {
        // Known word
        signs.push({ type: 'word', value: word });
        if (flatDict[word] === 'emergency') isEmergency = true;
      } else {
        // Unknown word, fallback to fingerspelling
        const letters = word.split('');
        letters.forEach(letter => signs.push({ type: 'letter', value: letter }));
      }
    }

    const sentimentResult = sentiment.analyze(text);
    let emotion = 'neutral';
    
    if (isEmergency) {
      emotion = 'emergency';
    } else if (sentimentResult.score > 2) {
      emotion = 'happy';
    } else if (sentimentResult.score < -2) {
      emotion = 'sad';
    } else if (sentimentResult.score < 0) {
      emotion = 'worried';
    }

    return {
      originalText: text,
      signs,
      emotion
    };
  }
};
