'use strict';
// Herojus Kai: judėjimas, smūgiai, Ki šūviai, Ki Banga ir transformacija.

const BEAM_LEVELS = {
  1: { cost: 10, dmg: 20, len: 280, width: 18, dur: 0.35, pierce: 1, knock: 150 },
  2: { cost: 25, dmg: 50, len: 640, width: 30, dur: 0.55, pierce: 2, knock: 260 },
  3: { cost: 45, dmg: 120, len: 1200, width: 54, dur: 0.9, pierce: 99, knock: 450 },
};

const FORMS = [
  { name: 'Bazinė forma', dmg: 1, speed: 250, style: 'heroBase', beam: 'base', aura: 'rgba(170,210,255,A)', auraP: '#bfe0ff' },
  { name: 'Liepsnos forma', dmg: 1.5, speed: 290, style: 'heroFlame', beam: 'flame', aura: 'rgba(255,200,40,A)', auraP: '#ffd34a' },
];

class Player {
  constructor() {
    this.x = 200; this.y = GROUND;
    this.vx = 0; this.vy = 0;
    this.w = 30; this.h = 78;
    this.facing = 1;
    this.maxHp = 100; this.hp = 100;
    this.maxKi = 100; this.ki = 100;
    this.power = 0;
    this.form = 0;
    this.flameUnlocked = false;
    this.state = 'normal';
    this.stateT = 0;
    this.animT = 0;
    this.onGround = true;
    this.airT = 0;
    this.flying = false;
    this.invuln = 0;
    this.comboStep = 0;
    this.comboWindow = 0;
    this.queuedPunch = false;
    this.punchHit = false;
    this.punchDur = 0.2;
    this.blastCd = 0;
    this.charge = 0;
    this.beamLevel = 1;
    this.flash = 0;
    this.pose = POSES.idle(0);
  }

  get F() { return FORMS[this.form]; }
  get dmgMult() { return this.F.dmg; }
  get alive() { return this.state !== 'dead'; }

  setState(s) { this.state = s; this.stateT = 0; }

  hand() { return handOf({ x: this.x, y: this.y, facing: this.facing, pose: this.pose }); }

  update(dt) {
    const I = Input;
    this.animT += dt;
    this.stateT += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.blastCd > 0) this.blastCd -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt; else this.comboStep = 0;

    // Transformacija trunka, kol yra Jėgos.
    if (this.form > 0 && this.state !== 'transform' && this.state !== 'clash') {
      this.power -= 6 * dt;
      if (this.power <= 0) {
        this.power = 0;
        this.form = 0;
        burst(this.x, this.y - 40, '#ffd34a', 20, 200);
        floater(this.x, this.y - 100, 'Forma baigėsi', '#ffd34a');
      }
    }

    if (!['charging', 'firing', 'kicharge', 'clash'].includes(this.state) && !this.flying) {
      this.ki = Math.min(this.maxKi, this.ki + (this.form > 0 ? 9 : 6) * dt);
    }

    let move = 0;
    if (I.down.left) move -= 1;
    if (I.down.right) move += 1;

    switch (this.state) {
      case 'normal':
        this.vx = move * this.F.speed;
        if (move) this.facing = move;
        if (I.pressed.jump && this.onGround) {
          this.vy = -680; this.onGround = false; this.airT = 0; Sfx.jump();
        }
        if (I.pressed.punch) this.startPunch();
        else if (I.pressed.blast) this.fireBlast();
        else if (I.pressed.beam) this.startCharge();
        else if (I.pressed.transform) this.tryTransform();
        else if (I.down.charge && this.onGround) this.setState('kicharge');
        break;

      case 'punch':
        this.vx *= 0.82;
        if (!this.punchHit && this.stateT >= 0.07) { this.punchHit = true; this.doPunchHit(); }
        if (I.pressed.punch && this.stateT > 0.06) this.queuedPunch = true;
        if (this.stateT >= this.punchDur) {
          if (this.queuedPunch) this.startPunch(); else this.setState('normal');
        }
        break;

      case 'blast':
        this.vx *= 0.8;
        if (this.stateT >= 0.16) this.setState('normal');
        break;

      case 'charging': {
        this.vx = 0;
        if (move) this.facing = move;
        this.charge += dt * (this.form > 0 ? 1.4 : 1);
        let lvl = this.charge < 0.5 ? 1 : this.charge < 1.5 ? 2 : 3;
        while (lvl > 1 && this.ki < BEAM_LEVELS[lvl].cost) lvl--;
        if (lvl > this.beamLevel) { burst(this.hand().x, this.hand().y, '#ffffff', 10, 160, 3, 0.3); Sfx.clashTick(); }
        this.beamLevel = lvl;
        Sfx.chargeSet(Math.min(1, this.charge / 1.5));
        if (lvl === 3) addShake(2.5);
        // dalelės traukiamos į delnus
        const h = this.hand();
        for (let i = 0; i < lvl; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(40, 80);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.25, size: rand(1.5, 3.5), color: this.form > 0 ? '#ffe680' : '#9fdcff' });
        }
        if (!I.down.beam) this.releaseBeam();
        break;
      }

      case 'firing':
        this.vx = 0;
        if (this.stateT >= BEAM_LEVELS[this.beamLevel].dur) this.setState('normal');
        break;

      case 'kicharge':
        this.vx = 0;
        this.ki = Math.min(this.maxKi, this.ki + 35 * dt);
        auraParticles(this.x, this.y, 80, this.F.auraP, 2);
        if (Math.random() < dt * 8) spawnParticle({ x: this.x + rand(-40, 40), y: GROUND - 2, vx: rand(-60, 60), vy: rand(-120, -40), life: 0.5, size: 3, color: '#c9a27a', grav: 300 });
        if (!I.down.charge) this.setState('normal');
        else if (I.pressed.beam) this.startCharge();
        else if (I.pressed.transform) this.tryTransform();
        else if (I.pressed.punch) this.startPunch();
        break;

      case 'hurt':
        this.vx *= 0.9;
        if (this.stateT >= 0.3) this.setState('normal');
        break;

      case 'transform':
        this.vx = 0;
        auraParticles(this.x, this.y, 100, '#ffe680', 5, 34);
        addShake(4);
        if (this.stateT >= 1.0) {
          this.form = 1;
          this.setState('normal');
          Game.flash = 0.5;
          addShake(10);
          burst(this.x, this.y - 40, '#ffd34a', 40, 450, 6, 0.7);
          burst(this.x, this.y - 40, '#ffffff', 20, 300, 5, 0.5);
          showBanner('LIEPSNOS FORMA!', '+50 % žala, platesnė Ki Banga', 1.6);
        }
        break;

      case 'clash':
        this.vx = 0;
        break;

      case 'dead':
        this.vx *= 0.95;
        break;
    }

    // Gravitacija ir skrydis
    if (!this.onGround) {
      this.airT += dt;
      const canFly = this.state === 'normal' || this.state === 'punch' || this.state === 'blast';
      if (canFly && I.down.jump && this.airT > 0.22 && this.ki > 1) {
        this.flying = true;
        this.vy += (-220 - this.vy) * Math.min(1, dt * 6);
        this.ki -= 10 * dt;
      } else if (['charging', 'firing', 'clash', 'transform'].includes(this.state)) {
        this.flying = false;
        this.vy = lerp(this.vy, 0, Math.min(1, dt * 10));
      } else {
        this.flying = false;
        this.vy += GRAVITY * dt;
        if (this.state === 'normal' && I.down.charge) this.vy += 1500 * dt;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = clamp(this.x, 20, W - 20);
    if (this.y < 130) { this.y = 130; if (this.vy < 0) this.vy = 0; }
    if (this.y >= GROUND) {
      this.y = GROUND;
      if (this.vy > 0) this.vy = 0;
      if (!this.onGround) { this.onGround = true; this.flying = false; this.airT = 0; }
    } else {
      this.onGround = false;
    }

    if (this.form > 0 && this.state !== 'dead') auraParticles(this.x, this.y, 80, '#ffd34a', 1);
    if (this.flying) spawnParticle({ x: this.x - this.facing * 14, y: this.y - 20, vx: -this.facing * 120, vy: rand(-20, 20), life: 0.3, size: 3, color: this.F.auraP });

    this.pose = this.computePose();
  }

  computePose() {
    const t = this.animT;
    switch (this.state) {
      case 'punch': return this.comboStep === 3 ? POSES.kick() : this.comboStep === 2 ? POSES.punch2() : POSES.punch1();
      case 'blast': return POSES.punch1();
      case 'charging': return POSES.charge();
      case 'firing': case 'clash': return POSES.fire();
      case 'kicharge': return POSES.kicharge(t);
      case 'hurt': return POSES.hurt();
      case 'transform': return POSES.transform(t);
      case 'dead': return this.onGround ? POSES.dead() : POSES.hurt();
      default:
        if (!this.onGround) {
          if (this.flying) return POSES.fly(t);
          return this.vy < 0 ? POSES.jump() : POSES.fall();
        }
        return Math.abs(this.vx) > 10 ? POSES.run(t) : POSES.idle(t);
    }
  }

  startPunch() {
    if (this.comboWindow > 0 && this.comboStep < 3) this.comboStep++;
    else this.comboStep = 1;
    this.punchDur = this.comboStep === 3 ? 0.3 : 0.2;
    this.comboWindow = this.punchDur + 0.35;
    this.queuedPunch = false;
    this.punchHit = false;
    this.vx = this.facing * 60;
    this.setState('punch');
  }

  doPunchHit() {
    const kick = this.comboStep === 3;
    const w = kick ? 72 : 62;
    const hb = { x: this.facing > 0 ? this.x : this.x - w, y: this.y - 76, w, h: 54 };
    const dmg = (kick ? 14 : 8) * this.dmgMult;
    const hit = hitTargets(hb, dmg, this.facing, kick ? 380 : 120);
    if (hit) {
      Sfx.hit();
      addHitstop(kick ? 0.08 : 0.045);
      addShake(kick ? 6 : 3);
      burst(this.x + this.facing * (w - 10), this.y - 52, '#ffffff', 8, 220, 3, 0.25);
    } else {
      Sfx.punch();
    }
  }

  fireBlast() {
    if (this.blastCd > 0) return;
    if (this.ki < 5) { floater(this.x, this.y - 95, 'Trūksta Ki!', '#7fc8ff', 15); return; }
    this.ki -= 5;
    this.blastCd = 0.22;
    this.setState('blast');
    this.pose = POSES.punch1();
    const h = this.hand();
    const flame = this.form > 0;
    Game.projectiles.push({
      x: h.x + this.facing * 6, y: h.y, vx: this.facing * 720, vy: 0, r: flame ? 9 : 7,
      dmg: 6 * this.dmgMult, owner: 'player', life: 1.6,
      inner: flame ? '#ffe680' : '#9fdcff', outer: flame ? 'rgba(255,160,0,0.6)' : 'rgba(40,140,255,0.6)',
    });
    Sfx.blast();
  }

  startCharge() {
    if (this.ki < BEAM_LEVELS[1].cost) { floater(this.x, this.y - 95, 'Trūksta Ki! (laikyk S)', '#7fc8ff', 15); return; }
    this.setState('charging');
    this.charge = 0;
    this.beamLevel = 1;
    Sfx.chargeStart();
  }

  // Paleidžia bangą. Grąžina sukurtą bangą.
  releaseBeam(forClash = false) {
    const L = BEAM_LEVELS[this.beamLevel];
    this.ki = Math.max(0, this.ki - L.cost);
    this.pose = POSES.fire();
    const h = this.hand();
    const flame = this.form > 0;
    const b = {
      owner: 'player', x: h.x, y: h.y, dir: this.facing,
      len: L.len, width: L.width * (flame ? 1.5 : 1), dmg: L.dmg * this.dmgMult,
      pierce: L.pierce, knock: L.knock, level: this.beamLevel,
      life: L.dur, max: L.dur, hit: new Set(), color: this.F.beam, clash: false,
    };
    Game.beams.push(b);
    Sfx.chargeStop();
    Sfx.beam(this.beamLevel);
    addShake(this.beamLevel * 3);
    this.setState(forClash ? 'clash' : 'firing');
    if (this.beamLevel === 3) floater(this.x, this.y - 110, 'KI BANGA!', flame ? '#ffe14d' : '#9fdcff', 26);
    return b;
  }

  tryTransform() {
    if (!this.flameUnlocked) { floater(this.x, this.y - 95, 'Forma dar neatrakinta', '#ffd34a', 15); return; }
    if (this.form > 0) return;
    if (this.power < 100) { floater(this.x, this.y - 95, 'Reikia pilnos Jėgos juostos', '#ffd34a', 15); return; }
    this.setState('transform');
    Game.slowmo = 1.0;
    Sfx.chargeStop();
    Sfx.transform();
  }

  gainPower(v) {
    this.power = Math.min(100, this.power + v);
  }

  takeHit(dmg, dir, knock = 200) {
    if (!this.alive || this.state === 'transform' || this.state === 'clash' || this.invuln > 0) return false;
    if (this.state === 'kicharge') { dmg *= 0.5; knock *= 0.3; }
    this.hp -= dmg;
    this.gainPower(dmg * 0.8);
    this.flash = 0.1;
    Game.combo = 0;
    Sfx.hurt();
    addShake(6);
    floater(this.x, this.y - 90, '-' + Math.round(dmg), '#ff5555', 18);
    burst(this.x, this.y - 45, '#ff9a7a', 10, 200, 4, 0.3);
    Sfx.chargeStop();
    if (this.hp <= 0) {
      this.hp = 0;
      this.setState('dead');
      this.vx = dir * 220; this.vy = -320; this.onGround = false;
      Game.beams = Game.beams.filter((b) => b.owner !== 'player');
      return true;
    }
    if (this.state !== 'kicharge') {
      this.setState('hurt');
      this.vx = dir * knock;
      this.vy = this.onGround ? -150 : this.vy;
      Game.beams = Game.beams.filter((b) => b.owner !== 'player' || b.clash);
    }
    this.invuln = 0.7;
    return true;
  }

  draw(ctx) {
    drawShadow(ctx, this.x, this.y, 22);
    const F = this.F;
    if (this.form > 0 || this.state === 'kicharge' || this.state === 'transform' || (this.state === 'charging' && this.beamLevel >= 2)) {
      const intensity = this.state === 'transform' ? 1.6 : this.state === 'kicharge' ? 1.2 : 0.8;
      drawAura(ctx, this.x, this.y, 110, this.state === 'transform' ? FORMS[1].aura : F.aura, intensity, this.animT);
    }
    if (this.invuln > 0 && this.alive && Math.floor(this.invuln * 20) % 2 === 0) ctx.globalAlpha = 0.45;
    let style = STYLES[F.style];
    if (this.state === 'transform' && Math.floor(this.stateT * 14) % 2 === 1) style = STYLES.heroFlame;
    drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style, flash: this.flash > 0, t: this.animT });
    ctx.globalAlpha = 1;
    if (this.state === 'charging') {
      const h = this.hand();
      const flame = this.form > 0;
      drawEnergyBall(ctx, h.x, h.y, 5 + this.beamLevel * 4 + Math.min(this.charge, 2) * 2, flame ? '#ffe680' : '#9fdcff', flame ? 'rgba(255,160,0,0.6)' : 'rgba(40,140,255,0.6)', this.animT);
    }
  }
}
