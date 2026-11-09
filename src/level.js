'use strict';
// Levels: dialogs, enemy waves, form unlocks and bosses.

const L = (who, text) => ({ who, text });

const LEVELS = [
  // ---------- 1. Mountain Monastery ----------
  {
    name: 'Mountain Monastery', theme: 'monastery', crystals: 1, unlockStart: 0, unlockText: 'Flame Form',
    script: [
      { type: 'dialog', lines: [
        L('', 'A quiet morning at the mountain monastery. Ren is training under the waterfall...'),
        L('Master Oro', 'Ren, your Ki is restless today...'),
        L('', 'A ball of fire tears across the sky. The ground shakes!'),
        L('Vorg', 'People of this planet! Your five Star Crystals now belong to me. With their power, my flagship will bring your world to its knees!'),
        L('Master Oro', "His scouts are already in the courtyard! Ren, show them what you've learned!"),
        L('Ren', 'Not while I am here!'),
        L('Controls', '← → move · ↑ jump (hold in the air to fly) · J punch · K Ki blast · hold and release L for the KI WAVE · T transform'),
        L('Guard', 'Hold S to guard: the shield blocks hits from the front and charges your Ki, but uses GUARD energy. It refills when you stop guarding - if it runs out, your guard breaks!'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['scout', 'L'], ['scout', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', unlock: 1, lines: [
        L('Master Oro', 'Ren! I can feel a hidden power awakening inside you!'),
        L('Ren', "What... what's happening to me?! My whole body is burning!"),
        L('Master Oro', 'Let that power out! When the yellow Power bar is full, press T!'),
        L('UNLOCKED', 'FLAME FORM: +50% damage, faster movement, a wider Ki Wave. Lasts while you have Power.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['gunner', 'L'], ['scout', 'L'], ['gunner', 'R'], ['scout', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Raxas', 'Hm. So you are the boy who smashed my scouts.'),
        L('Raxas', "I am Raxas, Vorg's fastest blade. You will not get the crystal!"),
        L('Ren', "Let's see if your sword is faster than my Ki Wave!"),
        L('Tip', 'When Raxas charges up energy, hold L. A beam clash will start: mash L as fast as you can!'),
      ] },
      { type: 'boss', bosses: [['raxas']] },
      { type: 'dialog', lines: [
        L('Raxas', 'Impossible... Vorg... will not... spare you...'),
        L('', 'Raxas flees, leaving a Star Crystal behind.'),
        L('Master Oro', 'Well done, Ren! But this is only the beginning. Four crystals are still missing.'),
        L('Ren', "Vorg, I'm coming for you!"),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 2. Desert Canyon ----------
  {
    name: 'Desert Canyon', theme: 'desert', crystals: 1, unlockStart: 1,
    script: [
      { type: 'dialog', lines: [
        L('', 'The desert canyon. Heat shimmers over the red rocks.'),
        L('Ren', 'Raxas said the next crystal is hidden somewhere in this canyon...'),
        L('', "Vorg's drones start buzzing overhead!"),
        L('Tip', 'Drones fly - jump or fly (hold ↑) and hit them with Ki blasts or a wave.'),
      ] },
      { type: 'wave', enemies: [['scout', 'R'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'R'], ['gunner', 'L'], ['drone', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['drone', 'L'], ['scout', 'R'], ['drone', 'R'], ['gunner', 'R'], ['scout', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Zul', 'Hey Zel, look - the little one came for the crystal!'),
        L('Zel', "Then let's give him... a hit from each of us!"),
        L('Ren', "Two against one? Fine - you'll still lose!"),
        L('Tip', 'Zul fights up close, Zel shoots from afar. Defeat one and the other becomes enraged!'),
      ] },
      { type: 'boss', bosses: [['zul', W - 120], ['zel', W - 300]] },
      { type: 'dialog', lines: [
        L('Zul', "We'll... be back..."),
        L('', 'The twins run away. Ren picks up the second Star Crystal.'),
        L('Ren', 'Two down! Next stop - the Ice City.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 3. Ice City ----------
  {
    name: 'Ice City', theme: 'ice', crystals: 1, unlockStart: 1, unlockText: 'Storm Form',
    script: [
      { type: 'dialog', lines: [
        L('', "The Ice City. Vorg's armored soldiers march through the streets."),
        L('Villager', 'Please help us! General Krag has taken the city tower!'),
        L('Ren', "Don't worry. I'll take care of him."),
        L('Tip', 'Armored soldiers block Ki from the front. Use punches, attack from behind or use a level 3 Ki Wave!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['scout', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['armored', 'L'], ['gunner', 'R'], ['drone', 'R'], ['armored', 'R']] },
      { type: 'dialog', unlock: 2, lines: [
        L('Ren', 'The cold... but something is boiling inside me... I can hear thunder!'),
        L('Master Oro', 'Ren, I can hear you through your Ki. Your power has gone beyond the Flame!'),
        L('UNLOCKED', 'STORM FORM: +100% damage, punches throw lightning to other enemies, 2x Ki regeneration. Press T!'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['armored', 'L'], ['scout', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('General Krag', 'NO ONE HAS EVER BROKEN MY SHIELD!'),
        L('Ren', "There's a first time for everything."),
        L('Tip', 'The shield stops Ki from the front. When Krag charges into a wall he gets stunned - attack then!'),
      ] },
      { type: 'boss', bosses: [['krag']] },
      { type: 'dialog', lines: [
        L('General Krag', 'My... shield...'),
        L('', 'The city is free! Ren gets the third crystal.'),
        L('Ren', "Three! Only the Volcano Island and Vorg himself are left."),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 4. Volcano Island ----------
  {
    name: 'Volcano Island', theme: 'volcano', crystals: 1, unlockStart: 2,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Volcano Island. Lava flows like rivers and the air smells of sulfur.'),
        L('Ren', 'Someone is watching me... I can sense a strange Ki.'),
        L('Nyx', 'Ha ha... welcome to my island of illusions, boy.'),
        L('Tip', 'Rolling robots explode next to you - destroy them from a distance!'),
      ] },
      { type: 'wave', enemies: [['brute', 'R'], ['bomber', 'L'], ['brute', 'L']] },
      { type: 'wave', enemies: [['bomber', 'R'], ['bomber', 'L'], ['brute', 'R'], ['gunner', 'L'], ['drone', 'R']] },
      { type: 'wave', enemies: [['brute', 'L'], ['armored', 'R'], ['bomber', 'R'], ['brute', 'R'], ['drone', 'L'], ['bomber', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Nyx', 'Which one of us is real? Take a guess!'),
        L('Ren', 'The real one is the one with the strongest Ki!'),
        L('Tip', 'Nyx teleports and creates clones. Clones vanish after a single hit.'),
      ] },
      { type: 'boss', bosses: [['nyx']] },
      { type: 'dialog', lines: [
        L('Nyx', 'No... my illusions... are shattered...'),
        L('', "Ren takes the fourth crystal. Vorg's giant ship appears in the sky."),
        L('Vorg', 'Impressive, little warrior. Come to my ship - that is where you will fall.'),
        L('Ren', "I'm coming, Vorg!"),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 5. Vorg's Ship ----------
  {
    name: "Vorg's Ship in Orbit", theme: 'ship', crystals: 1, unlockStart: 2, unlockText: 'Sky and Star Forms',
    script: [
      { type: 'dialog', lines: [
        L('', "Vorg's ship in orbit. The whole planet can be seen through the window."),
        L('Ren', 'Four crystals are safe. The last one is with Vorg.'),
        L('', 'Sirens wail. The elite guard runs towards Ren!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['drone', 'L'], ['elite', 'L']] },
      { type: 'wave', enemies: [['elite', 'L'], ['armored', 'R'], ['bomber', 'R'], ['elite', 'R']] },
      { type: 'dialog', unlock: 3, lines: [
        L('Ren', "Everything I've learned... my master, my friends, the whole planet... I can feel their Ki!"),
        L('', "Ren's aura turns a calm teal."),
        L('UNLOCKED', 'SKY FORM: +200% damage, the Ki Wave charges 2x faster, teleport - double-tap ← or →. Press T!'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['elite', 'L'], ['drone', 'R'], ['armored', 'L'], ['gunner', 'R'], ['elite', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Vorg', 'So you are the one who crushed my generals. Interesting.'),
        L('Vorg', 'The last crystal powers my planet-breaker. One shot and your world turns to dust.'),
        L('Ren', 'This will be your last fight, Vorg!'),
        L('Tip', 'Vorg has three phases. At the end, win the final beam clash!'),
      ] },
      { type: 'boss', bosses: [['vorg']] },
      { type: 'dialog', lines: [
        L('Vorg', 'Impossible... I am... the ruler of the stars...'),
        L('', 'A mighty Star Wave hurls Vorg into deep space. His ship starts to fall apart.'),
        L('Ren', 'All five crystals... It is time to take them home.'),
        L('Master Oro', 'You have become a true warrior, Ren. Come home.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ================= ACT 2: THE HOLLOW KING =================

  // ---------- 6. Sunken Ruins ----------
  {
    name: 'Sunken Ruins', theme: 'ruins', act: 2, crystals: 1, unlockStart: 3, ally: true, allyUnlockStart: 0,
    script: [
      { type: 'dialog', joinAlly: true, lines: [
        L('', "One month after Vorg's defeat..."),
        L('Master Oro', 'Ren, the Star Crystals are growing dim. Something is draining the Ki of our whole world.'),
        L('', 'A shadow army rises from the ancient ruins in the jungle.'),
        L('Raxas', 'Not bad, boy. But your victory woke up something far worse.'),
        L('Ren', 'Raxas?! You came back for a rematch?'),
        L('Raxas', 'Vorg was never conquering. He was running - from the Hollow King, who devours the Ki of entire worlds. And now he is coming here.'),
        L('Raxas', "I'm done serving monsters. This time, I fight beside you."),
        L('Controls', 'Raxas has joined you! Press C (or tap ⇄) to switch who you control. The other hero is controlled by the computer.'),
      ] },
      { type: 'wave', enemies: [['shade', 'R'], ['scout', 'L'], ['elite', 'R']] },
      { type: 'wave', enemies: [['shade', 'L'], ['shade', 'R'], ['gunner', 'R'], ['elite', 'L']] },
      { type: 'wave', enemies: [['shade', 'R'], ['elite', 'L'], ['shade', 'L'], ['wisp', 'R'], ['shade', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Sable', "The Hollow King's seals will not be broken by a child and a traitor."),
        L('Raxas', 'Sable. Still hiding in the dark?'),
        L('Tip', 'Sable raises shadow pillars under your feet - keep moving when the ground glows purple!'),
      ] },
      { type: 'boss', bosses: [['sable']] },
      { type: 'dialog', lines: [
        L('Sable', 'The King... will swallow... your light...'),
        L('', 'The first Hollow Seal shatters. The sky grows a little brighter.'),
        L('Raxas', 'Four seals left. Every one of them feeds his power.'),
        L('Ren', "Then we break them all. Together."),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 7. Sky Temple ----------
  {
    name: 'Sky Temple', theme: 'skyisles', act: 2, crystals: 1, unlockStart: 3, ally: true, allyUnlockStart: 0, unlockText: "Raxas' Shadow Form",
    script: [
      { type: 'dialog', lines: [
        L('', 'The Sky Temple floats high above the clouds.'),
        L('Ren', 'The second seal is up here... and so are his guards.'),
        L('Tip', 'Wisps fire slow homing orbs - shoot them down or cancel the orbs with your own blasts.'),
      ] },
      { type: 'wave', enemies: [['wisp', 'R'], ['elite', 'L'], ['drone', 'R']] },
      { type: 'wave', enemies: [['wisp', 'L'], ['wisp', 'R'], ['shade', 'R'], ['elite', 'L']] },
      { type: 'dialog', unlockAlly: 1, lines: [
        L('Raxas', 'This place... my power is answering it. The darkness I carried for Vorg - I can make it mine.'),
        L('', "A violet aura bursts around Raxas."),
        L('UNLOCKED', "RAXAS - SHADOW FORM: +200% damage, teleport. Switch to Raxas and press T - or let the computer use it!"),
      ] },
      { type: 'wave', enemies: [['wisp', 'R'], ['shade', 'L'], ['elite', 'R'], ['wisp', 'L'], ['drone', 'R'], ['shade', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Gale', 'Mortals do not walk among the clouds!'),
        L('Ren', "We're not here to walk. We're here to fight."),
        L('Tip', 'Gale dives from the sky and throws tornadoes. Watch for his shadow, and jump over the tornadoes.'),
      ] },
      { type: 'boss', bosses: [['gale']] },
      { type: 'dialog', lines: [
        L('Gale', 'The wind... has changed...'),
        L('', 'The second Hollow Seal breaks apart in the wind.'),
        L('Raxas', 'The next one is deep underground. In the Crystal Caverns.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 8. Crystal Caverns ----------
  {
    name: 'Crystal Caverns', theme: 'crystal', act: 2, crystals: 1, unlockStart: 3, ally: true, allyUnlockStart: 1,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Crystal Caverns. Glowing crystals light the endless dark.'),
        L('Raxas', 'Careful. The stone itself is alive here.'),
        L('Tip', 'Golems are slow but hit hard around them. Keep your distance or guard when they raise their fists.'),
      ] },
      { type: 'wave', enemies: [['golem', 'R'], ['shade', 'L'], ['scout', 'R']] },
      { type: 'wave', enemies: [['golem', 'L'], ['armored', 'R'], ['wisp', 'R'], ['bomber', 'L']] },
      { type: 'wave', enemies: [['golem', 'R'], ['golem', 'L'], ['shade', 'R'], ['wisp', 'L'], ['bomber', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Quartzus', 'I... AM... THE MOUNTAIN.'),
        L('Ren', 'Then we will move the mountain.'),
        L('Tip', 'Quartzus blocks Ki from the front and drops crystals from the ceiling. Hit him from behind, or when he is stunned after charging into a wall!'),
      ] },
      { type: 'boss', bosses: [['quartzus']] },
      { type: 'dialog', lines: [
        L('Quartzus', 'Cracked... at last...'),
        L('', 'The third Hollow Seal shatters into a thousand shining pieces.'),
        L('Raxas', 'Two left. The storm on the coast is not natural - that is the fourth.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 9. Storm Coast ----------
  {
    name: 'Storm Coast', theme: 'coast', act: 2, crystals: 1, unlockStart: 3, ally: true, allyUnlockStart: 1,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Storm Coast. Rain whips the cliffs and lightning splits the sky.'),
        L('Ren', 'This storm is alive... it is watching us.'),
      ] },
      { type: 'wave', enemies: [['elite', 'R'], ['shade', 'L'], ['wisp', 'R'], ['brute', 'L']] },
      { type: 'wave', enemies: [['golem', 'R'], ['wisp', 'L'], ['shade', 'R'], ['elite', 'L'], ['drone', 'R']] },
      { type: 'wave', enemies: [['shade', 'L'], ['shade', 'R'], ['golem', 'L'], ['wisp', 'R'], ['elite', 'R'], ['bomber', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Volta', 'Two little sparks against the whole storm? How cute.'),
        L('Raxas', "Sparks are how fires start, Volta."),
        L('Tip', 'Volta calls lightning down on glowing spots - move away when the ground flashes yellow!'),
      ] },
      { type: 'boss', bosses: [['volta']] },
      { type: 'dialog', lines: [
        L('Volta', 'The storm... is fading...'),
        L('', 'The fourth seal breaks. The clouds open - and behind them waits a black hole in the sky.'),
        L('Master Oro', 'Ren, Raxas... the Hollow King is waking. This is the final battle.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 10. The Hollow Throne ----------
  {
    name: 'The Hollow Throne', theme: 'void', act: 2, crystals: 1, unlockStart: 3, ally: true, allyUnlockStart: 1, final: true,
    script: [
      { type: 'dialog', lines: [
        L('', 'Beyond the black hole lies the Hollow Throne, a realm of endless night.'),
        L('Raxas', 'Whatever happens... thank you for giving me a second chance, Ren.'),
        L('Ren', "Save it for after we win."),
      ] },
      { type: 'wave', enemies: [['shade', 'R'], ['shade', 'L'], ['golem', 'R'], ['wisp', 'L']] },
      { type: 'wave', enemies: [['elite', 'L'], ['golem', 'R'], ['shade', 'R'], ['wisp', 'L'], ['shade', 'L'], ['wisp', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Hollow King', 'Light... how long since I last tasted it.'),
        L('Hollow King', 'Vorg ran. Your gods ran. Now you two will vanish, like every world before yours.'),
        L('Ren', 'You picked the wrong world.'),
        L('Tip', 'The Hollow King has three phases. At the end, both heroes reach their final forms - win the Twin Wave clash by mashing L!'),
      ] },
      { type: 'boss', bosses: [['hollow']] },
      { type: 'dialog', lines: [
        L('Hollow King', 'Impossible... light and shadow... together...'),
        L('', 'The Twin Wave tears the Hollow King apart. The last seal breaks and the void collapses.'),
        L('Raxas', 'It is over. Really over.'),
        L('Ren', 'Come back to the monastery with me. Master Oro will want to meet his new student.'),
        L('Master Oro', 'Two warriors, one light. Welcome home, both of you.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ================= ACT 3: THE MIRROR REALM =================

  // ---------- 11. Neon City ----------
  {
    name: 'Neon City', theme: 'neon', act: 3, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: { raxas: 1, nyx: 0 },
    script: [
      { type: 'dialog', joinAlly: true, lines: [
        L('', "Peace lasted one summer. Then the sky cracked - and a city of light appeared where the void had been."),
        L('Master Oro', 'Ren, that is the Mirror Realm. Everything there is a reflection... and reflections can lie.'),
        L('Nyx', 'He is right, boy. I was born in the Mirror Realm.'),
        L('Ren', 'Nyx?! The illusionist from the volcano?'),
        L('Nyx', 'Empress Kaldra is making dark copies of you. Five Mirror Shards hold her realm together - break them, and her mirrors break too.'),
        L('Nyx', 'Vorg took my island. I will not let Kaldra take my home. Let me fight with you.'),
        L('Tip', 'Nyx is your helper in act 3 (Helper friend: Auto). In the menu or in training you can pick Raxas instead - or fight alone.'),
        L('Tip', 'Snipers show a red aiming line before they shoot. Step out of the line or guard!'),
      ] },
      { type: 'wave', enemies: [['sniper', 'R'], ['doppel', 'L'], ['elite', 'R']] },
      { type: 'wave', enemies: [['doppel', 'R'], ['sniper', 'L'], ['drone', 'R'], ['sniper', 'R']] },
      { type: 'wave', enemies: [['doppel', 'L'], ['doppel', 'R'], ['sniper', 'R'], ['wisp', 'L'], ['elite', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Glitch', 'H-h-hello, heroes. Error: you are not supposed to be here.'),
        L('Nyx', "Glitch. Kaldra's watchdog."),
        L('Tip', 'Glitch fires lasers across the arena: jump over the low ones, stay on the ground for the high ones!'),
      ] },
      { type: 'boss', bosses: [['glitch']] },
      { type: 'dialog', lines: [
        L('Glitch', 'S-s-system... shutting... down...'),
        L('', 'The first Mirror Shard cracks. The neon lights flicker and go dark.'),
        L('Nyx', 'One down. The next shard is hidden in the Enchanted Forest.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 12. Enchanted Forest ----------
  {
    name: 'Enchanted Forest', theme: 'forest', act: 3, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: { raxas: 1, nyx: 0 }, unlockText: "Nyx' Mirage Form",
    script: [
      { type: 'dialog', lines: [
        L('', 'The Enchanted Forest. Giant mushrooms glow in the dark and the trees whisper.'),
        L('Ren', 'Everything here is looking at us...'),
      ] },
      { type: 'wave', enemies: [['wisp', 'R'], ['shade', 'L'], ['doppel', 'R']] },
      { type: 'wave', enemies: [['golem', 'L'], ['wisp', 'R'], ['sniper', 'R'], ['shade', 'L']] },
      { type: 'dialog', unlockFriend: { nyx: 1 }, lines: [
        L('Nyx', 'The forest remembers me... I can feel my true power again!'),
        L('', 'A shimmering mirage surrounds Nyx.'),
        L('UNLOCKED', "NYX - MIRAGE FORM: +200% damage, teleport. Switch to Nyx and press T - or let the computer use it!"),
      ] },
      { type: 'wave', enemies: [['doppel', 'R'], ['wisp', 'L'], ['golem', 'R'], ['sniper', 'L'], ['shade', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Thornmother', 'Little lights... you will feed my roots!'),
        L('Tip', 'Thornmother makes vines burst from the ground where it turns green, and sends spore orbs after you.'),
      ] },
      { type: 'boss', bosses: [['thorn']] },
      { type: 'dialog', lines: [
        L('Thornmother', 'My forest... will grow again...'),
        L('', 'The second Mirror Shard shatters. Somewhere far above, a great clock starts ticking.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 13. Clockwork Tower ----------
  {
    name: 'Clockwork Tower', theme: 'clock', act: 3, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: { raxas: 1, nyx: 1 },
    script: [
      { type: 'dialog', lines: [
        L('', 'The Clockwork Tower. Every gear here turns the time of the Mirror Realm.'),
        L('Nyx', 'If the tower stops, Kaldra loses control of time. Let us stop it.'),
      ] },
      { type: 'wave', enemies: [['armored', 'R'], ['sniper', 'L'], ['doppel', 'R'], ['bomber', 'L']] },
      { type: 'wave', enemies: [['golem', 'R'], ['sniper', 'L'], ['doppel', 'L'], ['bomber', 'R'], ['drone', 'R']] },
      { type: 'wave', enemies: [['armored', 'L'], ['doppel', 'R'], ['sniper', 'R'], ['golem', 'L'], ['sniper', 'L'], ['bomber', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Tick-Tock', 'TICK. TOCK. YOUR TIME IS UP.'),
        L('Tip', 'Tick-Tock slows down time and throws bouncing gears. His shield blocks Ki from the front!'),
      ] },
      { type: 'boss', bosses: [['ticktock']] },
      { type: 'dialog', lines: [
        L('Tick-Tock', 'TICK... TOCK... ...'),
        L('', 'The great clock stops. The third Mirror Shard falls from its face and breaks.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 14. Frozen Mirror Lake ----------
  {
    name: 'Frozen Mirror Lake', theme: 'mirrorlake', act: 3, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: { raxas: 1, nyx: 1 },
    script: [
      { type: 'dialog', lines: [
        L('', 'A frozen lake, smooth as a mirror. In the ice, Ren sees his own face - smiling a cold smile.'),
        L('Nyx', 'Careful. Something in the ice is copying you.'),
      ] },
      { type: 'wave', enemies: [['doppel', 'R'], ['doppel', 'L'], ['wisp', 'R'], ['sniper', 'L']] },
      { type: 'wave', enemies: [['doppel', 'L'], ['shade', 'R'], ['sniper', 'R'], ['doppel', 'R'], ['golem', 'L']] },
      { type: 'wave', enemies: [['doppel', 'R'], ['doppel', 'L'], ['sniper', 'L'], ['elite', 'R'], ['wisp', 'L'], ['doppel', 'R']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Dark Ren', 'I am everything you could have been, Ren. Stronger. Colder. Alone.'),
        L('Ren', 'Then you know how this ends - I was never alone.'),
        L('Tip', 'Dark Ren copies your moves and makes mirror clones. The clones break with a single hit.'),
      ] },
      { type: 'boss', bosses: [['darkren']] },
      { type: 'dialog', lines: [
        L('Dark Ren', 'Why... does your light... not break...'),
        L('', 'The reflection shatters like glass. The fourth Mirror Shard rises from the lake.'),
        L('Nyx', 'Only the Mirror Palace is left. Kaldra is waiting.'),
      ] },
      { type: 'victory' },
    ],
  },

  // ---------- 15. Mirror Palace ----------
  {
    name: 'Mirror Palace', theme: 'palace', act: 3, crystals: 1, unlockStart: 3, ally: true, friend: 'nyx', allyUnlockStart: { raxas: 1, nyx: 1 }, final: true,
    script: [
      { type: 'dialog', lines: [
        L('', 'The Mirror Palace. A thousand mirrors - and in every one of them, an army.'),
        L('Master Oro', 'Ren. Whatever the mirrors show you, remember who you really are.'),
      ] },
      { type: 'wave', enemies: [['doppel', 'R'], ['sniper', 'L'], ['doppel', 'L'], ['golem', 'R'], ['wisp', 'R']] },
      { type: 'wave', enemies: [['doppel', 'L'], ['doppel', 'R'], ['sniper', 'R'], ['shade', 'L'], ['elite', 'R'], ['sniper', 'L']] },
      { type: 'dialog', checkpoint: true, lines: [
        L('Kaldra', 'Welcome, little light. Do you like my mirrors? Each one holds a world I have taken.'),
        L('Kaldra', 'Yours will look lovely on my wall.'),
        L('Ren', 'Not today, Kaldra. Not ever.'),
        L('Tip', 'Kaldra has three phases. At the end, both heroes reach their final forms - win the last beam clash by mashing L!'),
      ] },
      { type: 'boss', bosses: [['kaldra']] },
      { type: 'dialog', lines: [
        L('Kaldra', 'No... my reflections... are breaking...'),
        L('', 'The last Mirror Shard shatters. Every mirror in the palace cracks - and the stolen worlds pour back into the sky like stars.'),
        L('Nyx', 'My home is free. Thank you, Ren.'),
        L('Master Oro', 'Light, shadow and illusion - side by side. You have saved more worlds than you know.'),
        L('Ren', "Let's go home. Together."),
      ] },
      { type: 'victory' },
    ],
  },
];

// Form unlocks of the friends. A level can give 'allyUnlockStart' (a number = Raxas, or { raxas, nyx })
// and a dialog step can unlock forms with 'unlockAlly' (Raxas) or 'unlockFriend' ({ nyx: 1 }).
function friendUnlocks(step) {
  const u = {};
  if (step.unlockAlly) u.raxas = step.unlockAlly;
  if (step.unlockFriend) Object.assign(u, step.unlockFriend);
  return u;
}
function friendUnlocked(levelIndex, id, fromStep) {
  // everything unlocked in earlier levels counts, plus the steps of this level already passed
  let best = 0;
  for (let li = 0; li <= levelIndex; li++) {
    const L = LEVELS[li];
    const start = L.allyUnlockStart;
    if (typeof start === 'number' && id === 'raxas') best = Math.max(best, start);
    else if (start && typeof start === 'object' && start[id]) best = Math.max(best, start[id]);
    const steps = li < levelIndex ? L.script.length : fromStep;
    for (let i = 0; i < steps; i++) { const u = friendUnlocks(L.script[i]); if (u[id]) best = Math.max(best, u[id]); }
  }
  return best;
}

// Act 1 collects Star Crystals, act 2 breaks Hollow Seals: counted per act.
function actOf(levelIndex) { return (LEVELS[levelIndex] && LEVELS[levelIndex].act) || 1; }
function crystalsBefore(levelIndex) {
  const act = actOf(Math.min(levelIndex, LEVELS.length - 1));
  let n = 0;
  for (let i = 0; i < levelIndex && i < LEVELS.length; i++) if (actOf(i) === act) n += LEVELS[i].crystals;
  return n;
}

// Starts a level. fromStep > 0 = from a checkpoint. The caller resets the score.
function startLevel(levelIndex = 0, fromStep = 0) {
  const lvl = LEVELS[levelIndex];
  Game.levelIndex = levelIndex;
  Game.theme = lvl.theme;
  Game.enemies = [];
  Game.bosses = [];
  Game.projectiles = [];
  Game.beams = [];
  Game.bolts = [];
  Game.hazards = [];
  Game.rings = [];
  Game.heroSlowT = 0;
  Game.coins = [];
  Game.particles = [];
  Game.floaters = [];
  Game.clash = null;
  Game.banner = null;
  Game.hint = null;
  Game.combo = 0;
  Game.slowmo = 0;
  Game.hitstop = 0;
  Game.crystals = crystalsBefore(levelIndex);
  // difficulty: act 2 has two heroes and stronger forms, so enemies are tougher
  Game.enemyHpMul = (lvl.act === 3 ? 2.2 : lvl.act === 2 ? 1.7 : 1) * diff().hp;
  Game.dangerMul = (lvl.act === 3 ? 1.8 : lvl.act === 2 ? 1.6 : 1) * diff().dmg;
  // heroes: Ren always; from level 6 on a helper friend can join (see the Helper friend setting)
  Game.player = new Player('ren');
  const friend = friendFor(lvl);
  Game.ally = friend ? new Player(friend) : null;
  if (Game.ally) { Game.ally.x = 120; Game.ally.ai = new AllyAI(Game.ally); }
  Game.switchCd = 0;
  Game.script = lvl.script;
  // level statistics for the star rating (kept when retrying after a defeat)
  if (fromStep === 0 || !Game.stats || Game.stats.level !== levelIndex) {
    Game.stats = { level: levelIndex, time: 0, dmgTaken: 0, defeats: 0 };
  } else {
    Game.stats.defeats++;
  }
  if (fromStep === 0) {
    Game.levelStartScore = Game.score;
    Game.checkpoint = 0;
    Game.checkpointScore = Game.score;
  } else {
    Game.score = Game.checkpointScore;
  }
  // forms unlocked in earlier levels and in steps already passed
  let unlocked = lvl.unlockStart;
  for (let i = 0; i < fromStep; i++) {
    if (lvl.script[i].unlock) unlocked = Math.max(unlocked, lvl.script[i].unlock);
  }
  const allyUnlocked = Game.ally ? friendUnlocked(levelIndex, Game.ally.id, fromStep) : 0;
  Game.player.unlocked = unlocked;
  if (unlocked > 0) Game.player.power = 100;
  if (Game.ally) {
    Game.ally.unlocked = allyUnlocked;
    if (allyUnlocked > 0) Game.ally.power = 100;
    // start with the hero chosen last time
    if (Game.controlChar === 'friend') {
      const ren = Game.player;
      Game.player = Game.ally; Game.player.ai = null;
      Game.ally = ren; Game.ally.ai = new AllyAI(ren);
      Game.player.x = 200; Game.ally.x = 120;
    }
  }
  // techniques: quick ones are ready at once, ultimates start half recharged
  ensureTechs();
  for (const h of allHeroes()) {
    resetTechCooldowns(h);
  }
  const sw = document.getElementById('swBtn');
  if (sw) sw.classList.toggle('off', !Game.ally);
  saveProgress(levelIndex);
  saveRun();
  Sfx.music(lvl.theme);
  Game.step = fromStep - 1;
  setState('PLAY');
  showBanner(`LEVEL ${levelIndex + 1}`, lvl.name, 2.0);
  nextStep();
}

function nextStep() {
  Game.step++;
  const s = Game.script[Game.step];
  if (!s) return;
  Game.cur = { s, t: 0, spawned: 0, spawnT: 0, clearT: 0 };
  if (s.checkpoint) { Game.checkpoint = Game.step; Game.checkpointScore = Game.score; }
  const waves = Game.script.filter((x) => x.type === 'wave');
  switch (s.type) {
    case 'dialog':
      openDialog(s.lines, () => {
        if (s.unlock) heroById('ren').unlock(s.unlock);
        const fu = friendUnlocks(s);
        for (const id in fu) if (heroById(id)) heroById(id).unlock(fu[id]);
        if (s.joinAlly && Game.ally) showHint(IS_TOUCH ? `Tap ⇄ to switch between Ren and ${Game.ally.char.name}` : `Press C to switch between Ren and ${Game.ally.char.name}`, 4);
        else if (s.unlock || Object.keys(friendUnlocks(s)).some((id) => heroById(id))) showHint('Press T to transform!', 3);
        nextStep();
      });
      break;
    case 'wave': {
      const n = waves.indexOf(s) + 1;
      showBanner(`WAVE ${n}/${waves.length}`, "Defeat Vorg's soldiers!", 1.8);
      break;
    }
    case 'boss': {
      const p = Game.player;
      p.x = 200; p.facing = 1;
      // before the boss: full HP on Easy/Normal, only part of it on Hard and Very Hard
      for (const h of allHeroes()) { h.revive(diff().bossHeal); h.hp = Math.min(h.maxHp, h.hp + h.maxHp * diff().bossHeal); }
      if (Game.ally) { Game.ally.x = 120; Game.ally.facing = 1; }
      Game.bosses = s.bosses.map(([id, x]) => new Boss(id, x));
      Sfx.music(Game.bosses.some((b) => b.id === 'kaldra') ? 'final3' : Game.bosses.some((b) => b.id === 'hollow') ? 'final2' : Game.bosses.some((b) => b.id === 'vorg') ? 'final' : 'boss');
      const names = Game.bosses.map((b) => b.name).join(' & ');
      showBanner('BOSS: ' + names, Game.bosses.length === 1 ? Game.bosses[0].def.title : 'The twins', 2.0);
      break;
    }
    case 'victory':
      Game.result = rateLevel();
      Game.result.newBest = saveResult(Game.levelIndex, Game.result);
      Game.result.newTech = unlockTechForLevel(Game.levelIndex);
      collectAllCoins();
      saveRun();
      Sfx.music(null);
      Game.crystals = crystalsBefore(Game.levelIndex) + LEVELS[Game.levelIndex].crystals;
      if (Game.levelIndex + 1 < LEVELS.length) saveProgress(Game.levelIndex + 1);
      saveHighScore();
      Sfx.victory();
      setState('VICTORY');
      break;
  }
}

function updateScript(dt) {
  const c = Game.cur;
  if (!c || Game.state !== 'PLAY') return;
  const s = c.s;
  c.t += dt;
  if (s.type === 'wave') {
    if (!c.list) {
      // harder difficulties add extra enemies picked from the same wave
      c.list = s.enemies.slice();
      for (let i = 0; i < diff().extra; i++) {
        const [type] = s.enemies[Math.floor(Math.random() * s.enemies.length)];
        c.list.push([type, Math.random() < 0.5 ? 'L' : 'R']);
      }
    }
    if (c.spawned < c.list.length) {
      c.spawnT -= dt;
      if (c.spawnT <= 0 && c.t > 1.2) {
        const [type, side] = c.list[c.spawned++];
        Game.enemies.push(new Enemy(type, side));
        c.spawnT = 0.9;
      }
    } else if (Game.enemies.every((e) => e.dead)) {
      c.clearT += dt;
      if (c.clearT > 1.2) {
        for (const h of allHeroes()) {
          if (!h.alive) h.revive(0.4);       // a downed hero gets back up after the wave
          else if (h.hp < h.maxHp && diff().heal > 0) {
            h.hp = Math.min(h.maxHp, h.hp + diff().heal);
            floater(h.x, h.y - 100, `+${diff().heal} HP`, '#6dff8a', 18);
          }
        }
        nextStep();
      }
    }
  } else if (s.type === 'boss') {
    const allDead = Game.bosses.length > 0 && Game.bosses.every((b) => b.dead && b.stateT > 2.6);
    if (allDead) nextStep();
  }
}

// ---------- Dialogs ----------
function openDialog(lines, cb) {
  Sfx.chargeStop();
  for (const p of allHeroes()) {
    if (['charging', 'firing', 'kicharge', 'punch', 'blast', 'transform', 'hurt', 'clash'].includes(p.state)) {
      if (p.state === 'transform') p.form = p.transformTo;
      p.setState('normal');
    }
  }
  Game.beams = [];
  Game.projectiles = [];
  Game.dialog = { lines, i: 0, chars: 0, cb };
  setState('DIALOG');
}

function updateDialog(dt) {
  const d = Game.dialog;
  if (!d) return;
  const line = d.lines[d.i];
  d.chars += 70 * dt;
  const I = Input.pressed;
  if ((I.confirm || I.jump || I.punch) && Game.stateT > 0.15) {
    if (d.chars < line.text.length) {
      d.chars = line.text.length;
    } else {
      d.i++;
      d.chars = 0;
      Sfx.select();
      if (d.i >= d.lines.length) {
        Game.dialog = null;
        setState('PLAY');
        d.cb();
      }
    }
  }
}

// ---------- Star rating ----------
// ★ level complete, ★ no defeat in this level, ★ took little damage.
// Rank: S = 3 stars and fast, A = 3 stars, B = 2 stars, C = 1 star.
function rateLevel() {
  const st = Game.stats || { time: 0, dmgTaken: 0, defeats: 0 };
  const act2 = actOf(Game.levelIndex) === 2;
  const dmgLimit = act2 ? 70 : 50;
  const par = act2 ? 150 : 120;
  const noDefeat = st.defeats === 0;
  const lowDamage = st.dmgTaken <= dmgLimit;
  const stars = 1 + (noDefeat ? 1 : 0) + (lowDamage ? 1 : 0);
  const rank = stars === 3 ? (st.time <= par ? 'S' : 'A') : stars === 2 ? 'B' : 'C';
  return { stars, rank, noDefeat, lowDamage, dmgLimit, par, time: st.time, dmgTaken: Math.round(st.dmgTaken), defeats: st.defeats };
}
