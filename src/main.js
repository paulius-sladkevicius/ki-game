'use strict';
// Game loop: update and render.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
Game.highScore = loadHighScore();
Input.setupTouch();
const swBtn = document.getElementById('swBtn');
const spBtns = [1, 2].map((k) => document.querySelector(`#touch [data-a="special${k}"]`));

// Touch buttons ① ② show how far the technique has recharged.
// The button is only restyled when its value changes; 'ready' (exactly 0) is its own value,
// so the last small part of the ring is always cleared when the technique is ready again.
function updateSpecialButtons() {
  const p = Game.player;
  spBtns.forEach((btn, i) => {
    if (!btn) return;
    const slot = i + 1;
    const id = Game.equip && Game.equip[slot];
    const pct = p && id ? techCooldownFrac(p, id) : 0;
    const key = !id ? 'none' : pct <= 0 ? 'ready' : String(Math.ceil(pct * 90));
    if (btn.dataset.k === key) return;
    btn.dataset.k = key;
    btn.style.opacity = id ? '1' : '0.35';
    btn.style.setProperty('--cd', key === 'ready' || key === 'none' ? '0deg' : `${Math.ceil(pct * 90) * 4}deg`);
    btn.classList.toggle('ready', key === 'ready');
  });
}
Layout.init();
Sfx.music('menu');

function anyConfirm() {
  const I = Input.pressed;
  return I.confirm || I.jump || I.punch;
}

function update(dt) {
  Game.time += dt;
  Game.stateT += dt;
  if (Game.flash > 0) Game.flash -= dt;
  if (Input.pressed.mute) { Game.muted = !Game.muted; if (Game.muted) Sfx.chargeStop(); }
  // the ⇄ button only makes sense in a level with two heroes
  const showSw = !!Game.ally && ['PLAY', 'DIALOG', 'PAUSE'].includes(Game.state);
  if (swBtn && swBtn.classList.contains('off') === showSw) swBtn.classList.toggle('off', !showSw);
  updateSpecialButtons();

  switch (Game.state) {
    case 'MENU':
      updateParticles(dt);
      updateMenu();
      break;
    case 'DIALOG':
      updateParticles(dt);
      updateTimers(dt);
      updateDialog(dt);
      break;
    case 'PLAY':
      if (Input.pressed.pause) { setState('PAUSE'); Sfx.chargeStop(); break; }
      updatePlay(dt);
      break;
    case 'PAUSE':
      if (Input.pressed.pause || Input.pressed.confirm) setState('PLAY');
      else if (Input.pressed.special1) { Sfx.select(); openTechs('PAUSE'); }
      else if (Input.pressed.quit || Input.pressed.punch) { Game.theme = 'monastery'; setState('MENU'); Sfx.music('menu'); }
      break;
    case 'LEVELSELECT':
      updateLevelSelect();
      break;
    case 'TECHS':
      if (Game.trainMsg) { Game.trainMsg.t -= dt; if (Game.trainMsg.t <= 0) Game.trainMsg = null; }
      updateTechs();
      break;
    case 'TRAINING':
      updateParticles(dt);
      if (Game.trainMsg) { Game.trainMsg.t -= dt; if (Game.trainMsg.t <= 0) Game.trainMsg = null; }
      updateTraining();
      break;
    case 'GAMEOVER':
      updateParticles(dt);
      if (Game.stateT > 1 && (Input.pressed.confirm || Input.pressed.jump)) {
        Sfx.select();
        // from the checkpoint or from the first wave (skipping the intro dialog)
        startLevel(Game.levelIndex, Math.max(1, Game.checkpoint));
      }
      break;
    case 'VICTORY':
      updateParticles(dt);
      if (Math.random() < dt * 6) explosion(rand(100, W - 100), rand(80, 300), 0.5);
      if (Game.stateT > 1.5 && (Input.pressed.confirm || Input.pressed.jump)) {
        Sfx.select();
        if (Game.levelIndex + 1 < LEVELS.length) { setState('TRAINING'); Game.trainSel = 0; Sfx.music('menu'); }
        else { Game.theme = 'monastery'; setState('MENU'); Sfx.music('menu'); }
      }
      break;
  }
  Game.shake = Math.max(0, Game.shake - 40 * dt);
}

// Menu: ↑ ↓ to choose, ← → to change the difficulty, Enter / J / tap to confirm.
function menuOptions() {
  const opts = [{ kind: 'start', label: 'New game', level: 0 }];
  const prog = loadProgress();
  if (prog > 0) {
    opts.push({ kind: 'start', label: `Continue: level ${prog + 1} - ${LEVELS[prog].name}`, level: prog, cont: true });
    opts.push({ kind: 'select', label: 'Select level' });
    opts.push({ kind: 'techs', label: 'Techniques' });
  }
  opts.push({ kind: 'diff', label: 'Difficulty' });
  if (prog >= 5) opts.push({ kind: 'helper', label: 'Helper friend' });
  return opts;
}

function changeDifficulty(step) {
  Game.diffIndex = (Game.diffIndex + step + DIFFICULTIES.length) % DIFFICULTIES.length;
  saveDifficulty();
  Sfx.unlock(); Sfx.select();
}

function updateMenu() {
  const opts = menuOptions();
  if (Game.menuSel === undefined) Game.menuSel = opts.findIndex((o) => o.cont) >= 0 ? opts.findIndex((o) => o.cont) : 0;
  Game.menuSel = clamp(Game.menuSel, 0, opts.length - 1);
  const I = Input.pressed;
  const cur = opts[Game.menuSel];
  if (I.jump) { Game.menuSel = (Game.menuSel + opts.length - 1) % opts.length; Sfx.unlock(); Sfx.select(); }
  if (I.charge) { Game.menuSel = (Game.menuSel + 1) % opts.length; Sfx.unlock(); Sfx.select(); }
  if (cur.kind === 'diff' && (I.left || I.right)) changeDifficulty(I.left ? -1 : 1);
  if (cur.kind === 'helper' && (I.left || I.right)) { cycleHelper(I.left ? -1 : 1); Sfx.unlock(); Sfx.select(); }
  if ((I.confirm || I.punch) && Game.stateT > 0.2) {
    Sfx.unlock(); Sfx.select();
    if (cur.kind === 'diff') { changeDifficulty(1); return; }
    if (cur.kind === 'helper') { cycleHelper(1); return; }
    if (cur.kind === 'select') { Game.lsSel = loadProgress(); setState('LEVELSELECT'); return; }
    if (cur.kind === 'techs') { openTechs('MENU'); return; }
    Game.score = 0;
    if (cur.level === 0) resetRun(); else loadRun();
    startLevel(cur.level);
  }
}

// Techniques screen: choose which learned techniques go into slots ① and ②.
function openTechs(ret) {
  if (ret === 'MENU') loadRun();
  ensureTechs();
  Game.techsReturn = ret;
  const eq = SPECIALS.findIndex((sp) => sp.id === Game.equip[1]);
  Game.techSel = eq >= 0 ? eq : 0;
  Game.trainMsg = null;
  setState('TECHS');
}

function updateTechs() {
  const I = Input.pressed;
  const n = SPECIALS.length;
  if (I.left) Game.techSel = (Game.techSel + n - 1) % n;
  if (I.right) Game.techSel = (Game.techSel + 1) % n;
  if (I.jump) Game.techSel = (Game.techSel + n - 5) % n;
  if (I.charge) Game.techSel = (Game.techSel + 5) % n;
  if (I.left || I.right || I.jump || I.charge) Sfx.select();
  if ((I.pause || I.quit) && Game.stateT > 0.15) { Sfx.select(); Game.trainMsg = null; setState(Game.techsReturn || 'MENU'); return; }
  if (Game.stateT < 0.2) return;
  const sp = SPECIALS[Game.techSel];
  let slot = 0;
  if (I.punch || I.special1) slot = 1;
  else if (I.blast || I.special2) slot = 2;
  else if (I.confirm) slot = Game.equip[1] === sp.id ? 2 : 1;
  if (!slot) return;
  if (!(Game.techs || []).includes(sp.id)) {
    Sfx.deny();
    Game.trainMsg = { text: `Not learned yet - finish level ${sp.unlock + 1} to learn ${sp.name}`, t: 1.6 };
    return;
  }
  equipTech(slot, sp.id);
  saveRun();
  Sfx.buy();
  Game.trainMsg = { text: `${sp.name} is now in slot ${slot === 1 ? '①' : '②'}`, t: 1.4, color: sp.color };
}

// Level select: replay any level you have reached (for better stars).
function updateLevelSelect() {
  const I = Input.pressed;
  const prog = loadProgress();
  const n = LEVELS.length;
  if (I.left) Game.lsSel = (Game.lsSel + n - 1) % n;
  if (I.right) Game.lsSel = (Game.lsSel + 1) % n;
  if (I.jump) Game.lsSel = (Game.lsSel + n - 5) % n;
  if (I.charge) Game.lsSel = (Game.lsSel + 5) % n;
  if (I.left || I.right || I.jump || I.charge) Sfx.select();
  if (I.pause || I.quit) { setState('MENU'); Sfx.select(); return; }
  if ((I.confirm || I.punch) && Game.stateT > 0.2) {
    if (Game.lsSel > prog) { Sfx.deny(); return; }
    Sfx.select();
    Game.score = 0;
    loadRun();
    startLevel(Game.lsSel);
  }
}

// Training between levels: spend coins to upgrade HP, Ki and the Ki Wave.
const TRAINING = [
  { key: 'hp', name: 'Health', desc: '+20 max HP', color: '#4cd964' },
  { key: 'ki', name: 'Ki', desc: '+20 max Ki, +15% regeneration', color: '#3aa0ff' },
  { key: 'beam', name: 'Ki Wave', desc: '+15% wave damage', color: '#ffd34a' },
  { key: 'guard', name: 'Guard', desc: '+20 max guard, +15% refill', color: '#7fe8ff' },
];
function trainCost(lvl) { return 100 * (lvl + 1); }

// The hero you control at the start of the next level.
function leadCharacter() {
  const next = LEVELS[Game.levelIndex + 1];
  const f = friendFor(next);
  return CHARACTERS[Game.controlChar === 'friend' && f ? f : 'ren'];
}

// Rows of the training screen: upgrades, helper friend and lead fighter (from act 2), techniques, continue.
function trainRows() {
  const rows = TRAINING.map((t) => ({ kind: 'up', t }));
  const next = LEVELS[Game.levelIndex + 1];
  if (next && next.ally) rows.push({ kind: 'helper' });
  if (next && friendFor(next)) rows.push({ kind: 'lead' });
  rows.push({ kind: 'techs' });
  rows.push({ kind: 'go' });
  return rows;
}

function updateTraining() {
  const rows = trainRows();
  const n = rows.length;
  const I = Input.pressed;
  if (I.jump) { Game.trainSel = (Game.trainSel + n - 1) % n; Sfx.select(); }
  if (I.charge) { Game.trainSel = (Game.trainSel + 1) % n; Sfx.select(); }
  Game.trainSel = clamp(Game.trainSel, 0, n - 1);
  const cur = rows[Game.trainSel];
  if (cur.kind === 'helper' && (I.left || I.right || ((I.confirm || I.punch) && Game.stateT > 0.3))) {
    cycleHelper(I.left ? -1 : 1);
    Sfx.select();
    const f = friendFor(LEVELS[Game.levelIndex + 1]);
    Game.trainMsg = { text: f ? `Helper friend: ${CHARACTERS[f].name}` : 'You will fight alone', t: 1.2, color: f ? CHARACTERS[f].color : '#cfd8ff' };
    return;
  }
  if (cur.kind === 'lead' && (I.left || I.right)) Input.pressed.confirm = true;
  if (cur.kind === 'techs' && (I.confirm || I.punch || I.right) && Game.stateT > 0.3) { Sfx.select(); openTechs('TRAINING'); return; }
  if ((I.confirm || I.punch) && Game.stateT > 0.3) {
    const row = rows[Game.trainSel];
    if (row.kind === 'go') {
      Sfx.select();
      startLevel(Game.levelIndex + 1);
      return;
    }
    if (row.kind === 'lead') {
      Game.controlChar = Game.controlChar === 'friend' ? 'ren' : 'friend';
      saveRun();
      Sfx.select();
      const c = leadCharacter();
      Game.trainMsg = { text: `Lead fighter: ${c.name}`, t: 1.2, color: c.color };
      return;
    }
    const t = row.t;
    const lvl = Game.upgrades[t.key];
    const cost = trainCost(lvl);
    if (lvl >= 5) { Sfx.deny(); Game.trainMsg = { text: 'Already at max level!', t: 1.2 }; return; }
    if (Game.money < cost) { Sfx.deny(); Game.trainMsg = { text: 'Not enough coins!', t: 1.2 }; return; }
    Game.money -= cost;
    Game.upgrades[t.key]++;
    saveRun();
    Sfx.buy();
    Game.trainMsg = { text: `${t.name}: level ${Game.upgrades[t.key]}!`, t: 1.2, color: t.color };
    burst(250, 360, t.color, 30, 300, 5, 0.6);
  }
}

// Switch which hero you control; the other one is taken over by the AI.
function switchHero(force) {
  const p = Game.player, a = Game.ally;
  if (!a || !a.alive || Game.clash || Game.state !== 'PLAY') return false;
  if (!force && Game.switchCd > 0) return false;
  if (p.alive && ['charging', 'kicharge', 'punch', 'blast'].includes(p.state)) p.setState('normal');
  Sfx.chargeStop();
  Game.player = a;
  Game.ally = p;
  a.ai = null;
  p.ai = new AllyAI(p);
  Game.controlChar = a.id;
  Game.switchCd = 0.4;
  floater(a.x, a.y - 125, 'YOU: ' + a.char.name, a.char.color, 18);
  Sfx.select();
  return true;
}

function updateTimers(dt) {
  if (Game.banner) { Game.banner.t -= dt; if (Game.banner.t <= 0) Game.banner = null; }
  if (Game.hint) { Game.hint.t -= dt; if (Game.hint.t <= 0) Game.hint = null; }
}

function updatePlay(dt) {
  updateTimers(dt);
  if (Game.stats) Game.stats.time += dt;
  if (Game.hitstop > 0) { Game.hitstop -= dt; return; }
  let edt = dt;
  if (Game.slowmo > 0) { Game.slowmo -= dt; edt = dt * 0.3; }
  if (Game.switchCd > 0) Game.switchCd -= dt;
  if (Input.pressed.switch) switchHero(false);
  const p = Game.player;
  const a = Game.ally;

  // Tick-Tock can slow the heroes down for a few seconds
  if (Game.heroSlowT > 0) Game.heroSlowT -= dt;
  const hs = Game.heroSlowT > 0 ? 0.55 : 1;
  p.update((p.state === 'transform' ? dt : edt) * hs, Input);
  if (a) a.update((a.state === 'transform' ? dt : edt) * hs, a.ai.think(edt));
  for (const e of Game.enemies) e.update(edt);
  for (const b of Game.bosses) b.update(edt);
  checkClash();
  updateBeams(edt);
  updateClash(edt);
  updateProjectiles(edt);
  updateBolts(edt);
  updateHazards(edt);
  updateRings(edt);
  updateCoins(edt);
  updateParticles(edt);
  Game.enemies = Game.enemies.filter((e) => !e.remove);

  if (Game.comboTimer > 0) { Game.comboTimer -= dt; if (Game.comboTimer <= 0) Game.combo = 0; }

  updateScript(dt);

  // the controlled hero is down: hand control to the ally, if it is still standing
  if (p.state === 'dead' && p.stateT > 1.2 && a && a.alive && Game.state === 'PLAY') {
    switchHero(true);
    showHint(`${p.char.name} is down! Now controlling ${a.char.name}`, 3);
  } else if (p.state === 'dead' && p.stateT > 1.6 && !(a && a.alive) && Game.state === 'PLAY') {
    saveHighScore();
    Sfx.music(null);
    Sfx.lose();
    setState('GAMEOVER');
  }
}

function drawWorld(ctx) {
  for (const e of Game.enemies) e.draw(ctx);
  for (const b of Game.bosses) b.draw(ctx);
  if (Game.ally) Game.ally.draw(ctx);
  if (Game.player) Game.player.draw(ctx);
  for (const b of Game.beams) drawBeam(ctx, b);
  drawClash(ctx);
  drawBolts(ctx);
  drawCoins(ctx);
  drawHazards(ctx);
  drawRings(ctx);
  for (const pr of Game.projectiles) drawProjectile(ctx, pr);
  drawParticles(ctx);
  drawFloaters(ctx);
}

function render() {
  ctx.save();
  if (Game.shake > 0) ctx.translate(rand(-Game.shake, Game.shake), rand(-Game.shake, Game.shake));
  drawBackground(ctx);
  if (Game.state !== 'MENU' && Game.state !== 'LEVELSELECT' && !(Game.state === 'TECHS' && Game.techsReturn === 'MENU')) drawWorld(ctx);
  if (Game.heroSlowT > 0 && Game.state === 'PLAY') { ctx.fillStyle = 'rgba(90,140,255,0.13)'; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
  if (Game.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${clamp(Game.flash, 0, 0.8)})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawUI(ctx);
}

let last = performance.now();
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  try {
    update(dt);
    render();
  } catch (err) {
    console.error(err);
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For testing / debugging
window.Game = Game;
