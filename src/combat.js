'use strict';
// Hits, projectiles, beams and beam clashes.
// Hit kind: 'melee' = body, 'blast' = Ki blast, 'beam' = wave, 'beam3' = level 3 wave (breaks shields).

function liveTargets() {
  const t = Game.enemies.filter((e) => !e.dead);
  for (const b of Game.bosses) if (!b.dead) t.push(b);
  return t;
}

// Damage dealt by a hero: Power for that hero, combos, score.
function onPlayerDamage(dmg, src) {
  const p = src && src.gainPower ? src : Game.player;
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
function hitTargets(hb, dmg, dir, knock, kind = 'melee', src = null) {
  let first = null;
  for (const t of liveTargets()) {
    if (rectsOverlap(hb, boxOf(t))) {
      const dealt = t.takeHit(dmg, dir, knock, kind);
      if (dealt) { if (!first) first = t; onPlayerDamage(typeof dealt === 'number' ? dealt : dmg, src); }
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
  for (const b of Game.beams) {
    // the beam stays attached to the hands
    if (b.owner === 'player' && b.src && b.src.alive) { const h = b.src.hand(); b.x = h.x; b.y = h.y; }
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
          onPlayerDamage(typeof dealt === 'number' ? dealt : b.dmg, b.src);
          explosion(t.x, t.y - 45, b.level >= 3 ? 1 : 0.6);
          if (b.src === Game.player) addHitstop(0.06);
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
      for (const h of liveHeroes()) {
        if (!b.hit.has(h) && rectsOverlap(r, boxOf(h))) {
          if (h.takeHit(b.dmg, b.dir, b.knock)) b.hit.add(h);
        }
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

// ---------- Ground hazards: a glowing warning, then a pillar erupts ----------
// kind 'shadow' (dark pillar) or 'lightning' (bolt from the sky).
function addHazard(x, kind, src) {
  const tell = kind === 'lightning' ? 0.65 : 0.85;
  Game.hazards.push({ x, kind, src, t: 0, tell, life: tell + 0.35, w: kind === 'lightning' ? 40 : 52, dmg: kind === 'lightning' ? 15 : 14, hit: new Set() });
}

function updateHazards(dt) {
  for (const z of Game.hazards) {
    const before = z.t;
    z.t += dt;
    if (before < z.tell && z.t >= z.tell) {
      addShake(4);
      if (z.kind === 'lightning') { Sfx.zap(); Game.flash = Math.max(Game.flash, 0.12); } else Sfx.boom();
      burst(z.x, GROUND - 10, z.kind === 'lightning' ? '#fff6a0' : '#a070ff', 14, 260, 4, 0.4);
    }
    if (z.t >= z.tell) {
      const top = z.kind === 'lightning' ? -10 : GROUND - 170;
      for (const h of liveHeroes()) {
        if (z.hit.has(h)) continue;
        if (Math.abs(h.x - z.x) < z.w / 2 + h.w / 2 - 6 && h.y > top + 40) {
          z.hit.add(h);
          h.takeHit(z.dmg, sign(h.x - z.x) || 1, 260);
        }
      }
    }
  }
  Game.hazards = Game.hazards.filter((z) => z.t < z.life);
}

function drawHazards(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const z of Game.hazards) {
    const light = z.kind === 'lightning';
    if (z.t < z.tell) {
      // warning glow on the ground
      const k = z.t / z.tell;
      ctx.globalAlpha = 0.3 + 0.5 * k * (0.6 + 0.4 * Math.sin(Game.time * 30));
      ctx.fillStyle = light ? '#fff6a0' : '#a070ff';
      ctx.beginPath(); ctx.ellipse(z.x, GROUND + 2, z.w * (0.5 + 0.5 * k), 7, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      const k = 1 - (z.t - z.tell) / (z.life - z.tell);
      ctx.globalAlpha = k;
      if (light) {
        ctx.strokeStyle = '#fff6a0'; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(z.x + rand(-6, 6), 0);
        for (let y = 60; y <= GROUND; y += 60) ctx.lineTo(z.x + rand(-14, 14), y);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
      } else {
        const top = GROUND - 170 * Math.min(1, (z.t - z.tell) * 8);
        const g = ctx.createLinearGradient(0, top, 0, GROUND);
        g.addColorStop(0, 'rgba(160,100,255,0)'); g.addColorStop(0.3, 'rgba(140,70,255,0.9)'); g.addColorStop(1, 'rgba(60,10,120,0.9)');
        ctx.fillStyle = g;
        ctx.fillRect(z.x - z.w / 2, top, z.w, GROUND - top);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(z.x - 4, top, 8, GROUND - top);
      }
    }
  }
  ctx.restore();
}

function updateProjectiles(dt) {
  collideProjectiles();
  for (const pr of Game.projectiles) {
    if (pr.homing && pr.life > 0) {
      // homing orbs slowly turn towards the closest hero
      const h = nearestHero(pr.x);
      if (h && h.alive) {
        const dx = h.x - pr.x, dy = (h.y - 45) - pr.y, d = Math.hypot(dx, dy) || 1;
        pr.vx += (dx / d * pr.speed - pr.vx) * Math.min(1, dt * 1.6);
        pr.vy += (dy / d * pr.speed - pr.vy) * Math.min(1, dt * 1.6);
      }
    }
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.x < -60 || pr.x > W + 60 || pr.y > GROUND + 10) pr.life = 0;
    if (pr.type === 'shard' && pr.y > GROUND - 8) { pr.life = 0; burst(pr.x, GROUND - 6, '#9ff0ff', 8, 160, 3, 0.3); }
    if (pr.life <= 0) continue;
    if (Math.random() < 0.5) spawnParticle({ x: pr.x, y: pr.y + rand(-3, 3), vx: -pr.vx * 0.1, vy: rand(-20, 20), life: 0.2, size: 2.5, color: pr.trail || (pr.owner === 'player' ? '#bfe6ff' : '#ffb070') });
    const pb = { x: pr.x - pr.r, y: pr.y - pr.r, w: pr.r * 2, h: pr.r * 2 };
    if (pr.owner === 'player') {
      for (const t of liveTargets()) {
        if (rectsOverlap(pb, boxOf(t))) {
          const dealt = t.takeHit(pr.dmg, sign(pr.vx), 110, 'blast');
          if (dealt) onPlayerDamage(typeof dealt === 'number' ? dealt : pr.dmg, pr.src);
          burst(pr.x, pr.y, '#bfe6ff', 8, 180, 3, 0.3);
          Sfx.hit();
          pr.life = 0;
          break;
        }
      }
    } else {
      for (const h of liveHeroes()) {
        if (rectsOverlap(pb, boxOf(h))) {
          const dir = pr.vx ? sign(pr.vx) : sign(h.x - pr.x);
          if (h.takeHit(pr.dmg, dir, pr.type === 'tornado' ? 420 : 200)) { if (pr.type !== 'tornado') pr.life = 0; break; }
        }
      }
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
  let pb = Game.beams.find((b) => b.owner === 'player' && b.src === p && b.life > 0);
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
  // In the final clash the ally joins with a second beam and helps push.
  const a = Game.ally;
  if (opts.final && a && a.alive) {
    // the ally stands right behind the hero you control and fires alongside
    a.x = clamp(p.x - p.facing * 55, 20, W - 20);
    a.y = p.y; a.vy = 0;
    a.facing = sign(boss.x - a.x);
    a.beamLevel = 3;
    a.pose = POSES.fire();
    const ab = a.releaseBeam(true);
    ab.clash = true;
    Game.clash.ab = ab;
    Game.clash.rate *= 0.75;
    showBanner('TWIN WAVE!', `${p.char.name} & ${a.char.name}`, 1.6);
  }
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
  if (c.ab) {
    const ah = c.ab.src.hand();
    c.ab.x = ah.x; c.ab.y = ah.y;
    c.ab.dir = sign(mx - ah.x);
    c.ab.len = Math.abs(mx - ah.x);
  }
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
  Game.beams = Game.beams.filter((b) => b !== c.pb && b !== c.bb && b !== c.ab);
  if (c.ab && c.ab.src.alive) c.ab.src.setState('normal');
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
      if (dealt) onPlayerDamage(dmg, p);
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
