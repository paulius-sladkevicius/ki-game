'use strict';
// Vorgo kariai.
// ai: melee – muša iš arti, ranged – šaudo iš toli, elite – abu, drone – skraido ir šaudo, bomber – rieda ir sprogsta.

const ENEMY_DEFS = {
  scout: { hp: 30, speed: 120, windup: 0.45, dmg: 6, style: 'scout', score: 100, ai: 'melee', cd: [1.2, 2.0] },
  gunner: { hp: 24, speed: 105, windup: 0.55, dmg: 7, style: 'gunner', score: 150, ai: 'ranged', cd: [2.0, 3.0] },
  drone: { hp: 20, speed: 110, windup: 0.5, dmg: 6, score: 150, ai: 'drone', cd: [1.8, 2.8], w: 36, h: 30 },
  armored: { hp: 60, speed: 80, windup: 0.55, dmg: 10, style: 'armored', score: 250, ai: 'melee', cd: [1.4, 2.2], block: true, w: 34 },
  bomber: { hp: 14, speed: 200, windup: 0.6, dmg: 16, score: 120, ai: 'bomber', cd: [0, 0], w: 30, h: 30 },
  brute: { hp: 45, speed: 140, windup: 0.4, dmg: 9, style: 'brute', score: 200, ai: 'melee', cd: [1.0, 1.8] },
  elite: { hp: 55, speed: 150, windup: 0.35, dmg: 9, style: 'elite', score: 300, ai: 'elite', cd: [0.9, 1.5] },
  clone: { hp: 1, speed: 120, windup: 0.5, dmg: 6, style: 'nyx', score: 50, ai: 'ranged', cd: [1.6, 2.4], life: 9 },
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
    this.facing = side === 'L' ? 1 : -1;
    this.hp = this.maxHp = d.hp;
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
  }

  setState(s) { this.state = s; this.stateT = 0; }

  update(dt) {
    const p = Game.player;
    this.animT += dt;
    this.stateT += dt;
    this.age += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    const dx = p.x - this.x;
    const dist = Math.abs(dx);

    // Nyx klonai išnyksta po kurio laiko
    if (this.def.life && this.age > this.def.life && !this.dead) {
      this.dead = true; this.setState('dying');
      burst(this.x, this.y - 40, '#d040a0', 14, 200, 4, 0.4);
    }

    switch (this.state) {
      case 'walk':
        this.facing = sign(dx);
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
        if (this.stateT >= this.def.windup) {
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

  think(p, dx, dist) {
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
    if (this.shootMode) {
      const h = this.ai === 'drone' ? { x: this.x + this.facing * 10, y: this.y - 12 } : handOf({ x: this.x, y: this.y, facing: this.facing, pose: POSES.punch1() });
      const ty = p.y - 45;
      const ang = Math.atan2(ty - h.y, p.x - h.x);
      const elite = this.ai === 'elite';
      Game.projectiles.push({
        x: h.x, y: h.y, vx: Math.cos(ang) * (elite ? 420 : 340), vy: Math.sin(ang) * (elite ? 420 : 340), r: 7, dmg: this.def.dmg,
        owner: 'enemy', life: 3,
        inner: this.type === 'clone' ? '#ffb0f0' : elite ? '#ff9090' : '#ffd27a',
        outer: this.type === 'clone' ? 'rgba(210,60,170,0.6)' : elite ? 'rgba(255,30,60,0.6)' : 'rgba(255,90,20,0.6)',
      });
      Sfx.blast();
      return;
    }
    const hb = { x: this.facing > 0 ? this.x : this.x - 56, y: this.y - 72, w: 56, h: 48 };
    if (rectsOverlap(hb, boxOf(p))) p.takeHit(this.def.dmg, this.facing, 220);
    Sfx.punch();
  }

  // Robotas sprogsta: hurt – ar žeidžia žaidėją
  explodeSelf(hurt) {
    const p = Game.player;
    explosion(this.x, this.y - 15, 1.1);
    Sfx.boom();
    addShake(8);
    if (hurt && p.alive && Math.abs(p.x - this.x) < 90 && Math.abs(p.y - this.y) < 100) p.takeHit(this.def.dmg, sign(p.x - this.x), 350);
    this.dead = true;
    this.remove = true;
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

  // Grąžina padarytą žalą (skaičių) arba false.
  takeHit(dmg, dir, knock, kind = 'melee') {
    if (this.dead) return false;
    // šarvuotis blokuoja Ki iš priekio (išskyrus 3 lygio bangą)
    if (this.def.block && (kind === 'blast' || kind === 'beam') && this.facing === -dir && this.state !== 'stun') {
      dmg *= 0.15;
      knock = 0;
      floater(this.x, this.y - 100, 'BLOKAS', '#9fe6ff', 15);
      burst(this.x + this.facing * 18, this.y - 50, '#9fe6ff', 6, 150, 3, 0.25);
    }
    this.hp -= dmg;
    this.flash = 0.12;
    floater(this.x, this.y - 88, String(Math.round(dmg)), '#ffffff', 16);
    if (this.hp <= 0) {
      Game.score += this.def.score;
      spawnCoins(this.x, this.y - 40, ZENU_VALUES[this.type] || 0);
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
    if (knock > 0 && this.ai !== 'bomber') {
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
    drawShadow(ctx, this.x, this.y, 20);
    if (this.ai === 'drone') drawDrone(ctx, this.x, this.y, this.facing, this.animT, fl);
    else if (this.ai === 'bomber') drawBomber(ctx, this.x, this.y, this.facing, this.animT, fl, this.state === 'windup');
    else drawHumanoid(ctx, { x: this.x, y: this.y, facing: this.facing, pose: this.pose, style: STYLES[this.def.style], flash: fl, t: this.animT });
    ctx.globalAlpha = 1;
    if (this.state === 'windup') text(ctx, '!', this.x, this.y - this.h - 22, 26, '#ff4040', 'center', '900');
    if (!this.dead && this.hp < this.maxHp && this.maxHp > 1) {
      const top = this.y - this.h - 18;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(this.x - 18, top, 36, 5);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(this.x - 18, top, 36 * (this.hp / this.maxHp), 5);
    }
  }
}
