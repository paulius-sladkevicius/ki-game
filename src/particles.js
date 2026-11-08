'use strict';
// Dalelės (aura, sprogimai) ir skraidantys skaičiai.

function spawnParticle(o) {
  if (Game.particles.length > 900) return;
  const p = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 0.5, size: 4, color: '#fff', grav: 0, drag: 0 }, o);
  p.max = p.life;
  Game.particles.push(p);
}

function burst(x, y, color, n = 12, speed = 250, size = 4, life = 0.5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(speed * 0.3, speed);
    spawnParticle({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(life * 0.5, life), size: rand(size * 0.5, size), color, drag: 3 });
  }
}

function explosion(x, y, scale = 1) {
  burst(x, y, '#ffffff', 10 * scale, 200 * scale, 6 * scale, 0.4);
  burst(x, y, '#ffd04a', 18 * scale, 320 * scale, 7 * scale, 0.6);
  burst(x, y, '#ff6a2a', 14 * scale, 260 * scale, 8 * scale, 0.8);
}

// Aura: dalelės kyla aukštyn aplink kūną.
function auraParticles(x, y, h, color, n = 2, width = 26) {
  for (let i = 0; i < n; i++) {
    spawnParticle({
      x: x + rand(-width, width), y: y - rand(0, h),
      vx: rand(-20, 20), vy: rand(-260, -120),
      life: rand(0.25, 0.5), size: rand(2, 5), color,
    });
  }
}

function updateParticles(dt) {
  const ps = Game.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    if (p.drag) {
      const k = 1 - Math.min(1, p.drag * dt);
      p.vx *= k; p.vy *= k;
    }
    p.vy += p.grav * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  const fs = Game.floaters;
  for (let i = fs.length - 1; i >= 0; i--) {
    const f = fs[i];
    f.life -= dt;
    f.y -= 50 * dt;
    if (f.life <= 0) fs.splice(i, 1);
  }
}

function drawParticles(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of Game.particles) {
    const t = p.life / p.max;
    ctx.globalAlpha = Math.min(1, t * 1.5);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * (0.4 + 0.6 * t)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloaters(ctx) {
  ctx.save();
  ctx.textAlign = 'center';
  for (const f of Game.floaters) {
    ctx.globalAlpha = Math.min(1, f.life / f.max * 2);
    ctx.font = `bold ${f.size}px system-ui, sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
}
