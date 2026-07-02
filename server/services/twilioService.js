/**
 * SilentCare AI — Twilio SIP Service
 * Wraps the Twilio Node.js SDK for outbound voice calls and SMS alerts.
 * Gracefully degrades (logs + returns mock success) when credentials are absent,
 * so the app runs perfectly in demo mode without a Twilio account.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let twilioClient = null;
let twilioInitAttempted = false;

/**
 * Lazy-initialize the Twilio client only when credentials are present.
 * Returns null if not configured — callers must handle this.
 */
async function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid === 'your_twilio_sid' || token === 'your_twilio_token') {
    return null; // Not configured — graceful no-op mode
  }

  if (twilioClient) return twilioClient;
  if (twilioInitAttempted) return null; // Don't retry after failure

  twilioInitAttempted = true;
  try {
    const twilio = require('twilio');
    twilioClient = twilio(sid, token);
    console.log('[Twilio] Client initialized successfully.');
    return twilioClient;
  } catch (err) {
    console.error('[Twilio] Failed to initialize client:', err.message);
    return null;
  }
}

export const TwilioService = {

  /**
   * Place an outbound automated voice call using TwiML <Say>.
   * @param {string} toPhone  - Destination phone number (E.164 format, e.g. +91XXXXXXXXXX)
   * @param {string} message  - The text-to-speech message to play when the call connects
   * @returns {Promise<{success: boolean, callSid?: string, mock?: boolean, error?: string}>}
   */
  async makeCall(toPhone, message) {
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    // Build TwiML instruction
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${message}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="en-US">This was an automated emergency alert from SilentCare AI. Please respond immediately.</Say>
</Response>`;

    const client = await getClient();

    if (!client || !fromPhone || fromPhone === 'your_twilio_phone_number') {
      // Demo/offline mode — log and return success stub
      console.log('\n========================================');
      console.log('[Twilio DEMO MODE] Simulating VOICE CALL');
      console.log(`  To:      ${toPhone || 'NOT SET'}`);
      console.log(`  From:    ${fromPhone || 'NOT SET'}`);
      console.log(`  Message: "${message}"`);
      console.log('  (Configure TWILIO_* env vars for real calls)');
      console.log('========================================\n');
      return { success: true, mock: true, callSid: 'MOCK_CALL_SID', toPhone };
    }

    try {
      const call = await client.calls.create({
        twiml,
        to: toPhone,
        from: fromPhone
      });
      console.log(`[Twilio] Call placed → SID: ${call.sid}, To: ${toPhone}`);
      return { success: true, callSid: call.sid, toPhone };
    } catch (err) {
      console.error(`[Twilio] Call failed:`, err.message);
      return { success: false, error: err.message, toPhone };
    }
  },

  /**
   * Send an SMS emergency alert.
   * @param {string} toPhone  - Destination phone number (E.164 format, e.g. +91XXXXXXXXXX)
   * @param {string} message  - SMS body text
   * @returns {Promise<{success: boolean, messageSid?: string, mock?: boolean, error?: string}>}
   */
  async sendSMS(toPhone, message) {
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const client = await getClient();

    if (!client || !fromPhone || fromPhone === 'your_twilio_phone_number') {
      console.log('\n========================================');
      console.log('[Twilio DEMO MODE] Simulating SMS ALERT');
      console.log(`  To:      ${toPhone || 'NOT SET'}`);
      console.log(`  From:    ${fromPhone || 'NOT SET'}`);
      console.log(`  Message: "${message}"`);
      console.log('  (Configure TWILIO_* env vars for real SMS)');
      console.log('========================================\n');
      return { success: true, mock: true, messageSid: 'MOCK_SMS_SID', toPhone };
    }

    try {
      const sms = await client.messages.create({
        body: message,
        to: toPhone,
        from: fromPhone
      });
      console.log(`[Twilio] SMS sent → SID: ${sms.sid}, To: ${toPhone}`);
      return { success: true, messageSid: sms.sid, toPhone };
    } catch (err) {
      console.error(`[Twilio] SMS failed:`, err.message);
      return { success: false, error: err.message, toPhone };
    }
  },

  /**
   * Returns true if Twilio credentials are properly configured.
   */
  isConfigured() {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const phone = process.env.TWILIO_PHONE_NUMBER;
    return !!(sid && token && phone &&
              sid !== 'your_twilio_sid' &&
              token !== 'your_twilio_token' &&
              phone !== 'your_twilio_phone_number');
  }
};

export default TwilioService;
