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
  bar(ctx, 20, 54, 260, 9, p.ki / p.maxKi, '#3aa0ff');
  const full = p.power >= 100;
  const pc = p.form > 0 ? '#ffb000' : '#ffd34a';
  bar(ctx, 20, 69, 260, 9, p.power / 100, pc, 'rgba(0,0,0,0.55)', full || p.form > 0);
  text(ctx, 'HP', 288, 46, 11, '#d0ffd8');
  text(ctx, 'KI', 288, 63, 11, '#bfe0ff');
  text(ctx, 'POWER', 288, 78, 11, '#fff2b0');
  const gk = p.guard / p.maxGuard;
  bar(ctx, 20, 84, 260, 7, gk, p.guardLocked ? '#5a6a78' : '#7fe8ff', 'rgba(0,0,0,0.55)', p.guarding);
  text(ctx, p.guardLocked ? 'GUARD (broken)' : 'GUARD', 288, 92, 11, p.guardLocked ? '#ff9a40' : '#bff4ff');
  const canUp = p.unlocked > p.form && p.unlocked < p.char.finalForm && (p.form === 0 ? full : p.power >= 50);
  if (canUp && Math.floor(Game.time * 4) % 2 === 0) {
    text(ctx, 'T - ' + p.forms[p.unlocked].name.toUpperCase() + '!', 20, 114, 16, p.forms[p.unlocked].auraP);
  }
  drawSpecialSlots(ctx, p, Game.ally ? 190 : 150);
  // the AI-controlled ally: small panel under the main bars
  const a = Game.ally;
  if (a) {
    const y0 = 136;
    text(ctx, a.char.name + (a.alive ? '' : '  (down)'), 20, y0, 13, a.alive ? a.char.color : '#888888');
    text(ctx, a.F.name, 20 + ctx.measureText(a.char.name + (a.alive ? '' : '  (down)')).width + 8, y0, 11, '#cfd8ff', 'left', '600');
    bar(ctx, 20, y0 + 6, 150, 7, a.hp / a.maxHp, a.hp > a.maxHp * 0.3 ? '#4cd964' : '#ff3b30');
    bar(ctx, 20, y0 + 17, 150, 4, a.ki / a.maxKi, '#3aa0ff');
    if (!IS_TOUCH) text(ctx, 'C - switch', 178, y0 + 14, 11, '#cfd8ff', 'left', '600');
  }

  text(ctx, 'SCORE ' + Game.score, W - 20, 30, 18, '#ffffff', 'right');
  text(ctx, diff().name.toUpperCase() + ' · BEST ' + Math.max(Game.highScore, Game.score), W - 20, 50, 12, diff().color, 'right', '600');
  const act = actOf(Game.levelIndex);
  const coll = act === 3 ? `◇ ${Game.crystals}/5 shards` : act === 2 ? `◆ ${Game.crystals}/5 seals` : `★ ${Game.crystals}/5`;
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
  const portraits = { 'Ren': null, 'Master Oro': 'master', 'Vorg': 'vorg', 'Raxas': 'raxas', 'Sable': 'sable', 'Gale': 'gale', 'Quartzus': 'quartz', 'Volta': 'volta', 'Hollow King': 'hollow', 'Glitch': 'glitch', 'Thornmother': 'thorn', 'Tick-Tock': 'ticktock', 'Dark Ren': 'darkRen', 'Kaldra': 'kaldra', 'Zul': 'twinRed', 'Zel': 'twinBlue', 'General Krag': 'krag', 'Nyx': 'nyx', 'Villager': 'villager' };
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
    const colors = { 'Ren': '#8ab4ff', 'Vorg': '#ff8a8a', 'Raxas': '#c9a0ff', 'Master Oro': '#9fe6a0', 'UNLOCKED': '#ffe14d', 'Tip': '#9fffb0', 'Controls': '#9fffb0', 'Guard': '#7fe8ff', 'Zul': '#ff7a6a', 'Zel': '#7ac8ff', 'General Krag': '#c8d0d8', 'Nyx': '#ff9ae0', 'Villager': '#ffffff', 'Sable': '#b08aff', 'Gale': '#7ff0d8', 'Quartzus': '#9ff0ff', 'Volta': '#fff27a', 'Hollow King': '#ff80c8', 'Glitch': '#40f0ff', 'Thornmother': '#a0e060', 'Tick-Tock': '#e0c070', 'Dark Ren': '#ff6080', 'Kaldra': '#c0d8ff' };
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
  ctx.fillRect(455, 192, 330, 132);
  lines.forEach((l, i) => text(ctx, l, 470, 216 + i * 23, 15, '#e6ecff', 'left', '600'));

  const opts = menuOptions();
  const sel = clamp(Game.menuSel === undefined ? 0 : Game.menuSel, 0, opts.length - 1);
  const y0 = opts.length > 4 ? 344 : 352, gap = opts.length > 4 ? 30 : 33;
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
    } else if (o.kind === 'helper') {
      text(ctx, (on ? '▶ ' : '') + 'Helper friend:  ◀ ' + HELPER_NAMES[Game.helper] + ' ▶', 620, y, on ? 20 : 17, on ? '#c99bff' : '#cfd8ff', 'center', on ? '800' : '600');
    } else {
      text(ctx, (on ? '▶ ' : '') + o.label, 620, y, on ? 20 : 17, on ? '#ffe14d' : '#cfd8ff', 'center', on ? '800' : '600');
    }
  });
  const hint = opts[sel] && opts[sel].kind === 'diff' ? '← → change difficulty' : opts[sel] && opts[sel].kind === 'helper' ? '← → who helps you from level 6 on (Auto = story friend, None = alone)' : '↑ ↓ choose · ENTER / J start';
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
      const left = clamp(p.specialCd[slot] / specialCooldown(sp), 0, 1);
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
      if (!ready) text(ctx, String(Math.ceil(p.specialCd[slot])), x + 14, y + 18, 11, '#ffffff', 'center', '700');
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

const RANK_COLORS = { S: '#ff80e0', A: '#ffd34a', B: '#9fe6ff', C: '#cfd8ff' };

function drawLevelSelect(ctx) {
  ctx.fillStyle = 'rgba(5,6,20,0.72)';
  ctx.fillRect(0, 0, W, H);
  const d = diff();
  text(ctx, 'SELECT LEVEL', W / 2, 70, 44, '#ffe14d', 'center', '900');
  text(ctx, `Difficulty: ${d.name} - stars are saved for each difficulty`, W / 2, 100, 15, d.color, 'center', '600');
  const prog = loadProgress();
  const rowsN = Math.ceil(LEVELS.length / 5);
  const cw = 160, gapX = 18, gapY = rowsN > 2 ? 10 : 22;
  const ch = rowsN > 2 ? 108 : 150;
  const x0 = W / 2 - (5 * cw + 4 * gapX) / 2, yTop = rowsN > 2 ? 116 : 130;
  const sc = ch / 150;   // smaller cards when there are three rows
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
    text(ctx, `${i + 1}`, x + cw / 2, y + 42 * sc, 34 * Math.max(0.75, sc), locked ? '#666677' : '#ffffff', 'center', '900');
    const words = lvl.name.replace("Vorg's Ship in Orbit", "Vorg's Ship");
    text(ctx, words, x + cw / 2, y + 68 * sc, 13, locked ? '#666677' : '#cfd8ff', 'center', '700');
    text(ctx, 'Act ' + (lvl.act || 1), x + cw / 2, y + 86 * sc, 11, locked ? '#555566' : '#8a8fb0', 'center', '600');
    if (locked) {
      text(ctx, 'LOCKED', x + cw / 2, y + 124 * sc, 15, '#666677', 'center', '800');
    } else {
      const best = bestResult(i);
      drawStars(ctx, x + cw / 2, y + 122 * sc, best ? best.stars : 0, 24 * Math.max(0.8, sc));
      if (best) text(ctx, best.rank, x + cw - 14, y + 26, 20, RANK_COLORS[best.rank], 'right', '900');
    }
  });
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
  const fr = friendFor(nextLvl);
  if (fr) drawHumanoid(ctx, { x: 370, y: 420, facing: -1, pose: Math.floor(t * 3) % 2 ? POSES.punch2() : (fr === 'raxas' ? POSES.swordSlash() : POSES.punch1()), style: STYLES[CHARACTERS[fr].forms[0].style], scale: 1.6, t });
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
      const f = friendFor(LEVELS[Game.levelIndex + 1]);
      ctx.fillStyle = on ? 'rgba(200,150,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#c99bff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, 'Helper friend', 486, y + boxH * 0.45, small ? 15 : 18, '#c99bff', 'left', '800');
      text(ctx, f ? `${CHARACTERS[f].name} fights with you` : 'you fight alone', 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      text(ctx, (on ? '◀ ' : '') + HELPER_NAMES[Game.helper] + (on ? ' ▶' : ''), 818, y + boxH * 0.55, small ? 14 : 17, f ? CHARACTERS[f].color : '#cfd8ff', 'right', '800');
      y += rowH;
    } else if (row.kind === 'slot') {
      const sp = Game.equip && Game.equip[row.slot] ? SPECIAL_BY_ID[Game.equip[row.slot]] : null;
      ctx.fillStyle = on ? 'rgba(255,170,80,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#ffb060'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      const label = row.slot === 1 ? 'Technique ① (I)' : 'Ultimate ② (O)';
      text(ctx, label, 486, y + boxH * 0.45, small ? 15 : 18, '#ffb060', 'left', '800');
      text(ctx, sp ? sp.desc : 'finish levels to learn techniques', 486, y + boxH * 0.85, small ? 11 : 13, '#cfd8ff', 'left', '600');
      text(ctx, sp ? (on ? '◀ ' : '') + sp.icon + ' ' + sp.name + (on ? ' ▶' : '') : '—', 818, y + boxH * 0.45, small ? 13 : 15, sp ? sp.color : '#888888', 'right', '800');
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
    case 'PLAY':
      drawHUD(ctx);
      break;
    case 'DIALOG':
      drawHUD(ctx);
      drawDialog(ctx);
      break;
    case 'PAUSE':
      drawHUD(ctx);
      drawOverlay(ctx, 'PAUSED', '', ['Q / J - quit to menu', 'P / Esc / Enter - resume'], '#ffffff');
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
        drawOverlay(ctx, 'THE END', 'Kaldra is defeated - the stolen worlds are free!', [
          '◇ All 5 Mirror Shards broken',
          'Ren, Raxas and Nyx - legends of light, shadow and illusion',
          recLine,
          'Thanks for playing!',
          go ? 'ENTER - back to menu' : '',
        ], '#ffe14d', 300);
        drawResult(ctx, 205);
      } else {
        const act = actOf(Game.levelIndex);
        const actEnd = actOf(Game.levelIndex + 1) !== act;
        const lines = [act === 3 ? `◇ Mirror Shard broken  (${Game.crystals}/5)` : act === 2 ? `◆ Hollow Seal broken  (${Game.crystals}/5)` : `★ Star Crystal recovered  (${Game.crystals}/5)`];
        if (lvl.unlockText) lines.push('✦ Unlocked: ' + lvl.unlockText);
        if (Game.result && Game.result.newTech) { const nt = Game.result.newTech; lines.push(`NEW TECHNIQUE: ${nt.icon} ${nt.name} (slot ${nt.slot === 1 ? '① - key I' : '② - key O'})`); }
        if (actEnd) lines.push(`...but a new threat is waking up. ACT ${act + 1} begins!`);
        lines.push(`Coins: ${Game.money} - spend them on training!`);
        lines.push(recLine);
        lines.push(go ? 'ENTER - go to training' : '');
        const actSub = act === 2 ? 'The Hollow King is gone - light returns to the world' : 'Vorg is defeated - the Star Crystals are safe';
        drawOverlay(ctx, actEnd ? `ACT ${act} COMPLETE!` : `LEVEL ${Game.levelIndex + 1} COMPLETE!`, actEnd ? actSub : lvl.name + ' is safe', lines, '#ffe14d', 300);
        drawResult(ctx, 205);
      }
      break;
    }
  }
}
