'use strict';
// Vorgo kariai: žvalgas (muša iš arti) ir šaulys (šaudo iš toli).

const ENEMY_DEFS = {
  scout: { hp: 30, speed: 120, windup: 0.45, dmg: 6, style: 'scout', score: 100 },
  gunner: { hp: 24, speed: 105, windup: 0.55, dmg: 7, style: 'gunner', score: 150 },
};

class Enemy {
  constructor(type, side) {
    const d = ENEMY_DEFS[type];
    this.type = type;
    this.def = d;
    this.x = side === 'L' ? -30 : W + 30;
    this.y = GROUND;
    this.vx = 0; this.vy = 0;
    this.w = 30; this.h = 76;
    this.facing = side === 'L' ? 1 : -1;
    this.hp = this.maxHp = d.hp;
    this.speed = d.speed * rand(0.85, 1.15);
    this.state = 'walk';
    this.stateT = 0;
    this.atkCd = rand(0.4, 1.4);
    this.flash = 0;
    this.animT = rand(0, 10);
    this.dead = false;
    this.remove = false;
    this.entering = true;
    this.struck = false;
    this.stunT = 0;
    this.pose = POSES.walk(0);
  }

  setState(s) { this.state = s; this.stateT = 0; }

  update(dt) {
    const p = Game.player;
    this.animT += dt;
    this.stateT += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    const dx = p.x - this.x;
    const dist = Math.abs(dx);

    switch (this.state) {
      case 'walk':
        this.facing = sign(dx);
        if (this.type === 'scout') {
          if (dist > 48) this.vx = this.facing * this.speed;
          else {
            this.vx = 0;
            if (this.atkCd <= 0 && p.alive && Math.abs(p.y - this.y) < 60) this.setState('windup');
          }
        } else {
          if (this.entering) this.vx = this.facing * this.speed;
          else if (dist < 260 && this.x > 50 && this.x < W - 50) this.vx = -this.facing * this.speed;
          else if (dist > 430) this.vx = this.facing * this.speed;
          else this.vx = 0;
          if (this.atkCd <= 0 && !this.entering && p.alive) this.setState('windup');
        }
        // nesustoti vienam ant kito
        for (const o of Game.enemies) {
          if (o !== this && !o.dead && Math.abs(o.x - this.x) < 26) this.vx += sign(this.x - o.x) * 40;
        }
        break;

      case 'windup':
        this.vx = 0;
        if (this.stateT >= this.def.windup) {
          this.setState('strike');
          this.struck = false;
        }
        break;

      case 'strike':
        if (!this.struck) {
          this.struck = true;
          if (this.type === 'scout') {
            const hb = { x: this.facing > 0 ? this.x : this.x - 56, y: this.y - 72, w: 56, h: 48 };
            if (rectsOverlap(hb, boxOf(p))) p.takeHit(this.def.dmg, this.facing, 220);
            Sfx.punch();
          } else {
            const h = handOf({ x: this.x, y: this.y, facing: this.facing, pose: POSES.punch1() });
            const ty = p.y - 45;
            const ang = Math.atan2(ty - h.y, p.x - h.x);
            Game.projectiles.push({
              x: h.x, y: h.y, vx: Math.cos(ang) * 340, vy: Math.sin(ang) * 340, r: 7, dmg: this.def.dmg,
              owner: 'enemy', life: 3, inner: '#ffd27a', outer: 'rgba(255,90,20,0.6)',
            });
            Sfx.blast();
          }
        }
        if (this.stateT >= 0.25) {
          this.setState('walk');
          this.atkCd = this.type === 'scout' ? rand(1.2, 2.0) : rand(2.0, 3.0);
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
    }

    this.vy += GRAVITY * dt;
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

  computePose() {
    switch (this.state) {
      case 'windup': return POSES.windup();
      case 'strike': return POSES.punch1();
      case 'stun': return POSES.hurt();
      case 'dying': return this.y >= GROUND && this.stateT > 0.2 ? POSES.dead() : POSES.hurt();
      default: return Math.abs(this.vx) > 10 ? POSES.walk(this.animT) : POSES.idle(this.animT);
    }
  }

  takeHit(dmg, dir, knock) {
    if (this.dead) return false;
    this.hp -= dmg;
    this.flash = 0.12;
    floater(this.x, this.y - 88, String(Math.round(dmg)), '#ffffff', 16);
    if (this.hp <= 0) {
      this.dead = true;
      this.setState('dying');
      this.vx = dir * Math.max(250, knock);
      this.vy = -380;
      Game.score += this.def.score;
      Sfx.explode();
      explosion(this.x, this.y - 40, 0.7);
      addShake(5);
      return true;
    }
    this.setState('stun');
    this.stunT = knock > 200 ? 0.5 : 0.28;
    this.vx = dir * knock;
    if (knock > 300) this.vy = -250;
    return true;
  }

  draw(ctx) {
    if (this.state === 'dying') ctx.globalAlpha = clamp(1 - (this.stateT - 0.5) / 0.4, 0, 1);
    drawShadow(ctx, this.x, this.y, 20);
    drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style: STYLES[this.def.style], flash: this.flash > 0, t: this.animT });
    ctx.globalAlpha = 1;
    if (this.state === 'windup') text(ctx, '!', this.x, this.y - 100, 26, '#ff4040', 'center', '900');
    if (!this.dead && this.hp < this.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(this.x - 18, this.y - 96, 36, 5);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(this.x - 18, this.y - 96, 36 * (this.hp / this.maxHp), 5);
    }
  }
}
