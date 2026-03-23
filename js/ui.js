/**
 * ui.js
 * Generic UI utilities:
 *   - showStatus   (toast notifications)
 *   - typewriter   (streaming text effect)
 *   - thinking steps animator
 */

/* ─────────────────────────────────────────────
   STATUS TOASTS
───────────────────────────────────────────── */

/**
 * Show a temporary status toast.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 */
export function showStatus(message, type = 'info') {
  const container = document.getElementById('statusContainer');
  if (!container) return;

  const iconMap = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };

  const el = document.createElement('div');
  el.className = `status-alert ${type}`;
  el.innerHTML = `<i class="fas fa-${iconMap[type]}"></i><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity    = '0';
    setTimeout(() => el.remove(), 300);
  }, 5000);
}

/* ─────────────────────────────────────────────
   TYPEWRITER EFFECT
───────────────────────────────────────────── */

/**
 * Type text character-by-character into a DOM element.
 * Appends a blinking cursor, removes it when done.
 *
 * @param {HTMLElement} el
 * @param {string}      text
 * @param {number}      [speed=8]  ms per character
 */
export async function typewriterEffect(el, text, speed = 8) {
  el.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  el.appendChild(cursor);

  for (const char of text) {
    el.insertBefore(document.createTextNode(char), cursor);
    await delay(speed);
  }

  cursor.remove();
}

/* ─────────────────────────────────────────────
   THINKING STEPS ANIMATOR
───────────────────────────────────────────── */

/**
 * Animate a sequence of "thinking step" DOM elements.
 * Each step activates in order; previous step gets ✓ (done) class.
 *
 * @param {string}   idPrefix     e.g. 'step' → looks for step1, step2 …
 * @param {number}   count        number of steps
 * @param {number}   [delayMs=600]
 */
export async function animateThinkingSteps(idPrefix, count, delayMs = 600) {
  for (let i = 1; i <= count; i++) {
    const current  = document.getElementById(`${idPrefix}${i}`);
    const previous = document.getElementById(`${idPrefix}${i - 1}`);

    if (previous && i > 1) {
      previous.classList.remove('active');
      previous.classList.add('done');
      const icon = previous.querySelector('.step-icon');
      if (icon) icon.textContent = '✓';
    }

    if (current) current.classList.add('active');
    await delay(delayMs);
  }
}

/**
 * Mark all steps in a thinking box as complete and change the orb to green.
 *
 * @param {string} idPrefix   e.g. 'step'
 * @param {number} count
 * @param {string} boxId      container element id
 */
export function markThinkingComplete(idPrefix, count, boxId) {
  const last = document.getElementById(`${idPrefix}${count}`);
  if (last) { last.classList.remove('active'); last.classList.add('done'); const icon = last.querySelector('.step-icon'); if (icon) icon.textContent = '✓'; }

  const box = document.getElementById(boxId);
  if (!box) return;

  const label = box.querySelector('.thinking-label');
  const orb   = box.querySelector('.thinking-orb');
  if (label) label.textContent = 'Analysis Complete';
  if (orb) {
    orb.style.animation  = 'none';
    orb.style.background = 'var(--green)';
    orb.style.boxShadow  = '0 0 8px rgba(16,185,129,0.8)';
  }
}

/**
 * Reset all thinking steps to their initial state.
 *
 * @param {string}   idPrefix
 * @param {number}   count
 * @param {string[]} defaultIcons  emoji per step
 * @param {string}   boxId
 */
export function resetThinkingSteps(idPrefix, count, defaultIcons, boxId) {
  for (let i = 1; i <= count; i++) {
    const el = document.getElementById(`${idPrefix}${i}`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    const icon = el.querySelector('.step-icon');
    if (icon) icon.textContent = defaultIcons[i - 1] || '';
  }

  const box = document.getElementById(boxId);
  if (!box) return;
  const label = box.querySelector('.thinking-label');
  const orb   = box.querySelector('.thinking-orb');
  if (label) label.textContent = 'AI is thinking...';
  if (orb) {
    orb.style.animation  = '';
    orb.style.background = '';
    orb.style.boxShadow  = '';
  }
}

/* ── Internal helper ── */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
