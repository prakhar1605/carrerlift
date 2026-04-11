/**
 * virtualScroll.js
 * Renders only visible job cards — huge performance boost for 1000+ items
 *
 * How it works:
 * - Keeps a "phantom" div with full height so scrollbar looks correct
 * - Only renders ~20 cards visible on screen at any time
 * - As user scrolls, old cards are replaced with new ones
 */

const ITEM_HEIGHT   = 200; // estimated card height in px
const BUFFER        = 5;   // extra items above/below viewport

export class VirtualScroll {
  constructor(container, options = {}) {
    this.container  = container;
    this.items      = [];      // full array of HTML strings
    this.itemHeight = options.itemHeight || ITEM_HEIGHT;
    this.buffer     = options.buffer     || BUFFER;

    // Outer wrapper — holds phantom spacer + rendered items
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = 'position:relative;width:100%;';

    // Phantom div — gives correct scrollbar height
    this.phantom = document.createElement('div');
    this.phantom.style.cssText = 'position:absolute;top:0;left:0;width:1px;visibility:hidden;pointer-events:none;';

    // Render area — holds actual visible cards
    this.renderArea = document.createElement('div');
    this.renderArea.style.cssText = 'position:relative;will-change:transform;';

    this.wrapper.appendChild(this.phantom);
    this.wrapper.appendChild(this.renderArea);
    this.container.appendChild(this.wrapper);

    // Find scroll parent — usually window or .container div
    this.scrollEl = this._findScrollParent(container);
    this._onScroll = this._render.bind(this);
    this.scrollEl.addEventListener('scroll', this._onScroll, { passive: true });

    this._lastStart = -1;
    this._lastEnd   = -1;
  }

  /** Set new items array and re-render */
  setItems(htmlStrings) {
    this.items = htmlStrings || [];
    this._lastStart = -1; // force full re-render
    this._updatePhantom();
    this._render();
  }

  /** Update phantom height based on item count */
  _updatePhantom() {
    this.phantom.style.height = `${this.items.length * this.itemHeight}px`;
    this.wrapper.style.minHeight = `${this.items.length * this.itemHeight}px`;
  }

  /** Main render — called on scroll */
  _render() {
    if (!this.items.length) {
      this.renderArea.innerHTML = '';
      return;
    }

    const scrollTop    = this._getScrollTop();
    const viewHeight   = window.innerHeight;
    const totalItems   = this.items.length;

    // Which items should be visible?
    let startIdx = Math.floor(scrollTop / this.itemHeight) - this.buffer;
    let endIdx   = Math.ceil((scrollTop + viewHeight) / this.itemHeight) + this.buffer;
    startIdx     = Math.max(0, startIdx);
    endIdx       = Math.min(totalItems - 1, endIdx);

    // Skip re-render if same range
    if (startIdx === this._lastStart && endIdx === this._lastEnd) return;
    this._lastStart = startIdx;
    this._lastEnd   = endIdx;

    // Offset so cards appear at correct position
    const offsetTop = startIdx * this.itemHeight;
    this.renderArea.style.transform = `translateY(${offsetTop}px)`;

    // Render only visible slice
    this.renderArea.innerHTML = this.items.slice(startIdx, endIdx + 1).join('');
  }

  /** Get scroll position relative to our container */
  _getScrollTop() {
    if (this.scrollEl === window) {
      const rect = this.container.getBoundingClientRect();
      return Math.max(0, -rect.top);
    }
    return this.scrollEl.scrollTop;
  }

  _findScrollParent(el) {
    let p = el.parentElement;
    while (p) {
      const style = getComputedStyle(p);
      if (['auto', 'scroll', 'overlay'].includes(style.overflowY)) return p;
      p = p.parentElement;
    }
    return window;
  }

  /** Clean up when switching tabs etc */
  destroy() {
    this.scrollEl.removeEventListener('scroll', this._onScroll);
    if (this.wrapper.parentNode) this.wrapper.parentNode.removeChild(this.wrapper);
  }
}
