'use strict';
// Bosses. Each is described in BOSS_DEFS; behavior is a shared attack state machine.

const BOSS_DEFS = {
  raxas: { name: 'RAXAS', title: "Vorg's fastest blade", style: 'boss', hp: 450, scale: 1.15, score: 2000, coins: 150,
    attacks: ['dash', 'slash', 'leap'], rage: ['beam'], beamColor: 'boss', aura: 'rgba(170,80,255,A)' },
  zul: { name: 'ZUL', title: 'The red twin', style: 'twinRed', hp: 210, scale: 1.05, score: 1500, coins: 100,
    attacks: ['dash', 'leap', 'dash'], rage: ['fingers', 'beam'], beamColor: 'red', aura: 'rgba(255,70,50,A)' },
  zel: { name: 'ZEL', title: 'The blue twin', style: 'twinBlue', hp: 210, scale: 1.05, score: 1500, coins: 100, want: 320,
    attacks: ['fingers', 'fingers', 'teleport'], rage: ['beam', 'dash'], beamColor: 'sky', aura: 'rgba(60,170,255,A)' },
  krag: { name: 'GENERAL KRAG', title: 'The shielded giant', style: 'krag', hp: 700, scale: 1.45, score: 3000, coins: 200, shield: true, speed: 110,
    attacks: ['charge', 'quake', 'leap'], rage: ['beam'], beamColor: 'red', aura: 'rgba(255,60,60,A)' },
  nyx: { name: 'NYX', title: 'The illusionist', style: 'nyx', hp: 560, scale: 1.05, score: 3000, coins: 200, want: 280,
    attacks: ['teleport', 'fingers', 'clones'], rage: ['beam', 'teleport'], beamColor: 'boss', aura: 'rgba(210,60,170,A)' },
  vorg: { name: 'VORG', title: 'Tyrant of the stars', style: 'vorg', hp: 1300, scale: 1.25, score: 6000, phases: true,
    attacks: ['fingers', 'dash', 'teleport'], rage: ['beam', 'summon', 'leap', 'fingers'], beamColor: 'boss', aura: 'rgba(255,40,100,A)' },
  // ----- act 2: the Hollow King and his heralds -----
  sable: { name: 'SABLE', title: 'Assassin of the dark', style: 'sable', hp: 1500, scale: 1.1, score: 3500, coins: 220, pillarKind: 'shadow', alwaysAura: true,
    attacks: ['dash', 'pillars', 'teleport'], rage: ['beam', 'pillars', 'fingers'], beamColor: 'shadow', aura: 'rgba(120,40,200,A)' },
  gale: { name: 'GALE', title: 'Monk of the four winds', style: 'gale', hp: 1650, scale: 1.1, score: 4000, coins: 240, want: 300,
    attacks: ['tornado', 'dive', 'fingers'], rage: ['beam', 'tornado', 'dive'], beamColor: 'sky', aura: 'rgba(40,220,190,A)' },
  quartzus: { name: 'QUARTZUS', title: 'The crystal titan', style: 'quartz', hp: 2200, scale: 1.6, score: 4500, coins: 260, shield: true, speed: 100,
    attacks: ['rain', 'charge', 'quake'], rage: ['beam', 'rain'], beamColor: 'crystal', aura: 'rgba(90,200,255,A)' },
  volta: { name: 'VOLTA', title: 'Queen of the storm', style: 'volta', hp: 2100, scale: 1.1, score: 5000, coins: 280, pillarKind: 'lightning', summonType: 'shade', want: 280,
    attacks: ['lightning', 'fingers', 'teleport'], rage: ['beam', 'lightning', 'summon'], beamColor: 'storm', aura: 'rgba(255,230,90,A)' },
  hollow: { name: 'HOLLOW KING', title: 'Devourer of worlds', style: 'hollow', hp: 4200, scale: 1.35, score: 10000, phases: true, alwaysAura: true, pillarKind: 'shadow', summonType: 'shade',
    phase2Style: 'hollow2', phase2Scale: 1.6, phase2Text: 'The void tears open!', phaseColor: '#ff40a0',
    finalText: 'Light and shadow, side by side!',
    attacks: ['orbs', 'teleport', 'pillars'], rage: ['beam', 'summon', 'rain', 'dive', 'orbs'], beamColor: 'void', aura: 'rgba(160,40,255,A)' },
  // ----- act 3: the Mirror Realm -----
  glitch: { name: 'GLITCH', title: 'Ghost of the neon city', style: 'glitch', hp: 2000, scale: 1.1, score: 6000, coins: 300, want: 300,
    attacks: ['lasers', 'teleport', 'fingers'], rage: ['beam', 'lasers', 'dash'], beamColor: 'sky', aura: 'rgba(60,240,255,A)' },
  thorn: { name: 'THORNMOTHER', title: 'Queen of the wild forest', style: 'thorn', hp: 2400, scale: 1.5, score: 6500, coins: 320, pillarKind: 'vine', summonType: 'wisp', speed: 90,
    attacks: ['pillars', 'orbs', 'summon'], rage: ['beam', 'pillars', 'orbs'], beamColor: 'vine', aura: 'rgba(120,220,80,A)' },
  ticktock: { name: 'TICK-TOCK', title: 'The clockwork guardian', style: 'ticktock', hp: 2600, scale: 1.45, score: 7000, coins: 340, shield: true, speed: 100,
    attacks: ['gears', 'timeslow', 'charge'], rage: ['beam', 'gears', 'quake'], beamColor: 'flame', aura: 'rgba(255,200,90,A)' },
  darkren: { name: 'DARK REN', title: 'Your own reflection', style: 'darkRen', hp: 2500, scale: 1.05, score: 7500, coins: 360, cloneType: 'mirrorclone', alwaysAura: true,
    attacks: ['dash', 'fingers', 'teleport', 'clones'], rage: ['beam', 'dash', 'clones'], beamColor: 'dark', aura: 'rgba(160,20,60,A)' },
  kaldra: { name: 'EMPRESS KALDRA', title: 'Ruler of the Mirror Realm', style: 'kaldra', hp: 4800, scale: 1.3, score: 15000, phases: true, alwaysAura: true,
    phase2Style: 'kaldra2', phase2Scale: 1.5, phase2Text: 'The mirrors shatter!', phaseColor: '#c0a0ff', summonType: 'doppel', cloneType: 'mirrorclone',
    finalText: 'Every reflection fights with you!',
    attacks: ['lasers', 'orbs', 'teleport'], rage: ['beam', 'summon', 'lasers', 'clones', 'dive'], beamColor: 'mirror', aura: 'rgba(170,200,255,A)' },
};

class Boss {
  constructor(id, x) {
    const d = BOSS_DEFS[id];
    this.id = id;
    this.def = d;
    this.name = d.name;
    this.style = d.style;
    this.x = x !== undefined ? x : W - 140;
    this.y = GROUND;
    this.vx = 0; this.vy = 0;
    this.setScale(d.scale);
    this.facing = -1;
    this.maxHp = this.hp = Math.round(d.hp * diff().hp);
    this.state = 'intro';
    this.stateT = 0;
    this.animT = 0;
    this.flash = 0;
    this.nextAtk = 1.0;
    this.beamCd = 2;
    this.hasHit = false;
    this.onGround = true;
    this.dead = false;
    this.alpha = 1;
    this.phase = 1;
    this.forcedRage = false;
    this.shotsLeft = 0;
    this.shotT = 0;
    this.pose = POSES.swordIdle(0);
    burst(this.x, this.y - 50, '#ffffff', 20, 300, 5, 0.5);
  }

  setScale(s) {
    this.scale = s;
    this.w = 34 * s;
    this.h = 80 * s;
  }

  get enraged() { return this.forcedRage || this.phase >= 2 || (!this.def.phases && this.hp < this.maxHp * 0.55); }
  get invulnerable() { return this.state === 'intro' || this.state === 'phase' || this.phase >= 3; }

  setState(s) { this.state = s; this.stateT = 0; this.hasHit = false; }

  hand() { return handOf({ x: this.x, y: this.y, facing: this.facing, pose: this.pose, scale: this.scale }); }

  update(dt) {
    // the boss focuses one hero at a time (picked again before each attack)
    if (!this.target || !this.target.alive || !allHeroes().includes(this.target)) this.target = nearestHero(this.x);
    const p = this.target;
    this.animT += dt;
    this.stateT += dt;
    // shorter attack warnings on harder difficulties
    if (this.state.endsWith('_tell') && this.state !== 'final_tell') this.stateT += dt * (1 / diff().tell - 1);
    if (this.flash > 0) this.flash -= dt;
    if (this.beamCd > 0) this.beamCd -= dt;
    const dx = p.x - this.x;
    const dist = Math.abs(dx);
    const speed = this.def.speed || 160;

    switch (this.state) {
      case 'intro':
        this.facing = sign(dx);
        if (this.stateT > 1.0) this.setState('idle');
        break;

      case 'idle': {
        this.facing = sign(dx);
        const want = this.def.want || 220;
        if (dist > want + 60) this.vx = this.facing * speed;
        else if (dist < want - 80) this.vx = -this.facing * speed * 0.85;
        else this.vx = Math.sin(this.animT * 2) * 60;
        if (this.x < 60 || this.x > W - 60) this.vx = sign(W / 2 - this.x) * speed;
        this.nextAtk -= dt;
        // a hero charging a Ki Wave in front of the boss gets interrupted with quick shots
        const charger = liveHeroes().find((h) => h.state === 'charging' && h.charge > 0.3 && Math.abs(h.x - this.x) < 700);
        if (charger && this.nextAtk > 0 && Math.random() < diff().interrupt * dt) {
          this.target = charger;
          this.facing = sign(charger.x - this.x);
          this.setState('fingers_tell');
          floater(this.x, this.y - this.h - 20, 'Too slow!', '#ff9090', 15);
          break;
        }
        if (this.nextAtk <= 0 && p.alive) this.chooseAttack(dist);
        break;
      }

      // ----- forward dash -----
      case 'dash_tell':
        this.vx = 0;
        if (Math.random() < 0.5) spawnParticle({ x: this.x + rand(-20, 20), y: this.y - rand(10, this.h), vx: 0, vy: -80, life: 0.3, size: 3, color: '#d68bff' });
        if (this.stateT >= (this.enraged ? 0.35 : 0.5)) { this.setState('dash'); Sfx.slash(); }
        break;
      case 'dash':
        this.vx = this.facing * 880;
        spawnParticle({ x: this.x - this.facing * 20, y: this.y - rand(20, this.h), vx: -this.facing * 100, vy: 0, life: 0.25, size: 4, color: '#b070ff' });
        this.contactHit(15, 380);
        if (this.stateT >= 0.42 || this.x <= 50 || this.x >= W - 50) this.recover(0.45);
        break;

      // ----- sword slash wave -----
      case 'slash_tell':
        this.vx = 0;
        if (this.stateT >= 0.38) {
          this.fireCrescent(this.y - 45);
          if (this.enraged) this.fireCrescent(this.y - 105, 0.9);
          Sfx.slash();
          this.setState('slash');
        }
        break;
      case 'slash':
        if (this.stateT >= 0.3) this.recover(0.35);
        break;

      // ----- leap and ground slam -----
      case 'leap':
        if (!this.hasHit) {
          this.hasHit = true;
          this.vy = -760;
          this.onGround = false;
          const tx = clamp(p.x, 60, W - 60);
          this.vx = (tx - this.x) / 0.84;
        }
        if (this.onGround && this.stateT > 0.15) {
          this.groundSlam(130, 14);
          this.recover(0.5);
        }
        break;

      // ----- rapid Ki shots -----
      case 'fingers_tell':
        this.vx = 0;
        this.facing = sign(dx);
        if (this.stateT >= 0.35) { this.setState('fingers'); this.shotsLeft = this.enraged ? 5 : 3; this.shotT = 0; }
        break;
      case 'fingers':
        this.vx = 0;
        this.facing = sign(dx);
        this.shotT -= dt;
        if (this.shotT <= 0 && this.shotsLeft > 0) {
          this.shotsLeft--;
          this.shotT = 0.16;
          const h = this.hand();
          const ang = Math.atan2(p.y - 45 - h.y, p.x - h.x) + rand(-0.06, 0.06);
          const col = BEAM_COLORS[this.def.beamColor];
          Game.projectiles.push({ x: h.x, y: h.y, vx: Math.cos(ang) * 480, vy: Math.sin(ang) * 480, r: 6, dmg: 7, owner: 'enemy', life: 3, inner: col[1].replace('A', '1'), outer: col[0].replace('A', '0.6') });
          Sfx.blast();
        }
        if (this.shotsLeft <= 0 && this.shotT <= 0) this.recover(0.35);
        break;

      // ----- teleport behind the player -----
      case 'tp_out':
        this.vx = 0;
        this.alpha = clamp(1 - this.stateT / 0.3, 0, 1);
        if (this.stateT >= 0.3) {
          let nx = p.x - p.facing * 150;
          if (nx < 50 || nx > W - 50) nx = p.x + p.facing * 150;
          this.x = clamp(nx, 50, W - 50);
          this.facing = sign(p.x - this.x);
          burst(this.x, this.y - this.h / 2, '#ffffff', 12, 200, 3, 0.3);
          Sfx.teleport();
          this.setState('tp_in');
        }
        break;
      case 'tp_in':
        this.alpha = clamp(this.stateT / 0.2, 0, 1);
        if (this.stateT >= 0.25) {
          this.alpha = 1;
          const follow = this.def.attacks.includes('dash') || this.def.rage.includes('dash') ? (Math.random() < 0.5 ? 'dash_tell' : 'fingers_tell') : 'fingers_tell';
          this.setState(follow);
        }
        break;

      // ----- Krag: shield charge -----
      case 'charge_tell':
        this.vx = 0;
        this.facing = sign(dx);
        if (Math.random() < 0.5) spawnParticle({ x: this.x - this.facing * 20, y: GROUND - 4, vx: -this.facing * rand(60, 160), vy: rand(-100, -20), life: 0.4, size: 4, color: '#c9c9c9', grav: 400 });
        if (this.stateT >= 0.6) { this.setState('charge'); Sfx.boom(); }
        break;
      case 'charge':
        this.vx = this.facing * (this.enraged ? 640 : 540);
        addShake(2);
        this.contactHit(18, 480);
        if (this.x <= 45 || this.x >= W - 45) {
          addShake(12); Sfx.boom();
          burst(this.x + this.facing * 30, this.y - 60, '#ffffff', 16, 260, 4, 0.4);
          floater(this.x, this.y - this.h - 20, 'STUNNED!', '#ffff88', 18);
          this.setState('stunned');
          this.stunLen = 1.3;
        } else if (this.stateT >= 1.3) this.recover(0.5);
        break;

      // ----- Krag: earthquake -----
      case 'quake_tell':
        this.vx = 0;
        if (this.stateT >= 0.5) { this.setState('quake'); this.quakeWaves = 0; }
        break;
      case 'quake':
        if (this.quakeWaves === 0 || (this.enraged && this.quakeWaves === 1 && this.stateT > 0.45)) {
          this.quakeWaves++;
          this.groundSlam(0, 0);
          for (const dir of [-1, 1]) {
            Game.projectiles.push({ x: this.x + dir * 40, y: GROUND - 14, vx: dir * 380, vy: 0, r: 14, dmg: 12, owner: 'enemy', type: 'groundwave', life: 3 });
          }
        }
        if (this.stateT >= 0.9) this.recover(0.4);
        break;

      // ----- Nyx: clones -----
      case 'clones_tell':
        this.vx = 0;
        if (Math.random() < 0.5) spawnParticle({ x: this.x + rand(-30, 30), y: this.y - rand(0, this.h), vx: 0, vy: -100, life: 0.4, size: 3, color: '#d040a0' });
        if (this.stateT >= 0.6) {
          const cloneType = this.def.cloneType || 'clone';
          const alive = Game.enemies.filter((e) => e.type === cloneType && !e.dead).length;
          for (let i = 0; i < Math.min(2, 3 - alive); i++) {
            const c = new Enemy(cloneType, Math.random() < 0.5 ? 'L' : 'R');
            c.x = rand(80, W - 80); c.entering = false;
            Game.enemies.push(c);
            burst(c.x, c.y - 40, '#d040a0', 14, 200, 4, 0.4);
          }
          floater(this.x, this.y - this.h - 20, 'Which one is real?', '#ffb0f0', 18);
          this.recover(0.5);
        }
        break;

      // ----- Vorg: reinforcements -----
      case 'summon_tell':
        this.vx = 0;
        if (this.stateT >= 0.6) {
          const type = this.def.summonType || 'elite';
          const alive = Game.enemies.filter((e) => e.type === type && !e.dead).length;
          for (let i = 0; i < 2 - alive; i++) Game.enemies.push(new Enemy(type, i === 0 ? 'L' : 'R'));
          floater(this.x, this.y - this.h - 20, 'Guards, attack!', '#ff9090', 18);
          this.recover(0.4);
        }
        break;

      // ----- energy beam -----
      case 'beam_tell': {
        this.vx = 0;
        const h = this.hand();
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(50, 90);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.25, size: 3, color: BEAM_COLORS[this.def.beamColor][1].replace('A', '1') });
        }
        addShake(1.5);
        if (this.stateT >= 1.3) {
          this.setState('beam');
          this.pose = this.computePose();
          Game.beams.push(this.makeBeam(44, 1.2, 30));
          Sfx.beam(3);
          addShake(8);
        }
        break;
      }
      case 'beam':
        this.vx = 0;
        if (this.stateT >= 1.2) this.recover(0.6);
        break;

      // ----- Vorg's transformation -----
      case 'phase':
        this.vx = 0;
        addShake(4);
        auraParticles(this.x, this.y, this.h + 20, this.def.phaseColor || '#ff4080', 4, 40);
        if (this.stateT >= 1.8) {
          this.style = this.def.phase2Style || 'vorg2';
          this.setScale(this.def.phase2Scale || 1.45);
          Game.flash = 0.6;
          explosion(this.x, this.y - 60, 1.4);
          Sfx.explode();
          showBanner(`${this.name}: SECOND FORM`, this.def.phase2Text || "Now he's really angry!", 1.8);
          this.recover(0.3);
        }
        break;

      // ----- Finale: planet-breaker sphere -----
      case 'final_tell': {
        this.vx = 0;
        this.facing = sign(dx);
        const h = this.hand();
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(80, 160);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 3, vy: -Math.sin(a) * r * 3, life: 0.3, size: 3, color: '#ff80c0' });
        }
        addShake(3);
        // the final clash is fought by the hero you control (the ally joins in startClash)
        const cp = Game.player;
        const busy = liveHeroes().some((h) => h.state === 'transform');
        if (this.stateT >= 3.2 && cp.alive && !busy) {
          this.facing = sign(cp.x - this.x);
          cp.facing = sign(this.x - cp.x);
          cp.beamLevel = 3;
          cp.pose = POSES.fire();
          this.setState('beam');
          this.pose = this.computePose();
          const bb = this.makeBeam(80, 99, 40);
          Game.beams.push(bb);
          const pb = cp.releaseBeam(true);
          startClash(pb, bb, { final: true, rate: 0.3 });
          showHint('FINAL BEAM CLASH! MASH L!', 2.5);
        }
        break;
      }

      // ----- pillars of shadow / lightning bolts under the heroes -----
      case 'pillars_tell':
        this.vx = 0;
        if (this.stateT >= 0.35) {
          const kind = this.def.pillarKind || 'shadow';
          const xs = liveHeroes().map((h) => h.x);
          if (this.enraged) xs.push(...xs.map((x) => x + rand(-160, 160)));
          for (const x of xs) addHazard(clamp(x, 30, W - 30), kind, this);
          Sfx.slash();
          this.recover(0.4);
        }
        break;

      // ----- crystal rain from the ceiling -----
      case 'rain_tell':
        this.vx = 0;
        if (this.stateT >= 0.5) {
          const n = this.enraged ? 11 : 7;
          const hs = liveHeroes();
          for (let i = 0; i < n; i++) {
            const h = hs[i % hs.length];
            Game.projectiles.push({ x: clamp(h.x + rand(-260, 260), 20, W - 20), y: -30 - i * 55, vx: 0, vy: 430, r: 11, dmg: 10, owner: 'enemy', type: 'shard', life: 4 });
          }
          Sfx.boom();
          this.recover(0.4);
        }
        break;

      // ----- dive: jump out of sight, then crash down on a hero -----
      case 'dive_up':
        this.vx = 0;
        this.y -= 1500 * dt;
        this.onGround = false;
        if (this.y < -200) { this.setState('dive_aim'); this.diveX = clamp(p.x, 60, W - 60); }
        break;
      case 'dive_aim':
        this.y = -200;
        this.diveX = lerp(this.diveX, clamp(p.x, 60, W - 60), Math.min(1, dt * 3));
        if (this.stateT >= (this.enraged ? 0.55 : 0.75)) { this.x = this.diveX; this.setState('dive_down'); }
        break;
      case 'dive_down':
        this.y += 1700 * dt;
        if (this.y >= GROUND) {
          this.y = GROUND; this.onGround = true;
          this.groundSlam(120, 16);
          this.recover(0.5);
        }
        break;

      // ----- tornado rolling along the ground -----
      case 'tornado_tell':
        this.vx = 0;
        if (this.stateT >= 0.4) {
          const dirs = this.enraged ? [-1, 1] : [this.facing];
          for (const d of dirs) Game.projectiles.push({ x: this.x + d * 40, y: GROUND - 42, vx: d * 270, vy: 0, r: 26, dmg: 11, owner: 'enemy', type: 'tornado', life: 4, power: 3 });
          Sfx.slash();
          this.recover(0.35);
        }
        break;

      // ----- slow homing orbs -----
      case 'orbs_tell':
        this.vx = 0;
        if (this.stateT >= 0.4) {
          const n = this.enraged ? 4 : 3;
          const h0 = this.hand();
          for (let i = 0; i < n; i++) {
            const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.6;
            Game.projectiles.push({ x: h0.x, y: h0.y, vx: Math.cos(a) * 160 + this.facing * 60, vy: Math.sin(a) * 160, r: 11, dmg: 9, owner: 'enemy', type: 'orb', homing: true, speed: 175, life: 5, inner: '#e0c0ff', outer: 'rgba(70,0,140,0.75)', trail: '#a070ff' });
          }
          Sfx.blast();
          this.recover(0.4);
        }
        break;

      // ----- horizontal lasers: low ones (jump over) and high ones (stay on the ground) -----
      case 'lasers_tell':
        this.vx = 0;
        if (this.stateT >= 0.45) {
          const low = GROUND - 16, high = GROUND - 118;
          const first = Math.random() < 0.5 ? low : high;
          addLaser(first, this, 0);
          if (this.enraged) addLaser(first === low ? high : low, this, 0.8);
          Sfx.zap();
          this.recover(0.5);
        }
        break;

      // ----- bouncing gears -----
      case 'gears_tell':
        this.vx = 0;
        if (this.stateT >= 0.4) {
          const n = this.enraged ? 4 : 3;
          for (let i = 0; i < n; i++) {
            Game.projectiles.push({ x: this.x + this.facing * 40, y: this.y - this.h * 0.6, vx: this.facing * rand(200, 380), vy: -rand(300, 620), gravity: 900, bounces: 3, r: 15, dmg: 10, owner: 'enemy', type: 'gear', life: 6, power: 2, trail: '#e0c070' });
          }
          Sfx.slash();
          this.recover(0.4);
        }
        break;

      // ----- slows the heroes down for a few seconds -----
      case 'timeslow_tell':
        this.vx = 0;
        if (this.stateT >= 0.6) {
          Game.heroSlowT = this.enraged ? 4.5 : 3.5;
          showHint('Time slows down!', 2);
          Sfx.special(2);
          this.recover(0.3);
        }
        break;

      case 'recover':
        this.vx *= 0.85;
        this.alpha = 1;
        if (this.stateT >= this.recoverT) {
          this.setState('idle');
          this.nextAtk = (this.enraged ? rand(0.4, 0.8) : rand(0.8, 1.4)) / diff().bossAtk;
        }
        break;

      case 'stunned':
        this.vx *= 0.9;
        if (Math.random() < 0.3) spawnParticle({ x: this.x + rand(-15, 15), y: this.y - this.h - 20, vx: rand(-30, 30), vy: -30, life: 0.4, size: 3, color: '#ffff88' });
        if (this.stateT >= (this.stunLen || 1.8)) { this.stunLen = 0; this.recover(0.1); }
        break;

      case 'clash':
        this.vx = 0;
        break;

      case 'dead':
        this.vx *= 0.95;
        if (this.stateT < 1.6 && Math.random() < dt * 10) {
          explosion(this.x + rand(-40, 40), this.y - rand(20, this.h), 0.6);
          Sfx.explode();
        }
        break;
    }

    // physics (the dive moves the boss by itself)
    if (this.state === 'dive_up' || this.state === 'dive_aim' || this.state === 'dive_down') {
      this.x = clamp(this.x, 30, W - 30);
      this.pose = this.computePose();
      return;
    }
    if (!this.onGround) this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND) {
      this.y = GROUND;
      this.vy = 0;
      this.onGround = true;
    }
    this.x = clamp(this.x, 30, W - 30);
    this.pose = this.computePose();
  }

  contactHit(dmg, knock) {
    if (this.hasHit) return;
    for (const h of liveHeroes()) {
      if (rectsOverlap(boxOf(this), boxOf(h))) {
        this.hasHit = true;
        h.takeHit(dmg, this.facing, knock);
      }
    }
  }

  groundSlam(radius, dmg) {
    addShake(9);
    Sfx.boom();
    for (let i = 0; i < 24; i++) spawnParticle({ x: this.x + rand(-60, 60), y: GROUND - 4, vx: rand(-260, 260), vy: rand(-300, -60), life: 0.6, size: rand(3, 6), color: '#c9a27a', grav: 700 });
    burst(this.x, GROUND - 10, '#ffffff', 12, 300, 5, 0.4);
    if (radius) {
      for (const h of liveHeroes()) if (h.onGround && Math.abs(h.x - this.x) < radius) h.takeHit(dmg, sign(h.x - this.x), 300);
    }
  }

  makeBeam(width, life, dmg) {
    const h = this.hand();
    return {
      owner: 'boss', src: this, x: h.x, y: h.y, dir: this.facing, len: 1200, width, dmg,
      pierce: 1, knock: 420, level: 3, life, max: life, hit: new Set(), color: this.def.beamColor, clash: false,
    };
  }

  chooseAttack(dist) {
    const d = this.def;
    // pick the hero to attack: usually the closest, sometimes the other one
    const hs = liveHeroes();
    if (hs.length > 1 && Math.random() < 0.35) this.target = hs[Math.floor(Math.random() * hs.length)];
    else this.target = nearestHero(this.x);
    dist = Math.abs(this.target.x - this.x);
    if (d.phases && this.phase >= 3) { this.startFinalTell(); return; }
    if (this.enraged && d.rage.includes('beam') && this.beamCd <= 0 && Math.random() < 0.5) {
      this.setState('beam_tell');
      this.facing = sign(this.target.x - this.x);
      this.beamCd = 7;
      showHint(`${this.name} is charging! Hold L for a beam clash!`, 2.2);
      return;
    }
    let opts = d.attacks.slice();
    if (this.enraged) opts = opts.concat(d.rage.filter((a) => a !== 'beam'));
    if (dist > 300) opts = opts.filter((a) => a !== 'leap' || Math.random() < 0.5);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    const map = {
      dash: 'dash_tell', slash: 'slash_tell', leap: 'leap', fingers: 'fingers_tell', teleport: 'tp_out',
      charge: 'charge_tell', quake: 'quake_tell', clones: 'clones_tell', summon: 'summon_tell',
      pillars: 'pillars_tell', lightning: 'pillars_tell', lasers: 'lasers_tell', gears: 'gears_tell', timeslow: 'timeslow_tell', rain: 'rain_tell', dive: 'dive_up', tornado: 'tornado_tell', orbs: 'orbs_tell',
    };
    this.setState(map[pick] || 'dash_tell');
  }

  fireCrescent(y, speedMul = 1) {
    Game.projectiles.push({
      x: this.x + this.facing * 40, y, vx: this.facing * 470 * speedMul, vy: 0, r: 18, dmg: 12,
      owner: 'enemy', type: 'crescent', life: 3, power: 2,
    });
  }

  recover(t) {
    this.setState('recover');
    this.recoverT = t;
  }

  startFinalTell() {
    this.setState('final_tell');
    this.x = clamp(this.x, 120, W - 120);
    Game.beams = Game.beams.filter((b) => b.src !== this);
    Game.projectiles = Game.projectiles.filter((pr) => pr.owner !== 'enemy');
    for (const e of Game.enemies) if (!e.dead) { e.dead = true; e.setState('dying'); explosion(e.x, e.y - 40, 0.6); }
    let changed = false;
    for (const h of liveHeroes()) {
      if (h.form !== h.char.finalForm) { h.forceForm(h.char.finalForm); changed = true; }
    }
    if (changed) {
      const names = liveHeroes().map((h) => h.forms[h.char.finalForm].name.toUpperCase());
      showBanner(names.join(' & ') + '!', this.def.finalText || "The whole planet's Ki is with you!", 2.2);
    } else {
      showHint(`${this.name} is charging again! Get ready!`, 2.5);
    }
  }

  // Vorg's phase transitions
  checkPhase() {
    if (!this.def.phases) return false;
    if (this.phase === 1 && this.hp <= this.maxHp * 0.66) {
      this.phase = 2;
      this.hp = this.maxHp * 0.66;
      Game.beams = Game.beams.filter((b) => b.src !== this);
      this.setState('phase');
      showBanner(`${this.name} IS TRANSFORMING!`, '', 1.6);
      return true;
    }
    if (this.phase === 2 && this.hp <= this.maxHp * 0.25) {
      this.phase = 3;
      this.hp = this.maxHp * 0.25;
      this.startFinalTell();
      return true;
    }
    return false;
  }

  computePose() {
    switch (this.state) {
      case 'dash_tell': case 'slash_tell': case 'quake_tell': case 'clones_tell': case 'summon_tell': case 'final_tell':
      case 'pillars_tell': case 'rain_tell': case 'orbs_tell': case 'timeslow_tell': return POSES.swordRaise();
      case 'lasers_tell': case 'gears_tell': return POSES.punch1();
      case 'tornado_tell': return POSES.swordSlash();
      case 'dive_up': case 'dive_aim': return POSES.jump();
      case 'dive_down': return POSES.dash();
      case 'dash': case 'charge': return POSES.dash();
      case 'charge_tell': return POSES.windup();
      case 'slash': case 'quake': return POSES.swordSlash();
      case 'leap': return this.onGround ? POSES.swordRaise() : POSES.jump();
      case 'fingers_tell': case 'fingers': return POSES.punch1();
      case 'beam_tell': return POSES.charge();
      case 'beam': case 'clash': return POSES.fire();
      case 'stunned': return POSES.hurt();
      case 'phase': return POSES.transform(this.animT);
      case 'dead': return this.stateT > 1.5 ? POSES.dead() : POSES.hurt();
      default: return Math.abs(this.vx) > 40 ? POSES.walk(this.animT) : POSES.swordIdle(this.animT);
    }
  }

  takeHit(dmg, dir, knock, kind = 'melee') {
    if (this.dead) return false;
    if (this.invulnerable) {
      if (this.phase >= 3 && Math.random() < 0.3) floater(this.x, this.y - this.h - 20, 'Invulnerable!', '#ff9090', 15);
      return false;
    }
    if (this.def.shield && (kind === 'blast' || kind === 'beam') && this.facing === -dir && !['stunned', 'recover', 'quake'].includes(this.state)) {
      dmg *= 0.12;
      floater(this.x, this.y - this.h - 30, 'SHIELD', '#9fe6ff', 15);
      burst(this.x + this.facing * 24, this.y - this.h / 2, '#9fe6ff', 6, 150, 3, 0.25);
    }
    this.hp -= dmg;
    this.flash = 0.1;
    floater(this.x, this.y - this.h - 20, String(Math.round(dmg)), '#ffe14d', 18);
    if (knock >= 400 && (this.state === 'idle' || this.state === 'recover')) this.vx = dir * knock * 0.6;
    if (this.checkPhase()) return dmg;
    if (this.hp <= 0) this.die(dir);
    return dmg;
  }

  // Winning the final beam clash
  finalBlow() {
    this.phase = 4;
    this.hp = 0;
    this.die(Game.player.facing);
  }

  die(dir) {
    this.hp = 0;
    this.dead = true;
    this.alpha = 1;
    this.setState('dead');
    this.vx = dir * 200;
    this.vy = -300;
    this.onGround = false;
    Game.slowmo = 1.4;
    Game.flash = 0.6;
    Game.score += this.def.score;
    spawnCoins(this.x, this.y - 60, this.def.coins || 0);
    Game.beams = Game.beams.filter((b) => b.src !== this);
    const others = liveBosses();
    if (others.length === 0) {
      Game.projectiles = Game.projectiles.filter((p) => p.owner !== 'enemy');
      for (const e of Game.enemies) if (!e.dead) { e.dead = true; e.setState('dying'); explosion(e.x, e.y - 40, 0.6); }
      showBanner(`${this.name} DEFEATED!`, `+${this.def.score} points`, 2.2);
    } else {
      for (const o of others) {
        o.forcedRage = true;
        floater(o.x, o.y - o.h - 30, 'ENRAGED!', '#ff6060', 22);
      }
      showBanner(`${this.name} DEFEATED!`, "But it's not over yet...", 1.6);
    }
  }

  draw(ctx) {
    drawShadow(ctx, this.x, this.y, 28 * this.scale / 1.15);
    ctx.globalAlpha = this.alpha;
    if ((this.enraged || this.def.alwaysAura || this.state === 'phase') && !this.dead) drawAura(ctx, this.x, this.y, this.h + 30, this.def.aura, this.state === 'phase' ? 1.6 : 0.8, this.animT);
    const tell = ['dash_tell', 'slash_tell', 'charge_tell', 'quake_tell'].includes(this.state) && Math.floor(this.stateT * 18) % 2 === 0;
    drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style: STYLES[this.style], scale: this.scale, flash: this.flash > 0 || tell, t: this.animT });
    ctx.globalAlpha = 1;
    const col = BEAM_COLORS[this.def.beamColor];
    if (this.state === 'beam_tell') {
      const h = this.hand();
      drawEnergyBall(ctx, h.x, h.y, 6 + this.stateT * 10, col[1].replace('A', '1'), col[0].replace('A', '0.6'), this.animT);
    }
    if (this.state === 'final_tell') {
      const h = this.hand();
      drawEnergyBall(ctx, h.x, h.y - 30, 12 + this.stateT * 18, '#ffd0f0', 'rgba(255,40,120,0.7)', this.animT);
    }
  }
}
