'use strict';
// Lygiai: dialogai, priešų bangos, formų atrakinimas ir bosai.

const L = (who, text) => ({ who, text });

const LEVELS = [
  // ---------- 1. Kalnų vienuolynas ----------
  {
    name: 'Kalnų vienuolynas', theme: 'monastery', crystals: 1, unlockStart: 0, unlockText: 'Liepsnos forma',
    script: [
      { type: 'dialog', lines: [
        L('', 'Ramus rytas kalnų vienuolyne. Kai treniruojasi po kriokliu...'),
        L('Meistras Oro', 'Kai, tavo Ki šiandien neramus...'),
        L('', 'Dangų perskrodžia ugnies kamuolys. Žemė sudreba!'),
        L('Vorgas', 'Planetos gyventojai! Žvaigždžių kristalai dabar mano. Per septynias dienas jūsų pasaulis priklausys man!'),
        L('Meistras Oro', 'Jo žvalgai jau vienuolyno kieme! Kai, parodyk, ko išmokai!'),
        L('Kai', 'Ne, jei aš turiu ką pasakyti!'),
        L('Valdymas', '← → judėti · ↑ šokti (laikyk ore – skristi) · J smūgis · K Ki šūvis · L laikyk ir paleisk – KI BANGA · S kaupti Ki'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['scout', 'L'], ['scout', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', unlock: 1, lines: [
        L('Meistras Oro', 'Kai! Jaučiu, kaip tavyje bunda žvaigždžių kraujas!'),
        L('Kai', 'Kas... kas man darosi?! Visas kūnas dega!'),
        L('Meistras Oro', 'Paleisk tą jėgą! Kai geltona Jėgos juosta pilna – spausk T!'),
        L('ATRAKINTA', 'LIEPSNOS FORMA: +50 % žala, greitesnis judėjimas, platesnė Ki Banga. Trunka, kol yra Jėgos.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['gunner', 'L'], ['scout', 'L'], ['gunner', 'R'], ['scout', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Raxas', 'Hm. Taigi tu tas berniukas, kuris išdaužė mano žvalgus.'),
        L('Raxas', 'Aš – Raxas, greičiausias Vorgo kardas. Kristalo tu negausi!'),
        L('Kai', 'Pažiūrėsim, ar tavo kardas greitesnis už mano Ki Bangą!'),
        L('Patarimas', 'Kai Raxas kaupia violetinę energiją – laikyk L. Prasidės bangų kova: greitai spaudinėk L!'),
      ] },
      { type: 'boss', bosses: [['raxas']] },
      { type: 'dialog', lines: [
        L('Raxas', 'Neįmanoma... Vorgas... tavęs... nepaliks...'),
        L('', 'Raxas pabėga, palikęs Žvaigždžių kristalą.'),
        L('Meistras Oro', 'Puiku, Kai! Bet tai tik pradžia. Liko dar šeši kristalai.'),
        L('Kai', 'Vorgai, aš ateinu!'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 2. Dykumų kanjonas ----------
  {
    name: 'Dykumų kanjonas', theme: 'desert', crystals: 2, unlockStart: 1,
    script: [
      { type: 'dialog', lines: [
        L('', 'Dykumų kanjonas. Karštis tvyro virš raudonų uolų.'),
        L('Kai', 'Raxas minėjo, kad du kristalai paslėpti kažkur kanjone...'),
        L('', 'Virš galvos ima zvimbti Vorgo dronai!'),
        L('Patarimas', 'Dronai skraido – šok arba skrisk (laikyk ↑) ir šauk į juos Ki šūviais ar banga.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'R'], ['gunner', 'L'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'L'], ['scout', 'R'], ['drone', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Zul', 'Ei, Zel, žiūrėk – mažylis atėjo pasiimti kristalų!'),
        L('Zel', 'Tai duokim jam... po smūgį iš kiekvieno!'),
        L('Kai', 'Du prieš vieną? Tiek to – vis tiek pralaimėsit!'),
        L('Patarimas', 'Zul puola iš arti, Zel šaudo iš toli. Nugalėjus vieną, kitas įsiunta!'),
      ] },
      { type: 'boss', bosses: [['zul', W - 120], ['zel', W - 300]] },
      { type: 'dialog', lines: [
        L('Zul', 'Mes... dar sugrįšim...'),
        L('', 'Dvyniai pabėga. Kai paima du Žvaigždžių kristalus.'),
        L('Kai', 'Jau trys! Kitas – Ledynų miestas.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 3. Ledynų miestas ----------
  {
    name: 'Ledynų miestas', theme: 'ice', crystals: 1, unlockStart: 1, unlockText: 'Audros forma',
    script: [
      { type: 'dialog', lines: [
        L('', 'Ledynų miestas. Gatvėmis žygiuoja šarvuoti Vorgo kariai.'),
        L('Gyventoja', 'Prašau, padėk! Generolas Krag užėmė miesto bokštą!'),
        L('Kai', 'Nesijaudink. Aš juo pasirūpinsiu.'),
        L('Patarimas', 'Šarvuoti kariai blokuoja Ki iš priekio. Mušk smūgiais, pulk iš nugaros arba naudok 3 lygio Ki Bangą!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['armored', 'L'], ['gunner', 'R'], ['drone', 'R'], ['armored', 'R']] },
      { type: 'dialog', unlock: 2, lines: [
        L('Kai', 'Šaltis... bet viduje kažkas verda... Dangus griaudžia!'),
        L('Meistras Oro', 'Kai, girdžiu tave per Ki. Tavo jėga peržengė Liepsnos ribą!'),
        L('ATRAKINTA', 'AUDROS FORMA: +100 % žala, smūgiai skelia žaibus į kitus priešus, Ki atsistato 2× greičiau. Spausk T!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['armored', 'L'], ['scout', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Generolas Krag', 'MANO SKYDO DAR NIEKAS NEPRAMUŠĖ!'),
        L('Kai', 'Viskas kada nors būna pirmą kartą.'),
        L('Patarimas', 'Skydas sulaiko Ki iš priekio. Kai Krag atsitrenkia į sieną – jis apsvaigsta. Tada pulk!'),
      ] },
      { type: 'boss', bosses: [['krag']] },
      { type: 'dialog', lines: [
        L('Generolas Krag', 'Mano... skydas...'),
        L('', 'Miestas laisvas! Kai gauna dar vieną kristalą.'),
        L('Kai', 'Keturi! Liko Ugnikalnio sala ir pats Vorgas.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 4. Ugnikalnio sala ----------
  {
    name: 'Ugnikalnio sala', theme: 'volcano', crystals: 2, unlockStart: 2, saved: 'išgelbėta',
    script: [
      { type: 'dialog', lines: [
        L('', 'Ugnikalnio sala. Lava teka kaip upės, ore tvyro sieros kvapas.'),
        L('Kai', 'Kažkas mane stebi... jaučiu keistą Ki.'),
        L('Nyx', 'Cha cha... sveikas atvykęs į mano iliuzijų salą, berniuk.'),
        L('Patarimas', 'Riedantys robotai sprogsta šalia tavęs – sunaikink juos iš toli!'),
      ] },
      { type: 'wave', enemies: [['brute', 'R'], ['bomber', 'L'], ['brute', 'L']] },
      { type: 'wave', enemies: [['bomber', 'R'], ['bomber', 'L'], ['brute', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'wave', enemies: [['brute', 'L'], ['armored', 'R'], ['bomber', 'R'], ['brute', 'R'], ['drone', 'L'], ['bomber', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Nyx', 'Kuri iš mūsų tikroji? Spėk!'),
        L('Kai', 'Tikroji ta, kurios Ki stipriausias!'),
        L('Patarimas', 'Nyx teleportuojasi ir kuria klonus. Klonai žūva nuo vieno smūgio.'),
      ] },
      { type: 'boss', bosses: [['nyx']] },
      { type: 'dialog', lines: [
        L('Nyx', 'Ne... mano iliuzijos... sudužo...'),
        L('', 'Kai paima du kristalus. Danguje pasirodo milžiniškas Vorgo laivas.'),
        L('Vorgas', 'Įspūdinga, žemės kirmine. Ateik į mano laivą – ten ir mirsi.'),
        L('Kai', 'Ateinu, Vorgai!'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 5. Vorgo laivas ----------
  {
    name: 'Vorgo laivas orbitoje', theme: 'ship', crystals: 1, unlockStart: 2, unlockText: 'Dangaus ir Žvaigždžių formos',
    script: [
      { type: 'dialog', lines: [
        L('', 'Vorgo laivas orbitoje. Pro langą matyti visa planeta.'),
        L('Kai', 'Šeši kristalai saugūs. Paskutinis – pas Vorgą.'),
        L('', 'Sirenos kaukia. Elitinė gvardija bėga link Kai!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['drone', 'L'], ['elite', 'L']] },
      { type: 'wave', enemies: [['elite', 'L'], ['armored', 'R'], ['bomber', 'R'], ['elite', 'R']] },
      { type: 'dialog', unlock: 3, lines: [
        L('Kai', 'Viskas, ką išmokau... Meistras, draugai, visa planeta... jaučiu jų Ki!'),
        L('', 'Kai aura nusidažo ramia mėlyna spalva.'),
        L('ATRAKINTA', 'DANGAUS FORMA: +200 % žala, Ki Banga kaupiasi 2× greičiau, teleportas – dukart spausk ← arba →. Spausk T!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['elite', 'L'], ['drone', 'R'], ['armored', 'L'], ['gunner', 'R'], ['elite', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Vorgas', 'Tad tu tas, kuris sutrypė mano generolus. Įdomu.'),
        L('Vorgas', 'Septintas kristalas mano rankoje. Kai jį panaudosiu – tavo planeta virs dulkėmis.'),
        L('Kai', 'Tai bus paskutinė tavo kova, Vorgai!'),
        L('Patarimas', 'Vorgas turi tris fazes. Pabaigoje laimėk paskutinę bangų kovą!'),
      ] },
      { type: 'boss', bosses: [['vorg']] },
      { type: 'dialog', lines: [
        L('Vorgas', 'Neįmanoma... aš... visatos valdovas...'),
        L('', 'Galinga Žvaigždžių banga nusviedžia Vorgą į gilų kosmosą. Laivas ima griūti.'),
        L('Kai', 'Septyni kristalai... Mano noras – kad planeta vėl būtų rami.'),
        L('Meistras Oro', 'Tu tapai tikru kariu, Kai. Grįžk namo.'),
      ] },
      { type: 'victory' },
    ],
  },
];

function crystalsBefore(levelIndex) {
  let n = 0;
  for (let i = 0; i < levelIndex; i++) n += LEVELS[i].crystals;
  return n;
}

// Pradeda lygį. fromStep > 0 – nuo kontrolinio taško. Taškus nunulina kviečiantysis.
function startLevel(levelIndex = 0, fromStep = 0) {
  const lvl = LEVELS[levelIndex];
  Game.levelIndex = levelIndex;
  Game.theme = lvl.theme;
  Game.enemies = [];
  Game.bosses = [];
  Game.projectiles = [];
  Game.beams = [];
  Game.bolts = [];
  Game.coins = [];
  Game.particles = [];
  Game.floaters = [];
  Game.clash = null;
  Game.banner = null;
  Game.hint = null;
  Game.combo = 0;
  Game.slowmo = 0;
  Game.hitstop = 0;
  Game.crystals = crystalsBefore(levelIndex);
  Game.player = new Player();
  Game.script = lvl.script;
  if (fromStep === 0) {
    Game.levelStartScore = Game.score;
    Game.checkpoint = 0;
    Game.checkpointScore = Game.score;
  } else {
    Game.score = Game.checkpointScore;
  }
  // formos, atrakintos ankstesniuose lygiuose ir praeituose žingsniuose
  let unlocked = lvl.unlockStart;
  for (let i = 0; i < fromStep; i++) if (lvl.script[i].unlock) unlocked = Math.max(unlocked, lvl.script[i].unlock);
  Game.player.unlocked = unlocked;
  if (unlocked > 0) Game.player.power = 100;
  saveProgress(levelIndex);
  saveRun();
  Sfx.music(lvl.theme);
  Game.step = fromStep - 1;
  setState('PLAY');
  showBanner(`${levelIndex + 1} LYGIS`, lvl.name, 2.0);
  nextStep();
}

function nextStep() {
  Game.step++;
  const s = Game.script[Game.step];
  if (!s) return;
  Game.cur = { s, t: 0, spawned: 0, spawnT: 0, clearT: 0 };
  if (s.checkpoint) { Game.checkpoint = Game.step; Game.checkpointScore = Game.score; }
  const waves = Game.script.filter((x) => x.type === 'wave');
  switch (s.type) {
    case 'dialog':
      openDialog(s.lines, () => {
        if (s.unlock) {
          Game.player.unlock(s.unlock);
          showHint('Spausk T – transformacija!', 3);
        }
        nextStep();
      });
      break;
    case 'wave': {
      const n = waves.indexOf(s) + 1;
      showBanner(`BANGA ${n}/${waves.length}`, 'Nugalėk Vorgo karius!', 1.8);
      break;
    }
    case 'boss': {
      const p = Game.player;
      p.x = 200; p.facing = 1;
      p.hp = p.maxHp;
      Game.bosses = s.bosses.map(([id, x]) => new Boss(id, x));
      Sfx.music(Game.bosses.some((b) => b.id === 'vorg') ? 'final' : 'boss');
      const names = Game.bosses.map((b) => b.name).join(' IR ');
      showBanner('BOSAS: ' + names, Game.bosses.length === 1 ? Game.bosses[0].def.title : 'Dvyniai', 2.0);
      break;
    }
    case 'victory':
      collectAllCoins();
      saveRun();
      Sfx.music(null);
      Game.crystals = crystalsBefore(Game.levelIndex + 1);
      if (Game.levelIndex + 1 < LEVELS.length) saveProgress(Game.levelIndex + 1);
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
      if (c.clearT > 1.2) {
        const p = Game.player;
        if (p.alive && p.hp < p.maxHp) {
          p.hp = Math.min(p.maxHp, p.hp + 15);
          floater(p.x, p.y - 100, '+15 HP', '#6dff8a', 18);
        }
        nextStep();
      }
    }
  } else if (s.type === 'boss') {
    const allDead = Game.bosses.length > 0 && Game.bosses.every((b) => b.dead && b.stateT > 2.6);
    if (allDead) nextStep();
  }
}

// ---------- Dialogai ----------
function openDialog(lines, cb) {
  const p = Game.player;
  Sfx.chargeStop();
  if (p && ['charging', 'firing', 'kicharge', 'punch', 'blast', 'transform', 'hurt'].includes(p.state)) {
    if (p.state === 'transform') p.form = p.transformTo;
    p.setState('normal');
  }
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
