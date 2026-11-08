'use strict';
// Sugeneruoti garso efektai per Web Audio API (be failų).

const Sfx = (() => {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let chargeNode = null;

  function unlock() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.3;
        master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { /* garsas neprivalomas */ }
  }

  function ok() { return ctx && !Game.muted; }

  function tone(f, dur, type = 'square', vol = 0.2, f2 = null, delay = 0) {
    if (!ok()) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol = 0.3, freq = 1200, type = 'lowpass', freq2 = null) {
    if (!ok()) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.setValueAtTime(freq, t);
    if (freq2) fl.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur);
  }

  function chargeStart() {
    if (!ok() || chargeNode) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const fl = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.value = 110;
    fl.type = 'lowpass';
    fl.frequency.value = 800;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    o.connect(fl); fl.connect(g); g.connect(master);
    o.start();
    chargeNode = { o, g, fl };
  }
  function chargeSet(p) {
    if (!chargeNode) return;
    chargeNode.o.frequency.setTargetAtTime(110 + p * 300, ctx.currentTime, 0.05);
    chargeNode.fl.frequency.setTargetAtTime(800 + p * 2000, ctx.currentTime, 0.05);
  }
  function chargeStop() {
    if (!chargeNode) return;
    const n = chargeNode;
    chargeNode = null;
    try {
      n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
      n.o.stop(ctx.currentTime + 0.2);
    } catch (e) { /* nieko */ }
  }

  return {
    unlock, chargeStart, chargeSet, chargeStop,
    punch() { noise(0.06, 0.25, 2500); tone(180, 0.06, 'square', 0.06, 90); },
    hit() { noise(0.12, 0.4, 1800, 'lowpass', 300); tone(120, 0.1, 'square', 0.15, 60); },
    blast() { tone(600, 0.15, 'sawtooth', 0.08, 1200); noise(0.1, 0.12, 4000); },
    beam(l) { noise(0.3 + l * 0.3, 0.35, 3000, 'bandpass', 400); tone(220, 0.3 + l * 0.3, 'sawtooth', 0.15, 55); },
    explode() { noise(0.5, 0.5, 1000, 'lowpass', 80); tone(80, 0.4, 'sine', 0.3, 30); },
    hurt() { tone(300, 0.15, 'square', 0.15, 120); },
    transform() { tone(110, 1.0, 'sawtooth', 0.15, 880); noise(1.0, 0.3, 300, 'bandpass', 4000); },
    select() { tone(880, 0.08, 'square', 0.1); tone(1320, 0.08, 'square', 0.1, null, 0.08); },
    jump() { tone(300, 0.1, 'square', 0.05, 600); },
    slash() { noise(0.2, 0.3, 6000, 'highpass'); tone(900, 0.15, 'sawtooth', 0.05, 300); },
    clashTick() { tone(rand(200, 400), 0.05, 'square', 0.06); },
    victory() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'square', 0.12, null, i * 0.15)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.15, null, i * 0.2)); },
  };
})();
