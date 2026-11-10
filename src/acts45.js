'use strict';
// Acts 4 and 5: levels 16-25 with their looks, enemies, bosses and backgrounds.
// Everything here extends the tables of the earlier files (STYLES, ENEMY_DEFS, BOSS_DEFS, BG_BUILDERS, LEVELS...).

// ---------- looks ----------
Object.assign(HAIR, {
  hat: [[14, -5], [14, -9], [8, -9], [6, -19], [-6, -19], [-8, -9], [-14, -9], [-14, -5]],
  crown: [[9, -6], [10, -18], [5, -11], [0, -20], [-5, -11], [-10, -18], [-9, -6]],
  fin: [[7, -6], [1, -9], [-4, -25], [-11, -8], [-9, -1], [-5, -6]],
});

Object.assign(STYLES, {
  // act 4 enemies
  pirate: { gi: '#2a3a4a', under: '#d8d0b0', belt: '#a03030', pants: '#1a2632', boots: '#3a2a1a', arm: '#7fd0c0', skin: '#7fd0c0', band: '#a03030', hair: 'hat', hairColor: '#1a1a22', sword: true },
  crab: { gi: '#b03a2a', under: '#5a1a12', belt: '#e0a060', pants: '#8a2a1e', boots: '#5a1a12', arm: '#d05a40', skin: '#e88a6a', band: '#e0a060', hair: 'helmet', hairColor: '#b03a2a', visor: '#ffe14d', shield: true },
  // act 5 enemies
  sentinel: { gi: '#d8e0f0', under: '#3a5a9a', belt: '#40e0ff', pants: '#a8b4cc', boots: '#3a5a9a', arm: '#d8e0f0', skin: '#b8c4dc', band: '#40e0ff', hair: 'helmet', hairColor: '#e8f0ff', visor: '#40e0ff' },
  knight: { gi: '#f0e0a0', under: '#8a6a1a', belt: '#ffffff', pants: '#c8b060', boots: '#8a6a1a', arm: '#f0e0a0', skin: '#e8d8b8', band: '#ffffff', hair: 'helmet', hairColor: '#f8ecb0', visor: '#ff5a4a', sword: true },
  // act 4 bosses
  brine: { gi: '#3a1a2a', under: '#e8e0c8', belt: '#c8a640', pants: '#22101a', boots: '#1a1a1a', arm: '#3a1a2a', skin: '#8fe0d0', band: '#c8a640', hair: 'hat', hairColor: '#12121a', sword: true },
  krakessa: { gi: '#3a1a5a', under: '#ff70b0', belt: '#ff70b0', pants: '#2a1040', boots: '#ff70b0', arm: '#c890e0', skin: '#c890e0', band: '#ff70b0', hair: 'long', hairColor: '#7a30c0' },
  lumen: { gi: '#0a1420', under: '#60ffd0', belt: '#60ffd0', pants: '#060c14', boots: '#143040', arm: '#1a3040', skin: '#2a4a5a', band: '#60ffd0', hair: 'horns', hairColor: '#60ffd0' },
  fin: { gi: '#3a5a7a', under: '#e8f0f8', belt: '#1a2a3a', pants: '#2a4460', boots: '#1a2a3a', arm: '#8ab0d0', skin: '#8ab0d0', band: '#e8f0f8', hair: 'fin', hairColor: '#5a7a9a' },
  gill: { gi: '#7a3a5a', under: '#f8e8f0', belt: '#3a1a2a', pants: '#60284a', boots: '#3a1a2a', arm: '#d08ab0', skin: '#d08ab0', band: '#f8e8f0', hair: 'fin', hairColor: '#9a5a7a' },
  maelor: { gi: '#1a4a5a', under: '#ffd34a', belt: '#ffd34a', pants: '#123a48', boots: '#ffd34a', arm: '#5ac0c0', skin: '#5ac0c0', band: '#ffd34a', hair: 'crown', hairColor: '#ffd34a' },
  maelor2: { gi: '#0a2030', under: '#40ffe0', belt: '#40ffe0', pants: '#061620', boots: '#40ffe0', arm: '#208a8a', skin: '#208a8a', band: '#40ffe0', hair: 'crown', hairColor: '#40ffe0' },
  // act 5 bosses
  rok: { gi: '#5a4a40', under: '#ff7a2a', belt: '#ff7a2a', pants: '#4a3a30', boots: '#2a2018', arm: '#7a6a5a', skin: '#8a7a6a', band: '#ff7a2a', hair: 'helmet', hairColor: '#4a3a30', visor: '#ff7a2a' },
  zero: { gi: '#e8e8f0', under: '#ff4060', belt: '#30303a', pants: '#c0c0cc', boots: '#30303a', arm: '#e8e8f0', skin: '#c8c8d4', band: '#ff4060', hair: 'helmet', hairColor: '#f4f4fa', visor: '#ff4060' },
  solara: { gi: '#f8e0a0', under: '#ff8a2a', belt: '#ff8a2a', pants: '#e8c070', boots: '#ff8a2a', arm: '#f0c8a0', skin: '#f0c8a0', band: '#ff8a2a', hair: 'flame', hairColor: '#ffb030' },
  nova: { gi: '#16161e', under: '#ff3050', belt: '#ff3050', pants: '#0e0e14', boots: '#ff3050', arm: '#16161e', skin: '#d8d0c8', band: '#ff3050', hair: 'helmet', hairColor: '#20202a', visor: '#ff3050', sword: true, shield: true },
  zenith: { gi: '#fffbe8', under: '#ffd34a', belt: '#ffd34a', pants: '#f0e8c8', boots: '#ffd34a', arm: '#fff4d0', skin: '#fff4d0', band: '#ffd34a', hair: 'storm', hairColor: '#fff0a0' },
  zenith2: { gi: '#201810', under: '#ffd34a', belt: '#ffd34a', pants: '#140e08', boots: '#ffd34a', arm: '#ffe8a0', skin: '#ffe8a0', band: '#ffd34a', hair: 'storm', hairColor: 'rainbow' },
});

Object.assign(BEAM_COLORS, {
  tide: ['rgba(30,160,200,A)', 'rgba(180,250,255,A)'],
  sun: ['rgba(255,170,20,A)', 'rgba(255,250,200,A)'],
  light: ['rgba(255,235,150,A)', 'rgba(255,255,255,A)'],
});

// ---------- enemies ----------
Object.assign(ENEMY_DEFS, {
  // act 4: the drowned world
  pirate: { hp: 95, speed: 160, windup: 0.34, dmg: 12, style: 'pirate', score: 450, ai: 'elite', cd: [0.9, 1.5] },
  jelly: { hp: 45, speed: 120, windup: 0.55, dmg: 12, score: 350, ai: 'drone', dive: true, look: 'jelly', cd: [2.0, 3.0], w: 34, h: 34 },
  crab: { hp: 150, speed: 85, windup: 0.6, dmg: 15, style: 'crab', score: 500, ai: 'melee', cd: [1.3, 2.0], block: true, heavy: true, scale: 1.2, w: 40, h: 90 },
  // act 5: the First Light
  sentinel: { hp: 70, speed: 105, windup: 0.6, dmg: 9, style: 'sentinel', score: 450, ai: 'ranged', spread: 3, cd: [2.2, 3.2] },
  knight: { hp: 170, speed: 150, windup: 0.36, dmg: 14, style: 'knight', score: 600, ai: 'elite', cd: [1.0, 1.6], scale: 1.15, w: 34, h: 88 },
  comet: { hp: 26, speed: 290, windup: 0.5, dmg: 18, score: 250, ai: 'bomber', cd: [0, 0], w: 30, h: 30, trail: '#7fd0ff' },
});
Object.assign(COIN_VALUES, { pirate: 45, jelly: 35, crab: 50, sentinel: 45, knight: 60, comet: 25 });

// ---------- bosses ----------
Object.assign(BOSS_DEFS, {
  // act 4
  brine: { name: 'CAPTAIN BRINE', title: 'Ghost of the coral shore', style: 'brine', hp: 2600, scale: 1.2, score: 8000, coins: 380, summonType: 'pirate', gearLook: 'ball',
    attacks: ['dash', 'slash', 'gears'], rage: ['beam', 'summon', 'gears'], beamColor: 'tide', aura: 'rgba(60,220,200,A)' },
  krakessa: { name: 'KRAKESSA', title: 'Witch of the wrecks', style: 'krakessa', hp: 2700, scale: 1.25, score: 8500, coins: 400, pillarKind: 'tentacle', want: 300,
    attacks: ['pillars', 'orbs', 'tornado'], rage: ['beam', 'pillars', 'orbs', 'tornado'], beamColor: 'shadow', aura: 'rgba(160,80,255,A)' },
  lumen: { name: 'LUMEN', title: 'The light in the deep', style: 'lumen', hp: 2800, scale: 1.3, score: 9000, coins: 420, alwaysAura: true,
    attacks: ['darkness', 'dash', 'teleport'], rage: ['beam', 'orbs', 'darkness', 'dash'], beamColor: 'tide', aura: 'rgba(90,255,210,A)' },
  fin: { name: 'FIN', title: 'The blue hunter', style: 'fin', hp: 1500, scale: 1.1, score: 5000, coins: 220,
    attacks: ['dash', 'leap', 'dive'], rage: ['fingers', 'beam'], beamColor: 'tide', aura: 'rgba(90,170,255,A)' },
  gill: { name: 'GILL', title: 'The red hunter', style: 'gill', hp: 1500, scale: 1.1, score: 5000, coins: 220, want: 320,
    attacks: ['fingers', 'tornado', 'teleport'], rage: ['beam', 'dash'], beamColor: 'nyx', aura: 'rgba(255,110,170,A)' },
  maelor: { name: 'TIDE KING MAELOR', title: 'Lord of the drowned world', style: 'maelor', hp: 5200, scale: 1.35, score: 18000, phases: true, alwaysAura: true, music: 'final4',
    phase2Style: 'maelor2', phase2Scale: 1.6, phase2Text: 'The sea rises!', phaseColor: '#40ffe0', summonType: 'pirate', pillarKind: 'tentacle',
    finalText: 'The tide turns!',
    attacks: ['tidal', 'orbs', 'teleport'], rage: ['beam', 'summon', 'tidal', 'pillars', 'dive'], beamColor: 'tide', aura: 'rgba(60,220,220,A)' },
  // act 5
  rok: { name: 'ROK', title: 'The meteor giant', style: 'rok', hp: 3000, scale: 1.65, score: 10000, coins: 440, speed: 100, rainLook: 'meteor',
    attacks: ['rain', 'charge', 'quake'], rage: ['beam', 'rain', 'leap'], beamColor: 'flame', aura: 'rgba(255,130,40,A)' },
  zero: { name: 'UNIT ZERO', title: 'Guardian of the comet station', style: 'zero', hp: 3000, scale: 1.15, score: 10500, coins: 460, summonType: 'sentinel', want: 300,
    attacks: ['lasers', 'orbs', 'teleport'], rage: ['beam', 'summon', 'lasers', 'timeslow'], beamColor: 'red', aura: 'rgba(255,60,90,A)' },
  solara: { name: 'SOLARA', title: 'Priestess of the sun', style: 'solara', hp: 3100, scale: 1.15, score: 11000, coins: 480, pillarKind: 'fire', want: 280,
    attacks: ['sunburst', 'pillars', 'teleport'], rage: ['beam', 'sunburst', 'dive'], beamColor: 'sun', aura: 'rgba(255,190,60,A)' },
  nova: { name: 'GENERAL NOVA', title: 'Sword of the black star', style: 'nova', hp: 3200, scale: 1.3, score: 12000, coins: 500, shield: true, summonType: 'knight', pillarKind: 'lightning',
    attacks: ['dash', 'slash', 'charge', 'leap'], rage: ['beam', 'summon', 'lightning'], beamColor: 'red', aura: 'rgba(255,50,80,A)' },
  zenith: { name: 'ZENITH', title: 'The first warrior', style: 'zenith', hp: 5000, scale: 1.35, score: 25000, phases: true, alwaysAura: true, music: 'final5',
    phase2Style: 'zenith2', phase2Scale: 1.6, phase2Text: 'The First Light burns!', phaseColor: '#ffe14d', summonType: 'knight', summonCount: 1, pillarKind: 'fire', rainLook: 'meteor',
    finalText: 'Every light you saved shines with you!',
    attacks: ['sunburst', 'lasers', 'orbs', 'teleport'], rage: ['beam', 'summon', 'rain', 'sunburst'], beamColor: 'light', aura: 'rgba(255,240,160,A)' },
});

// ---------- dialogs: portraits and name colors ----------
Object.assign(PORTRAITS, { 'Captain Brine': 'brine', 'Krakessa': 'krakessa', 'Lumen': 'lumen', 'Fin': 'fin', 'Gill': 'gill', 'Maelor': 'maelor', 'Rok': 'rok', 'Unit Zero': 'zero', 'Solara': 'solara', 'General Nova': 'nova', 'Zenith': 'zenith' });
Object.assign(SPEAKER_COLORS, { 'Captain Brine': '#8fe0d0', 'Krakessa': '#ff70b0', 'Lumen': '#60ffd0', 'Fin': '#8ab0d0', 'Gill': '#f0a0c8', 'Maelor': '#ffd34a', 'Rok': '#ff9a50', 'Unit Zero': '#ff6080', 'Solara': '#ffc050', 'General Nova': '#ff6070', 'Zenith': '#fff0a0' });

// ---------- backgrounds ----------
// Underwater helpers
function bgRays(g, color) {
  g.fillStyle = color;
  [[80, 60], [260, 90], [470, 70], [660, 100], [850, 60]].forEach(([x, w]) => {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 120, GROUND); g.lineTo(x + 60, GROUND); g.closePath(); g.fill();
  });
}
function bgCoral(g, x, h, c) {
  g.strokeStyle = c; g.lineCap = 'round';
  const branch = (bx, by, len, a, w) => {
    const ex = bx + Math.sin(a) * len, ey = by - Math.cos(a) * len;
    g.lineWidth = w; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke();
    if (len > 14) { branch(ex, ey, len * 0.65, a - 0.5, w * 0.7); branch(ex, ey, len * 0.65, a + 0.45, w * 0.7); }
  };
  branch(x, GROUND, h, 0, 9);
}
function bgWeed(g, x, h, c) {
  g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, GROUND);
  for (let i = 1; i <= 5; i++) g.lineTo(x + (i % 2 ? 9 : -9), GROUND - h * i / 5);
  g.stroke();
}

Object.assign(BG_BUILDERS, {
  // ----- act 4 -----
  reef(g) {
    bgSky(g, [[0, '#0a4a7a'], [0.55, '#1a8ab0'], [1, '#5ad0d0']]);
    bgRays(g, 'rgba(200,250,255,0.07)');
    bgPeaks(g, '#136a8a', [[0, 340], [130, 290], [260, 340], [400, 300], [540, 350], [690, 300], [840, 340], [960, 310]]);
    bgCoral(g, 110, 70, '#ff7a9a'); bgCoral(g, 300, 50, '#ffb060'); bgCoral(g, 640, 80, '#ff70c0'); bgCoral(g, 860, 60, '#ffd060');
    bgWeed(g, 200, 120, '#1f8a5a'); bgWeed(g, 470, 90, '#27a068'); bgWeed(g, 760, 130, '#1f8a5a');
    bgGround(g, '#e8d8a0', '#a08a58', '#f8ecc0', 'rgba(0,0,0,0)', false);
    g.fillStyle = 'rgba(160,130,80,0.45)';
    for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse((i * 83) % W, GROUND + 14 + (i * 29) % 56, 9, 3, 0, 0, Math.PI * 2); g.fill(); }
  },
  wrecks(g) {
    bgSky(g, [[0, '#051a26'], [0.6, '#0c3442'], [1, '#1a5560']]);
    bgRays(g, 'rgba(160,230,240,0.04)');
    // broken ship hulls
    const hull = (x, y, w, tilt, c) => {
      g.save(); g.translate(x, y); g.rotate(tilt); g.fillStyle = c;
      g.beginPath(); g.moveTo(-w / 2, -30); g.lineTo(w / 2, -30); g.quadraticCurveTo(w / 2 - 10, 40, 0, 46); g.quadraticCurveTo(-w / 2 + 10, 40, -w / 2, -30); g.fill();
      g.fillRect(-6, -190, 12, 160); g.fillRect(-70, -150, 140, 8); g.fillRect(w / 4, -120, 8, 90);
      g.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = -2; i <= 2; i++) g.fillRect(i * w / 6 - 8, -14, 16, 16);
      g.restore();
    };
    hull(200, 400, 300, -0.22, '#0a2028'); hull(700, 420, 340, 0.3, '#0c262e');
    g.strokeStyle = '#123a44'; g.lineWidth = 14; g.lineCap = 'round';
    [[420, 120], [520, 90], [880, 140], [60, 100]].forEach(([x, h]) => { g.beginPath(); g.moveTo(x, GROUND); g.quadraticCurveTo(x + 50, GROUND - h * 0.6, x - 10, GROUND - h); g.stroke(); });
    bgGround(g, '#2a4a48', '#0e1e20', '#4a7a70', 'rgba(0,0,0,0.3)', false);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 20; i++) g.fillRect((i * 97) % W, GROUND + 12 + (i * 31) % 60, 26, 4);
  },
  trench(g) {
    bgSky(g, [[0, '#010308'], [0.7, '#03101c'], [1, '#062434']]);
    bgPeaks(g, '#030c14', [[0, 300], [90, 180], [200, 320], [330, 220], [470, 340], [600, 200], [740, 330], [860, 210], [960, 300]]);
    // glowing plants
    const glow = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, c.replace('A', '0.9')); gr.addColorStop(1, c.replace('A', '0')); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    [[120, 380, 'rgba(80,255,210,A)'], [300, 410, 'rgba(120,180,255,A)'], [520, 370, 'rgba(80,255,210,A)'], [700, 400, 'rgba(200,120,255,A)'], [880, 380, 'rgba(120,180,255,A)']].forEach(([x, y, c]) => {
      g.strokeStyle = '#0c2a36'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, GROUND); g.quadraticCurveTo(x + 14, (y + GROUND) / 2, x, y); g.stroke();
      glow(x, y, 46, c);
    });
    bgGround(g, '#0a1c26', '#02080c', '#1a4a5a', 'rgba(0,0,0,0.4)', false);
    g.strokeStyle = 'rgba(80,255,210,0.55)'; g.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const x = 30 + i * 110; g.beginPath(); g.moveTo(x, GROUND + 8); g.lineTo(x + 16, GROUND + 30); g.lineTo(x + 4, GROUND + 52); g.stroke(); }
  },
  sunkencity(g) {
    bgSky(g, [[0, '#0a3a4a'], [0.6, '#1a7a80'], [1, '#6ad0c0']]);
    bgRays(g, 'rgba(220,255,250,0.07)');
    const col = (x, h, w = 34) => {
      g.fillStyle = '#b8e0d8'; g.fillRect(x, GROUND - h, w, h);
      g.fillStyle = '#8fc4bc'; g.fillRect(x + w * 0.6, GROUND - h, w * 0.4, h);
      g.fillStyle = '#d8f4ee'; g.fillRect(x - 8, GROUND - h - 12, w + 16, 14);
    };
    col(70, 260); col(220, 260); col(700, 260); col(850, 260);
    g.fillStyle = '#d8f4ee'; g.fillRect(50, GROUND - 300, 224, 30); g.fillRect(680, GROUND - 300, 224, 30);
    g.fillStyle = '#9fd0c8';
    g.beginPath(); g.arc(480, GROUND - 120, 150, Math.PI, 0); g.lineTo(630, GROUND); g.lineTo(330, GROUND); g.closePath(); g.fill();
    g.fillStyle = '#0a3a4a'; g.beginPath(); g.arc(480, GROUND - 30, 70, Math.PI, 0); g.lineTo(550, GROUND); g.lineTo(410, GROUND); g.closePath(); g.fill();
    [[150, 330, '#ff8ab0'], [780, 340, '#ffd070'], [480, 250, '#8affd0']].forEach(([x, y, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); });
    bgGround(g, '#c8ece4', '#6aa89e', '#f0fffa', 'rgba(40,110,110,0.3)');
  },
  throne(g) {
    bgSky(g, [[0, '#04141c'], [0.6, '#0a3440'], [1, '#14605c']]);
    // ribs of a leviathan arching over the hall
    g.strokeStyle = '#d8d0b8'; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const x = 60 + i * 140;
      g.lineWidth = 16 - Math.abs(i - 3) * 1.5;
      g.beginPath(); g.moveTo(x - 50, GROUND); g.quadraticCurveTo(x - 60, 60, 480, 30); g.stroke();
    }
    // shell throne
    g.fillStyle = '#e8b8c8';
    for (let i = -4; i <= 4; i++) { g.save(); g.translate(480, GROUND - 40); g.rotate(i * 0.2); g.beginPath(); g.ellipse(0, -110, 22, 110, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.fillStyle = '#b07a90'; g.fillRect(430, GROUND - 70, 100, 70);
    g.fillStyle = '#ffd34a'; g.fillRect(420, GROUND - 78, 120, 10);
    bgGround(g, '#12404a', '#04161c', '#ffd34a', 'rgba(255,211,74,0.15)');
  },

  // ----- act 5 -----
  asteroids(g) {
    g.fillStyle = '#04030c'; g.fillRect(0, 0, W, GROUND);
    bgStars(g, 160, GROUND, 0.9);
    // ringed planet
    const pl = g.createRadialGradient(170, 150, 10, 190, 170, 120);
    pl.addColorStop(0, '#ffc890'); pl.addColorStop(0.6, '#c06a40'); pl.addColorStop(1, '#3a1a14');
    g.fillStyle = pl; g.beginPath(); g.arc(190, 170, 100, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,220,170,0.7)'; g.lineWidth = 8;
    g.beginPath(); g.ellipse(190, 170, 170, 32, -0.3, 0, Math.PI * 2); g.stroke();
    const rock = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = r * (0.7 + ((i * 37 + x) % 10) / 30); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); } g.closePath(); g.fill(); };
    rock(520, 120, 46, '#4a4250'); rock(760, 230, 70, '#3a3440'); rock(900, 90, 30, '#5a5260'); rock(400, 300, 26, '#3a3440');
    bgGround(g, '#5a525c', '#221e26', '#8a8290', 'rgba(0,0,0,0.3)', false);
    g.fillStyle = 'rgba(0,0,0,0.3)';
    [[90, 20], [280, 34], [470, 16], [640, 40], [830, 24]].forEach(([x, r]) => { g.beginPath(); g.ellipse(x, GROUND + 34, r, r * 0.35, 0, 0, Math.PI * 2); g.fill(); });
  },
  station(g) {
    g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, GROUND);
    // three windows with the comet tail outside
    for (let i = 0; i < 3; i++) {
      const x = 90 + i * 290;
      g.save(); g.beginPath(); g.roundRect(x, 80, 200, 220, 20); g.clip();
      g.fillStyle = '#02030a'; g.fillRect(x, 80, 200, 220);
      const tail = g.createLinearGradient(0, 100, W, 260);
      tail.addColorStop(0, 'rgba(120,230,255,0)'); tail.addColorStop(0.5, 'rgba(120,230,255,0.5)'); tail.addColorStop(1, 'rgba(255,255,255,0.9)');
      g.fillStyle = tail; g.beginPath(); g.moveTo(0, 150); g.lineTo(W, 190); g.lineTo(W, 250); g.lineTo(0, 230); g.closePath(); g.fill();
      g.restore();
      g.strokeStyle = '#4a5468'; g.lineWidth = 8; g.beginPath(); g.roundRect(x, 80, 200, 220, 20); g.stroke();
    }
    g.fillStyle = '#1a2030'; g.fillRect(0, 0, W, 60); g.fillRect(0, 320, W, GROUND - 320);
    g.strokeStyle = '#3a4458'; g.lineWidth = 10;
    g.beginPath(); g.moveTo(0, 30); g.lineTo(W, 30); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 2;
    for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 320); g.lineTo(x, GROUND); g.stroke(); }
    bgGround(g, '#3a4458', '#141824', '#40e0ff', 'rgba(64,224,255,0.14)');
  },
  suntemple(g) {
    bgSky(g, [[0, '#ff9a2a'], [0.5, '#ffd060'], [1, '#fff4c8']]);
    // the sun and its rays
    const sun = g.createRadialGradient(480, 170, 20, 480, 170, 230);
    sun.addColorStop(0, '#ffffff'); sun.addColorStop(0.3, '#fff0a0'); sun.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = sun; g.beginPath(); g.arc(480, 170, 230, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(480, 170, 80, 0, Math.PI * 2); g.fill();
    const col = (x) => {
      g.fillStyle = '#f8e8b8'; g.fillRect(x, 140, 40, GROUND - 140);
      g.fillStyle = '#e0c888'; g.fillRect(x + 26, 140, 14, GROUND - 140);
      g.fillStyle = '#c8a640'; g.fillRect(x - 10, 126, 60, 16); g.fillRect(x - 10, GROUND - 16, 60, 16);
    };
    col(60); col(210); col(710); col(860);
    g.fillStyle = '#f0d898'; g.fillRect(40, 100, 880, 28);
    bgGround(g, '#fff0c8', '#d8b068', '#ffffff', 'rgba(180,130,40,0.25)');
  },
  citadel(g) {
    bgSky(g, [[0, '#0a0206'], [0.6, '#30081a'], [1, '#701828']]);
    bgStars(g, 40, 200, 0.4);
    // the black star
    const cor = g.createRadialGradient(480, 150, 50, 480, 150, 170);
    cor.addColorStop(0, 'rgba(255,60,90,0.9)'); cor.addColorStop(1, 'rgba(255,60,90,0)');
    g.fillStyle = cor; g.beginPath(); g.arc(480, 150, 170, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#04010a'; g.beginPath(); g.arc(480, 150, 62, 0, Math.PI * 2); g.fill();
    // walls with battlements and banners
    g.fillStyle = '#12080e';
    g.fillRect(0, 250, 300, GROUND - 250); g.fillRect(660, 250, 300, GROUND - 250); g.fillRect(300, 330, 360, GROUND - 330);
    for (let x = 0; x < W; x += 50) if (x < 300 || x >= 660) g.fillRect(x, 228, 30, 24);
    g.fillRect(90, 130, 70, 120); g.fillRect(800, 130, 70, 120);
    g.fillStyle = '#c0203a';
    [[60, 280], [220, 280], [700, 280], [860, 280]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y); g.lineTo(x + 40, y + 90); g.lineTo(x + 20, y + 74); g.lineTo(x, y + 90); g.closePath(); g.fill(); });
    bgGround(g, '#241018', '#0a0408', '#c0203a', 'rgba(192,32,58,0.2)');
  },
  origin(g) {
    bgSky(g, [[0, '#1a1040'], [0.5, '#6a4aa0'], [0.85, '#ffd8b0'], [1, '#fffbe8']]);
    bgStars(g, 90, 260, 0.8);
    const neb = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, c.replace('A', '0.5')); gr.addColorStop(1, c.replace('A', '0')); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    neb(180, 150, 200, 'rgba(255,120,200,A)'); neb(780, 130, 220, 'rgba(120,200,255,A)'); neb(480, 60, 180, 'rgba(255,230,140,A)');
    // the First Light: a ring of light
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 10; g.beginPath(); g.arc(480, 230, 110, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,230,150,0.6)'; g.lineWidth = 26; g.beginPath(); g.arc(480, 230, 110, 0, Math.PI * 2); g.stroke();
    neb(480, 230, 100, 'rgba(255,255,255,A)');
    bgGround(g, '#fffbe8', '#e0c890', '#ffffff', 'rgba(200,160,60,0.2)');
  },
});

// ---------- moving details ----------
function animBubbles(ctx, t, n, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  for (let i = 0; i < n; i++) {
    const x = (i * 137 + Math.sin(t * 1.2 + i) * 14) % W;
    const y = GROUND - ((t * (30 + (i % 5) * 9) + i * 61) % GROUND);
    ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2); ctx.stroke();
  }
}
Object.assign(BG_ANIM, {
  reef(ctx, t) {
    animBubbles(ctx, t, 26, 'rgba(230,255,255,0.6)');
    // small fish swimming by
    ctx.fillStyle = 'rgba(10,50,80,0.5)';
    for (let i = 0; i < 6; i++) {
      const dir = i % 2 ? 1 : -1;
      const x = dir > 0 ? (t * (40 + i * 9) + i * 190) % (W + 80) - 40 : W + 40 - (t * (40 + i * 9) + i * 190) % (W + 80);
      const y = 110 + i * 38 + Math.sin(t * 2 + i) * 8;
      ctx.beginPath(); ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - dir * 10, y); ctx.lineTo(x - dir * 20, y - 6); ctx.lineTo(x - dir * 20, y + 6); ctx.closePath(); ctx.fill();
    }
  },
  wrecks(ctx, t) {
    animBubbles(ctx, t, 14, 'rgba(180,230,230,0.4)');
    ctx.fillStyle = 'rgba(200,240,230,0.35)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + t * 14) % W, (i * 53 + Math.sin(t + i) * 20 + t * 6) % GROUND, 2, 2);
  },
  trench(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const x = (i * 113 + Math.sin(t * 0.6 + i) * 40) % W, y = 60 + (i * 67 + Math.cos(t * 0.5 + i * 2) * 30) % 380;
      ctx.fillStyle = `rgba(${i % 3 ? '90,255,210' : '170,150,255'},${0.25 + 0.35 * Math.sin(t * 2 + i)})`;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  },
  sunkencity(ctx, t) {
    animBubbles(ctx, t, 20, 'rgba(240,255,250,0.6)');
    ctx.globalCompositeOperation = 'lighter';
    [[150, 330, '255,138,176'], [780, 340, '255,208,112'], [480, 250, '138,255,208']].forEach(([x, y, c], i) => {
      ctx.fillStyle = `rgba(${c},${0.18 + 0.1 * Math.sin(t * 2 + i)})`;
      ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
    });
  },
  throne(ctx, t) {
    animBubbles(ctx, t, 10, 'rgba(220,255,250,0.4)');
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const a = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
      ctx.fillStyle = `rgba(255,240,200,${a * 0.8})`;
      ctx.beginPath(); ctx.arc(80 + i * 72, 300 + Math.sin(t + i) * 30, 3, 0, Math.PI * 2); ctx.fill();
    }
  },
  asteroids(ctx, t) {
    ctx.fillStyle = '#4a4452';
    for (let i = 0; i < 7; i++) {
      const x = W + 40 - (t * (20 + i * 7) + i * 170) % (W + 80), y = 40 + i * 48;
      ctx.beginPath(); ctx.ellipse(x, y, 7 + (i % 3) * 3, 5 + (i % 2) * 3, t * 0.5 + i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 10; i++) if (Math.sin(t * 3 + i * 2.1) > 0.6) ctx.fillRect((i * 211) % W, (i * 97) % 300, 2, 2);
  },
  station(ctx, t) {
    for (let i = 0; i < 8; i++) {
      const on = Math.floor(t * 2 + i * 0.6) % 3 !== 0;
      ctx.fillStyle = on ? (i % 2 ? '#ff4060' : '#40e0ff') : '#2a3040';
      ctx.fillRect(40 + i * 125, 338, 12, 8);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(120,230,255,${0.05 + 0.04 * Math.sin(t * 4)})`;
    for (let i = 0; i < 3; i++) ctx.fillRect(90 + i * 290, 80, 200, 220);
  },
  suntemple(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.save(); ctx.translate(480, 170); ctx.rotate(t * 0.15);
    ctx.fillStyle = 'rgba(255,240,160,0.12)';
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(-10, -90); ctx.lineTo(10, -90); ctx.lineTo(0, -250); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < 20; i++) {
      const x = (i * 131 + Math.sin(t + i) * 12) % W, y = GROUND - ((t * (28 + (i % 6) * 8) + i * 41) % GROUND);
      ctx.fillStyle = 'rgba(255,220,120,0.7)'; ctx.fillRect(x, y, 3, 3);
    }
  },
  citadel(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,60,90,${0.12 + 0.08 * Math.sin(t * 2)})`;
    ctx.beginPath(); ctx.arc(480, 150, 110 + Math.sin(t * 2) * 8, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 18; i++) {
      const x = (i * 151 + Math.sin(t * 2 + i) * 10) % W, y = GROUND - ((t * (40 + (i % 5) * 10) + i * 47) % GROUND);
      ctx.fillStyle = 'rgba(255,90,90,0.6)'; ctx.fillRect(x, y, 2, 2);
    }
  },
  origin(ctx, t) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const a = t * 0.7 + i * (Math.PI / 8);
      ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.4 * Math.sin(t * 3 + i)})`;
      ctx.beginPath(); ctx.arc(480 + Math.cos(a) * 110, 230 + Math.sin(a) * 110, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 26; i++) {
      const x = (i * 101 + Math.sin(t * 0.8 + i) * 16) % W, y = GROUND - ((t * (22 + (i % 6) * 6) + i * 43) % GROUND);
      ctx.fillStyle = 'rgba(255,245,200,0.7)'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  },
});

// ---------- levels 16-25 ----------
const ACT45_FRIENDS = { raxas: 1, nyx: 1 };

LEVELS.push(
  // ================= ACT 4: THE DROWNED WORLD =================

  // ---------- 16. Coral Shore ----------
  {
    name: 'Coral Shore', theme: 'reef', act: 4, crystals: 1, unlockStart: 3, ally: true, friend: 'raxas', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', "One of the worlds freed from Kaldra's mirrors was a drowned one. It fell into the ocean - and the sea began to rise."),
        L('Master Oro', 'The tide has reached the monastery steps, Ren. Something under the waves is pulling the whole ocean up.'),
        L('Raxas', 'I know that flag. Tidefall - a world that drowned long ago. Its king wants to drown ours too and build his kingdom again.'),
        L('Ren', 'Then we go down there and change his mind.'),
        L('Tip', "Five Tide Pearls hold the sea in place. New enemies: ghost pirates, armored crabs, and jellyfish that dive at you - watch for the '!' above them."),
      ] },
      { type: 'wave', enemies: [['pirate', 'R'], ['jelly', 'L'], ['pirate', 'L']] },
      { type: 'wave', enemies: [['crab', 'R'], ['jelly', 'R'], ['pirate', 'L'], ['jelly', 'L']] },
      { type: 'wave', enemies: [['pirate', 'R'], ['crab', 'L'], ['jelly', 'R'], ['pirate', 'L'], ['crab', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Captain Brine', "Arr! Fresh crew for my ghost ship! Ye'll be scrubbing the deck for a hundred years!"),
        L('Raxas', 'A sword fight? Finally, someone who speaks my language.'),
        L('Tip', 'Captain Brine fires bouncing cannonballs and calls his pirate crew to help him.'),
      ] },
      { type: 'boss', bosses: [['brine']] },
      { type: 'dialog', lines: [
        L('Captain Brine', 'Me ship... me beautiful ship...'),
        L('', "The first Tide Pearl rolls out of the captain's coat. The water drops a little."),
        L('Raxas', 'One. The next is in the place where ships go to die.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 17. Shipwreck Graveyard ----------
  {
    name: 'Shipwreck Graveyard', theme: 'wrecks', act: 4, crystals: 1, unlockStart: 3, ally: true, friend: 'raxas', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'A graveyard of ships from a thousand worlds, tangled in giant tentacles.'),
        L('Raxas', 'Stay away from anything that moves. And down here, everything moves.'),
      ] },
      { type: 'wave', enemies: [['crab', 'L'], ['pirate', 'R'], ['jelly', 'R']] },
      { type: 'wave', enemies: [['jelly', 'L'], ['jelly', 'R'], ['crab', 'R'], ['pirate', 'L']] },
      { type: 'wave', enemies: [['pirate', 'R'], ['pirate', 'L'], ['crab', 'L'], ['jelly', 'R'], ['wisp', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Krakessa', 'So many little ships in my collection... and now, two little heroes.'),
        L('Ren', 'We are not staying.'),
        L('Tip', 'Tentacles burst from the ground where it glows teal - keep moving! Jump over her whirlpools.'),
      ] },
      { type: 'boss', bosses: [['krakessa']] },
      { type: 'dialog', lines: [
        L('Krakessa', 'My collection... it is all floating away...'),
        L('', 'The second Tide Pearl. Below them, the water turns as black as night.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 18. Abyssal Trench ----------
  {
    name: 'Abyssal Trench', theme: 'trench', act: 4, crystals: 1, unlockStart: 3, ally: true, friend: 'raxas', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Abyssal Trench. No light has ever reached this deep.'),
        L('Ren', "I can't see a thing... wait. What is that glow?"),
        L('Raxas', 'Whatever it is, it wants us to come closer. So we will not.'),
      ] },
      { type: 'wave', enemies: [['jelly', 'R'], ['shade', 'L'], ['jelly', 'L']] },
      { type: 'wave', enemies: [['crab', 'R'], ['shade', 'L'], ['jelly', 'R'], ['wisp', 'L']] },
      { type: 'wave', enemies: [['shade', 'R'], ['jelly', 'L'], ['crab', 'L'], ['jelly', 'R'], ['shade', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Lumen', 'Come closer, little lights. Closer... closer...'),
        L('Tip', "Lumen puts out the light! You can only see around yourself - look for the small glow above Lumen's head."),
      ] },
      { type: 'boss', bosses: [['lumen']] },
      { type: 'dialog', lines: [
        L('Lumen', 'Too bright... you are too bright...'),
        L('', 'The third Tide Pearl shines in the dark like a tiny moon.'),
        L('Ren', 'Three. I can see marble down there - a whole city.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 19. Sunken City ----------
  {
    name: 'Sunken City', theme: 'sunkencity', act: 4, crystals: 1, unlockStart: 3, ally: true, friend: 'raxas', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Sunken City of Tidefall: streets of marble, lit by glowing coral.'),
        L('Raxas', 'The palace guard. Two of them - and they hunt as one.'),
      ] },
      { type: 'wave', enemies: [['pirate', 'R'], ['crab', 'L'], ['jelly', 'R'], ['pirate', 'L']] },
      { type: 'wave', enemies: [['crab', 'R'], ['crab', 'L'], ['jelly', 'L'], ['pirate', 'R'], ['jelly', 'R']] },
      { type: 'wave', enemies: [['pirate', 'L'], ['pirate', 'R'], ['crab', 'R'], ['jelly', 'L'], ['shade', 'R'], ['crab', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Fin', 'Smell that, Gill? Dry-landers.'),
        L('Gill', 'I call the small one!'),
        L('Tip', 'Fin attacks up close and dives from above, Gill shoots from afar. Defeat one and the other becomes enraged!'),
      ] },
      { type: 'boss', duoTitle: 'The shark brothers', bosses: [['fin', W - 120], ['gill', W - 300]] },
      { type: 'dialog', lines: [
        L('Gill', 'Fin... I do not want the small one anymore...'),
        L('', 'The fourth Tide Pearl. Beyond the city gate waits a throne built from the bones of a leviathan.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 20. Leviathan Throne ----------
  {
    name: 'Leviathan Throne', theme: 'throne', act: 4, crystals: 1, unlockStart: 3, ally: true, friend: 'raxas', allyUnlockStart: ACT45_FRIENDS, final: true,
    script: [
      { type: 'dialog', lines: [
        L('', 'The throne of Tidefall, built inside the ribs of a leviathan.'),
        L('Master Oro', 'Ren, the sea is at the monastery door. This is the last chance.'),
      ] },
      { type: 'wave', enemies: [['crab', 'R'], ['pirate', 'L'], ['jelly', 'R'], ['pirate', 'R'], ['jelly', 'L']] },
      { type: 'wave', enemies: [['pirate', 'L'], ['crab', 'R'], ['crab', 'L'], ['jelly', 'R'], ['shade', 'L'], ['pirate', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Maelor', 'My world drowned while kings like yours watched from their dry mountains.'),
        L('Maelor', 'Now every world will know the weight of the sea.'),
        L('Ren', 'Drowning us will not bring your kingdom back.'),
        L('Tip', 'Maelor sends tidal waves across the arena - jump or fly over them! Three phases, then the final beam clash: mash L!'),
      ] },
      { type: 'boss', bosses: [['maelor']] },
      { type: 'dialog', lines: [
        L('Maelor', 'The pearls... the tide is leaving me...'),
        L('', 'The sea sinks back. Where Tidefall fell, a new island rises from the water - green and alive.'),
        L('Raxas', 'Let him keep the island. A king needs a kingdom.'),
        L('Master Oro', 'Well done, both of you. But look up... the stars are going out. One by one.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ================= ACT 5: THE FIRST LIGHT =================

  // ---------- 21. Asteroid Belt ----------
  {
    name: 'Asteroid Belt', theme: 'asteroids', act: 5, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'Night after night, more stars go dark.'),
        L('Master Oro', 'All Ki comes from one place: the Origin, the First Light at the heart of the stars. Someone is drinking it dry.'),
        L('Nyx', 'I can open a path through the sky. But the gate of the Origin only opens for five Star Sparks.'),
        L('Ren', "Then let's go and light them."),
        L('Tip', 'New enemies: Star Knights, sentinels that fire three shots at once, and comets that race at you and explode.'),
      ] },
      { type: 'wave', enemies: [['knight', 'R'], ['sentinel', 'L'], ['comet', 'R']] },
      { type: 'wave', enemies: [['sentinel', 'R'], ['comet', 'L'], ['knight', 'L'], ['comet', 'R']] },
      { type: 'wave', enemies: [['knight', 'R'], ['knight', 'L'], ['sentinel', 'R'], ['comet', 'L'], ['sentinel', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Rok', 'SMALL. THINGS. BREAK.'),
        L('Nyx', 'Charming. Mind the sky, Ren.'),
        L('Tip', 'Rok calls down burning meteors - watch their shadows on the ground. When he charges into a wall he is stunned!'),
      ] },
      { type: 'boss', bosses: [['rok']] },
      { type: 'dialog', lines: [
        L('Rok', 'ROK... BREAK...'),
        L('', 'The giant crumbles into gravel. Inside him burns the first Star Spark.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 22. Comet Station ----------
  {
    name: 'Comet Station', theme: 'station', act: 5, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'An ancient station, riding on the tail of a comet.'),
        L('Nyx', 'Its builders are long gone. Its guardian is not.'),
      ] },
      { type: 'wave', enemies: [['sentinel', 'R'], ['sentinel', 'L'], ['comet', 'R'], ['knight', 'L']] },
      { type: 'wave', enemies: [['knight', 'R'], ['sniper', 'L'], ['sentinel', 'R'], ['comet', 'L'], ['comet', 'R']] },
      { type: 'wave', enemies: [['sentinel', 'L'], ['knight', 'R'], ['sniper', 'R'], ['comet', 'L'], ['knight', 'L'], ['sentinel', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Unit Zero', 'INTRUDERS DETECTED. PROTOCOL: REMOVE.'),
        L('Tip', 'Unit Zero fires lasers (jump over the low ones, stay on the ground for the high ones) and can slow down time.'),
      ] },
      { type: 'boss', bosses: [['zero']] },
      { type: 'dialog', lines: [
        L('Unit Zero', 'PROTOCOL... COMPLETE. THANK... YOU.'),
        L('', 'The second Star Spark floats out of the broken machine. The comet turns towards a distant sun.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 23. Sun Temple ----------
  {
    name: 'Sun Temple', theme: 'suntemple', act: 5, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'A temple floating in front of a sun, so bright it hurts to look at.'),
        L('Ren', "It's warm... like my own Ki."),
      ] },
      { type: 'wave', enemies: [['knight', 'R'], ['wisp', 'L'], ['comet', 'R'], ['sentinel', 'L']] },
      { type: 'wave', enemies: [['knight', 'L'], ['knight', 'R'], ['sentinel', 'R'], ['comet', 'L'], ['wisp', 'R']] },
      { type: 'wave', enemies: [['sentinel', 'R'], ['knight', 'L'], ['comet', 'R'], ['sentinel', 'L'], ['knight', 'R'], ['comet', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Solara', 'You carry a spark of the First Light, child. I am sorry. He told me to put it out.'),
        L('Ren', 'Who told you?'),
        L('Tip', "Solara's sunburst fires shots in every direction - guard, or fly through a gap. Flame pillars rise where the ground glows orange."),
      ] },
      { type: 'boss', bosses: [['solara']] },
      { type: 'dialog', lines: [
        L('Solara', 'Zenith... he was not always like this. He was the first to protect the Light.'),
        L('', 'Solara places the third Star Spark in Ren\'s hands.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 24. Black Star Citadel ----------
  {
    name: 'Black Star Citadel', theme: 'citadel', act: 5, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: ACT45_FRIENDS,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Black Star Citadel guards the gate of the Origin.'),
        L('Nyx', 'One more spark. And one last general.'),
      ] },
      { type: 'wave', enemies: [['knight', 'R'], ['knight', 'L'], ['sentinel', 'R'], ['sniper', 'L'], ['comet', 'R']] },
      { type: 'wave', enemies: [['sentinel', 'L'], ['knight', 'R'], ['comet', 'L'], ['knight', 'L'], ['sniper', 'R'], ['comet', 'R']] },
      { type: 'wave', enemies: [['knight', 'R'], ['sentinel', 'L'], ['knight', 'L'], ['comet', 'R'], ['sentinel', 'R'], ['knight', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('General Nova', 'No one passes. Those are my orders. They have been my orders for ten thousand years.'),
        L('Ren', 'Then it is time someone gave you new ones.'),
        L('Tip', 'Nova blocks Ki from the front with a shield and calls Star Knights. Hit from behind, or after a charge into the wall!'),
      ] },
      { type: 'boss', bosses: [['nova']] },
      { type: 'dialog', lines: [
        L('General Nova', 'Ten thousand years... and I am finally... relieved of duty.'),
        L('', 'The fourth Star Spark. The gate of the Origin opens, and light pours out like a river.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 25. The Origin ----------
  {
    name: 'The Origin', theme: 'origin', act: 5, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: ACT45_FRIENDS, final: true,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Origin. A sea of light with no ground and no sky - and at its heart, a single warrior.'),
        L('Master Oro', 'Ren. Everything you have learned, everyone you have saved - carry it all with you now.'),
      ] },
      { type: 'wave', enemies: [['knight', 'R'], ['sentinel', 'L'], ['comet', 'R'], ['knight', 'L'], ['sentinel', 'R']] },
      { type: 'wave', enemies: [['knight', 'L'], ['knight', 'R'], ['sniper', 'L'], ['comet', 'R'], ['sentinel', 'L'], ['comet', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Zenith', 'I was the first to hold this Light. I guarded it while worlds were born.'),
        L('Zenith', 'And I watched every one of them waste it. So I am taking it back. All of it.'),
        L('Ren', "The Light is not yours to keep. It belongs to everyone - that is the whole point."),
        L('Tip', 'Zenith has three phases. At the end, both heroes reach their final forms - win the last beam clash by mashing L!'),
      ] },
      { type: 'boss', bosses: [['zenith']] },
      { type: 'dialog', lines: [
        L('Zenith', 'This warmth... I had forgotten... what it was for.'),
        L('', 'Zenith lets go. The First Light pours back into the sky, and every star that had gone dark shines again.'),
        L('Nyx', 'Look - they are all coming back.'),
        L('Master Oro', "The Light was never one warrior's burden. Come home, Ren. All of you."),
        L('Ren', 'Home. Yes. Race you there!'),
      ] },
      { type: 'victory' },
    ],
  },
);
