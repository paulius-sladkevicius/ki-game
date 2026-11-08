'use strict';
// 1 lygio bosas Raxas – greitas kardininkas.

class Boss {
  constructor() {
    this.name = 'RAXAS';
    this.x = W - 140; this.y = GROUND;
    this.vx = 0; this.vy = 0;
    this.w = 40; this.h = 92;
    this.scale = 1.15;
    this.facing = -1;
    this.maxHp = 450; this.hp = 450;
    this.state = 'intro';
    this.stateT = 0;
    this.animT = 0;
    this.flash = 0;
    this.nextAtk = 1.0;
    this.beamCd = 2;
    this.hasHit = false;
    this.onGround = true;
    this.dead = false;
    this.pose = POSES.swordIdle(0);
  }

  get enraged() { return this.hp < this.maxHp * 0.55; }

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

    switch (this.state) {
      case 'intro':
        this.facing = sign(dx);
        if (this.stateT > 1.0) this.setState('idle');
        break;

      case 'idle': {
        this.facing = sign(dx);
        const want = 220;
        if (dist > want + 60) this.vx = this.facing * 160;
        else if (dist < want - 80) this.vx = -this.facing * 140;
        else this.vx = Math.sin(this.animT * 2) * 60;
        if (this.x < 60 || this.x > W - 60) this.vx = sign(W / 2 - this.x) * 160;
        this.nextAtk -= dt;
        if (this.nextAtk <= 0 && p.alive) this.chooseAttack(dist);
        break;
      }

      case 'dash_tell':
        this.vx = 0;
        if (Math.random() < 0.5) spawnParticle({ x: this.x + rand(-20, 20), y: this.y - rand(10, 90), vx: 0, vy: -80, life: 0.3, size: 3, color: '#d68bff' });
        if (this.stateT >= (this.enraged ? 0.35 : 0.5)) { this.setState('dash'); Sfx.slash(); }
        break;

      case 'dash':
        this.vx = this.facing * 880;
        spawnParticle({ x: this.x - this.facing * 20, y: this.y - rand(20, 80), vx: -this.facing * 100, vy: 0, life: 0.25, size: 4, color: '#b070ff' });
        if (!this.hasHit && rectsOverlap(boxOf(this), boxOf(p))) {
          this.hasHit = true;
          p.takeHit(15, this.facing, 380);
        }
        if (this.stateT >= 0.42 || this.x <= 50 || this.x >= W - 50) this.recover(0.45);
        break;

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

      case 'leap':
        if (!this.hasHit) {
          this.hasHit = true;
          this.vy = -760;
          this.onGround = false;
          const tx = clamp(p.x, 60, W - 60);
          this.vx = (tx - this.x) / 0.84;
        }
        if (this.onGround && this.stateT > 0.15) {
          // smūgis į žemę
          addShake(9);
          Sfx.explode();
          for (let i = 0; i < 24; i++) spawnParticle({ x: this.x + rand(-60, 60), y: GROUND - 4, vx: rand(-260, 260), vy: rand(-300, -60), life: 0.6, size: rand(3, 6), color: '#c9a27a', grav: 700 });
          burst(this.x, GROUND - 10, '#d68bff', 16, 300, 5, 0.4);
          if (p.onGround && Math.abs(p.x - this.x) < 130) p.takeHit(14, sign(p.x - this.x), 300);
          this.recover(0.5);
        }
        break;

      case 'beam_tell': {
        this.vx = 0;
        const h = this.hand();
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(50, 90);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.25, size: 3, color: '#d9a0ff' });
        }
        addShake(1.5);
        if (this.stateT >= 1.3) {
          this.setState('beam');
          this.pose = this.computePose();
          const hh = this.hand();
          Game.beams.push({
            owner: 'boss', x: hh.x, y: hh.y, dir: this.facing, len: 1200, width: 44, dmg: 30,
            pierce: 1, knock: 420, level: 3, life: 1.2, max: 1.2, hit: new Set(), color: 'boss', clash: false,
          });
          Sfx.beam(3);
          addShake(8);
        }
        break;
      }

      case 'beam':
        this.vx = 0;
        if (this.stateT >= 1.2) this.recover(0.6);
        break;

      case 'recover':
        this.vx *= 0.85;
        if (this.stateT >= this.recoverT) {
          this.setState('idle');
          this.nextAtk = this.enraged ? rand(0.4, 0.8) : rand(0.8, 1.4);
        }
        break;

      case 'stunned':
        this.vx *= 0.9;
        if (Math.random() < 0.3) spawnParticle({ x: this.x + rand(-15, 15), y: this.y - 110, vx: rand(-30, 30), vy: -30, life: 0.4, size: 3, color: '#ffff88' });
        if (this.stateT >= 1.8) this.recover(0.1);
        break;

      case 'clash':
        this.vx = 0;
        break;

      case 'dead':
        this.vx *= 0.95;
        if (this.stateT < 1.6 && Math.random() < dt * 10) {
          explosion(this.x + rand(-40, 40), this.y - rand(20, 100), 0.6);
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

  chooseAttack(dist) {
    if (this.enraged && this.beamCd <= 0 && Math.random() < 0.55) {
      this.setState('beam_tell');
      this.facing = sign(Game.player.x - this.x);
      this.beamCd = 7;
      showHint('Raxas kaupia energiją! Laikyk L – bangų kova!', 2.2);
      return;
    }
    const opts = dist < 240 ? ['dash', 'leap', 'slash'] : ['dash', 'slash', 'slash', 'leap'];
    const pick = opts[Math.floor(Math.random() * opts.length)];
    if (pick === 'dash') this.setState('dash_tell');
    else if (pick === 'slash') this.setState('slash_tell');
    else this.setState('leap');
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

  computePose() {
    switch (this.state) {
      case 'dash_tell': case 'slash_tell': return POSES.swordRaise();
      case 'dash': return POSES.dash();
      case 'slash': return POSES.swordSlash();
      case 'leap': return this.onGround ? POSES.swordRaise() : POSES.jump();
      case 'beam_tell': return POSES.charge();
      case 'beam': case 'clash': return POSES.fire();
      case 'stunned': return POSES.hurt();
      case 'dead': return this.stateT > 1.5 ? POSES.dead() : POSES.hurt();
      default: return Math.abs(this.vx) > 40 ? POSES.walk(this.animT) : POSES.swordIdle(this.animT);
    }
  }

  takeHit(dmg, dir, knock) {
    if (this.dead || this.state === 'intro') return false;
    this.hp -= dmg;
    this.flash = 0.1;
    floater(this.x, this.y - 115, String(Math.round(dmg)), '#ffe14d', 18);
    Game.score += Math.round(dmg);
    if (knock >= 400 && (this.state === 'idle' || this.state === 'recover')) this.vx = dir * knock * 0.6;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.setState('dead');
      this.vx = dir * 200;
      this.vy = -300;
      this.onGround = false;
      Game.slowmo = 1.4;
      Game.flash = 0.6;
      Game.score += 2000;
      Game.beams = Game.beams.filter((b) => b.owner !== 'boss');
      Game.projectiles = Game.projectiles.filter((p) => p.owner !== 'enemy');
      showBanner('RAXAS NUGALĖTAS!', '+2000 taškų', 2.2);
    }
    return true;
  }

  draw(ctx) {
    drawShadow(ctx, this.x, this.y, 28);
    if (this.enraged && !this.dead) drawAura(ctx, this.x, this.y, 125, 'rgba(170,80,255,A)', 0.8, this.animT);
    const tell = (this.state === 'dash_tell' || this.state === 'slash_tell') && Math.floor(this.stateT * 18) % 2 === 0;
    drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style: STYLES.boss, scale: this.scale, flash: this.flash > 0 || tell, t: this.animT });
    if (this.state === 'beam_tell') {
      const h = this.hand();
      drawEnergyBall(ctx, h.x, h.y, 6 + this.stateT * 10, '#e6c0ff', 'rgba(160,60,255,0.6)', this.animT);
    }
  }
}
