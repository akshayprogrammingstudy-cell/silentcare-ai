/**
 * SilentCare AI - About Project Page
 * Explains the target problem, features, tech stack, privacy protocols,
 * and future developments of the SilentCare AI suite.
 */

export const AboutPage = {
  init(container) {
    container.innerHTML = `
      <div class="about-article fade-in-content">
        <h1 style="font-family: var(--font-display); font-size: 2.2rem; font-weight:800; text-align: center; margin-bottom: 2rem;">
          About SilentCare AI
        </h1>

        <!-- Problem overview -->
        <section class="about-section glass-card" style="padding: 1.5rem;">
          <h2 class="about-title" style="color: var(--primary-light);">The Communication Gap</h2>
          <div class="about-body">
            <p>
              Millions of specially-abled individuals worldwide communicate primarily using sign language. 
              However, because a majority of the general population does not understand sign language, basic 
              daily interactions—especially in critical places like clinics, hospitals, banks, and grocery 
              stores—become highly stressful or require expensive human interpreters.
            </p>
            <p style="margin-top: 0.5rem;">
              <strong>SilentCare AI</strong> serves as an assistive communication assistant. It provides a 
              lightweight, fast, and fully local solution to translate sign gestures into written text or speech, 
              and convert vocal voices back into signs through a friendly, animated virtual assistant.
            </p>
          </div>
        </section>

        <!-- How it works -->
        <section class="about-section glass-card" style="padding: 1.5rem;">
          <h2 class="about-title" style="color: var(--accent-light);">How SilentCare AI Works</h2>
          <div class="about-body">
            <p>
              The application utilizes a modular translation model:
            </p>
            <ul style="margin: 0.5rem 0 0 1.25rem; display:flex; flex-direction:column; gap: 0.25rem;">
              <li><strong>Sign-to-Voice:</strong> Captures camera streams locally. Detections are translated into written display text, which can then be synthesized into natural spoken voices using the browser's native text-to-speech engine.</li>
              <li><strong>Voice-to-Sign:</strong> Captures spoken speech through your microphone via the browser Speech Recognition API. These words are searched against a sign dictionary to find matching animation paths.</li>
              <li><strong>2D Animated Avatar:</strong> The Care Helper ("Carey") is constructed entirely as a vector SVG. Limbs, arms, and mouth movements are animated by interpolating coordinate coordinates dynamically using a lightweight requestAnimationFrame loop.</li>
            </ul>
          </div>
        </section>

        <!-- Tech Stack -->
        <section class="about-section glass-card" style="padding: 1.5rem;">
          <h2 class="about-title" style="color: var(--primary-light);">The Hackathon Technology Stack</h2>
          <div class="about-body">
            <p>SilentCare AI is designed for speed, low CPU overhead, and responsive styling:</p>
            <div class="tech-stack-list">
              <div class="tech-stack-item">
                <div class="tech-item-name">Frontend - Vite + Vanilla JS</div>
                <div class="tech-item-desc">A blazing-fast compiler providing modern module scoping without loading heavy frameworks like React or Angular.</div>
              </div>
              <div class="tech-stack-item">
                <div class="tech-item-name">Backend - Node.js + Express</div>
                <div class="tech-item-desc">A modular server handling sign dictionaries, coordinate structures, and dispatcher alerts.</div>
              </div>
              <div class="tech-stack-item">
                <div class="tech-item-name">Styles - Vanilla CSS Custom Variables</div>
                <div class="tech-item-desc">Dynamic color tokens enabling instantaneous switches between dark mode, light mode, and high-contrast styling.</div>
              </div>
              <div class="tech-stack-item">
                <div class="tech-item-name">APIs - Web Speech & MediaDevices</div>
                <div class="tech-item-desc">Native browser APIs for real-time speech-to-text, text-to-speech, and camera viewport binding.</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Privacy & safety -->
        <section class="about-section glass-card" style="padding: 1.5rem; border-color: rgba(239, 68, 68, 0.2);">
          <h2 class="about-title" style="color: var(--emergency);">Privacy & Safety Assurances</h2>
          <div class="about-body">
            <p>
              Communication tools handling camera and microphone inputs must prioritize user security:
            </p>
            <ul style="margin: 0.5rem 0 0 1.25rem; display:flex; flex-direction:column; gap:0.25rem;">
              <li><strong>Local Processing:</strong> Camera frames and voice inputs are parsed inside the local browser application and are never recorded, saved, or uploaded to servers.</li>

              <li><strong>Medical Disclaimer:</strong> SilentCare AI is an assistive communication utility. It does not perform medical diagnostic procedures.</li>
            </ul>
          </div>
        </section>

        <!-- Future scope -->
        <section class="about-section glass-card" style="padding: 1.5rem;">
          <h2 class="about-title" style="color: var(--primary-light);">Future Development Scope</h2>
          <div class="about-body">
            <p>
              To transition SilentCare AI from a hackathon MVP to a global production tool, we plan the following additions:
            </p>
            <ul style="margin: 0.5rem 0 0 1.25rem; display:flex; flex-direction:column; gap:0.25rem; list-style-type: square;">
              <li><strong>Real Gesture recognition models:</strong> Integrate Google MediaPipe or TensorFlow.js directly into the camera preview to recognize actual hand coordinates locally.</li>
              <li><strong>Indian Sign Language (ISL) support:</strong> Expand vocabulary databases to match regional Indian and international sign language libraries.</li>
              <li><strong>Kiosk Deployment:</strong> Design physical kiosk frameworks for hospital reception halls and emergency triage rooms.</li>
              <li><strong>Wearable Accelerometer integration:</strong> Allow smartwatches to transmit arm movements directly into the dictionary to translate signs even when camera access is blocked.</li>
            </ul>
          </div>
        </section>
      </div>
    `;
  },

  destroy() {
    // No-op
  }
};

export default AboutPage;
