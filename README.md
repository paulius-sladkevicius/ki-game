# Ki Wave

A simple 2D action game that runs in the browser. Ren, a young martial artist, fires charged **Ki Waves**, unlocks powerful **transformations** and fights his way through five levels to stop the space tyrant Vorg.

The game design document is in [DESIGN.md](DESIGN.md).

## How to play

Open `index.html` in a browser – no server or build step needed. On phones and tablets, touch buttons are shown (play in landscape).

| Key | Action |
|---|---|
| ← → / A D | move |
| ↑ / W / Space | jump, hold in the air to fly (uses Ki) |
| J | punch (3-hit combo) |
| K | Ki blast |
| L (hold → release) | Ki Wave: 3 charge levels |
| S / ↓ (hold) | guard: blocks hits from the front and charges Ki, uses GUARD energy |
| T | transform (when the Power bar is full) |
| P / Esc | pause (Q in the pause menu – quit to menu) |
| M | sound on / off |

## Features

- **5 levels** with their own backgrounds: Mountain Monastery, Desert Canyon, Ice City, Volcano Island, Vorg's Ship in Orbit.
- **Enemies:** scouts, gunners, flying drones, armored soldiers (block Ki from the front), exploding robots, lava brutes, elite guards.
- **Bosses:** Raxas (swordsman), the twins Zul and Zel, General Krag (shield, charge, earthquake), Nyx (teleport, clones), Vorg (3 phases and a final beam clash).
- **Ki Wave** with 3 charge levels and **beam clashes** against bosses (mash L).
- **Guard:** an energy shield that fully blocks hits from the front. Each blocked hit drains the GUARD bar, which refills over time when you stop guarding. If a hit is stronger than the energy left, the guard breaks: part of the damage gets through and you are briefly stunned.
- **Shot collisions:** your Ki blasts and enemy shots cancel each other out. A Ki Wave also cancels enemy shots until its power is used up (level 1: 2 shots, level 2: 5, level 3: unlimited).
- **Transformations (T):**
  - Flame Form (level 1): +50% damage;
  - Storm Form (level 3): +100% damage, punches throw chain lightning;
  - Sky Form (level 5): +200% damage, teleport with a double-tap of ← / →;
  - Star Form: in the final battle against Vorg.
- **Coins and training:** enemies drop coins. Between levels you can spend them to upgrade health, Ki, Ki Wave damage or guard (5 levels each).
- **Music:** every level has its own tune, bosses and the finale have separate tracks – all generated with the Web Audio API.
- Dialogs with speaker portraits.
- **Mobile:** labelled touch buttons, fullscreen mode, a rotate-your-phone hint, vibration when hit.
- 5 Star Crystals, score, combos, best score, saved progress ("Continue" in the menu), a checkpoint before every boss.
- All graphics are drawn with the Canvas API and all sounds are generated in code – no external assets.

## Project structure

```
index.html, style.css
src/core.js       shared state and helpers
src/input.js      keyboard and touch input
src/audio.js      sound effects and music
src/particles.js  particles and floating numbers
src/draw.js       figures, poses, backgrounds, beams
src/player.js     the hero, Ki Wave, transformations
src/enemies.js    Vorg's soldiers
src/boss.js       bosses
src/coins.js      coins
src/combat.js     hits, projectiles, beam clashes
src/level.js      level scripts and dialogs
src/ui.js         HUD, menu, screens
src/main.js       game loop
```
