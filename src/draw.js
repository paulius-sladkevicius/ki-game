'use strict';
// Piešimas: figūrėlės iš paprastų formų, pozos, fonas, bangos ir šūviai.

// ---------- Spalvų pagalbininkas ----------
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

// ---------- Stiliai ----------
const STYLES = {
  heroBase: { gi: '#d6332e', under: '#1d2b6b', belt: '#1d2b6b', pants: '#d6332e', boots: '#1d2b6b', arm: '#f2c29b', skin: '#f2c29b', band: '#1d2b6b', hair: 'spiky', hairColor: '#1a1a1a' },
  heroFlame: { gi: '#d6332e', under: '#1d2b6b', belt: '#1d2b6b', pants: '#d6332e', boots: '#1d2b6b', arm: '#f2c29b', skin: '#f2c29b', band: '#1d2b6b', hair: 'flame', hairColor: '#ffd93b' },
  scout: { gi: '#5b6170', under: '#2c2f38', belt: '#c0392b', pants: '#3a3f4b', boots: '#22252c', arm: '#5b6170', skin: '#8fc28a', band: '#c0392b', hair: 'helmet', hairColor: '#c0392b', visor: '#55e6ff' },
  gunner: { gi: '#6b4f8a', under: '#2c2238', belt: '#e67e22', pants: '#3d2e52', boots: '#22202c', arm: '#6b4f8a', skin: '#9ad0c2', band: '#e67e22', hair: 'helmet', hairColor: '#e67e22', visor: '#ffe14d' },
  boss: { gi: '#3b2a5c', under: '#c9c9d9', belt: '#c8a640', pants: '#2a1f40', boots: '#c9c9d9', arm: '#3b2a5c', skin: '#b9d7e8', band: '#c8a640', hair: 'long', hairColor: '#e8e8f0', sword: true },
  flash: { gi: '#ffffff', under: '#ffffff', belt: '#ffffff', pants: '#ffffff', boots: '#ffffff', arm: '#ffffff', skin: '#ffffff', band: '#ffffff', hair: null, hairColor: '#ffffff', visor: '#ffffff' },
};

// ---------- Pozos ----------
// Kampai radianais nuo „tiesiai žemyn“, teigiamas – į priekį (žiūrėjimo kryptimi).
// Kojoms antras skaičius neigiamas (kelias lenkiasi atgal), rankoms – teigiamas.
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
  hurt: () => ({ crouch: 2, lean: -0.45, fl: [0.3, -0.3], bl: [-0.4, -0.2], fa: [-0.8, 0.6], ba: [-1.2, 0.4] }),
  transform: (t) => ({ crouch: 10 + Math.sin(t * 40), lean: -0.2, fl: [0.5, -0.5], bl: [-0.5, -0.3], fa: [0.7, 0.4], ba: [-0.7, 0.4], scream: true }),
  windup: () => ({ crouch: 4, lean: -0.1, fl: [0.4, -0.3], bl: [-0.4, -0.2], fa: [-0.9, 1.7], ba: [0.5, 1.8] }),
  dead: () => ({ lying: 1, crouch: 0, lean: 0, fl: [0.1, -0.1], bl: [-0.1, -0.1], fa: [2.5, 0.3], ba: [2.8, 0.2] }),
  // Boso pozos su kardu
  swordIdle: (t) => ({ crouch: 4 + Math.sin(t * 3), lean: 0.05, fl: [0.4, -0.3], bl: [-0.35, -0.2], fa: [0.6, 1.0], ba: [0.3, 1.6] }),
  swordRaise: () => ({ crouch: 6, lean: -0.15, fl: [0.45, -0.4], bl: [-0.45, -0.2], fa: [2.8, 0.3], ba: [0.4, 1.6] }),
  swordSlash: () => ({ crouch: 8, lean: 0.3, fl: [0.7, -0.4], bl: [-0.6, -0.1], fa: [1.4, -0.1], ba: [-0.5, 0.8] }),
  dash: () => ({ crouch: 10, lean: 0.55, fl: [0.8, -0.6], bl: [-0.8, -0.3], fa: [1.7, -0.2], ba: [-0.9, 0.5] }),
};

// ---------- Figūrėlė ----------
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
  // riešo juosta
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
  spiky: [[8, -4], [10, -10], [5, -9], [6, -16], [0, -11], [-3, -19], [-5, -11], [-12, -15], [-9, -6], [-15, -6], [-9, -1], [-13, 3], [-8, 4], [-6, 8]],
  flame: [[8, -3], [13, -11], [6, -10], [9, -21], [2, -13], [1, -26], [-4, -13], [-10, -23], [-8, -10], [-17, -15], [-10, -4], [-17, 0], [-9, 2], [-6, 8]],
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
      ctx.fillStyle = st.hairColor;
      ctx.beginPath();
      const jit = st.hair === 'flame' ? 1.2 : 0;
      HAIR[st.hair].forEach(([x, y], i) => {
        const jx = jit ? Math.sin(t * 25 + i) * jit : 0;
        const jy = jit ? Math.cos(t * 21 + i * 2) * jit : 0;
        if (i === 0) ctx.moveTo(x + jx, y + jy); else ctx.lineTo(x + jx, y + jy);
      });
      ctx.closePath(); ctx.fill();
    }
    // akis ir antakis
    ctx.fillStyle = '#111';
    ctx.fillRect(4.5, -2.5, 2.4, 3.6);
    ctx.strokeStyle = st.hair === 'flame' ? '#b8860b' : '#111';
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
  ctx.restore();
  ctx.restore();
}

// Priekinės rankos plaštakos padėtis pasaulio koordinatėse.
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

// ---------- Bangos ----------
const BEAM_COLORS = {
  base: ['rgba(40,140,255,A)', 'rgba(140,215,255,A)'],
  flame: ['rgba(255,170,0,A)', 'rgba(255,235,140,A)'],
  boss: ['rgba(160,60,255,A)', 'rgba(220,170,255,A)'],
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

// ---------- Šūviai ----------
function drawProjectile(ctx, p) {
  if (p.type === 'crescent') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    ctx.scale(sign(p.vx), 1);
    ctx.fillStyle = 'rgba(190,110,255,0.5)';
    ctx.beginPath(); ctx.arc(-10, 0, 24, -1.2, 1.2); ctx.arc(-22, 0, 22, 1.1, -1.1, true); ctx.fill();
    ctx.fillStyle = 'rgba(245,225,255,0.95)';
    ctx.beginPath(); ctx.arc(-10, 0, 20, -1.1, 1.1); ctx.arc(-18, 0, 18, 1.0, -1.0, true); ctx.fill();
    ctx.restore();
    return;
  }
  drawEnergyBall(ctx, p.x, p.y, p.r, p.inner, p.outer, Game.time + p.x * 0.01);
}

// ---------- Fonas ----------
let _bgCanvas = null;
function buildBackground() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');

  const sky = g.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#24325e');
  sky.addColorStop(0.55, '#c86b6b');
  sky.addColorStop(0.85, '#f7a35c');
  sky.addColorStop(1, '#ffd59e');
  g.fillStyle = sky; g.fillRect(0, 0, W, GROUND);

  // saulė
  const sun = g.createRadialGradient(700, 300, 10, 700, 300, 140);
  sun.addColorStop(0, 'rgba(255,245,210,1)');
  sun.addColorStop(0.35, 'rgba(255,230,170,0.7)');
  sun.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = sun; g.beginPath(); g.arc(700, 300, 140, 0, Math.PI * 2); g.fill();

  // žvaigždės viršuje
  g.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 40; i++) { g.fillRect((i * 137) % W, (i * 71) % 140, 1.5, 1.5); }

  // debesys
  g.fillStyle = 'rgba(255,220,200,0.25)';
  [[150, 120, 90], [420, 90, 120], [820, 150, 100], [600, 200, 70]].forEach(([x, y, r]) => {
    g.beginPath(); g.ellipse(x, y, r, r * 0.25, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + r * 0.4, y - 8, r * 0.6, r * 0.2, 0, 0, Math.PI * 2); g.fill();
  });

  // tolimi kalnai
  function mountains(color, base, peaks) {
    g.fillStyle = color;
    g.beginPath(); g.moveTo(0, GROUND);
    peaks.forEach(([x, y]) => g.lineTo(x, y));
    g.lineTo(W, GROUND); g.closePath(); g.fill();
    void base;
  }
  mountains('#7a5f8f', 0, [[0, 300], [90, 230], [170, 280], [260, 190], [360, 270], [470, 210], [560, 290], [650, 240], [760, 300], [860, 220], [960, 280]]);
  mountains('#4f3d6b', 0, [[0, 360], [120, 300], [210, 350], [330, 280], [440, 360], [560, 320], [680, 370], [800, 300], [900, 350], [960, 330]]);

  // uola su krioklio
  g.fillStyle = '#3a2d52';
  g.beginPath(); g.moveTo(820, GROUND); g.lineTo(830, 250); g.lineTo(900, 230); g.lineTo(960, 240); g.lineTo(960, GROUND); g.closePath(); g.fill();
  const fall = g.createLinearGradient(0, 245, 0, GROUND);
  fall.addColorStop(0, 'rgba(200,230,255,0.9)'); fall.addColorStop(1, 'rgba(200,230,255,0.4)');
  g.fillStyle = fall; g.fillRect(860, 245, 34, GROUND - 245);

  // pagoda kairėje
  g.fillStyle = '#2b2140';
  g.fillRect(70, 290, 150, GROUND - 290);
  function roof(cx, y, w) {
    g.beginPath(); g.moveTo(cx - w / 2 - 18, y + 4); g.quadraticCurveTo(cx, y - 8, cx + w / 2 + 18, y + 4);
    g.lineTo(cx + w / 2, y - 14); g.lineTo(cx - w / 2, y - 14); g.closePath(); g.fill();
  }
  g.fillStyle = '#2b2140';
  g.fillRect(95, 220, 100, 70); g.fillRect(115, 160, 60, 60);
  g.fillStyle = '#1e1630';
  roof(145, 296, 160); roof(145, 226, 112); roof(145, 166, 72);
  g.fillRect(142, 120, 6, 32);
  g.fillStyle = 'rgba(255,190,90,0.8)';
  g.fillRect(132, 330, 26, 34); g.fillRect(122, 245, 14, 18); g.fillRect(154, 245, 14, 18);

  // pušys
  function pine(x, h) {
    g.fillStyle = '#1d2a2a';
    g.fillRect(x - 3, GROUND - h * 0.25, 6, h * 0.25);
    for (let i = 0; i < 3; i++) {
      const y = GROUND - h * 0.25 - i * h * 0.22;
      g.beginPath(); g.moveTo(x - h * 0.28 + i * 6, y); g.lineTo(x, y - h * 0.38); g.lineTo(x + h * 0.28 - i * 6, y); g.closePath(); g.fill();
    }
  }
  pine(280, 150); pine(320, 110); pine(760, 140); pine(720, 100);

  // kiemas
  const ground = g.createLinearGradient(0, GROUND, 0, H);
  ground.addColorStop(0, '#8a6a4c'); ground.addColorStop(1, '#4e3826');
  g.fillStyle = ground; g.fillRect(0, GROUND, W, H - GROUND);
  g.fillStyle = '#b08a62'; g.fillRect(0, GROUND, W, 4);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
  for (let row = 0; row < 3; row++) {
    const y = GROUND + 4 + row * 26;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (row % 2) * 40; x < W; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); }
  }
  _bgCanvas = c;
}

function drawBackground(ctx) {
  if (!_bgCanvas) buildBackground();
  ctx.drawImage(_bgCanvas, 0, 0);
  // krioklio putos
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 6; i++) {
    const y = 250 + ((Game.time * 160 + i * 37) % (GROUND - 250));
    ctx.fillRect(864 + (i * 7) % 26, y, 3, 14);
  }
  ctx.restore();
}
