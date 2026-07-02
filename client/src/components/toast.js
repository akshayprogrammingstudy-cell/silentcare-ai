/**
 * SilentCare AI - Toast Component
 * Displays lightweight popup alert notifications at the bottom/top of the page.
 */

export class Toast {
  /**
   * Show a toast message
   * @param {string} message - Text notification to display
   * @param {string} type - 'success' | 'error' | 'warning'
   * @param {number} duration - Milliseconds before auto-close
   */
  static show(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Select suitable icons
    let icon = 'check_circle';
    if (type === 'error') icon = 'cancel';
    if (type === 'warning') icon = 'warning';

    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 1.25rem;">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Dismiss Alert">
        <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
      </button>
    `;

    container.appendChild(toast);

    // Manual dismissal click handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismissal timeout
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  /**
   * Fades out and deletes a toast element from the DOM
   */
  static dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    
    // Trigger fade-out animation styles
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    // Remove element after transition completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 350);
  }
}

export default Toast;
