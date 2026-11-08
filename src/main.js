'use strict';
// Žaidimo ciklas: atnaujinimas ir piešimas.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
Game.highScore = loadHighScore();
Input.setupTouch();

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
      if (anyConfirm() && Game.stateT > 0.2) { Sfx.unlock(); Sfx.select(); startLevel(0); }
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
      break;
    case 'GAMEOVER':
      updateParticles(dt);
      if (Game.stateT > 1 && (Input.pressed.confirm || Input.pressed.jump)) { Sfx.select(); startLevel(Game.checkpoint); }
      break;
    case 'VICTORY':
      updateParticles(dt);
      if (Math.random() < dt * 6) explosion(rand(100, W - 100), rand(80, 300), 0.5);
      if (Game.stateT > 1.5 && (Input.pressed.confirm || Input.pressed.jump)) { Sfx.select(); setState('MENU'); }
      break;
  }
  Game.shake = Math.max(0, Game.shake - 40 * dt);
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
  if (Game.boss) Game.boss.update(edt);
  checkClash();
  updateBeams(edt);
  updateClash(edt);
  updateProjectiles(edt);
  updateParticles(edt);
  Game.enemies = Game.enemies.filter((e) => !e.remove);

  if (Game.comboTimer > 0) { Game.comboTimer -= dt; if (Game.comboTimer <= 0) Game.combo = 0; }

  updateScript(dt);

  if (p.state === 'dead' && p.stateT > 1.6 && Game.state === 'PLAY') {
    saveHighScore();
    Sfx.lose();
    setState('GAMEOVER');
  }
}

function drawWorld(ctx) {
  for (const e of Game.enemies) e.draw(ctx);
  if (Game.boss) Game.boss.draw(ctx);
  if (Game.player) Game.player.draw(ctx);
  for (const b of Game.beams) drawBeam(ctx, b);
  drawClash(ctx);
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
  const dt = Math.min(0.05, (now - last) / 1000);
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
