'use strict';
// Helper friends fight with their own energy instead of Ki, and each one has their own K and L powers.
// L is held and released like the Ki Wave (3 charge levels, same energy cost), but does something else:
//  Raxas - SHADOW: K sword wave, L Shadow Rush (dashes through every enemy in the way and cuts through shots)
//  Nyx   - MANA:   K homing illusion orb, L Phantom Swarm (a fan of homing illusion moths)
//  Gale  - WIND:   K Wind Gust (pushes enemies away and blows their shots back), L Cyclone (a tornado that carries enemies along)
// Only Ren fires Ki Waves, so only Ren can win an ordinary beam clash; in the final Twin Wave every hero joins.

const POWER_INFO = {
  ren: { energy: 'KI', color: '#3aa0ff', label: '#bfe0ff', k: 'blast', l: 'wave', cry: 'KI WAVE!' },
  raxas: { energy: 'SHADOW', color: '#9a5cff', label: '#dcc4ff', k: 'slash', l: 'rush', cry: 'SHADOW RUSH!', power: 'rush', lName: 'Shadow Rush', kName: 'sword wave' },
  nyx: { energy: 'MANA', color: '#ff6fcf', label: '#ffd0f0', k: 'orb', l: 'swarm', cry: 'PHANTOM SWARM!', power: 'swarm', lName: 'Phantom Swarm', kName: 'illusion orb' },
  gale: { energy: 'WIND', color: '#3fe0b0', label: '#c8fff0', k: 'gust', l: 'cyclone', cry: 'CYCLONE!', power: 'cyclone', lName: 'Cyclone', kName: 'wind gust' },
};
function powerInfo(h) { return POWER_INFO[h && h.id] || POWER_INFO.ren; }

// ---------- Gale, the monk of the four winds (boss of level 7) ----------
Object.assign(STYLES, {
  galeTempest: Object.assign({}, STYLES.gale, { under: '#1a8fd0', belt: '#1a8fd0', boots: '#1a8fd0', band: '#1a8fd0', hairColor: '#bff8ff' }),
  galeHurricane: Object.assign({}, STYLES.gale, { gi: '#fff8e0', under: '#ffc840', belt: '#ffc840', boots: '#ffc840', band: '#ffc840', pants: '#f0e6c8', hairColor: '#fff2a0' }),
});
Object.assign(BEAM_COLORS, { wind: ['rgba(40,220,170,A)', 'rgba(220,255,245,A)'] });

const GALE_FORMS = [
  { id: 'base', name: 'Base Form', dmg: 1.6, speed: 290, style: 'gale', beam: 'wind', aura: 'rgba(60,230,190,A)', auraP: '#8ff5dc', drain: 0, kiRegen: 8, chargeRate: 1.2, widthMul: 1.1, ball: ['#e0fff6', 'rgba(40,220,170,0.6)'] },
  { id: 'tempest', name: 'Tempest Form', dmg: 3, speed: 340, style: 'galeTempest', beam: 'wind', aura: 'rgba(80,180,255,A)', auraP: '#a8dcff', drain: 6.5, kiRegen: 13, chargeRate: 2, widthMul: 1.8, teleport: true, ball: ['#e8f6ff', 'rgba(60,160,255,0.7)'], banner: '+200% damage, teleport (double-tap ← or →)' },
  { id: 'hurricane', name: 'Hurricane Form', dmg: 4, speed: 350, style: 'galeHurricane', beam: 'sky', aura: 'rgba(255,230,140,A)', auraP: '#fff0b0', drain: 0, kiRegen: 30, chargeRate: 2.5, widthMul: 2.2, teleport: true, ball: ['#ffffff', 'rgba(255,210,90,0.8)'], banner: 'Ultimate power!' },
];
CHARACTERS.gale = { id: 'gale', name: 'GALE', forms: GALE_FORMS, finalForm: 2, scale: 1.04, color: '#7ff0d8', wind: true };

// ---------- L: the friend's own power ----------
function releasePower(h) {
  const lvl = h.beamLevel;
  const info = powerInfo(h);
  h.ki = Math.max(0, h.ki - beamCost(lvl));
  if (h.controlled) Sfx.chargeStop();
  const dmg = BEAM_LEVELS[lvl].dmg * h.dmgMult * h.beamMul;
  if (lvl === 3) floater(h.x, h.y - 110, info.cry, h.F.auraP, 26);
  addShake(lvl * 2.5);
  if (info.power === 'rush') startRush(h, lvl, dmg);
  else if (info.power === 'swarm') releaseSwarm(h, lvl, dmg);
  else releaseCyclone(h, lvl, dmg);
}

// Raxas: Shadow Rush - a dash that hits every enemy on the way once (also through shields and blocks).
function startRush(h, lvl, dmg) {
  h.rush = { left: [0, 230, 390, 620][lvl], dmg: dmg * 0.8, lvl, hit: new Set(), ghostT: 0, power: { 1: 2, 2: 5, 3: 999 }[lvl] };
  h.setState('rush');
  h.invuln = Math.max(h.invuln, 0.15);
  Sfx.slash();
  Sfx.teleport();
}

function updateRush(h, dt) {
  const r = h.rush;
  const sp = 1250;
  h.vx = h.facing * sp;
  h.vy = 0;
  h.invuln = Math.max(h.invuln, 0.12);
  r.left -= sp * dt;
  r.ghostT -= dt;
  if (r.ghostT <= 0) { ghostAt(h); r.ghostT = 0.03; }
  if (Math.random() < 0.8) spawnParticle({ x: h.x - h.facing * rand(10, 40), y: h.y - rand(10, 80), vx: -h.facing * rand(100, 300), vy: rand(-30, 30), life: 0.3, size: rand(2, 4), color: h.F.auraP });
  const hb = { x: h.x - 42, y: h.y - 88, w: 84, h: 90 };
  for (const t of liveTargets()) {
    if (r.hit.has(t) || !rectsOverlap(hb, boxOf(t))) continue;
    r.hit.add(t);
    const dealt = t.takeHit(r.dmg, h.facing, 260, 'special');
    if (dealt) {
      onPlayerDamage(typeof dealt === 'number' ? dealt : r.dmg, h);
      burst(t.x, t.y - 45, h.F.auraP, 14, 300, 4, 0.35);
      burst(t.x, t.y - 45, '#ffffff', 6, 220, 3, 0.25);
      Sfx.hit();
      addShake(5);
      if (h.controlled) addHitstop(0.03);
    }
  }
  // the rush cuts through enemy shots on the way
  for (const pr of Game.projectiles) {
    if (r.power <= 0) break;
    if (pr.owner !== 'enemy' || pr.life <= 0 || uncancellable(pr)) continue;
    if (Math.abs(pr.x - h.x) < 46 + pr.r && pr.y > h.y - 95 && pr.y < h.y + 8) {
      r.power -= pr.power || 1;
      pr.life = 0;
      burst(pr.x, pr.y, '#ffffff', 8, 180, 3, 0.25);
      Sfx.cancel();
    }
  }
  if (r.left <= 0 || (h.facing < 0 && h.x <= 22) || (h.facing > 0 && h.x >= W - 22)) {
    h.vx = h.facing * 120;
    if (r.lvl === 3) { burst(h.x, h.y - 45, h.F.auraP, 30, 380, 5, 0.5); addShake(8); }
    h.fireDur = 0.22;
    h.setState('firing');
  }
}

// Nyx: Phantom Swarm - a fan of illusion moths that home in on enemies.
function releaseSwarm(h, lvl, dmg) {
  const n = { 1: 3, 2: 5, 3: 8 }[lvl];
  const each = dmg * 1.15 / n;
  const hd = h.hand();
  for (let i = 0; i < n; i++) {
    const a = (n === 1 ? 0 : i / (n - 1) - 0.5) * 1.7;
    Game.projectiles.push({
      x: hd.x, y: hd.y, vx: h.facing * Math.cos(a) * 380, vy: Math.sin(a) * 380, r: 11, dmg: each, owner: 'player', src: h, life: 3,
      homing: true, speed: 450 + i * 14, look: 'moth', inner: h.F.ball[0], outer: h.F.ball[1], trail: h.F.auraP, power: 1,
    });
  }
  burst(hd.x, hd.y, h.F.auraP, 16, 260, 4, 0.4);
  h.pose = POSES.fire();
  h.fireDur = 0.35;
  h.setState('firing');
  Sfx.beam(1);
  Sfx.teleport();
}

// Gale: Cyclone - a tornado rolls forward and hits each enemy inside it a few times, carrying it along.
function releaseCyclone(h, lvl, dmg) {
  const sc = { 1: 1, 2: 1.35, 3: 1.8 }[lvl];
  Game.projectiles.push({
    x: h.x + h.facing * 50, y: GROUND - 30 * sc, vx: h.facing * { 1: 190, 2: 220, 3: 250 }[lvl], vy: 0, r: 28 * sc, scale: sc,
    dmg: dmg * 0.32, owner: 'player', src: h, life: { 1: 1.8, 2: 2.6, 3: 3.4 }[lvl], type: 'cyclone',
    hits: new Map(), maxHits: { 1: 3, 2: 4, 3: 4 }[lvl], tick: 0.25, power: { 1: 3, 2: 6, 3: 999 }[lvl], trail: h.F.auraP, color: h.F.auraP,
  });
  burst(h.x + h.facing * 50, GROUND - 30, h.F.auraP, 18, 260, 4, 0.4);
  h.pose = POSES.fire();
  h.fireDur = 0.35;
  h.setState('firing');
  Sfx.wind();
  Sfx.beam(lvl);
}

function updateCyclone(pr, box, dt) {
  for (const t of liveTargets()) {
    if (!rectsOverlap(box, boxOf(t))) continue;
    const rec = pr.hits.get(t) || { n: 0, t: 0 };
    rec.t -= dt;
    if (rec.t <= 0 && rec.n < pr.maxHits) {
      rec.n++;
      rec.t = pr.tick;
      const dealt = t.takeHit(pr.dmg, sign(pr.vx), Math.abs(pr.vx) + 60, 'special');
      if (dealt) {
        onPlayerDamage(typeof dealt === 'number' ? dealt : pr.dmg, pr.src);
        burst(t.x, t.y - 45, pr.color, 8, 200, 3, 0.3);
        Sfx.hit();
      }
    }
    pr.hits.set(t, rec);
  }
  if (Math.random() < 0.7) {
    const a = Math.random() * Math.PI * 2;
    spawnParticle({ x: pr.x + Math.cos(a) * pr.r, y: pr.y + rand(-pr.r, pr.r), vx: -Math.sin(a) * 160, vy: rand(-140, -40), life: 0.35, size: rand(2, 4), color: Math.random() < 0.5 ? '#ffffff' : pr.color });
  }
}

// ---------- K: Gale's Wind Gust ----------
function windGust(h) {
  if (h.blastCd > 0) return;
  if (h.ki < 6) { floater(h.x, h.y - 95, 'Not enough Wind!', powerInfo(h).color, 15); return; }
  h.ki -= 6;
  h.blastCd = 0.4;
  h.setState('blast');
  h.pose = POSES.punch1();
  const reach = 210;
  const hb = { x: h.facing > 0 ? h.x : h.x - reach, y: h.y - 112, w: reach, h: 122 };
  const hit = hitTargets(hb, 5 * h.dmgMult, h.facing, 480, 'special', h);
  if (hit) Sfx.hit();
  // enemy shots in the gust are blown back at the enemies (falling and heavy ones just break apart)
  let reflected = 0;
  for (const pr of Game.projectiles) {
    if (pr.owner !== 'enemy' || pr.life <= 0 || uncancellable(pr)) continue;
    if (pr.x < hb.x - pr.r || pr.x > hb.x + hb.w + pr.r || pr.y < hb.y - pr.r || pr.y > hb.y + hb.h + pr.r) continue;
    if (pr.type === 'shard' || pr.type === 'gear' || pr.type === 'tornado' || pr.gravity) {
      pr.life = 0;
      burst(pr.x, pr.y, '#ffffff', 8, 180, 3, 0.25);
      continue;
    }
    pr.owner = 'player';
    pr.src = h;
    pr.homing = false;
    pr.vx = h.facing * Math.max(420, Math.abs(pr.vx) * 1.2);
    pr.vy *= 0.3;
    pr.dmg = Math.max(pr.dmg || 0, 8) * h.dmgMult * 0.8;
    pr.life = Math.max(pr.life, 1.5);
    pr.trail = h.F.auraP;
    reflected++;
  }
  if (reflected) { floater(h.x + h.facing * 80, h.y - 110, 'REFLECT!', '#c8fff0', 16); Sfx.cancel(); }
  const hd = h.hand();
  for (let i = 0; i < 18; i++) {
    spawnParticle({ x: hd.x + h.facing * rand(0, 30), y: hd.y + rand(-40, 40), vx: h.facing * rand(500, 900), vy: rand(-40, 40), life: rand(0.15, 0.3), size: rand(1.5, 3), color: i % 3 ? '#e8fffa' : h.F.auraP });
  }
  Sfx.wind();
}

// ---------- Team helpers ----------
// The hero you control is Game.player; the others are AI-controlled allies.
function setControlled(h) {
  Game.player = h;
  h.ai = null;
  Game.allies = Game.team.filter((x) => x !== h);
  for (const a of Game.allies) if (!a.ai) a.ai = new AllyAI(a);
}

// Who leads at the start of a level: 'ren', a friend id, or 'friend' (= the first friend).
function leadIdFor(friendIds) {
  const c = Game.controlChar;
  if (c === 'friend') return friendIds[0] || 'ren';
  return friendIds.includes(c) ? c : 'ren';
}
