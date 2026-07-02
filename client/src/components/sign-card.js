import { Fingerspelling } from '../utils/fingerspelling.js';

export const SignCard = {
  /**
   * Generates a sign instruction card HTML template
   * @param {string} word - The target word
   * @param {Array} steps - The structural guidance steps
   * @returns {string} HTML string
   */
  render(word, steps = []) {
    let stepsListHtml = '';
    
    if (steps && steps.length > 0) {
      steps.forEach((step, idx) => {
        stepsListHtml += `
          <div class="fallback-step" style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="fallback-step-num" style="background: var(--accent);">${idx + 1}</span>
            <span class="fallback-step-text" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${step}</span>
          </div>
        `;
      });
    } else {
      stepsListHtml = `
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          No custom gesture data available for "${word}". Spell out the word in sign letters.
        </div>
      `;
    }

    const isFallbackWord = steps && steps.some(s => s.toLowerCase().includes('spell') || s.toLowerCase().includes('letter'));
    const spellingGridHtml = isFallbackWord ? `
      <div style="margin-top: 0.5rem; margin-bottom: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">Manual Fingerspelling Guide:</div>
        ${Fingerspelling.renderWordGrid(word)}
      </div>
    ` : '';

    return `
      <div class="fallback-card glass-card" style="border-left: 3px solid var(--accent); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-family: var(--font-display); font-weight: 700; color: var(--text-primary); text-transform: uppercase;">
            ${word}
          </h4>
          <span style="font-size: 0.7rem; background: var(--accent-glow); color: var(--accent-light); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--accent);">
            Fallback Card
          </span>
        </div>
        ${spellingGridHtml}
        <div class="fallback-steps-list">
          ${stepsListHtml}
        </div>
      </div>
    `;
  }
};

export default SignCard;
