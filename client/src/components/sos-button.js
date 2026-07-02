/**
 * SilentCare AI - SOS Button Component
 * Renders the giant emergency SOS button with pulse animations
 * and binds activation event handlers.
 */

export class SOSButton {
  constructor(container, onClickHandler) {
    this.container = container;
    this.onClickHandler = onClickHandler;
  }

  /**
   * Inject component into parent container
   */
  init() {
    this.render();
  }

  /**
   * Renders the button structure with animated pulsing rings
   */
  render() {
    this.container.innerHTML = `
      <div class="sos-button-container">
        <!-- Radar wave pulse lines -->
        <div class="sos-pulse-ring"></div>
        <div class="sos-pulse-ring"></div>
        <div class="sos-pulse-ring"></div>
        
        <!-- Main trigger click target -->
        <button class="sos-trigger" id="sos-main-trigger" aria-label="Trigger Emergency Distress Broadcast">
          SOS
          <span>TAP TO ALERT</span>
        </button>
      </div>
    `;

    const trigger = this.container.querySelector('#sos-main-trigger');
    trigger.addEventListener('click', () => {
      // Trigger callback if defined
      if (this.onClickHandler) {
        this.onClickHandler();
      }
    });
  }
}

export default SOSButton;
