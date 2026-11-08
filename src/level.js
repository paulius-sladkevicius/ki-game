'use strict';
// 1 lygis „Kalnų vienuolynas“: dialogai, priešų bangos ir bosas.

const INTRO = [
  { who: '', text: 'Ramus rytas kalnų vienuolyne. Kai treniruojasi po kriokliu...' },
  { who: 'Meistras Oro', text: 'Kai, tavo Ki šiandien neramus...' },
  { who: '', text: 'Dangų perskrodžia ugnies kamuolys. Žemė sudreba!' },
  { who: 'Vorgas', text: 'Planetos gyventojai! Žvaigždžių kristalai dabar mano. Per septynias dienas jūsų pasaulis priklausys man!' },
  { who: 'Meistras Oro', text: 'Jo žvalgai jau vienuolyno kieme! Kai, parodyk, ko išmokai!' },
  { who: 'Kai', text: 'Ne, jei aš turiu ką pasakyti!' },
  { who: 'Valdymas', text: '← → judėti · ↑ šokti (laikyk ore – skristi) · J smūgis · K Ki šūvis · L laikyk ir paleisk – KI BANGA · S kaupti Ki' },
];

const UNLOCK = [
  { who: 'Meistras Oro', text: 'Kai! Jaučiu, kaip tavyje bunda žvaigždžių kraujas!' },
  { who: 'Kai', text: 'Kas... kas man darosi?! Visas kūnas dega!' },
  { who: 'Meistras Oro', text: 'Paleisk tą jėgą! Kai geltona Jėgos juosta pilna – spausk T!' },
  { who: 'ATRAKINTA', text: 'LIEPSNOS FORMA: +50 % žala, greitesnis judėjimas, platesnė Ki Banga. Trunka, kol yra Jėgos.' },
];

const BOSS_INTRO = [
  { who: 'Raxas', text: 'Hm. Taigi tu tas berniukas, kuris išdaužė mano žvalgus.' },
  { who: 'Raxas', text: 'Aš – Raxas, greičiausias Vorgo kardas. Kristalo tu negausi!' },
  { who: 'Kai', text: 'Pažiūrėsim, ar tavo kardas greitesnis už mano Ki Bangą!' },
  { who: 'Patarimas', text: 'Kai Raxas kaupia violetinę energiją – laikyk L. Prasidės bangų kova: greitai spaudinėk L!' },
];

const OUTRO = [
  { who: 'Raxas', text: 'Neįmanoma... Vorgas... tavęs... nepaliks...' },
  { who: '', text: 'Raxas pabėga, palikęs Žvaigždžių kristalą.' },
  { who: 'Meistras Oro', text: 'Puiku, Kai! Bet tai tik pradžia. Liko dar šeši kristalai.' },
  { who: 'Kai', text: 'Vorgai, aš ateinu!' },
];

const LEVEL1 = [
  { type: 'dialog', lines: INTRO },
  { type: 'wave', title: 'BANGA 1/3', enemies: [['scout', 'R'], ['scout', 'L'], ['scout', 'R']] },
  { type: 'wave', title: 'BANGA 2/3', enemies: [['scout', 'L'], ['scout', 'R'], ['gunner', 'R'], ['scout', 'L']] },
  { type: 'dialog', lines: UNLOCK, onEnd: () => { const p = Game.player; p.flameUnlocked = true; p.power = 100; showHint('Spausk T – transformacija!', 3); } },
  { type: 'wave', title: 'BANGA 3/3', enemies: [['scout', 'R'], ['gunner', 'L'], ['scout', 'L'], ['gunner', 'R'], ['scout', 'R']] },
  { type: 'dialog', lines: BOSS_INTRO, checkpoint: true },
  { type: 'boss' },
  { type: 'dialog', lines: OUTRO },
  { type: 'victory' },
];

function startLevel(fromStep = 0) {
  Game.enemies = [];
  Game.boss = null;
  Game.projectiles = [];
  Game.beams = [];
  Game.particles = [];
  Game.floaters = [];
  Game.clash = null;
  Game.banner = null;
  Game.hint = null;
  Game.combo = 0;
  Game.slowmo = 0;
  Game.hitstop = 0;
  Game.player = new Player();
  Game.script = LEVEL1;
  if (fromStep === 0) {
    Game.score = 0;
    Game.checkpoint = 0;
    Game.checkpointScore = 0;
  } else {
    Game.score = Game.checkpointScore;
    // praėjus atrakinimą forma jau turima
    const unlockIdx = LEVEL1.findIndex((s) => s.lines === UNLOCK);
    if (fromStep > unlockIdx) { Game.player.flameUnlocked = true; Game.player.power = 100; }
  }
  Game.step = fromStep - 1;
  setState('PLAY');
  nextStep();
}

function nextStep() {
  Game.step++;
  const s = Game.script[Game.step];
  if (!s) return;
  Game.cur = { s, t: 0, spawned: 0, spawnT: 0, clearT: 0 };
  if (s.checkpoint) { Game.checkpoint = Game.step; Game.checkpointScore = Game.score; }
  switch (s.type) {
    case 'dialog':
      openDialog(s.lines, () => { if (s.onEnd) s.onEnd(); nextStep(); });
      break;
    case 'wave':
      showBanner(s.title, 'Nugalėk Vorgo žvalgus!', 1.8);
      break;
    case 'boss':
      Game.boss = new Boss();
      showBanner('BOSAS: RAXAS', 'Greičiausias Vorgo kardas', 2.0);
      break;
    case 'victory':
      saveHighScore();
      Sfx.victory();
      setState('VICTORY');
      break;
  }
}

function updateScript(dt) {
  const c = Game.cur;
  if (!c || Game.state !== 'PLAY') return;
  const s = c.s;
  c.t += dt;
  if (s.type === 'wave') {
    if (c.spawned < s.enemies.length) {
      c.spawnT -= dt;
      if (c.spawnT <= 0 && c.t > 1.2) {
        const [type, side] = s.enemies[c.spawned++];
        Game.enemies.push(new Enemy(type, side));
        c.spawnT = 0.9;
      }
    } else if (Game.enemies.every((e) => e.dead)) {
      c.clearT += dt;
      if (c.clearT > 1.2) nextStep();
    }
  } else if (s.type === 'boss') {
    if (Game.boss && Game.boss.dead && Game.boss.stateT > 2.6) nextStep();
  }
}

// ---------- Dialogai ----------
function openDialog(lines, cb) {
  const p = Game.player;
  Sfx.chargeStop();
  if (p && ['charging', 'firing', 'kicharge', 'punch', 'blast'].includes(p.state)) p.setState('normal');
  Game.beams = [];
  Game.projectiles = [];
  Game.dialog = { lines, i: 0, chars: 0, cb };
  setState('DIALOG');
}

function updateDialog(dt) {
  const d = Game.dialog;
  if (!d) return;
  const line = d.lines[d.i];
  d.chars += 70 * dt;
  const I = Input.pressed;
  if ((I.confirm || I.jump || I.punch) && Game.stateT > 0.15) {
    if (d.chars < line.text.length) {
      d.chars = line.text.length;
    } else {
      d.i++;
      d.chars = 0;
      Sfx.select();
      if (d.i >= d.lines.length) {
        Game.dialog = null;
        setState('PLAY');
        d.cb();
      }
    }
  }
}
