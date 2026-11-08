'use strict';
// Enemy soldiers.
// ai: melee = hits up close, ranged = shoots from afar, elite = both, drone = flies and shoots, bomber = rolls and explodes,
// shade = fades away and reappears behind a hero, golem = slow and heavy, slams the ground around it.

const ENEMY_DEFS = {
  scout: { hp: 30, speed: 120, windup: 0.45, dmg: 6, style: 'scout', score: 100, ai: 'melee', cd: [1.2, 2.0] },
  gunner: { hp: 24, speed: 105, windup: 0.55, dmg: 7, style: 'gunner', score: 150, ai: 'ranged', cd: [2.0, 3.0] },
  drone: { hp: 20, speed: 110, windup: 0.5, dmg: 6, score: 150, ai: 'drone', cd: [1.8, 2.8], w: 36, h: 30 },
  armored: { hp: 60, speed: 80, windup: 0.55, dmg: 10, style: 'armored', score: 250, ai: 'melee', cd: [1.4, 2.2], block: true, w: 34 },
  bomber: { hp: 14, speed: 200, windup: 0.6, dmg: 16, score: 120, ai: 'bomber', cd: [0, 0], w: 30, h: 30 },
  brute: { hp: 45, speed: 140, windup: 0.4, dmg: 9, style: 'brute', score: 200, ai: 'melee', cd: [1.0, 1.8] },
  elite: { hp: 55, speed: 150, windup: 0.35, dmg: 9, style: 'elite', score: 300, ai: 'elite', cd: [0.9, 1.5] },
  clone: { hp: 1, speed: 120, windup: 0.5, dmg: 6, style: 'nyx', score: 50, ai: 'ranged', cd: [1.6, 2.4], life: 9 },
  // act 2: the Hollow King's army
  shade: { hp: 70, speed: 170, windup: 0.35, dmg: 11, style: 'shade', score: 350, ai: 'shade', cd: [1.0, 1.6] },
  golem: { hp: 170, speed: 62, windup: 0.8, dmg: 17, style: 'golem', score: 500, ai: 'golem', cd: [1.6, 2.4], w: 46, h: 104, scale: 1.35, heavy: true },
  wisp: { hp: 34, speed: 120, windup: 0.6, dmg: 9, score: 250, ai: 'drone', shot: 'orb', cd: [2.2, 3.2], w: 34, h: 34 },
};

class Enemy {
  constructor(type, side) {
    const d = ENEMY_DEFS[type];
    this.type = type;
    this.def = d;
    this.ai = d.ai;
    this.x = side === 'L' ? -30 : W + 30;
    this.y = d.ai === 'drone' ? GROUND - rand(110, 160) : GROUND;
    this.hoverY = this.y;
    this.vx = 0; this.vy = 0;
    this.w = d.w || 30; this.h = d.h || 76;
    this.scale = d.scale || 1;
    this.alpha = 1;
    this.facing = side === 'L' ? 1 : -1;
    this.hp = this.maxHp = Math.round(d.hp * (Game.enemyHpMul || 1));   // act 2 enemies are tougher
    this.speed = d.speed * rand(0.85, 1.15);
    this.state = 'walk';
    this.stateT = 0;
    this.atkCd = rand(0.4, 1.4);
    this.flash = 0;
    this.animT = rand(0, 10);
    this.age = 0;
    this.dead = false;
    this.remove = false;
    this.entering = true;
    this.struck = false;
    this.stunT = 0;
    this.shootMode = false;
    this.pose = POSES.walk(0);
    this.dodgeCd = 0;
    // champion: a stronger golden enemy (more often on harder difficulties)
    this.champion = type !== 'clone' && Math.random() < diff().champion;
    this.dmgMul = 1;
    if (this.champion) {
      this.hp = this.maxHp = Math.round(this.maxHp * 1.6);
      this.dmgMul = 1.3;
      this.speed *= 1.1;
    }
  }

  get dmg() { return this.def.dmg * this.dmgMul; }
  // smart ground fighters: can dodge beams, block punches and jump at flying heroes
  get smart() { return ['melee', 'elite', 'shade', 'ranged'].includes(this.ai) && this.type !== 'clone' && !this.def.heavy; }

  setState(s) { this.state = s; this.stateT = 0; }

  update(dt) {
    const p = nearestHero(this.x);
    this.animT += dt;
    this.stateT += dt;
    this.age += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.dodgeCd > 0) this.dodgeCd -= dt;
    const dx = p.x - this.x;
    const dist = Math.abs(dx);

    // Nyx's clones vanish after a while
    if (this.def.life && this.age > this.def.life && !this.dead) {
      this.dead = true; this.setState('dying');
      burst(this.x, this.y - 40, '#d040a0', 14, 200, 4, 0.4);
    }

    switch (this.state) {
      case 'walk':
        this.facing = sign(dx);
        if (this.smart && this.tryDodge(dt)) break;
        this.think(p, dx, dist);
        if (this.ai !== 'drone') {
          for (const o of Game.enemies) {
            if (o !== this && !o.dead && o.ai !== 'drone' && Math.abs(o.x - this.x) < 26) this.vx += sign(this.x - o.x) * 40;
          }
        }
        break;

      case 'windup':
        this.vx = 0;
        if (this.ai === 'bomber' && Math.random() < 0.4) spawnParticle({ x: this.x, y: this.y - 34, vx: rand(-30, 30), vy: -60, life: 0.3, size: 3, color: '#ff4020' });
        if (this.stateT >= this.def.windup * diff().tell) {
          this.setState('strike');
          this.struck = false;
        }
        break;

      case 'strike':
        if (!this.struck) {
          this.struck = true;
          this.doStrike(p);
        }
        if (this.stateT >= 0.25) {
          this.setState('walk');
          this.atkCd = rand(this.def.cd[0], this.def.cd[1]);
        }
        break;

      case 'stun':
        this.vx *= 0.88;
        if (this.stateT >= this.stunT) this.setState('walk');
        break;

      case 'dying':
        this.vx *= 0.96;
        if (this.stateT >= 0.9) this.remove = true;
        break;

      case 'dodge':
        // jumped over a beam; back to walking after landing
        if (this.y >= GROUND && this.stateT > 0.15) this.setState('walk');
        break;

      case 'block':
        this.vx = 0;
        if (this.stateT >= 0.35) { this.setState('walk'); this.atkCd = Math.min(this.atkCd, 0.2); }
        break;

      case 'jumpstrike':
        // jumping attack against a hero hovering above
        if (!this.struck) {
          for (const h of liveHeroes()) {
            if (rectsOverlap(boxOf(this), boxOf(h))) { this.struck = true; h.takeHit(this.dmg, this.facing, 250); break; }
          }
        }
        if (this.y >= GROUND && this.stateT > 0.2) { this.setState('walk'); this.atkCd = rand(this.def.cd[0], this.def.cd[1]); }
        break;

      case 'fade':
        // shade: vanishes, reappears behind the hero and attacks at once
        this.vx = 0;
        this.alpha = clamp(1 - this.stateT / 0.35, 0.08, 1);
        if (this.stateT >= 0.55) {
          this.x = clamp(p.x - p.facing * 55, 25, W - 25);
          this.facing = sign(p.x - this.x);
          burst(this.x, this.y - 40, '#7a50c0', 12, 180, 3, 0.35);
          this.alpha = 1;
          this.shootMode = false;
          this.setState('windup');
        }
        break;
    }

    if (this.ai === 'drone' && this.state !== 'dying') {
      this.y = lerp(this.y, this.hoverY + Math.sin(this.animT * 3) * 12, Math.min(1, dt * 4));
      this.vy = 0;
    } else {
      this.vy += GRAVITY * dt;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND) { this.y = GROUND; this.vy = 0; }
    if (this.entering) {
      if (this.x > 30 && this.x < W - 30) this.entering = false;
    } else {
      this.x = clamp(this.x, 20, W - 20);
    }

    this.pose = this.computePose();
  }

  // Jump when a hero facing us is charging a Ki Wave (chance per second depends on the difficulty).
  tryDodge(dt) {
    if (this.dodgeCd > 0 || this.y < GROUND || this.entering) return false;
    const threat = liveHeroes().some((h) => h.state === 'charging' && h.charge > 0.25 && h.facing === sign(this.x - h.x) && Math.abs(h.x - this.x) < 750 && h.onGround);
    if (!threat || Math.random() > diff().dodge * dt) return false;
    this.vy = -680;
    this.dodgeCd = 1.6;
    this.setState('dodge');
    return true;
  }

  think(p, dx, dist) {
    // anti-air: jump at a hero hovering right above
    if (this.smart && diff().antiAir && this.ai !== 'ranged' && !p.onGround && p.y < this.y - 70 && dist < 90 && this.atkCd <= 0 && this.y >= GROUND && p.alive) {
      this.vy = -780;
      this.vx = sign(dx) * 140;
      this.struck = false;
      this.setState('jumpstrike');
      return;
    }
    switch (this.ai) {
      case 'melee':
        if (dist > 48) this.vx = this.facing * this.speed;
        else {
          this.vx = 0;
          if (this.atkCd <= 0 && p.alive && Math.abs(p.y - this.y) < 60) { this.shootMode = false; this.setState('windup'); }
        }
        break;
      case 'elite':
        if (dist > 260 && this.atkCd <= 0 && p.alive && !this.entering) { this.shootMode = true; this.setState('windup'); break; }
        if (dist > 48) this.vx = this.facing * this.speed;
        else {
          this.vx = 0;
          if (this.atkCd <= 0 && p.alive && Math.abs(p.y - this.y) < 60) { this.shootMode = false; this.setState('windup'); }
        }
        break;
      case 'ranged':
      case 'drone': {
        const near = this.ai === 'drone' ? 200 : 260;
        const far = this.ai === 'drone' ? 340 : 430;
        if (this.entering) this.vx = this.facing * this.speed;
        else if (dist < near && this.x > 50 && this.x < W - 50) this.vx = -this.facing * this.speed;
        else if (dist > far) this.vx = this.facing * this.speed;
        else this.vx = 0;
        if (this.atkCd <= 0 && !this.entering && p.alive) { this.shootMode = true; this.setState('windup'); }
        break;
      }
      case 'shade':
        if (dist > 150 && this.atkCd <= 0 && p.alive && !this.entering) { this.setState('fade'); break; }
        if (dist > 48) this.vx = this.facing * this.speed;
        else {
          this.vx = 0;
          if (this.atkCd <= 0 && p.alive && Math.abs(p.y - this.y) < 60) { this.shootMode = false; this.setState('windup'); }
        }
        break;
      case 'golem':
        if (dist > 70) this.vx = this.facing * this.speed;
        else {
          this.vx = 0;
          if (this.atkCd <= 0 && p.alive) { this.shootMode = false; this.setState('windup'); }
        }
        break;
      case 'bomber':
        this.vx = this.facing * this.speed;
        if (dist < 50 && Math.abs(p.y - this.y) < 80 && p.alive) this.setState('windup');
        break;
    }
  }

  doStrike(p) {
    if (this.ai === 'bomber') {
      this.explodeSelf(true);
      return;
    }
    if (this.ai === 'golem') {
      // ground slam: hits every hero on the ground nearby
      addShake(7);
      Sfx.boom();
      for (let i = 0; i < 18; i++) spawnParticle({ x: this.x + this.facing * 40 + rand(-50, 50), y: GROUND - 4, vx: rand(-220, 220), vy: rand(-280, -60), life: 0.5, size: rand(3, 6), color: '#8a8f9a', grav: 700 });
      for (const h of liveHeroes()) {
        if (h.onGround && Math.abs(h.x - (this.x + this.facing * 30)) < 105) h.takeHit(this.dmg, sign(h.x - this.x) || this.facing, 320);
      }
      return;
    }
    if (this.shootMode && this.def.shot === 'orb') {
      Game.projectiles.push({ x: this.x + this.facing * 12, y: this.y - 17, vx: this.facing * 120, vy: -40, r: 9, dmg: this.dmg, owner: 'enemy', type: 'orb', homing: true, speed: 150, life: 4.5, inner: '#c8f7ff', outer: 'rgba(40,160,220,0.7)', trail: '#8fe6ff' });
      Sfx.blast();
      return;
    }
    if (this.shootMode) {
      const h = this.ai === 'drone' ? { x: this.x + this.facing * 10, y: this.y - 12 } : handOf({ x: this.x, y: this.y, facing: this.facing, pose: POSES.punch1() });
      const ty = p.y - 45;
      const ang = Math.atan2(ty - h.y, p.x - h.x);
      const elite = this.ai === 'elite';
      Game.projectiles.push({
        x: h.x, y: h.y, vx: Math.cos(ang) * (elite ? 420 : 340), vy: Math.sin(ang) * (elite ? 420 : 340), r: 7, dmg: this.dmg,
        owner: 'enemy', life: 3,
        inner: this.type === 'clone' ? '#ffb0f0' : elite ? '#ff9090' : '#ffd27a',
        outer: this.type === 'clone' ? 'rgba(210,60,170,0.6)' : elite ? 'rgba(255,30,60,0.6)' : 'rgba(255,90,20,0.6)',
      });
      Sfx.blast();
      return;
    }
    const hb = { x: this.facing > 0 ? this.x : this.x - 56, y: this.y - 72, w: 56, h: 48 };
    for (const h of liveHeroes()) if (rectsOverlap(hb, boxOf(h))) h.takeHit(this.dmg, this.facing, 220);
    Sfx.punch();
  }

  // The robot explodes: hurt = whether it damages the player
  explodeSelf(hurt) {
    explosion(this.x, this.y - 15, 1.1);
    Sfx.boom();
    addShake(8);
    if (hurt) {
      for (const h of liveHeroes()) {
        if (Math.abs(h.x - this.x) < 90 && Math.abs(h.y - this.y) < 100) h.takeHit(this.dmg, sign(h.x - this.x), 350);
      }
    }
    this.dead = true;
    this.remove = true;
  }

  computePose() {
    switch (this.state) {
      case 'windup': return POSES.windup();
      case 'strike': return POSES.punch1();
      case 'stun': return POSES.hurt();
      case 'block': return POSES.guard(this.animT);
      case 'dodge': return POSES.jump();
      case 'jumpstrike': return POSES.kick();
      case 'dying': return this.y >= GROUND && this.stateT > 0.2 ? POSES.dead() : POSES.hurt();
      default: return Math.abs(this.vx) > 10 ? POSES.walk(this.animT) : POSES.idle(this.animT);
    }
  }

  // Returns the damage dealt (a number) or false.
  takeHit(dmg, dir, knock, kind = 'melee') {
    if (this.dead) return false;
    if (this.state === 'fade') return false;      // a fading shade cannot be hit
    if (this.def.heavy) knock *= 0.3;              // golems barely move
    // armored soldiers block Ki from the front (except a level 3 wave)
    if (this.def.block && (kind === 'blast' || kind === 'beam') && this.facing === -dir && this.state !== 'stun') {
      dmg *= 0.15;
      knock = 0;
      floater(this.x, this.y - 100, 'BLOCK', '#9fe6ff', 15);
      burst(this.x + this.facing * 18, this.y - 50, '#9fe6ff', 6, 150, 3, 0.25);
    }
    // smart enemies sometimes block a punch from the front
    // (while already blocking, every punch from the front is stopped; a stunned enemy can block once it starts recovering)
    const canBlock = this.state === 'block' || ((this.state === 'walk' || (this.state === 'stun' && this.stateT > 0.15)) && Math.random() < diff().block);
    if (kind === 'melee' && this.smart && this.y >= GROUND && this.facing === -dir && canBlock) {
      const already = this.state === 'block';
      dmg *= 0.2;
      knock = 0;
      if (!already) this.setState('block');
      this.vx = 0;
      floater(this.x, this.y - 100, 'BLOCK', '#ffd0a0', 15);
      burst(this.x + this.facing * 18, this.y - 50, '#ffd0a0', 6, 150, 3, 0.25);
    }
    this.hp -= dmg;
    this.flash = 0.12;
    floater(this.x, this.y - 88, String(Math.round(dmg)), '#ffffff', 16);
    if (this.hp <= 0) {
      Game.score += this.def.score;
      spawnCoins(this.x, this.y - 40, (COIN_VALUES[this.type] || 0) * (this.champion ? 2.5 : 1));
      if (this.ai === 'bomber') { this.explodeSelf(false); return dmg; }
      this.dead = true;
      this.setState('dying');
      this.vx = dir * Math.max(250, knock);
      this.vy = -380;
      Sfx.explode();
      explosion(this.x, this.y - 40, 0.7);
      addShake(5);
      return dmg;
    }
    if (knock > 0 && this.ai !== 'bomber' && !(this.def.heavy && knock < 120)) {
      this.setState('stun');
      this.stunT = knock > 200 ? 0.5 : 0.28;
      this.vx = dir * knock;
      if (knock > 300 && this.ai !== 'drone') this.vy = -250;
    }
    return dmg;
  }

  draw(ctx) {
    if (this.state === 'dying') ctx.globalAlpha = clamp(1 - (this.stateT - 0.5) / 0.4, 0, 1);
    if (this.type === 'clone') ctx.globalAlpha *= 0.65 + Math.sin(this.animT * 10) * 0.15;
    const fl = this.flash > 0;
    drawShadow(ctx, this.x, this.y, 20 * this.scale);
    ctx.globalAlpha *= this.alpha;
    if (this.champion && !this.dead) drawAura(ctx, this.x, this.y, this.h * this.scale + 30, 'rgba(255,210,60,A)', 0.9, this.animT);
    if (this.type === 'wisp') drawWisp(ctx, this.x, this.y, this.facing, this.animT, fl);
    else if (this.ai === 'drone') drawDrone(ctx, this.x, this.y, this.facing, this.animT, fl);
    else if (this.ai === 'bomber') drawBomber(ctx, this.x, this.y, this.facing, this.animT, fl, this.state === 'windup');
    else drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style: STYLES[this.def.style], scale: this.scale, flash: fl, t: this.animT });
    ctx.globalAlpha = 1;
    if (this.state === 'windup') text(ctx, '!', this.x, this.y - this.h - 22, 26, '#ff4040', 'center', '900');
    if (this.champion && !this.dead) text(ctx, '★', this.x, this.y - this.h - 26, 14, '#ffd34a', 'center');
    if (!this.dead && this.hp < this.maxHp && this.maxHp > 1) {
      const top = this.y - this.h - 18;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(this.x - 18, top, 36, 5);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(this.x - 18, top, 36 * (this.hp / this.maxHp), 5);
    }
  }
}
