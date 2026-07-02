import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const logPath = path.join(dataDir, 'sent_emails.txt');

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Writes a log entry to the local sent_emails.txt file.
 * Always runs regardless of SMTP configuration — ensures local record exists.
 */
function writeLocalLog(email, subject, bodyText) {
  try {
    const timestamp = new Date().toISOString();
    const logBlock = `
Timestamp: ${timestamp}
To: ${email}
Subject: ${subject}
--------------------------------------------------
${bodyText}
================================================================================\n`;
    fs.appendFileSync(logPath, logBlock, 'utf8');
    console.log(`[Email] Local transcript log written to: ${logPath}`);
  } catch (err) {
    console.error('[Email] Failed to write local log:', err.message);
  }
}

/**
 * @route POST /api/email-history
 * @desc Sends conversation/translation logs to the specified email address.
 *       Uses SMTP credentials from environment if configured.
 *       Always falls back to writing a local file log — never fails silently.
 */
router.post('/', async (req, res) => {
  const { email, history } = req.body;

  if (!email || !history) {
    return res.status(400).json({
      success: false,
      error: 'Destination email and history log content are required.'
    });
  }

  const subject = 'SilentCare AI - Assistive Translation Transcript';
  const bodyText = `
==================================================
SILENTCARE AI - TRANSLATION HISTORICAL TRANSCRIPT
==================================================
Generated on: ${new Date().toLocaleString()}
Destination: ${email}
==================================================

${history}

==================================================
SilentCare AI: Sign-to-Voice and Voice-to-Sign Assistant
Helping bridge communication gaps for specially-abled individuals.
==================================================
  `;

  // Step 1: Always write local backup log
  writeLocalLog(email, subject, bodyText);

  // Step 2: Try sending via SMTP only if credentials are explicitly configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;

  if (smtpUser && smtpPass && smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: '"SilentCare AI Assistant" <no-reply@silentcare.ai>',
        to: email,
        subject: subject,
        text: bodyText
      });

      console.log(`[Email] Sent via SMTP → Message ID: ${info.messageId}`);

      return res.json({
        success: true,
        message: 'Transcript emailed successfully.',
        loggedLocal: true,
        emailSent: true
      });

    } catch (mailError) {
      console.error('[Email] SMTP send failed:', mailError.message);
      // Don't return failure — we already logged it locally
      return res.json({
        success: true,
        message: 'SMTP send failed, but transcript was saved to server logs (server/data/sent_emails.txt).',
        loggedLocal: true,
        emailSent: false,
        smtpError: mailError.message
      });
    }
  }

  // No SMTP configured — local log is the only output
  return res.json({
    success: true,
    message: 'Transcript saved to server logs (server/data/sent_emails.txt). To enable real email, add SMTP_HOST, SMTP_USER, SMTP_PASS to your .env file.',
    loggedLocal: true,
    emailSent: false
  });
});

export default router;
