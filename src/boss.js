'use strict';
// Bosai. Kiekvienas aprašomas BOSS_DEFS, o elgesys – bendra atakų būsenų mašina.

const BOSS_DEFS = {
  raxas: { name: 'RAXAS', title: 'Greičiausias Vorgo kardas', style: 'boss', hp: 450, scale: 1.15, score: 2000, zenu: 150,
    attacks: ['dash', 'slash', 'leap'], rage: ['beam'], beamColor: 'boss', aura: 'rgba(170,80,255,A)' },
  zul: { name: 'ZUL', title: 'Raudonasis dvynys', style: 'twinRed', hp: 210, scale: 1.05, score: 1500, zenu: 100,
    attacks: ['dash', 'leap', 'dash'], rage: ['fingers', 'beam'], beamColor: 'red', aura: 'rgba(255,70,50,A)' },
  zel: { name: 'ZEL', title: 'Mėlynasis dvynys', style: 'twinBlue', hp: 210, scale: 1.05, score: 1500, zenu: 100, want: 320,
    attacks: ['fingers', 'fingers', 'teleport'], rage: ['beam', 'dash'], beamColor: 'sky', aura: 'rgba(60,170,255,A)' },
  krag: { name: 'GENEROLAS KRAG', title: 'Milžinas su skydu', style: 'krag', hp: 700, scale: 1.45, score: 3000, zenu: 200, shield: true, speed: 110,
    attacks: ['charge', 'quake', 'leap'], rage: ['beam'], beamColor: 'red', aura: 'rgba(255,60,60,A)' },
  nyx: { name: 'NYX', title: 'Iliuzionistė', style: 'nyx', hp: 560, scale: 1.05, score: 3000, zenu: 200, want: 280,
    attacks: ['teleport', 'fingers', 'clones'], rage: ['beam', 'teleport'], beamColor: 'boss', aura: 'rgba(210,60,170,A)' },
  vorg: { name: 'VORGAS', title: 'Kosmoso tironas', style: 'vorg', hp: 1300, scale: 1.25, score: 6000, phases: true,
    attacks: ['fingers', 'dash', 'teleport'], rage: ['beam', 'summon', 'leap', 'fingers'], beamColor: 'boss', aura: 'rgba(255,40,100,A)' },
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
    this.maxHp = d.hp; this.hp = d.hp;
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
    const p = Game.player;
    this.animT += dt;
    this.stateT += dt;
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
        if (this.nextAtk <= 0 && p.alive) this.chooseAttack(dist);
        break;
      }

      // ----- puolimas į priekį -----
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

      // ----- kardo pjūvio banga -----
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

      // ----- šuolis ir smūgis į žemę -----
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

      // ----- šūviai iš pirštų -----
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

      // ----- teleportas už žaidėjo -----
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

      // ----- Krag: puolimas su skydu -----
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
          floater(this.x, this.y - this.h - 20, 'APSVAIGO!', '#ffff88', 18);
          this.setState('stunned');
          this.stunLen = 1.3;
        } else if (this.stateT >= 1.3) this.recover(0.5);
        break;

      // ----- Krag: žemės drebėjimas -----
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

      // ----- Nyx: klonai -----
      case 'clones_tell':
        this.vx = 0;
        if (Math.random() < 0.5) spawnParticle({ x: this.x + rand(-30, 30), y: this.y - rand(0, this.h), vx: 0, vy: -100, life: 0.4, size: 3, color: '#d040a0' });
        if (this.stateT >= 0.6) {
          const alive = Game.enemies.filter((e) => e.type === 'clone' && !e.dead).length;
          for (let i = 0; i < Math.min(2, 3 - alive); i++) {
            const c = new Enemy('clone', Math.random() < 0.5 ? 'L' : 'R');
            c.x = rand(80, W - 80); c.entering = false;
            Game.enemies.push(c);
            burst(c.x, c.y - 40, '#d040a0', 14, 200, 4, 0.4);
          }
          floater(this.x, this.y - this.h - 20, 'Kuri tikroji?', '#ffb0f0', 18);
          this.recover(0.5);
        }
        break;

      // ----- Vorgas: pastiprinimas -----
      case 'summon_tell':
        this.vx = 0;
        if (this.stateT >= 0.6) {
          const elites = Game.enemies.filter((e) => e.type === 'elite' && !e.dead).length;
          for (let i = 0; i < 2 - elites; i++) Game.enemies.push(new Enemy('elite', i === 0 ? 'L' : 'R'));
          floater(this.x, this.y - this.h - 20, 'Gvardija, pulti!', '#ff9090', 18);
          this.recover(0.4);
        }
        break;

      // ----- energijos banga -----
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

      // ----- Vorgo transformacija -----
      case 'phase':
        this.vx = 0;
        addShake(4);
        auraParticles(this.x, this.y, this.h + 20, '#ff4080', 4, 40);
        if (this.stateT >= 1.8) {
          this.style = 'vorg2';
          this.setScale(1.45);
          Game.flash = 0.6;
          explosion(this.x, this.y - 60, 1.4);
          Sfx.explode();
          showBanner('VORGAS: ANTROJI FORMA', 'Dabar jis rimtai pyksta!', 1.8);
          this.recover(0.3);
        }
        break;

      // ----- Finalas: planetą naikinanti sfera -----
      case 'final_tell': {
        this.vx = 0;
        this.facing = sign(dx);
        const h = this.hand();
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(80, 160);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 3, vy: -Math.sin(a) * r * 3, life: 0.3, size: 3, color: '#ff80c0' });
        }
        addShake(3);
        if (this.stateT >= 3.2 && p.alive && p.state !== 'transform') {
          p.facing = sign(this.x - p.x);
          p.beamLevel = 3;
          p.pose = POSES.fire();
          this.setState('beam');
          this.pose = this.computePose();
          const bb = this.makeBeam(80, 99, 40);
          Game.beams.push(bb);
          const pb = p.releaseBeam(true);
          startClash(pb, bb, { final: true, rate: 0.3 });
          showHint('PASKUTINĖ BANGŲ KOVA! SPAUDINĖK L!', 2.5);
        }
        break;
      }

      case 'recover':
        this.vx *= 0.85;
        this.alpha = 1;
        if (this.stateT >= this.recoverT) {
          this.setState('idle');
          this.nextAtk = this.enraged ? rand(0.4, 0.8) : rand(0.8, 1.4);
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

    // fizika
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
    const p = Game.player;
    if (!this.hasHit && rectsOverlap(boxOf(this), boxOf(p))) {
      this.hasHit = true;
      p.takeHit(dmg, this.facing, knock);
    }
  }

  groundSlam(radius, dmg) {
    const p = Game.player;
    addShake(9);
    Sfx.boom();
    for (let i = 0; i < 24; i++) spawnParticle({ x: this.x + rand(-60, 60), y: GROUND - 4, vx: rand(-260, 260), vy: rand(-300, -60), life: 0.6, size: rand(3, 6), color: '#c9a27a', grav: 700 });
    burst(this.x, GROUND - 10, '#ffffff', 12, 300, 5, 0.4);
    if (radius && p.onGround && Math.abs(p.x - this.x) < radius) p.takeHit(dmg, sign(p.x - this.x), 300);
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
    if (d.phases && this.phase >= 3) { this.startFinalTell(); return; }
    if (this.enraged && d.rage.includes('beam') && this.beamCd <= 0 && Math.random() < 0.5) {
      this.setState('beam_tell');
      this.facing = sign(Game.player.x - this.x);
      this.beamCd = 7;
      showHint(`${this.name} kaupia energiją! Laikyk L – bangų kova!`, 2.2);
      return;
    }
    let opts = d.attacks.slice();
    if (this.enraged) opts = opts.concat(d.rage.filter((a) => a !== 'beam'));
    if (dist > 300) opts = opts.filter((a) => a !== 'leap' || Math.random() < 0.5);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    const map = {
      dash: 'dash_tell', slash: 'slash_tell', leap: 'leap', fingers: 'fingers_tell', teleport: 'tp_out',
      charge: 'charge_tell', quake: 'quake_tell', clones: 'clones_tell', summon: 'summon_tell',
    };
    this.setState(map[pick] || 'dash_tell');
  }

  fireCrescent(y, speedMul = 1) {
    Game.projectiles.push({
      x: this.x + this.facing * 40, y, vx: this.facing * 470 * speedMul, vy: 0, r: 18, dmg: 12,
      owner: 'enemy', type: 'crescent', life: 3,
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
    const p = Game.player;
    if (p.form !== 4 && p.alive) {
      p.forceForm(4);
      showBanner('ŽVAIGŽDŽIŲ FORMA!', 'Visos planetos Ki tavyje!', 2.2);
    } else {
      showHint('Vorgas vėl kaupia sferą! Pasiruošk!', 2.5);
    }
  }

  // Vorgo fazių perėjimai
  checkPhase() {
    if (!this.def.phases) return false;
    if (this.phase === 1 && this.hp <= this.maxHp * 0.66) {
      this.phase = 2;
      this.hp = this.maxHp * 0.66;
      Game.beams = Game.beams.filter((b) => b.src !== this);
      this.setState('phase');
      showBanner('VORGAS TRANSFORMUOJASI!', '', 1.6);
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
      case 'dash_tell': case 'slash_tell': case 'quake_tell': case 'clones_tell': case 'summon_tell': case 'final_tell': return POSES.swordRaise();
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
      if (this.phase >= 3 && Math.random() < 0.3) floater(this.x, this.y - this.h - 20, 'Nepažeidžiamas!', '#ff9090', 15);
      return false;
    }
    if (this.def.shield && (kind === 'blast' || kind === 'beam') && this.facing === -dir && !['stunned', 'recover', 'quake'].includes(this.state)) {
      dmg *= 0.12;
      floater(this.x, this.y - this.h - 30, 'SKYDAS', '#9fe6ff', 15);
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

  // Finalinės bangų kovos pergalė
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
    spawnCoins(this.x, this.y - 60, this.def.zenu || 0);
    Game.beams = Game.beams.filter((b) => b.src !== this);
    const others = liveBosses();
    if (others.length === 0) {
      Game.projectiles = Game.projectiles.filter((p) => p.owner !== 'enemy');
      for (const e of Game.enemies) if (!e.dead) { e.dead = true; e.setState('dying'); explosion(e.x, e.y - 40, 0.6); }
      showBanner(`${this.name} NUGALĖTAS!`, `+${this.def.score} taškų`, 2.2);
    } else {
      for (const o of others) {
        o.forcedRage = true;
        floater(o.x, o.y - o.h - 30, 'ĮSIUTO!', '#ff6060', 22);
      }
      showBanner(`${this.name} NUGALĖTAS!`, 'Bet dar ne viskas...', 1.6);
    }
  }

  draw(ctx) {
    drawShadow(ctx, this.x, this.y, 28 * this.scale / 1.15);
    ctx.globalAlpha = this.alpha;
    if ((this.enraged || this.state === 'phase') && !this.dead) drawAura(ctx, this.x, this.y, this.h + 30, this.def.aura, this.state === 'phase' ? 1.6 : 0.8, this.animT);
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
