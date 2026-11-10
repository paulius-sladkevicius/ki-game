'use strict';
// HUD, menu, dialogs and messages.

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
  text(ctx, p.char.name, 20, 26, 18, p.form > 0 ? '#ffe14d' : '#ffffff');
  const nameW = ctx.measureText(p.char.name).width;
  text(ctx, p.F.name, 30 + nameW, 26, 13, p.form > 0 ? '#ffd34a' : '#cfd8ff', 'left', '600');
  bar(ctx, 20, 34, 260, 14, p.hp / p.maxHp, p.hp > 30 ? '#4cd964' : '#ff3b30');
  const pw = powerInfo(p);
  bar(ctx, 20, 54, 260, 9, p.ki / p.maxKi, pw.color);
  const full = p.power >= 100;
  const pc = p.form > 0 ? '#ffb000' : '#ffd34a';
  bar(ctx, 20, 69, 260, 9, p.power / 100, pc, 'rgba(0,0,0,0.55)', full || p.form > 0);
  text(ctx, 'HP', 288, 46, 11, '#d0ffd8');
  text(ctx, pw.energy, 288, 63, 11, pw.label);
  text(ctx, 'POWER', 288, 78, 11, '#fff2b0');
  const gk = p.guard / p.maxGuard;
  bar(ctx, 20, 84, 260, 7, gk, p.guardLocked ? '#5a6a78' : '#7fe8ff', 'rgba(0,0,0,0.55)', p.guarding);
  text(ctx, p.guardLocked ? 'GUARD (broken)' : 'GUARD', 288, 92, 11, p.guardLocked ? '#ff9a40' : '#bff4ff');
  const canUp = p.unlocked > p.form && p.unlocked < p.char.finalForm && (p.form === 0 ? full : p.power >= 50);
  if (canUp && Math.floor(Game.time * 4) % 2 === 0) {
    text(ctx, 'T - ' + p.forms[p.unlocked].name.toUpperCase() + '!', 20, 114, 16, p.forms[p.unlocked].auraP);
  }
  drawSpecialSlots(ctx, p, Game.allies.length ? 162 + Game.allies.length * 28 : 150);
  // the AI-controlled friends: small panels under the main bars
  Game.allies.forEach((a, i) => {
    const y0 = 136 + i * 28;
    const nm = a.char.name + (a.alive ? '' : '  (down)');
    text(ctx, nm, 20, y0, 13, a.alive ? a.char.color : '#888888');
    text(ctx, a.F.name, 20 + ctx.measureText(nm).width + 8, y0, 11, '#cfd8ff', 'left', '600');
    bar(ctx, 20, y0 + 6, 150, 7, a.hp / a.maxHp, a.hp > a.maxHp * 0.3 ? '#4cd964' : '#ff3b30');
    bar(ctx, 20, y0 + 17, 150, 4, a.ki / a.maxKi, powerInfo(a).color);
    if (!IS_TOUCH && i === 0) text(ctx, 'C - switch', 178, y0 + 14, 11, '#cfd8ff', 'left', '600');
  });

  text(ctx, 'SCORE ' + Game.score, W - 20, 30, 18, '#ffffff', 'right');
  text(ctx, diff().name.toUpperCase() + ' · BEST ' + Math.max(Game.highScore, Game.score), W - 20, 50, 12, diff().color, 'right', '600');
  const act = actOf(Game.levelIndex);
  const coll = `${ACTS[act].mark} ${Game.crystals}/5${ACTS[act].hud}`;
  text(ctx, `LEVEL ${Game.levelIndex + 1} · ${coll}`, W - 20, 66, 12, '#ffd34a', 'right', '600');
  text(ctx, `${Game.money} coins`, W - 20, 82, Game.moneyFlash > 0 ? 15 : 13, '#ffe680', 'right', '700');
  if (Game.combo >= 3) {
    const s = 22 + Math.min(14, Game.combo);
    text(ctx, Game.combo + ' COMBO', W - 20, 114, s, '#ffd34a', 'right');
  }

  const bs = Game.bosses;
  if (bs.length) {
    const gap = 30;
    const bw = bs.length === 1 ? 360 : 260;
    const total = bs.length * bw + (bs.length - 1) * gap;
    bs.forEach((b, i) => {
      const bx = W / 2 - total / 2 + i * (bw + gap);
      text(ctx, b.name + (b.def.phases && !b.dead ? `  (phase ${Math.min(b.phase, 3)})` : ''), bx + bw / 2, H - 38, 15, b.dead ? '#888888' : '#e6c0ff', 'center');
      bar(ctx, bx, H - 30, bw, 12, b.hp / b.maxHp, b.enraged ? '#c040ff' : '#9a5cff');
    });
  }

  const c = Game.clash;
  if (c) {
    const cw = 400, cx = W / 2 - cw / 2, cy = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(cx - 3, cy - 3, cw + 6, 22);
    ctx.fillStyle = '#a040ff'; ctx.fillRect(cx, cy, cw, 16);
    ctx.fillStyle = p.F.auraP; ctx.fillRect(cx, cy, cw * clamp(c.push, 0, 1), 16);
    text(ctx, 'MASH L !!!', W / 2, cy - 10, 24 + Math.sin(Game.time * 30) * 2, '#ffffff', 'center');
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
    text(ctx, Game.hint.text, W / 2, 268, 20, '#9fe6ff', 'center');
    ctx.restore();
  }
}

// Who has a portrait in dialogs (style name; null = Ren, drawn in his current form) and the color of each speaker's name.
const PORTRAITS = { 'Ren': null, 'Master Oro': 'master', 'Vorg': 'vorg', 'Raxas': 'raxas', 'Sable': 'sable', 'Gale': 'gale', 'Quartzus': 'quartz', 'Volta': 'volta', 'Hollow King': 'hollow', 'Glitch': 'glitch', 'Thornmother': 'thorn', 'Tick-Tock': 'ticktock', 'Dark Ren': 'darkRen', 'Kaldra': 'kaldra', 'Zul': 'twinRed', 'Zel': 'twinBlue', 'General Krag': 'krag', 'Nyx': 'nyx', 'Villager': 'villager' };
const SPEAKER_COLORS = { 'Ren': '#8ab4ff', 'Vorg': '#ff8a8a', 'Raxas': '#c9a0ff', 'Master Oro': '#9fe6a0', 'UNLOCKED': '#ffe14d', 'Tip': '#9fffb0', 'Controls': '#9fffb0', 'Guard': '#7fe8ff', 'Zul': '#ff7a6a', 'Zel': '#7ac8ff', 'General Krag': '#c8d0d8', 'Nyx': '#ff9ae0', 'Villager': '#ffffff', 'Sable': '#b08aff', 'Gale': '#7ff0d8', 'Quartzus': '#9ff0ff', 'Volta': '#fff27a', 'Hollow King': '#ff80c8', 'Glitch': '#40f0ff', 'Thornmother': '#a0e060', 'Tick-Tock': '#e0c070', 'Dark Ren': '#ff6080', 'Kaldra': '#c0d8ff' };

function drawDialog(ctx) {
  const d = Game.dialog;
  if (!d) return;
  const line = d.lines[d.i];
  // on touch screens with overlaid buttons the box avoids the button corners
  const x = Math.max(60, (Game.safeLeft || 0) + 12);
  const w = W - x - Math.max(60, (Game.safeRight || 0) + 12);
  const y = H - 150, h = 120;
  ctx.save();
  ctx.fillStyle = 'rgba(10,12,30,0.88)';
  ctx.strokeStyle = 'rgba(255,220,120,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill(); ctx.stroke();
  const portraits = PORTRAITS;
  let tx = x + 20;
  if (line.who in portraits) {
    let st = portraits[line.who];
    const ren = heroById('ren'), rax = heroById('raxas'), nyx = heroById('nyx');
    if (st === 'raxas') st = STYLES[rax ? rax.F.style : 'raxasBase'];
    else if (st === 'nyx' && nyx) st = STYLES[nyx.F.style];
    else st = st ? STYLES[st] : STYLES[ren ? ren.F.style : 'heroBase'];
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x + 10, y + 10, 96, h - 20, 8); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 10, y + 10, 96, h - 20);
    const talking = d.chars < line.text.length;
    drawHumanoid(ctx, { x: x + 52, y: y + 200, facing: 1, pose: talking && Math.floor(Game.time * 8) % 2 ? Object.assign(POSES.idle(Game.time), { scream: true }) : POSES.idle(Game.time), style: st, scale: 2.3, t: Game.time });
    ctx.restore();
    tx = x + 122;
  }
  if (line.who) {
    const colors = SPEAKER_COLORS;
    text(ctx, line.who, tx, y + 30, 18, colors[line.who] || '#ffffff');
  }
  ctx.font = '600 19px system-ui, -apple-system, Segoe UI, sans-serif';
  const shown = line.text.slice(0, Math.floor(d.chars));
  const lines = wrapLines(ctx, shown, w - 20 - (tx - x));
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, tx, y + (line.who ? 58 : 40) + i * 25));
  if (d.chars >= line.text.length && Math.floor(Game.time * 3) % 2 === 0) {
    text(ctx, '▼ Enter / Space', x + w - 20, y + h - 12, 13, '#ffe14d', 'right', '600');
  }
  text(ctx, IS_TOUCH ? 'II - skip' : 'P / Esc - skip', x + w - 20, y + 22, 12, '#9fa8c8', 'right', '600');
  ctx.restore();
}

function drawMenu(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.45)';
  ctx.fillRect(0, 0, W, H);
  // the hero cycles through forms
  const t = Game.time;
  const fi = Math.abs(Math.floor(t / 2.5)) % 4;
  const F = FORMS[fi];
  drawAura(ctx, 250, 420, 150, F.aura, 1.1, t);
  auraParticles(250, 420, 120, F.auraP, 1);
  drawParticles(ctx);
  drawHumanoid(ctx, { x: 250, y: 420, facing: 1, pose: POSES.kicharge(t), style: STYLES[F.style], scale: 1.6, t });
  text(ctx, F.name, 250, 470, 16, F.auraP, 'center', '600');

  ctx.save();
  ctx.translate(620, 130);
  ctx.rotate(-0.04);
  text(ctx, 'KI WAVE', 0, 0, 84, '#ffe14d', 'center', '900');
  ctx.restore();
  text(ctx, 'Stop Vorg - and the darkness he was running from!', 620, 172, 17, '#ffffff', 'center', '600');

  const lines = [
    '← → move · ↑ jump / fly',
    'J punch · K Ki blast',
    'L hold and release - KI WAVE',
    'S / ↓ guard + charge Ki · T transform',
    'I / O techniques · P pause · M sound',
  ];
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(455, 190, 330, 120);
  lines.forEach((l, i) => text(ctx, l, 470, 211 + i * 22, 15, '#e6ecff', 'left', '600'));

  const opts = menuOptions();
  const sel = clamp(Game.menuSel === undefined ? 0 : Game.menuSel, 0, opts.length - 1);
  const n = opts.length;
  const y0 = n > 6 ? 336 : n > 5 ? 340 : n > 4 ? 344 : 352, gap = n > 6 ? 25 : n > 5 ? 27 : n > 4 ? 30 : 33;
  const fs = n > 6 ? 16 : 17;
  opts.forEach((o, i) => {
    const y = y0 + i * gap;
    const on = i === sel;
    if (on) {
      ctx.fillStyle = 'rgba(255,225,77,0.18)';
      ctx.fillRect(400, y - 23, 440, 31);
    }
    if (o.kind === 'diff') {
      const d = diff();
      text(ctx, (on ? '▶ ' : '') + 'Difficulty:  ◀ ' + d.name + ' ▶', 620, y, on ? 20 : 17, on ? d.color : '#cfd8ff', 'center', on ? '800' : '600');
    } else if (o.kind === 'dialogs') {
      text(ctx, (on ? '▶ ' : '') + 'Dialogs:  ◀ ' + (Game.dialogsOn ? 'On' : 'Off') + ' ▶', 620, y, on ? 19 : fs, on ? '#9fffb0' : '#cfd8ff', 'center', on ? '800' : '600');
    } else if (o.kind === 'helper') {
      text(ctx, (on ? '▶ ' : '') + 'Helper friends:  ◀ ' + helperName(Game.helper) + ' ▶', 620, y, on ? 20 : 17, on ? '#c99bff' : '#cfd8ff', 'center', on ? '800' : '600');
    } else {
      text(ctx, (on ? '▶ ' : '') + o.label, 620, y, on ? 19 : fs, on ? '#ffe14d' : '#cfd8ff', 'center', on ? '800' : '600');
    }
  });
  const hint = opts[sel] && opts[sel].kind === 'dialogs' ? '← → show the story dialogs or skip them (P / Esc also skips one)' : opts[sel] && opts[sel].kind === 'diff' ? '← → change difficulty' : opts[sel] && opts[sel].kind === 'helper' ? '← → who helps you from level 6 on: one or two friends (Auto = story friend)' : '↑ ↓ choose · ENTER / J start';
  if (Math.floor(t * 2) % 2 === 0) text(ctx, hint, 620, y0 + opts.length * gap + 4, 14, '#9fe6ff', 'center', '600');
  if (Game.highScore > 0) text(ctx, 'Best score: ' + Game.highScore, 620, 530, 14, '#ffd34a', 'center', '600');
}

// HUD icons of the two technique slots with a recharge wedge.
function drawSpecialSlots(ctx, p, y) {
  if (!Game.equip || (!Game.equip[1] && !Game.equip[2])) return;
  [1, 2].forEach((slot, i) => {
    const id = Game.equip[slot];
    const x = 38 + i * 50;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
    if (id) {
      const sp = SPECIAL_BY_ID[id];
      const left = techCooldownFrac(p, id);
      const ready = left <= 0;
      ctx.fillStyle = ready ? sp.color : 'rgba(255,255,255,0.15)';
      ctx.globalAlpha = ready ? 0.35 + 0.15 * Math.sin(Game.time * 6) : 1;
      ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      if (!ready) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 17, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = ready ? sp.color : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();
      text(ctx, sp.icon, x, y + 7, 19, ready ? '#ffffff' : '#a0a0b0', 'center', '900');
      if (!ready) text(ctx, String(Math.ceil(techCooldown(p, id))), x + 14, y + 18, 11, '#ffffff', 'center', '700');
    } else {
      text(ctx, '·', x, y + 6, 18, '#666677', 'center');
    }
    text(ctx, IS_TOUCH ? (slot === 1 ? '①' : '②') : (slot === 1 ? 'I' : 'O'), x - 15, y - 12, 11, '#ffd34a', 'center', '800');
    ctx.restore();
  });
}

// Stars as text: filled ★ in gold, empty ☆ in grey.
function drawStars(ctx, x, y, n, size, align = 'center') {
  const str = '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);
  ctx.save();
  ctx.font = `900 ${size}px system-ui, sans-serif`;
  const w = ctx.measureText('★★★').width;
  let sx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  for (let i = 0; i < 3; i++) {
    const ch = str[i];
    ctx.lineWidth = Math.max(3, size / 7);
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(ch, sx, y);
    ctx.fillStyle = i < n ? '#ffd34a' : '#6a6a78';
    ctx.fillText(ch, sx, y);
    sx += w / 3;
  }
  ctx.restore();
}

// Techniques screen: all 10 techniques, learned ones can be put into slot ① or ②.
function drawTechs(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'TECHNIQUES', W / 2, 58, 42, '#ffb060', 'center', '900');
  const e1 = Game.equip[1] ? SPECIAL_BY_ID[Game.equip[1]] : null, e2 = Game.equip[2] ? SPECIAL_BY_ID[Game.equip[2]] : null;
  text(ctx, `① ${e1 ? e1.icon + ' ' + e1.name : '—'}        ② ${e2 ? e2.icon + ' ' + e2.name : '—'}`, W / 2, 92, 17, '#ffffff', 'center', '700');
  const cw = 172, ch = 168, gap = 12;
  const x0 = W / 2 - (5 * cw + 4 * gap) / 2, y0 = 112;
  SPECIALS.forEach((sp, i) => {
    const x = x0 + (i % 5) * (cw + gap), y = y0 + Math.floor(i / 5) * (ch + gap);
    const owned = (Game.techs || []).includes(sp.id);
    const on = i === Game.techSel;
    const slot = Game.equip[1] === sp.id ? 1 : Game.equip[2] === sp.id ? 2 : 0;
    ctx.fillStyle = !owned ? 'rgba(40,40,50,0.75)' : on ? 'rgba(255,170,80,0.2)' : 'rgba(20,24,48,0.9)';
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = on ? '#ffb060' : slot ? '#ffd34a' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = on ? 3 : slot ? 2 : 1;
    ctx.strokeRect(x, y, cw, ch);
    const c = owned ? sp.color : '#555566';
    text(ctx, sp.icon, x + cw / 2, y + 44, 34, c, 'center', '900');
    text(ctx, sp.name, x + cw / 2, y + 70, 14, owned ? '#ffffff' : '#666677', 'center', '800');
    text(ctx, (sp.slot === 2 ? 'ULTIMATE' : 'quick') + ` · ↻ ${Math.round(specialCooldown(sp))} s`, x + cw / 2, y + 88, 11, owned ? (sp.slot === 2 ? '#ff9a60' : '#9fe6ff') : '#555566', 'center', '700');
    if (owned) {
      ctx.font = '600 11px system-ui, -apple-system, Segoe UI, sans-serif';
      wrapLines(ctx, sp.desc, cw - 16).slice(0, 3).forEach((l, k) => text(ctx, l, x + cw / 2, y + 108 + k * 14, 11, '#cfd8ff', 'center', '600'));
    } else {
      text(ctx, 'LOCKED', x + cw / 2, y + 116, 14, '#666677', 'center', '800');
      text(ctx, `finish level ${sp.unlock + 1}`, x + cw / 2, y + 134, 11, '#666677', 'center', '600');
    }
    if (slot) {
      ctx.fillStyle = '#ffd34a';
      ctx.beginPath(); ctx.arc(x + cw - 16, y + 16, 11, 0, Math.PI * 2); ctx.fill();
      text(ctx, slot === 1 ? '1' : '2', x + cw - 16, y + 21, 13, '#2a1a00', 'center', '900');
    }
  });
  const keys = IS_TOUCH ? '◀ ▶ ▲ ▼ choose · J / ① put in slot ① · K / ② put in slot ② · II back' : '← → ↑ ↓ choose · J / I put in slot ① · K / O put in slot ② · Esc back';
  text(ctx, keys, W / 2, 486, 14, '#9fe6ff', 'center', '600');
  text(ctx, 'Any technique fits any slot - the recharge time belongs to the technique.', W / 2, 508, 12, '#cfd8ff', 'center', '600');
  if (Game.trainMsg) text(ctx, Game.trainMsg.text, W / 2, 532, 16, Game.trainMsg.color || '#ff8080', 'center', '800');
}

const RANK_COLORS = { S: '#ff80e0', A: '#ffd34a', B: '#9fe6ff', C: '#cfd8ff' };

function drawLevelSelect(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.72)';
  ctx.fillRect(0, 0, W, H);
  const d = diff();
  text(ctx, 'SELECT LEVEL', W / 2, 70, 44, '#ffe14d', 'center', '900');
  text(ctx, `Difficulty: ${d.name} - stars are saved for each difficulty`, W / 2, 100, 15, d.color, 'center', '600');
  const prog = loadProgress();
  const rowsN = Math.ceil(LEVELS.length / 5);
  const compact = rowsN > 3;                       // 4-5 rows: small cards, one row per act
  const cw = 160, gapX = 18, gapY = compact ? 8 : rowsN > 2 ? 10 : 22;
  const ch = compact ? 68 : rowsN > 2 ? 108 : 150;
  const x0 = W / 2 - (5 * cw + 4 * gapX) / 2, yTop = compact ? 112 : rowsN > 2 ? 116 : 130;
  const sc = ch / 150;
  LEVELS.forEach((lvl, i) => {
    const x = x0 + (i % 5) * (cw + gapX);
    const y = yTop + Math.floor(i / 5) * (ch + gapY);
    const locked = i > prog;
    const on = i === Game.lsSel;
    ctx.fillStyle = locked ? 'rgba(40,40,50,0.7)' : on ? 'rgba(255,225,77,0.2)' : 'rgba(20,24,48,0.85)';
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = on ? '#ffe14d' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = on ? 3 : 1;
    ctx.strokeRect(x, y, cw, ch);
    const words = lvl.name.replace("Vorg's Ship in Orbit", "Vorg's Ship");
    const best = locked ? null : bestResult(i);
    if (compact) {
      text(ctx, `${i + 1}`, x + 8, y + 26, 21, locked ? '#666677' : '#ffffff', 'left', '900');
      text(ctx, words, x + cw / 2 + 14, y + 22, words.length > 16 ? 10.5 : 12, locked ? '#666677' : '#cfd8ff', 'center', '700');
      if (locked) text(ctx, 'LOCKED', x + cw / 2 + 12, y + 52, 13, '#666677', 'center', '800');
      else {
        drawStars(ctx, x + cw / 2 + 4, y + 54, best ? best.stars : 0, 20);
        if (best) text(ctx, best.rank, x + cw - 10, y + 56, 18, RANK_COLORS[best.rank], 'right', '900');
      }
      return;
    }
    text(ctx, `${i + 1}`, x + cw / 2, y + 42 * sc, 34 * Math.max(0.75, sc), locked ? '#666677' : '#ffffff', 'center', '900');
    text(ctx, words, x + cw / 2, y + 68 * sc, 13, locked ? '#666677' : '#cfd8ff', 'center', '700');
    text(ctx, 'Act ' + (lvl.act || 1), x + cw / 2, y + 86 * sc, 11, locked ? '#555566' : '#8a8fb0', 'center', '600');
    if (locked) {
      text(ctx, 'LOCKED', x + cw / 2, y + 124 * sc, 15, '#666677', 'center', '800');
    } else {
      drawStars(ctx, x + cw / 2, y + 122 * sc, best ? best.stars : 0, 24 * Math.max(0.8, sc));
      if (best) text(ctx, best.rank, x + cw - 14, y + 26, 20, RANK_COLORS[best.rank], 'right', '900');
    }
  });
  if (compact) for (let r = 0; r < rowsN; r++) text(ctx, 'ACT ' + (r + 1), x0 - 8, yTop + r * (ch + gapY) + ch / 2 + 4, 11, '#8a8fb0', 'right', '700');
  text(ctx, '← → ↑ ↓ choose · ENTER / J play · P / Esc back', W / 2, 508, 14, '#9fe6ff', 'center', '600');
  text(ctx, '★ complete   ★ no defeat   ★ little damage   ·   S = 3 stars + fast', W / 2, 529, 12, '#cfd8ff', 'center', '600');
}

function drawOverlay(ctx, title, sub, lines, color, top = 275) {
  ctx.fillStyle = 'rgba(5,6,20,0.65)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, title, W / 2, top === 275 ? 170 : 110, 60, color, 'center', '900');
  if (sub) text(ctx, sub, W / 2, top === 275 ? 215 : 152, 22, '#ffffff', 'center', '600');
  lines.forEach((l, i) => text(ctx, l, W / 2, top + i * 30, 19, i === lines.length - 1 ? '#9fe6ff' : '#e6ecff', 'center', '600'));
}

// Star rating block on the victory screen.
function drawResult(ctx, y) {
  const r = Game.result;
  if (!r) return;
  drawStars(ctx, W / 2 - 60, y, r.stars, 46);
  text(ctx, r.rank, W / 2 + 90, y, 50, RANK_COLORS[r.rank], 'center', '900');
  const mm = Math.floor(r.time / 60), ss = String(Math.floor(r.time % 60)).padStart(2, '0');
  const parts = [
    (r.noDefeat ? '✔' : '✘') + ' no defeat',
    (r.lowDamage ? '✔' : '✘') + ` damage ${r.dmgTaken} / ${r.dmgLimit}`,
    `time ${mm}:${ss}` + (r.stars === 3 ? (r.rank === 'S' ? ' (S!)' : ` (S under ${Math.floor(r.par / 60)}:${String(r.par % 60).padStart(2, '0')})`) : ''),
  ];
  text(ctx, parts.join('   ·   '), W / 2, y + 30, 15, '#cfd8ff', 'center', '600');
  if (r.newBest) text(ctx, `NEW BEST on ${diff().name}!`, W / 2, y + 52, 15, '#9fffb0', 'center', '800');
}

function drawTraining(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.7)';
  ctx.fillRect(0, 0, W, H);
  const t = Game.time;
  drawAura(ctx, 250, 420, 150, 'rgba(170,210,255,A)', 1.1, t);
  auraParticles(250, 420, 120, '#bfe0ff', 1);
  drawParticles(ctx);
  drawHumanoid(ctx, { x: 250, y: 420, facing: 1, pose: Math.floor(t * 3) % 2 ? POSES.punch1() : POSES.punch2(), style: STYLES.heroBase, scale: 1.6, t });
  drawHumanoid(ctx, { x: 120, y: 420, facing: 1, pose: POSES.idle(t), style: STYLES.master, scale: 1.4, t });
  const nextLvl = LEVELS[Game.levelIndex + 1];
  const frs = friendsFor(nextLvl);
  frs.forEach((fr, i) => {
    const pose = Math.floor(t * 3 + i) % 2 ? POSES.punch2() : (fr === 'raxas' ? POSES.swordSlash() : POSES.punch1());
    drawHumanoid(ctx, { x: frs.length > 1 ? 345 + i * 70 : 370, y: 420, facing: -1, pose, style: STYLES[CHARACTERS[fr].forms[0].style], scale: frs.length > 1 ? 1.35 : 1.6, t });
  });
  text(ctx, 'Master Oro: "Train hard, Ren - the next enemy is stronger!"', 250, 470, 14, '#9fe6ff', 'center', '600');

  text(ctx, 'TRAINING', 650, 80, 48, '#ffe14d', 'center', '900');
  text(ctx, `Before level ${Game.levelIndex + 2}: ${LEVELS[Game.levelIndex + 1].name}`, 650, 110, 16, '#ffffff', 'center', '600');
  text(ctx, `${Game.money} coins`, 650, 143, 24, '#ffe680', 'center', '800');

  const rows = trainRows();
  const rowH = Math.min(62, Math.floor(318 / rows.length)), top0 = 162, boxH = rowH - 6;
  const small = rowH < 50;
  let y = top0;
  rows.forEach((row, i) => {
    const on = Game.trainSel === i;
    if (row.kind === 'up') {
      const tr = row.t;
      const lvl = Game.upgrades[tr.key];
      ctx.fillStyle = on ? 'rgba(255,225,77,0.16)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, tr.name, 486, y + boxH * 0.45, small ? 15 : 18, tr.color, 'left', '800');
      text(ctx, tr.desc, 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = k < lvl ? tr.color : 'rgba(255,255,255,0.15)';
        ctx.fillRect(660 + k * 16, y + 12, 12, 12);
      }
      const cost = lvl >= 5 ? 'MAX' : trainCost(lvl) + ' c';
      text(ctx, cost, 818, y + boxH * 0.8, 15, lvl < 5 && Game.money >= trainCost(lvl) ? '#ffe680' : '#888888', 'right', '700');
      y += rowH;
    } else if (row.kind === 'lead') {
      const c = leadCharacter();
      ctx.fillStyle = on ? 'rgba(200,150,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#c99bff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, 'Lead fighter', 486, y + boxH * 0.45, small ? 15 : 18, '#c99bff', 'left', '800');
      text(ctx, 'who you control at the start (C switches)', 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      text(ctx, '⇄ ' + c.name, 818, y + boxH * 0.62, 18, c.color, 'right', '800');
      y += rowH;
    } else if (row.kind === 'helper') {
      const fr = friendsFor(LEVELS[Game.levelIndex + 1]);
      ctx.fillStyle = on ? 'rgba(200,150,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#c99bff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, 'Helper friends', 486, y + boxH * 0.45, small ? 15 : 18, '#c99bff', 'left', '800');
      const desc = fr.length ? fr.map((id) => `${CHARACTERS[id].name} (${powerInfo({ id }).energy.toLowerCase()})`).join(' + ') : 'you fight alone';
      text(ctx, desc, 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      text(ctx, (on ? '◀ ' : '') + helperName(Game.helper) + (on ? ' ▶' : ''), 818, y + boxH * 0.45, small ? 13 : 15, fr.length ? CHARACTERS[fr[0]].color : '#cfd8ff', 'right', '800');
      y += rowH;
    } else if (row.kind === 'techs') {
      ctx.fillStyle = on ? 'rgba(255,170,80,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#ffb060'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      const n1 = Game.equip[1] ? SPECIAL_BY_ID[Game.equip[1]] : null, n2 = Game.equip[2] ? SPECIAL_BY_ID[Game.equip[2]] : null;
      text(ctx, 'Techniques', 486, y + boxH * 0.45, small ? 15 : 18, '#ffb060', 'left', '800');
      text(ctx, `① ${n1 ? n1.name : '—'}  ·  ② ${n2 ? n2.name : '—'}`, 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      text(ctx, `${(Game.techs || []).length}/${SPECIALS.length}  ENTER ▶`, 818, y + boxH * 0.55, small ? 13 : 15, '#ffb060', 'right', '800');
      y += rowH;
    } else {
      ctx.fillStyle = on ? 'rgba(120,230,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, 42);
      if (on) { ctx.strokeStyle = '#9fe6ff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, 42); }
      text(ctx, (on ? '▶ ' : '') + 'Continue to the next level', 650, y + 28, 19, '#9fe6ff', 'center', '800');
    }
  });
  text(ctx, '↑ ↓ choose · ENTER / J select · ← → change', 650, y + 60, 13, '#cfd8ff', 'center', '600');
  if (Game.trainMsg) text(ctx, Game.trainMsg.text, 650, Math.min(y + 86, 534), 18, Game.trainMsg.color || '#ff8080', 'center', '800');
}

function drawUI(ctx) {
  switch (Game.state) {
    case 'MENU':
      drawMenu(ctx);
      break;
    case 'TRAINING':
      drawTraining(ctx);
      break;
    case 'LEVELSELECT':
      drawLevelSelect(ctx);
      break;
    case 'TECHS':
      drawTechs(ctx);
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
      drawOverlay(ctx, 'PAUSED', '', [IS_TOUCH ? '① - techniques' : 'I - techniques', 'Q / J - quit to menu', 'P / Esc / Enter - resume'], '#ffffff');
      break;
    case 'GAMEOVER': {
      drawHUD(ctx);
      const cp = Game.checkpoint > 0;
      drawOverlay(ctx, 'DEFEATED', "Vorg's army was stronger this time...", [
        'Score: ' + Game.score,
        Game.stateT > 1 ? (cp ? 'ENTER - retry from the boss' : 'ENTER - try again') : '',
      ], '#ff5a4a');
      break;
    }
    case 'VICTORY': {
      const lvl = LEVELS[Game.levelIndex];
      const last = Game.levelIndex + 1 >= LEVELS.length;
      const newRecord = Game.score >= Game.highScore && Game.score > 0;
      const recLine = 'Score: ' + Game.score + (newRecord ? '  - NEW BEST!' : '  (best ' + Game.highScore + ')');
      const go = Game.stateT > 1.5;
      if (last) {
        drawOverlay(ctx, 'THE END', ACTS[actOf(Game.levelIndex)].end + '!', [
          '✹ All 25 levels complete',
          'Ren, Raxas and Nyx - legends of light, shadow and illusion',
          recLine,
          'Thanks for playing!',
          go ? 'ENTER - back to menu' : '',
        ], '#ffe14d', 300);
        drawResult(ctx, 205);
      } else {
        const act = actOf(Game.levelIndex);
        const actEnd = actOf(Game.levelIndex + 1) !== act;
        const lines = [`${ACTS[act].mark} ${ACTS[act].got}  (${Game.crystals}/5)`];
        if (lvl.unlockText) lines.push('✦ Unlocked: ' + lvl.unlockText);
        if (Game.result && Game.result.newTech) {
          const nt = Game.result.newTech;
          const where = Game.equip[1] === nt.id ? 'in slot ① - key I' : Game.equip[2] === nt.id ? 'in slot ② - key O' : 'choose it in Techniques';
          lines.push(`NEW TECHNIQUE: ${nt.icon} ${nt.name} (${where})`);
        }
        if (actEnd) lines.push(`...but a new threat is waking up. ACT ${act + 1} begins!`);
        lines.push(`Coins: ${Game.money} - spend them on training!`);
        lines.push(recLine);
        lines.push(go ? 'ENTER - go to training' : '');
        const actSub = ACTS[act].end;
        drawOverlay(ctx, actEnd ? `ACT ${act} COMPLETE!` : `LEVEL ${Game.levelIndex + 1} COMPLETE!`, actEnd ? actSub : lvl.name + ' is safe', lines, '#ffe14d', 300);
        drawResult(ctx, 205);
      }
      break;
    }
  }
}
