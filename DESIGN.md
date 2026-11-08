# Ki Wave: game design

A simple 2D action game for the browser (side view, arena fights). The hero, a young martial artist, fires energy waves and turns his power into stronger and stronger transformations.

---

## 1. Story

**Hero:** Ren, a martial arts student who grew up in a mountain monastery. A hidden, ancient power sleeps inside him.

**Conflict:** the tyrant **Vorg** lands from space with his army and steals the **5 Star Crystals**. Their energy powers his flagship's planet-breaker weapon.

**Goal:** Ren travels through five locations, defeats Vorg's generals, recovers the crystals and unlocks new forms along the way.

**Ending:** in the last battle Vorg transforms himself. Ren reaches his ultimate form and wins the final beam clash with the **Star Wave**.

---

## 2. Controls

| Key | Action |
|---|---|
| ← → / A D | Move |
| ↑ / W / Space | Jump (hold in the air: fly, uses Ki) |
| J | Melee punch (3-hit combo) |
| K | Small Ki blast (fast, cheap) |
| **L (hold → release)** | **Ki Wave**: the longer you hold, the stronger it is |
| **T** | **Transform** (when the Power bar is full) |
| S / ↓ | Guard (blocks hits, uses Guard energy) / charge Ki |
| P / Esc | Pause |

Mobile: virtual buttons on the left and action buttons on the right.

---

## 3. Core mechanics

### 3.1. Four bars
- **Health (HP):** goes down when you get hit.
- **Ki (blue):** spent on blasts, waves and flight. Regenerates slowly, or quickly while holding "charge" (S).
- **Power (yellow):** rises when you hit enemies and take damage. When full, you can transform.
- **Guard (cyan):** spent on blocking. Refills over time when you are not guarding.

### 3.2. Guard
- Hold **S**: an energy shield appears in front of the hero. Hits from the front are fully neutralized; hits from behind are not.
- Every blocked hit costs Guard energy (3x the hit's damage, at least 8), and holding the guard drains it slowly (7/s).
- The bar refills (16/s) after 0.8 s without guarding.
- **Guard break:** if a hit costs more than the energy left, the shield shatters, the rest of the damage goes through and the hero is stunned for 0.75 s. The guard stays locked until the bar refills to 35%.
- While guarding, the hero also charges Ki.

### 3.3. Shot collisions
- Player shots and enemy shots that meet cancel each other out. Each shot has a power (normal shots 1, a boss sword wave 2): the weaker shot disappears and the stronger one loses that much power.
- A Ki Wave cancels enemy shots until its power is used up: level 1 – 2 shots, level 2 – 5 shots, level 3 – unlimited. A boss beam swallows the player's Ki blasts; two beams meeting start a beam clash.

### 3.4. Ki Wave (main weapon)
1. Hold **L**: the hero cups his hands, a glowing ball grows between them and the screen shakes.
2. Charge levels:
   - **Level 1** (up to 0.5 s): short beam, 20 damage.
   - **Level 2** (0.5–1.5 s): long beam, 50 damage, pierces 1 enemy.
   - **Level 3** (>1.5 s): full screen, 120 damage, pierces everything, knocks enemies back.
3. While charging, the hero cannot move – it is a risk.
4. **Beam clash:** if a boss fires its own beam at the same time, the beams collide. Mash **L** quickly – whoever pushes harder wins.

### 3.5. Transformations
Each form is unlocked during a level, right before its boss. A transformation lasts a limited time (until the Power bar runs out), then the hero returns to his base form.

| Form | Unlocked | Look | Effect |
|---|---|---|---|
| **Base** | from the start | black hair, red headband | standard |
| **Flame Form** | level 1 | orange-red spiky hair, fiery aura | +50% damage, 1.5x wider wave |
| **Storm Form** | level 3 | violet hair, lightning around the body | +100% damage, 2x Ki regeneration, punches throw chain lightning |
| **Sky Form** | level 5 | teal hair, calm teal aura | +200% damage, short teleport (double-tap ← / →), wave charges 2x faster |
| **Star Form** | final battle only | rainbow hair, star particles | the final *Star Wave* |

**Transformation animation (~1 s):** the game slows down, the hero shouts, the screen flashes, and the hair color and aura change. The hero is invulnerable while transforming.

---

## 4. Levels

Each level: 2–3 enemy waves, then a boss.

| # | Location | Enemies | Boss | Reward |
|---|---|---|---|---|
| 1 | **Mountain Monastery** | Vorg's scouts and gunners | **Raxas**, a fast swordsman | crystal + **Flame Form** |
| 2 | **Desert Canyon** | flying drones (shoot) | **The twins Zul and Zel**, fight as a pair | crystal |
| 3 | **Ice City** | armored soldiers (block blasts, need punches) | **General Krag**, a giant with a shield | crystal + **Storm Form** |
| 4 | **Volcano Island** | lava brutes, exploding robots | **Nyx**, an illusionist with clones | crystal |
| 5 | **Vorg's ship in orbit** | elite guard | **Vorg** (3 phases) | crystal + **Sky Form** → finale |

### Final battle: Vorg
- **Phase 1:** Vorg fires rapid Ki shots and teleports. Dodge by flying.
- **Phase 2:** Vorg transforms and calls reinforcements.
- **Phase 3:** Vorg charges a planet-breaker sphere. Ren automatically reaches **Star Form**; win the beam clash to see the ending.

---

## 5. Score and progress
- Points for enemies, combos and bosses.
- **Combo counter:** every 10 hits in a row gives +10% Power.
- **Training screen** between levels: spend coins to upgrade HP, Ki, wave strength or guard.
- Best score and progress are saved in `localStorage`.

---

## 6. Graphics and sound
- **Style:** colorful vector shapes with bright auras, everything drawn with the Canvas API, no images.
- **Effects:** particle system for auras, screen shake, hit-stop (a short freeze on hit), flash when transforming.
- **Sound:** Web Audio API (generated effects: charging hum, explosions) and energetic chiptune music for each level.

---

## 7. Technical plan

**Technology:** plain HTML5 + JavaScript (Canvas 2D), no server. Open `index.html` and play. Can be hosted on GitHub Pages.

**Game states:** `MENU → DIALOG → PLAY → (BOSS) → VICTORY → TRAINING → ... → THE END` (plus `PAUSE`, `GAMEOVER`).

---

## 8. Development stages

1. ✅ **MVP (level 1):** the hero moves, jumps and punches; Ki Wave with 3 charge levels; 1 enemy type; Flame transformation; a simple boss.
2. ✅ **Content:** all 5 levels, all forms, beam clashes.
3. ✅ **Polish:** sounds, particles, dialogs, training screen, mobile controls.
4. **Publishing:** GitHub Pages.
