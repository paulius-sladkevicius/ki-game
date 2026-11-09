'use strict';
// Special techniques: one is unlocked after each completed level and equipped into two slots
// (key I / ① and key O / ②). Any learned technique can go into either slot. The recharge time belongs
// to the technique itself, so ultimates stay rare wherever they are equipped. Each hero has its own cooldowns.
// 'slot' below is the technique's kind: 1 = quick, 2 = ultimate (also its default slot).

const SPECIALS = [
  { id: 'afterimage', name: 'Afterimage Dash', slot: 1, cd: 10, unlock: 0, icon: '»', color: '#bfe0ff', desc: 'dash through enemies, briefly untouchable' },
  { id: 'flash', name: 'Flash Burst', slot: 1, cd: 18, unlock: 1, icon: '✺', color: '#fff6a0', desc: 'blinding flash: enemies freeze for 2.5 s' },
  { id: 'cry', name: 'Battle Cry', slot: 1, cd: 12, unlock: 2, icon: '◎', color: '#9fffb0', desc: 'shockwave: pushes enemies away, erases their shots' },
  { id: 'disc', name: 'Ki Disc', slot: 1, cd: 14, unlock: 3, icon: '◑', color: '#ffe14d', desc: 'a cutting disc that goes through everything' },
  { id: 'surge', name: 'Crimson Surge', slot: 2, cd: 45, unlock: 4, icon: '♦', color: '#ff5a4a', desc: '8 s of double damage and speed, costs HP' },
  { id: 'blink', name: 'Blink Strike', slot: 1, cd: 8, unlock: 5, icon: '↯', color: '#7ff0d8', desc: 'teleport behind the nearest enemy and strike' },
  { id: 'meteor', name: 'Meteor Rush', slot: 2, cd: 40, unlock: 6, icon: '✦', color: '#ffb060', desc: 'a 6-hit rush that ends with a slam' },
  { id: 'phoenix', name: 'Phoenix Fist', slot: 2, cd: 50, unlock: 7, icon: '❂', color: '#ff8a3a', desc: 'a fire bird flies across the whole screen' },
  { id: 'sphere', name: 'World Sphere', slot: 2, cd: 60, unlock: 8, icon: '●', color: '#9fdcff', desc: 'raise a giant sphere, then throw it: huge damage' },
  { id: 'instinct', name: 'Silent Instinct', slot: 2, cd: 60, unlock: 9, icon: '✧', color: '#e8e8ff', desc: 'for 6 s you dodge every attack' },
];
const SPECIAL_BY_ID = Object.fromEntries(SPECIALS.map((s) => [s.id, s]));

function specialCooldown(sp) { return sp.cd * (diff().specialCd || 1); }
// Remaining recharge time of a technique for a hero.
function techCooldown(h, id) { return (h && h.techCd && h.techCd[id]) || 0; }
// How much of the recharge is left (0 = ready, 1 = just used).
function techCooldownFrac(h, id) { return id ? clamp(techCooldown(h, id) / specialCooldown(SPECIAL_BY_ID[id]), 0, 1) : 0; }

// Techniques owned in this run; levels already completed always count.
function ensureTechs() {
  Game.techs = Game.techs || [];
  const done = loadProgress();
  for (const sp of SPECIALS) if (sp.unlock < done && !Game.techs.includes(sp.id)) Game.techs.push(sp.id);
  Game.equip = Game.equip || { 1: null, 2: null };
  for (const slot of [1, 2]) {
    if (Game.equip[slot] && !Game.techs.includes(Game.equip[slot])) Game.equip[slot] = null;
  }
  if (Game.equip[1] && Game.equip[1] === Game.equip[2]) Game.equip[2] = null;
  for (const slot of [1, 2]) {
    // fill an empty slot: a technique of its own kind first, otherwise any other learned one
    if (Game.equip[slot]) continue;
    const other = Game.equip[slot === 1 ? 2 : 1];
    Game.equip[slot] = Game.techs.find((id) => SPECIAL_BY_ID[id].slot === slot && id !== other) || null;
  }
}

// Called after a level is completed: unlock its technique. Returns it (or null).
function unlockTechForLevel(levelIndex) {
  const sp = SPECIALS.find((s) => s.unlock === levelIndex);
  if (!sp) return null;
  Game.techs = Game.techs || [];
  if (Game.techs.includes(sp.id)) return null;
  Game.techs.push(sp.id);
  Game.equip = Game.equip || { 1: null, 2: null };
  if (!Game.equip[sp.slot]) Game.equip[sp.slot] = sp.id;
  else if (!Game.equip[sp.slot === 1 ? 2 : 1]) Game.equip[sp.slot === 1 ? 2 : 1] = sp.id;
  return sp;
}

// Puts a learned technique into a slot; if it was in the other slot, the two slots swap.
function equipTech(slot, id) {
  if (!id || !(Game.techs || []).includes(id)) return false;
  const other = slot === 1 ? 2 : 1;
  if (Game.equip[other] === id) Game.equip[other] = Game.equip[slot];
  Game.equip[slot] = id;
  return true;
}

// Techniques of the ultimate kind start each level half recharged, the quick ones are ready.
function resetTechCooldowns(h) {
  h.techCd = {};
  for (const id of Game.techs || []) {
    const sp = SPECIAL_BY_ID[id];
    if (sp && sp.slot === 2) h.techCd[id] = specialCooldown(sp) * 0.5;
  }
}

// Cycles the technique equipped in a slot through all learned ones (skipping the one in the other slot).
function cycleEquip(slot, step) {
  const other = Game.equip[slot === 1 ? 2 : 1];
  const owned = SPECIALS.filter((s) => (Game.techs || []).includes(s.id) && s.id !== other).map((s) => s.id);
  if (!owned.length) return false;
  const i = owned.indexOf(Game.equip[slot]);
  Game.equip[slot] = owned[(i + step + owned.length) % owned.length];
  return true;
}

function nearestTarget(x, maxDist = 9999) {
  let best = null, bd = maxDist;
  for (const t of liveTargets()) {
    if (t.entering || t.state === 'dying' || t.state === 'intro' || t.y < 0) continue;
    const d = Math.abs(t.x - x);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

// ---------- using a technique ----------
function useSpecial(h, slot) {
  const id = Game.equip && Game.equip[slot];
  if (!id) { floater(h.x, h.y - 100, `Slot ${slot} is empty - finish levels to learn techniques`, '#cfd8ff', 14); return; }
  const sp = SPECIAL_BY_ID[id];
  if (techCooldown(h, id) > 0) { floater(h.x, h.y - 100, `${sp.name}: ${Math.ceil(techCooldown(h, id))} s`, '#cfd8ff', 14); return; }
  if (!['normal', 'punch', 'blast', 'kicharge'].includes(h.state)) return;
  h.techCd[id] = specialCooldown(sp);
  h.specialHits = new Set();
  floater(h.x, h.y - 125, sp.name.toUpperCase() + '!', sp.color, 20);
  Sfx.special(slot);
  const dir = h.facing;
  switch (id) {
    case 'afterimage':
      h.setState('dash');
      h.invuln = Math.max(h.invuln, 0.45);
      break;
    case 'flash':
      Game.flash = 0.8;
      for (const e of Game.enemies) if (!e.dead && e.state !== 'fade') { e.setState('stun'); e.stunT = 2.5; e.vx = 0; }
      for (const b of liveBosses()) if (['idle', 'recover', 'dash_tell', 'slash_tell', 'fingers_tell', 'fingers', 'charge_tell', 'quake_tell', 'pillars_tell', 'rain_tell', 'tornado_tell', 'orbs_tell', 'clones_tell', 'summon_tell', 'beam_tell'].includes(b.state)) { b.setState('stunned'); b.stunLen = 1.0; }
      h.setState('special'); h.specialDur = 0.35; h.specialPose = 'transform';
      break;
    case 'cry': {
      Game.rings.push({ x: h.x, y: h.y - 40, r: 10, max: 260, life: 0.4, maxLife: 0.4, color: '#9fffb0' });
      addShake(8);
      for (const pr of Game.projectiles) if (pr.owner === 'enemy') { pr.life = 0; burst(pr.x, pr.y, '#ffffff', 5, 120, 3, 0.25); }
      for (const t of liveTargets()) {
        if (Math.abs(t.x - h.x) < 230 && Math.abs((t.y - 40) - (h.y - 40)) < 160) {
          const dealt = t.takeHit(10 * h.dmgMult, sign(t.x - h.x), t.def && t.def.hp >= 400 ? 200 : 460, 'special');
          if (dealt) onPlayerDamage(10 * h.dmgMult, h);
        }
      }
      h.setState('special'); h.specialDur = 0.3; h.specialPose = 'transform';
      break;
    }
    case 'disc': {
      const hd = h.hand();
      Game.projectiles.push({ x: hd.x, y: hd.y - 10, vx: dir * 640, vy: 0, r: 20, dmg: 30 * h.dmgMult, owner: 'player', src: h, type: 'disc', life: 2, power: 99, pierce: true, hitSet: new Set(), kind: 'special' });
      h.setState('blast');
      break;
    }
    case 'surge':
      h.surgeT = 8;
      burst(h.x, h.y - 40, '#ff5a4a', 30, 320, 5, 0.6);
      addShake(6);
      break;
    case 'blink': {
      const t = nearestTarget(h.x);
      if (!t) { h.techCd[id] = 1; break; }
      ghostAt(h);
      const side = sign(t.x - h.x) || dir;
      h.x = clamp(t.x + side * (t.w / 2 + 30), 20, W - 20);
      h.y = Math.min(GROUND, t.y); h.vy = 0;
      h.facing = sign(t.x - h.x) || -side;
      h.invuln = Math.max(h.invuln, 0.35);
      burst(h.x, h.y - 40, '#7ff0d8', 14, 220, 3, 0.35);
      const dealt = t.takeHit(35 * h.dmgMult, h.facing, 320, 'special');
      if (dealt) onPlayerDamage(35 * h.dmgMult, h);
      Sfx.hit(); addHitstop(0.08); addShake(6);
      h.setState('punch'); h.comboStep = 3; h.punchDur = 0.3; h.punchHit = true; h.stateT = 0;
      break;
    }
    case 'meteor': {
      const t = nearestTarget(h.x);
      if (!t) { h.techCd[id] = 2; break; }
      ghostAt(h);
      h.meteor = { target: t, hits: 0, t: 0 };
      h.invuln = Math.max(h.invuln, 1.3);
      h.setState('meteor');
      break;
    }
    case 'phoenix':
      h.setState('special'); h.specialDur = 0.45; h.specialPose = 'charge'; h.specialThen = 'phoenix';
      h.invuln = Math.max(h.invuln, 0.5);
      break;
    case 'sphere':
      h.setState('sphere');
      h.invuln = Math.max(h.invuln, 2.3);
      break;
    case 'instinct':
      h.instinctT = 6;
      burst(h.x, h.y - 40, '#e8e8ff', 30, 300, 4, 0.6);
      break;
  }
}

// Leaves a fading copy of the hero (for dashes and teleports).
function ghostAt(h) {
  h.ghosts.push({ x: h.x, y: h.y, facing: h.facing, pose: h.pose, style: STYLES[h.F.style], scale: h.scale, life: 0.35, max: 0.35 });
}

// Hits every target overlapping the hero's body once per technique use.
function specialContact(h, dmg, knock) {
  const hb = boxOf(h);
  for (const t of liveTargets()) {
    if (h.specialHits.has(t) || !rectsOverlap(hb, boxOf(t))) continue;
    h.specialHits.add(t);
    const dealt = t.takeHit(dmg, h.facing, knock, 'special');
    if (dealt) { onPlayerDamage(dmg, h); Sfx.hit(); burst(t.x, t.y - 45, '#ffffff', 8, 200, 3, 0.25); }
  }
}

// Per-frame logic of the technique states (called from Player.update).
function updateSpecialState(h, dt) {
  switch (h.state) {
    case 'dash':
      h.vx = h.facing * 1100;
      h.vy = 0;
      if (Math.random() < 0.6) ghostAt(h);
      specialContact(h, 12 * h.dmgMult, 260);
      if (h.stateT >= 0.25 || h.x <= 22 || h.x >= W - 22) { h.vx = h.facing * 100; h.setState('normal'); }
      break;

    case 'special':
      h.vx = 0;
      if (h.stateT >= h.specialDur) {
        const then = h.specialThen;
        h.specialThen = null;
        h.setState('normal');
        if (then === 'phoenix') {
          const hd = h.hand();
          Game.projectiles.push({ x: hd.x, y: hd.y, vx: h.facing * 900, vy: 0, r: 42, dmg: 160 * h.dmgMult, owner: 'player', src: h, type: 'phoenix', life: 1.6, power: 999, pierce: true, hitSet: new Set(), kind: 'special', trail: '#ff8a3a' });
          addShake(10);
          Sfx.beam(3);
        }
      }
      break;

    case 'meteor': {
      const m = h.meteor;
      const t = m && m.target;
      h.vx = 0; h.vy = 0;
      if (!t || t.dead || !liveTargets().includes(t)) { h.meteor = null; h.setState('normal'); break; }
      // stay right next to the target, keep hitting
      const side = sign(h.x - t.x) || -h.facing;
      h.x = clamp(t.x + side * (t.w / 2 + 26), 20, W - 20);
      h.y = Math.min(GROUND, t.y);
      h.facing = sign(t.x - h.x) || h.facing;
      m.t += dt;
      if (m.t >= 0.13) {
        m.t = 0;
        m.hits++;
        const last = m.hits >= 7;
        const dmg = (last ? 45 : 12) * h.dmgMult;
        const dealt = t.takeHit(dmg, h.facing, last ? 520 : 0, 'special');
        if (dealt) onPlayerDamage(dmg, h);
        if (t.setState && !t.dead && !last && t instanceof Enemy) { t.setState('stun'); t.stunT = 0.3; }
        burst(t.x, t.y - 45, last ? '#ffb060' : '#ffffff', last ? 20 : 6, last ? 320 : 180, 3, 0.3);
        Sfx.hit();
        h.comboStep = (m.hits % 3) + 1;
        if (last) { addShake(12); Game.rings.push({ x: t.x, y: t.y - 30, r: 10, max: 120, life: 0.3, maxLife: 0.3, color: '#ffb060' }); h.meteor = null; h.setState('normal'); }
      }
      break;
    }

    case 'sphere': {
      h.vx = 0;
      h.vy = lerp(h.vy, 0, Math.min(1, dt * 10));
      const top = { x: h.x, y: h.y - 150 };
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2, r = rand(140, 260);
        spawnParticle({ x: top.x + Math.cos(a) * r, y: top.y + Math.sin(a) * r * 0.6, vx: -Math.cos(a) * r * 2.4, vy: -Math.sin(a) * r * 1.5, life: 0.4, size: rand(2, 4), color: '#bfe6ff' });
      }
      addShake(2);
      if (h.stateT >= 2.0) {
        const t = nearestTarget(h.x);
        const tx = t ? t.x : h.x + h.facing * 400;
        const ty = t ? t.y - 40 : GROUND - 30;
        const d = Math.hypot(tx - top.x, ty - top.y) || 1;
        Game.projectiles.push({ x: top.x, y: top.y, vx: (tx - top.x) / d * 420, vy: (ty - top.y) / d * 420, r: 60, dmg: 300 * h.dmgMult, owner: 'player', src: h, type: 'sphere', life: 4, power: 999, kind: 'special' });
        h.facing = sign(tx - h.x) || h.facing;
        h.setState('normal');
        Sfx.beam(3);
      }
      break;
    }
  }
}

// The World Sphere explodes on contact and hits everything around it.
function explodeSphere(pr) {
  pr.life = 0;
  explosion(pr.x, pr.y, 3);
  Game.flash = 0.6;
  addShake(20);
  Sfx.explode();
  Game.rings.push({ x: pr.x, y: pr.y, r: 20, max: 300, life: 0.5, maxLife: 0.5, color: '#bfe6ff' });
  for (const t of liveTargets()) {
    if (Math.hypot(t.x - pr.x, (t.y - t.h / 2) - pr.y) < 280) {
      const dealt = t.takeHit(pr.dmg, sign(t.x - pr.x) || 1, 500, 'special');
      if (dealt) onPlayerDamage(pr.dmg, pr.src);
    }
  }
}

function updateRings(dt) {
  for (const r of Game.rings) { r.life -= dt; r.r = lerp(r.max, 10, r.life / r.maxLife); }
  Game.rings = Game.rings.filter((r) => r.life > 0);
}

function drawRings(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const r of Game.rings) {
    ctx.globalAlpha = r.life / r.maxLife;
    ctx.strokeStyle = r.color; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}
