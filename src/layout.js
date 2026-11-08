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
    // Option C: the game fills the screen and the buttons sit on top of it in the corners.
    const full = fit(vw, vh);

    touch.style.setProperty('--btn', btn + 'px');
    touch.style.setProperty('--gap', gap + 'px');
    const left = touch.querySelector('.pad.left');
    const right = touch.querySelector('.pad.right');
    const pause = document.getElementById('pauseBtn');
    const fs = document.getElementById('fsBtn');
    const sw = document.getElementById('swBtn');
    Game.safeLeft = 0;
    Game.safeRight = 0;

    const best = Math.max(side.w, bottom.w);
    if (best < full.w * 0.85) {
      // Overlay: a separate area for the buttons would make the game too small.
      touch.classList.add('overlay');
      // slightly smaller buttons, because they cover the game
      const ob = Math.round(clamp(Math.min(vw, vh) * 0.105, 40, 56));
      const og = Math.round(ob * 0.16);
      touch.style.setProperty('--btn', ob + 'px');
      touch.style.setProperty('--gap', og + 'px');
      const cx = (vw - full.w) / 2;
      setCanvas(canvas, cx, (vh - full.h) / 2, full.w, full.h);
      place(left, { left: m, bottom: m });
      place(right, { right: m, bottom: m });
      place(pause, { left: vw / 2 - 46, top: m });
      place(fs, { left: vw / 2 + 6, top: m });
      place(sw, { left: vw / 2 + 58, top: m });
      // parts of the screen covered by the buttons, in game coordinates (the dialog box avoids them)
      const scale = W / full.w;
      Game.safeLeft = Math.max(0, (m + 3 * ob + 2 * og - cx) * scale);
      Game.safeRight = Math.max(0, (cx + full.w - (vw - m - 2 * ob - og)) * scale);
      return;
    }
    touch.classList.remove('overlay');
    if (side.w >= bottom.w) {
      const x = leftW + (vw - leftW - rightW - side.w) / 2;
      setCanvas(canvas, x, (vh - side.h) / 2, side.w, side.h);
      place(left, { left: m, bottom: m + Math.max(0, (vh - padH) * 0.15) });
      place(right, { right: m, bottom: m + Math.max(0, (vh - padH) * 0.15) });
      place(pause, { right: m + (rightW - 2 * m - 40) / 2, top: m });
      place(fs, { right: m + (rightW - 2 * m - 40) / 2, top: m + 48 });
      place(sw, { right: m + (rightW - 2 * m - 40) / 2, top: m + 96 });
    } else {
      setCanvas(canvas, (vw - bottom.w) / 2, Math.max(0, (vh - barH - bottom.h) / 2), bottom.w, bottom.h);
      place(left, { left: m + 6, bottom: m });
      place(right, { right: m + 6, bottom: m + btn / 2 });
      place(pause, { left: vw / 2 - 46, bottom: m + padH / 2 - 20 });
      place(fs, { left: vw / 2 + 6, bottom: m + padH / 2 - 20 });
      place(sw, { left: vw / 2 + 58, bottom: m + padH / 2 - 20 });
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
    document.addEventListener('webkitfullscreenchange', () => setTimeout(apply, 100));
  }

  return { init, apply };
})();
