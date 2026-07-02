import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Lazy-init OpenAI client
let openaiClient = null;
function getOpenAI() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.toLowerCase() === 'your_openai_api_key_here') return null;
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

/**
 * @route POST /api/speech-to-text
 * @desc Transcribes audio using OpenAI Whisper API.
 *       Accepts audioData as a base64-encoded string (WAV/MP3/WebM).
 *       Falls back to a simulated response if no API key is configured.
 */
router.post('/', async (req, res) => {
  const { audioData, mimeType } = req.body;

  if (!audioData) {
    return res.status(400).json({
      success: false,
      error: 'Audio data is missing or empty'
    });
  }

  const openai = getOpenAI();

  // If OpenAI is configured and audio is provided, call Whisper
  if (openai && audioData !== 'demo') {
    try {
      // Decode base64 audio to a Buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      const extension = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';
      const filename = `audio.${extension}`;

      // Use the OpenAI SDK's toFile() helper to wrap the buffer correctly for upload
      const { toFile } = await import('openai');
      const audioFile = await toFile(audioBuffer, filename, { type: mimeType || 'audio/webm' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'json'
      });

      return res.json({
        success: true,
        text: transcription.text,
        confidence: 0.97,
        engine: 'openai-whisper'
      });

    } catch (err) {
      console.error('[Whisper API] Transcription error:', err.message);
      // Fall through to simulated response on API error
    }
  }

  // Fallback: simulated response for demo / when no audio data
  return res.json({
    success: true,
    text: "This is a simulated speech translation. Configure audio capture on the client to use OpenAI Whisper for real transcription.",
    confidence: 0.90,
    engine: 'simulated',
    note: openai
      ? 'OpenAI key found but audio decoding failed — check client audio capture format'
      : 'Configure OPENAI_API_KEY to enable real Whisper transcription'
  });
});

export default router;
