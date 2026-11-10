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

## 4b. Act 2: the Hollow King

After Vorg's defeat the Star Crystals start to dim: Vorg was never conquering – he was fleeing the **Hollow King**, an ancient being that devours the Ki of whole worlds. **Raxas**, the swordsman from level 1, returns and joins Ren. Together they must break the King's **5 Hollow Seals**.

| # | Location | New enemies | Boss | Reward |
|---|---|---|---|---|
| 6 | **Sunken Ruins** | shades (fade away, reappear behind you) | **Sable** – shadow pillars, teleport | seal; Raxas joins |
| 7 | **Sky Temple** | wisps (homing orbs) | **Gale** – tornadoes, dive from the sky | seal + Raxas' **Shadow Form** |
| 8 | **Crystal Caverns** | stone golems (slow, ground slam) | **Quartzus** – crystal rain, shield, charge | seal |
| 9 | **Storm Coast** | everything mixed | **Volta** – lightning strikes, summons shades | seal |
| 10 | **The Hollow Throne** | elite mix | **Hollow King** – 3 phases, homing orbs, final **Twin Wave** clash | the end |

### Two heroes
- **C / ⇄** switches which hero you control; the other is driven by an AI that uses exactly the same moves (it attacks, guards against telegraphed attacks, flies over boss beams, transforms).
- **Raxas:** sword combo with longer reach, a sword wave (power 2) instead of a Ki blast, his own beam. Forms: Base → Shadow Form (+200%, teleport) → Eclipse Form (final battle only).
- If the hero you control falls, control passes to the other one; a fallen hero gets back up after the wave (40% HP) and fully before the boss. Game over only when both are down.
- Enemies attack the closest hero; bosses pick a target before each attack (usually the closest, sometimes the other one).
- The AI ally deals 75% damage, and act 2 enemies have more HP and hit harder, so the fights stay challenging with two heroes.
- **Final Twin Wave:** in the last phase both heroes reach their final forms (Star Form and Eclipse Form) and fire together into the Hollow King's beam.

## 4c. Act 3: the Mirror Realm

The collapse of the Hollow Throne cracks the sky and opens the **Mirror Realm**. Its ruler, **Empress Kaldra**, steals worlds into her mirrors and makes dark copies of the heroes. **Nyx**, the illusionist from level 4, was born there and joins Ren. Together they must break the **5 Mirror Shards**.

| # | Location | New enemies | Boss |
|---|---|---|---|
| 11 | **Neon City** | dark copies, laser snipers (aiming line, then a laser) | **Glitch** – low lasers (jump) and high lasers (stay on the ground), teleport |
| 12 | **Enchanted Forest** | wisps, golems | **Thornmother** – vines from the ground, spore orbs, summons wisps (Nyx' Mirage Form unlocks) |
| 13 | **Clockwork Tower** | armored, bombers, snipers | **Tick-Tock** – bouncing gears, slows time, shield, charge |
| 14 | **Frozen Mirror Lake** | many dark copies | **Dark Ren** – copies your moves, mirror clones |
| 15 | **Mirror Palace** | everything | **Empress Kaldra** – 3 phases, lasers, clones, final Twin Wave clash |

### Helper friend
- **Auto** = the story friend (Raxas in acts 2 and 4, Nyx in acts 3 and 5), or a fixed **Raxas** / **Nyx** (Nyx after reaching act 3), or **None** to fight alone. Set in the menu or in training; the lead fighter option chooses whether you start as Ren or as the friend.
- **Nyx:** palm strikes, homing illusion orbs instead of a Ki blast, her own beam. Forms: Base → Mirage Form (+200%, teleport) → Phantom Form (final battle only).
- Act 3 enemies have ×2.2 HP and hit ×1.8 harder (on top of the difficulty).

## 4d. Act 4: the Drowned World

With the mirrors broken, the sea starts to rise. Deep below, the **Tide King Maelor** – ruler of a world that drowned long ago – has taken the **5 Tide Pearls** that hold the oceans in place. Ren dives after them with **Raxas**.

| # | Location | New enemies | Boss |
|---|---|---|---|
| 16 | **Coral Shore** | ghost pirates, armored crabs (block, heavy), jellyfish (dive at you after a '!') | **Captain Brine** – dash, sword waves, bouncing cannonballs, calls his pirate crew |
| 17 | **Shipwreck Graveyard** | crabs, pirates, jellyfish | **Krakessa** – tentacles from the ground, homing orbs, whirlpools |
| 18 | **Abyssal Trench** | jellyfish, shades | **Lumen** – puts out the light: you only see around the heroes, shots and the glow above Lumen |
| 19 | **Sunken City** | crabs, pirates | **Fin and Gill**, the shark brothers – one fights up close and dives, the other shoots from afar |
| 20 | **Leviathan Throne** | everything | **Tide King Maelor** – 3 phases, tidal waves across the arena (jump or fly over them; cannot be cancelled), tentacles, final Twin Wave clash |

## 4e. Act 5: the First Light

The pearls wake something far older: **Zenith**, the first warrior, who gathered the **Star Sparks** of the First Light so that nobody could ever misuse it again. Ren and **Nyx** follow the sparks into space.

| # | Location | New enemies | Boss |
|---|---|---|---|
| 21 | **Asteroid Belt** | sentinels (fan of 3 shots), star knights | **Rok** – meteor rain, charge, ground quake |
| 22 | **Comet Station** | sentinels, comet bombers (fast), knights | **Unit Zero** – lasers, homing orbs, slows time, calls sentinels |
| 23 | **Sun Temple** | knights, wisps, comets | **Solara** – sunburst (a ring of shots), fire pillars, dive |
| 24 | **Black Star Citadel** | knights, sentinels, snipers | **General Nova** – shield against Ki from the front, charge, lightning, calls star knights |
| 25 | **The Origin** | everything | **Zenith** – 3 phases, sunbursts, lasers, meteor rain, final Twin Wave clash |

- Act 4 enemies have ×2.4 HP and hit ×1.9 harder; act 5: ×2.6 HP and ×2.0 damage (on top of the difficulty).
- Ren starts acts 4 and 5 with all his forms, the friend with the second form (the friend's final form appears in the last battle of the act). The helper friend setting works as before (Auto = Raxas in act 4, Nyx in act 5).
- Acts 4 and 5 live in `src/acts45.js`: it only adds data (styles, enemies, bosses, backgrounds, levels) on top of the shared engine.

## 5. Score and progress
- Points for enemies, combos and bosses.
- **Combo counter:** every 10 hits in a row gives +10% Power.
- **Training screen** between levels: spend coins to upgrade HP, Ki, wave strength or guard.
- Best score and progress are saved in `localStorage`.

---

## 5a. Special techniques

Two slots: **①** (key I) and **②** (key O). One technique is learned after each completed level. On the **Techniques** screen (menu, pause menu, training) any learned technique can be put into either slot. The recharge time belongs to the technique (quick ones 8–18 s, ultimates 40–60 s and half recharged at the start of a level), so swapping slots does not reset it. Each hero has its own cooldowns; the AI ally does not use them. Hard: +20% recharge time, Very Hard: +40%.

| After level | Technique | Slot | Recharge | Effect |
|---|---|---|---|---|
| 1 | Afterimage Dash | ① | 10 s | dash through enemies, briefly untouchable |
| 2 | Flash Burst | ① | 18 s | blinding flash: enemies freeze for 2.5 s (bosses 1 s) |
| 3 | Battle Cry | ① | 12 s | shockwave pushes enemies away and erases all enemy shots |
| 4 | Ki Disc | ① | 14 s | cutting disc goes through every enemy and shield |
| 5 | Crimson Surge | ② | 45 s | 8 s of double damage and +30% speed, slowly costs HP |
| 6 | Blink Strike | ① | 8 s | teleport behind the nearest enemy and strike |
| 7 | Meteor Rush | ② | 40 s | 6-hit rush that ends with a slam |
| 8 | Phoenix Fist | ② | 50 s | a fire bird flies across the screen, huge damage |
| 9 | World Sphere | ② | 60 s | raise a giant sphere for 2 s, then throw it: area damage |
| 10 | Silent Instinct | ② | 60 s | 6 s of dodging every attack (a bonus for replays) |

## 5b. Difficulty and stars

| | Easy | Normal | Hard | Very Hard |
|---|---|---|---|---|
| Enemy / boss HP | ×0.7 | ×1 | ×1.3 | ×1.7 |
| Enemy damage | ×0.6 | ×1 | ×1.25 | ×1.55 |
| Boss attack rate / warnings | slower / longer | normal | faster / shorter | much faster / much shorter |
| Heal after a wave / before a boss | +25 / full | +15 / full | +5 / +60% | 0 / +40% |
| Guard and Ki Wave cost | cheaper | normal | +15% | +30–35% |
| Extra enemies per wave / champions | 0 / – | 0 / 5% | +1 / 10% | +2 / 20% |
| Smart enemies (dodge beams, block, interrupt, anti-air) | no | a little | often | very often |

**Stars per level:** ★ complete, ★ no defeat in the level, ★ little damage (≤ 50 in act 1, ≤ 70 in act 2). **Rank:** S = 3 stars and under the par time (2:00 in act 1, 2:30 in act 2), A = 3 stars, B = 2, C = 1. Saved per difficulty; levels can be replayed from **Select level**.

## 6. Graphics and sound
- **Style:** colorful vector shapes with bright auras, everything drawn with the Canvas API, no images.
- **Effects:** particle system for auras, screen shake, hit-stop (a short freeze on hit), flash when transforming.
- **Sound:** Web Audio API (generated effects: charging hum, explosions) and energetic chiptune music for each level.

---

## 7. Technical plan

**Technology:** plain HTML5 + JavaScript (Canvas 2D), no server. Open `index.html` and play. Can be hosted on GitHub Pages.

**Game states:** `MENU → DIALOG → PLAY → (BOSS) → VICTORY → TRAINING → ... → THE END` (plus `PAUSE`, `GAMEOVER`). 25 levels in five acts.

---

## 8. Development stages

1. ✅ **MVP (level 1):** the hero moves, jumps and punches; Ki Wave with 3 charge levels; 1 enemy type; Flame transformation; a simple boss.
2. ✅ **Content:** all 5 levels, all forms, beam clashes.
3. ✅ **Polish:** sounds, particles, dialogs, training screen, mobile controls.
4. ✅ **Publishing:** GitHub Pages.
5. ✅ **Act 2:** 5 more levels, the ally Raxas, switching between heroes.
6. ✅ **Act 3:** 5 more levels, the new friend Nyx, helper friend setting.
7. ✅ **Acts 4 and 5:** 10 more levels – the Drowned World and the First Light.
