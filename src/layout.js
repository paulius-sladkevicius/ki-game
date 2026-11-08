'use strict';
// Screen layout: fits the 16:9 canvas into the visible viewport.
// On touch devices the buttons get their own space (side columns or a bottom bar)
// so they never cover the game or fall off the screen.

const Layout = (() => {
  function viewport() {
    const vv = window.visualViewport;
    return { w: Math.floor(vv ? vv.width : window.innerWidth), h: Math.floor(vv ? vv.height : window.innerHeight) };
  }

  function fit(aw, ah) {
    const w = Math.max(0, Math.min(aw, ah * 16 / 9));
    return { w, h: w * 9 / 16 };
  }

  function place(el, css) {
    for (const k of ['left', 'right', 'top', 'bottom']) el.style[k] = css[k] !== undefined ? css[k] + 'px' : '';
  }

  function apply() {
    const canvas = document.getElementById('game');
    const touch = document.getElementById('touch');
    const { w: vw, h: vh } = viewport();
    const isTouch = !touch.classList.contains('hidden');

    if (!isTouch) {
      const c = fit(vw, vh);
      setCanvas(canvas, (vw - c.w) / 2, (vh - c.h) / 2, c.w, c.h);
      return;
    }

    const btn = Math.round(clamp(Math.min(vw, vh) * 0.13, 40, 64));
    const gap = Math.round(btn * 0.16);
    const m = 10;                               // edge margin
    const leftW = 3 * btn + 2 * gap + 2 * m;    // d-pad: 3 columns
    const rightW = 2 * btn + gap + 2 * m;       // actions: 2 columns
    const padH = 3 * btn + 2 * gap;             // d-pad: 3 rows
    const barH = padH + 2 * m;

    // Option A: buttons in columns left and right of the game.
    const side = fit(vw - leftW - rightW, vh);
    // Option B: buttons in a bar below the game.
    const bottom = fit(vw, vh - barH);

    touch.style.setProperty('--btn', btn + 'px');
    touch.style.setProperty('--gap', gap + 'px');
    const left = touch.querySelector('.pad.left');
    const right = touch.querySelector('.pad.right');
    const pause = document.getElementById('pauseBtn');

    if (side.w >= bottom.w) {
      const x = leftW + (vw - leftW - rightW - side.w) / 2;
      setCanvas(canvas, x, (vh - side.h) / 2, side.w, side.h);
      place(left, { left: m, bottom: m + Math.max(0, (vh - padH) * 0.15) });
      place(right, { right: m, bottom: m + Math.max(0, (vh - padH) * 0.15) });
      place(pause, { right: m + (rightW - 2 * m - 40) / 2, top: m });
    } else {
      setCanvas(canvas, (vw - bottom.w) / 2, Math.max(0, (vh - barH - bottom.h) / 2), bottom.w, bottom.h);
      place(left, { left: m + 6, bottom: m });
      place(right, { right: m + 6, bottom: m + btn / 2 });
      place(pause, { left: vw / 2 - 20, bottom: m + padH / 2 - 20 });
    }
  }

  function setCanvas(canvas, x, y, w, h) {
    canvas.style.left = Math.round(x) + 'px';
    canvas.style.top = Math.round(y) + 'px';
    canvas.style.width = Math.round(w) + 'px';
    canvas.style.height = Math.round(h) + 'px';
  }

  function init() {
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', () => setTimeout(apply, 200));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', apply);
    document.addEventListener('fullscreenchange', () => setTimeout(apply, 100));
  }

  return { init, apply };
})();
