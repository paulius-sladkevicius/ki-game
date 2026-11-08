'use strict';
// Levels: dialogs, enemy waves, form unlocks and bosses.

const L = (who, text) => ({ who, text });

const LEVELS = [
  // ---------- 1. Mountain Monastery ----------
  {
    name: 'Mountain Monastery', theme: 'monastery', crystals: 1, unlockStart: 0, unlockText: 'Flame Form',
    script: [
      { type: 'dialog', lines: [
        L('', 'A quiet morning at the mountain monastery. Ren is training under the waterfall...'),
        L('Master Oro', 'Ren, your Ki is restless today...'),
        L('', 'A ball of fire tears across the sky. The ground shakes!'),
        L('Vorg', 'People of this planet! Your five Star Crystals now belong to me. With their power, my flagship will bring your world to its knees!'),
        L('Master Oro', "His scouts are already in the courtyard! Ren, show them what you've learned!"),
        L('Ren', 'Not while I am here!'),
        L('Controls', '← → move · ↑ jump (hold in the air to fly) · J punch · K Ki blast · hold and release L for the KI WAVE · T transform'),
        L('Guard', 'Hold S to guard: the shield blocks hits from the front and charges your Ki, but uses GUARD energy. It refills when you stop guarding - if it runs out, your guard breaks!'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['scout', 'L'], ['scout', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', unlock: 1, lines: [
        L('Master Oro', 'Ren! I can feel a hidden power awakening inside you!'),
        L('Ren', "What... what's happening to me?! My whole body is burning!"),
        L('Master Oro', 'Let that power out! When the yellow Power bar is full, press T!'),
        L('UNLOCKED', 'FLAME FORM: +50% damage, faster movement, a wider Ki Wave. Lasts while you have Power.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['gunner', 'L'], ['scout', 'L'], ['gunner', 'R'], ['scout', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Raxas', 'Hm. So you are the boy who smashed my scouts.'),
        L('Raxas', "I am Raxas, Vorg's fastest blade. You will not get the crystal!"),
        L('Ren', "Let's see if your sword is faster than my Ki Wave!"),
        L('Tip', 'When Raxas charges up energy, hold L. A beam clash will start: mash L as fast as you can!'),
      ] },
      { type: 'boss', bosses: [['raxas']] },
      { type: 'dialog', lines: [
        L('Raxas', 'Impossible... Vorg... will not... spare you...'),
        L('', 'Raxas flees, leaving a Star Crystal behind.'),
        L('Master Oro', 'Well done, Ren! But this is only the beginning. Four crystals are still missing.'),
        L('Ren', "Vorg, I'm coming for you!"),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 2. Desert Canyon ----------
  {
    name: 'Desert Canyon', theme: 'desert', crystals: 1, unlockStart: 1,
    script: [
      { type: 'dialog', lines: [
        L('', 'The desert canyon. Heat shimmers over the red rocks.'),
        L('Ren', 'Raxas said the next crystal is hidden somewhere in this canyon...'),
        L('', "Vorg's drones start buzzing overhead!"),
        L('Tip', 'Drones fly - jump or fly (hold ↑) and hit them with Ki blasts or a wave.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'R'], ['gunner', 'L'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'L'], ['scout', 'R'], ['drone', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Zul', 'Hey Zel, look - the little one came for the crystal!'),
        L('Zel', "Then let's give him... a hit from each of us!"),
        L('Ren', "Two against one? Fine - you'll still lose!"),
        L('Tip', 'Zul fights up close, Zel shoots from afar. Defeat one and the other becomes enraged!'),
      ] },
      { type: 'boss', bosses: [['zul', W - 120], ['zel', W - 300]] },
      { type: 'dialog', lines: [
        L('Zul', "We'll... be back..."),
        L('', 'The twins run away. Ren picks up the second Star Crystal.'),
        L('Ren', 'Two down! Next stop - the Ice City.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 3. Ice City ----------
  {
    name: 'Ice City', theme: 'ice', crystals: 1, unlockStart: 1, unlockText: 'Storm Form',
    script: [
      { type: 'dialog', lines: [
        L('', "The Ice City. Vorg's armored soldiers march through the streets."),
        L('Villager', 'Please help us! General Krag has taken the city tower!'),
        L('Ren', "Don't worry. I'll take care of him."),
        L('Tip', 'Armored soldiers block Ki from the front. Use punches, attack from behind or use a level 3 Ki Wave!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['armored', 'L'], ['gunner', 'R'], ['drone', 'R'], ['armored', 'R']] },
      { type: 'dialog', unlock: 2, lines: [
        L('Ren', 'The cold... but something is boiling inside me... I can hear thunder!'),
        L('Master Oro', 'Ren, I can hear you through your Ki. Your power has gone beyond the Flame!'),
        L('UNLOCKED', 'STORM FORM: +100% damage, punches throw lightning to other enemies, 2x Ki regeneration. Press T!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['armored', 'L'], ['scout', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('General Krag', 'NO ONE HAS EVER BROKEN MY SHIELD!'),
        L('Ren', "There's a first time for everything."),
        L('Tip', 'The shield stops Ki from the front. When Krag charges into a wall he gets stunned - attack then!'),
      ] },
      { type: 'boss', bosses: [['krag']] },
      { type: 'dialog', lines: [
        L('General Krag', 'My... shield...'),
        L('', 'The city is free! Ren gets the third crystal.'),
        L('Ren', "Three! Only the Volcano Island and Vorg himself are left."),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 4. Volcano Island ----------
  {
    name: 'Volcano Island', theme: 'volcano', crystals: 1, unlockStart: 2,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Volcano Island. Lava flows like rivers and the air smells of sulfur.'),
        L('Ren', 'Someone is watching me... I can sense a strange Ki.'),
        L('Nyx', 'Ha ha... welcome to my island of illusions, boy.'),
        L('Tip', 'Rolling robots explode next to you - destroy them from a distance!'),
      ] },
      { type: 'wave', enemies: [['brute', 'R'], ['bomber', 'L'], ['brute', 'L']] },
      { type: 'wave', enemies: [['bomber', 'R'], ['bomber', 'L'], ['brute', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'wave', enemies: [['brute', 'L'], ['armored', 'R'], ['bomber', 'R'], ['brute', 'R'], ['drone', 'L'], ['bomber', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Nyx', 'Which one of us is real? Take a guess!'),
        L('Ren', 'The real one is the one with the strongest Ki!'),
        L('Tip', 'Nyx teleports and creates clones. Clones vanish after a single hit.'),
      ] },
      { type: 'boss', bosses: [['nyx']] },
      { type: 'dialog', lines: [
        L('Nyx', 'No... my illusions... are shattered...'),
        L('', "Ren takes the fourth crystal. Vorg's giant ship appears in the sky."),
        L('Vorg', 'Impressive, little warrior. Come to my ship - that is where you will fall.'),
        L('Ren', "I'm coming, Vorg!"),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 5. Vorg's Ship ----------
  {
    name: "Vorg's Ship in Orbit", theme: 'ship', crystals: 1, unlockStart: 2, unlockText: 'Sky and Star Forms',
    script: [
      { type: 'dialog', lines: [
        L('', "Vorg's ship in orbit. The whole planet can be seen through the window."),
        L('Ren', 'Four crystals are safe. The last one is with Vorg.'),
        L('', 'Sirens wail. The elite guard runs towards Ren!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['drone', 'L'], ['elite', 'L']] },
      { type: 'wave', enemies: [['elite', 'L'], ['armored', 'R'], ['bomber', 'R'], ['elite', 'R']] },
      { type: 'dialog', unlock: 3, lines: [
        L('Ren', "Everything I've learned... my master, my friends, the whole planet... I can feel their Ki!"),
        L('', "Ren's aura turns a calm teal."),
        L('UNLOCKED', 'SKY FORM: +200% damage, the Ki Wave charges 2x faster, teleport - double-tap ← or →. Press T!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['elite', 'L'], ['drone', 'R'], ['armored', 'L'], ['gunner', 'R'], ['elite', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Vorg', 'So you are the one who crushed my generals. Interesting.'),
        L('Vorg', 'The last crystal powers my planet-breaker. One shot and your world turns to dust.'),
        L('Ren', 'This will be your last fight, Vorg!'),
        L('Tip', 'Vorg has three phases. At the end, win the final beam clash!'),
      ] },
      { type: 'boss', bosses: [['vorg']] },
      { type: 'dialog', lines: [
        L('Vorg', 'Impossible... I am... the ruler of the stars...'),
        L('', 'A mighty Star Wave hurls Vorg into deep space. His ship starts to fall apart.'),
        L('Ren', 'All five crystals... It is time to take them home.'),
        L('Master Oro', 'You have become a true warrior, Ren. Come home.'),
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

// Starts a level. fromStep > 0 = from a checkpoint. The caller resets the score.
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
  // forms unlocked in earlier levels and in steps already passed
  let unlocked = lvl.unlockStart;
  for (let i = 0; i < fromStep; i++) if (lvl.script[i].unlock) unlocked = Math.max(unlocked, lvl.script[i].unlock);
  Game.player.unlocked = unlocked;
  if (unlocked > 0) Game.player.power = 100;
  saveProgress(levelIndex);
  saveRun();
  Sfx.music(lvl.theme);
  Game.step = fromStep - 1;
  setState('PLAY');
  showBanner(`LEVEL ${levelIndex + 1}`, lvl.name, 2.0);
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
          showHint('Press T to transform!', 3);
        }
        nextStep();
      });
      break;
    case 'wave': {
      const n = waves.indexOf(s) + 1;
      showBanner(`WAVE ${n}/${waves.length}`, "Defeat Vorg's soldiers!", 1.8);
      break;
    }
    case 'boss': {
      const p = Game.player;
      p.x = 200; p.facing = 1;
      p.hp = p.maxHp;
      Game.bosses = s.bosses.map(([id, x]) => new Boss(id, x));
      Sfx.music(Game.bosses.some((b) => b.id === 'vorg') ? 'final' : 'boss');
      const names = Game.bosses.map((b) => b.name).join(' & ');
      showBanner('BOSS: ' + names, Game.bosses.length === 1 ? Game.bosses[0].def.title : 'The twins', 2.0);
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

// ---------- Dialogs ----------
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
