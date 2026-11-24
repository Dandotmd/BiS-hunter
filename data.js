/* Forever tracker data. Edit this file (or ask Claude to) when the plan changes.
   Sources, re-checked 2026-11-20: Wowhead Forever (quest/item tooltips), Warcraft Tavern Forever, Conquest Capped,
   Gfinity, Frostyboost, Method.gg, Warcraft Wiki; armory read 2026-11-19 at level 43.
   "Classic data" in a note means no Forever source confirmed it yet.
   Quests are filtered to what a Horde Undead Paladin can take. */
window.TRACKER = {
  checked: "2026-11-20",
  /* Blacksmithing is on hold until max level (user, 2026-11-20): crafted targets stay listed but never count as "get now". */
  deferCrafting: true,

  /* Baseline snapshot. The live tracker overrides level / professions / gold from its saved state. */
  character: {
    name: "Danadin Lightbrindan",
    armory: "https://wowarmory.gg/?region=us&forever=danadin-lightbrindan",
    realm: "US Normal (PvE)", faction: "Horde", race: "Undead", cls: "Paladin", spec: "Protection",
    guild: "Send Ibuprofen",
    level: 48, gold: null,
    /* armory 2026-11-24 13:11 ET, level 47, before the Maraudon turn-ins */
    stats: { Health: 2237, Mana: 1886, Armor: 4455, Strength: 146, Stamina: 156, "Attack power": 441, Dodge: "6.0%", Parry: "10.4%", Block: "6.4%" },
    professions: { Mining: [227, 300], Blacksmithing: [173, 225], "First Aid": [150, 150], Cooking: [57, 150], Fishing: [1, 75] },
    prefs: [
      "Dungeon-first leveling as tank",
      "Pick up every dungeon quest and its prerequisites, then clear them all in one run",
      "Skip zones you dislike (Arathi); favourites later on: the Plaguelands and Winterspring",
      "Blacksmithing on hold until level 60"
    ]
  },

  /* status thresholds: hard = doable with care, ready = comfortable for a tank, max = top of range */
  dungeons: [
    { id: "gnomer", name: "Gnomeregan", zone: "Dun Morogh", range: [29, 38], hard: 26, ready: 29, done: true, quests: [] },
    { id: "rfk", name: "Razorfen Kraul", zone: "The Barrens", range: [29, 38], hard: 26, ready: 29, done: true, quests: [] },
    { id: "smgy", name: "Scarlet Monastery: Graveyard", zone: "Tirisfal Glades", range: [30, 38], hard: 26, ready: 30, done: true, quests: [] },
    { id: "smlib", name: "Scarlet Monastery: Library", zone: "Tirisfal Glades", range: [33, 41], hard: 29, ready: 33, done: true, quests: [] },
    { id: "dalaran", name: "City of Dalaran", zone: "Alterac Mountains", range: [28, 35], hard: 26, ready: 28, isNew: true, done: true, quests: [] },
    { id: "excav", name: "Excavation Site: Wetlands", zone: "Wetlands", range: [26, 33], hard: 24, ready: 26, isNew: true, unknown: true,
      note: "Legacy: one of the last two dungeons for Novice Spelunker (1 Legacy Point; you've done the other four). The credit is for killing the final boss, Relic Guardian; just entering doesn't count. Bosses: Saltspine, Shadetooth, Highland Horror, Relic Guardian. Entrance around 48.1, 56.5; the path starts at the meeting stone near Thelgen Rock (53.9, 65.4). Ride south from Hammerfall. Well below your level, so try it solo. Whether solo kills count isn't confirmed: check the Legacy window afterwards.", quests: [] },
    { id: "deadmines", name: "The Deadmines", zone: "Westfall", range: [17, 26], hard: 14, ready: 17, unknown: true,
      note: "Legacy: the other dungeon left for Novice Spelunker. Kill Edwin VanCleef (last boss) for the credit. Range is 17–26, so a level 44 tank can solo it. Quests and loot are not tracked here.", quests: [], loot: [] },
    { id: "bfd", name: "Blackfathom Deeps", zone: "Ashenvale", range: [24, 32], hard: 22, ready: 24, unknown: true,
      note: "Legacy: the only dungeon you're missing for Experienced Spelunker (1 Legacy Point). You have everything else on its list: Dalaran, Gnomeregan, Drowned City, all four SM wings, RFK and Krol'dok. Kill Aku'mai, the final boss. Solo it on the way to Novice Spelunker.", quests: [], loot: [] },

    { id: "rfd", name: "Razorfen Downs", zone: "The Barrens (south, by the Great Lift)", range: [37, 46], hard: 35, ready: 37, done: true,
      guide: "https://www.wowhead.com/forever/guide/razorfen-downs-dungeon-overview-location-rewards",
      note: "Fly to Camp Taurajo, ride south, turn east before the Great Lift. The last boss is the hard part at 37: tank Amnennar facing his tent, stack the group on you for Frost Nova, and kill the spectres as they spawn. Bring a disease cleanse for Withered Spearhides.",
      quests: [
        { id: 3341, name: "Bring the End", lvl: 37, giver: "Andrew Brownell", zone: "Undercity", area: "Magic Quarter", way: "74.0 32.8",
          task: "Loot the Skull of the Coldbringer from Amnennar (last boss).", reward: "Vanquisher's Sword or Amberglow Talisman" },
        { id: 6521, name: "An Unholy Alliance", lvl: 28, giver: "Varimathras", zone: "Undercity", area: "Royal Quarter", way: "56.6 92.6",
          pre: "Turn in the Small Scroll quest from Charlga Razorflank (Razorfen Kraul) first. Check your log: you may already have this step.",
          task: "Kill Ambassador Malcin and loot his head. He is OUTSIDE the instance portal and spawns in several spots.", where: "outside", reward: "Skullbreaker (2H mace), Nail Spitter or Zealot's Robe" },
        { id: 97196, name: "The Coldbringer's Eye", lvl: 34, giver: "Sutara Plainstalker", zone: "Mulgore", area: "Skywatcher Plateau, NW of Thunder Bluff", way: "34.6 22.8", isNew: true,
          task: "Loot the eye from the orb beside Amnennar. It is separate from the skull, so don't leave after looting the boss.", reward: "8,600 XP" },
        { id: 6626, name: "A Host of Evil", lvl: 28, giver: "Myriam Moonsinger", zone: "The Barrens", area: "outside the RFD portal", way: "49.0 94.8",
          task: "Kill 8 Razorfen Battleguards, 8 Thornweavers and 8 Death's Head Cultists.", where: "outside" },
        { id: 3523, name: "Scourge of the Downs", lvl: 32, giver: "Belnistrasz", zone: "Inside the dungeon", area: "Murder Pens, near Mordresh Fire Eye",
          task: "Talk to him twice. Everyone in the party must finish this before the escort starts.", where: "inside" },
        { id: 3525, name: "Extinguishing the Idol", lvl: 32, giver: "Belnistrasz", zone: "Inside the dungeon", area: "after Scourge of the Downs",
          task: "Protect Belnistrasz during his ritual; ends with Plaguemaw the Rotting. Tell the group you need it before starting.", where: "inside", reward: "Dragonclaw Ring" },
        { id: "agamaggan", name: "Agamaggan's Blood", lvl: 35, giver: "Possibly Kog'thug the Brave", zone: "Unconfirmed",
          task: "Locked behind the Word of the Woods chain (Woodwyrd). Only an Icy Veins search snippet mentions it, and no source links it to Maraudon. Unconfirmed: skip unless it shows up in game.", deferred: true }
      ],
      loot: ["Vanquisher's Sword (quest: Bring the End)", "Dragonclaw Ring (quest: Extinguishing the Idol)", "Abomination Chain, neck (Glutton)",
             "Silky Spider Cape (Tuten'kash, 33%)", "Savage Boar's Guard, shield (Ragglesnout, rare spawn)",
             "At 40 with plate: Carapace of Tuten'kash, chest (33%) and Icemetal Barbute, helm (Amnennar, 20%)"] },

    { id: "drowned", name: "The Drowned City", zone: "Sunken Hollow, past the Vile Reef, Stranglethorn coast", range: [35, 42], hard: 33, ready: 37, isNew: true, done: true,
      guide: "https://www.wowhead.com/forever/guide/the-drowned-city-dungeon-overview-location-rewards",
      note: "The entrance is an underwater cave west of the Vile Reef, around 21.4, 27.9; swim out from Grom'gol. Players advise 37–38 at the earliest: bosses are 37–40. Zeppelin to Grom'gol or boat to Booty Bay. A long stretch is underwater, so bring a Warlock or Shaman for water breathing. Bosses in order: Zul'Alai, Var'Taka, Captain Dreadrise, Deathless Marrow, Primeval Elemental, Min'loth the Serpent. Rares: Umbra, Gill and \"Pyromancer\" Braxton.",
      quests: [
        { id: 95775, name: "The Drowned City", lvl: 30, giver: "Kin'weelay", zone: "Stranglethorn Vale", area: "Grom'gol", way: "32.2 27.8", isNew: true,
          pre: "All from Kin'weelay, in order: The Vile Reef (done) → The Gurubashi Legends of Old → Locating the Lost City.", task: "Make rubbings of the four Tablets of I'lalai inside.", reward: "8,450 XP; follow-up A Tale Spun Around the Fire (Master Gadrin, Sen'jin Village) gives I'lalai Flayer, a 1H axe" },
        { id: 95776, name: "The Only Good Brinescale...", lvl: 30, giver: "Commander Aggro'gosh", zone: "Stranglethorn Vale", area: "Grom'gol", way: "32.2 28.8", isNew: true,
          pre: "The Vile Reef (done) → The Gurubashi Legends of Old → Locating the Lost City (all Kin'weelay) → Enemies in the Water (Aggro'gosh: 10 Brinescale Tridents from Skirmishers outside the entrance).", task: "Kill Var'Taka.", reward: "Tidesoaked Leggings or Naga Priestess's Mantle, 9,500 XP" },
        { id: 96774, name: "Ancient Gurubashi Idol", lvl: 30, giver: "Mazu'kon", zone: "Mulgore", area: "Skywatcher Plateau (same plateau as Sutara for RFD)", isNew: true,
          task: "The idol drops from the Deathless Marrow fight." },
        { id: 95789, name: "Shady Saltseers", lvl: 34, giver: "Krazek", zone: "Stranglethorn Vale", area: "Booty Bay", way: "27.0 77.2", isNew: true,
          task: "Dungeon objective, shown in the quest text.", reward: "Saltseer's Helm" },
        { id: 95791, name: "The Saltseer Captain", lvl: 34, giver: "Krazek", zone: "Stranglethorn Vale", area: "Booty Bay", way: "27.0 77.2", isNew: true,
          task: "Dungeon objective, shown in the quest text." }
      ],
      loot: ["Viscera Spaulders, mail shoulders (Deathless Marrow)", "Maw of Min'loth, shield (Min'loth)", "Serpentbane Crown, mail helm (Min'loth)",
             "Knucklebone Ring (Deathless Marrow)", "Linken's Boots of Iron, mail (rare trash/any-boss drop, about 1%)", "Heart of the Primeval, trinket (Primeval Elemental; caster use effect)",
             "Berserker Shackles, mail wrist (Zul'Alai)", "Dreadfrost Saber, 1H sword (Captain Dreadrise)", "Waterlogged Burial Shroud, cloak (Primeval Elemental)"] },

    { id: "smarm", name: "Scarlet Monastery: Armory", zone: "Tirisfal Glades", range: [36, 44], hard: 33, ready: 36, done: true,
      note: "You hold the Scarlet Key, which opens this wing and the Cathedral. Herod is one of four kills for Into the Scarlet Monastery.",
      quests: [
        { id: 1048, name: "Into the Scarlet Monastery", lvl: 33, giver: "Varimathras", zone: "Undercity", area: "Royal Quarter", way: "56.6 92.6", shared: "smcath", seed: "have",
          task: "Kill Herod here. Whitemane and Mograine are in the Cathedral. Houndmaster Loksey is already dead.",
          reward: "Dragon's Blood Necklace (best tank neck near 38), Sword of Omen or Prophetic Cane" }
      ],
      loot: ["Herod's Shoulder, mail (35%)", "Scarlet Leggings, mail (15%)", "Raging Berserker's Helm, mail (35%)"] },

    { id: "smcath", name: "Scarlet Monastery: Cathedral", zone: "Tirisfal Glades", range: [38, 46], hard: 35, ready: 38, done: true,
      note: "Finishes Into the Scarlet Monastery. Fairbanks is in a hidden side room; ask the group to kill him for the boots.",
      quests: [
        { id: 1048, name: "Into the Scarlet Monastery", lvl: 33, giver: "Varimathras", zone: "Undercity", area: "Royal Quarter", way: "56.6 92.6", shared: "smarm", seed: "have",
          task: "Kill High Inquisitor Whitemane and Scarlet Commander Mograine.", reward: "Dragon's Blood Necklace (+12 Stamina, +8 block value)" }
      ],
      loot: ["Aegis of the Scarlet Commander, shield (Mograine, 24%, requires 39)", "Dusty Mail Boots, mail, 180 armor, +14 Stamina (Fairbanks, 35%)",
             "Triune Amulet, neck (Whitemane, 40%)", "Hand of Righteousness, 1H mace (Whitemane, 20%)"] },

    { id: "kroldok", name: "Krol'dok Stronghold", zone: "Riverglades, on the hill north of Sunnyglade", range: [40, 45], hard: 37, ready: 40, isNew: true, done: true,
      guide: "https://www.wowhead.com/forever/guide/kroldok-stronghold-dungeon-overview-location-rewards",
      note: "Range: 40–45 per Wowhead and Icy Veins; Warcraft Tavern says 40–47. Entrance is a cave west of the fortress gates, around 37.5, 37.5. Bosses in order: Slavecrusher Grox, Twilight Commander Zarmok, War Handler Ashka, Nar'gurk, Bossman Toof, Overlord Mugg. The Krol'dok Warplate pieces are the best tank plate for levels 40–45. All three Horde dungeon quests sit at the end of one long Rom'gar chain; the armory (Nov 19) shows Rock on Stick, the Eye of Mugg reward, so the Rom'gar chain and Overlord Mugg are done.",
      quests: [
        { id: 94975, name: "A Token of Vengeance", lvl: 38, giver: "Da'grosh", zone: "Riverglades", area: "hut beside the fortress", way: "33.4 38.0", isNew: true,
          pre: "Rom'gar chain, 14 steps: (1) A Message in Blood + Food for the Taking, Krom'rosh → (2) Show Them How It's Done → (3) Encroaching Twilight + Twilight Missives → (4) Digging for Answers, Tran'gul in the tower behind Krom'rosh; cave at 49.9 47.0 → (5) The Purple Ones + Sickening Lights → (6) Twilight No More!, then talk to Tran'gul → (7) Land of Giants, sends you to Bolderok → (8) Unworthy Champion + Might Makes Right → (9) Clugfist's Decree, hand in to Krom'rosh → (10) The Wayward Warrior, find Da'grosh at 33 38 → (11) Carving a Path + Break Their Chains + Rumblings of Discontent → (12) Bring Me His Head → (13) accept A Token of Vengeance and It Is Time, Brother... → (14) turn in It Is Time, Brother... to open Eye of Mugg and Tome of Twilight.", task: "Collect 15 Cultist Ears from Twilight's Hammer mobs inside.", reward: "Semblance of Twilight" },
        { id: 94968, name: "Eye of Mugg", lvl: 38, giver: "Krom'rosh", zone: "Riverglades", area: "Rom'gar", way: "59.4 45.6", isNew: true, seed: "done",
          pre: "Same chain; opens when you turn in It Is Time, Brother... (step 14).", task: "Kill Overlord Mugg (last boss) and loot the eye.", reward: "Rock on Stick (1H mace), Stick No Rock or Bigger Rock on Bigger Stick" },
        { id: 94972, name: "Tome of Twilight", lvl: 38, giver: "Tran'gul", zone: "Riverglades", area: "Rom'gar, inside the building", way: "59.4 44.0", isNew: true,
          pre: "Same chain; opens when you turn in It Is Time, Brother... (step 14).", task: "Kill Nar'gurk and loot the tome.", reward: "Indoctrinated Choker or Convert's Bindings" },
        { id: 94973, name: "Krol'dok Moulding", lvl: 38, giver: "Drops from Tunk", zone: "Inside the dungeon", area: "the blacksmith beside War Handler Ashka", isNew: true,
          task: "Kill Tunk and loot the moulding. Take it to Kreza Darkthon in Riverglades for Key Ingredients: 4 Thick Leather and 12 Iron Bars. Bring those along to finish it the same day.", where: "inside", reward: "Krol'dok Compound Key" }
      ],
      loot: ["Krol'dok Warplate Chest, plate, +13 defense (Nar'gurk, 26%)", "Krol'dok Warplate Helmet (Nar'gurk, 29%): Strength/Spirit, no defense, weak for tanking",
             "Zarmok's Plated Signet, ring: Stamina, block value, hit (Twilight Commander Zarmok, 33%)",
             "Krol'dok Warplate Gauntlets, Legplates and Pauldrons are bind-on-equip trash drops (1–4%): check the auction house", "Slavecrusher Scepter, 1H mace (Slavecrusher Grox)",
             "Skip: Worgbinder's Treads (Strength/Intellect) and Band of Bossman (healer ring)", "Toofbreaker, 1H mace (Bossman Toof)", "Emblem of Slamming, trinket (Overlord Mugg)", "Chain of the Corruptor, neck (Nar'gurk)"] },

    { id: "ulda", name: "Uldaman", zone: "Badlands", range: [41, 51], hard: 39, ready: 41,
      note: "Fly to Kargath. Take Necklace Recovery from Dran Droffers in Orgrimmar before you go; the Shattered Necklace drops off Shadowforge mobs outside the portal, and the chain ends in Jarkal's Enhancing Necklace, a top tank neck for 40–45. The full chain takes two visits unless your group clears to Archaedas.",
      quests: [
        { id: 2342, name: "Reclaimed Treasures", lvl: 33, giver: "Patrick Garrett", zone: "Undercity", area: "near the bank ring", way: "62.8 48.5",
          task: "Open the Garrett family chest in the South Common Hall (just outside the portal, in the dig).", where: "outside" },
        { id: 2202, name: "Uldaman Reagent Run", lvl: 36, giver: "Jarkal Mossmeld", zone: "Badlands", area: "Kargath", way: "2.4 46.1",
          pre: "Badlands Reagent Run from Jarkal: 5 Buzzard Gizzards, 10 Crag Coyote Fangs, 5 Rock Elemental Shards from Badlands mobs.", task: "Collect 12 Magenta Fungus Caps inside.", reward: "Restorative Elixirs" },
        { id: 2418, name: "Power Stones", lvl: 30, giver: "Rigglefuzz", zone: "Badlands", area: "central", way: "42.4 52.8",
          task: "8 Dentrium and 8 An'Alleum Power Stones from Shadowforge mobs, outside and inside." },
        { id: 709, name: "Solution to Doom", lvl: 30, giver: "Theldurin the Lost", zone: "Badlands", area: "south", way: "51.2 76.7",
          task: "Find the Tablet of Ryun'eh inside." },
        { id: 2283, name: "Necklace Recovery (chain)", lvl: 38, giver: "Dran Droffers", zone: "Orgrimmar", area: "The Drag", way: "59.6 36.5",
          task: "Take Necklace Recovery from Dran first, then loot the Shattered Necklace from Shadowforge mobs outside the portal. Chain: Take 2 (Remains of a Paladin inside, for the journal) → Translating the Journal (Jarkal, Kargath) → Find the Gems and Power Source (ruby in a barricaded Shadowforge area, topaz in a trogg-area urn, sapphire from Grimlok, power source from Archaedas) → Deliver the Gems (Dran) → Take 3 (Jarkal).",
          reward: "Jarkal's Enhancing Necklace (+10 Stamina, +1 Intellect, +12 spell power). Take 3 is turned in to Jarkal Mossmeld, Kargath" },
        { id: 2278, name: "The Platinum Discs", lvl: 40, giver: "The Discs of Norgannon", zone: "Inside the dungeon", area: "room behind Archaedas",
          task: "Talk to the stone watcher, then take the discs to a sage in Thunder Bluff.", where: "inside" }
      ],
      loot: ["Jarkal's Enhancing Necklace (necklace chain)", "Stoneslayer / The Rockpounder are two-handers: skip for tanking", "Olaf's All Purpose Shield (The Lost Dwarves event)"] },

    { id: "zf", name: "Zul'Farrak", zone: "Tanaris", range: [44, 54], hard: 42, ready: 44,
      note: "Most groups run it at 46–48. Someone needs the Mallet of Zul'Farrak (Hinterlands) to summon Gahz'rilla.",
      quests: [
        { id: 2865, name: "Scarab Shells", lvl: 40, giver: "Tran'rek", zone: "Tanaris", area: "Gadgetzan", way: "51.6 26.8", pre: "Possibly required: the breadcrumb Tran'rek, from Krazek in Booty Bay. Gfinity and Frostyboost say you need it; Conquest Capped and Warcraft Tavern say you don't. If you pass through Booty Bay, take it.", task: "5 Uncracked Scarab Shells from scarabs inside." },
        { id: 3042, name: "Troll Temper", lvl: 40, giver: "Trenton Lighthammer", zone: "Tanaris", area: "Gadgetzan", way: "51.4 28.6", task: "20 Vials of Troll Temper from elite trolls inside." },
        { id: 2768, name: "Divino-matic Rod", lvl: 40, giver: "Chief Engineer Bilgewhizzle", zone: "Tanaris", area: "Gadgetzan", way: "52.4 28.4", task: "Rescue the prisoners at the pyramid; loot the rod from Sergeant Bly." },
        { id: 2846, name: "Tiara of the Deep", lvl: 40, giver: "Tabetha", zone: "Dustwallow Marsh", way: "46.0 57.1", pre: "Pick up Tabetha's Task from Deino in Orgrimmar (38.4 85.8) first. Sources disagree on whether it's required, and Deino is on your way anyway.", task: "Kill Hydromancer Velratha.", reward: "Gemshale Pauldrons (plate, +5 Strength, +10 Stamina, +8 Intellect) or Dank Shoulderpads, plus Spellshifter Rod" },
        { id: 3527, name: "The Prophecy of Mosh'aru", lvl: 40, giver: "Yeh'kinya", zone: "Tanaris", area: "Steamwheedle Port", way: "67.0 22.4", pre: "Screecher Spirits, from Yeh'kinya, done in Feralas.", task: "Both Mosh'aru Tablets, from Theka and Velratha." },
        { id: 2936, name: "The Spider God", lvl: 40, giver: "Master Gadrin", zone: "Durotar", area: "Sen'jin Village", way: "55.9 74.7", pre: "Venom Bottles chain from the Hinterlands.", task: "Read the Tablet of Theka." },
        { id: 2770, name: "Gahz'rilla", lvl: 40, giver: "Wizzle Brassbolts", zone: "Thousand Needles", area: "Shimmering Flats", way: "78.1 77.1", task: "Gahz'rilla's Electrified Scale. Someone in the group needs the Mallet of Zul'Farrak. (The Brassbolts Brothers lead-in is Alliance only.)" },
        { id: "zumrah", name: "Zum'rah's Head", lvl: 42, giver: "Mazu'kon", zone: "Mulgore", area: "Skywatcher Plateau", way: "32.4 20.6", isNew: true, task: "Kill Witch Doctor Zum'rah and bring back his head.", reward: "About 10,100 XP, 65s, Earthen Ring and Darkspear reputation" }
      ],
      loot: ["Blood Ritual Ring, +13 Stamina, +3 defense, requires 43 (Witch Doctor Zum'rah, 25%)", "Big Bad Pauldrons, plate, 396 armor, +12 Strength, +12 Stamina, requires 45 (Chief Ukorz, about 25%)",
             "Jang'thraze the Protector, 1H sword, absorb proc, requires 45 (rare drop; source unclear, possibly Ukorz)"] },

    { id: "mara", name: "Maraudon", zone: "Desolace", range: [46, 55], hard: 41, ready: 45,
      guide: "https://www.icy-veins.com/wow-forever/maraudon-quests",
      note: "Three wings. Legends of Maraudon leads to The Scepter of Celebras, a shortcut to the inner wing. Re-checked 2026-11-23 against Icy Veins Forever (quest list updated 11-18) and Wowhead Forever: Forever adds two Horde-usable quests, An'she's Radiance (Mulgore) and Rot and Regret (Shen'dralas, southern Desolace, after Word of the Woods). Seed of Life (from Zaetar's Spirit after Theradras) is turned in to Keeper Remulos in Moonglade and has no gear reward.",
      quests: [
        { id: 96776, name: "An'she's Radiance", lvl: 51, giver: "Olana Brighthoof", zone: "Mulgore", area: "Skywatcher's Plateau (same plateau as Mazu'kon)", way: "32.6 24.0", isNew: true,
          task: "Recover the An'she's Radiance crystal, found behind Landslide (inner Maraudon). Shareable.", reward: "11,900 XP, about 1g 38s, +300 Earthen Ring, +200 Thunder Bluff; no gear" },
        { id: 93404, name: "Rot and Regret", lvl: 49, giver: "Woodwyrd", zone: "Shen'dralas", area: "Forlorn Gardens (Shen'dralas map coordinates)", way: "69.4 72.0", isNew: true,
          pre: "DOING IT (user, 11-23; Forlorn Gardens unlocked). Lead-in done: Mordent Evenshade's pylon chain to Meeting the Magister. Mithera (Shen'dralas 53.1 75.8) chain, all Alliance and Horde (EverlookDB): 1) Forlorn Gardens: examine the pedestal at the gardens' south end, back to Mithera (1,800 XP). 2a) What They've Done to My Peonies: 4 Rowdy Rose, 4 Terrible Tulip, 20 Malevolent Marigold (north part of the gardens), back to Mithera (3,600 XP). 2b) Word of the Woods: to Woodwyrd, middle of the gardens (360 XP). 3) Rot and Regret (this quest). 4) Passing the Blame (from Woodwyrd after this): to Kog'thug the Brave, Bristleback Retreat, Shen'dralas 72.6 31.6 (390 XP). 5) Agamaggan's Blood: Virulent Blood of Agamaggan from Razorfen Downs (not Kraul), back to Kog'thug (10,200 XP, 65s; no item listed). Watch for Nascent Pylon Protectors (elite 43) in the gardens; the Shen'dralar there are neutral.",
          task: "Click the small water geyser (Earth Song Splash) on the surface of the pools Rotgrip swims in (inner Maraudon) to loot the Vial of Earth Song Water. Back at Woodwyrd, use the vial on the burning tree to his left (Woodwyrd's Burning Body), not on Woodwyrd himself, or it errors. Sources: EverlookDB (vial drops from object Earth Song Splash), Wowhead Forever comment, EU forum 11-22.", reward: "11,100 XP; Thornplated Cord (plate waist, ilvl 43, +9 Stamina, +9 Intellect, +9 Spirit) or Overgrown Cuffs (leather)" },
        { id: 7068, name: "Shadowshard Fragments", lvl: 38, giver: "Uthel'nay", zone: "Orgrimmar", area: "Valley of Spirits", way: "39.2 86.3", task: "10 fragments from Shadowshard Rumblers and Smashers just outside the portals.", where: "outside", reward: "Zealous or Prodigious Shadowshard Pendant" },
        { id: 7028, name: "Twisted Evils", lvl: 47, giver: "Willow", zone: "Desolace", area: "Kormek's Hut, near Thunderaxe Fortress", way: "62.2 39.6", task: "Theradric Crystal Carvings from mobs inside: 25 (confirmed in your quest log, 11-23). The Nameless Prophet always drops them.", reward: "Acumen Robes, Sprightring Helm, Relentless Chain or Hulkstone Pauldrons" },
        { id: 7029, name: "Vyletongue Corruption", lvl: 41, giver: "Vark Battlescar", zone: "Desolace", area: "Shadowprey Village", way: "23.2 70.3", task: "Before entering, fill the Coated Cerulean Vial at an orange-crystal pool outside the orange (right-hand) entrance; blue water doesn't count. Inside, use it on Vylestem Vines and kill the Noxxious Scions (immune to Nature) 8 times.", reward: "Woodseed Hoop, Sagebrush Girdle or Branchclaw Gauntlets" },
        { id: 7064, name: "Corruption of Earth and Seed", lvl: 45, giver: "Selendra", zone: "Desolace", area: "Shadowprey Village area", way: "26.9 77.7", task: "Kill Princess Theradras (last boss). Seed of Life (Zaetar's Spirit, appears after) is a separate follow-up.", reward: "Thrash Blade, Resurgence Rod or Verdant Keeper's Aim" },
        { id: 7066, name: "Seed of Life", lvl: 51, giver: "Zaetar's Spirit", zone: "Inside the dungeon", area: "appears after Princess Theradras dies", where: "inside", task: "Take the Seed of Life to Keeper Remulos, Moonglade 36.2 41.8.", reward: "11,900 XP, 1g 61s, +150 Cenarion Circle; no item (EverlookDB)" },
        { id: 7067, name: "The Pariah's Instructions", lvl: 39, giver: "Centaur Pariah", zone: "Desolace", area: "patrols the road south of Mannoroc Coven (Wowhead: around 48.4 87.0)", way: "50.4 86.6", task: "Kill The Nameless Prophet, who wanders near the big stone door in the cave before the portals, for the Amulet of Spirits. Use it on the five Khans (Kolk, Gelk, Magra, Maraudos, Veng) to make them attack, loot a gem from each, and combine the gems into the Amulet of Union. Not shareable.", reward: "Mark of the Chosen" },
        { id: 7044, name: "Legends of Maraudon", lvl: 41, giver: "Cavindra", zone: "Desolace", area: "in the caves outside the portal, on the orange side", task: "Celebrian Rod from Noxxion and Celebrian Diamond from Lord Vyletongue, then kill Celebras the Cursed. Turn in to Celebras the Redeemed inside." },
        { id: 7046, name: "The Scepter of Celebras", lvl: 41, giver: "Celebras the Redeemed", zone: "Inside the dungeon", area: "after Celebras the Cursed dies", where: "inside", task: "Follow him and wait out his ritual. Rewards the Scepter of Celebras, the shortcut to the inner wing. Not shareable.", reward: "Scepter of Celebras" }
      ], loot: [] },

    { id: "alcaz", name: "Alcaz Prison", zone: "Alcaz Island, Dustwallow Marsh", range: [48, 53], hard: 46, ready: 48, isNew: true,
      guide: "https://www.warcrafttavern.com/forever/guides/alcaz-island-prison/",
      note: "Range 48–53 (Warcraft Tavern says 48–55; final boss is level 51). The portal is in a building basement around 75, 15: take the path up the hill to the left of the dock. Bosses: Tidemistress Ca'zass, Overseer Wrex (his Overseer's Keyring opens the right side), Katerina the Cleaner, Zarla and Blazeroar, then The Questioner behind a locked door. The Kor'kron chain starts with Eitrigg in Orgrimmar (EverlookDB, 11-24).",
      quests: [
        { id: "korkron", name: "The Missing Kor'kron (chain)", lvl: 48, giver: "Eitrigg (Orgrimmar 34.2 39.0), then Nazeer Bloodpike", zone: "Dustwallow Marsh", area: "Brackenwall Village", way: "35.2 30.7", isNew: true,
          task: "Shareable. Chain: The Missing Kor'kron (Eitrigg) > The Elite of the Elite → Right Place, Wrong Time → No Orc Left Behind." },
        { id: "ulka", name: "Blood Red Bandanas / A Little Payback", lvl: 48, giver: "Sergeant Ulka", zone: "Dustwallow Marsh", area: "outside the prison", way: "70.3 19.0", isNew: true,
          task: "Bandanas: 8 from Defias Bounty Hunters (~71%), Alcaz Jailers and Overseer Wrex (~50%) inside, turned in to Eitrigg in Grommash Hold. Payback: 15 Strashaz Soldiers, 8 Enchantresses and Ca'zass's head. Ulka also gives No Orc Left Behind (turned in to Commander Folkar inside).",
          reward: "Payback: Kor'kron Battle Gauntlets, Naga Scale Spaulders or Marshdweller's Pants" },
        { id: "folkar", name: "The Honor of the Kor'kron → Thrall Needs to Know", lvl: 48, giver: "Commander Folkar", zone: "Inside the dungeon", isNew: true, where: "inside",
          task: "Then Bad News for Folkar (Perfumed Note after Blazeroar), then Thrall in Orgrimmar.", reward: "Fatebound Buckler (shield), Courier's Clasp or Dustwallow Dirk" },
        { id: "ironchains", name: "The Man in the Iron Chains", lvl: 48, giver: "Inside the dungeon", zone: "Inside the dungeon", isNew: true, where: "inside",
          task: "Ornate Shackle Key drops from The Questioner (~50%); take it to Mason Connery. His note starts More Valuable Than Gold: click the Loose Floorboard for the Document Box. State Secrets: hand the box to Nazgrel (Orgrimmar 32.4 36.0) or Rix Xizzix (Booty Bay, Stranglethorn 28.4 75.8), not both (EverlookDB 11-24).",
          reward: "State Secrets: Fractured Insignia, 6,550 XP, 1g 60s" }
      ],
      loot: ["Girdle of Extracted Answers, plate waist, +12 Strength, +15 Stamina, damage on block (The Questioner)", "Fingerbreaker Stamp, trinket, +6 defense (The Questioner)",
             "Fatebound Buckler, shield (quest: Thrall Needs to Know)", "Grips of Control, plate hands, caster stats (Overseer Wrex): skip"] },

    { id: "st", name: "Sunken Temple", zone: "Swamp of Sorrows", range: [50, 60], hard: 46, ready: 49,
      note: "Might of Hakkar (1H mace) and Warrior's Embrace (plate chest), both level 49 drops from the Avatar of Hakkar, are top Protection Paladin picks. The level 50 paladin class quest (Forging the Mightstone) is currently Alliance only: it starts in the Western Plaguelands, every NPC in it is hostile to Horde, and Horde trainers don't offer it. The level range is from Classic data.",
      quests: [
        { id: 1445, name: "The Temple of Atal'Hakkar", lvl: 38, giver: "Fel'zerul", zone: "Swamp of Sorrows", area: "Stonard", way: "47.9 54.8", pre: "Pool of Tears → The Atal'ai Exile → Return to Fel'zerul.", task: "20 Fetishes of Hakkar.", reward: "Guardian Talisman (trinket: chance when struck for +350 armor) and Orgrimmar reputation" },
        { id: 1446, name: "Jammal'an the Prophet", lvl: 38, giver: "Atal'ai Exile", zone: "The Hinterlands", area: "Shadra'Alor", way: "33.8 75.2", task: "Head of Jammal'an.", reward: "Rainstrider Leggings, Helm of Exile or Leggings of Freedom and Sorrow" },
        { id: 3446, name: "Into the Depths / Secret of the Circle", lvl: 46, giver: "Marvon Rivetseeker", zone: "Tanaris", way: "52.7 45.9", pre: "The Sunken Temple (Witch Doctor Uzer'i, Feralas) → The Stone Circle (Marvon's chest in Ratchet).", task: "Altar of Hakkar and the statue circle." },
        { id: 3528, name: "The God Hakkar", lvl: 40, giver: "Yeh'kinya", zone: "Tanaris", area: "Steamwheedle Port", way: "67.0 22.4", pre: "Screecher Spirits → The Prophecy of Mosh'aru (Zul'Farrak) → The Ancient Egg.", task: "Summon and kill the Avatar of Hakkar.", reward: "Avenguard Helm, Lifeforce Dirk, Gemburst Circlet or Shapeshifter's Helm" },
        { id: 4146, name: "Zapper Fuel", lvl: 47, giver: "Liv Rizzlefix", zone: "The Barrens", area: "Ratchet", way: "62.4 38.7", pre: "Larion and Muigin → Marvon's Workshop (Un'Goro).", task: "5 Atal'ai Haze. Turn in to Larion, Marshal's Refuge." }
      ], loot: ["Might of Hakkar, 1H mace (Avatar of Hakkar)", "Warrior's Embrace, plate chest (Avatar of Hakkar)"] },

    { id: "brd", name: "Blackrock Depths", zone: "Blackrock Mountain", range: [52, 60], hard: 50, ready: 52, note: "Around 25 Horde quests, most from Kargath. Planned in detail when you reach 48.", quests: [], loot: [] },
    { id: "blackmaw", name: "Blackmaw Hold", zone: "Azshara", range: [55, 60], hard: 53, ready: 55, isNew: true, note: "New in Forever.", quests: [], loot: [] },
    { id: "lbrs", name: "Lower Blackrock Spire", zone: "Blackrock Mountain", range: [55, 60], hard: 53, ready: 55, quests: [], loot: [] },
    { id: "dm", name: "Dire Maul", zone: "Feralas", range: [54, 60], hard: 54, ready: 56, note: "East is 54–60; West and North are 56–60. All three wings count toward Master Spelunker.", quests: [], loot: [] },
    { id: "scholo", name: "Scholomance", zone: "Western Plaguelands", range: [58, 60], hard: 56, ready: 58, note: "Plaguelands: one of your favourite zones.", quests: [], loot: [] },
    { id: "strat", name: "Stratholme", zone: "Eastern Plaguelands", range: [58, 60], hard: 56, ready: 58, note: "Plaguelands: one of your favourite zones.", quests: [], loot: [] },
    { id: "shaper", name: "Shaper's Terrace", zone: "Un'Goro Crater", range: [58, 60], hard: 57, ready: 58, isNew: true, quests: [], loot: [] },
    { id: "ubrs", name: "Upper Blackrock Spire", zone: "Blackrock Mountain", range: [59, 60], hard: 58, ready: 59, quests: [], loot: [] }
  ],

  /* Equipped gear from the armory, and the best realistic replacement per slot.
     how: craft | quest | drop | buy.  at = level you can use it.  bs = Blacksmithing skill needed.
     Stats re-checked 2026-11-20 against Wowhead Forever tooltips. Paladins can wear mail; plate is marked where it matters. */
  gear: [
    { slot: "Head", cur: "Warbringer's Crown of the Champion (plate, 355 armor, +8 Str, +14 Sta, +4 def)", ilvl: 45, targets: [
      { name: "Helm of the Mountain", stats: "plate, 453 armor (+230 bonus), +3 Stamina, +7 defense, +10 Nature Resistance", how: "drop", from: "mara", src: "Landslide, about 25%. Sidegrade: more armor and defense, 11 less Stamina than your crown. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 48 },
      { name: "Warbringer's Crown of the Champion", stats: "plate, 355 armor, +8 Strength, +14 Stamina, +4 defense", how: "drop", src: "equipped 2026-11-21 (bind-on-equip)", at: 40 },
      { name: "Serpentbane Crown", stats: "mail, +16 Stamina", how: "drop", from: "drowned", src: "Min'loth the Serpent", at: 37 },
      { name: "Heavy Mithril Helm", stats: "plate, 469 armor, +15 Stamina", how: "craft", bs: 220, at: 42, note: "Plans are a world drop, not trainer (Forever tooltip says 220; wiki says 245)" } ] },
    { slot: "Neck", cur: "Abomination Chain", ilvl: 42, targets: [
      { name: "Dragon's Blood Necklace", stats: "+12 Stamina, +8 block value", how: "quest", from: "smcath", src: "Into the Scarlet Monastery", at: 37 },
      { name: "Abomination Chain", stats: "", how: "drop", from: "rfd", src: "Glutton", at: 37 },
      { name: "Jarkal's Enhancing Necklace", stats: "+10 Stamina, +1 Intellect, +12 spell power", how: "quest", from: "ulda", src: "Necklace Recovery, Take 3", at: 41 } ] },
    { slot: "Shoulders", cur: "Krol'dok Warplate Pauldrons", ilvl: 46, targets: [
      { name: "Hulkstone Pauldrons", stats: "plate, 354 armor, +13 Stamina, +1% block", how: "quest", from: "mara", src: "Twisted Evils. Slightly below your Krol'dok Pauldrons; take it only as a spare.", at: 47 },
      { name: "Krol'dok Warplate Pauldrons", stats: "plate, 368 armor (+50 bonus), +14 Stamina, +1% hit (set 1/5)", how: "drop", from: "kroldok", src: "bind-on-equip trash drop, or auction house", at: 41 },
      { name: "Warder's Pauldrons", stats: "plate, 375 armor, +10 defense, +13 Stamina, +9 spell power", how: "craft", bs: 210, at: 42, note: "Plans from Gor'mak (Barrens 49.8 29.7), 60 Merchant's Favor, Friendly with Durotar Supply and Logistics" },
      { name: "Big Bad Pauldrons", stats: "plate, 396 armor, +12 Strength, +12 Stamina", how: "drop", from: "zf", src: "Chief Ukorz, about 25%", at: 45 } ] },
    { slot: "Back", cur: "Cloak of the Cult", ilvl: 46, targets: [
      { name: "Grovekeeper's Drape", stats: "37 armor, +12 Stamina, +10 Nature Resistance", how: "drop", from: "mara", src: "Celebras the Cursed, about 33%. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 47 },
      { name: "Silky Spider Cape", stats: "", how: "drop", from: "rfd", src: "Tuten'kash, 34%", at: 37 },
      { name: "Waterlogged Burial Shroud", stats: "+7 Stamina, crit, attack power", how: "drop", from: "drowned", src: "Primeval Elemental", at: 37 } ] },
    { slot: "Chest", cur: "Zealot Plate (plate, 509 armor, +13 Str, mana on hit)", ilvl: 48, targets: [
      { name: "Zealot Plate", stats: "plate, 509 armor, +13 Strength, chance when struck to restore 66–110 mana", how: "drop", src: "equipped 2026-11-21", at: 43 },
      { name: "Green Iron Hauberk", stats: "mail, 238 armor, +11 Stamina, +7 Strength", how: "craft", bs: 180, at: 31, note: "Trainer plans. Skill is 155 per the wiki, 180 per Classic data; one report says the recipe is bugged" },
      { name: "Carapace of Tuten'kash", stats: "plate, 373 armor, +10 Strength, +8 Agility, +15 Stamina", how: "drop", from: "rfd", src: "Tuten'kash, 33%", at: 40 },
      { name: "Krol'dok Warplate Chest", stats: "plate, 490 armor, +10 Strength, +10 Stamina, +13 defense", how: "drop", from: "kroldok", src: "Nar'gurk, 26%", at: 41 } ] },
    { slot: "Wrist", cur: "Noxxion's Shackles (plate, 235 armor, +5 Str, +9 Sta, +10 Nature Resistance)", ilvl: 51, targets: [
      { name: "Noxxion's Shackles", stats: "plate, 235 armor, +5 Strength, +9 Stamina, +10 Nature Resistance", how: "drop", from: "mara", src: "Noxxion, about 40%. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 46 },
      { name: "Berserker Shackles", stats: "mail, +7 Strength, +6 defense", how: "drop", from: "drowned", src: "Zul'Alai", at: 37 },
      { name: "Warder's Wristguards", stats: "plate, 231 armor, +8 defense, +11 Stamina, +7 spell power", how: "craft", bs: 225, at: 45, note: "Plans from Gor'mak, 90 Merchant's Favor, Honored with Durotar Supply and Logistics" } ] },
    { slot: "Hands", cur: "Warsong Gauntlets", ilvl: 27, targets: [
      { name: "Branchclaw Gauntlets", stats: "plate, 295 armor, +9 Strength, +5 Stamina, 4 mana and 4 health per 5 sec", how: "quest", from: "mara", src: "Vyletongue Corruption (guaranteed). Replaces Warsong Gauntlets (ilvl 27).", at: 47 },
      { name: "Warder's Gauntlet", stats: "mail, 159 armor, +10 Stamina, +7 defense, +11 spell power", how: "craft", bs: 175, at: 35, note: "Not a trainer recipe: plans from Gor'mak (Barrens 49.8 29.7), 60 Merchant's Favor, Friendly with Durotar Supply and Logistics" },
      { name: "Krol'dok Warplate Gauntlets", stats: "plate, 300 armor, +9 Stamina, +1% parry", how: "drop", from: "kroldok", src: "bind-on-equip trash drop, or auction house", at: 40 } ] },
    { slot: "Waist", cur: "Twilight Lord Girdle", ilvl: 30, targets: [
      { name: "Warder's Belt", stats: "mail, 132 armor, +10 Stamina, +7 defense, +7 spell power", how: "craft", bs: 150, at: 30, note: "Trainer plans" },
      { name: "Thornplated Cord", stats: "plate, ilvl 43, +9 Stamina, +9 Intellect, +9 Spirit", how: "quest", from: "mara", src: "Rot and Regret (Woodwyrd, Shen'dralas). Chain unlocked 11-23; needs the Maraudon run.", at: 46 },
      { name: "Girdle of Extracted Answers", stats: "plate, +12 Strength, +15 Stamina, damage on block", how: "drop", from: "alcaz", src: "The Questioner", at: 48 } ] },
    { slot: "Legs", cur: "Dual Reinforced Leggings", ilvl: 37, targets: [
      { name: "Elemental Rockridge Leggings", stats: "plate, 496 armor, +20 Strength, +16 Stamina, +10 Nature Resistance", how: "drop", from: "mara", src: "Princess Theradras, about 20%. Requires level 49. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 49 },
      { name: "Krol'dok Warplate Legplates", stats: "plate, 429 armor, +8 Strength, +19 Stamina, +8 defense", how: "drop", from: "kroldok", src: "bind-on-equip trash drop, or auction house", at: 41 } ] },
    { slot: "Feet", cur: "Shinkicker Boots (plate, 300 armor, +10 Str, +9 Agi)", ilvl: 45, targets: [
      { name: "Dusty Mail Boots", stats: "mail, 180 armor, +14 Stamina", how: "drop", from: "smcath", src: "High Inquisitor Fairbanks, 35%", at: 37 },
      { name: "Warder's Boots", stats: "plate, 330 armor, +13 Stamina, +9 defense", how: "craft", bs: 200, at: 40, note: "Where to get the plans isn't known yet; they bind on pickup" },
      { name: "Linken's Boots of Iron", stats: "mail", how: "drop", from: "drowned", src: "rare drop in the dungeon, about 1%", at: 37 } ] },
    { slot: "Ring 1", cur: "Zarmok's Plated Signet", ilvl: 45, targets: [
      { name: "Zarmok's Plated Signet", stats: "+9 Stamina, +11 block value, +0.5% hit", how: "drop", from: "kroldok", src: "Twilight Commander Zarmok, 33%", at: 40 } ] },
    { slot: "Ring 2", cur: "Purified Ring (caster stats)", ilvl: 44, targets: [
      { name: "Blackstone Ring", stats: "+6 Stamina, +1% hit, +20 attack power", how: "drop", from: "mara", src: "Princess Theradras, about 25%. Requires level 49. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 49 },
      { name: "Dragonclaw Ring", stats: "stats not checked", how: "quest", from: "rfd", src: "Extinguishing the Idol", at: 37 },
      { name: "Knucklebone Ring", stats: "+7 Stamina", how: "drop", from: "drowned", src: "Deathless Marrow", at: 37 },
      { name: "Blood Ritual Ring", stats: "+13 Stamina, +3 defense", how: "drop", from: "zf", src: "Witch Doctor Zum'rah, 25%", at: 43 } ] },
    { slot: "Trinkets", cur: "Carrot on a Stick (mount speed only); second slot empty", ilvl: 0, targets: [
      { name: "Mark of the Chosen", stats: "2% chance when struck: +21 all stats for 1 min", how: "quest", from: "mara", src: "The Pariah's Instructions (guaranteed). Fills the empty trinket slot.", at: 47 },
      { name: "Defiler's Talisman", stats: "+8 Stamina; use: absorbs 353–431 physical damage (level 38 version)", how: "buy", src: "Defilers quartermaster; requires Friendly with The Defilers (Arathi Basin). Vendor location and price are from Classic data", at: 38 },
      { name: "Rune of Duty", stats: "+8 Stamina, +10 all resistances (pick this over Rune of Perfection; they can't be worn together)", how: "buy", src: "Warsong Gulch vendor; requires Friendly with Warsong Outriders", at: 40 },
      { name: "Fingerbreaker Stamp", stats: "+6 defense", how: "drop", from: "alcaz", src: "The Questioner", at: 48 },
      { name: "Guardian Talisman", stats: "chance when struck: +350 armor for 15 sec", how: "quest", from: "st", src: "The Temple of Atal'Hakkar", at: 38 } ] },
    { slot: "Main hand", cur: "Vanquisher's Sword (46-86, speed 2.20, +22 attack power)", ilvl: 44, targets: [
      { name: "Thrash Blade", stats: "66-124, speed 2.70 (35.2 DPS), chance on hit: extra attack", how: "quest", from: "mara", src: "Corruption of Earth and Seed (guaranteed choice). Beats Vanquisher's Sword (30 DPS).", at: 47 },
      { name: "Fist of Stone", stats: "44-83, speed 1.80 (35.3 DPS), +40 armor, mana on hit", how: "drop", from: "mara", src: "Landslide, about 25%. Requires level 48. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 48 },
      { name: "Vanquisher's Sword", stats: "46-86, speed 2.20, +22 attack power", how: "quest", from: "rfd", src: "Bring the End", at: 37 },
      { name: "Rock on Stick", stats: "57-107, speed 2.60, +4 Strength", how: "quest", from: "kroldok", src: "Eye of Mugg", at: 40 },
      { name: "Runed Mithril Hammer", stats: "32-61, speed 1.60, +7 Stamina, +4 defense", how: "craft", bs: 220, at: 44, note: "Plans are a world drop (Forever tooltip says 220; wiki says 245)" },
      { name: "Might of Hakkar", stats: "1H mace", how: "drop", from: "st", src: "Avatar of Hakkar", at: 49 } ] },
    { slot: "Shield", cur: "Putridus Wall (1,739 armor, 29 block, +10 Sta, +5 defense, +8 Nature Resistance)", ilvl: 50, targets: [
      { name: "Gizlock's Hypertech Buckler", stats: "1835 armor, 32 block, +10 Intellect, small spell power, 4 mana per 5 sec", how: "drop", from: "mara", src: "Tinkerer Gizlock, about 33%. Sidegrade: more armor and block, loses the Aegis Strength and Stamina. Stats: EverlookDB (Forever client, 11-23). Boss drop table and chance are Classic estimates; Forever may differ.", at: 48 },
      { name: "Aegis of the Scarlet Commander", stats: "1548 armor, +8 Stamina, +7 Strength", how: "drop", from: "smcath", src: "Scarlet Commander Mograine, 24%", at: 39 },
      { name: "Maw of Min'loth", stats: "1287 armor", how: "drop", from: "drowned", src: "Min'loth the Serpent", at: 37 },
      { name: "Fatebound Buckler", stats: "stats not published", how: "quest", from: "alcaz", src: "Thrall Needs to Know", at: 48 } ] }
  ],

  milestones: [
    { at: 40, id: "plate", name: "Train plate armor", detail: "Done: the armory shows plate pauldrons equipped." },
    { at: 40, id: "mount", name: "Warhorse quest", detail: "Done. Two quests: Report to Danitha, then A Paladin's Steed, which teaches Summon Warhorse." },
    { at: 40, id: "dualspec", name: "Dual specialization (50g)", detail: "Bought. Protection stays the main spec; second spec undecided, leaning shockadin over Retribution." },
    { at: 35, id: "firstaid", name: "Expert First Aid book", detail: "Buy Expert First Aid – Under Wraps from Balai Lok'Wein in Brackenwall Village, Dustwallow Marsh (on your way to Tabetha). At First Aid 225 and level 35, Doctor Gregory Victor in Hammerfall gives the Triage quest." },
    { at: 44, id: "legacy_bs", name: "Legacy: Journeyman Blacksmithing", detail: "1 Legacy Point at Blacksmithing 150. You're at 173, so check the Legacy window that it's credited." },
    { at: 45, id: "legacy45", name: "Legacy: Experienced Paladin", detail: "1 Legacy Point for reaching level 45. Comes next level." },
    { at: 44, id: "legacy_spel", name: "Legacy: Novice + Experienced Spelunker", detail: "Solo three low dungeons for 2 points: Deadmines (kill VanCleef) and Excavation Site: Wetlands (Relic Guardian) for Novice, and Blackfathom Deeps (Aku'mai) for Experienced." },
    { at: 50, id: "classq50", name: "Level 50 class quest", detail: "Not available to Horde paladins right now (Forging the Mightstone is Alliance only). Watch the patch notes for a fix." }
  ],

  unknowns: [
    "Your current gold after buying dual spec",
    "First Aid: did you buy the Expert book?",
    "Second spec: still leaning shockadin? The armory shows all 34 points in Protection",
    "Do solo dungeon kills count for Legacy? Check the Legacy window after your first solo run"
  ]
};
