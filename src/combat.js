'use strict';
// Pataikymai, šūviai, bangos ir bangų kova.

function liveTargets() {
  const t = Game.enemies.filter((e) => !e.dead);
  if (Game.boss && !Game.boss.dead) t.push(Game.boss);
  return t;
}

// Žaidėjo padaryta žala: Jėga, kombinacijos, taškai.
function onPlayerDamage(dmg) {
  const p = Game.player;
  if (p.form === 0) p.gainPower(dmg * 0.35);
  Game.combo++;
  Game.comboTimer = 2.2;
  Game.score += Math.round(dmg);
  if (Game.combo % 10 === 0) {
    p.gainPower(10);
    floater(p.x, p.y - 120, `KOMBO x${Game.combo}! +Jėga`, '#ffd34a', 20);
  }
}

// Smūgis stačiakampiu: grąžina true, jei kažkam pataikė.
function hitTargets(hb, dmg, dir, knock) {
  let hit = false;
  for (const t of liveTargets()) {
    if (rectsOverlap(hb, boxOf(t))) {
      if (t.takeHit(dmg, dir, knock)) { hit = true; onPlayerDamage(dmg); }
    }
  }
  return hit;
}

function beamRect(b) {
  const x1 = b.x + b.dir * b.len;
  const left = Math.min(b.x, x1);
  return { x: left, y: b.y - b.width / 2, w: Math.abs(x1 - b.x), h: b.width };
}

function updateBeams(dt) {
  const p = Game.player;
  for (const b of Game.beams) {
    // banga lieka prisegta prie rankų
    if (b.owner === 'player' && p.alive) { const h = p.hand(); b.x = h.x; b.y = h.y; }
    if (b.owner === 'boss' && Game.boss) { const h = Game.boss.hand(); b.x = h.x; b.y = h.y; }
    if (!b.clash) b.life -= dt;
    if (b.clash) continue;

    const r = beamRect(b);
    if (b.owner === 'player') {
      const targets = liveTargets()
        .filter((t) => !b.hit.has(t) && rectsOverlap(r, boxOf(t)))
        .sort((a, c) => Math.abs(a.x - b.x) - Math.abs(c.x - b.x));
      for (const t of targets) {
        if (b.hit.size >= b.pierce) break;
        b.hit.add(t);
        if (t.takeHit(b.dmg, b.dir, b.knock)) {
          onPlayerDamage(b.dmg);
          explosion(t.x, t.y - 45, b.level >= 3 ? 1 : 0.6);
          addHitstop(0.06);
          addShake(4 + b.level * 2);
          Sfx.hit();
        }
      }
      // banga sunaikina priešų šūvius
      for (const pr of Game.projectiles) {
        if (pr.owner === 'enemy' && pr.x > r.x && pr.x < r.x + r.w && Math.abs(pr.y - b.y) < b.width / 2 + pr.r) {
          pr.life = 0;
          burst(pr.x, pr.y, '#ffffff', 6, 150, 3, 0.25);
        }
      }
    } else if (b.owner === 'boss') {
      if (!b.hit.has(p) && p.alive && rectsOverlap(r, boxOf(p))) {
        if (p.takeHit(b.dmg, b.dir, b.knock)) b.hit.add(p);
      }
    }
  }
  Game.beams = Game.beams.filter((b) => b.life > 0);
}

function updateProjectiles(dt) {
  const p = Game.player;
  for (const pr of Game.projectiles) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.x < -60 || pr.x > W + 60 || pr.y > GROUND + 10) pr.life = 0;
    if (pr.life <= 0) continue;
    if (Math.random() < 0.5) spawnParticle({ x: pr.x, y: pr.y + rand(-3, 3), vx: -pr.vx * 0.1, vy: rand(-20, 20), life: 0.2, size: 2.5, color: pr.owner === 'player' ? '#bfe6ff' : '#ffb070' });
    const pb = { x: pr.x - pr.r, y: pr.y - pr.r, w: pr.r * 2, h: pr.r * 2 };
    if (pr.owner === 'player') {
      for (const t of liveTargets()) {
        if (rectsOverlap(pb, boxOf(t))) {
          if (t.takeHit(pr.dmg, sign(pr.vx), 110)) onPlayerDamage(pr.dmg);
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

// ---------- Bangų kova ----------
function checkClash() {
  if (Game.clash) return;
  const p = Game.player, boss = Game.boss;
  if (!boss || boss.dead || !p.alive) return;
  const bb = Game.beams.find((b) => b.owner === 'boss' && b.life > 0);
  if (!bb) return;
  const facingBoss = p.facing === -bb.dir && (boss.x - p.x) * p.facing > 0;
  if (!facingBoss) return;
  let pb = Game.beams.find((b) => b.owner === 'player' && b.life > 0);
  const handY = p.hand().y;
  if (Math.abs(handY - bb.y) > bb.width / 2 + 28) return;
  if (!pb && p.state === 'charging') pb = p.releaseBeam(true);
  if (!pb) return;
  pb.clash = true; bb.clash = true;
  p.setState('clash');
  boss.setState('clash');
  p.invuln = 0;
  Game.clash = { pb, bb, push: 0.42 + pb.level * 0.05, t: 0 };
}

function updateClash(dt) {
  const c = Game.clash;
  if (!c) return;
  const p = Game.player, boss = Game.boss;
  c.t += dt;
  c.push -= (boss.enraged ? 0.2 : 0.16) * dt;
  if (Input.pressed.beam || Input.pressed.blast || Input.pressed.punch) {
    c.push += p.form > 0 ? 0.06 : 0.042;
    Sfx.clashTick();
  }
  const ph = p.hand(), bh = boss.hand();
  c.pb.x = ph.x; c.pb.y = ph.y;
  c.bb.x = bh.x; c.bb.y = ph.y;
  const mx = lerp(ph.x, bh.x, clamp(c.push, 0, 1));
  c.mx = mx; c.my = ph.y;
  c.pb.len = Math.abs(mx - ph.x);
  c.bb.len = Math.abs(bh.x - mx);
  addShake(4);
  for (let i = 0; i < 3; i++) {
    const a = Math.random() * Math.PI * 2, s = rand(100, 400);
    spawnParticle({ x: mx, y: ph.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35, size: rand(2, 5), color: Math.random() < 0.5 ? '#ffffff' : (p.form > 0 ? '#ffe680' : '#9fdcff') });
  }

  let result = 0;
  if (c.push >= 1) result = 1;
  else if (c.push <= 0) result = -1;
  else if (c.t > 8) result = c.push >= 0.5 ? 1 : -1;
  if (!result) return;

  Game.clash = null;
  Game.beams = Game.beams.filter((b) => b !== c.pb && b !== c.bb);
  Game.flash = 0.35;
  if (result > 0) {
    p.setState('normal');
    boss.setState('stunned');
    explosion(boss.x, boss.y - 50, 1.6);
    Sfx.explode();
    addShake(14);
    const dmg = 90 * p.dmgMult;
    boss.takeHit(dmg, p.facing, 300);
    onPlayerDamage(dmg);
    showBanner('BANGŲ KOVA LAIMĖTA!', '', 1.4);
  } else {
    explosion(p.x, p.y - 50, 1.2);
    Sfx.explode();
    p.setState('normal');
    p.invuln = 0;
    p.takeHit(30, boss.facing, 400);
    boss.recover(0.8);
  }
}

function drawClash(ctx) {
  const c = Game.clash;
  if (!c || c.mx === undefined) return;
  const flame = Game.player.form > 0;
  drawEnergyBall(ctx, c.mx, c.my, 26, '#ffffff', flame ? 'rgba(255,190,80,0.8)' : 'rgba(170,150,255,0.8)', Game.time);
}
