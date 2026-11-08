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
  bosses: [],
  bolts: [],
  levelIndex: 0,
  crystals: 0,
  zenu: 0,
  upgrades: { hp: 0, ki: 0, beam: 0 },
  coins: [],
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

// Išsaugotas progresas: aukščiausias pasiektas lygis (0..4).
function loadProgress() {
  try { return clamp(parseInt(localStorage.getItem('kibanga_level') || '0', 10) || 0, 0, 4); } catch (e) { return 0; }
}
function saveProgress(levelIndex) {
  try {
    if (levelIndex > loadProgress()) localStorage.setItem('kibanga_level', String(clamp(levelIndex, 0, 4)));
  } catch (e) { /* nieko */ }
}

function liveBosses() { return Game.bosses.filter((b) => !b.dead); }

// Žaibas tarp dviejų taškų (Audros forma).
function addBolt(x1, y1, x2, y2, color = '#fff27a') {
  Game.bolts.push({ x1, y1, x2, y2, color, life: 0.18, max: 0.18, seed: Math.random() * 1000 });
}

// Žaidimo eiga (Zenu ir patobulinimai) – kad „Tęsti“ išsaugotų treniruotes.
function saveRun() {
  try { localStorage.setItem('kibanga_run', JSON.stringify({ zenu: Game.zenu, upgrades: Game.upgrades })); } catch (e) { /* nieko */ }
}
function loadRun() {
  try {
    const r = JSON.parse(localStorage.getItem('kibanga_run') || 'null');
    if (r && r.upgrades) {
      Game.zenu = Math.max(0, r.zenu | 0);
      Game.upgrades = { hp: clamp(r.upgrades.hp | 0, 0, 5), ki: clamp(r.upgrades.ki | 0, 0, 5), beam: clamp(r.upgrades.beam | 0, 0, 5) };
      return;
    }
  } catch (e) { /* nieko */ }
  resetRun();
}
function resetRun() {
  Game.zenu = 0;
  Game.upgrades = { hp: 0, ki: 0, beam: 0 };
  saveRun();
}

const IS_TOUCH = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
function vibrate(ms) { if (IS_TOUCH && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* nieko */ } } }
