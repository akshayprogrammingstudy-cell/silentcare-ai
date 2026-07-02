import express from 'express';
import { TwilioService } from '../services/twilioService.js';

const router = express.Router();

// Mock database config for emergency settings
// In production, these would be stored per-user in a real database
let emergencySettings = {
  contacts: [
    { name: "Emergency Services", phone: "911 / 112" },
    { name: "Family Guardian", phone: process.env.EMERGENCY_CONTACT_PHONE || "+1-555-0199" },
    { name: "Personal Physician", phone: "+1-555-0122" }
  ],
  dispatchService: "Hospital Medical Center Dispatcher",
  locationSync: true
};

/**
 * @route GET /api/emergency
 * @desc Get contacts and dispatch configuration
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    settings: emergencySettings,
    twilioConfigured: TwilioService.isConfigured()
  });
});

/**
 * @route POST /api/emergency
 * @desc Trigger emergency dispatch event — sends SMS to all contacts via Twilio
 */
router.post('/', async (req, res) => {
  const { phrase, location } = req.body;

  const alertMessage = phrase || 'Immediate assistance requested';
  const locationStr = location ? `at coordinates: ${JSON.stringify(location)}` : 'location unknown';

  console.log(`\n[EMERGENCY BROADCAST]: ${alertMessage} ${locationStr}`);

  // Send SMS to all configured contacts (real or mock)
  const smsResults = [];
  for (const contact of emergencySettings.contacts) {
    // Only attempt to SMS contacts that have a real phone number (not 911/112 which you can't SMS)
    const phone = contact.phone;
    if (phone && phone.startsWith('+')) {
      const msg = `🚨 SilentCare AI EMERGENCY ALERT 🚨\nUser needs help: "${alertMessage}"\n${locationStr}\nPlease respond immediately.`;
      const result = await TwilioService.sendSMS(phone, msg);
      smsResults.push({ contact: contact.name, phone, ...result });
    }
  }
  
  res.json({
    success: true,
    alertActive: true,
    dispatchStatus: TwilioService.isConfigured()
      ? "SMS alerts dispatched to emergency contacts via Twilio"
      : "Demo mode: SMS alerts simulated (configure TWILIO_* env vars for real alerts)",
    timestamp: new Date().toISOString(),
    phraseTriggered: alertMessage,
    dispatchedContacts: emergencySettings.contacts,
    smsResults
  });
});

/**
 * @route POST /api/emergency/voice-call
 * @desc Place an automated TTS voice call to the specified phone number via Twilio
 */
router.post('/voice-call', async (req, res) => {
  const { phrase, phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required for voice call'
    });
  }

  const message = phrase || 'SilentCare AI Emergency Alert. The user needs immediate assistance. Please respond.';

  console.log(`[EMERGENCY VOICE CALL] → ${phone}: "${message}"`);

  const result = await TwilioService.makeCall(phone, message);

  res.json({
    success: result.success,
    status: result.mock ? 'Call simulated (demo mode)' : 'Call placed successfully',
    callSid: result.callSid,
    mock: result.mock || false,
    error: result.error,
    phoneDialed: phone,
    messagePlayed: message,
    twilioConfigured: TwilioService.isConfigured()
  });
});

export default router;
