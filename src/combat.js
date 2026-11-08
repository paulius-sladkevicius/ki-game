'use strict';
// Hits, projectiles, beams and beam clashes.
// Hit kind: 'melee' = body, 'blast' = Ki blast, 'beam' = wave, 'beam3' = level 3 wave (breaks shields).

function liveTargets() {
  const t = Game.enemies.filter((e) => !e.dead);
  for (const b of Game.bosses) if (!b.dead) t.push(b);
  return t;
}

// Damage dealt by the player: Power, combos, score.
function onPlayerDamage(dmg) {
  const p = Game.player;
  if (p.form === 0) p.gainPower(dmg * 0.35);
  Game.combo++;
  Game.comboTimer = 2.2;
  Game.score += Math.round(dmg);
  if (Game.combo % 10 === 0) {
    p.gainPower(10);
    floater(p.x, p.y - 120, `COMBO x${Game.combo}! +Power`, '#ffd34a', 20);
  }
}

// Rectangle hit: returns the first target hit (or null).
function hitTargets(hb, dmg, dir, knock, kind = 'melee') {
  let first = null;
  for (const t of liveTargets()) {
    if (rectsOverlap(hb, boxOf(t))) {
      const dealt = t.takeHit(dmg, dir, knock, kind);
      if (dealt) { if (!first) first = t; onPlayerDamage(typeof dealt === 'number' ? dealt : dmg); }
    }
  }
  return first;
}

function beamRect(b) {
  const x1 = b.x + b.dir * b.len;
  const left = Math.min(b.x, x1);
  return { x: left, y: b.y - b.width / 2, w: Math.abs(x1 - b.x), h: b.width };
}

function updateBeams(dt) {
  const p = Game.player;
  for (const b of Game.beams) {
    // the beam stays attached to the hands
    if (b.owner === 'player' && p.alive) { const h = p.hand(); b.x = h.x; b.y = h.y; }
    if (b.owner === 'boss' && b.src && !b.src.dead) { const h = b.src.hand(); b.x = h.x; b.y = h.y; }
    if (b.clash) continue;
    b.life -= dt;

    const r = beamRect(b);
    if (b.owner === 'player') {
      const kind = b.level >= 3 ? 'beam3' : 'beam';
      const targets = liveTargets()
        .filter((t) => !b.hit.has(t) && rectsOverlap(r, boxOf(t)))
        .sort((a, c) => Math.abs(a.x - b.x) - Math.abs(c.x - b.x));
      for (const t of targets) {
        if (b.hit.size >= b.pierce) break;
        b.hit.add(t);
        const dealt = t.takeHit(b.dmg, b.dir, b.knock, kind);
        if (dealt) {
          onPlayerDamage(typeof dealt === 'number' ? dealt : b.dmg);
          explosion(t.x, t.y - 45, b.level >= 3 ? 1 : 0.6);
          addHitstop(0.06);
          addShake(4 + b.level * 2);
          Sfx.hit();
        }
      }
      // the beam and enemy projectiles cancel each other: each shot uses up some of the beam's power
      for (const pr of Game.projectiles) {
        if (b.power <= 0) break;
        if (pr.owner === 'enemy' && pr.life > 0 && pr.type !== 'groundwave' && pr.x > r.x && pr.x < r.x + r.w && Math.abs(pr.y - b.y) < b.width / 2 + pr.r) {
          const used = Math.min(b.power, pr.power || 1);
          b.power -= used;
          pr.power = (pr.power || 1) - used;
          if (pr.power <= 0) pr.life = 0;
          burst(pr.x, pr.y, '#ffffff', 8, 180, 3, 0.25);
          Sfx.cancel();
          if (b.power <= 0) {
            // the beam is spent: it stops at the collision point and fades out
            b.len = Math.abs(pr.x - b.x);
            b.life = Math.min(b.life, 0.12);
            floater(pr.x, pr.y - 20, 'CANCELLED', '#ffffff', 14);
          }
        }
      }
    } else if (b.owner === 'boss') {
      // a boss beam swallows the player's Ki blasts
      for (const pr of Game.projectiles) {
        if (pr.owner === 'player' && pr.life > 0 && pr.x > r.x && pr.x < r.x + r.w && Math.abs(pr.y - b.y) < b.width / 2 + pr.r) {
          pr.life = 0;
          burst(pr.x, pr.y, '#ffffff', 6, 150, 3, 0.25);
        }
      }
      if (!b.hit.has(p) && p.alive && rectsOverlap(r, boxOf(p))) {
        if (p.takeHit(b.dmg, b.dir, b.knock)) b.hit.add(p);
      }
    }
  }
  Game.beams = Game.beams.filter((b) => b.life > 0);
}

// Player shots and enemy shots that meet cancel each other out.
// Every shot has a power (default 1, a boss sword wave 2): the weaker one disappears,
// the stronger one loses that much power; equal shots both disappear.
function collideProjectiles() {
  const mine = Game.projectiles.filter((pr) => pr.owner === 'player' && pr.life > 0);
  if (!mine.length) return;
  const theirs = Game.projectiles.filter((pr) => pr.owner === 'enemy' && pr.life > 0 && pr.type !== 'groundwave');
  for (const a of mine) {
    for (const b of theirs) {
      if (a.life <= 0) break;
      if (b.life <= 0) continue;
      const rr = a.r + b.r;
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 > rr * rr) continue;
      const pa = a.power || 1, pb = b.power || 1;
      const used = Math.min(pa, pb);
      a.power = pa - used;
      b.power = pb - used;
      if (a.power <= 0) a.life = 0;
      if (b.power <= 0) b.life = 0;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      burst(mx, my, '#ffffff', 10, 220, 3, 0.3);
      burst(mx, my, a.trail || '#bfe6ff', 6, 160, 3, 0.3);
      Sfx.cancel();
    }
  }
}

function updateProjectiles(dt) {
  const p = Game.player;
  collideProjectiles();
  for (const pr of Game.projectiles) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.x < -60 || pr.x > W + 60 || pr.y > GROUND + 10) pr.life = 0;
    if (pr.life <= 0) continue;
    if (Math.random() < 0.5) spawnParticle({ x: pr.x, y: pr.y + rand(-3, 3), vx: -pr.vx * 0.1, vy: rand(-20, 20), life: 0.2, size: 2.5, color: pr.trail || (pr.owner === 'player' ? '#bfe6ff' : '#ffb070') });
    const pb = { x: pr.x - pr.r, y: pr.y - pr.r, w: pr.r * 2, h: pr.r * 2 };
    if (pr.owner === 'player') {
      for (const t of liveTargets()) {
        if (rectsOverlap(pb, boxOf(t))) {
          const dealt = t.takeHit(pr.dmg, sign(pr.vx), 110, 'blast');
          if (dealt) onPlayerDamage(typeof dealt === 'number' ? dealt : pr.dmg);
          burst(pr.x, pr.y, '#bfe6ff', 8, 180, 3, 0.3);
          Sfx.hit();
          pr.life = 0;
          break;
        }
      }
    } else if (p.alive && rectsOverlap(pb, boxOf(p))) {
      if (p.takeHit(pr.dmg, sign(pr.vx), 200)) pr.life = 0;
    }
  }
  Game.projectiles = Game.projectiles.filter((pr) => pr.life > 0);
}

function updateBolts(dt) {
  for (const b of Game.bolts) b.life -= dt;
  Game.bolts = Game.bolts.filter((b) => b.life > 0);
}

// ---------- Beam clash ----------
function checkClash() {
  if (Game.clash) return;
  const p = Game.player;
  if (!p.alive) return;
  const bb = Game.beams.find((b) => b.owner === 'boss' && b.life > 0 && b.src && !b.src.dead);
  if (!bb) return;
  const boss = bb.src;
  const facingBoss = p.facing === -bb.dir && (boss.x - p.x) * p.facing > 0;
  if (!facingBoss) return;
  let pb = Game.beams.find((b) => b.owner === 'player' && b.life > 0);
  const handY = p.hand().y;
  if (Math.abs(handY - bb.y) > bb.width / 2 + 28) return;
  if (!pb && p.state === 'charging') pb = p.releaseBeam(true);
  if (!pb) return;
  startClash(pb, bb);
}

function startClash(pb, bb, opts = {}) {
  const p = Game.player, boss = bb.src;
  pb.clash = true; bb.clash = true;
  p.setState('clash');
  boss.setState('clash');
  p.invuln = 0;
  Game.clash = { pb, bb, boss, push: 0.42 + pb.level * 0.05, t: 0, rate: opts.rate || (boss.enraged ? 0.2 : 0.16), final: !!opts.final };
}

function updateClash(dt) {
  const c = Game.clash;
  if (!c) return;
  const p = Game.player, boss = c.boss;
  c.t += dt;
  c.push -= c.rate * dt;
  if (Input.pressed.beam || Input.pressed.blast || Input.pressed.punch) {
    c.push += 0.03 + p.F.dmg * 0.012;
    Sfx.clashTick();
  }
  const ph = p.hand(), bh = boss.hand();
  c.pb.x = ph.x; c.pb.y = ph.y;
  c.bb.x = bh.x; c.bb.y = ph.y;
  const mx = lerp(ph.x, bh.x, clamp(c.push, 0, 1));
  c.mx = mx; c.my = ph.y;
  c.pb.len = Math.abs(mx - ph.x);
  c.bb.len = Math.abs(bh.x - mx);
  addShake(c.final ? 7 : 4);
  for (let i = 0; i < (c.final ? 6 : 3); i++) {
    const a = Math.random() * Math.PI * 2, s = rand(100, 400);
    spawnParticle({ x: mx, y: ph.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35, size: rand(2, 5), color: Math.random() < 0.5 ? '#ffffff' : p.F.auraP });
  }

  let result = 0;
  if (c.push >= 1) result = 1;
  else if (c.push <= 0) result = -1;
  else if (c.t > 9) result = c.push >= 0.5 ? 1 : -1;
  if (!result) return;

  Game.clash = null;
  Game.beams = Game.beams.filter((b) => b !== c.pb && b !== c.bb);
  Game.flash = c.final ? 0.9 : 0.35;
  if (result > 0) {
    p.setState('normal');
    explosion(boss.x, boss.y - 50, c.final ? 3 : 1.6);
    Sfx.explode();
    addShake(c.final ? 20 : 14);
    if (c.final) {
      boss.finalBlow();
    } else {
      boss.setState('stunned');
      const dmg = 90 * p.dmgMult;
      const dealt = boss.takeHit(dmg, p.facing, 300, 'clash');
      if (dealt) onPlayerDamage(dmg);
      showBanner('BEAM CLASH WON!', '', 1.4);
    }
  } else {
    explosion(p.x, p.y - 50, 1.2);
    Sfx.explode();
    p.setState('normal');
    p.invuln = 0;
    p.takeHit(c.final ? 25 : 30, boss.facing, 400);
    boss.recover(0.8);
  }
}

function drawClash(ctx) {
  const c = Game.clash;
  if (!c || c.mx === undefined) return;
  drawEnergyBall(ctx, c.mx, c.my, c.final ? 40 : 26, '#ffffff', c.final ? 'rgba(255,255,255,0.8)' : 'rgba(170,150,255,0.8)', Game.time);
}

function drawBolts(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const b of Game.bolts) {
    const a = b.life / b.max;
    const segs = 7;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? b.color : '#ffffff';
      ctx.globalAlpha = a * (pass === 0 ? 0.6 : 1);
      ctx.lineWidth = pass === 0 ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      for (let i = 1; i < segs; i++) {
        const t = i / segs;
        const j = Math.sin(b.seed + i * 12.9 + Game.time * 40) * 14;
        ctx.lineTo(lerp(b.x1, b.x2, t) + j * 0.4, lerp(b.y1, b.y2, t) + j);
      }
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
