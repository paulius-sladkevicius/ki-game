'use strict';
// Playable heroes (Ren and Raxas): movement, attacks, Ki blasts, the Ki Wave, guard and transformations.
// A hero is driven either by the player's Input or by an AI that produces the same kind of input.

const BEAM_LEVELS = {
  1: { cost: 10, dmg: 20, len: 280, width: 18, dur: 0.35, pierce: 1, knock: 150 },
  2: { cost: 25, dmg: 50, len: 640, width: 30, dur: 0.55, pierce: 2, knock: 260 },
  3: { cost: 45, dmg: 120, len: 1200, width: 54, dur: 0.9, pierce: 99, knock: 450 },
};

// Ki cost of a beam level (higher difficulties make the Ki Wave more expensive)
function beamCost(level) { return Math.round(BEAM_LEVELS[level].cost * diff().beamCost); }

// ball/blast: [inner, outer] color
const FORMS = [
  { id: 'base', name: 'Base Form', dmg: 1, speed: 250, style: 'heroBase', beam: 'base', aura: 'rgba(170,210,255,A)', auraP: '#bfe0ff', drain: 0, kiRegen: 6, chargeRate: 1, widthMul: 1, ball: ['#9fdcff', 'rgba(40,140,255,0.6)'] },
  { id: 'flame', name: 'Flame Form', dmg: 1.5, speed: 290, style: 'heroFlame', beam: 'flame', aura: 'rgba(255,110,30,A)', auraP: '#ff8a3a', drain: 6, kiRegen: 9, chargeRate: 1.4, widthMul: 1.5, ball: ['#ffc890', 'rgba(255,90,20,0.6)'], banner: '+50% damage, wider Ki Wave' },
  { id: 'storm', name: 'Storm Form', dmg: 2, speed: 310, style: 'heroStorm', beam: 'storm', aura: 'rgba(160,100,255,A)', auraP: '#c9a8ff', drain: 6.5, kiRegen: 13, chargeRate: 1.5, widthMul: 1.6, lightning: true, ball: ['#e8dcff', 'rgba(150,80,255,0.7)'], banner: '+100% damage, chain lightning, 2x Ki regen' },
  { id: 'sky', name: 'Sky Form', dmg: 3, speed: 330, style: 'heroSky', beam: 'sky', aura: 'rgba(40,220,190,A)', auraP: '#7ff0d8', drain: 6.5, kiRegen: 13, chargeRate: 2, widthMul: 1.8, teleport: true, ball: ['#d0fff4', 'rgba(20,200,170,0.7)'], banner: '+200% damage, teleport (double-tap ← or →)' },
  { id: 'star', name: 'Star Form', dmg: 4, speed: 340, style: 'heroStar', beam: 'star', aura: 'rgba(255,140,220,A)', auraP: '#ffc8ee', drain: 0, kiRegen: 30, chargeRate: 2.5, widthMul: 2.2, teleport: true, lightning: true, ball: ['#ffffff', 'rgba(255,110,210,0.8)'], banner: 'Ultimate power!' },
];

// Raxas, the former villain: a swordsman with a sword wave instead of a Ki blast.
const RAXAS_FORMS = [
  { id: 'base', name: 'Base Form', dmg: 1.6, speed: 270, style: 'raxasBase', beam: 'raxas', aura: 'rgba(170,80,255,A)', auraP: '#c99bff', drain: 0, kiRegen: 7, chargeRate: 1.1, widthMul: 1.1, ball: ['#e6c0ff', 'rgba(160,60,255,0.6)'] },
  { id: 'shadow', name: 'Shadow Form', dmg: 3, speed: 330, style: 'raxasShadow', beam: 'shadow', aura: 'rgba(120,40,200,A)', auraP: '#a070ff', drain: 6.5, kiRegen: 13, chargeRate: 2, widthMul: 1.8, teleport: true, ball: ['#d8b8ff', 'rgba(110,30,220,0.75)'], banner: '+200% damage, teleport (double-tap ← or →)' },
  { id: 'eclipse', name: 'Eclipse Form', dmg: 4, speed: 340, style: 'raxasEclipse', beam: 'eclipse', aura: 'rgba(255,200,80,A)', auraP: '#ffd98a', drain: 0, kiRegen: 30, chargeRate: 2.5, widthMul: 2.2, teleport: true, ball: ['#fff2c0', 'rgba(255,170,40,0.8)'], banner: 'Ultimate power!' },
];

const CHARACTERS = {
  ren: { id: 'ren', name: 'REN', forms: FORMS, finalForm: 4, scale: 1, color: '#8ab4ff' },
  raxas: { id: 'raxas', name: 'RAXAS', forms: RAXAS_FORMS, finalForm: 2, scale: 1.08, sword: true, color: '#c99bff' },
};

class Player {
  constructor(charId = 'ren') {
    this.char = CHARACTERS[charId];
    this.id = charId;
    this.forms = this.char.forms;
    this.scale = this.char.scale;
    this.ai = null;           // set for the AI-controlled ally
    this.x = 200; this.y = GROUND;
    this.vx = 0; this.vy = 0;
    this.w = 30; this.h = 78;
    this.facing = 1;
    this.maxHp = 100; this.hp = 100;
    this.maxKi = 100; this.ki = 100;
    this.power = 0;
    this.form = 0;
    this.unlocked = 0;        // highest unlocked form; the last form is for the final battle only
    this.transformTo = 1;
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
    this.tapDir = 0;
    this.tapT = 0;
    this.pose = POSES.idle(0);
    // training upgrades
    const up = Game.upgrades;
    this.maxHp = this.hp = 100 + up.hp * 20;
    this.maxKi = this.ki = 100 + up.ki * 20;
    this.kiRegenMul = 1 + up.ki * 0.15;
    this.beamMul = 1 + up.beam * 0.15;
    // guard energy: blocks hits from the front, refills over time
    this.maxGuard = this.guard = 100 + (up.guard || 0) * 20;
    this.guardRegenMul = 1 + (up.guard || 0) * 0.15;
    this.guardIdle = 0;
    this.guardLocked = false;
    this.guardFlash = 0;
    this.hurtDur = 0.3;
    // special techniques (see specials.js)
    this.specialCd = { 1: 0, 2: 0 };
    this.specialHits = new Set();
    this.ghosts = [];
    this.surgeT = 0;
    this.instinctT = 0;
    this.meteor = null;
  }

  // Guard is up while holding S, unless the guard was broken and has not refilled yet.
  get guarding() { return this.state === 'kicharge' && !this.guardLocked; }

  get F() { return this.forms[this.form]; }
  // the AI-controlled ally hits a bit softer, so the hero you control stays the main fighter
  get dmgMult() { return this.F.dmg * (this.ai ? 0.75 : 1) * (this.surgeT > 0 ? 2 : 1); }
  get speed() { return this.F.speed * (this.surgeT > 0 ? 1.3 : 1); }
  get alive() { return this.state !== 'dead'; }

  setState(s) { this.state = s; this.stateT = 0; }

  hand() { return handOf({ x: this.x, y: this.y, facing: this.facing, pose: this.pose, scale: this.scale }); }
  get controlled() { return Game.player === this; }

  update(dt, I = Input) {
    this.animT += dt;
    this.stateT += dt;
    this.tapT += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.blastCd > 0) this.blastCd -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt; else this.comboStep = 0;
    if (this.guardFlash > 0) this.guardFlash -= dt;
    for (const k of [1, 2]) if (this.specialCd[k] > 0) this.specialCd[k] -= dt;
    for (const g of this.ghosts) g.life -= dt;
    this.ghosts = this.ghosts.filter((g) => g.life > 0);
    if (this.instinctT > 0) this.instinctT -= dt;
    if (this.surgeT > 0) {
      // Crimson Surge burns a little HP while it lasts
      this.surgeT -= dt;
      if (this.hp > 10) this.hp = Math.max(10, this.hp - 2 * dt);
      if (Math.random() < dt * 20) spawnParticle({ x: this.x + rand(-20, 20), y: this.y - rand(0, 80), vx: rand(-20, 20), vy: rand(-200, -100), life: 0.4, size: rand(2, 4), color: '#ff5a4a' });
    }

    // Guard energy refills after a short pause without guarding.
    if (this.state !== 'kicharge') this.guardIdle += dt;
    if (this.guardIdle > 0.8 && this.guard < this.maxGuard) {
      this.guard = Math.min(this.maxGuard, this.guard + 16 * this.guardRegenMul * dt);
    }
    if (this.guardLocked && this.guard >= this.maxGuard * 0.35) {
      this.guardLocked = false;
      floater(this.x, this.y - 100, 'Guard ready', '#7fe8ff', 15);
    }

    // A transformation lasts while there is Power left.
    if (this.form > 0 && this.state !== 'transform' && this.state !== 'clash') {
      this.power -= this.F.drain * dt;
      if (this.power <= 0) {
        this.power = 0;
        this.form = 0;
        burst(this.x, this.y - 40, '#ffd34a', 20, 200);
        floater(this.x, this.y - 100, 'Form ended', '#ffd34a');
      }
    }

    if (!['charging', 'firing', 'kicharge', 'clash'].includes(this.state) && !this.flying) {
      this.ki = Math.min(this.maxKi, this.ki + this.F.kiRegen * this.kiRegenMul * dt);
    }

    let move = 0;
    if (I.down.left) move -= 1;
    if (I.down.right) move += 1;

    switch (this.state) {
      case 'normal':
        this.vx = move * this.speed;
        if (move) this.facing = move;
        if (I.pressed.left) this.checkDoubleTap(-1);
        if (I.pressed.right) this.checkDoubleTap(1);
        if (I.pressed.jump && this.onGround) {
          this.vy = -680; this.onGround = false; this.airT = 0; Sfx.jump();
        }
        if (I.pressed.special1) useSpecial(this, 1);
        else if (I.pressed.special2) useSpecial(this, 2);
        else if (I.pressed.punch) this.startPunch();
        else if (I.pressed.blast) this.fireBlast();
        else if (I.pressed.beam) this.startCharge();
        else if (I.pressed.transform) this.tryTransform();
        else if (I.down.charge && this.onGround) this.setState('kicharge');
        break;

      case 'dash': case 'special': case 'meteor': case 'sphere':
        updateSpecialState(this, dt);
        break;

      case 'punch':
        if (I.pressed.special1) { useSpecial(this, 1); break; }
        if (I.pressed.special2) { useSpecial(this, 2); break; }
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
        this.charge += dt * this.F.chargeRate;
        let lvl = this.charge < 0.5 ? 1 : this.charge < 1.5 ? 2 : 3;
        while (lvl > 1 && this.ki < beamCost(lvl)) lvl--;
        if (lvl > this.beamLevel) { burst(this.hand().x, this.hand().y, '#ffffff', 10, 160, 3, 0.3); Sfx.clashTick(); }
        this.beamLevel = lvl;
        if (this.controlled) { Sfx.chargeSet(Math.min(1, this.charge / 1.5)); if (lvl === 3) addShake(2.5); }
        // particles pulled into the palms
        const h = this.hand();
        for (let i = 0; i < lvl; i++) {
          const a = Math.random() * Math.PI * 2, r = rand(40, 80);
          spawnParticle({ x: h.x + Math.cos(a) * r, y: h.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.25, size: rand(1.5, 3.5), color: this.F.ball[0] });
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
        if (move) this.facing = move;   // turn to face the enemy without moving
        this.ki = Math.min(this.maxKi, this.ki + 30 * dt);
        this.guardIdle = 0;
        if (!this.guardLocked) {
          this.guard -= 7 * diff().guardCost * dt;
          if (this.guard <= 0) { this.guard = 0; this.guardLocked = true; floater(this.x, this.y - 100, 'Guard empty', '#7fe8ff', 15); }
        }
        auraParticles(this.x, this.y, 80, this.F.auraP, 2);
        if (Math.random() < dt * 8) spawnParticle({ x: this.x + rand(-40, 40), y: GROUND - 2, vx: rand(-60, 60), vy: rand(-120, -40), life: 0.5, size: 3, color: '#c9a27a', grav: 300 });
        if (I.pressed.special1) useSpecial(this, 1);
        else if (I.pressed.special2) useSpecial(this, 2);
        else if (!I.down.charge) this.setState('normal');
        else if (I.pressed.beam) this.startCharge();
        else if (I.pressed.transform) this.tryTransform();
        else if (I.pressed.punch) this.startPunch();
        break;

      case 'hurt':
        this.vx *= 0.9;
        if (this.stateT >= this.hurtDur) { this.hurtDur = 0.3; this.setState('normal'); }
        break;

      case 'transform': {
        this.vx = 0;
        const TF = this.forms[this.transformTo];
        auraParticles(this.x, this.y, 100, TF.auraP, 5, 34);
        if (TF.lightning && Math.random() < 0.3) addBolt(this.x + rand(-40, 40), this.y - rand(60, 120), this.x + rand(-20, 20), this.y - rand(0, 40), TF.auraP);
        addShake(4);
        if (this.stateT >= 1.0) {
          this.form = this.transformTo;
          this.setState('normal');
          Game.flash = 0.5;
          addShake(10);
          burst(this.x, this.y - 40, TF.auraP, 40, 450, 6, 0.7);
          burst(this.x, this.y - 40, '#ffffff', 20, 300, 5, 0.5);
          showBanner(TF.name.toUpperCase() + '!', TF.banner, 1.6);
        }
        break;
      }

      case 'clash':
        this.vx = 0;
        break;

      case 'dead':
        this.vx *= 0.95;
        break;
    }

    // Gravity and flight
    if (!this.onGround) {
      this.airT += dt;
      const canFly = this.state === 'normal' || this.state === 'punch' || this.state === 'blast';
      if (canFly && I.down.jump && this.airT > 0.22 && this.ki > 1) {
        this.flying = true;
        this.vy += (-220 - this.vy) * Math.min(1, dt * 6);
        this.ki -= 10 * dt;
      } else if (['charging', 'firing', 'clash', 'transform', 'dash', 'special', 'meteor', 'sphere'].includes(this.state)) {
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

    if (this.form > 0 && this.state !== 'dead') {
      auraParticles(this.x, this.y, 80, this.F.auraP, 1);
      if (this.F.lightning && Math.random() < dt * 5) addBolt(this.x + rand(-22, 22), this.y - rand(50, 90), this.x + rand(-22, 22), this.y - rand(10, 40), this.F.auraP);
    }
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
      case 'kicharge': return this.guardLocked ? POSES.kicharge(t) : POSES.guard(t);
      case 'dash': return POSES.dash();
      case 'special': return POSES[this.specialPose || 'transform'](t);
      case 'meteor': return this.comboStep === 3 ? POSES.kick() : this.comboStep === 2 ? POSES.punch2() : POSES.punch1();
      case 'sphere': return POSES.swordRaise();
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

  // Sky Form: double-tap ← or → to teleport.
  checkDoubleTap(dir) {
    if (this.F.teleport && this.tapDir === dir && this.tapT < 0.28) {
      this.teleport(dir);
      this.tapDir = 0;
      return;
    }
    this.tapDir = dir;
    this.tapT = 0;
  }

  teleport(dir) {
    if (this.ki < 8) return;
    this.ki -= 8;
    for (let i = 0; i < 14; i++) spawnParticle({ x: this.x + rand(-12, 12), y: this.y - rand(0, 78), vx: rand(-40, 40), vy: rand(-40, 40), life: 0.35, size: rand(2, 4), color: this.F.auraP });
    this.x = clamp(this.x + dir * 170, 20, W - 20);
    this.facing = dir;
    this.invuln = Math.max(this.invuln, 0.25);
    burst(this.x, this.y - 40, this.F.auraP, 12, 200, 3, 0.3);
    Sfx.teleport();
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
    const sword = this.char.sword;
    // Raxas' sword reaches further and hits harder than fists
    const w = sword ? (kick ? 96 : 84) : (kick ? 72 : 62);
    const hb = { x: this.facing > 0 ? this.x : this.x - w, y: this.y - 80, w, h: 58 };
    const dmg = (sword ? (kick ? 16 : 10) : (kick ? 14 : 8)) * this.dmgMult;
    if (sword) {
      Sfx.slash();
      for (let i = 0; i < 8; i++) {
        const a = -0.9 + i * 0.25;
        spawnParticle({ x: this.x + this.facing * Math.cos(a) * 60, y: this.y - 52 + Math.sin(a) * 40, vx: this.facing * 60, vy: 0, life: 0.18, size: 3, color: this.F.auraP });
      }
    }
    const hit = hitTargets(hb, dmg, this.facing, kick ? 380 : 120, 'melee', this);
    if (hit) {
      Sfx.hit();
      if (this.controlled) addHitstop(kick ? 0.08 : 0.045);
      addShake(kick ? 6 : 3);
      burst(this.x + this.facing * (w - 10), this.y - 52, '#ffffff', 8, 220, 3, 0.25);
      if (this.F.lightning) this.chainLightning(hit, dmg * 0.6);
    } else {
      Sfx.punch();
    }
  }

  // Storm Form: lightning jumps to the nearest other enemy.
  chainLightning(from, dmg) {
    let best = null, bd = 260;
    for (const t of liveTargets()) {
      if (t === from) continue;
      const d = Math.abs(t.x - from.x);
      if (d < bd) { bd = d; best = t; }
    }
    const h = this.hand();
    addBolt(h.x, h.y, from.x, from.y - 45, this.F.auraP);
    if (best) {
      addBolt(from.x, from.y - 45, best.x, best.y - 45, this.F.auraP);
      const dealt = best.takeHit(dmg, sign(best.x - from.x), 80, 'melee');
      if (dealt) onPlayerDamage(dmg, this);
      Sfx.zap();
    }
  }

  fireBlast() {
    if (this.blastCd > 0) return;
    if (this.ki < 5) { floater(this.x, this.y - 95, 'Not enough Ki!', '#7fc8ff', 15); return; }
    this.ki -= 5;
    this.blastCd = 0.22;
    this.setState('blast');
    this.pose = POSES.punch1();
    const h = this.hand();
    if (this.char.sword) {
      // Raxas throws a sword wave: stronger than a Ki blast (power 2)
      Game.projectiles.push({
        x: h.x + this.facing * 10, y: h.y, vx: this.facing * 620, vy: 0, r: 16,
        dmg: 7 * this.dmgMult, owner: 'player', src: this, life: 1.6, type: 'crescent', power: 2, trail: this.F.auraP,
      });
      Sfx.slash();
      return;
    }
    Game.projectiles.push({
      x: h.x + this.facing * 6, y: h.y, vx: this.facing * 720, vy: 0, r: this.form > 0 ? 9 : 7,
      dmg: 6 * this.dmgMult, owner: 'player', src: this, life: 1.6,
      inner: this.F.ball[0], outer: this.F.ball[1], trail: this.F.auraP,
    });
    Sfx.blast();
  }

  startCharge() {
    if (this.ki < beamCost(1)) { floater(this.x, this.y - 95, 'Not enough Ki! (hold S)', '#7fc8ff', 15); return; }
    this.setState('charging');
    this.charge = 0;
    this.beamLevel = 1;
    if (this.controlled) Sfx.chargeStart();
  }

  // Fires the beam. Returns the created beam.
  releaseBeam(forClash = false) {
    const L = BEAM_LEVELS[this.beamLevel];
    this.ki = Math.max(0, this.ki - beamCost(this.beamLevel));
    this.pose = POSES.fire();
    const h = this.hand();
    const b = {
      owner: 'player', src: this, x: h.x, y: h.y, dir: this.facing,
      len: L.len, width: L.width * this.F.widthMul, dmg: L.dmg * this.dmgMult * this.beamMul,
      pierce: L.pierce, knock: L.knock, level: this.beamLevel,
      life: L.dur, max: L.dur, hit: new Set(), color: this.F.beam, clash: false,
      power: { 1: 2, 2: 5, 3: 999 }[this.beamLevel],   // how many enemy shots it can cancel
    };
    Game.beams.push(b);
    if (this.controlled) Sfx.chargeStop();
    Sfx.beam(this.beamLevel);
    addShake(this.beamLevel * 3);
    this.setState(forClash ? 'clash' : 'firing');
    if (this.beamLevel === 3) floater(this.x, this.y - 110, 'KI WAVE!', this.F.auraP, 26);
    return b;
  }

  tryTransform() {
    if (this.unlocked === 0) { floater(this.x, this.y - 95, 'No form unlocked yet', '#ffd34a', 15); return; }
    if (this.form >= this.unlocked) return;
    const need = this.form === 0 ? 100 : 50;
    if (this.power < need) { floater(this.x, this.y - 95, this.form === 0 ? 'Power bar must be full' : 'Need at least half Power', '#ffd34a', 15); return; }
    this.startTransform(this.unlocked);
  }

  startTransform(to) {
    this.transformTo = to;
    this.setState('transform');
    if (this.controlled) Game.slowmo = 1.0;
    Game.beams = Game.beams.filter((b) => b.src !== this);
    if (this.controlled) { Sfx.chargeStop(); Sfx.transform(); }
  }

  // Final battle transformation - does not need Power.
  forceForm(to) {
    this.power = 100;
    this.ki = this.maxKi;
    this.hp = Math.min(this.maxHp, this.hp + 40);
    this.invuln = 0;
    if (this.state === 'dead') return;
    this.startTransform(to);
  }

  // A downed hero gets back up (between waves).
  revive(frac) {
    if (this.alive) return;
    this.hp = Math.round(this.maxHp * frac);
    this.setState('normal');
    this.vx = 0;
    this.invuln = 1.2;
    burst(this.x, this.y - 40, '#9fffb0', 24, 260, 4, 0.5);
    floater(this.x, this.y - 100, this.char.name + ' is back!', '#9fffb0', 18);
  }

  unlock(form) {
    this.unlocked = Math.max(this.unlocked, form);
    this.power = 100;
  }

  gainPower(v) {
    this.power = Math.min(100, this.power + v);
  }

  takeHit(dmg, dir, knock = 200) {
    if (!this.alive || this.state === 'transform' || this.state === 'clash' || this.invuln > 0) return false;
    // Silent Instinct: every attack is dodged
    if (this.instinctT > 0) {
      ghostAt(this);
      this.x = clamp(this.x + dir * 55, 20, W - 20);
      this.invuln = 0.25;
      floater(this.x, this.y - 100, 'DODGE', '#e8e8ff', 15);
      Sfx.teleport();
      return true;
    }
    dmg *= Game.dangerMul || 1;   // act 2 enemies hit harder
    let guardBreak = false;
    // Guard: the attack must come from the front (it pushes us backwards).
    if (this.guarding && dir === -this.facing) {
      const cost = Math.max(8, dmg * 3) * diff().guardCost;
      if (this.guard >= cost) {
        this.guard -= cost;
        this.guardFlash = 0.18;
        this.vx = dir * Math.min(140, knock * 0.4);
        this.invuln = 0.2;
        this.gainPower(dmg * 0.3);
        Sfx.block();
        addShake(3);
        floater(this.x, this.y - 95, 'BLOCK', '#7fe8ff', 16);
        burst(this.x + this.facing * 34, this.y - 45, '#bff4ff', 10, 220, 3, 0.25);
        return true;
      }
      // not enough energy: the guard breaks and the rest of the hit goes through
      dmg *= 1 - this.guard / cost;
      this.guard = 0;
      this.guardLocked = true;
      guardBreak = true;
      Sfx.guardBreak();
      floater(this.x, this.y - 115, 'GUARD BREAK!', '#ff9a40', 20);
      for (let i = 0; i < 16; i++) spawnParticle({ x: this.x + this.facing * 34, y: this.y - rand(15, 80), vx: rand(-200, 200) + this.facing * 120, vy: rand(-250, 50), life: 0.5, size: rand(2, 5), color: '#7fe8ff', grav: 600 });
    }
    this.hp -= dmg;
    if (Game.stats) Game.stats.dmgTaken += dmg;   // for the star rating
    this.gainPower(dmg * 0.8);
    this.flash = 0.1;
    Game.combo = 0;
    Sfx.hurt();
    if (this.controlled) { vibrate(dmg >= 20 ? 80 : 35); addShake(6); }
    floater(this.x, this.y - 90, '-' + Math.round(dmg), '#ff5555', 18);
    burst(this.x, this.y - 45, '#ff9a7a', 10, 200, 4, 0.3);
    if (this.controlled) Sfx.chargeStop();
    if (this.hp <= 0) {
      this.hp = 0;
      this.setState('dead');
      this.vx = dir * 220; this.vy = -320; this.onGround = false;
      Game.beams = Game.beams.filter((b) => b.src !== this);
      return true;
    }
    this.setState('hurt');
    this.hurtDur = guardBreak ? 0.75 : 0.3;
    this.vx = dir * knock;
    this.vy = this.onGround ? -150 : this.vy;
    Game.beams = Game.beams.filter((b) => b.src !== this || b.clash);
    this.invuln = 0.7;
    return true;
  }

  draw(ctx) {
    for (const g of this.ghosts) {
      ctx.globalAlpha = 0.35 * (g.life / g.max);
      drawHumanoid(ctx, { x: g.x, y: g.y, facing: g.facing, pose: g.pose, style: g.style, scale: g.scale, t: this.animT });
    }
    ctx.globalAlpha = 1;
    drawShadow(ctx, this.x, this.y, 22);
    if (this.surgeT > 0) drawAura(ctx, this.x, this.y, 115, 'rgba(255,60,40,A)', 1.1, this.animT);
    if (this.instinctT > 0) drawAura(ctx, this.x, this.y, 115, 'rgba(230,230,255,A)', 0.9 + Math.sin(this.animT * 8) * 0.2, this.animT);
    const F = this.F;
    if (this.form > 0 || (this.state === 'kicharge' && this.guardLocked) || this.state === 'transform' || (this.state === 'charging' && this.beamLevel >= 2)) {
      const intensity = this.state === 'transform' ? 1.6 : this.state === 'kicharge' ? 1.2 : 0.8;
      drawAura(ctx, this.x, this.y, 110, this.state === 'transform' ? this.forms[this.transformTo].aura : F.aura, intensity, this.animT);
    }
    if (this.invuln > 0 && this.alive && Math.floor(this.invuln * 20) % 2 === 0) ctx.globalAlpha = 0.45;
    let style = STYLES[F.style];
    if (this.state === 'transform' && Math.floor(this.stateT * 14) % 2 === 1) style = STYLES[this.forms[this.transformTo].style];
    drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style, scale: this.scale, flash: this.flash > 0, t: this.animT });
    ctx.globalAlpha = 1;
    if (this.guarding) this.drawGuard(ctx);
    if (this.state === 'sphere') {
      // the World Sphere grows above the hero's head
      const r = 10 + Math.min(1, this.stateT / 2) * 60;
      drawEnergyBall(ctx, this.x, this.y - 150, r, '#dff4ff', 'rgba(80,170,255,0.7)', this.animT);
    }
    // with two heroes, a small marker shows which one you control
    if (Game.ally && this.controlled && this.alive) {
      const top = this.y - this.h * this.scale - 30 + Math.sin(this.animT * 5) * 3;
      ctx.fillStyle = this.char.color;
      ctx.beginPath(); ctx.moveTo(this.x - 7, top); ctx.lineTo(this.x + 7, top); ctx.lineTo(this.x, top + 9); ctx.closePath(); ctx.fill();
    }
    if (this.state === 'charging') {
      const h = this.hand();
      drawEnergyBall(ctx, h.x, h.y, 5 + this.beamLevel * 4 + Math.min(this.charge, 2) * 2, F.ball[0], F.ball[1], this.animT);
    }
  }

  // Energy shield in front of the hero; brighter when it blocks a hit, fainter when low.
  drawGuard(ctx) {
    const k = this.guard / this.maxGuard;
    const cx = this.x + this.facing * 4, cy = this.y - 42;
    const a0 = this.facing > 0 ? -1.15 : Math.PI - 1.15;
    const pulse = 1 + Math.sin(this.animT * 12) * 0.03;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.35 + 0.45 * k + (this.guardFlash > 0 ? 0.4 : 0);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(80,200,255,0.5)';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(cx, cy, 46 * pulse, a0, a0 + 2.3); ctx.stroke();
    ctx.strokeStyle = this.guardFlash > 0 ? '#ffffff' : '#bff4ff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 46 * pulse, a0, a0 + 2.3); ctx.stroke();
    ctx.restore();
  }
}
