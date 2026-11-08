'use strict';
// Bendros konstantos, žaidimo būsena ir pagalbinės funkcijos.

const W = 960;
const H = 540;
const GROUND = 462;
const GRAVITY = 1800;

const Game = {
  state: 'MENU',      // MENU, DIALOG, PLAY, PAUSE, GAMEOVER, VICTORY
  stateT: 0,
  time: 0,
  player: null,
  enemies: [],
  boss: null,
  projectiles: [],
  beams: [],
  particles: [],
  floaters: [],
  shake: 0,
  hitstop: 0,
  slowmo: 0,
  flash: 0,
  score: 0,
  combo: 0,
  comboTimer: 0,
  clash: null,
  banner: null,
  hint: null,
  dialog: null,
  script: null,
  step: -1,
  cur: null,
  checkpoint: 0,
  checkpointScore: 0,
  highScore: 0,
  muted: false,
};

function setState(s) {
  Game.state = s;
  Game.stateT = 0;
}

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function sign(v) { return v < 0 ? -1 : 1; }

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Kūno stačiakampis (x – centras, y – pėdos).
function boxOf(e) {
  return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
}

function addShake(v) { Game.shake = Math.max(Game.shake, v); }
function addHitstop(v) { Game.hitstop = Math.max(Game.hitstop, v); }

function floater(x, y, text, color = '#fff', size = 18) {
  Game.floaters.push({ x, y, text, color, size, life: 0.9, max: 0.9 });
}

function showBanner(text, sub = '', time = 2.2) {
  Game.banner = { text, sub, t: time, max: time };
}

function showHint(text, time = 2.5) {
  Game.hint = { text, t: time };
}

function loadHighScore() {
  try { return parseInt(localStorage.getItem('kibanga_hs') || '0', 10) || 0; } catch (e) { return 0; }
}

function saveHighScore() {
  if (Game.score > Game.highScore) {
    Game.highScore = Game.score;
    try { localStorage.setItem('kibanga_hs', String(Game.score)); } catch (e) { /* nieko */ }
  }
}
