'use strict';
// AI for the hero you are not controlling. It fills a fake input object every frame,
// so the AI hero uses exactly the same moves and rules as the player.

class AllyAI {
  constructor(hero) {
    this.hero = hero;
    this.input = { down: {}, pressed: {} };
    this.beamHold = 0;
    this.attackT = 0;
    this.blastT = 1;
    this.beamT = 3;
    this.jumpT = 0;
  }

  think(dt) {
    const h = this.hero;
    const I = this.input;
    for (const k in I.pressed) delete I.pressed[k];
    for (const k of ['left', 'right', 'jump', 'charge']) I.down[k] = false;
    this.attackT -= dt; this.blastT -= dt; this.beamT -= dt; this.jumpT -= dt;
    if (!h.alive || Game.state !== 'PLAY') { I.down.beam = false; this.beamHold = 0; return I; }

    // keep charging a beam that was started
    if (this.beamHold > 0) {
      this.beamHold -= dt;
      I.down.beam = this.beamHold > 0;
      return I;
    }
    I.down.beam = false;
    if (['clash', 'transform', 'hurt', 'dead'].includes(h.state)) return I;

    const go = (dir) => { I.down[dir > 0 ? 'right' : 'left'] = true; };
    const targets = liveTargets().filter((t) => !t.entering && t.state !== 'dying' && t.state !== 'intro');

    // 0) the final sphere is charging: gather next to the player for the Twin Wave
    if (Game.bosses.some((b) => !b.dead && b.state === 'final_tell')) {
      const lead = Game.player;
      if (lead && lead.alive) {
        const want = lead.x - lead.facing * 55;
        if (Math.abs(want - h.x) > 20) go(want - h.x);
      }
      return I;
    }

    // 0b) lasers about to fire: jump over a low one, get down for a high one
    const laser = Game.hazards.find((z) => z.kind === 'laser' && z.t > z.tell - 0.45 && z.t < z.tell + 0.1);
    if (laser) {
      if (laser.y > GROUND - 40) { if (h.onGround && this.jumpT <= 0) { I.pressed.jump = true; this.jumpT = 0.5; } I.down.jump = true; }
      else if (!h.onGround) I.down.charge = true;
      return I;
    }

    // 1) danger: a boss beam is coming -> fly over it or guard
    const bossBeam = Game.bosses.find((b) => !b.dead && (b.state === 'beam_tell' || b.state === 'beam'));
    if (bossBeam) {
      if (h.guard > h.maxGuard * 0.6 && h.onGround) { I.down.charge = true; if (h.facing !== sign(bossBeam.x - h.x)) go(bossBeam.x - h.x); }
      else { I.down.jump = true; if (h.onGround && this.jumpT <= 0) { I.pressed.jump = true; this.jumpT = 0.5; } }
      return I;
    }

    // 2) danger: an enemy is about to hit us -> guard (facing it)
    const threat = targets.find((t) => {
      const d = Math.abs(t.x - h.x);
      const tell = ['windup', 'dash_tell', 'dash', 'charge_tell', 'charge', 'slash_tell'].includes(t.state);
      return tell && d < (t.state === 'windup' ? 110 : 320) && sign(h.x - t.x) === t.facing;
    });
    if (threat && h.onGround && !h.guardLocked && h.guard > 25) {
      if (h.facing !== sign(threat.x - h.x)) go(threat.x - h.x);
      I.down.charge = true;
      return I;
    }

    // 3) transform when possible
    const finalForm = h.char.finalForm;
    if (h.unlocked > h.form && h.unlocked < finalForm && h.state === 'normal' && (h.form === 0 ? h.power >= 100 : h.power >= 50)) {
      I.pressed.transform = true;
      return I;
    }

    // 4) no enemies: stay near the player, recover Ki
    if (!targets.length) {
      const lead = Game.player;
      if (lead && lead.alive) {
        const want = lead.x - lead.facing * 80;
        if (Math.abs(want - h.x) > 40) go(want - h.x);
      }
      return I;
    }

    // 5) fight the nearest enemy
    targets.sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x));
    const t = targets[0];
    const dx = t.x - h.x, dist = Math.abs(dx), dir = sign(dx);
    const flying = t.ai === 'drone';
    const reach = h.char.sword ? 78 : 62;

    if (flying) {
      // fly up to the drone and shoot it
      if (h.y - 45 > t.y - 15) I.down.jump = true;
      if (h.onGround && this.jumpT <= 0) { I.pressed.jump = true; this.jumpT = 0.4; }
      if (dist > 160) go(dx); else if (h.facing !== dir) go(dx);
      if (Math.abs((h.y - 55) - (t.y - 15)) < 30 && this.blastT <= 0 && h.ki > 10) { I.pressed.blast = true; this.blastT = 0.45; }
      return I;
    }

    // charge a beam from a distance now and then
    if (dist > 200 && dist < 650 && this.beamT <= 0 && h.ki > 40 && h.onGround && h.state === 'normal') {
      if (h.facing !== dir) { go(dx); return I; }
      I.pressed.beam = true; I.down.beam = true;
      this.beamHold = h.ki > 70 ? 1.0 : 0.6;
      this.beamT = rand(3.5, 6);
      return I;
    }
    if (dist > 160 && dist < 520 && this.blastT <= 0 && h.ki > 25) {
      if (h.facing !== dir) go(dx);
      else { I.pressed.blast = true; this.blastT = rand(0.7, 1.3); }
      return I;
    }

    if (dist > reach - 8) {
      // do not stand exactly on top of the player
      go(dx);
    } else {
      if (h.facing !== dir) go(dx);
      else if (this.attackT <= 0) { I.pressed.punch = true; this.attackT = 0.22; }
    }
    return I;
  }
}
