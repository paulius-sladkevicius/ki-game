'use strict';
// Drawing: figures built from simple shapes, poses, backgrounds, beams and projectiles.

// ---------- Color helper ----------
const _shadeCache = {};
function shade(hex, f) {
  const key = hex + f;
  if (_shadeCache[key]) return _shadeCache[key];
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(Math.round(((n >> 16) & 255) * f), 0, 255);
  const g = clamp(Math.round(((n >> 8) & 255) * f), 0, 255);
  const b = clamp(Math.round((n & 255) * f), 0, 255);
  return (_shadeCache[key] = `rgb(${r},${g},${b})`);
}

// ---------- Styles ----------
const STYLES = {
  heroBase: { gi: '#2b59c3', under: '#f4f4f4', belt: '#d63b2e', pants: '#1f2f5a', boots: '#2a2a2a', arm: '#f2c29b', skin: '#f2c29b', band: '#d63b2e', headband: '#d63b2e', hair: 'swept', hairColor: '#1a1a1a' },
  heroFlame: { gi: '#2b59c3', under: '#f4f4f4', belt: '#d63b2e', pants: '#1f2f5a', boots: '#2a2a2a', arm: '#f2c29b', skin: '#f2c29b', band: '#d63b2e', headband: '#d63b2e', hair: 'flame', hairColor: '#ff6a1a' },
  scout: { gi: '#5b6170', under: '#2c2f38', belt: '#c0392b', pants: '#3a3f4b', boots: '#22252c', arm: '#5b6170', skin: '#8fc28a', band: '#c0392b', hair: 'helmet', hairColor: '#c0392b', visor: '#55e6ff' },
  gunner: { gi: '#6b4f8a', under: '#2c2238', belt: '#e67e22', pants: '#3d2e52', boots: '#22202c', arm: '#6b4f8a', skin: '#9ad0c2', band: '#e67e22', hair: 'helmet', hairColor: '#e67e22', visor: '#ffe14d' },
  boss: { gi: '#3b2a5c', under: '#c9c9d9', belt: '#c8a640', pants: '#2a1f40', boots: '#c9c9d9', arm: '#3b2a5c', skin: '#b9d7e8', band: '#c8a640', hair: 'long', hairColor: '#e8e8f0', sword: true },
  heroStorm: { gi: '#2b59c3', under: '#f4f4f4', belt: '#d63b2e', pants: '#1f2f5a', boots: '#2a2a2a', arm: '#f2c29b', skin: '#f2c29b', band: '#d63b2e', headband: '#d63b2e', hair: 'storm', hairColor: '#b48cff' },
  heroSky: { gi: '#2b59c3', under: '#f4f4f4', belt: '#d63b2e', pants: '#1f2f5a', boots: '#2a2a2a', arm: '#f2c29b', skin: '#f2c29b', band: '#d63b2e', headband: '#d63b2e', hair: 'flame', hairColor: '#3fe0c0' },
  heroStar: { gi: '#f4f4f4', under: '#2b59c3', belt: '#d63b2e', pants: '#1f2f5a', boots: '#2a2a2a', arm: '#f2c29b', skin: '#f2c29b', band: '#d63b2e', headband: '#ffffff', hair: 'storm', hairColor: 'rainbow' },
  armored: { gi: '#3a6a9a', under: '#1a2a3a', belt: '#d0d0d0', pants: '#2a4a6a', boots: '#1a2a3a', arm: '#3a6a9a', skin: '#9ab0c8', band: '#d0d0d0', hair: 'helmet', hairColor: '#d0e0f0', visor: '#40ffd0', shield: true },
  brute: { gi: '#3a2a22', under: '#ff6a1a', belt: '#ff6a1a', pants: '#2a1a12', boots: '#1a1008', arm: '#c8501a', skin: '#c8501a', band: '#ff6a1a', hair: 'horns', hairColor: '#2a1a12' },
  elite: { gi: '#1f1f26', under: '#c8a640', belt: '#c8a640', pants: '#15151a', boots: '#c8a640', arm: '#1f1f26', skin: '#c0a0d8', band: '#c8a640', hair: 'helmet', hairColor: '#c8a640', visor: '#ff3040' },
  twinRed: { gi: '#8b1e1e', under: '#222222', belt: '#e0b030', pants: '#3a1010', boots: '#222222', arm: '#e8b0a0', skin: '#e8b0a0', band: '#e0b030', hair: 'mohawk', hairColor: '#ff5a3a' },
  twinBlue: { gi: '#1e3a8b', under: '#222222', belt: '#e0b030', pants: '#10183a', boots: '#222222', arm: '#a0c8e8', skin: '#a0c8e8', band: '#e0b030', hair: 'mohawk', hairColor: '#3ab0ff' },
  krag: { gi: '#4a5a6a', under: '#2a2f38', belt: '#8a6a2a', pants: '#2a3038', boots: '#1a1a1a', arm: '#4a5a6a', skin: '#7a8f6a', band: '#8a6a2a', hair: 'helmet', hairColor: '#3a4a5a', visor: '#ff4040', shield: true },
  nyx: { gi: '#2a1a3a', under: '#d040a0', belt: '#d040a0', pants: '#1a1028', boots: '#d040a0', arm: '#d8c8f0', skin: '#d8c8f0', band: '#d040a0', hair: 'long', hairColor: '#8a2be2' },
  vorg: { gi: '#2b2b33', under: '#b8322a', belt: '#c9a227', pants: '#1d1d24', boots: '#3a3a44', arm: '#2b2b33', skin: '#6f9a5c', band: '#c9a227', hair: 'horns', hairColor: '#d8cfa8' },
  vorg2: { gi: '#4a0d0d', under: '#ff7a1a', belt: '#ffcc33', pants: '#2a0606', boots: '#ffcc33', arm: '#4a0d0d', skin: '#3f6a34', band: '#ffcc33', hair: 'horns', hairColor: '#f4f0e0' },
  master: { gi: '#3d7a52', under: '#e8dcc0', belt: '#6b4a2a', pants: '#2f5a3e', boots: '#4a3420', arm: '#3d7a52', skin: '#e2c09a', band: '#6b4a2a', hair: 'sage', hairColor: '#cfcfcf' },
  villager: { gi: '#3a6aa8', under: '#e8e8f0', belt: '#8a5a2a', pants: '#2a3a5a', boots: '#5a3a20', arm: '#3a6aa8', skin: '#f0d0b0', band: '#e8e8f0', hair: 'long', hairColor: '#7a4a2a' },
  raxasBase: { gi: '#3b2a5c', under: '#c9c9d9', belt: '#c8a640', pants: '#2a1f40', boots: '#c9c9d9', arm: '#3b2a5c', skin: '#b9d7e8', band: '#c8a640', hair: 'long', hairColor: '#e8e8f0', sword: true },
  raxasShadow: { gi: '#1c1230', under: '#8a4dff', belt: '#c8a640', pants: '#140d22', boots: '#8a4dff', arm: '#1c1230', skin: '#b9d7e8', band: '#8a4dff', hair: 'long', hairColor: '#a070ff', sword: true },
  raxasEclipse: { gi: '#151515', under: '#ffcc55', belt: '#ffcc55', pants: '#0d0d0d', boots: '#ffcc55', arm: '#151515', skin: '#d8e6f0', band: '#ffcc55', hair: 'long', hairColor: '#ffe2a0', sword: true },
  shade: { gi: '#1a1426', under: '#5a2a9a', belt: '#5a2a9a', pants: '#120e1c', boots: '#2a1e40', arm: '#1a1426', skin: '#3a2e52', band: '#7a50c0', hair: 'helmet', hairColor: '#2a1e40', visor: '#c070ff' },
  golem: { gi: '#6a707c', under: '#4a505a', belt: '#3a3f48', pants: '#5a606a', boots: '#3a3f48', arm: '#7a808c', skin: '#8a909c', band: '#5fe0ff', hair: 'helmet', hairColor: '#5a606a', visor: '#5fe0ff' },
  sable: { gi: '#120c1e', under: '#8a4dff', belt: '#4a2a7a', pants: '#0c0814', boots: '#4a2a7a', arm: '#120c1e', skin: '#cfc4e8', band: '#8a4dff', hair: 'long', hairColor: '#2a1a40', sword: true },
  gale: { gi: '#e8f4f0', under: '#2fb89a', belt: '#2fb89a', pants: '#cfe6e0', boots: '#2fb89a', arm: '#e8f4f0', skin: '#e8cfb0', band: '#2fb89a', hair: 'mohawk', hairColor: '#7ff0d8' },
  quartz: { gi: '#5fa8d0', under: '#c890ff', belt: '#8fe6ff', pants: '#3f7ea8', boots: '#8fe6ff', arm: '#7fc8f0', skin: '#a8e0ff', band: '#c890ff', hair: 'helmet', hairColor: '#8fe6ff', visor: '#ff90e0', shield: true },
  volta: { gi: '#20263a', under: '#ffe14d', belt: '#ffe14d', pants: '#141826', boots: '#ffe14d', arm: '#20263a', skin: '#d8e0f0', band: '#ffe14d', hair: 'storm', hairColor: '#fff6a0' },
  hollow: { gi: '#0c0a14', under: '#5a2a9a', belt: '#3a2a5a', pants: '#08060e', boots: '#3a2a5a', arm: '#0c0a14', skin: '#2a2438', band: '#a070ff', hair: 'horns', hairColor: '#cfc0ff' },
  hollow2: { gi: '#000000', under: '#ff40a0', belt: '#ff40a0', pants: '#050008', boots: '#ff40a0', arm: '#08000e', skin: '#1a0828', band: '#ff40a0', hair: 'horns', hairColor: '#ff90d0' },
  flash: { gi: '#ffffff', under: '#ffffff', belt: '#ffffff', pants: '#ffffff', boots: '#ffffff', arm: '#ffffff', skin: '#ffffff', band: '#ffffff', hair: null, hairColor: '#ffffff', visor: '#ffffff' },
};

// ---------- Poses ----------
// Angles in radians from "straight down"; positive = forward (facing direction).
// For legs the second number is negative (knee bends back), for arms positive.
const POSES = {
  idle: (t) => ({ crouch: 3 + Math.sin(t * 4), lean: 0.05, fl: [0.35, -0.25], bl: [-0.3, -0.15], fa: [0.9, 1.7], ba: [0.5, 1.9] }),
  run: (t) => {
    const p = t * 13;
    return { crouch: 2, lean: 0.25, fl: [Math.sin(p) * 0.8, -0.3 - Math.max(0, Math.cos(p)) * 1.1], bl: [-Math.sin(p) * 0.8, -0.3 - Math.max(0, -Math.cos(p)) * 1.1], fa: [-Math.sin(p) * 0.9, 1.4], ba: [Math.sin(p) * 0.9, 1.4] };
  },
  walk: (t) => {
    const p = t * 8;
    return { crouch: 2, lean: 0.1, fl: [Math.sin(p) * 0.5, -0.2 - Math.max(0, Math.cos(p)) * 0.6], bl: [-Math.sin(p) * 0.5, -0.2 - Math.max(0, -Math.cos(p)) * 0.6], fa: [0.7, 1.6], ba: [0.4, 1.7] };
  },
  jump: () => ({ crouch: 0, lean: 0.1, fl: [0.9, -1.4], bl: [-0.1, -0.9], fa: [1.2, 1.2], ba: [2.2, 0.4] }),
  fall: () => ({ crouch: 0, lean: 0, fl: [0.4, -0.6], bl: [-0.3, -0.5], fa: [1.8, 0.3], ba: [-0.8, 0.5] }),
  fly: (t) => ({ crouch: 0, lean: 0.6, fl: [-0.1 + Math.sin(t * 6) * 0.05, -0.5], bl: [-0.35, -0.7], fa: [1.6, 0.1], ba: [-0.4, 0.4] }),
  punch1: () => ({ crouch: 4, lean: 0.15, fl: [0.5, -0.2], bl: [-0.45, -0.1], fa: [1.6, 0], ba: [0.4, 2.0] }),
  punch2: () => ({ crouch: 4, lean: 0.2, fl: [0.5, -0.2], bl: [-0.45, -0.1], fa: [0.4, 2.0], ba: [1.6, 0] }),
  kick: () => ({ crouch: 0, lean: -0.25, fl: [1.7, -0.05], bl: [-0.1, -0.1], fa: [0.6, 1.8], ba: [-0.6, 1.0] }),
  charge: () => ({ crouch: 9, lean: -0.15, fl: [0.55, -0.5], bl: [-0.55, -0.3], fa: [-0.7, 1.3], ba: [-0.8, 1.4] }),
  fire: () => ({ crouch: 8, lean: 0.12, fl: [0.6, -0.4], bl: [-0.6, -0.2], fa: [1.55, 0.05], ba: [1.5, 0.1] }),
  kicharge: (t) => ({ crouch: 10 + Math.sin(t * 30) * 0.6, lean: -0.05, fl: [0.45, -0.6], bl: [-0.45, -0.4], fa: [0.45, 0.6], ba: [-0.45, 0.6], scream: true }),
  guard: (t) => ({ crouch: 8 + Math.sin(t * 6) * 0.5, lean: 0.05, fl: [0.5, -0.5], bl: [-0.5, -0.3], fa: [1.25, 1.75], ba: [1.05, 1.9] }),
  hurt: () => ({ crouch: 2, lean: -0.45, fl: [0.3, -0.3], bl: [-0.4, -0.2], fa: [-0.8, 0.6], ba: [-1.2, 0.4] }),
  transform: (t) => ({ crouch: 10 + Math.sin(t * 40), lean: -0.2, fl: [0.5, -0.5], bl: [-0.5, -0.3], fa: [0.7, 0.4], ba: [-0.7, 0.4], scream: true }),
  windup: () => ({ crouch: 4, lean: -0.1, fl: [0.4, -0.3], bl: [-0.4, -0.2], fa: [-0.9, 1.7], ba: [0.5, 1.8] }),
  dead: () => ({ lying: 1, crouch: 0, lean: 0, fl: [0.1, -0.1], bl: [-0.1, -0.1], fa: [2.5, 0.3], ba: [2.8, 0.2] }),
  // Boss poses with a sword
  swordIdle: (t) => ({ crouch: 4 + Math.sin(t * 3), lean: 0.05, fl: [0.4, -0.3], bl: [-0.35, -0.2], fa: [0.6, 1.0], ba: [0.3, 1.6] }),
  swordRaise: () => ({ crouch: 6, lean: -0.15, fl: [0.45, -0.4], bl: [-0.45, -0.2], fa: [2.8, 0.3], ba: [0.4, 1.6] }),
  swordSlash: () => ({ crouch: 8, lean: 0.3, fl: [0.7, -0.4], bl: [-0.6, -0.1], fa: [1.4, -0.1], ba: [-0.5, 0.8] }),
  dash: () => ({ crouch: 10, lean: 0.55, fl: [0.8, -0.6], bl: [-0.8, -0.3], fa: [1.7, -0.2], ba: [-0.9, 0.5] }),
};

// ---------- Figure ----------
function limb(ctx, x, y, a1, l1, a2, l2, w1, w2, c1, c2) {
  const kx = x + Math.sin(a1) * l1;
  const ky = y + Math.cos(a1) * l1;
  const ex = kx + Math.sin(a1 + a2) * l2;
  const ey = ky + Math.cos(a1 + a2) * l2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = c1; ctx.lineWidth = w1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.strokeStyle = c2; ctx.lineWidth = w2;
  ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
  return { x: ex, y: ey, a: a1 + a2 };
}

function drawLeg(ctx, x, y, L, st, back) {
  const f = back ? 0.72 : 1;
  const end = limb(ctx, x, y, L[0], 20, L[1], 20, 11, 9, shade(st.pants, f), shade(st.pants, f * 0.92));
  ctx.save();
  ctx.translate(end.x, end.y);
  ctx.rotate(-end.a);
  ctx.fillStyle = shade(st.boots, f);
  ctx.beginPath();
  ctx.ellipse(3, 1, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawArm(ctx, x, y, A, st, back) {
  const f = back ? 0.72 : 1;
  const end = limb(ctx, x, y, A[0], 14, A[1], 13, 8, 7, shade(st.arm, f), shade(st.skin, f));
  ctx.fillStyle = shade(st.skin, f);
  ctx.beginPath(); ctx.arc(end.x, end.y, 4.8, 0, Math.PI * 2); ctx.fill();
  // wristband
  const bx = end.x - Math.sin(end.a) * 4, by = end.y - Math.cos(end.a) * 4;
  ctx.strokeStyle = shade(st.band, f); ctx.lineWidth = 7.5;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - Math.sin(end.a) * 2, by - Math.cos(end.a) * 2); ctx.stroke();
  return end;
}

function drawTorso(ctx, st) {
  ctx.fillStyle = st.gi;
  ctx.beginPath();
  ctx.moveTo(-9, 3); ctx.lineTo(9, 3); ctx.lineTo(11, -21);
  ctx.quadraticCurveTo(0, -29, -11, -21);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = st.under;
  ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(10, -22); ctx.lineTo(5, -12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = st.belt;
  ctx.fillRect(-10, -3, 20, 5);
  ctx.fillRect(-13, -1, 4, 9);
}

const HAIR = {
  swept: [[8, -4], [9, -9], [4, -11], [-2, -12], [-8, -10], [-11, -6], [-18, -4], [-25, 1], [-16, 1], [-10, 3], [-8, 7], [-6, 8]],
  sage: [[-5, -8], [-4, -14], [0, -17], [4, -14], [4, -8], [0, -9]],
  spiky: [[8, -4], [10, -10], [5, -9], [6, -16], [0, -11], [-3, -19], [-5, -11], [-12, -15], [-9, -6], [-15, -6], [-9, -1], [-13, 3], [-8, 4], [-6, 8]],
  flame: [[8, -3], [13, -11], [6, -10], [9, -21], [2, -13], [1, -26], [-4, -13], [-10, -23], [-8, -10], [-17, -15], [-10, -4], [-17, 0], [-9, 2], [-6, 8]],
  storm: [[8, -3], [15, -12], [6, -11], [11, -24], [2, -14], [2, -30], [-4, -14], [-12, -27], [-8, -10], [-21, -18], [-10, -4], [-22, -2], [-10, 2], [-18, 8], [-6, 8]],
  mohawk: [[6, -6], [8, -14], [3, -10], [2, -19], [-3, -11], [-6, -18], [-8, -8], [-13, -12], [-9, -2], [-4, -6]],
  horns: [[8, -5], [12, -18], [4, -9], [-4, -9], [-10, -22], [-8, -6], [-9, 0], [-5, -6], [4, -6]],
  beard: [[7, 3], [10, 8], [7, 15], [2, 20], [-1, 13], [-3, 6], [0, 4]],
  long: [[9, -4], [9, -11], [2, -12], [-6, -10], [-10, -5], [-20, 2], [-30, 12], [-18, 7], [-12, 9], [-6, 8]],
};

function drawHead(ctx, st, pose, t) {
  ctx.fillStyle = st.skin;
  ctx.fillRect(-1, -31, 7, 7);
  ctx.save();
  ctx.translate(3, -36);
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  if (st.hair === 'helmet') {
    ctx.fillStyle = st.hairColor;
    ctx.beginPath(); ctx.arc(0, -1, 10.5, Math.PI, 0); ctx.fill();
    ctx.fillRect(-10.5, -2, 21, 3);
    ctx.fillStyle = st.visor;
    ctx.fillRect(3, -4, 8, 4);
  } else {
    if (st.hair && HAIR[st.hair]) {
      ctx.fillStyle = st.hairColor === 'rainbow' ? `hsl(${(t * 140) % 360}, 90%, 72%)` : st.hairColor;
      ctx.beginPath();
      const jit = st.hair === 'flame' ? 1.2 : 0;
      HAIR[st.hair].forEach(([x, y], i) => {
        const jx = jit ? Math.sin(t * 25 + i) * jit : 0;
        const jy = jit ? Math.cos(t * 21 + i * 2) * jit : 0;
        if (i === 0) ctx.moveTo(x + jx, y + jy); else ctx.lineTo(x + jx, y + jy);
      });
      ctx.closePath(); ctx.fill();
      if (st.hair === 'sage') {
        ctx.beginPath();
        HAIR.beard.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.closePath(); ctx.fill();
      }
    }
    if (st.headband) {
      // headband with two tails flowing back
      ctx.fillStyle = st.headband;
      ctx.fillRect(-9, -6, 18.5, 3.6);
      ctx.beginPath();
      ctx.moveTo(-8, -5); ctx.lineTo(-17, -3 + Math.sin(t * 9) * 2); ctx.lineTo(-16, 0 + Math.sin(t * 9) * 2); ctx.lineTo(-8, -2);
      ctx.closePath(); ctx.fill();
    }
    // eye and eyebrow
    ctx.fillStyle = '#111';
    ctx.fillRect(4.5, -2.5, 2.4, 3.6);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(3, -5); ctx.lineTo(8, -3.6); ctx.stroke();
    if (pose.scream) {
      ctx.fillStyle = '#5a1010';
      ctx.beginPath(); ctx.ellipse(6.5, 4.2, 2.2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawSword(ctx, hand) {
  const dx = Math.sin(hand.a), dy = Math.cos(hand.a);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6b4a1e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(hand.x - dx * 6, hand.y - dy * 6); ctx.lineTo(hand.x + dx * 4, hand.y + dy * 4); ctx.stroke();
  ctx.strokeStyle = '#c8a640'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(hand.x + dx * 4 - dy * 6, hand.y + dy * 4 + dx * 6); ctx.lineTo(hand.x + dx * 4 + dy * 6, hand.y + dy * 4 - dx * 6); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,140,255,0.45)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(hand.x + dx * 6, hand.y + dy * 6); ctx.lineTo(hand.x + dx * 52, hand.y + dy * 52); ctx.stroke();
  ctx.strokeStyle = '#e9e9f5'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(hand.x + dx * 6, hand.y + dy * 6); ctx.lineTo(hand.x + dx * 52, hand.y + dy * 52); ctx.stroke();
  ctx.restore();
}

// f = { x, y, facing, pose, style, scale, flash, t }
function drawHumanoid(ctx, f) {
  const st = f.flash ? Object.assign({}, STYLES.flash, { hair: f.style.hair }) : f.style;
  const P = f.pose;
  const s = f.scale || 1;
  const t = f.t || 0;
  const crouch = P.crouch || 0;
  const lean = P.lean || 0;
  const hipY = -40 + crouch;

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.facing * s, s);
  if (P.lying) { ctx.translate(0, -8); ctx.rotate(-Math.PI / 2 * P.lying); }

  ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean);
  drawArm(ctx, -2, -23, P.ba, st, true);
  ctx.restore();
  drawLeg(ctx, -2, hipY, P.bl, st, true);
  drawLeg(ctx, 2, hipY, P.fl, st, false);
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean);
  drawTorso(ctx, st);
  drawHead(ctx, st, P, t);
  const hand = drawArm(ctx, 2, -23, P.fa, st, false);
  if (f.style.sword) drawSword(ctx, hand);
  if (f.style.shield) {
    ctx.fillStyle = f.flash ? '#ffffff' : shade(f.style.hairColor, 0.9);
    ctx.strokeStyle = f.flash ? '#ffffff' : f.style.visor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(hand.x - 2, hand.y - 30, 9, 48, 4); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

// Flying drone
function drawDrone(ctx, x, y, facing, t, flash) {
  ctx.save();
  ctx.translate(x, y - 14);
  ctx.scale(facing, 1);
  const body = flash ? '#ffffff' : '#5a6474';
  ctx.strokeStyle = flash ? '#fff' : '#2a2f38'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-18, -10); ctx.lineTo(18, -10); ctx.stroke();
  ctx.fillStyle = 'rgba(200,220,255,0.5)';
  const r = 10 * Math.abs(Math.sin(t * 40));
  ctx.fillRect(-18 - r, -13, r * 2, 3); ctx.fillRect(18 - r, -13, r * 2, 3);
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = flash ? '#fff' : '#ff3a3a';
  ctx.beginPath(); ctx.arc(7, 1, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(8, -1, 2, 2);
  ctx.fillStyle = flash ? '#fff' : '#2a2f38'; ctx.fillRect(-6, 9, 12, 4);
  ctx.restore();
}

// Wisp: a floating spirit of light
function drawWisp(ctx, x, y, facing, t, flash) {
  const cy = y - 17;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, cy, 2, x, cy, 30);
  g.addColorStop(0, flash ? '#ffffff' : 'rgba(200,250,255,0.95)');
  g.addColorStop(0.4, 'rgba(80,200,255,0.6)');
  g.addColorStop(1, 'rgba(0,80,160,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, cy, 30, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(140,230,255,0.5)';
    ctx.beginPath(); ctx.arc(x - facing * (14 + i * 8), cy + Math.sin(t * 8 + i) * 4, 5 - i, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#05324a';
  ctx.fillRect(x + facing * 3 - 1, cy - 4, 3, 5);
  ctx.fillRect(x + facing * 9 - 1, cy - 4, 3, 5);
}

// Rolling exploding robot
function drawBomber(ctx, x, y, facing, t, flash, fuse) {
  ctx.save();
  ctx.translate(x, y - 15);
  ctx.rotate(t * 8 * facing * (fuse ? 0 : 1));
  ctx.fillStyle = flash ? '#ffffff' : '#3a3a42';
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffb000'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.moveTo(0, -15); ctx.lineTo(0, 15); ctx.stroke();
  ctx.restore();
  const blink = fuse ? Math.floor(t * 20) % 2 === 0 : Math.floor(t * 3) % 2 === 0;
  ctx.fillStyle = blink ? '#ff2020' : '#661010';
  ctx.beginPath(); ctx.arc(x, y - 33, 4, 0, Math.PI * 2); ctx.fill();
}

// Position of the front hand in world coordinates.
function handOf(f) {
  const P = f.pose, s = f.scale || 1, lean = P.lean || 0;
  const hipY = -40 + (P.crouch || 0);
  const a1 = P.fa[0], a2 = P.fa[1];
  const x = 2 + Math.sin(a1) * 14 + Math.sin(a1 + a2) * 13;
  const y = -23 + Math.cos(a1) * 14 + Math.cos(a1 + a2) * 13;
  const rx = x * Math.cos(lean) - y * Math.sin(lean);
  const ry = x * Math.sin(lean) + y * Math.cos(lean);
  return { x: f.x + f.facing * s * rx, y: f.y + s * (hipY + ry) };
}

function drawShadow(ctx, x, y, w) {
  const h = clamp((GROUND - y) / 300, 0, 1);
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - h * 0.7)})`;
  ctx.beginPath();
  ctx.ellipse(x, GROUND + 3, w * (1 - h * 0.5), 6 * (1 - h * 0.5), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAura(ctx, x, y, h, color, intensity, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 1 + Math.sin(t * 18) * 0.06;
  const g = ctx.createRadialGradient(x, y - h * 0.5, 4, x, y - h * 0.5, h * 0.75 * pulse);
  g.addColorStop(0, color.replace('A', String(0.35 * intensity)));
  g.addColorStop(0.6, color.replace('A', String(0.18 * intensity)));
  g.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.5, h * 0.42 * pulse, h * 0.75 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnergyBall(ctx, x, y, r, inner, outer, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rr = r * (1 + Math.sin(t * 30) * 0.1);
  const g = ctx.createRadialGradient(x, y, 0, x, y, rr * 2.2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.25, inner);
  g.addColorStop(0.55, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, rr * 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Beams ----------
const BEAM_COLORS = {
  base: ['rgba(40,140,255,A)', 'rgba(140,215,255,A)'],
  flame: ['rgba(255,90,20,A)', 'rgba(255,195,130,A)'],
  storm: ['rgba(150,80,255,A)', 'rgba(225,200,255,A)'],
  sky: ['rgba(20,200,170,A)', 'rgba(175,255,235,A)'],
  star: ['rgba(255,110,210,A)', 'rgba(255,255,255,A)'],
  boss: ['rgba(200,30,110,A)', 'rgba(255,165,205,A)'],
  shadow: ['rgba(110,30,220,A)', 'rgba(210,180,255,A)'],
  eclipse: ['rgba(255,170,40,A)', 'rgba(255,245,200,A)'],
  raxas: ['rgba(160,60,255,A)', 'rgba(225,190,255,A)'],
  red: ['rgba(255,40,60,A)', 'rgba(255,170,170,A)'],
  crystal: ['rgba(90,200,255,A)', 'rgba(255,200,250,A)'],
  void: ['rgba(120,0,200,A)', 'rgba(255,120,220,A)'],
};

function drawBeam(ctx, b) {
  const x0 = b.x;
  const x1 = b.x + b.dir * b.len;
  const age = b.max - b.life;
  let k = 1;
  if (!b.clash) k = Math.min(1, age * 12) * Math.min(1, b.life / 0.15);
  const w = b.width * k * (1 + Math.sin(Game.time * 70) * 0.07);
  if (w <= 0.5) return;
  const [outer, mid] = BEAM_COLORS[b.color];
  const left = Math.min(x0, x1), right = Math.max(x0, x1);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = outer.replace('A', '0.35');
  ctx.fillRect(left, b.y - w * 0.85, right - left, w * 1.7);
  ctx.beginPath(); ctx.arc(x1, b.y, w * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = outer.replace('A', '0.75');
  ctx.fillRect(left, b.y - w * 0.5, right - left, w);
  ctx.beginPath(); ctx.arc(x1, b.y, w * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = mid.replace('A', '0.9');
  ctx.fillRect(left, b.y - w * 0.3, right - left, w * 0.6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(left, b.y - w * 0.13, right - left, w * 0.26);
  ctx.beginPath(); ctx.arc(x1, b.y, w * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawEnergyBall(ctx, x0, b.y, w * 0.55, mid.replace('A', '1'), outer.replace('A', '0.6'), Game.time);
}

// ---------- Projectiles ----------
function drawProjectile(ctx, p) {
  if (p.type === 'crescent') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    const k = p.power === 1 ? 0.65 : 1;   // a weakened sword wave is smaller
    ctx.scale(sign(p.vx) * k, k);
    ctx.fillStyle = 'rgba(190,110,255,0.5)';
    ctx.beginPath(); ctx.arc(-10, 0, 24, -1.2, 1.2); ctx.arc(-22, 0, 22, 1.1, -1.1, true); ctx.fill();
    ctx.fillStyle = 'rgba(245,225,255,0.95)';
    ctx.beginPath(); ctx.arc(-10, 0, 20, -1.1, 1.1); ctx.arc(-18, 0, 18, 1.0, -1.0, true); ctx.fill();
    ctx.restore();
    return;
  }
  if (p.type === 'shard') {
    // falling crystal + its shadow on the ground
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(p.x, GROUND + 2, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = '#9ff0ff';
    ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(-7, -8); ctx.lineTo(0, -16); ctx.lineTo(7, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(-2, -8); ctx.lineTo(0, -13); ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  if (p.type === 'tornado') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const yy = p.y + 28 - i * 11;
      const rw = 8 + i * 4.5;
      const ph = Game.time * 14 + i;
      ctx.strokeStyle = `rgba(200,255,240,${0.25 + 0.1 * (p.power || 1)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(p.x + Math.sin(ph) * 4, yy, rw, 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    return;
  }
  if (p.type === 'groundwave') {
    ctx.save();
    ctx.translate(p.x, GROUND);
    ctx.scale(sign(p.vx), 1);
    ctx.fillStyle = '#8a7a6a';
    for (let i = 0; i < 4; i++) {
      const hh = 14 + ((i * 7 + Math.floor(Game.time * 30)) % 3) * 6;
      ctx.beginPath(); ctx.moveTo(-i * 12 - 8, 0); ctx.lineTo(-i * 12, -hh + i * 3); ctx.lineTo(-i * 12 + 8, 0); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -26); ctx.lineTo(3, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  drawEnergyBall(ctx, p.x, p.y, p.r, p.inner, p.outer, Game.time + p.x * 0.01);
}

// ---------- Backgrounds ----------
const _bgCache = {};

function bgSky(g, stops) {
  const sky = g.createLinearGradient(0, 0, 0, GROUND);
  stops.forEach(([t, c]) => sky.addColorStop(t, c));
  g.fillStyle = sky; g.fillRect(0, 0, W, GROUND);
}
function bgGlow(g, x, y, r, inner, outer) {
  const sun = g.createRadialGradient(x, y, 4, x, y, r);
  sun.addColorStop(0, inner);
  sun.addColorStop(0.35, outer);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sun; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}
function bgPeaks(g, color, peaks) {
  g.fillStyle = color;
  g.beginPath(); g.moveTo(0, GROUND);
  peaks.forEach(([x, y]) => g.lineTo(x, y));
  g.lineTo(W, GROUND); g.closePath(); g.fill();
}
function bgStars(g, n, maxY, alpha = 0.6) {
  g.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let i = 0; i < n; i++) { const s = (i % 3) * 0.7 + 1; g.fillRect((i * 137.7) % W, (i * 71.3) % maxY, s, s); }
}
function bgClouds(g, color, list) {
  g.fillStyle = color;
  list.forEach(([x, y, r]) => {
    g.beginPath(); g.ellipse(x, y, r, r * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + r * 0.4, y - 8, r * 0.6, r * 0.2, 0, 0, Math.PI * 2); g.fill();
  });
}
function bgGround(g, top, bottom, edge, line, tiles = true) {
  const ground = g.createLinearGradient(0, GROUND, 0, H);
  ground.addColorStop(0, top); ground.addColorStop(1, bottom);
  g.fillStyle = ground; g.fillRect(0, GROUND, W, H - GROUND);
  g.fillStyle = edge; g.fillRect(0, GROUND, W, 4);
  if (!tiles) return;
  g.strokeStyle = line; g.lineWidth = 2;
  for (let row = 0; row < 3; row++) {
    const y = GROUND + 4 + row * 26;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (row % 2) * 40; x < W; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); }
  }
}

const BG_BUILDERS = {
  monastery(g) {
    bgSky(g, [[0, '#24325e'], [0.55, '#c86b6b'], [0.85, '#f7a35c'], [1, '#ffd59e']]);
    bgGlow(g, 700, 300, 140, 'rgba(255,245,210,1)', 'rgba(255,230,170,0.7)');
    bgStars(g, 40, 140);
    bgClouds(g, 'rgba(255,220,200,0.25)', [[150, 120, 90], [420, 90, 120], [820, 150, 100], [600, 200, 70]]);
    bgPeaks(g, '#7a5f8f', [[0, 300], [90, 230], [170, 280], [260, 190], [360, 270], [470, 210], [560, 290], [650, 240], [760, 300], [860, 220], [960, 280]]);
    bgPeaks(g, '#4f3d6b', [[0, 360], [120, 300], [210, 350], [330, 280], [440, 360], [560, 320], [680, 370], [800, 300], [900, 350], [960, 330]]);
    g.fillStyle = '#3a2d52';
    g.beginPath(); g.moveTo(820, GROUND); g.lineTo(830, 250); g.lineTo(900, 230); g.lineTo(960, 240); g.lineTo(960, GROUND); g.closePath(); g.fill();
    const fall = g.createLinearGradient(0, 245, 0, GROUND);
    fall.addColorStop(0, 'rgba(200,230,255,0.9)'); fall.addColorStop(1, 'rgba(200,230,255,0.4)');
    g.fillStyle = fall; g.fillRect(860, 245, 34, GROUND - 245);
    // pagoda
    g.fillStyle = '#2b2140';
    g.fillRect(70, 290, 150, GROUND - 290);
    g.fillRect(95, 220, 100, 70); g.fillRect(115, 160, 60, 60);
    const roof = (cx, y, w) => {
      g.beginPath(); g.moveTo(cx - w / 2 - 18, y + 4); g.quadraticCurveTo(cx, y - 8, cx + w / 2 + 18, y + 4);
      g.lineTo(cx + w / 2, y - 14); g.lineTo(cx - w / 2, y - 14); g.closePath(); g.fill();
    };
    g.fillStyle = '#1e1630';
    roof(145, 296, 160); roof(145, 226, 112); roof(145, 166, 72);
    g.fillRect(142, 120, 6, 32);
    g.fillStyle = 'rgba(255,190,90,0.8)';
    g.fillRect(132, 330, 26, 34); g.fillRect(122, 245, 14, 18); g.fillRect(154, 245, 14, 18);
    const pine = (x, h) => {
      g.fillStyle = '#1d2a2a';
      g.fillRect(x - 3, GROUND - h * 0.25, 6, h * 0.25);
      for (let i = 0; i < 3; i++) {
        const y = GROUND - h * 0.25 - i * h * 0.22;
        g.beginPath(); g.moveTo(x - h * 0.28 + i * 6, y); g.lineTo(x, y - h * 0.38); g.lineTo(x + h * 0.28 - i * 6, y); g.closePath(); g.fill();
      }
    };
    pine(280, 150); pine(320, 110); pine(760, 140); pine(720, 100);
    bgGround(g, '#8a6a4c', '#4e3826', '#b08a62', 'rgba(0,0,0,0.25)');
  },

  desert(g) {
    bgSky(g, [[0, '#3a7bd5'], [0.6, '#9fc8f0'], [0.9, '#ffd9a0'], [1, '#ffc07a']]);
    bgGlow(g, 220, 110, 120, 'rgba(255,255,230,1)', 'rgba(255,240,180,0.6)');
    bgClouds(g, 'rgba(255,255,255,0.45)', [[520, 90, 110], [820, 140, 80]]);
    bgPeaks(g, '#e0a46a', [[0, 330], [140, 320], [200, 300], [330, 310], [420, 290], [560, 320], [700, 300], [820, 315], [960, 305]]);
    // mesas
    const mesa = (x, w, top, color) => {
      g.fillStyle = color;
      g.beginPath(); g.moveTo(x - 20, GROUND); g.lineTo(x, top + 10); g.lineTo(x + 8, top); g.lineTo(x + w - 8, top); g.lineTo(x + w, top + 10); g.lineTo(x + w + 20, GROUND); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.12)';
      for (let i = 1; i < 4; i++) g.fillRect(x + 4, top + i * ((GROUND - top) / 4), w - 8, 4);
    };
    mesa(40, 200, 220, '#b5562e');
    mesa(620, 150, 260, '#a24a28');
    mesa(800, 180, 200, '#c2643a');
    // cacti
    const cactus = (x, h) => {
      g.fillStyle = '#2f6b3a';
      g.beginPath(); g.roundRect(x - 6, GROUND - h, 12, h, 6); g.fill();
      g.beginPath(); g.roundRect(x - 22, GROUND - h * 0.7, 10, h * 0.35, 5); g.fill();
      g.fillRect(x - 18, GROUND - h * 0.42, 14, 8);
      g.beginPath(); g.roundRect(x + 12, GROUND - h * 0.8, 10, h * 0.3, 5); g.fill();
      g.fillRect(x + 4, GROUND - h * 0.55, 14, 8);
    };
    cactus(330, 90); cactus(520, 70); cactus(930, 60);
    bgGround(g, '#e8b878', '#b07a40', '#f5d098', 'rgba(120,70,20,0.15)', false);
    g.fillStyle = 'rgba(150,90,40,0.25)';
    for (let i = 0; i < 30; i++) g.fillRect((i * 97) % W, GROUND + 10 + (i * 37) % 60, 18, 3);
  },

  ice(g) {
    bgSky(g, [[0, '#0b1a3a'], [0.5, '#2a5a8a'], [1, '#bfe6ff']]);
    bgStars(g, 60, 220, 0.7);
    // aurora
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = ['rgba(80,255,180,0.18)', 'rgba(120,200,255,0.15)', 'rgba(200,120,255,0.12)'][k];
      g.lineWidth = 26 - k * 6;
      g.beginPath();
      for (let x = 0; x <= W; x += 20) g.lineTo(x, 90 + k * 30 + Math.sin(x * 0.012 + k) * 30);
      g.stroke();
    }
    bgPeaks(g, '#d6ecff', [[0, 300], [100, 200], [180, 260], [300, 170], [420, 270], [520, 210], [640, 280], [760, 190], [880, 260], [960, 220]]);
    bgPeaks(g, '#9fc8e8', [[0, 360], [150, 310], [260, 350], [400, 300], [520, 360], [650, 320], [780, 360], [900, 310], [960, 340]]);
    // ice city
    const tower = (x, w, h) => {
      g.fillStyle = '#6fa8d0'; g.fillRect(x, GROUND - h, w, h);
      g.fillStyle = '#4f88b8'; g.fillRect(x + w * 0.6, GROUND - h, w * 0.4, h);
      g.fillStyle = '#e8f6ff';
      g.beginPath(); g.moveTo(x - 4, GROUND - h); g.lineTo(x + w / 2, GROUND - h - w * 0.9); g.lineTo(x + w + 4, GROUND - h); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,200,0.75)';
      for (let yy = GROUND - h + 16; yy < GROUND - 20; yy += 28) g.fillRect(x + w / 2 - 4, yy, 8, 12);
    };
    const dome = (x, r) => {
      g.fillStyle = '#8cc4e8'; g.beginPath(); g.arc(x, GROUND, r, Math.PI, 0); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x - r * 0.3, GROUND - r * 0.5, r * 0.25, 0, Math.PI * 2); g.fill();
    };
    tower(60, 50, 220); tower(130, 36, 150); dome(250, 70); tower(700, 44, 200); dome(820, 90); tower(900, 40, 170);
    bgGround(g, '#e6f4ff', '#9cc4e0', '#ffffff', 'rgba(80,130,180,0.25)');
  },

  volcano(g) {
    bgSky(g, [[0, '#1a0a0e'], [0.5, '#5a1414'], [0.85, '#c0401a'], [1, '#ff8a3a']]);
    bgStars(g, 20, 120, 0.4);
    // volcano
    g.fillStyle = '#2a1414';
    g.beginPath(); g.moveTo(260, GROUND); g.lineTo(450, 150); g.lineTo(530, 150); g.lineTo(740, GROUND); g.closePath(); g.fill();
    bgGlow(g, 490, 150, 120, 'rgba(255,200,80,0.9)', 'rgba(255,90,20,0.5)');
    g.strokeStyle = '#ff6a1a'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(470, 155); g.quadraticCurveTo(440, 260, 400, 330); g.stroke();
    g.beginPath(); g.moveTo(515, 155); g.quadraticCurveTo(560, 250, 610, 340); g.stroke();
    // smoke
    g.fillStyle = 'rgba(40,20,20,0.6)';
    [[490, 110, 50], [520, 70, 60], [470, 40, 70], [540, 20, 80]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
    bgPeaks(g, '#1a0a0a', [[0, 360], [90, 320], [180, 370], [260, 380], [740, 380], [820, 330], [900, 360], [960, 320]]);
    // lava sea
    const lava = g.createLinearGradient(0, GROUND - 40, 0, GROUND);
    lava.addColorStop(0, '#ff8a1a'); lava.addColorStop(1, '#c02a0a');
    g.fillStyle = lava; g.fillRect(0, GROUND - 30, W, 30);
    bgGround(g, '#3a2420', '#1a0e0c', '#5a3a30', 'rgba(0,0,0,0.35)');
    g.strokeStyle = 'rgba(255,110,30,0.8)'; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = 60 + i * 120;
      g.beginPath(); g.moveTo(x, GROUND + 8); g.lineTo(x + 18, GROUND + 26); g.lineTo(x + 8, GROUND + 44); g.lineTo(x + 30, GROUND + 70); g.stroke();
    }
  },

  ship(g) {
    g.fillStyle = '#05060f'; g.fillRect(0, 0, W, GROUND);
    // window to space
    g.save();
    g.beginPath(); g.roundRect(120, 70, 720, 250, 30); g.clip();
    g.fillStyle = '#02030a'; g.fillRect(120, 70, 720, 250);
    bgStars(g, 140, 330, 0.9);
    const planet = g.createRadialGradient(600, 300, 20, 640, 330, 200);
    planet.addColorStop(0, '#6fc0ff'); planet.addColorStop(0.6, '#2a6ab0'); planet.addColorStop(1, '#0a1a3a');
    g.fillStyle = planet; g.beginPath(); g.arc(640, 360, 190, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(90,200,120,0.6)';
    g.beginPath(); g.ellipse(600, 250, 50, 22, 0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(700, 300, 40, 18, -0.2, 0, Math.PI * 2); g.fill();
    g.restore();
    // wall panels
    g.fillStyle = '#20202e';
    g.fillRect(0, 0, W, 60); g.fillRect(0, 0, 110, GROUND); g.fillRect(850, 0, 110, GROUND); g.fillRect(0, 330, W, GROUND - 330);
    g.strokeStyle = '#3a3a52'; g.lineWidth = 6;
    g.beginPath(); g.roundRect(120, 70, 720, 250, 30); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2;
    for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, 330); g.lineTo(x, GROUND); g.stroke(); }
    for (let y = 80; y < GROUND; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(110, y); g.moveTo(850, y); g.lineTo(W, y); g.stroke(); }
    // Vorg's emblem
    g.fillStyle = '#5a2a8a';
    g.beginPath(); g.moveTo(480, 350); g.lineTo(510, 390); g.lineTo(480, 430); g.lineTo(450, 390); g.closePath(); g.fill();
    g.fillStyle = '#d040a0'; g.beginPath(); g.arc(480, 390, 8, 0, Math.PI * 2); g.fill();
    bgGround(g, '#3a3a4e', '#1a1a26', '#7a7aa0', 'rgba(0,0,0,0.4)');
    g.fillStyle = 'rgba(120,200,255,0.5)';
    for (let x = 30; x < W; x += 120) g.fillRect(x, GROUND + 14, 40, 3);
  },
};

// ----- act 2 backgrounds -----
Object.assign(BG_BUILDERS, {
  ruins(g) {
    bgSky(g, [[0, '#0f2a2a'], [0.5, '#2f6a5a'], [0.85, '#c8a060'], [1, '#e8c890']]);
    bgGlow(g, 760, 330, 120, 'rgba(255,230,170,0.9)', 'rgba(255,200,120,0.5)');
    bgPeaks(g, '#2a4a40', [[0, 330], [120, 290], [260, 320], [400, 280], [560, 330], [700, 300], [860, 320], [960, 300]]);
    // stepped pyramid
    g.fillStyle = '#1f3a32';
    for (let i = 0; i < 6; i++) g.fillRect(300 + i * 30, 210 + i * 40, 360 - i * 60, 40);
    g.fillRect(450, 160, 60, 50);
    g.fillStyle = '#0e1e1a'; g.fillRect(468, 175, 24, 35);
    // broken columns
    const col = (x, h) => { g.fillStyle = '#4a5a50'; g.fillRect(x, GROUND - h, 26, h); g.fillRect(x - 6, GROUND - h - 8, 38, 10); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + 16, GROUND - h, 10, h); };
    col(90, 170); col(170, 110); col(780, 150); col(860, 90);
    // jungle leaves
    g.fillStyle = '#123a24';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse((i * 83) % W, 20 + (i % 3) * 18, 70, 26, (i % 2 ? 0.3 : -0.3), 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#1f5a34'; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const x = 40 + i * 110; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 20, 80, x - 10, 140 + (i % 3) * 30); g.stroke(); }
    bgGround(g, '#4f5a44', '#262c20', '#6f7a5a', 'rgba(0,0,0,0.3)');
    g.fillStyle = 'rgba(80,140,60,0.5)';
    for (let i = 0; i < 25; i++) g.fillRect((i * 41) % W, GROUND + (i * 13) % 50, 16, 3);
  },

  skyisles(g) {
    bgSky(g, [[0, '#3a7ae0'], [0.6, '#8ec8ff'], [1, '#e8f6ff']]);
    bgGlow(g, 180, 110, 110, 'rgba(255,255,240,1)', 'rgba(255,250,210,0.5)');
    bgClouds(g, 'rgba(255,255,255,0.9)', [[120, 380, 160], [480, 400, 200], [850, 390, 170]]);
    bgClouds(g, 'rgba(255,255,255,0.6)', [[300, 150, 80], [700, 110, 100]]);
    // floating islands
    const island = (x, y, w) => {
      g.fillStyle = '#5a8a4a'; g.beginPath(); g.ellipse(x, y, w, 14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#7a6a5a'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y + w * 0.9); g.lineTo(x + w, y); g.closePath(); g.fill();
      g.fillStyle = 'rgba(200,235,255,0.8)'; g.fillRect(x + w * 0.3, y + 4, 6, w * 0.8);
    };
    island(150, 230, 70); island(820, 200, 90); island(520, 260, 50);
    // temple on the big island
    g.fillStyle = '#f0f0f8';
    for (let i = 0; i < 4; i++) g.fillRect(770 + i * 30, 130, 10, 66);
    g.beginPath(); g.moveTo(755, 132); g.lineTo(820, 100); g.lineTo(885, 132); g.closePath(); g.fill();
    bgGround(g, '#f0f2f8', '#b8c4d8', '#ffffff', 'rgba(120,140,180,0.3)');
  },

  crystal(g) {
    bgSky(g, [[0, '#06040e'], [0.6, '#140e2a'], [1, '#22183a']]);
    // stalactites
    g.fillStyle = '#1a1430';
    for (let i = 0; i < 22; i++) { const x = i * 46 + (i % 3) * 7; const h = 40 + (i * 37) % 90; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 22, 0); g.lineTo(x + 11, h); g.closePath(); g.fill(); }
    bgPeaks(g, '#1c1636', [[0, 360], [140, 300], [260, 350], [420, 290], [560, 340], [700, 300], [860, 350], [960, 320]]);
    // glowing crystal clusters
    const cluster = (x, y, s, c1, c2) => {
      const gl = g.createRadialGradient(x, y - 20 * s, 2, x, y - 20 * s, 80 * s);
      gl.addColorStop(0, c2); gl.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(x, y - 20 * s, 80 * s, 0, Math.PI * 2); g.fill();
      g.fillStyle = c1;
      [[-18, 50, -0.3], [0, 75, 0], [16, 55, 0.35], [30, 35, 0.6]].forEach(([dx, h, a]) => {
        g.save(); g.translate(x + dx * s, y); g.rotate(a);
        g.beginPath(); g.moveTo(-7 * s, 0); g.lineTo(0, -h * s); g.lineTo(7 * s, 0); g.closePath(); g.fill();
        g.restore();
      });
    };
    cluster(110, GROUND, 1.3, '#5fe0ff', 'rgba(95,224,255,0.35)');
    cluster(470, 330, 0.9, '#ff90e0', 'rgba(255,144,224,0.3)');
    cluster(850, GROUND, 1.5, '#9f8fff', 'rgba(159,143,255,0.35)');
    bgGround(g, '#2a2440', '#100c1c', '#4a3f6a', 'rgba(0,0,0,0.4)');
    g.fillStyle = 'rgba(120,230,255,0.6)';
    for (let i = 0; i < 12; i++) { const x = (i * 89) % W; g.beginPath(); g.moveTo(x, GROUND + 30); g.lineTo(x + 5, GROUND + 14); g.lineTo(x + 10, GROUND + 30); g.closePath(); g.fill(); }
  },

  coast(g) {
    bgSky(g, [[0, '#14181f'], [0.5, '#2a3340'], [1, '#4a5868']]);
    bgClouds(g, 'rgba(20,24,32,0.7)', [[120, 80, 180], [480, 60, 220], [860, 90, 200], [300, 150, 140], [700, 160, 160]]);
    // sea
    const sea = g.createLinearGradient(0, 300, 0, GROUND);
    sea.addColorStop(0, '#1f3a4a'); sea.addColorStop(1, '#0f2430');
    g.fillStyle = sea; g.fillRect(0, 300, W, GROUND - 300);
    g.strokeStyle = 'rgba(200,230,255,0.25)'; g.lineWidth = 2;
    for (let r = 0; r < 6; r++) { g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, 320 + r * 24 + Math.sin(x * 0.05 + r) * 4); g.stroke(); }
    // cliff + lighthouse
    g.fillStyle = '#1a1e24';
    g.beginPath(); g.moveTo(760, GROUND); g.lineTo(790, 240); g.lineTo(960, 220); g.lineTo(960, GROUND); g.closePath(); g.fill();
    g.fillStyle = '#d8d8e0'; g.fillRect(850, 120, 34, 110);
    g.fillStyle = '#c03a3a'; g.fillRect(850, 150, 34, 14); g.fillRect(850, 190, 34, 14);
    g.fillStyle = '#ffe9a0'; g.fillRect(852, 100, 30, 20);
    g.fillStyle = '#2a2e36'; g.beginPath(); g.moveTo(846, 100); g.lineTo(867, 82); g.lineTo(888, 100); g.closePath(); g.fill();
    bgGround(g, '#3a3226', '#1a160f', '#5a4e3a', 'rgba(0,0,0,0.35)');
  },

  void(g) {
    g.fillStyle = '#04020a'; g.fillRect(0, 0, W, GROUND);
    // spiral of the void
    for (let i = 0; i < 260; i++) {
      const a = i * 0.21, r = 4 + i * 1.5;
      g.fillStyle = `rgba(${140 + (i % 60)},${40 + (i % 30)},255,${0.5 - i / 600})`;
      g.beginPath(); g.arc(480 + Math.cos(a) * r, 200 + Math.sin(a) * r * 0.55, 2.2, 0, Math.PI * 2); g.fill();
    }
    const core = g.createRadialGradient(480, 200, 4, 480, 200, 90);
    core.addColorStop(0, '#000000'); core.addColorStop(0.5, 'rgba(60,0,90,0.8)'); core.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = core; g.beginPath(); g.arc(480, 200, 90, 0, Math.PI * 2); g.fill();
    bgStars(g, 50, GROUND, 0.4);
    // floating debris
    g.fillStyle = '#1a1028';
    [[120, 160, 40], [260, 90, 24], [760, 130, 46], [880, 260, 30], [640, 300, 22]].forEach(([x, y, r]) => { g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r * 0.3, y - r * 0.5); g.lineTo(x + r, y - r * 0.2); g.lineTo(x + r * 0.4, y + r * 0.6); g.closePath(); g.fill(); });
    // throne silhouette
    g.fillStyle = '#0e0818';
    g.fillRect(440, 300, 80, GROUND - 300); g.fillRect(420, 260, 120, 40);
    g.beginPath(); g.moveTo(420, 260); g.lineTo(430, 200); g.lineTo(450, 260); g.moveTo(510, 260); g.lineTo(530, 200); g.lineTo(540, 260); g.fill();
    bgGround(g, '#1a1226', '#06040c', '#3a2a5a', 'rgba(0,0,0,0.4)');
    g.strokeStyle = 'rgba(180,90,255,0.8)'; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const x = 40 + i * 120; g.beginPath(); g.moveTo(x, GROUND + 6); g.lineTo(x + 14, GROUND + 26); g.lineTo(x + 4, GROUND + 46); g.lineTo(x + 24, GROUND + 74); g.stroke(); }
  },
});

function drawBackground(ctx) {
  const theme = Game.theme || 'monastery';
  if (!_bgCache[theme]) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    BG_BUILDERS[theme](c.getContext('2d'));
    _bgCache[theme] = c;
  }
  ctx.drawImage(_bgCache[theme], 0, 0);
  const t = Game.time;
  ctx.save();
  if (theme === 'monastery') {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 6; i++) ctx.fillRect(864 + (i * 7) % 26, 250 + ((t * 160 + i * 37) % (GROUND - 250)), 3, 14);
  } else if (theme === 'desert') {
    ctx.fillStyle = 'rgba(230,190,130,0.35)';
    for (let i = 0; i < 12; i++) ctx.fillRect(((t * 220 + i * 173) % (W + 100)) - 50, GROUND - 10 - (i * 13) % 50, 30, 2);
  } else if (theme === 'ice') {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 97 + Math.sin(t + i) * 20 + t * 15) % W;
      const y = (i * 53 + t * (40 + (i % 5) * 10)) % GROUND;
      ctx.fillRect(x, y, 2.5, 2.5);
    }
  } else if (theme === 'volcano') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
      const x = (i * 131 + Math.sin(t * 2 + i) * 15) % W;
      const y = GROUND - ((t * (50 + (i % 7) * 12) + i * 41) % GROUND);
      ctx.fillStyle = i % 2 ? 'rgba(255,140,40,0.8)' : 'rgba(255,220,90,0.7)';
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.fillStyle = `rgba(255,120,30,${0.15 + Math.sin(t * 3) * 0.08})`;
    ctx.fillRect(0, GROUND - 30, W, 30);
  } else if (theme === 'ruins') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const x = (i * 157 + Math.sin(t * 0.7 + i) * 40) % W;
      const y = 180 + (i * 61) % 260 + Math.sin(t * 1.3 + i * 2) * 20;
      ctx.fillStyle = `rgba(220,255,140,${0.4 + 0.4 * Math.sin(t * 3 + i)})`;
      ctx.fillRect(x, y, 3, 3);
    }
  } else if (theme === 'skyisles') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 4; i++) {
      const x = ((t * (12 + i * 5) + i * 300) % (W + 300)) - 150;
      ctx.beginPath(); ctx.ellipse(x, 60 + i * 50, 90, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (theme === 'crystal') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const a = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 1.7);
      ctx.fillStyle = `rgba(${i % 2 ? '255,170,240' : '140,240,255'},${a * 0.8})`;
      const x = (i * 131) % W, y = 120 + (i * 53) % 320;
      ctx.fillRect(x - 1, y - 5, 2, 10); ctx.fillRect(x - 5, y - 1, 10, 2);
    }
  } else if (theme === 'coast') {
    ctx.strokeStyle = 'rgba(180,200,230,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
      const x = (i * 71 + t * 240) % (W + 60) - 30;
      const y = (i * 37 + t * 700) % GROUND;
      ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 16);
    }
    ctx.stroke();
    // a distant lightning flash now and then
    if (Math.sin(t * 0.9) > 0.995) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, 0, W, GROUND); }
  } else if (theme === 'void') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const a = t * 0.6 + i * 0.5, r = 60 + ((i * 37 + t * 30) % 300);
      ctx.fillStyle = `rgba(190,110,255,${0.6 - r / 600})`;
      ctx.fillRect(480 + Math.cos(a) * r, 200 + Math.sin(a) * r * 0.55, 2.5, 2.5);
    }
  } else if (theme === 'ship') {
    for (let i = 0; i < 6; i++) {
      const on = Math.floor(t * 2 + i * 0.7) % 3 !== 0;
      ctx.fillStyle = on ? (i % 2 ? '#ff4060' : '#40e0ff') : '#2a2a3a';
      ctx.fillRect(30 + (i % 2) * 40, 100 + Math.floor(i / 2) * 90, 10, 10);
      ctx.fillRect(880 + (i % 2) * 40, 100 + Math.floor(i / 2) * 90, 10, 10);
    }
  }
  ctx.restore();
}
