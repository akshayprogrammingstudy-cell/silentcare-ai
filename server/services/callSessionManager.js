/**
 * In-memory manager for active Live Call sessions.
 * In a production app, this would use Redis or a database.
 */
export const CallSessionManager = {
  sessions: new Map(),

  createSession(userId, targetPhone) {
    const sessionId = `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const sessionData = {
      id: sessionId,
      userId,
      targetPhone,
      status: 'connecting', // connecting, ringing, active, ended, failed
      startTime: new Date().toISOString(),
      transcript: []
    };
    this.sessions.set(sessionId, sessionData);
    return sessionData;
  },

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  },

  updateStatus(sessionId, status) {
    const session = this.getSession(sessionId);
    if (session) {
      session.status = status;
      if (status === 'ended' || status === 'failed') {
        session.endTime = new Date().toISOString();
      }
    }
    return session;
  },

  addTranscriptMessage(sessionId, sender, text, emotion = 'neutral') {
    const session = this.getSession(sessionId);
    if (session) {
      const msg = {
        timestamp: new Date().toISOString(),
        sender,
        text,
        emotion
      };
      session.transcript.push(msg);
      return msg;
    }
    return null;
  },

  endSession(sessionId) {
    return this.updateStatus(sessionId, 'ended');
  }
};
