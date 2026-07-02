import fs from 'fs';
import path from 'path';

export const TranscriptService = {
  /**
   * Generates a plain text export of the transcript array
   */
  exportAsText(transcriptArray) {
    if (!transcriptArray || transcriptArray.length === 0) return 'No conversation logged.';
    
    let out = 'SilentCare AI Call Transcript\n';
    out += '============================\n\n';
    
    transcriptArray.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      out += `[${time}] ${msg.sender}: ${msg.text}\n`;
    });

    return out;
  }
};
