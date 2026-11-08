'use strict';
// Keyboard + touch buttons. down = held, pressed = just pressed this frame.

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
    KeyQ: 'quit',
    KeyC: 'switch',
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

  const fsSupported = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFullscreen() {
    const el = document.documentElement;
    try {
      const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (r && r.then) {
        r.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ignore */ } })
          .catch(() => fullscreenFailed());
      }
    } catch (e) { fullscreenFailed(); }
  }
  function fullscreenFailed() {
    if (typeof showHint === 'function') showHint('Fullscreen blocked - use the browser menu: "Add to Home screen"', 4);
  }
  function toggleFullscreen() {
    if (!fsSupported) return;
    if (isFullscreen()) {
      try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* ignore */ }
    } else enterFullscreen();
  }
  // The first tap on a touch device tries to go fullscreen automatically.
  // Browsers only allow fullscreen and audio from a finished tap (pointerup / touchend / click),
  // not from pointerdown, so these run on 'pointerup'.
  let triedFs = false;
  function goFullscreen() {
    if (triedFs || !fsSupported || standalone()) return;
    triedFs = true;
    if (!isFullscreen()) enterFullscreen();
  }
  function standalone() {
    return (window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches) || navigator.standalone === true;
  }

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
    const fsBtn = document.getElementById('fsBtn');
    if (!fsSupported || standalone()) fsBtn.style.display = 'none';
    fsBtn.addEventListener('click', () => { triedFs = true; Sfx.unlock(); toggleFullscreen(); });
    const syncFs = () => { fsBtn.textContent = isFullscreen() ? '✕' : '⛶'; };
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs);
    const canvas = document.getElementById('game');
    canvas.addEventListener('pointerdown', () => { Sfx.unlock(); pressed.confirm = true; });
    // user-activation events: unlock audio and (once) try fullscreen
    const activate = (e) => {
      Sfx.unlock();
      if (isTouch && !(e.target && e.target.id === 'fsBtn')) goFullscreen();
    };
    document.addEventListener('pointerup', activate);
    document.addEventListener('touchend', activate);
  }

  function endFrame() { for (const k in pressed) delete pressed[k]; }

  return { down, pressed, press, release, endFrame, setupTouch };
})();
