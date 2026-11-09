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
  rings: [],
  techs: [],
  equip: { 1: null, 2: null },
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

// Saved progress: highest level reached (0..14).
function loadProgress() {
  try { return clamp(parseInt(localStorage.getItem('kiwave_level') || '0', 10) || 0, 0, 14); } catch (e) { return 0; }
}
function saveProgress(levelIndex) {
  try {
    if (levelIndex > loadProgress()) localStorage.setItem('kiwave_level', String(clamp(levelIndex, 0, 14)));
  } catch (e) { /* ignore */ }
}

function liveBosses() { return Game.bosses.filter((b) => !b.dead); }

// Lightning bolt between two points (Storm form).
function addBolt(x1, y1, x2, y2, color = '#d9c2ff') {
  Game.bolts.push({ x1, y1, x2, y2, color, life: 0.18, max: 0.18, seed: Math.random() * 1000 });
}

// Run state (coins and upgrades), so that "Continue" keeps the training.
function saveRun() {
  try { localStorage.setItem('kiwave_run', JSON.stringify({ money: Game.money, upgrades: Game.upgrades, lead: Game.controlChar || 'ren', techs: Game.techs || [], equip: Game.equip || { 1: null, 2: null } })); } catch (e) { /* ignore */ }
}
function loadRun() {
  try {
    const r = JSON.parse(localStorage.getItem('kiwave_run') || 'null');
    if (r && r.upgrades) {
      Game.money = Math.max(0, r.money | 0);
      Game.controlChar = r.lead === 'raxas' || r.lead === 'friend' ? 'friend' : 'ren';
      Game.techs = Array.isArray(r.techs) ? r.techs.filter((id) => typeof id === 'string') : [];
      Game.equip = r.equip && typeof r.equip === 'object' ? { 1: r.equip[1] || null, 2: r.equip[2] || null } : { 1: null, 2: null };
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
  Game.techs = [];
  Game.equip = { 1: null, 2: null };
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

// ---------- Difficulty ----------
// hp/dmg: enemy & boss multipliers, bossAtk: how often bosses attack, tell: length of attack warnings,
// heal: HP after each wave, bossHeal: share of max HP healed before the boss, guardCost/beamCost: cost multipliers, extra: extra enemies per wave,
// champion: chance of a stronger golden enemy, dodge/block/interrupt: how smart enemies are (chance per second / per hit),
// antiAir: melee enemies jump at heroes hovering above them.
const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#9fffb0', hp: 0.7, dmg: 0.6, bossAtk: 0.75, tell: 1.25, heal: 25, bossHeal: 1, guardCost: 0.8, beamCost: 0.9, extra: 0, champion: 0, dodge: 0, block: 0, interrupt: 0, antiAir: false, coins: 1, specialCd: 1 },
  { id: 'normal', name: 'Normal', color: '#9fe6ff', hp: 1, dmg: 1, bossAtk: 1, tell: 1, heal: 15, bossHeal: 1, guardCost: 1, beamCost: 1, extra: 0, champion: 0.05, dodge: 0.2, block: 0.1, interrupt: 0.2, antiAir: true, coins: 1, specialCd: 1 },
  { id: 'hard', name: 'Hard', color: '#ffb060', hp: 1.3, dmg: 1.25, bossAtk: 1.2, tell: 0.9, heal: 5, bossHeal: 0.6, guardCost: 1.15, beamCost: 1.15, extra: 1, champion: 0.1, dodge: 0.45, block: 0.25, interrupt: 0.45, antiAir: true, coins: 1.25, specialCd: 1.2 },
  { id: 'veryhard', name: 'Very Hard', color: '#ff6060', hp: 1.7, dmg: 1.55, bossAtk: 1.4, tell: 0.8, heal: 0, bossHeal: 0.4, guardCost: 1.35, beamCost: 1.3, extra: 2, champion: 0.2, dodge: 0.9, block: 0.4, interrupt: 0.9, antiAir: true, coins: 1.5, specialCd: 1.4 },
];
function loadDifficulty() {
  try { return clamp(parseInt(localStorage.getItem('kiwave_diff') || '1', 10), 0, DIFFICULTIES.length - 1); } catch (e) { return 1; }
}
function saveDifficulty() {
  try { localStorage.setItem('kiwave_diff', String(Game.diffIndex)); } catch (e) { /* ignore */ }
}
Game.diffIndex = loadDifficulty();
function diff() { return DIFFICULTIES[Game.diffIndex] || DIFFICULTIES[1]; }

// ---------- Stars per level ----------
// Best result per difficulty and level: { stars: 0..3, rank: 'S'|'A'|'B'|'C' }.
function loadStars() {
  try { return JSON.parse(localStorage.getItem('kiwave_stars') || '{}') || {}; } catch (e) { return {}; }
}
function bestResult(levelIndex, diffId = diff().id) {
  const all = loadStars();
  return (all[diffId] && all[diffId][levelIndex]) || null;
}
const RANK_ORDER = { C: 1, B: 2, A: 3, S: 4 };
// Saves the result if it is better; returns true for a new best.
function saveResult(levelIndex, res) {
  const all = loadStars();
  const d = diff().id;
  all[d] = all[d] || {};
  const old = all[d][levelIndex];
  const better = !old || res.stars > old.stars || (res.stars === old.stars && RANK_ORDER[res.rank] > RANK_ORDER[old.rank]);
  if (better) {
    all[d][levelIndex] = { stars: res.stars, rank: res.rank };
    try { localStorage.setItem('kiwave_stars', JSON.stringify(all)); } catch (e) { /* ignore */ }
  }
  return better;
}

// ---------- Helper friend ----------
// 'auto' = the story friend of the level (Raxas in act 2, Nyx in act 3), or a fixed friend, or 'none' (fight alone).
const HELPER_NAMES = { auto: 'Auto', raxas: 'Raxas', nyx: 'Nyx', none: 'None' };
function helperOptions() {
  const opts = ['auto', 'raxas'];
  if (loadProgress() >= 10) opts.push('nyx');     // Nyx joins in act 3
  opts.push('none');
  return opts;
}
function loadHelper() {
  try { const h = localStorage.getItem('kiwave_helper'); return HELPER_NAMES[h] ? h : 'auto'; } catch (e) { return 'auto'; }
}
function saveHelper() {
  try { localStorage.setItem('kiwave_helper', Game.helper); } catch (e) { /* ignore */ }
}
function cycleHelper(step) {
  const opts = helperOptions();
  const i = Math.max(0, opts.indexOf(Game.helper));
  Game.helper = opts[(i + step + opts.length) % opts.length];
  saveHelper();
}
Game.helper = loadHelper();
// Which friend fights with you in this level (null = nobody).
function friendFor(lvl) {
  if (!lvl || !lvl.ally) return null;
  let h = Game.helper;
  if (h === 'nyx' && loadProgress() < 10) h = 'auto';
  if (h === 'none') return null;
  if (h === 'auto') return lvl.friend || 'raxas';
  return h;
}

// ---------- Dialogs on / off ----------
function loadDialogsOn() {
  try { return localStorage.getItem('kiwave_dialogs') !== 'off'; } catch (e) { return true; }
}
function saveDialogsOn() {
  try { localStorage.setItem('kiwave_dialogs', Game.dialogsOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
}
Game.dialogsOn = loadDialogsOn();
