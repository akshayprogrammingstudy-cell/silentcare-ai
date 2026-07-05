/**
 * SilentCare AI - Hidden AI Model Trainer Page
 * Loads the preprocessed ASL Kaggle dataset JSON coordinates in the browser,
 * compiles a multi-layer Neural Network model, trains it, and stores the weights in IndexedDB.
 */

import { i18n } from '../utils/i18n.js';
import { Toast } from '../components/toast.js';
import { CameraComponent } from '../components/camera.js';

export const KAGGLE_ASL_CLASSES = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const ModelTrainerPage = {
  container: null,
  model: null,
  isTraining: false,
  lossHistory: [],
  accuracyHistory: [],
  cameraComp: null,
  testInterval: null,
  dataset: null,

  async init(container) {
    this.container = container;
    this.isTraining = false;
    this.lossHistory = [];
    this.accuracyHistory = [];
    this.model = null;
    this.dataset = null;

    if (typeof window.tf === 'undefined') {
      Toast.show('TensorFlow.js is loading... Please wait.', 'warning');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    this.render();
    await this.checkSavedModel();
    this.bindEvents();
    this.loadKaggleDataset();
  },

  render() {
    const t = (key) => i18n.t(key);
    
    this.container.innerHTML = `
      <div class="workspace-grid" style="grid-template-columns: 1fr 1.1fr; gap: 2rem; padding: 2rem;">
        
        <!-- Left Side: Controls & Progress -->
        <div class="glass-card control-panel" style="padding: 1.5rem;">
          <h2 class="panel-title" style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary-light);">
            <span class="material-symbols-outlined" style="font-size: 2rem;">model_training</span>
            ASL Dataset Trainer
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.5;">
            Train a sequential Neural Network model (63 inputs, 128 hidden, 64 hidden, 36 outputs) on normalized coordinate points extracted from the Kaggle sign language dataset.
          </p>

          <!-- Parameters Box -->
          <div style="background: rgba(10, 15, 30, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.25rem;">
              <span class="material-symbols-outlined" style="font-size: 1.1rem; color: var(--accent);">tune</span>
              Training Configurations
            </h3>

            <div style="margin-bottom: 1rem; display:flex; justify-content:space-between; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.5rem;">
              <span style="color:var(--text-secondary);">Kaggle Coordinates JSON:</span>
              <span id="dataset-load-status" style="font-weight:700; color:var(--emergency);">Loading...</span>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
                <span style="color: var(--text-secondary);">${t('epochs')}</span>
                <span id="val-epochs" style="font-weight: 700; color: var(--accent-light);">60</span>
              </div>
              <input type="range" class="slider" id="cfg-epochs" min="10" max="150" step="5" value="60" style="width: 100%;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">${t('batch_size')}</label>
                <select id="cfg-batch-size" style="width: 100%; background: var(--bg-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.4rem; border-radius: 6px; font-size: 0.85rem; outline: none;">
                  <option value="16">16</option>
                  <option value="32" selected>32</option>
                  <option value="64">64</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">${t('learning_rate')}</label>
                <select id="cfg-learning-rate" style="width: 100%; background: var(--bg-dark); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.4rem; border-radius: 6px; font-size: 0.85rem; outline: none;">
                  <option value="0.01">0.01</option>
                  <option value="0.005" selected>0.005</option>
                  <option value="0.001">0.001</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div style="display: flex; gap: 0.75rem; flex-direction: column; margin-bottom: 1.5rem;">
            <button class="speak-output-btn" id="train-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--primary), var(--accent));" disabled>
              <span class="material-symbols-outlined">rocket_launch</span>
              Start Model Training
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button class="avatar-control-btn" id="save-model-btn" style="flex: 1; display: none;" disabled>
                <span class="material-symbols-outlined" style="font-size:1.1rem;">save</span>
                ${t('save_to_browser')}
              </button>
              <button class="avatar-control-btn" id="delete-model-btn" style="flex: 1; border-color: rgba(239, 68, 68, 0.4); color: var(--emergency); display: none;">
                <span class="material-symbols-outlined" style="font-size:1.1rem;">delete_forever</span>
                Delete Model
              </button>
            </div>
          </div>

          <!-- Progress -->
          <div id="progress-panel" style="display: none; background: rgba(10, 15, 30, 0.6); border: 1.5px solid var(--primary); border-radius: 8px; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; color: #fff; font-size: 0.9rem;" id="progress-status">Initializing tensors...</span>
              <span style="color: var(--accent-light); font-size: 0.8rem; font-weight: bold;" id="progress-percent">0%</span>
            </div>
            
            <div style="height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1rem;">
              <div id="progress-bar-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary-light), var(--accent)); transition: width 0.1s ease;"></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.05); padding: 0.5rem; border-radius: 4px;">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${t('loss')}</div>
                <div id="progress-loss" style="font-weight: 700; font-size: 1.1rem; color: #f43f5e;">--</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.05); padding: 0.5rem; border-radius: 4px;">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${t('accuracy')}</div>
                <div id="progress-acc" style="font-weight: 700; font-size: 1.1rem; color: #22c55e;">--</div>
              </div>
            </div>
          </div>

          <div id="model-badge-container" style="margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${t('status')}:</span>
            <span id="model-status-badge" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--emergency); color: var(--emergency); font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 30px; font-weight: bold;">
              NO PRE-TRAINED MODEL LOADED
            </span>
          </div>
        </div>

        <!-- Right Side: Real-time Curves -->
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <span class="material-symbols-outlined" style="color: var(--accent);">monitoring</span>
              Training Convergence Curves
            </h3>
            
            <div style="background: rgba(10, 15, 30, 0.8); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; position: relative; margin-bottom: 1.5rem; min-height: 250px; display: flex; align-items: center; justify-content: center;">
              <canvas id="training-curve-chart" width="400" height="220" style="width: 100%; height: 220px; display: block;"></canvas>
              <div id="chart-placeholder" style="position: absolute; color: var(--text-muted); font-size: 0.85rem; text-align: center; pointer-events: none;">
                <span class="material-symbols-outlined" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;">bar_chart</span>
                Curves plot here during training session
              </div>
            </div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.02); border: 1.5px dashed var(--border-color); border-radius: 8px; padding: 1rem;">
            <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; letter-spacing: 0.05em; font-weight: 700;">
              Alphanumeric Classes (36 outputs)
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
              ${KAGGLE_ASL_CLASSES.map(cls => `<span style="font-size: 0.75rem; background: rgba(13, 148, 136, 0.1); border: 1px solid rgba(13, 148, 136, 0.25); color: var(--primary-light); padding: 0.15rem 0.45rem; border-radius: 4px;">${cls}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card" id="test-model-section" style="margin-top: 2rem; padding: 1.5rem; display: none; margin-left: 2rem; margin-right: 2rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span class="material-symbols-outlined" style="color: var(--primary-light);">videocam</span>
          Live Verification
        </h3>
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem;">
          <div id="test-camera-placeholder" style="min-height: 280px;"></div>
          <div style="background: rgba(10, 15, 30, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; display:flex; justify-content:space-between;">
              <span>Real-Time Output probabilities</span>
              <span id="test-predict-word" style="color: var(--accent-light); font-weight: 800;">---</span>
            </h4>
            <div id="prediction-bars-list" style="display: flex; flex-direction: column; gap: 0.65rem;">
              <span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">No hand detected...</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.chartCanvas = this.container.querySelector('#training-curve-chart');
    this.chartCtx = this.chartCanvas.getContext('2d');
  },

  bindEvents() {
    const trainBtn = this.container.querySelector('#train-btn');
    const saveBtn = this.container.querySelector('#save-model-btn');
    const deleteBtn = this.container.querySelector('#delete-model-btn');
    const epochSlider = this.container.querySelector('#cfg-epochs');

    epochSlider.addEventListener('input', (e) => {
      this.container.querySelector('#val-epochs').textContent = e.target.value;
    });

    trainBtn.addEventListener('click', () => this.startTraining());
    saveBtn.addEventListener('click', () => this.saveModel());
    deleteBtn.addEventListener('click', () => this.deleteModel());
  },

  async loadKaggleDataset() {
    const statusLabel = this.container.querySelector('#dataset-load-status');
    const trainBtn = this.container.querySelector('#train-btn');

    try {
      const response = await fetch('/aslKaggleDataset.json');
      if (!response.ok) throw new Error('aslKaggleDataset.json file not found in public folder.');
      this.dataset = await response.json();
      
      statusLabel.textContent = `Loaded (${this.dataset.train.length} train samples)`;
      statusLabel.style.color = 'var(--primary-light)';
      trainBtn.removeAttribute('disabled');
    } catch (err) {
      console.error(err);
      statusLabel.textContent = 'JSON file not ready';
      statusLabel.style.color = 'var(--emergency)';
      Toast.show('aslKaggleDataset.json missing in client/public. Run python extractor!', 'error');
    }
  },

  async checkSavedModel() {
    const badge = this.container.querySelector('#model-status-badge');
    const deleteBtn = this.container.querySelector('#delete-model-btn');
    const testSection = this.container.querySelector('#test-model-section');
    
    try {
      const savedModel = await window.tf.loadLayersModel('indexeddb://asl-sign-model');
      if (savedModel) {
        this.model = savedModel;
        window.aslTrainedModel = savedModel;
        window.aslLabels = KAGGLE_ASL_CLASSES;
        
        badge.textContent = 'ACTIVE PRE-TRAINED MODEL FOUND';
        badge.style.background = 'rgba(34, 197, 94, 0.15)';
        badge.style.borderColor = 'var(--primary-light)';
        badge.style.color = 'var(--primary-light)';
        
        deleteBtn.style.display = 'inline-flex';
        testSection.style.display = 'block';
        this.initTestCamera();
      }
    } catch (err) {
      badge.textContent = 'NO PRE-TRAINED MODEL LOADED';
      badge.style.background = 'rgba(239, 68, 68, 0.15)';
      badge.style.borderColor = 'var(--emergency)';
      badge.style.color = 'var(--emergency)';
      
      deleteBtn.style.display = 'none';
      testSection.style.display = 'none';
    }
  },

  async startTraining() {
    if (this.isTraining || !this.dataset) return;
    this.isTraining = true;

    const trainBtn = this.container.querySelector('#train-btn');
    const saveBtn = this.container.querySelector('#save-model-btn');
    const progressPanel = this.container.querySelector('#progress-panel');
    const placeholder = this.container.querySelector('#chart-placeholder');
    
    trainBtn.setAttribute('disabled', 'true');
    trainBtn.textContent = 'Training Model...';
    progressPanel.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    
    this.lossHistory = [];
    this.accuracyHistory = [];
    this.drawChart();

    const epochs = parseInt(this.container.querySelector('#cfg-epochs').value);
    const batchSize = parseInt(this.container.querySelector('#cfg-batch-size').value);
    const learningRate = parseFloat(this.container.querySelector('#cfg-learning-rate').value);

    this.updateStatus('Loading Kaggle training features...', 10);
    await new Promise(resolve => setTimeout(resolve, 50));

    const trainSamples = this.dataset.train;
    const xs = trainSamples.map(s => s.landmarks);
    const ys = trainSamples.map(s => s.label);

    const tf = window.tf;
    const inputTensor = tf.tensor2d(xs);
    const labelsOneHot = tf.oneHot(tf.tensor1d(ys, 'int32'), KAGGLE_ASL_CLASSES.length);

    this.updateStatus('Compiling custom Neural Network model...', 25);
    await new Promise(resolve => setTimeout(resolve, 50));

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [63], units: 128, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: KAGGLE_ASL_CLASSES.length, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.updateStatus('Fitting dataset epochs...', 35);
    
    try {
      await model.fit(inputTensor, labelsOneHot, {
        epochs: epochs,
        batchSize: batchSize,
        validationSplit: 0.15,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const currentEpoch = epoch + 1;
            const progress = 35 + Math.round((currentEpoch / epochs) * 65);
            
            this.lossHistory.push(logs.loss);
            this.accuracyHistory.push(logs.acc);
            
            this.updateStatus(
              `Training Epoch ${currentEpoch}/${epochs}`,
              progress,
              logs.loss.toFixed(4),
              logs.acc.toFixed(4)
            );
            
            this.drawChart();
            await tf.nextFrame();
          }
        }
      });

      inputTensor.dispose();
      labelsOneHot.dispose();

      this.model = model;
      this.updateStatus('Training completed!', 100, this.lossHistory[this.lossHistory.length - 1].toFixed(4), this.accuracyHistory[this.accuracyHistory.length - 1].toFixed(4));
      
      Toast.show('ASL model training completed!');
      saveBtn.style.display = 'inline-flex';
      saveBtn.removeAttribute('disabled');
      
      await this.saveModel();
      
    } catch (err) {
      console.error(err);
      Toast.show('Model training failed: ' + err.message, 'error');
    } finally {
      this.isTraining = false;
      trainBtn.removeAttribute('disabled');
      trainBtn.innerHTML = `<span class="material-symbols-outlined">rocket_launch</span> Start Model Training`;
    }
  },

  updateStatus(statusText, progressPercent, loss = '--', acc = '--') {
    this.container.querySelector('#progress-status').textContent = statusText;
    this.container.querySelector('#progress-percent').textContent = `${progressPercent}%`;
    this.container.querySelector('#progress-bar-fill').style.width = `${progressPercent}%`;
    this.container.querySelector('#progress-loss').textContent = loss;
    this.container.querySelector('#progress-acc').textContent = acc;
  },

  drawChart() {
    const ctx = this.chartCtx;
    const canvas = this.chartCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.fillText('0', padding - 12, canvas.height - padding + 4);
    ctx.fillText('1.0', padding - 18, padding + 4);
    ctx.fillText('Epochs', canvas.width / 2 - 15, canvas.height - 10);

    const totalEpochs = Math.max(10, this.lossHistory.length);
    const getX = (index) => padding + (index / (totalEpochs - 1)) * width;
    const getY = (val) => canvas.height - padding - Math.min(1.0, Math.max(0, val)) * height;

    if (this.lossHistory.length > 1) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(this.lossHistory[0]));
      for (let i = 1; i < this.lossHistory.length; i++) ctx.lineTo(getX(i), getY(this.lossHistory[i]));
      ctx.stroke();
    }

    if (this.accuracyHistory.length > 1) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(this.accuracyHistory[0]));
      for (let i = 1; i < this.accuracyHistory.length; i++) ctx.lineTo(getX(i), getY(this.accuracyHistory[i]));
      ctx.stroke();
    }

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvas.width - 80, 10, 8, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Loss', canvas.width - 68, 16);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(canvas.width - 80, 22, 8, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Accuracy', canvas.width - 68, 28);
  },

  async saveModel() {
    if (!this.model) return;
    try {
      await this.model.save('indexeddb://asl-sign-model');
      window.aslTrainedModel = this.model;
      window.aslLabels = KAGGLE_ASL_CLASSES;
      
      Toast.show(i18n.t('model_saved'));
      await this.checkSavedModel();
    } catch (err) {
      console.error(err);
      Toast.show('Error saving model: ' + err.message, 'error');
    }
  },

  async deleteModel() {
    try {
      await window.tf.io.removeModel('indexeddb://asl-sign-model');
      this.model = null;
      window.aslTrainedModel = null;
      window.aslLabels = null;
      Toast.show('Pre-trained model deleted.');
      this.destroyCamera();
      await this.checkSavedModel();
    } catch (err) {
      console.error(err);
      Toast.show('Failed to delete saved model.', 'error');
    }
  },

  initTestCamera() {
    this.destroyCamera();
    
    const camContainer = this.container.querySelector('#test-camera-placeholder');
    if (!camContainer) return;
    
    this.cameraComp = new CameraComponent(camContainer);
    this.cameraComp.init().then(() => {
      this.startVerificationLoop();
    }).catch(err => {
      console.warn('Camera failed to start in verification mode:', err);
    });
  },

  normalizeLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;
    const wrist = landmarks[0];
    const shifted = landmarks.map(lm => ({
      x: lm.x - wrist.x,
      y: lm.y - wrist.y,
      z: lm.z - wrist.z
    }));
    
    let maxDist = 0;
    for (const lm of shifted) {
      const d = Math.hypot(lm.x, lm.y, lm.z);
      if (d > maxDist) maxDist = d;
    }
    
    if (maxDist === 0) maxDist = 1;
    
    const flattened = [];
    for (const lm of shifted) {
      flattened.push(lm.x / maxDist);
      flattened.push(lm.y / maxDist);
      flattened.push(lm.z / maxDist);
    }
    return flattened;
  },

  startVerificationLoop() {
    if (this.testInterval) clearInterval(this.testInterval);
    const predictWordLabel = this.container.querySelector('#test-predict-word');
    const barsContainer = this.container.querySelector('#prediction-bars-list');

    this.testInterval = setInterval(async () => {
      if (!this.cameraComp || !this.cameraComp.isAiActive) return;
      const canvas = this.cameraComp.canvasElement;
      if (!canvas) return;

      if (this.cameraComp.hands && !this.cameraComp.hasCustomVerificationHook) {
        this.cameraComp.hasCustomVerificationHook = true;
        const originalResultsHandler = this.cameraComp.hands.onResults;
        
        this.cameraComp.hands.onResults((results) => {
          originalResultsHandler.call(this.cameraComp, results);
          
          const landmarks = results.multiHandLandmarks;
          if (landmarks && landmarks.length > 0) {
            const input = this.normalizeLandmarks(landmarks[0]);
            if (input && this.model) {
              window.tf.tidy(() => {
                const inputTensor = window.tf.tensor2d([input]);
                const prediction = this.model.predict(inputTensor);
                const scores = prediction.dataSync();
                
                const sortedWithIndices = Array.from(scores)
                  .map((score, index) => ({ score, index }))
                  .sort((a, b) => b.score - a.score);
                
                barsContainer.innerHTML = '';
                const topPrediction = sortedWithIndices[0];
                predictWordLabel.textContent = `${KAGGLE_ASL_CLASSES[topPrediction.index].toUpperCase()} (${Math.round(topPrediction.score * 100)}%)`;
                
                sortedWithIndices.slice(0, 5).forEach(item => {
                  const percent = Math.round(item.score * 100);
                  const name = KAGGLE_ASL_CLASSES[item.index];
                  
                  const row = document.createElement('div');
                  row.style.cssText = 'margin-bottom: 0.5rem;';
                  row.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.15rem; color:var(--text-primary);">
                      <span style="text-transform: capitalize; font-weight:600;">${name}</span>
                      <span>${percent}%</span>
                    </div>
                    <div style="height:6px; background: rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
                      <div style="height:100%; width:${percent}%; background: ${item.index === topPrediction.index ? 'var(--primary-light)' : 'rgba(148, 163, 184, 0.4)'}; border-radius:3px;"></div>
                    </div>
                  `;
                  barsContainer.appendChild(row);
                });
              });
            }
          } else {
            predictWordLabel.textContent = '---';
            barsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">No hand detected...</span>`;
          }
        });
      }
    }, 200);
  },

  destroyCamera() {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    if (this.cameraComp) {
      this.cameraComp.destroy();
      this.cameraComp = null;
    }
  },

  destroy() {
    this.destroyCamera();
  }
};

export default ModelTrainerPage;
