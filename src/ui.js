'use strict';
// HUD, meniu, dialogai ir pranešimai.

function text(ctx, str, x, y, size, color = '#fff', align = 'left', weight = 'bold') {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = Math.max(3, size / 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function bar(ctx, x, y, w, h, v, color, back = 'rgba(0,0,0,0.55)', glow = false) {
  ctx.fillStyle = back;
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x, y, w, h);
  if (glow) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 14; }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(v, 0, 1), h);
  if (glow) ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x, y, w * clamp(v, 0, 1), Math.max(1, h * 0.3));
}

function wrapLines(ctx, str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawHUD(ctx) {
  const p = Game.player;
  if (!p) return;
  text(ctx, 'KAI', 20, 26, 18, p.form > 0 ? '#ffe14d' : '#ffffff');
  text(ctx, p.F.name, 64, 26, 13, p.form > 0 ? '#ffd34a' : '#cfd8ff', 'left', '600');
  bar(ctx, 20, 34, 260, 14, p.hp / p.maxHp, p.hp > 30 ? '#4cd964' : '#ff3b30');
  bar(ctx, 20, 54, 260, 9, p.ki / p.maxKi, '#3aa0ff');
  const full = p.power >= 100;
  const pc = p.form > 0 ? '#ffb000' : '#ffd34a';
  bar(ctx, 20, 69, 260, 9, p.power / 100, pc, 'rgba(0,0,0,0.55)', full || p.form > 0);
  text(ctx, 'HP', 288, 46, 11, '#d0ffd8');
  text(ctx, 'KI', 288, 63, 11, '#bfe0ff');
  text(ctx, 'JĖGA', 288, 78, 11, '#fff2b0');
  if (full && p.flameUnlocked && p.form === 0 && Math.floor(Game.time * 4) % 2 === 0) {
    text(ctx, 'T – TRANSFORMACIJA!', 20, 100, 16, '#ffe14d');
  }

  text(ctx, 'TAŠKAI ' + Game.score, W - 20, 30, 18, '#ffffff', 'right');
  text(ctx, 'REKORDAS ' + Math.max(Game.highScore, Game.score), W - 20, 50, 12, '#cfd8ff', 'right', '600');
  if (Game.combo >= 3) {
    const s = 22 + Math.min(14, Game.combo);
    text(ctx, Game.combo + ' KOMBO', W - 20, 84, s, '#ffd34a', 'right');
  }

  const b = Game.boss;
  if (b) {
    const bw = 360, bx = W / 2 - bw / 2;
    text(ctx, b.name, W / 2, H - 38, 15, '#e6c0ff', 'center');
    bar(ctx, bx, H - 30, bw, 12, b.hp / b.maxHp, b.enraged ? '#c040ff' : '#9a5cff');
  }

  const c = Game.clash;
  if (c) {
    const cw = 400, cx = W / 2 - cw / 2, cy = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(cx - 3, cy - 3, cw + 6, 22);
    ctx.fillStyle = '#a040ff'; ctx.fillRect(cx, cy, cw, 16);
    ctx.fillStyle = p.form > 0 ? '#ffb000' : '#3aa0ff'; ctx.fillRect(cx, cy, cw * clamp(c.push, 0, 1), 16);
    text(ctx, 'SPAUDINĖK L !!!', W / 2, cy - 10, 24 + Math.sin(Game.time * 30) * 2, '#ffffff', 'center');
  }

  if (Game.banner) {
    const bn = Game.banner;
    const t = bn.max - bn.t;
    const a = Math.min(1, t * 4, bn.t * 3);
    ctx.save();
    ctx.globalAlpha = a;
    const sc = 1 + Math.max(0, 0.25 - t) * 2;
    ctx.translate(W / 2, 200);
    ctx.scale(sc, sc);
    text(ctx, bn.text, 0, 0, 46, '#ffe14d', 'center', '900');
    if (bn.sub) text(ctx, bn.sub, 0, 34, 18, '#ffffff', 'center', '600');
    ctx.restore();
  }
  if (Game.hint) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, Game.hint.t * 2);
    text(ctx, Game.hint.text, W / 2, 160, 20, '#9fe6ff', 'center');
    ctx.restore();
  }
}

function drawDialog(ctx) {
  const d = Game.dialog;
  if (!d) return;
  const line = d.lines[d.i];
  const x = 60, y = H - 150, w = W - 120, h = 120;
  ctx.save();
  ctx.fillStyle = 'rgba(10,12,30,0.88)';
  ctx.strokeStyle = 'rgba(255,220,120,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill(); ctx.stroke();
  if (line.who) {
    const colors = { 'Kai': '#ff8a7a', 'Vorgas': '#d68bff', 'Raxas': '#c9a0ff', 'Meistras Oro': '#9fe6ff', 'ATRAKINTA': '#ffe14d', 'Patarimas': '#9fffb0', 'Valdymas': '#9fffb0' };
    text(ctx, line.who, x + 20, y + 30, 18, colors[line.who] || '#ffffff');
  }
  ctx.font = '600 19px system-ui, -apple-system, Segoe UI, sans-serif';
  const shown = line.text.slice(0, Math.floor(d.chars));
  const lines = wrapLines(ctx, shown, w - 40);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, x + 20, y + (line.who ? 58 : 40) + i * 25));
  if (d.chars >= line.text.length && Math.floor(Game.time * 3) % 2 === 0) {
    text(ctx, '▼ Enter / Tarpas', x + w - 20, y + h - 12, 13, '#ffe14d', 'right', '600');
  }
  ctx.restore();
}

function drawMenu(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.45)';
  ctx.fillRect(0, 0, W, H);
  // herojus su aura
  const t = Game.time;
  const flame = Math.floor(t / 3) % 2 === 1;
  drawAura(ctx, 250, 420, 150, flame ? 'rgba(255,200,40,A)' : 'rgba(170,210,255,A)', 1.1, t);
  auraParticles(250, 420, 120, flame ? '#ffd34a' : '#bfe0ff', 1);
  drawParticles(ctx);
  drawHumanoid(ctx, { x: 250, y: 420, facing: 1, pose: POSES.kicharge(t), style: flame ? STYLES.heroFlame : STYLES.heroBase, scale: 1.6, t });

  ctx.save();
  ctx.translate(620, 150);
  ctx.rotate(-0.04);
  text(ctx, 'KI BANGA', 0, 0, 84, '#ffe14d', 'center', '900');
  ctx.restore();
  text(ctx, '1 lygis: Kalnų vienuolynas', 620, 195, 20, '#ffffff', 'center', '600');

  const lines = [
    '← → / A D  judėti',
    '↑ / W / Tarpas  šokti (laikyk ore – skristi)',
    'J  smūgis (3 smūgių kombinacija)',
    'K  Ki šūvis',
    'L  laikyk ir paleisk – KI BANGA',
    'S / ↓  kaupti Ki (ir blokuoti)',
    'T  transformacija',
    'P  pauzė · M  garsas',
  ];
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(445, 222, 350, 200);
  lines.forEach((l, i) => text(ctx, l, 462, 248 + i * 23, 15, '#e6ecff', 'left', '600'));
  if (Math.floor(t * 2) % 2 === 0) text(ctx, 'Spausk ENTER arba bakstelk, kad pradėtum', 620, 460, 20, '#9fe6ff', 'center');
  if (Game.highScore > 0) text(ctx, 'Rekordas: ' + Game.highScore, 620, 490, 15, '#ffd34a', 'center', '600');
}

function drawOverlay(ctx, title, sub, lines, color) {
  ctx.fillStyle = 'rgba(5,6,20,0.65)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, title, W / 2, 170, 60, color, 'center', '900');
  if (sub) text(ctx, sub, W / 2, 215, 22, '#ffffff', 'center', '600');
  lines.forEach((l, i) => text(ctx, l, W / 2, 275 + i * 32, 20, i === lines.length - 1 ? '#9fe6ff' : '#e6ecff', 'center', '600'));
}

function drawUI(ctx) {
  switch (Game.state) {
    case 'MENU':
      drawMenu(ctx);
      break;
    case 'PLAY':
      drawHUD(ctx);
      break;
    case 'DIALOG':
      drawHUD(ctx);
      drawDialog(ctx);
      break;
    case 'PAUSE':
      drawHUD(ctx);
      drawOverlay(ctx, 'PAUZĖ', '', ['P / Esc / Enter – tęsti'], '#ffffff');
      break;
    case 'GAMEOVER': {
      drawHUD(ctx);
      const cp = Game.checkpoint > 0;
      drawOverlay(ctx, 'PRALAIMĖJAI', 'Vorgo kariauna šįkart stipresnė...', [
        'Taškai: ' + Game.score,
        Game.stateT > 1 ? (cp ? 'ENTER – bandyti nuo boso' : 'ENTER – bandyti dar kartą') : '',
      ], '#ff5a4a');
      break;
    }
    case 'VICTORY': {
      const newRecord = Game.score >= Game.highScore && Game.score > 0;
      drawOverlay(ctx, '1 LYGIS ĮVEIKTAS!', 'Kalnų vienuolynas išgelbėtas', [
        '★ Gauta: Žvaigždžių kristalas (1/7)',
        '✦ Atrakinta: Liepsnos forma',
        'Taškai: ' + Game.score + (newRecord ? '  – NAUJAS REKORDAS!' : '  (rekordas ' + Game.highScore + ')'),
        'Kiti lygiai – netrukus!',
        Game.stateT > 1.5 ? 'ENTER – žaisti iš naujo' : '',
      ], '#ffe14d');
      break;
    }
  }
}
