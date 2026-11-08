'use strict';
// Žaidimo ciklas: atnaujinimas ir piešimas.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
Game.highScore = loadHighScore();
Input.setupTouch();
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
      else if (Input.pressed.quit || Input.pressed.punch) { Game.theme = 'monastery'; setState('MENU'); Sfx.music('menu'); }
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
        // nuo kontrolinio taško arba nuo pirmos bangos (be įžangos dialogo)
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

// Meniu: ↑ ↓ pasirinkti, Enter / J / bakstelėjimas – patvirtinti.
function menuOptions() {
  const opts = [{ label: 'Naujas žaidimas', level: 0 }];
  const prog = loadProgress();
  if (prog > 0) opts.push({ label: `Tęsti: ${prog + 1} lygis – ${LEVELS[prog].name}`, level: prog });
  return opts;
}

function updateMenu() {
  const opts = menuOptions();
  if (Game.menuSel === undefined) Game.menuSel = opts.length - 1;
  Game.menuSel = clamp(Game.menuSel, 0, opts.length - 1);
  const I = Input.pressed;
  if (I.jump || I.left) { Game.menuSel = (Game.menuSel + opts.length - 1) % opts.length; Sfx.unlock(); Sfx.select(); }
  if (I.charge || I.right) { Game.menuSel = (Game.menuSel + 1) % opts.length; Sfx.unlock(); Sfx.select(); }
  if ((I.confirm || I.punch) && Game.stateT > 0.2) {
    Sfx.unlock(); Sfx.select();
    Game.score = 0;
    const o = opts[Game.menuSel];
    if (o.level === 0) resetRun(); else loadRun();
    startLevel(o.level);
  }
}

// Treniruotės tarp lygių: už Zenu gerinami HP, Ki ir Ki Banga.
const TRAINING = [
  { key: 'hp', name: 'Gyvybė', desc: '+20 maks. HP', color: '#4cd964' },
  { key: 'ki', name: 'Ki', desc: '+20 maks. Ki, +15 % atsistatymas', color: '#3aa0ff' },
  { key: 'beam', name: 'Ki Banga', desc: '+15 % bangos žala', color: '#ffd34a' },
];
function trainCost(lvl) { return 100 * (lvl + 1); }

function updateTraining() {
  const n = TRAINING.length + 1;
  const I = Input.pressed;
  if (I.jump || I.left) { Game.trainSel = (Game.trainSel + n - 1) % n; Sfx.select(); }
  if (I.charge || I.right) { Game.trainSel = (Game.trainSel + 1) % n; Sfx.select(); }
  if ((I.confirm || I.punch) && Game.stateT > 0.3) {
    if (Game.trainSel === TRAINING.length) {
      Sfx.select();
      startLevel(Game.levelIndex + 1);
      return;
    }
    const t = TRAINING[Game.trainSel];
    const lvl = Game.upgrades[t.key];
    const cost = trainCost(lvl);
    if (lvl >= 5) { Sfx.deny(); Game.trainMsg = { text: 'Jau maksimalus lygis!', t: 1.2 }; return; }
    if (Game.zenu < cost) { Sfx.deny(); Game.trainMsg = { text: 'Trūksta Zenu!', t: 1.2 }; return; }
    Game.zenu -= cost;
    Game.upgrades[t.key]++;
    saveRun();
    Sfx.buy();
    Game.trainMsg = { text: `${t.name}: ${Game.upgrades[t.key]} lygis!`, t: 1.2, color: t.color };
    burst(250, 360, t.color, 30, 300, 5, 0.6);
  }
}

function updateTimers(dt) {
  if (Game.banner) { Game.banner.t -= dt; if (Game.banner.t <= 0) Game.banner = null; }
  if (Game.hint) { Game.hint.t -= dt; if (Game.hint.t <= 0) Game.hint = null; }
}

function updatePlay(dt) {
  updateTimers(dt);
  if (Game.hitstop > 0) { Game.hitstop -= dt; return; }
  let edt = dt;
  if (Game.slowmo > 0) { Game.slowmo -= dt; edt = dt * 0.3; }
  const p = Game.player;

  p.update(p.state === 'transform' ? dt : edt);
  for (const e of Game.enemies) e.update(edt);
  for (const b of Game.bosses) b.update(edt);
  checkClash();
  updateBeams(edt);
  updateClash(edt);
  updateProjectiles(edt);
  updateBolts(edt);
  updateCoins(edt);
  updateParticles(edt);
  Game.enemies = Game.enemies.filter((e) => !e.remove);

  if (Game.comboTimer > 0) { Game.comboTimer -= dt; if (Game.comboTimer <= 0) Game.combo = 0; }

  updateScript(dt);

  if (p.state === 'dead' && p.stateT > 1.6 && Game.state === 'PLAY') {
    saveHighScore();
    Sfx.music(null);
    Sfx.lose();
    setState('GAMEOVER');
  }
}

function drawWorld(ctx) {
  for (const e of Game.enemies) e.draw(ctx);
  for (const b of Game.bosses) b.draw(ctx);
  if (Game.player) Game.player.draw(ctx);
  for (const b of Game.beams) drawBeam(ctx, b);
  drawClash(ctx);
  drawBolts(ctx);
  drawCoins(ctx);
  for (const pr of Game.projectiles) drawProjectile(ctx, pr);
  drawParticles(ctx);
  drawFloaters(ctx);
}

function render() {
  ctx.save();
  if (Game.shake > 0) ctx.translate(rand(-Game.shake, Game.shake), rand(-Game.shake, Game.shake));
  drawBackground(ctx);
  if (Game.state !== 'MENU') drawWorld(ctx);
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

// Testavimui / derinimui
window.Game = Game;
