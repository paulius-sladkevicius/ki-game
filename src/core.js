'use strict';
// Shared constants, game state and helper functions.

const W = 960;
const H = 540;
const GROUND = 462;
const GRAVITY = 1800;

const Game = {
  state: 'MENU',      // MENU, DIALOG, PLAY, PAUSE, GAMEOVER, VICTORY, TRAINING
  stateT: 0,
  time: 0,
  player: null,
  enemies: [],
  bosses: [],
  bolts: [],
  hazards: [],
  ally: null,
  levelIndex: 0,
  crystals: 0,
  money: 0,
  upgrades: { hp: 0, ki: 0, beam: 0, guard: 0 },
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

// Body rectangle (x = center, y = feet).
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
  try { return parseInt(localStorage.getItem('kiwave_hs') || '0', 10) || 0; } catch (e) { return 0; }
}

function saveHighScore() {
  if (Game.score > Game.highScore) {
    Game.highScore = Game.score;
    try { localStorage.setItem('kiwave_hs', String(Game.score)); } catch (e) { /* ignore */ }
  }
}

// Saved progress: highest level reached (0..9).
function loadProgress() {
  try { return clamp(parseInt(localStorage.getItem('kiwave_level') || '0', 10) || 0, 0, 9); } catch (e) { return 0; }
}
function saveProgress(levelIndex) {
  try {
    if (levelIndex > loadProgress()) localStorage.setItem('kiwave_level', String(clamp(levelIndex, 0, 9)));
  } catch (e) { /* ignore */ }
}

function liveBosses() { return Game.bosses.filter((b) => !b.dead); }

// Lightning bolt between two points (Storm form).
function addBolt(x1, y1, x2, y2, color = '#d9c2ff') {
  Game.bolts.push({ x1, y1, x2, y2, color, life: 0.18, max: 0.18, seed: Math.random() * 1000 });
}

// Run state (coins and upgrades), so that "Continue" keeps the training.
function saveRun() {
  try { localStorage.setItem('kiwave_run', JSON.stringify({ money: Game.money, upgrades: Game.upgrades, lead: Game.controlChar || 'ren' })); } catch (e) { /* ignore */ }
}
function loadRun() {
  try {
    const r = JSON.parse(localStorage.getItem('kiwave_run') || 'null');
    if (r && r.upgrades) {
      Game.money = Math.max(0, r.money | 0);
      Game.controlChar = r.lead === 'raxas' ? 'raxas' : 'ren';
      Game.upgrades = { hp: clamp(r.upgrades.hp | 0, 0, 5), ki: clamp(r.upgrades.ki | 0, 0, 5), beam: clamp(r.upgrades.beam | 0, 0, 5), guard: clamp(r.upgrades.guard | 0, 0, 5) };
      return;
    }
  } catch (e) { /* ignore */ }
  resetRun();
}
function resetRun() {
  Game.money = 0;
  Game.upgrades = { hp: 0, ki: 0, beam: 0, guard: 0 };
  Game.controlChar = 'ren';
  saveRun();
}

const IS_TOUCH = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
function vibrate(ms) { if (IS_TOUCH && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* ignore */ } } }

// ---------- Heroes ----------
// Game.player is the hero you control, Game.ally the AI-controlled one (from level 6 on).
function allHeroes() { return [Game.player, Game.ally].filter(Boolean); }
function liveHeroes() { return allHeroes().filter((h) => h.alive); }
function heroById(id) { return allHeroes().find((h) => h.id === id) || null; }
// Enemies attack the closest hero that is still standing.
function nearestHero(x) {
  const hs = liveHeroes();
  if (!hs.length) return Game.player;
  let best = hs[0];
  for (const h of hs) if (Math.abs(h.x - x) < Math.abs(best.x - x)) best = h;
  return best;
}
