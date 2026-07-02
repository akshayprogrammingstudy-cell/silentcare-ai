import express from 'express';
import { OpenAIRealtimeService } from '../services/openaiRealtimeService.js';
import { CallSessionManager } from '../services/callSessionManager.js';
import { TextToSignService } from '../services/textToSignService.js';
import { TranscriptService } from '../services/transcriptService.js';

const router = express.Router();

/**
 * @route GET /api/realtime/token
 * @desc Generate an ephemeral WebRTC token for the browser to connect to OpenAI
 */
router.get('/token', async (req, res) => {
  try {
    const data = await OpenAIRealtimeService.generateEphemeralToken();
    res.json({
      success: true,
      token: data.client_secret.value
    });
  } catch (error) {
    console.error('Failed to generate token:', error);
    res.status(500).json({ success: false, error: 'Failed to generate WebRTC token' });
  }
});

/**
 * @route POST /api/realtime/session
 * @desc Create a new call session (for UI tracking)
 */
router.post('/session', (req, res) => {
  const { userId, targetPhone } = req.body;
  const session = CallSessionManager.createSession(userId, targetPhone);
  res.json({ success: true, session });
});



/**
 * @route PUT /api/realtime/session/:id
 * @desc Update call session status
 */
router.put('/session/:id', (req, res) => {
  const { status } = req.body;
  const session = CallSessionManager.updateStatus(req.params.id, status);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, session });
});

/**
 * @route POST /api/realtime/text-to-sign
 * @desc Process text to sign glosses
 */
router.post('/text-to-sign', (req, res) => {
  const { text, sessionId, sender } = req.body;
  const result = TextToSignService.process(text);
  
  if (sessionId && sender) {
    CallSessionManager.addTranscriptMessage(sessionId, sender, text, result.emotion);
  }

  res.json({ success: true, data: result });
});

/**
 * @route GET /api/realtime/session/:id/transcript
 * @desc Export transcript
 */
router.get('/session/:id/transcript', (req, res) => {
  const session = CallSessionManager.getSession(req.params.id);
  if (!session) return res.status(404).send('Session not found');
  
  const textOut = TranscriptService.exportAsText(session.transcript);
  res.setHeader('Content-disposition', `attachment; filename=transcript_${req.params.id}.txt`);
  res.setHeader('Content-type', 'text/plain');
  res.send(textOut);
});

export default router;
