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
      if (musicWanted && musicNow !== musicWanted) startMusic();
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

  // ---------- Muzika: paprastas 16-ųjų žingsnių sekvenceris ----------
  // lead – pustoniai virš (root + 12), null – pauzė; prog – akordų šaknys kiekvienam taktui.
  const _ = null;
  const TRACKS = {
    menu: { bpm: 100, root: 57, prog: [0, -4, -2, -5], drums: 'half',
      lead: [0, _, 3, 5, 7, _, 5, 3, 5, _, 7, 10, 7, _, _, _, 12, _, 10, 7, 5, _, 7, _, 3, _, 5, 3, 0, _, _, _] },
    monastery: { bpm: 122, root: 57, prog: [0, -4, -2, -5], drums: 'rock',
      lead: [0, _, 3, 5, 7, _, 5, 3, 5, _, 7, 10, 7, _, _, _, 12, _, 10, 7, 5, _, 7, _, 3, _, 5, 3, 0, _, _, _] },
    desert: { bpm: 130, root: 50, prog: [0, 1, 0, -2], drums: 'rock',
      lead: [7, 5, 7, _, 10, _, 7, 5, 3, _, 5, 7, _, _, 0, _, 7, 5, 7, _, 12, _, 10, 7, 5, _, 3, 0, _, _, _, _] },
    ice: { bpm: 112, root: 52, prog: [0, -4, 3, -2], drums: 'half',
      lead: [12, _, 7, _, 10, _, 7, _, 5, _, 7, _, 3, _, _, _, 12, _, 15, _, 14, _, 10, _, 12, _, _, _, 7, _, _, _] },
    volcano: { bpm: 142, root: 48, prog: [0, 0, -4, -2], drums: 'rock',
      lead: [0, 0, 3, 0, 5, 0, 6, 5, 3, _, 0, _, 10, _, 7, _, 0, 0, 3, 0, 5, 0, 6, 7, 10, _, 12, _, 7, _, _, _] },
    ship: { bpm: 136, root: 47, prog: [0, -4, -7, -2], drums: 'rock',
      lead: [0, _, 12, _, 10, 7, _, 5, 7, _, 3, _, 5, _, _, _, 0, _, 12, _, 15, 14, _, 12, 10, _, 7, _, 12, _, _, _] },
    boss: { bpm: 152, root: 52, prog: [0, 1, 0, -2], drums: 'fast',
      lead: [0, 3, 7, 3, 0, 3, 8, 7, 0, 3, 7, 3, 10, 8, 7, 3, 0, 3, 7, 3, 0, 3, 8, 7, 12, 10, 8, 7, 8, 7, 3, _] },
    final: { bpm: 164, root: 47, prog: [0, 1, -2, -4], drums: 'fast',
      lead: [12, _, 15, 12, 19, _, 17, 15, 12, _, 15, 17, 15, _, 12, 10, 12, _, 15, 12, 20, _, 19, 17, 15, 17, 15, 12, 10, _, _, _] },
  };
  let musicWanted = null, musicNow = null, musicTimer = null, musicStep = 0, musicNext = 0, musicGain = null;
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function mNote(freq, t, dur, type, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function mNoise(t, dur, vol, type, freq) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter();
    fl.type = type; fl.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(musicGain);
    s.start(t, Math.random() * 0.5); s.stop(t + dur);
  }
  function scheduleStep(tr, step, t, stepDur) {
    const bar = Math.floor(step / 16) % tr.prog.length;
    const chord = tr.root + tr.prog[(Math.floor(step / 8)) % tr.prog.length];
    void bar;
    const s16 = step % 16;
    // bosas
    if (step % 2 === 0) mNote(midi(chord - 12 + (step % 4 === 2 ? 12 : 0)), t, stepDur * 1.8, 'triangle', 0.22);
    // melodija
    const n = tr.lead[step % tr.lead.length];
    if (n !== null && n !== undefined) mNote(midi(tr.root + 12 + n), t, stepDur * 1.6, 'square', 0.06);
    // būgnai
    const kick = tr.drums === 'fast' ? s16 % 4 === 0 : (s16 === 0 || s16 === 8 || (tr.drums === 'rock' && s16 === 10));
    const snare = tr.drums === 'half' ? s16 === 8 : (s16 === 4 || s16 === 12);
    if (kick) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 0.15); }
    if (snare) mNoise(t, 0.12, 0.25, 'bandpass', 1800);
    if (s16 % 2 === 1 || tr.drums === 'fast') mNoise(t, 0.03, 0.07, 'highpass', 7000);
  }
  function musicTick() {
    if (!ctx || !musicNow) return;
    const tr = TRACKS[musicNow];
    const stepDur = 60 / tr.bpm / 4;
    if (musicNext < ctx.currentTime) musicNext = ctx.currentTime + 0.05;
    while (musicNext < ctx.currentTime + 0.15) {
      if (!Game.muted && document.visibilityState !== 'hidden') scheduleStep(tr, musicStep, musicNext, stepDur);
      musicNext += stepDur;
      musicStep = (musicStep + 1) % 32;
    }
  }
  function startMusic() {
    if (!ctx || musicNow === musicWanted) return;
    musicNow = musicWanted;
    musicStep = 0;
    musicNext = ctx.currentTime + 0.08;
    if (!musicGain) { musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master); }
    if (!musicTimer) musicTimer = setInterval(musicTick, 40);
  }
  function music(name) {
    musicWanted = name;
    if (!name) { musicNow = null; return; }
    startMusic();
  }

  return {
    unlock, chargeStart, chargeSet, chargeStop, music,
    coin() { tone(1320, 0.05, 'square', 0.05); tone(1760, 0.07, 'square', 0.05, null, 0.05); },
    buy() { [660, 880, 1320].forEach((f, i) => tone(f, 0.1, 'square', 0.1, null, i * 0.07)); },
    deny() { tone(200, 0.15, 'square', 0.1, 150); },
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
    teleport() { tone(1200, 0.12, 'sine', 0.12, 300); },
    zap() { noise(0.12, 0.3, 5000, 'highpass'); tone(1800, 0.08, 'square', 0.05, 600); },
    boom() { noise(0.25, 0.45, 800, 'lowpass', 100); tone(60, 0.3, 'sine', 0.3, 25); },
    clashTick() { tone(rand(200, 400), 0.05, 'square', 0.06); },
    victory() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'square', 0.12, null, i * 0.15)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.15, null, i * 0.2)); },
  };
})();
