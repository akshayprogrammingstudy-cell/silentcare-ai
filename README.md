# SilentCare AI: Sign-to-Voice and Voice-to-Sign Assistant

SilentCare AI is an assistive communication application designed for specially-abled individuals who communicate primarily using sign language. The system bridges communication gaps by translating sign language gestures (simulated/demo for MVP) into written text and spoken voice, and converting hearing users' vocal or typed feedback back into signs using a fluid, responsive 2D virtual avatar.

---

## 🚀 Key Features

1. **Sign Language to Voice & Text**
   - Live mobile/desktop camera preview (front camera preferred, desktop fallback).
   - Natural mirror-mode viewport alignment.
   - Converts gestures into written words with simulated confidence metrics.
   - Text-to-Speech (TTS) speech synthesis button.
   - **Simulated Sign Keyboard (30+ Signs)** for immediate hackathon verification:
     *hello, yes, no, thank you, help, emergency, doctor, pain, medicine, water, food, stop, okay, sorry, please repeat, call family, ambulance, accident, breathing problem, fever, dizzy, bathroom, hungry, tired, scared, need help, I am okay, hospital, danger, wait*.

2. **Voice/Text to Sign Avatar**
   - Capture hearing users' spoken voice using Web Speech recognition (STT) or standard keyboard text inputs.
   - Coordinates translated into animated movements of our vector 2D Avatar Care Helper ("Carey").
   - Responsive keyframe interpolation using standard `requestAnimationFrame` (supports rates: `0.5x`, `1.0x`, `2.0x` and a vital **Replay** feature).
   - **Visual Fallback Instruction Cards** display detailed spelling guidelines for custom inputs outside the dictionaries.

4. **Fullscreen Emergency Mode**
   - High-contrast bold layout for visual ease under stressful circumstances.
   - Giant glowing SOS button with active radar pulse waves.
   - Tapping SOS speaks distress alerts loudly: *"Emergency. I need help. I cannot hear or speak clearly."*
   - Cards grid representing 10 high-volume distress messages (Pain, Doctor, Ambulance, Hospital, Accident, etc.) that instantly trigger TTS.

5. **A11y Accessibility Widget**
   - Instant toggling between default Dark Mode, Light Mode, and a specialized **High Contrast Contrast Mode**.
   - Custom typography scaling controls (+ / - buttons) adjusting baseline layouts between 80% to 140%.

---

## 🛠️ Technology Stack

- **Frontend:** Vite, Vanilla JavaScript (ES Modules, standard class structure).
- **Backend:** Node.js, Express (ES Modules server).
- **Styling:** CSS variables design tokens (Dark/Light/High Contrast classes).
- **Avatar:** Light vector SVG path manipulation using `requestAnimationFrame`.
- **APIs:** HTML5 MediaDevices APIs (Webcam captures), SpeechSynthesis, SpeechRecognition.

---

## 📂 Folder Structure

```
silentcare-ai/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.js
│       ├── styles/
│       │   ├── index.css
│       │   ├── components.css
│       │   ├── pages.css
│       │   └── animations.css
│       ├── pages/
│       │   ├── landing.js
│       │   ├── sign-to-voice.js
│       │   ├── voice-to-sign.js

│       │   ├── emergency.js
│       │   └── about.js
│       ├── components/
│       │   ├── navbar.js
│       │   ├── camera.js
│       │   ├── avatar.js

│       │   ├── sign-card.js
│       │   ├── sos-button.js
│       │   └── toast.js
│       └── utils/
│           ├── api.js
│           ├── speech.js
│           ├── camera.js
│           └── storage.js
├── server/
│   ├── index.js
│   ├── package.json
│   ├── routes/
│   │   ├── signToText.js
│   │   ├── textToSign.js
│   │   ├── speechToText.js

│   │   ├── emergency.js
│   │   └── avatarAnimation.js
│   └── data/
│       ├── signDictionary.json
│       └── animationData.json
├── README.md
└── package.json
```

---

## ⚡ Setup & Execution

### Prerequisites
- Node.js (v18+ recommended)
- NPM

### Installation
Run the following script command in the root `silentcare-ai` folder to install all monorepo dependencies:
```bash
npm run install:all
```

### Running Both Frontend & Backend Concurrently
To start both the Node.js API server (on port `3001`) and the Vite client dev server (on port `5173`) simultaneously:
```bash
npm start
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the application.

---

## 📡 API Routes

| Method | Route | Description | Parameters |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/sign-to-text` | Translates a gesture label to written output. | `{ "sign": "hello" }` |
| **POST** | `/api/text-to-sign` | Translates sentences to animation keys sequence. | `{ "text": "water doctor" }` |
| **POST** | `/api/avatar-animation` | Loads keyframe vectors for a given sign ID. | `{ "animation_id": "anim_hello" }` |

| **GET** | `/api/emergency` | Retrieve emergency contacts configurations. | *None* |
| **POST** | `/api/emergency` | Fire emergency rescue distress alert logs. | `{ "phrase": "Distress alert", "location": null }` |

---

## 🔍 Blueprint: Future Machine Learning Model Integration

To transition from the simulated MVP to a production-ready Web ML pipeline, developer teams can implement:
1. **Google MediaPipe Hands:**
   Add `mediapipe` CDN scripts to `client/index.html`. Using `MediaPipe.Hands`, track 21 coordinate keypoints for each hand.
   ```javascript
   const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
   hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5 });
   hands.onResults((results) => {
     if (results.multiHandLandmarks) {
       // results.multiHandLandmarks contains (x, y, z) keypoints of fingers
       // Pass this array to your classifier
     }
   });
   ```
2. **TensorFlow.js Classification Classifier:**
   Train an LSTM or 1D Convolutional Neural Network inside TensorFlow.js using labeled gesture coordinate patterns.
   ```javascript
   const model = await tf.loadLayersModel('public/models/sign_classifier/model.json');
   const prediction = model.predict(tf.tensor2d([flatLandmarksArray]));
   const signIndex = prediction.argMax(1).dataSync()[0];
   const detectedSign = signDictionary[signIndex];
   ```

---

## ⚠️ Known Limitations
- Speech recognition (STT) requires active microphone approvals and browser engine support (Chrome/Edge recommended). Safari/Firefox will gracefully fallback to manual text entries.
- Conversation logs are stored in `sessionStorage` and Node memory; closing tabs or shutting down servers clears logs to protect user confidentiality.
