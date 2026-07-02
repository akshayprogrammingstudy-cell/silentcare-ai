import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dictionaryPath = path.join(__dirname, '../data/signDictionary.json');

// Helper to read local dictionary
const getDictionary = () => {
  try {
    const data = fs.readFileSync(dictionaryPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading dictionary:', err);
    return [];
  }
};

/**
 * @route POST /api/sign-to-text
 * @desc Converts detected/simulated sign gesture into on-screen text
 */
router.post('/', (req, res) => {
  const { sign } = req.body;

  if (!sign) {
    return res.status(400).json({
      success: false,
      error: 'Sign parameter is required'
    });
  }

  const dictionary = getDictionary();
  const matched = dictionary.find(
    (item) => item.sign.toLowerCase() === sign.toLowerCase()
  );

  // TODO: Connect real camera sign language ML model here.
  // Currently simulating detection with high confidence for hackathon presentation.
  
  if (matched) {
    return res.json({
      success: true,
      sign: matched.sign,
      text: matched.text,
      category: matched.category,
      confidence: matched.confidence,
      animation_id: matched.animation_id,
      timestamp: new Date().toISOString()
    });
  } else {
    // Return a default simulated prediction if the sign is custom
    return res.json({
      success: true,
      sign: sign,
      text: sign.charAt(0).toUpperCase() + sign.slice(1),
      category: 'general',
      confidence: (0.7 + Math.random() * 0.25).toFixed(2),
      animation_id: null,
      timestamp: new Date().toISOString(),
      note: 'Simulated fallback output'
    });
  }
});

export default router;
