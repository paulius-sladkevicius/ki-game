'use strict';
// Act 6 "The Dream Realm": levels 26-30. A dream-thief, Somnus, sings every world to sleep.
// New enemies: imps (fast), bats (dive at you), archers (shots fall from above) and healing totems.
// New boss attacks: sleep notes, healing totems, a mirror stance that reflects Ki, and poison fog on the ground.
// Like acts45.js, everything here extends the tables of the earlier files.

// ---------- looks ----------
Object.assign(HAIR, {
  nightcap: [[9, -6], [8, -14], [2, -20], [-10, -22], [-22, -14], [-20, -9], [-12, -12], [-9, -6]],
  jester: [[10, -6], [18, -21], [22, -14], [8, -12], [0, -17], [-8, -12], [-22, -14], [-18, -21], [-10, -6]],
});

Object.assign(STYLES, {
  imp: { gi: '#5a2a6a', under: '#ff9a40', belt: '#ff9a40', pants: '#3a1a48', boots: '#2a1030', arm: '#c060a0', skin: '#c060a0', band: '#ff9a40', hair: 'horns', hairColor: '#2a1030' },
  archer: { gi: '#2a3a2a', under: '#c090ff', belt: '#c090ff', pants: '#1a261a', boots: '#3a2a1a', arm: '#8aa080', skin: '#a8c0a0', band: '#c090ff', hair: 'long', hairColor: '#40304a' },
  lullaby: { gi: '#d8c8f8', under: '#ff9ad8', belt: '#ff9ad8', pants: '#b8a8e0', boots: '#ff9ad8', arm: '#f0dcff', skin: '#f4e4ff', band: '#ff9ad8', hair: 'nightcap', hairColor: '#8a70e0' },
  marionette: { gi: '#c02040', under: '#1a1a22', belt: '#ffd34a', pants: '#1a1a22', boots: '#c02040', arm: '#f0e0d0', skin: '#f8f0e8', band: '#ffd34a', hair: 'jester', hairColor: '#c02040' },
  reverso: { gi: '#c8d4e8', under: '#4060a0', belt: '#ffffff', pants: '#9aa8c0', boots: '#4060a0', arm: '#d8e4f8', skin: '#e0e8f8', band: '#ffffff', hair: 'helmet', hairColor: '#e8f0ff', visor: '#80c0ff', sword: true },
  grimfang: { gi: '#2a3a20', under: '#a0ff60', belt: '#5a3a1a', pants: '#1a2614', boots: '#141c0e', arm: '#4a6a3a', skin: '#5a7a48', band: '#a0ff60', hair: 'horns', hairColor: '#1a2410' },
  somnus: { gi: '#1a1440', under: '#a080ff', belt: '#a080ff', pants: '#100c2c', boots: '#a080ff', arm: '#6a60b0', skin: '#8a80c8', band: '#ffd34a', hair: 'storm', hairColor: '#6040c0' },
  somnus2: { gi: '#08060e', under: '#ff60ff', belt: '#ff60ff', pants: '#040308', boots: '#ff60ff', arm: '#3a2a5a', skin: '#5a4a80', band: '#ff60ff', hair: 'storm', hairColor: '#ff60ff' },
});

Object.assign(BEAM_COLORS, {
  dream: ['rgba(190,140,255,A)', 'rgba(255,230,255,A)'],
  toy: ['rgba(255,90,60,A)', 'rgba(255,230,160,A)'],
  nightmare: ['rgba(120,20,160,A)', 'rgba(255,140,255,A)'],
});

// ---------- enemies ----------
Object.assign(ENEMY_DEFS, {
  imp: { hp: 60, speed: 230, windup: 0.26, dmg: 13, style: 'imp', score: 400, ai: 'melee', cd: [0.6, 1.0], scale: 0.85, w: 26, h: 66 },
  bat: { hp: 55, speed: 150, windup: 0.42, dmg: 14, score: 380, ai: 'drone', dive: true, look: 'bat', cd: [1.5, 2.3], w: 36, h: 30 },
  archer: { hp: 85, speed: 110, windup: 0.65, dmg: 11, style: 'archer', score: 480, ai: 'ranged', arc: true, cd: [2.0, 2.8] },
  totem: { hp: 110, speed: 0, windup: 1, dmg: 0, score: 500, ai: 'totem', look: 'totem', cd: [99, 99], heavy: true, w: 40, h: 92 },
});
Object.assign(COIN_VALUES, { imp: 40, bat: 35, archer: 45, totem: 30 });

// Totem: stands still and heals every boss a little each second, until it is broken.
ENEMY_AI.totem = (e) => {
  e.vx = 0;
  e.entering = false;
  e.atkCd = 99;
  const bosses = Game.bosses.filter((b) => !b.dead);
  if (!bosses.length) { e.hp = 0; e.dead = true; e.setState('dying'); return; }
  if (e.age - (e.lastHeal || 0) < 1) return;
  e.lastHeal = e.age;
  for (const b of bosses) {
    if (b.state === 'phase' || b.state === 'final_tell' || b.state === 'clash') continue;
    const cap = b.def.phases && b.phase === 2 ? 0.66 : 1;
    const heal = Math.min(b.maxHp * 0.012, b.maxHp * cap - b.hp);
    if (heal <= 0) continue;
    b.hp += heal;
    floater(b.x, b.y - b.h - 30, '+' + Math.round(heal), '#80ff90', 15);
    Game.bolts.push({ x1: e.x, y1: e.y - 80, x2: b.x, y2: b.y - b.h * 0.6, color: '#80ff90', life: 0.25, max: 0.25, seed: Math.random() * 1000 });
  }
};

ENEMY_LOOKS.bat = (ctx, e, fl) => {
  const x = e.x, cy = e.y - 16, t = e.animT;
  const flap = Math.sin(t * (e.state === 'divebomb' ? 26 : 14));
  ctx.save();
  ctx.fillStyle = fl ? '#ffffff' : e.state === 'divebomb' ? '#5a1a5a' : '#2a1a3a';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + s * 6, cy);
    ctx.quadraticCurveTo(x + s * 20, cy - 14 - flap * 10, x + s * 30, cy - 4 - flap * 12);
    ctx.lineTo(x + s * 24, cy + 4);
    ctx.lineTo(x + s * 18, cy);
    ctx.lineTo(x + s * 12, cy + 6);
    ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(x, cy, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 7, cy - 8); ctx.lineTo(x - 5, cy - 17); ctx.lineTo(x - 2, cy - 9); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 7, cy - 8); ctx.lineTo(x + 5, cy - 17); ctx.lineTo(x + 2, cy - 9); ctx.fill();
  ctx.fillStyle = '#ff4060';
  ctx.fillRect(x - 5, cy - 4, 3, 3); ctx.fillRect(x + 2, cy - 4, 3, 3);
  ctx.restore();
};

ENEMY_LOOKS.totem = (ctx, e, fl) => {
  const x = e.x, y = e.y, t = e.animT;
  ctx.save();
  // stone pillar with three faces and a glowing green top
  const col = fl ? '#ffffff' : '#6a5a7a';
  for (let i = 0; i < 3; i++) {
    const yy = y - 30 * (i + 1);
    ctx.fillStyle = i % 2 ? shade(col, 0.85) : col;
    ctx.fillRect(x - 18 + i * 2, yy, 36 - i * 4, 30);
    ctx.fillStyle = '#1a1424';
    ctx.fillRect(x - 10 + i * 2, yy + 8, 6, 5); ctx.fillRect(x + 4 - i * 2, yy + 8, 6, 5);
    ctx.fillRect(x - 6, yy + 19, 12, 4);
  }
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(120,255,140,${0.35 + 0.4 * glow})`;
  ctx.beginPath(); ctx.arc(x, y - 96, 10 + glow * 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---------- boss attacks ----------
Object.assign(BOSS_ATTACKS, { sleep: 'sleep_tell', totems: 'totems_tell', mirror: 'mirror_tell', fog: 'fog_tell' });

Object.assign(BOSS_STATES, {
  // slow homing music notes; a hero hit by one falls asleep for a moment (guard or shoot them down!)
  sleep_tell(dt) {
    this.vx = 0;
    this.facing = sign(this.target.x - this.x);
    if (Math.random() < 0.4) spawnParticle({ x: this.x + rand(-30, 30), y: this.y - this.h - rand(0, 30), vx: rand(-20, 20), vy: -60, life: 0.5, size: 3, color: '#ffc8ff' });
    if (this.stateT >= 0.55) {
      const n = this.enraged ? 4 : 3;
      const h0 = this.hand();
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55;
        Game.projectiles.push({
          x: h0.x, y: h0.y, vx: Math.cos(a) * 170 + this.facing * 80, vy: Math.sin(a) * 170, r: 11, dmg: 6, owner: 'enemy', type: 'orb', look: 'note',
          homing: true, speed: 175, life: 4.5, sleep: 1.1, inner: '#fff0ff', outer: 'rgba(200,120,255,0.75)', trail: '#e0b0ff',
        });
      }
      [784, 988, 1175].forEach((f, i) => Sfx.note && Sfx.note(f, i * 0.08));
      this.recover(0.5);
    }
  },
  // healing totems: they heal the boss every second until they are broken
  totems_tell() {
    this.vx = 0;
    if (this.stateT >= 0.6) {
      const want = 2;
      const have = Game.enemies.filter((e) => e.type === 'totem' && !e.dead);
      const spots = [90, W - 90, W / 2].filter((x) => !have.some((e) => Math.abs(e.x - x) < 60));
      for (let i = 0; i < want - have.length && spots.length; i++) {
        const x = spots.shift();
        const e = new Enemy('totem', 'L');
        e.x = e.fixX = x; e.y = GROUND; e.entering = false; e.facing = sign(W / 2 - x) || 1;
        Game.enemies.push(e);
        burst(x, GROUND - 40, '#80ff90', 20, 260, 4, 0.5);
      }
      floater(this.x, this.y - this.h - 20, 'Totems, heal me!', '#80ff90', 18);
      if (!Game.totemHint) { Game.totemHint = true; showHint(`Break the totems - they heal ${this.name}!`, 3); }
      Sfx.boom();
      this.recover(0.5);
    }
  },
  mirror_tell() {
    this.vx = 0;
    this.facing = sign(this.target.x - this.x);
    if (this.stateT >= 0.4) {
      this.setState('mirror');
      floater(this.x, this.y - this.h - 24, 'MIRROR!', '#cfe6ff', 20);
      Sfx.teleport();
    }
  },
  // mirror stance: Ki blasts and Ki Waves bounce back; a punch or a friend's power breaks it
  mirror() {
    this.vx = 0;
    this.facing = sign(this.target.x - this.x);
    if (this.stateT >= (this.enraged ? 3 : 2.4)) this.recover(0.3);
  },
  // poison fog on the ground: get out of it or fly above it
  fog_tell() {
    this.vx = 0;
    if (Math.random() < 0.5) spawnParticle({ x: this.hand().x, y: this.hand().y, vx: this.facing * rand(60, 160), vy: rand(-40, 20), life: 0.5, size: 5, color: '#a0ff60' });
    if (this.stateT >= 0.5) {
      const xs = [clamp(this.target.x, 80, W - 80)];
      const n = this.enraged ? 3 : 2;
      for (let tries = 0; xs.length < n && tries < 20; tries++) {
        const x = rand(80, W - 80);
        if (xs.every((o) => Math.abs(o - x) > 170)) xs.push(x);
      }
      for (const x of xs) Game.hazards.push({ kind: 'fog', x, w: 150, t: 0, tell: 0.7, life: 6, dmg: 7, src: this, ticks: new Map(), seed: Math.random() * 10 });
      Sfx.wind();
      this.recover(0.5);
    }
  },
});

Object.assign(BOSS_POSES, {
  sleep_tell: () => POSES.swordRaise(),
  totems_tell: () => POSES.swordRaise(),
  mirror_tell: (b) => POSES.guard(b.animT),
  mirror: (b) => POSES.guard(b.animT),
  fog_tell: () => POSES.fire(),
});

BOSS_HIT_HOOKS.mirror = function (dmg, dir, knock, kind) {
  if (kind === 'blast' || kind === 'beam' || kind === 'beam3') {
    // the shot comes straight back at the heroes
    const big = kind !== 'blast';
    Game.projectiles.push({ x: this.x - dir * 40, y: this.y - this.h * 0.55, vx: -dir * 560, vy: 0, r: big ? 14 : 8, dmg: big ? 22 : 10, owner: 'enemy', life: 2.5, inner: '#ffffff', outer: 'rgba(170,210,255,0.75)', trail: '#cfe6ff' });
    floater(this.x, this.y - this.h - 30, 'REFLECT!', '#cfe6ff', 18);
    burst(this.x - dir * 30, this.y - this.h * 0.55, '#ffffff', 10, 220, 3, 0.3);
    Sfx.cancel();
    return false;
  }
  // a punch or a friend's power shatters the mirror
  floater(this.x, this.y - this.h - 30, 'MIRROR BROKEN!', '#ffe14d', 18);
  burst(this.x, this.y - this.h * 0.55, '#cfe6ff', 24, 320, 4, 0.5);
  Sfx.guardBreak();
  this.recover(0.7);
  return true;
};

BOSS_DRAW.mirror = function (ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cy = this.y - this.h * 0.55, r = this.h * 0.75;
  const pulse = 0.6 + 0.3 * Math.sin(this.animT * 10);
  ctx.strokeStyle = `rgba(200,225,255,${pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const a = i / 6 * Math.PI * 2 + this.animT * 0.8;
    const px = this.x + Math.cos(a) * r * 0.7, py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.fillStyle = `rgba(170,210,255,${0.12 * pulse})`;
  ctx.fill();
  ctx.restore();
};
BOSS_DRAW.mirror_tell = function (ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(200,225,255,${Math.min(1, this.stateT * 2.5)})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(this.x, this.y - this.h * 0.55, this.h * 0.5 * Math.min(1, this.stateT * 2.5), this.h * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
};

// A hero hit by a sleep note (and not guarding) dozes off.
function putToSleep(h, t) {
  if (h.state !== 'hurt' || h.stateT > 0) return;
  h.hurtDur = t;
  h.sleepT = t;
  h.invuln = Math.max(h.invuln, t + 0.2);   // nothing hits a sleeping hero: sleep costs time, not a whole life bar
  floater(h.x, h.y - 112, 'Zzz...', '#d8c8ff', 18);
}

// Poison fog: hurts a hero standing in it (not one flying above it) every 0.6 s.
function updateFog(z, dt) {
  z.t += dt;
  if (z.t < z.tell) return;
  for (const h of liveHeroes()) {
    const left = (z.ticks.get(h) || 0) - dt;
    z.ticks.set(h, left);
    if (left > 0) continue;
    if (Math.abs(h.x - z.x) < z.w / 2 && h.y > GROUND - 70) {
      h.takeHit(z.dmg, sign(h.x - z.x) || 1, 80);
      z.ticks.set(h, 0.6);
    }
  }
  if (Math.random() < dt * 12) spawnParticle({ x: z.x + rand(-z.w / 2, z.w / 2), y: GROUND - rand(0, 20), vx: rand(-10, 10), vy: rand(-60, -20), life: 0.8, size: rand(3, 6), color: 'rgba(170,255,110,0.8)' });
}

function drawFog(ctx, z) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  if (z.t < z.tell) {
    // warning: a dashed green outline on the ground
    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(Game.time * 20);
    ctx.strokeStyle = '#a0ff60'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.ellipse(z.x, GROUND - 4, z.w / 2, 10, 0, 0, Math.PI * 2); ctx.stroke();
  } else {
    const k = Math.min(1, (z.t - z.tell) * 4) * Math.min(1, (z.life - z.t) * 1.5);
    for (let i = 0; i < 9; i++) {
      const px = z.x + Math.sin(z.seed + i * 1.7 + Game.time * 0.8) * z.w * 0.38;
      const py = GROUND - 18 - (i % 3) * 18 + Math.sin(Game.time * 1.5 + i) * 4;
      const r = 30 + (i % 4) * 8;
      const g = ctx.createRadialGradient(px, py, 2, px, py, r);
      g.addColorStop(0, `rgba(150,230,90,${0.5 * k})`);
      g.addColorStop(1, 'rgba(90,40,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
}

// ---------- bosses ----------
Object.assign(BOSS_DEFS, {
  lullaby: { name: 'LULLABY', title: 'The sleep singer', style: 'lullaby', hp: 3000, scale: 1.1, score: 12000, coins: 520, want: 300,
    attacks: ['sleep', 'orbs', 'teleport'], rage: ['beam', 'sleep', 'dive', 'fingers'], beamColor: 'dream', aura: 'rgba(220,170,255,A)' },
  marionette: { name: 'MARIONETTE', title: 'The puppet master', style: 'marionette', hp: 3200, scale: 1.25, score: 12500, coins: 540, want: 280,
    attacks: ['totems', 'gears', 'dash'], rage: ['beam', 'totems', 'lasers', 'gears'], beamColor: 'toy', aura: 'rgba(255,90,90,A)' },
  reverso: { name: 'REVERSO', title: 'Knight of the upside-down castle', style: 'reverso', hp: 4300, scale: 1.2, score: 13000, coins: 560, speed: 170,
    attacks: ['mirror', 'mirror', 'slash', 'dash', 'charge'], rage: ['beam', 'mirror', 'leap', 'lasers', 'slash'], beamColor: 'mirror', aura: 'rgba(180,210,255,A)' },
  grimfang: { name: 'GRIMFANG', title: 'The beast of the nightmare marsh', style: 'grimfang', hp: 3450, scale: 1.6, score: 14000, coins: 580, speed: 110, summonType: 'bat',
    attacks: ['fog', 'quake', 'charge'], rage: ['beam', 'fog', 'rain', 'summon'], beamColor: 'vine', aura: 'rgba(150,255,90,A)' },
  somnus: { name: 'SOMNUS', title: 'The dream-thief', style: 'somnus', hp: 5000, scale: 1.35, score: 30000, phases: true, alwaysAura: true, music: 'final6',
    phase2Style: 'somnus2', phase2Scale: 1.6, phase2Text: 'The nightmare wakes!', phaseColor: '#ff60ff', summonType: 'imp', pillarKind: 'shadow',
    finalText: 'Every dream you saved fights with you!',
    attacks: ['sleep', 'totems', 'dash', 'slash'], rage: ['beam', 'mirror', 'fog', 'summon', 'orbs'], beamColor: 'nightmare', aura: 'rgba(200,120,255,A)' },
});

// ---------- dialogs and the act table ----------
Object.assign(PORTRAITS, { 'Lullaby': 'lullaby', 'Marionette': 'marionette', 'Reverso': 'reverso', 'Grimfang': 'grimfang', 'Somnus': 'somnus' });
Object.assign(SPEAKER_COLORS, { 'Lullaby': '#e0c0ff', 'Marionette': '#ff7090', 'Reverso': '#cfe6ff', 'Grimfang': '#a0ff60', 'Somnus': '#c090ff' });
ACTS[6] = { mark: '☾', hud: ' moons', got: 'Dream Moon freed', end: 'Somnus is gone - every world wakes up' };

// ---------- music ----------
(() => {
  const _ = null;
  Object.assign(Sfx.tracks, {
    dreammeadow: { bpm: 96, root: 60, prog: [0, 5, 3, 4], drums: 'half',
      lead: [12, _, 16, _, 19, _, 16, _, 14, _, 17, _, 21, _, _, _, 12, _, 16, _, 19, _, 24, _, 23, _, 19, _, 16, _, _, _] },
    toyfortress: { bpm: 132, root: 55, prog: [0, 4, 5, 3], drums: 'rock',
      lead: [12, 12, 16, _, 19, _, 16, 12, 14, 14, 17, _, 21, _, 17, 14, 12, 12, 16, _, 19, _, 24, 19, 17, 16, 14, 12, 14, _, _, _] },
    upsidecastle: { bpm: 118, root: 53, prog: [0, -2, 3, -4], drums: 'half',
      lead: [12, _, 15, 19, _, 15, 12, _, 10, _, 14, 17, _, 14, 10, _, 12, _, 15, 19, 24, _, 22, 19, 17, _, 15, _, 14, _, _, _] },
    fogmarsh: { bpm: 100, root: 48, prog: [0, 1, -2, 0], drums: 'half',
      lead: [12, _, _, 13, 15, _, 13, _, 12, _, _, 10, 8, _, _, _, 12, _, _, 13, 15, _, 18, _, 17, _, 15, _, 13, _, _, _] },
    nightmare: { bpm: 140, root: 50, prog: [0, 1, 5, -1], drums: 'fast',
      lead: [12, 13, 17, 12, 20, 17, 13, 12, 12, 13, 17, 20, 24, 20, 17, 13, 12, 13, 17, 12, 20, 17, 13, 17, 19, 17, 13, 12, 13, _, _, _] },
    final6: { bpm: 184, root: 46, prog: [0, 1, 3, -2], drums: 'fast',
      lead: [12, 15, 19, 24, 25, 24, 19, 15, 13, 17, 20, 25, 24, 20, 17, 13, 12, 15, 19, 24, 27, 25, 24, 19, 22, 24, 25, 22, 24, _, _, _] },
  });
})();

// ---------- backgrounds ----------
function bgFlower(g, x, h, petal, center) {
  g.strokeStyle = '#4a9a5a'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, GROUND); g.quadraticCurveTo(x + 12, GROUND - h / 2, x, GROUND - h); g.stroke();
  g.fillStyle = petal;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * 18, GROUND - h + Math.sin(a) * 18, 14, 9, a, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = center; g.beginPath(); g.arc(x, GROUND - h, 11, 0, Math.PI * 2); g.fill();
}
function bgCastle(g, x, w, h, color, flip) {
  // a castle tower; flip = hanging upside-down from the top of the screen
  const dir = flip ? -1 : 1;              // dir 1: grows up from the ground, -1: grows down from the top
  const base = flip ? 0 : GROUND;
  const top = base - dir * h;
  g.fillStyle = color;
  g.fillRect(x - w / 2, Math.min(base, top), w, h);
  for (let i = 0; i < 4; i++) g.fillRect(x - w / 2 + i * (w / 3.5), flip ? top : top - 12, w / 7, 12);
  const edge = top - dir * 12;
  g.beginPath(); g.moveTo(x - w / 2 - 6, edge); g.lineTo(x, edge - dir * w * 0.9); g.lineTo(x + w / 2 + 6, edge); g.fill();
  g.fillStyle = 'rgba(255,230,140,0.75)';
  for (let i = 0; i < 3; i++) g.fillRect(x - 5, flip ? 14 + i * 34 : top + 20 + i * 34, 10, 16);
}

Object.assign(BG_BUILDERS, {
  dreammeadow(g) {
    bgSky(g, [[0, '#6a5ab8'], [0.5, '#d89ad8'], [1, '#ffd8e8']]);
    bgGlow(g, 760, 110, 90, 'rgba(255,255,240,1)', 'rgba(255,240,250,0.5)');
    bgStars(g, 40, 220, 0.7);
    bgClouds(g, 'rgba(255,255,255,0.85)', [[140, 120, 90], [420, 80, 70], [620, 170, 110], [880, 230, 80]]);
    bgPeaks(g, '#9a7ac8', [[0, 360], [180, 320], [360, 350], [540, 300], [720, 340], [900, 310], [960, 330]]);
    bgPeaks(g, '#b8e0a8', [[0, 410], [240, 390], [480, 415], [720, 385], [960, 405]]);
    bgFlower(g, 90, 110, '#ff9ad8', '#ffe14d'); bgFlower(g, 330, 70, '#9ad8ff', '#ffffff'); bgFlower(g, 610, 130, '#ffd060', '#ff70a0'); bgFlower(g, 870, 90, '#c8a0ff', '#ffe14d');
    bgGround(g, '#a8e098', '#6aa060', '#d8ffc8', 'rgba(0,0,0,0)', false);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 30; i++) { g.beginPath(); g.arc((i * 67) % W, GROUND + 12 + (i * 23) % 60, 3, 0, Math.PI * 2); g.fill(); }
  },
  toyfortress(g) {
    bgSky(g, [[0, '#3a6ab8'], [0.6, '#8ac0f0'], [1, '#ffe8b0']]);
    bgClouds(g, 'rgba(255,255,255,0.8)', [[200, 90, 80], [700, 130, 100]]);
    const blocks = [['#ff5a4a', 'A'], ['#4aa0ff', 'B'], ['#ffd34a', 'C'], ['#5ad06a', 'D'], ['#c06aff', 'E']];
    const stack = (x, n, s) => {
      for (let i = 0; i < n; i++) {
        const [c, letter] = blocks[(x / 10 + i) % blocks.length | 0];
        const y = GROUND - (i + 1) * s;
        g.fillStyle = c; g.fillRect(x, y, s, s);
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.strokeRect(x + 2, y + 2, s - 4, s - 4);
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = `900 ${s * 0.6}px system-ui, sans-serif`; g.textAlign = 'center'; g.fillText(letter, x + s / 2, y + s * 0.72);
      }
    };
    stack(30, 5, 60); stack(150, 3, 60); stack(700, 4, 64); stack(830, 6, 56);
    // the toy fortress gate in the middle
    g.fillStyle = '#d0a060'; g.fillRect(330, 180, 300, GROUND - 180);
    g.fillStyle = '#b08040'; for (let i = 0; i < 6; i++) g.fillRect(330 + i * 54, 160, 30, 20);
    g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(480, 330, 60, Math.PI, 0); g.fillRect(420, 330, 120, GROUND - 330); g.fill();
    g.fillStyle = '#ff5a4a'; g.beginPath(); g.moveTo(480, 60); g.lineTo(480, 160); g.lineTo(484, 160); g.lineTo(484, 60); g.fill();
    g.beginPath(); g.moveTo(484, 62); g.lineTo(530, 80); g.lineTo(484, 98); g.fill();
    bgGround(g, '#c89a60', '#8a6438', '#e8c088', 'rgba(90,60,30,0.35)');
  },
  upsidecastle(g) {
    bgSky(g, [[0, '#120a2a'], [0.6, '#2a1a5a'], [1, '#5a3a8a']]);
    bgStars(g, 90, GROUND, 0.8);
    bgCastle(g, 140, 70, 150, '#3a2a6a', true); bgCastle(g, 480, 100, 200, '#4a3a7a', true); bgCastle(g, 820, 80, 170, '#3a2a6a', true);
    bgCastle(g, 300, 60, 120, '#2a1e4a', false); bgCastle(g, 660, 70, 150, '#2a1e4a', false);
    // floating stairs
    g.fillStyle = '#6a5a9a';
    for (let i = 0; i < 6; i++) g.fillRect(380 + i * 34, 300 - i * 18, 40, 10);
    bgGround(g, '#e8e0f8', '#9a90c0', '#ffffff', 'rgba(0,0,0,0)', false);
    g.fillStyle = '#3a2a6a';
    for (let x = 0; x < W; x += 40) for (let r = 0; r < 3; r++) if (((x / 40) + r) % 2 === 0) g.fillRect(x, GROUND + 4 + r * 26, 40, 26);
  },
  fogmarsh(g) {
    bgSky(g, [[0, '#0e1a12'], [0.6, '#1e3424'], [1, '#3a5a3a']]);
    bgGlow(g, 200, 120, 70, 'rgba(220,255,200,0.9)', 'rgba(160,220,140,0.3)');
    bgPeaks(g, '#16261a', [[0, 330], [160, 300], [320, 340], [500, 290], [680, 330], [860, 300], [960, 320]]);
    // dead trees
    g.strokeStyle = '#0c140e'; g.lineCap = 'round';
    const tree = (x, h) => {
      g.lineWidth = 12; g.beginPath(); g.moveTo(x, GROUND); g.lineTo(x + 6, GROUND - h); g.stroke();
      g.lineWidth = 5;
      [[0.5, -40, -30], [0.65, 36, -24], [0.8, -28, -36], [0.9, 24, -30]].forEach(([k, dx2, dy2]) => { g.beginPath(); g.moveTo(x + 4, GROUND - h * k); g.lineTo(x + 4 + dx2, GROUND - h * k + dy2); g.stroke(); });
    };
    tree(90, 200); tree(380, 160); tree(640, 220); tree(900, 180);
    g.fillStyle = 'rgba(160,220,140,0.12)';
    for (let i = 0; i < 5; i++) g.fillRect(0, 300 + i * 30, W, 14);
    bgGround(g, '#3a4a2a', '#1a2414', '#5a7040', 'rgba(0,0,0,0)', false);
    g.fillStyle = 'rgba(90,140,90,0.5)';
    for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse((i * 137) % W, GROUND + 22 + (i * 31) % 40, 40, 6, 0, 0, Math.PI * 2); g.fill(); }
  },
  nightmare(g) {
    bgSky(g, [[0, '#05020c'], [0.6, '#1a0a30'], [1, '#3a1050']]);
    bgStars(g, 60, GROUND, 0.5);
    // the great eye of the nightmare
    g.fillStyle = '#2a0a3a'; g.beginPath(); g.ellipse(480, 170, 190, 80, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e8d8ff'; g.beginPath(); g.ellipse(480, 170, 150, 58, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#a020c0'; g.beginPath(); g.arc(480, 170, 50, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a0010'; g.beginPath(); g.ellipse(480, 170, 12, 44, 0, 0, Math.PI * 2); g.fill();
    // twisted spires
    g.fillStyle = '#12061e';
    [[60, 260], [200, 200], [760, 210], [900, 270]].forEach(([x, h]) => { g.beginPath(); g.moveTo(x - 30, GROUND); g.quadraticCurveTo(x + 20, GROUND - h / 2, x, GROUND - h); g.quadraticCurveTo(x - 10, GROUND - h / 2, x + 30, GROUND); g.fill(); });
    bgGround(g, '#2a1a3a', '#0a0612', '#6a3a9a', 'rgba(160,80,220,0.25)');
  },
});

Object.assign(BG_ANIM, {
  dreammeadow(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const x = (i * 149 + Math.sin(t + i) * 20) % W, y = GROUND - ((t * (18 + (i % 5) * 6) + i * 53) % GROUND);
      ctx.fillStyle = `rgba(255,230,255,${0.5 + 0.4 * Math.sin(t * 3 + i)})`; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
  },
  toyfortress(ctx, t) {
    // a little flag waving on the gate
    ctx.fillStyle = '#ffd34a';
    ctx.beginPath(); ctx.moveTo(484, 62); ctx.quadraticCurveTo(507, 66 + Math.sin(t * 6) * 6, 530, 80); ctx.lineTo(484, 98); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) if (Math.sin(t * 2 + i * 1.7) > 0.7) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect((i * 173) % W, 40 + (i * 61) % 120, 3, 3); }
  },
  upsidecastle(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      // stars fall upwards here
      const x = (i * 137) % W, y = GROUND - ((t * (60 + (i % 4) * 20) + i * 71) % GROUND);
      ctx.fillStyle = 'rgba(220,200,255,0.7)'; ctx.fillRect(x, y, 2, 8);
    }
  },
  fogmarsh(ctx, t) {
    ctx.fillStyle = 'rgba(170,220,160,0.08)';
    for (let i = 0; i < 4; i++) {
      const x = ((t * (14 + i * 6) + i * 260) % (W + 400)) - 200;
      ctx.beginPath(); ctx.ellipse(x, 360 + i * 22, 220, 26, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  nightmare(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    const k = 0.5 + 0.5 * Math.sin(t * 2);
    ctx.fillStyle = `rgba(200,40,255,${0.1 + 0.12 * k})`;
    ctx.beginPath(); ctx.ellipse(480, 170, 200 + k * 10, 90 + k * 6, 0, 0, Math.PI * 2); ctx.fill();
    // the pupil follows the hero you control
    if (Game.player) {
      ctx.globalCompositeOperation = 'source-over';
      const px = 480 + clamp((Game.player.x - 480) / 480, -1, 1) * 22;
      ctx.fillStyle = '#a020c0'; ctx.beginPath(); ctx.arc(px, 170, 50, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0010'; ctx.beginPath(); ctx.ellipse(px, 170, 12, 44, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
});

// ---------- levels 26-30 ----------
const ACT6_FRIENDS = { raxas: 1, nyx: 1 };

LEVELS.push(
  // ================= ACT 6: THE DREAM REALM =================

  // ---------- 26. Dream Meadow ----------
  {
    name: 'Dream Meadow', theme: 'dreammeadow', act: 6, crystals: 1, unlockStart: 3, ally: true, friend: 'gale', allyUnlockStart: ACT6_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'The First Light shines again. But one morning, nobody in the valley wakes up.'),
        L('Ren', 'Master Oro? Master! ...He is breathing, but he will not open his eyes.'),
        L('Gale', 'Listen. The wind carries a song - someone is singing every world to sleep, and stealing their dreams.'),
        L('Ren', 'Then we go into the dreams and get them back. Five Dream Moons, five worlds to wake up.'),
        L('Tip', "Act 6 is the hardest yet! New enemies: fast imps, bats that dive at you and archers whose shots fall from above - keep moving!"),
      ] },
      { type: 'wave', enemies: [['imp', 'R'], ['bat', 'L'], ['archer', 'R'], ['imp', 'L']] },
      { type: 'wave', enemies: [['archer', 'L'], ['imp', 'R'], ['bat', 'R'], ['imp', 'L'], ['knight', 'R']] },
      { type: 'wave', enemies: [['imp', 'R'], ['imp', 'L'], ['archer', 'R'], ['bat', 'L'], ['archer', 'L'], ['bat', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Lullaby', 'Shhh... sleep, little warrior. Dreams are so much softer than waking.'),
        L('Gale', 'Her voice is like a breeze in a cradle. Do not listen to it, Ren!'),
        L('Tip', 'Lullaby sends music notes that put you to sleep. Guard (hold S) or shoot the notes down!'),
      ] },
      { type: 'boss', bosses: [['lullaby']] },
      { type: 'dialog', lines: [
        L('Lullaby', 'You... will not stay awake forever... Somnus never sleeps...'),
        L('', 'The song breaks off. Above the meadow, the first Dream Moon breaks free.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 27. Toy Fortress ----------
  {
    name: 'Toy Fortress', theme: 'toyfortress', act: 6, crystals: 1, unlockStart: 3, ally: true, friend: 'gale', allyUnlockStart: ACT6_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', "A child's dream: a fortress of wooden blocks. But the toys are not playing any more."),
        L('Gale', 'Someone is pulling their strings.'),
      ] },
      { type: 'wave', enemies: [['imp', 'R'], ['archer', 'L'], ['golem', 'R'], ['imp', 'L']] },
      { type: 'wave', enemies: [['archer', 'R'], ['archer', 'L'], ['bat', 'R'], ['imp', 'L'], ['golem', 'R']] },
      { type: 'wave', enemies: [['knight', 'L'], ['imp', 'R'], ['bat', 'L'], ['archer', 'R'], ['imp', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Marionette', 'Dance, dance, little puppets! Every dreamer is a toy, and every toy is mine!'),
        L('Ren', 'Nobody pulls my strings.'),
        L('Tip', 'Marionette builds totems that heal him every second. Break the totems first!'),
      ] },
      { type: 'boss', bosses: [['marionette']] },
      { type: 'dialog', lines: [
        L('Marionette', 'My strings... cut...'),
        L('', 'The toys fall still - and then, slowly, they start to play again. The second Dream Moon rises.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 28. Upside-Down Castle ----------
  {
    name: 'Upside-Down Castle', theme: 'upsidecastle', act: 6, crystals: 1, unlockStart: 3, ally: true, friend: 'gale', allyUnlockStart: ACT6_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'Here the towers hang from the sky and the stars fall upwards.'),
        L('Gale', 'Even the wind blows backwards here. Be careful, Ren - nothing is what it seems.'),
      ] },
      { type: 'wave', enemies: [['shade', 'R'], ['archer', 'L'], ['imp', 'R'], ['bat', 'L']] },
      { type: 'wave', enemies: [['knight', 'R'], ['shade', 'L'], ['archer', 'R'], ['imp', 'L'], ['bat', 'R'], ['knight', 'L']] },
      { type: 'wave', enemies: [['shade', 'L'], ['knight', 'R'], ['archer', 'L'], ['imp', 'R'], ['shade', 'R'], ['bat', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Reverso', 'Strike me, and your own power strikes you back!'),
        L('Tip', 'When Reverso raises his mirror, Ki blasts and Ki Waves bounce back at you! Punch him, or use a friend\'s power (Shadow Rush, Cyclone, Wind Gust) - that breaks the mirror.'),
      ] },
      { type: 'boss', bosses: [['reverso']] },
      { type: 'dialog', lines: [
        L('Reverso', 'Forward... is forward again...'),
        L('', 'The castle turns the right way up, and the third Dream Moon falls gently into Ren\'s hands.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 29. Nightmare Marsh ----------
  {
    name: 'Nightmare Marsh', theme: 'fogmarsh', act: 6, crystals: 1, unlockStart: 3, ally: true, friend: 'gale', allyUnlockStart: ACT6_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'A swamp of bad dreams. Green fog crawls over the mud.'),
        L('Gale', 'This air is poison. I will keep it moving - you keep your feet off the ground when it glows.'),
      ] },
      { type: 'wave', enemies: [['golem', 'R'], ['bat', 'L'], ['archer', 'R'], ['imp', 'L']] },
      { type: 'wave', enemies: [['archer', 'L'], ['bat', 'R'], ['shade', 'L'], ['imp', 'R'], ['imp', 'L']] },
      { type: 'wave', enemies: [['bat', 'R'], ['imp', 'L'], ['knight', 'L'], ['archer', 'R'], ['golem', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Grimfang', 'GRRRAAAH! Little dreamers... taste... the fog!'),
        L('Tip', 'Grimfang breathes poison fog onto the ground. Get out of the green clouds or fly above them!'),
      ] },
      { type: 'boss', bosses: [['grimfang']] },
      { type: 'dialog', lines: [
        L('Grimfang', 'Grrr... just... a bad dream...'),
        L('', 'The fog lifts. The fourth Dream Moon shines over a quiet, sleepy pond.'),
        L('Gale', 'One more. And I think he already knows we are coming.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 30. Nightmare Throne ----------
  {
    name: 'Nightmare Throne', theme: 'nightmare', act: 6, crystals: 1, unlockStart: 3, ally: true, friend: 'gale', allyUnlockStart: ACT6_FRIENDS, final: true,
    script: [
      { type: 'dialog', lines: [
        L('', 'At the bottom of every dream there is a throne. And on it sits the one who never sleeps.'),
        L('Somnus', 'Welcome, Ren. I have watched all of your dreams. You dream of being strong enough to protect everyone.'),
        L('Somnus', 'Sleep, and I will let you dream it forever.'),
        L('Ren', "A dream where I protect everyone isn't worth anything if everyone is asleep. Wake them up!"),
      ] },
      { type: 'wave', enemies: [['imp', 'R'], ['imp', 'L'], ['archer', 'R'], ['bat', 'L'], ['knight', 'R'], ['shade', 'L']] },
      { type: 'wave', enemies: [['golem', 'L'], ['archer', 'R'], ['bat', 'L'], ['imp', 'R'], ['archer', 'L'], ['imp', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Somnus', 'Then you will learn what a nightmare is.'),
        L('Tip', 'Somnus uses every trick of the Dream Realm: sleep notes, healing totems, the mirror and poison fog. Three phases, then the final beam clash - mash L!'),
      ] },
      { type: 'boss', bosses: [['somnus']] },
      { type: 'dialog', lines: [
        L('Somnus', 'No... morning... is coming...'),
        L('', 'The great eye closes. One by one, all over the worlds, people open their eyes and stretch in the morning sun.'),
        L('Master Oro', '...Ren? I had the strangest dream. You were fighting a giant eye.'),
        L('Ren', 'Just a dream, Master. Breakfast?'),
      ] },
      { type: 'victory' },
    ],
  },
);
