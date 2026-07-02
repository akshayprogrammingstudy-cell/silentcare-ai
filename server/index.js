import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import signToTextRouter from './routes/signToText.js';
import textToSignRouter from './routes/textToSign.js';
import speechToTextRouter from './routes/speechToText.js';

import emergencyRouter from './routes/emergency.js';
import avatarAnimationRouter from './routes/avatarAnimation.js';
import authRouter from './routes/auth.js';
import emailRouter from './routes/email.js';
import realtimeRouter from './routes/realtime.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN, 'http://localhost:5173']
  : true; // Allow all in demo/dev mode

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Secret']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API Routes
app.use('/api/sign-to-text', signToTextRouter);
app.use('/api/text-to-sign', textToSignRouter);
app.use('/api/speech-to-text', speechToTextRouter);

app.use('/api/emergency', emergencyRouter);
app.use('/api/avatar-animation', avatarAnimationRouter);
app.use('/api/auth', authRouter);
app.use('/api/email-history', emailRouter);
app.use('/api/realtime', realtimeRouter);

// Health Check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'SilentCare AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Root route redirects to health or serves status
app.get('/', (req, res) => {
  res.send('SilentCare AI Server is running. Access endpoints via /api/');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start listening
app.listen(PORT, "0.0.0.0", () => {
  console.log(`==================================================`);
  console.log(`SilentCare AI Server is running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
