'use strict';
// Coins: dropped by enemies, after a moment they fly to the hero.

const COIN_VALUES = { scout: 10, gunner: 15, drone: 15, armored: 25, bomber: 10, brute: 20, elite: 30, clone: 0, shade: 30, golem: 45, wisp: 25, doppel: 40, sniper: 35, mirrorclone: 0 };

function spawnCoins(x, y, value) {
  value = Math.round(value * diff().coins);   // harder difficulties pay more
  if (value <= 0) return;
  const n = clamp(Math.ceil(value / 10), 1, 14);
  const each = Math.ceil(value / n);
  for (let i = 0; i < n; i++) {
    Game.coins.push({ x, y, vx: rand(-160, 160), vy: rand(-420, -200), v: each, age: 0, spin: rand(0, 6) });
  }
}

function collectAllCoins() {
  for (const c of Game.coins) Game.money += c.v;
  Game.coins = [];
}

function updateCoins(dt) {
  for (const c of Game.coins) {
    const p = nearestHero(c.x);
    c.age += dt;
    c.spin += dt * 10;
    if (c.age > 0.6 && p && p.alive) {
      const dx = p.x - c.x, dy = (p.y - 40) - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = 300 + c.age * 700;
      c.vx = lerp(c.vx, (dx / d) * sp, Math.min(1, dt * 8));
      c.vy = lerp(c.vy, (dy / d) * sp, Math.min(1, dt * 8));
      if (d < 26) {
        c.dead = true;
        Game.money += c.v;
        Game.moneyFlash = 0.3;
        Sfx.coin();
        spawnParticle({ x: c.x, y: c.y, vx: 0, vy: -40, life: 0.25, size: 4, color: '#ffe680' });
      }
    } else {
      c.vy += GRAVITY * 0.8 * dt;
      if (c.y > GROUND - 6) { c.y = GROUND - 6; c.vy *= -0.4; c.vx *= 0.7; }
    }
    c.x += c.vx * dt;
    c.y += c.vy * dt;
  }
  Game.coins = Game.coins.filter((c) => !c.dead);
  if (Game.moneyFlash > 0) Game.moneyFlash -= dt;
}

function drawCoins(ctx) {
  for (const c of Game.coins) {
    const sx = Math.abs(Math.cos(c.spin));
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(Math.max(0.15, sx), 1);
    ctx.fillStyle = '#c8901a';
    ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd34a';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff6c0';
    ctx.fillRect(-1, -3, 2, 6);
    ctx.restore();
  }
}
