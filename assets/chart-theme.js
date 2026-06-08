/* ============================================================
   Skypoint chart theme — drop-in helper for Chart.js
   ------------------------------------------------------------
   Framework-agnostic. Reads the design-system tokens from CSS
   at runtime (so light/dark "just works") and hands back a
   palette + sensible chart defaults. No build step required.

   Requires: tokens.css loaded on the page (provides --chart-1..8,
   --stroke-faint, --fg-subtle, --fg-secondary, --bg-surface,
   --fg-disabled, --font-base).

   Usage (vanilla / UMD Chart.js):
     SkypointChartTheme.apply(Chart);            // set global defaults once
     const t = SkypointChartTheme.read();        // { palette, grid, axis, ... }
     new Chart(el, { type:'line', data, options: {
       plugins: { legend: t.legendBottom },
       scales: t.scales()                        // grid/axis presets
     }});

   Usage (ES module):
     import { apply, read, topNPlusOther } from './chart-theme.js';
   ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // CommonJS
  root.SkypointChartTheme = api;                                          // browser global
})(typeof self !== 'undefined' ? self : this, function () {

  // Read a CSS custom property off :root (trimmed).
  function token(name, el) {
    const scope = el || document.documentElement;
    return getComputedStyle(scope).getPropertyValue(name).trim();
  }

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Snapshot the current token values. Call again after a theme switch
  // (data-theme change) to pick up the new light/dark palette.
  function read(el) {
    const t = n => token(n, el);
    const palette = [
      t('--chart-1'), t('--chart-2'), t('--chart-3'), t('--chart-4'),
      t('--chart-5'), t('--chart-6'), t('--chart-7'), t('--chart-8')
    ];
    const grid    = t('--stroke-faint');
    const axis    = t('--fg-subtle');
    const label   = t('--fg-secondary');
    const surface = t('--bg-surface');
    const neutral = t('--fg-disabled');   // the "Other" / long-tail series
    const font    = t('--font-base');

    const legendBottom = {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true, pointStyle: 'circle',
        boxWidth: 8, boxHeight: 8, padding: 16, color: label
      }
    };

    // Cartesian scale preset (line/bar). Pass { stacked:true } for stacks,
    // { xGrid:false } to drop vertical gridlines (common on bar charts).
    function scales(opts) {
      const o = opts || {};
      return {
        x: {
          stacked: !!o.stacked,
          grid: { display: o.xGrid === false ? false : true, color: grid },
          ticks: { color: axis },
          border: { color: grid }
        },
        y: {
          stacked: !!o.stacked,
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: axis, precision: 0 },
          border: { display: false }
        }
      };
    }

    return {
      palette, grid, axis, label, surface, neutral, font,
      reducedMotion: prefersReducedMotion(),
      legendBottom, scales
    };
  }

  // Set Chart.js global defaults once. Safe to call on each render.
  function apply(Chart, el) {
    const t = read(el);
    Chart.defaults.font.family = t.font;
    Chart.defaults.font.size = 12;
    Chart.defaults.color = t.label;
    Chart.defaults.animation = t.reducedMotion
      ? false
      : { duration: 250, easing: 'easeOutQuart' };
    Chart.defaults.plugins = Chart.defaults.plugins || {};
    // Merge (not replace) so Chart's built-in legend defaults (display, onClick, etc.) survive.
    Chart.defaults.plugins.legend.position = 'bottom';
    Object.assign(Chart.defaults.plugins.legend.labels, t.legendBottom.labels);
    return t;
  }

  /* Cap a categorical series list at `max` colors (default 8) by keeping the
     top N-1 by total value and folding the rest into a neutral "Other".
     Rule §12: color stops being distinguishable past ~8.

       items: [{ label, data:[…] }, …]   // data = per-category numbers
       returns: [{ label, data, isOther? }, …]  // length <= max
     The "Other" entry sums the long tail element-wise; render it with
     theme.neutral so it never competes with a real series color. */
  function topNPlusOther(items, max) {
    const cap = max || 8;
    if (items.length <= cap) return items.slice();

    const sum = it => it.data.reduce((a, b) => a + (b || 0), 0);
    const sorted = items.slice().sort((a, b) => sum(b) - sum(a));
    const keep = sorted.slice(0, cap - 1);
    const tail = sorted.slice(cap - 1);

    const len = items[0] ? items[0].data.length : 0;
    const otherData = new Array(len).fill(0);
    tail.forEach(it => it.data.forEach((val, i) => { otherData[i] += (val || 0); }));

    keep.push({ label: 'Other', data: otherData, isOther: true });
    return keep;
  }

  return { read, apply, token, topNPlusOther, prefersReducedMotion };
});
