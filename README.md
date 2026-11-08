# Ki Wave

A simple 2D action game that runs in the browser. Ren, a young martial artist, fires charged **Ki Waves**, unlocks powerful **transformations** and fights through ten levels in two acts: first against the space tyrant Vorg, then – together with his former enemy Raxas – against the Hollow King.

The game design document is in [DESIGN.md](DESIGN.md).

## How to play

Open `index.html` in a browser – no server or build step needed. On phones and tablets, touch buttons are shown (play in landscape); the ⛶ button at the top switches to fullscreen. For the best experience on a phone or tablet, use the browser menu → **Add to Home screen**: the game then starts as a fullscreen app in landscape (works on iPhone too).

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
| C | switch between Ren and Raxas (from level 6) |
| M | sound on / off |

## Features

- **10 levels in two acts**, each with its own background:
  - Act 1 (Ren alone, recover 5 Star Crystals): Mountain Monastery, Desert Canyon, Ice City, Volcano Island, Vorg's Ship in Orbit.
  - Act 2 (Ren and Raxas, break 5 Hollow Seals): Sunken Ruins, Sky Temple, Crystal Caverns, Storm Coast, The Hollow Throne.
- **An ally:** Raxas, the swordsman you fought in level 1, joins you in act 2. He has his own moves (sword combo, sword wave instead of a Ki blast, his own beam) and forms (Shadow Form, Eclipse Form).
- **Choose who you control:** press C (or tap ⇄) to switch between Ren and Raxas at any time; the other hero is controlled by the computer – it attacks, guards, dodges boss beams and transforms. In training you can choose who starts as the lead fighter. If your hero falls, control passes to the other one, and the fallen hero gets back up after the wave.
- **Enemies:** scouts, gunners, flying drones, armored soldiers (block Ki from the front), exploding robots, lava brutes, elite guards; in act 2 also shades (vanish and reappear behind you), stone golems and wisps (homing orbs).
- **Bosses:** Raxas (swordsman), the twins Zul and Zel, General Krag (shield, charge, earthquake), Nyx (teleport, clones), Vorg (3 phases and a final beam clash); in act 2 Sable (shadow pillars), Gale (tornadoes, dive attacks), Quartzus (crystal rain, shield), Volta (lightning strikes) and the Hollow King (3 phases and a final **Twin Wave** clash fought by both heroes).
- **Ki Wave** with 3 charge levels and **beam clashes** against bosses (mash L).
- **Difficulty** (in the menu): Easy / Normal / Hard / Very Hard. Harder levels mean tougher enemies and bosses, shorter attack warnings, less healing, more expensive guard and Ki Wave, extra enemies and golden **champions** – and smarter enemies that jump over your Ki Wave, block punches, interrupt your charging and jump at heroes hovering above them.
- **Stars and ranks:** every level gives up to 3 stars (★ complete, ★ no defeat, ★ little damage) and a rank (S = 3 stars and fast, A, B, C). The best result is saved per difficulty; **Select level** in the menu lets you replay any level you have reached.
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
- **Mobile:** labelled touch buttons that never fall off the screen (beside the game when there is room, otherwise semi-transparent over its corners), fullscreen button, a rotate-your-phone hint, vibration when hit.
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
src/player.js     heroes (Ren, Raxas), Ki Wave, transformations
src/ally.js       AI for the hero you are not controlling
src/enemies.js    Vorg's soldiers
src/boss.js       bosses
src/coins.js      coins
src/combat.js     hits, projectiles, hazards, beam clashes
src/layout.js     screen layout and touch controls
src/level.js      level scripts and dialogs
src/ui.js         HUD, menu, screens
src/main.js       game loop
```
