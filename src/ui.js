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
  // the AI-controlled ally: small panel under the main bars
  const a = Game.ally;
  if (a) {
    const y0 = 128;
    text(ctx, a.char.name + (a.alive ? '' : '  (down)'), 20, y0, 13, a.alive ? a.char.color : '#888888');
    text(ctx, a.F.name, 20 + ctx.measureText(a.char.name + (a.alive ? '' : '  (down)')).width + 8, y0, 11, '#cfd8ff', 'left', '600');
    bar(ctx, 20, y0 + 6, 150, 7, a.hp / a.maxHp, a.hp > a.maxHp * 0.3 ? '#4cd964' : '#ff3b30');
    bar(ctx, 20, y0 + 17, 150, 4, a.ki / a.maxKi, '#3aa0ff');
    if (!IS_TOUCH) text(ctx, 'C - switch', 178, y0 + 14, 11, '#cfd8ff', 'left', '600');
  }

  text(ctx, 'SCORE ' + Game.score, W - 20, 30, 18, '#ffffff', 'right');
  text(ctx, 'BEST ' + Math.max(Game.highScore, Game.score), W - 20, 50, 12, '#cfd8ff', 'right', '600');
  text(ctx, actOf(Game.levelIndex) === 2 ? `LEVEL ${Game.levelIndex + 1} · ◆ ${Game.crystals}/5 seals` : `LEVEL ${Game.levelIndex + 1} · ★ ${Game.crystals}/5`, W - 20, 66, 12, '#ffd34a', 'right', '600');
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
  const portraits = { 'Ren': null, 'Master Oro': 'master', 'Vorg': 'vorg', 'Raxas': 'raxas', 'Sable': 'sable', 'Gale': 'gale', 'Quartzus': 'quartz', 'Volta': 'volta', 'Hollow King': 'hollow', 'Zul': 'twinRed', 'Zel': 'twinBlue', 'General Krag': 'krag', 'Nyx': 'nyx', 'Villager': 'villager' };
  let tx = x + 20;
  if (line.who in portraits) {
    let st = portraits[line.who];
    const ren = heroById('ren'), rax = heroById('raxas');
    if (st === 'raxas') st = STYLES[rax ? rax.F.style : 'raxasBase'];
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
    const colors = { 'Ren': '#8ab4ff', 'Vorg': '#ff8a8a', 'Raxas': '#c9a0ff', 'Master Oro': '#9fe6a0', 'UNLOCKED': '#ffe14d', 'Tip': '#9fffb0', 'Controls': '#9fffb0', 'Guard': '#7fe8ff', 'Zul': '#ff7a6a', 'Zel': '#7ac8ff', 'General Krag': '#c8d0d8', 'Nyx': '#ff9ae0', 'Villager': '#ffffff', 'Sable': '#b08aff', 'Gale': '#7ff0d8', 'Quartzus': '#9ff0ff', 'Volta': '#fff27a', 'Hollow King': '#ff80c8' };
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
    'P pause · M sound',
  ];
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(455, 192, 330, 132);
  lines.forEach((l, i) => text(ctx, l, 470, 216 + i * 23, 15, '#e6ecff', 'left', '600'));

  const opts = menuOptions();
  const sel = clamp(Game.menuSel === undefined ? opts.length - 1 : Game.menuSel, 0, opts.length - 1);
  opts.forEach((o, i) => {
    const y = 370 + i * 36;
    const on = i === sel;
    if (on) {
      ctx.fillStyle = 'rgba(255,225,77,0.18)';
      ctx.fillRect(400, y - 24, 440, 34);
    }
    text(ctx, (on ? '▶ ' : '') + o.label, 620, y, on ? 21 : 18, on ? '#ffe14d' : '#cfd8ff', 'center', on ? '800' : '600');
  });
  if (Math.floor(t * 2) % 2 === 0) text(ctx, '↑ ↓ choose · ENTER / J start', 620, 370 + opts.length * 36 + 8, 15, '#9fe6ff', 'center', '600');
  if (Game.highScore > 0) text(ctx, 'Best score: ' + Game.highScore, 620, 520, 15, '#ffd34a', 'center', '600');
}

function drawOverlay(ctx, title, sub, lines, color) {
  ctx.fillStyle = 'rgba(5,6,20,0.65)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, title, W / 2, 170, 60, color, 'center', '900');
  if (sub) text(ctx, sub, W / 2, 215, 22, '#ffffff', 'center', '600');
  lines.forEach((l, i) => text(ctx, l, W / 2, 275 + i * 32, 20, i === lines.length - 1 ? '#9fe6ff' : '#e6ecff', 'center', '600'));
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
  if (nextLvl && nextLvl.ally) drawHumanoid(ctx, { x: 370, y: 420, facing: -1, pose: Math.floor(t * 3) % 2 ? POSES.punch2() : POSES.swordSlash(), style: STYLES.raxasBase, scale: 1.6, t });
  text(ctx, 'Master Oro: "Train hard, Ren - the next enemy is stronger!"', 250, 470, 14, '#9fe6ff', 'center', '600');

  text(ctx, 'TRAINING', 650, 80, 48, '#ffe14d', 'center', '900');
  text(ctx, `Before level ${Game.levelIndex + 2}: ${LEVELS[Game.levelIndex + 1].name}`, 650, 110, 16, '#ffffff', 'center', '600');
  text(ctx, `${Game.money} coins`, 650, 143, 24, '#ffe680', 'center', '800');

  const rows = trainRows();
  const rowH = rows.length > 5 ? 54 : 62, top0 = 166, boxH = rowH - 8;
  let y = top0;
  rows.forEach((row, i) => {
    const on = Game.trainSel === i;
    if (row.kind === 'up') {
      const tr = row.t;
      const lvl = Game.upgrades[tr.key];
      ctx.fillStyle = on ? 'rgba(255,225,77,0.16)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, tr.name, 486, y + boxH * 0.42, 18, tr.color, 'left', '800');
      text(ctx, tr.desc, 486, y + boxH * 0.8, 13, '#cfd8ff', 'left', '600');
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = k < lvl ? tr.color : 'rgba(255,255,255,0.15)';
        ctx.fillRect(660 + k * 16, y + 12, 12, 12);
      }
      const cost = lvl >= 5 ? 'MAX' : trainCost(lvl) + ' c';
      text(ctx, cost, 818, y + boxH * 0.8, 15, lvl < 5 && Game.money >= trainCost(lvl) ? '#ffe680' : '#888888', 'right', '700');
      y += rowH;
    } else if (row.kind === 'lead') {
      const c = CHARACTERS[Game.controlChar === 'raxas' ? 'raxas' : 'ren'];
      ctx.fillStyle = on ? 'rgba(200,150,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, boxH);
      if (on) { ctx.strokeStyle = '#c99bff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, boxH); }
      text(ctx, 'Lead fighter', 486, y + boxH * 0.42, 18, '#c99bff', 'left', '800');
      text(ctx, 'who you control at the start (C switches)', 486, y + boxH * 0.8, 13, '#cfd8ff', 'left', '600');
      text(ctx, '⇄ ' + c.name, 818, y + boxH * 0.62, 18, c.color, 'right', '800');
      y += rowH;
    } else {
      ctx.fillStyle = on ? 'rgba(120,230,255,0.2)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(470, y, 360, 42);
      if (on) { ctx.strokeStyle = '#9fe6ff'; ctx.lineWidth = 2; ctx.strokeRect(470, y, 360, 42); }
      text(ctx, (on ? '▶ ' : '') + 'Continue to the next level', 650, y + 28, 19, '#9fe6ff', 'center', '800');
    }
  });
  text(ctx, '↑ ↓ choose · ENTER / J select', 650, y + 64, 14, '#cfd8ff', 'center', '600');
  if (Game.trainMsg) text(ctx, Game.trainMsg.text, 650, Math.min(y + 92, 532), 20, Game.trainMsg.color || '#ff8080', 'center', '800');
}

function drawUI(ctx) {
  switch (Game.state) {
    case 'MENU':
      drawMenu(ctx);
      break;
    case 'TRAINING':
      drawTraining(ctx);
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
        drawOverlay(ctx, 'THE END', 'The Hollow King is gone - light returns to the world!', [
          '◆ All 5 Hollow Seals broken',
          'Ren and Raxas - legends of light and shadow',
          recLine,
          'Thanks for playing!',
          go ? 'ENTER - back to menu' : '',
        ], '#ffe14d');
      } else {
        const act2 = actOf(Game.levelIndex) === 2;
        const actEnd = actOf(Game.levelIndex + 1) !== actOf(Game.levelIndex);
        const lines = [act2 ? `◆ Hollow Seal broken  (${Game.crystals}/5)` : `★ Star Crystal recovered  (${Game.crystals}/5)`];
        if (lvl.unlockText) lines.push('✦ Unlocked: ' + lvl.unlockText);
        if (actEnd) lines.push('...but a darker power is waking up. ACT 2 begins!');
        lines.push(`Coins: ${Game.money} - spend them on training!`);
        lines.push(recLine);
        lines.push(go ? 'ENTER - go to training' : '');
        drawOverlay(ctx, actEnd ? 'ACT 1 COMPLETE!' : `LEVEL ${Game.levelIndex + 1} COMPLETE!`, actEnd ? 'Vorg is defeated - the Star Crystals are safe' : lvl.name + ' is safe', lines, '#ffe14d');
      }
      break;
    }
  }
}
