/**
 * SilentCare AI - Camera Stream Utilities
 * Manages navigator.mediaDevices.getUserMedia lifecycle, camera switching,
 * mirror modes, and proper clean-up of resources.
 */

class CameraService {
  constructor() {
    this.activeStream = null;
  }

  /**
   * Request media permission and bind user camera stream to a HTML video element.
   * @param {HTMLVideoElement} videoElement - Target element to stream camera feed
   * @param {string} facingMode - 'user' (front camera) or 'environment' (back camera)
   * @returns {Promise<MediaStream>} Resolves with the streaming tracks
   */
  async startStream(videoElement, facingMode = 'user') {
    // Release any previous camera resource first
    this.stopStream(videoElement);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Your browser does not support camera access APIs.');
    }

    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      },
      audio: false // No audio needed for sign capture
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      
      if (videoElement) {
        videoElement.srcObject = stream;
        // Wait for loaded metadata to guarantee playback starts
        videoElement.onloadedmetadata = () => {
          videoElement.play().catch(err => console.error('Video play error:', err));
        };
      }
      
      return stream;
    } catch (error) {
      console.error('Camera starting error:', error);
      // Fallback: try default webcam ignoring facing mode constraints
      if (facingMode === 'user') {
        console.warn('Front camera failed. Attempting default backup camera...');
        try {
          const fallbackConstraints = { video: true, audio: false };
          const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          this.activeStream = stream;
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
              videoElement.play().catch(e => console.error(e));
            };
          }
          return stream;
        } catch (fallbackError) {
          throw new Error(this.getReadableErrorMessage(fallbackError));
        }
      }
      throw new Error(this.getReadableErrorMessage(error));
    }
  }

  /**
   * Stop active streaming tracks and release the camera capture hardware
   * @param {HTMLVideoElement} videoElement - Video element to disconnect
   */
  stopStream(videoElement) {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Camera track ${track.label} stopped`);
      });
      this.activeStream = null;
    }
    
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  /**
   * Convert MediaDevices API errors into human readable messages
   */
  getReadableErrorMessage(error) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera access was blocked by the user. Please update browser site permissions.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera hardware found on this device.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Camera is already in use by another app or browser tab.';
      case 'OverconstrainedError':
        return 'Requested camera settings are not supported by your device.';
      default:
        return error.message || 'An unknown camera error occurred.';
    }
  }
}

export const Camera = new CameraService();
export default Camera;
