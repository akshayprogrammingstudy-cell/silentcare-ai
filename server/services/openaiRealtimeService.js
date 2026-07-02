/**
 * Service to manage secure connections to the OpenAI Realtime API.
 * Uses the HTTP endpoint to generate Ephemeral Tokens for browser WebRTC clients.
 */
export const OpenAIRealtimeService = {
  /**
   * Generates a short-lived Ephemeral WebRTC Token so the browser can securely
   * connect to OpenAI directly without exposing the main API key.
   */
  async generateEphemeralToken() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.toLowerCase() === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-12-17',
          voice: 'alloy', // natural conversational voice
          instructions: `
            You are a helpful, concise AI phone relay assistant for a deaf/mute user. 
            When the caller speaks, transcribe their words accurately so the deaf user can read and see the sign language avatar.
            If the deaf user types a response, you will speak it out loud to the caller.
            Keep responses very short and natural, as this is a live phone call.
            Do not provide long explanations. 
          `
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data; // contains client_secret.value (the ephemeral token)
    } catch (err) {
      console.error('[OpenAI Realtime Service] Token generation failed:', err);
      throw err;
    }
  }
};
