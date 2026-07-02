/**
 * SilentCare AI - Fingerspelling SVG Generator
 * Provides elegant, modern, stylized line-art SVGs representing
 * the 26 letters of the ASL Manual Fingerspelling Alphabet (A-Z).
 * Built programmatically using inline SVGs to ensure high-performance loading.
 */

const LETTER_SVGS = {
  A: `
    <!-- Palm Base (Fist) -->
    <path class="hand-skin" d="M 35,75 Q 30,55 40,45 C 45,45 55,45 65,45 Q 70,55 65,75 Z" stroke-width="4" stroke-linejoin="round" />
    <!-- Folded Fingers -->
    <path class="hand-line" d="M 40,45 Q 40,55 45,55 M 47,45 Q 47,55 52,55 M 54,45 Q 54,55 59,55 M 61,45 Q 61,55 65,55" stroke-width="3" />
    <!-- Thumb Folded over Side -->
    <path class="hand-skin" d="M 32,55 Q 32,45 42,47 Q 48,50 48,58" stroke-width="4" stroke-linecap="round" />
  `,
  B: `
    <!-- Open Palm -->
    <path class="hand-skin" d="M 35,75 Q 35,55 40,55 C 45,55 55,55 60,55 Q 65,55 65,75 Z" stroke-width="4" />
    <!-- Extended Fingers -->
    <path class="hand-skin" d="M 40,55 V 20 C 40,16 45,16 45,20 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 46,55 V 17 C 46,13 51,13 51,17 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 52,55 V 19 C 52,15 57,15 57,19 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 58,55 V 23 C 58,19 63,19 63,23 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Thumb -->
    <path class="hand-skin" d="M 32,60 Q 42,60 48,65 Q 52,68 50,72" stroke-width="4" stroke-linecap="round" />
  `,
  C: `
    <!-- Curved Hand forming a C shape -->
    <path class="hand-skin" d="M 60,25 C 40,25 30,40 30,55 C 30,70 42,80 62,80" stroke-width="4" stroke-linecap="round" />
    <path class="hand-line" d="M 60,33 C 45,33 38,45 38,55 C 38,65 47,72 62,72" stroke-width="3" />
    <!-- Thumb Curved -->
    <path class="hand-skin" d="M 30,55 Q 35,62 50,65" stroke-width="4" stroke-linecap="round" />
  `,
  D: `
    <!-- Closed Fist Base -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 Q 65,65 65,75 Z" stroke-width="4" />
    <!-- Extended Index Finger -->
    <path class="hand-skin" d="M 40,55 V 20 C 40,16 46,16 46,20 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Fingers Touching Thumb -->
    <path class="hand-line" d="M 46,55 Q 55,42 62,55" stroke-width="3" />
    <path class="hand-line" d="M 52,55 Q 58,45 62,55" stroke-width="3" />
    <!-- Thumb Touching Folded Middle/Ring -->
    <path class="hand-skin" d="M 32,60 Q 45,55 58,58" stroke-width="4" stroke-linecap="round" />
  `,
  E: `
    <!-- Palm Base -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 Q 65,65 65,75 Z" stroke-width="4" />
    <!-- Curly/Folded Fingers -->
    <path class="hand-skin" d="M 40,55 Q 40,40 45,40 Q 48,40 48,55" stroke-width="3" />
    <path class="hand-skin" d="M 46,55 Q 46,38 51,38 Q 54,38 54,55" stroke-width="3" />
    <path class="hand-skin" d="M 52,55 Q 52,40 57,40 Q 60,40 60,55" stroke-width="3" />
    <path class="hand-skin" d="M 58,55 Q 58,43 62,43 Q 65,43 65,55" stroke-width="3" />
    <!-- Thumb Folded tight across bottom -->
    <path class="hand-skin" d="M 32,58 Q 50,58 62,64" stroke-width="4" stroke-linecap="round" />
  `,
  F: `
    <!-- Index and Thumb forming Circle, other three extended -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75" stroke-width="4" />
    <!-- Index & Thumb loop -->
    <circle class="hand-skin" cx="43" cy="55" r="10" stroke-width="4" />
    <!-- Extended Middle, Ring, Pinky -->
    <path class="hand-skin" d="M 50,50 V 22 C 50,18 55,18 55,22 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 56,50 V 24 C 56,20 61,20 61,24 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 62,50 V 28 C 62,24 67,24 67,28 V 75" stroke-width="4" stroke-linecap="round" />
  `,
  G: `
    <!-- Fist oriented sideways, Index and Thumb pointing right -->
    <path class="hand-skin" d="M 30,75 Q 30,45 50,45 C 55,45 60,45 60,75 Z" stroke-width="4" />
    <!-- Sideways extended Index -->
    <path class="hand-skin" d="M 50,48 H 85 C 89,48 89,54 85,54 H 50" stroke-width="4" stroke-linecap="round" />
    <!-- Horizontal parallel Thumb -->
    <path class="hand-skin" d="M 35,62 H 78 C 82,62 82,68 78,68 H 35" stroke-width="4" stroke-linecap="round" />
  `,
  H: `
    <!-- Sideways Fist, Index and Middle pointing right together -->
    <path class="hand-skin" d="M 30,75 Q 30,45 50,45 Z" stroke-width="4" />
    <!-- Sideways Index & Middle -->
    <path class="hand-skin" d="M 50,48 H 85 C 89,48 89,53 85,53 H 50" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 50,54 H 83 C 87,54 87,59 83,59 H 50" stroke-width="4" stroke-linecap="round" />
    <!-- Sideways Thumb folded -->
    <path class="hand-skin" d="M 32,65 Q 45,65 52,70" stroke-width="4" stroke-linecap="round" />
  `,
  I: `
    <!-- Pinky finger extended straight up, others in fist -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 60,55 V 75 Z" stroke-width="4" />
    <!-- Pinky Extended -->
    <path class="hand-skin" d="M 60,55 V 25 C 60,21 66,21 66,25 V 75" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Fingers -->
    <path class="hand-line" d="M 40,55 Q 40,65 45,65 M 47,55 Q 47,65 52,65 M 54,55 Q 54,65 58,65" stroke-width="3" />
    <!-- Thumb across index/middle -->
    <path class="hand-skin" d="M 32,60 Q 45,60 54,64" stroke-width="4" stroke-linecap="round" />
  `,
  J: `
    <!-- Pinky finger extended with a tracing arc -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 60,55 V 75 Z" stroke-width="4" />
    <!-- Pinky Extended -->
    <path class="hand-skin" d="M 60,55 V 25 C 60,21 66,21 66,25 V 75" stroke-width="4" stroke-linecap="round" />
    <!-- Swooping arrow representing 'J' hook motion -->
    <path class="hand-line" d="M 63,22 Q 78,22 78,35 Q 78,50 63,50 Q 55,50 55,42" stroke-width="3" stroke-linecap="round" />
    <!-- Arrow marker -->
    <path class="hand-line" d="M 53,44 L 55,42 L 58,45" stroke-width="3" />
  `,
  K: `
    <!-- Index and Middle up, thumb touching middle finger -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index Up -->
    <path class="hand-skin" d="M 40,55 V 20 C 40,16 46,16 46,20 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Middle Up (angled slightly right) -->
    <path class="hand-skin" d="M 47,55 L 53,23 C 54,19 60,20 59,24 L 54,55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Ring/Pinky -->
    <path class="hand-line" d="M 55,55 Q 55,65 59,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
    <!-- Thumb sticking up to touch Middle -->
    <path class="hand-skin" d="M 32,60 Q 42,52 50,38" stroke-width="4" stroke-linecap="round" />
  `,
  L: `
    <!-- Index up, Thumb left (creates L shape) -->
    <path class="hand-skin" d="M 38,75 Q 38,55 46,55 C 52,55 62,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index Up -->
    <path class="hand-skin" d="M 43,55 V 20 C 43,16 49,16 49,20 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Thumb Sideways -->
    <path class="hand-skin" d="M 40,62 H 15 C 11,62 11,68 15,68 H 40" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Middle, Ring, Pinky -->
    <path class="hand-line" d="M 50,55 Q 50,65 54,65 M 56,55 Q 56,65 60,65 M 62,55 Q 62,65 65,65" stroke-width="3" />
  `,
  M: `
    <!-- Fist, Thumb tucked under index, middle, ring -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75" stroke-width="4" />
    <!-- Folded fingers overlapping thumb -->
    <path class="hand-skin" d="M 40,55 Q 40,43 45,43 Q 48,43 48,65" stroke-width="3" />
    <path class="hand-skin" d="M 46,55 Q 46,43 51,43 Q 54,43 54,65" stroke-width="3" />
    <path class="hand-skin" d="M 52,55 Q 52,43 57,43 Q 60,43 60,65" stroke-width="3" />
    <path class="hand-skin" d="M 58,55 Q 58,45 62,45 Q 65,45 65,75" stroke-width="3" />
    <!-- Thumb tucked underneath first three fingers -->
    <path class="hand-skin" d="M 32,60 Q 48,60 54,60" stroke-width="4" stroke-linecap="round" />
  `,
  N: `
    <!-- Fist, Thumb tucked under index and middle -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75" stroke-width="4" />
    <!-- Folded fingers -->
    <path class="hand-skin" d="M 40,55 Q 40,43 45,43 Q 48,43 48,65" stroke-width="3" />
    <path class="hand-skin" d="M 46,55 Q 46,43 51,43 Q 54,43 54,65" stroke-width="3" />
    <!-- Thumb tucked underneath first two fingers -->
    <path class="hand-skin" d="M 32,60 Q 42,60 48,60" stroke-width="4" stroke-linecap="round" />
  `,
  O: `
    <!-- Fingers curved to form an 'O' with thumb -->
    <path class="hand-skin" d="M 50,25 C 33,25 25,40 25,55 C 25,70 33,80 50,80 C 67,80 75,70 75,55 C 75,40 67,25 50,25 Z" stroke-width="4" />
    <circle class="hand-skin" cx="50" cy="52" r="15" stroke-width="3" />
  `,
  P: `
    <!-- Downward pointing K-hand -->
    <path class="hand-skin" d="M 35,35 Q 35,55 42,55 C 48,55 58,55 65,55 V 35 Z" stroke-width="4" />
    <!-- Index Down -->
    <path class="hand-skin" d="M 40,55 V 85 C 40,89 46,89 46,85 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Middle Down (angled right) -->
    <path class="hand-skin" d="M 47,55 L 53,80 C 54,84 60,83 59,79 L 54,55" stroke-width="4" stroke-linecap="round" />
    <!-- Thumb touching Middle -->
    <path class="hand-skin" d="M 32,50 Q 42,58 50,70" stroke-width="4" stroke-linecap="round" />
  `,
  Q: `
    <!-- Downward pointing G-hand (sideways pinch pointing down) -->
    <path class="hand-skin" d="M 30,35 Q 30,55 50,55 Z" stroke-width="4" />
    <!-- Sideways/Down Index -->
    <path class="hand-skin" d="M 50,48 V 85 C 50,89 56,89 56,85 V 48" stroke-width="4" stroke-linecap="round" />
    <!-- Sideways/Down Thumb -->
    <path class="hand-skin" d="M 35,53 V 78 C 35,82 41,82 41,78 V 53" stroke-width="4" stroke-linecap="round" />
  `,
  R: `
    <!-- Crossed Index and Middle fingers pointing up -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Crossed Fingers (drawn with overlapping paths) -->
    <path class="hand-skin" d="M 45,55 L 42,20 C 41,16 47,16 48,20 L 43,55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 41,55 L 47,20 C 48,16 54,16 53,20 L 48,55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded ring/pinky/thumb -->
    <path class="hand-line" d="M 55,55 Q 55,65 59,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
    <path class="hand-skin" d="M 32,60 Q 45,60 54,64" stroke-width="4" stroke-linecap="round" />
  `,
  S: `
    <!-- Tight Fist, Thumb closed over front index/middle -->
    <path class="hand-skin" d="M 35,75 Q 30,55 40,45 C 45,45 55,45 65,45 Q 70,55 65,75 Z" stroke-width="4" />
    <!-- Folded Fingers -->
    <path class="hand-line" d="M 40,45 Q 40,55 45,55 M 47,45 Q 47,55 52,55 M 54,45 Q 54,55 59,55 M 61,45 Q 61,55 65,55" stroke-width="3" />
    <!-- Thumb locked across center -->
    <path class="hand-skin" d="M 32,58 Q 50,46 62,56" stroke-width="4" stroke-linecap="round" />
  `,
  T: `
    <!-- Fist, Thumb tucked between Index and Middle -->
    <path class="hand-skin" d="M 35,75 Q 30,55 40,45 C 45,45 55,45 65,45 Q 70,55 65,75 Z" stroke-width="4" />
    <!-- Folded Index overlapping thumb -->
    <path class="hand-skin" d="M 40,45 Q 40,55 45,55" stroke-width="3" />
    <!-- Thumb tucked underneath index -->
    <path class="hand-skin" d="M 32,58 Q 44,52 46,65" stroke-width="4" stroke-linecap="round" />
    <!-- Other Folded Fingers -->
    <path class="hand-line" d="M 48,45 Q 48,55 53,55 M 55,45 Q 55,55 60,55 M 62,45 Q 62,55 65,55" stroke-width="3" />
  `,
  U: `
    <!-- Index and Middle pointing straight up, touching -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index and Middle touching up -->
    <path class="hand-skin" d="M 42,55 V 20 C 42,16 47,16 47,20 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 48,55 V 20 C 48,16 53,16 53,20 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Ring/Pinky -->
    <path class="hand-line" d="M 55,55 Q 55,65 59,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
    <!-- Folded Thumb -->
    <path class="hand-skin" d="M 32,60 Q 45,60 54,64" stroke-width="4" stroke-linecap="round" />
  `,
  V: `
    <!-- Index and Middle pointing straight up, apart (V sign) -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index pointing up left -->
    <path class="hand-skin" d="M 42,55 L 35,22 C 34,18 40,16 42,20 L 46,55" stroke-width="4" stroke-linecap="round" />
    <!-- Middle pointing up right -->
    <path class="hand-skin" d="M 48,55 L 56,22 C 57,18 63,20 61,24 L 54,55" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Ring/Pinky -->
    <path class="hand-line" d="M 55,55 Q 55,65 59,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
    <!-- Folded Thumb -->
    <path class="hand-skin" d="M 32,60 Q 45,60 54,64" stroke-width="4" stroke-linecap="round" />
  `,
  W: `
    <!-- Index, Middle, Ring pointing up, Pinky/Thumb touch -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75" stroke-width="4" />
    <!-- 3 Fingers Up -->
    <path class="hand-skin" d="M 40,55 V 20 C 40,16 45,16 45,20 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 46,55 V 17 C 46,13 51,13 51,17 V 55" stroke-width="4" stroke-linecap="round" />
    <path class="hand-skin" d="M 52,55 V 20 C 52,16 57,16 57,20 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Pinky & Thumb touching -->
    <circle class="hand-skin" cx="55" cy="62" r="7" stroke-width="3" />
    <path class="hand-skin" d="M 32,60 Q 45,68 50,64" stroke-width="3" />
  `,
  X: `
    <!-- Index hooked, others closed -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index Hooked -->
    <path class="hand-skin" d="M 40,55 C 40,40 50,38 46,48" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Fingers -->
    <path class="hand-line" d="M 47,55 Q 47,65 52,65 M 54,55 Q 54,65 58,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
    <!-- Thumb Folded -->
    <path class="hand-skin" d="M 32,60 Q 45,60 54,64" stroke-width="4" stroke-linecap="round" />
  `,
  Y: `
    <!-- Pinky and Thumb extended, others in fist -->
    <path class="hand-skin" d="M 38,75 Q 38,55 46,55 C 52,55 58,55 60,55 V 75 Z" stroke-width="4" />
    <!-- Thumb Extended Left -->
    <path class="hand-skin" d="M 40,62 H 15 C 11,62 11,68 15,68 H 40" stroke-width="4" stroke-linecap="round" />
    <!-- Pinky Extended Right -->
    <path class="hand-skin" d="M 60,55 L 82,45 C 86,43 89,48 85,51 L 62,68" stroke-width="4" stroke-linecap="round" />
    <!-- Folded Middle, Ring, Pinky -->
    <path class="hand-line" d="M 47,55 Q 47,65 51,65 M 53,55 Q 53,65 57,65 M 58,55 Q 58,65 60,65" stroke-width="3" />
  `,
  Z: `
    <!-- Index tracing a 'Z' -->
    <path class="hand-skin" d="M 35,75 Q 35,55 42,55 C 48,55 58,55 65,55 V 75 Z" stroke-width="4" />
    <!-- Index Up -->
    <path class="hand-skin" d="M 40,55 V 25 C 40,21 46,21 46,25 V 55" stroke-width="4" stroke-linecap="round" />
    <!-- Z Path overlay representing movement -->
    <path class="hand-line" d="M 35,15 H 65 L 35,38 H 65" stroke-width="3" stroke-linecap="round" />
    <!-- Folded Middle, Ring, Pinky -->
    <path class="hand-line" d="M 48,55 Q 48,65 52,65 M 54,55 Q 54,65 58,65 M 60,55 Q 60,65 64,65" stroke-width="3" />
  `
};

export const Fingerspelling = {
  /**
   * Retrieve the raw inner SVG paths for a fingerspelling letter
   * @param {string} char 
   * @returns {string}
   */
  getLetterPaths(char) {
    return LETTER_SVGS[char.toUpperCase()] || '';
  },

  /**
   * Generates a stylized outline SVG element representing a fingerspell letter
   * @param {string} char - The single letter A-Z
   * @param {number} size - Square size of the box (default 80)
   * @returns {string} SVG HTML string
   */
  getLetterSVG(char, size = 80) {
    const letter = char.toUpperCase();
    const innerContent = LETTER_SVGS[letter] || `
      <!-- Fallback when gesture path not defined -->
      <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="4 4" />
      <text x="50" y="58" font-family="sans-serif" font-weight="bold" font-size="24" fill="currentColor" text-anchor="middle">?</text>
    `;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="fingerspell-svg" style="color: var(--text-primary); transition: all 0.3s ease; display: inline-block;">
        <defs>
          <linearGradient id="grad-spelling" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--accent-glow)" />
            <stop offset="100%" stop-color="rgba(30, 41, 59, 0.5)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="96" height="96" rx="12" fill="url(#grad-spelling)" stroke="var(--border-color)" stroke-width="2" />
        <g transform="translate(0, -5)">
          ${innerContent}
        </g>
        <text x="50" y="90" font-family="var(--font-display)" font-weight="bold" font-size="14" fill="var(--accent-light)" text-anchor="middle">${letter}</text>
      </svg>
    `;
  },

  /**
   * Render a complete grid of letters for a spelling fallback word
   * @param {string} word - Target word
   * @param {string} activeLetter - Letter to highlight as active
   * @returns {string} HTML string of layout
   */
  renderWordGrid(word, activeLetter = '') {
    const letters = word.toUpperCase().replace(/[^A-Z]/g, '').split('');
    let html = `
      <div class="fingerspell-word-grid" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
    `;

    letters.forEach((char, idx) => {
      const isActive = char === activeLetter.toUpperCase();
      const activeStyle = isActive ? 'style="border-color: var(--accent); transform: scale(1.05); filter: drop-shadow(0 0 8px var(--accent-glow));"' : '';
      
      html += `
        <div class="fingerspell-box ${isActive ? 'active' : ''}" ${activeStyle} data-char="${char}" data-idx="${idx}">
          ${this.getLetterSVG(char, 72)}
        </div>
      `;
    });

    html += '</div>';
    return html;
  }
};

export default Fingerspelling;
