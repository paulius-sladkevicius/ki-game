'use strict';
// Klaviatūra + lietimo mygtukai. down – laikomas, pressed – ką tik paspaustas.

const Input = (() => {
  const map = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    ArrowDown: 'charge', KeyS: 'charge',
    KeyJ: 'punch', KeyK: 'blast', KeyL: 'beam', KeyT: 'transform',
    KeyP: 'pause', Escape: 'pause',
    Enter: 'confirm', NumpadEnter: 'confirm',
    KeyM: 'mute',
  };
  const down = {};
  const pressed = {};

  function press(a) {
    if (!down[a]) pressed[a] = true;
    down[a] = true;
  }
  function release(a) { down[a] = false; }

  window.addEventListener('keydown', (e) => {
    const a = map[e.code];
    if (a) {
      e.preventDefault();
      press(a);
    }
    Sfx.unlock();
  });
  window.addEventListener('keyup', (e) => {
    const a = map[e.code];
    if (a) { e.preventDefault(); release(a); }
  });
  window.addEventListener('blur', () => { for (const k in down) down[k] = false; });

  function setupTouch() {
    const touch = document.getElementById('touch');
    const isTouch = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
    if (isTouch) touch.classList.remove('hidden');
    touch.querySelectorAll('button[data-a]').forEach((btn) => {
      const a = btn.dataset.a;
      const on = (e) => { e.preventDefault(); Sfx.unlock(); press(a); if (a === 'punch' || a === 'jump') pressed.confirm = true; btn.classList.add('active'); };
      const off = (e) => { e.preventDefault(); release(a); btn.classList.remove('active'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('pointerleave', off);
    });
    const canvas = document.getElementById('game');
    canvas.addEventListener('pointerdown', () => { Sfx.unlock(); pressed.confirm = true; });
  }

  function endFrame() { for (const k in pressed) delete pressed[k]; }

  return { down, pressed, press, release, endFrame, setupTouch };
})();
