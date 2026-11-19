/* Forever tracker data. Edit this file (or ask Claude to) when the plan changes.
   Sources, checked 2026-11-16: Wowhead Forever dungeon guides, ForeverDB, Forever Codex, wowarmory.gg.
   Quests are filtered to what a Horde Undead Paladin can take. */
window.TRACKER = {
  checked: "2026-11-16",

  /* Baseline snapshot. The live tracker overrides level / professions / gold from its saved state. */
  character: {
    name: "Danadin Lightbrindan",
    armory: "https://wowarmory.gg/forever/us/character/danadin-lightbrindan",
    realm: "US Normal (PvE)", faction: "Horde", race: "Undead", cls: "Paladin", spec: "Protection",
    guild: "Send Ibuprofen",
    level: 42, gold: null,
    stats: { Health: 1707, Mana: 1415, Armor: 2506, Strength: 140, Stamina: 129, "Attack power": 421 },
    professions: { Mining: [194, 225], Blacksmithing: [173, 225], "First Aid": [150, 150], Cooking: [57, 150], Fishing: [1, 75] },
    prefs: [
      "Dungeon-first leveling as tank",
      "Pick up every dungeon quest and its prerequisites, then clear them all in one run",
      "Skip zones you dislike (Arathi); favourites later on: the Plaguelands and Winterspring"
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
      note: "You haven't said whether you ran this. Optional at 37.", quests: [] },

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
        { id: "agamaggan", name: "Agamaggan's Blood", lvl: null, giver: "Longer chain", zone: "Later return",
          task: "Its chain runs through Maraudon. Come back for it at 46+ instead of holding up this run.", deferred: true }
      ],
      loot: ["Vanquisher's Sword (quest: Bring the End)", "Dragonclaw Ring (quest: Extinguishing the Idol)", "Abomination Chain, neck (Glutton)",
             "Silky Spider Cape (Tuten'kash, 33%)", "Savage Boar's Guard, shield (Ragglesnout, rare spawn)",
             "At 40 with plate: Carapace of Tuten'kash, chest (33%) and Icemetal Barbute, helm (Amnennar, 20%)"] },

    { id: "drowned", name: "The Drowned City", zone: "Off the Stranglethorn coast, south of the Haunted Isle", range: [35, 42], hard: 33, ready: 37, isNew: true, done: true,
      guide: "https://www.wowhead.com/forever/guide/the-drowned-city-dungeon-overview-location-rewards",
      note: "The entrance is an underwater cave west of the Vile Reef, around 21.4, 27.9; swim out from Grom'gol. Players advise 37–38 at the earliest: bosses are 37–40. Zeppelin to Grom'gol or boat to Booty Bay. A long stretch is underwater, so bring a Warlock or Shaman for water breathing. Bosses: Zul'Alai, Var'Taka, Primeval Elemental, Captain Dreadrise, Deathless Marrow, Min'loth the Serpent, plus rares Umbra and Gill.",
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
             "Knucklebone Ring (Deathless Marrow)", "Linken's Boots of Iron, mail (Primeval Elemental)", "Heart of the Primeval, trinket (Primeval Elemental)",
             "Berserker Shackles, mail wrist (Zul'Alai)", "Dreadfrost Saber, 1H sword (Captain Dreadrise)", "Waterlogged Burial Shroud, cloak (Primeval Elemental)"] },

    { id: "smarm", name: "Scarlet Monastery: Armory", zone: "Tirisfal Glades", range: [32, 42], hard: 30, ready: 35, done: true,
      note: "You hold the Scarlet Key, which opens this wing and the Cathedral. Herod is one of four kills for Into the Scarlet Monastery.",
      quests: [
        { id: 1048, name: "Into the Scarlet Monastery", lvl: 33, giver: "Varimathras", zone: "Undercity", area: "Royal Quarter", way: "56.6 92.6", shared: "smcath", seed: "have",
          task: "Kill Herod here. Whitemane and Mograine are in the Cathedral. Houndmaster Loksey is already dead.",
          reward: "Dragon's Blood Necklace (best tank neck near 38), Sword of Omen or Prophetic Cane" }
      ],
      loot: ["Herod's Shoulder, mail (35%)", "Scarlet Leggings, mail (15%)", "Raging Berserker's Helm, mail (35%)"] },

    { id: "smcath", name: "Scarlet Monastery: Cathedral", zone: "Tirisfal Glades", range: [35, 45], hard: 34, ready: 38, done: true,
      note: "Finishes Into the Scarlet Monastery. Fairbanks is in a hidden side room; ask the group to kill him for the boots.",
      quests: [
        { id: 1048, name: "Into the Scarlet Monastery", lvl: 33, giver: "Varimathras", zone: "Undercity", area: "Royal Quarter", way: "56.6 92.6", shared: "smarm", seed: "have",
          task: "Kill High Inquisitor Whitemane and Scarlet Commander Mograine.", reward: "Dragon's Blood Necklace (+12 Stamina, +8 block value)" }
      ],
      loot: ["Aegis of the Scarlet Commander, shield (Mograine) — best shield through level 40", "Dusty Mail Boots (Fairbanks, 33%)",
             "Triune Amulet, neck (Whitemane, 40%)", "Hand of Righteousness, 1H mace (Whitemane, 20%)"] },

    { id: "kroldok", name: "Krol'dok Stronghold", zone: "Riverglades, directly north of Sunnyglade", range: [40, 45], hard: 37, ready: 40, isNew: true,
      guide: "https://www.wowhead.com/forever/guide/kroldok-stronghold-dungeon-overview-location-rewards",
      note: "Bosses in order: Slavecrusher Grox, Twilight Commander Zarmok, War Handler Ashka, Nar'gurk, Bossman Toof, Overlord Mugg. The Krol'dok Warplate pieces are the best tank plate for levels 40–45. All three Horde dungeon quests sit at the end of one long Rom'gar chain; tell Claude which step you are on.",
      quests: [
        { id: 94975, name: "A Token of Vengeance", lvl: 38, giver: "Da'grosh", zone: "Riverglades", area: "hut beside the fortress", way: "33.4 38.0", isNew: true,
          pre: "Rom'gar chain, 14 steps: (1) A Message in Blood + Food for the Taking, Krom'rosh → (2) Show Them How It's Done → (3) Encroaching Twilight + Twilight Missives → (4) Digging for Answers, Tran'gul in the tower behind Krom'rosh; cave at 49.9 47.0 → (5) The Purple Ones + Sickening Lights → (6) Twilight No More!, then talk to Tran'gul → (7) Land of Giants, sends you to Bolderok → (8) Unworthy Champion + Might Makes Right → (9) Clugfist's Decree, hand in to Krom'rosh → (10) The Wayward Warrior, find Da'grosh at 33 38 → (11) Carving a Path + Break Their Chains + Rumblings of Discontent → (12) Bring Me His Head → (13) accept A Token of Vengeance and It Is Time, Brother... → (14) turn in It Is Time, Brother... to open Eye of Mugg and Tome of Twilight.", task: "Collect 15 Cultist Ears from Twilight's Hammer mobs inside.", reward: "Semblance of Twilight" },
        { id: 94968, name: "Eye of Mugg", lvl: 38, giver: "Krom'rosh", zone: "Riverglades", area: "Rom'gar", way: "59.4 45.6", isNew: true,
          pre: "Same chain; opens when you turn in It Is Time, Brother... (step 14).", task: "Kill Overlord Mugg (last boss) and loot the eye.", reward: "Rock on Stick (1H mace), Stick No Rock or Bigger Rock on Bigger Stick" },
        { id: 94972, name: "Tome of Twilight", lvl: 38, giver: "Tran'gul", zone: "Riverglades", area: "Rom'gar, inside the building", way: "59.4 44.0", isNew: true,
          pre: "Same chain; opens when you turn in It Is Time, Brother... (step 14).", task: "Kill Nar'gurk and loot the tome.", reward: "Indoctrinated Choker or Convert's Bindings" },
        { id: 94973, name: "Krol'dok Moulding", lvl: 38, giver: "Drops from Tunk", zone: "Inside the dungeon", area: "the blacksmith beside War Handler Ashka", isNew: true,
          task: "Kill Tunk and loot the moulding. Take it to Kreza Darkthon in Riverglades for Key Ingredients: 4 Thick Leather and 12 Iron Bars. Bring those along to finish it the same day.", where: "inside", reward: "Krol'dok Compound Key" }
      ],
      loot: ["Krol'dok Warplate Chest and Helmet, plate (Nar'gurk)", "Worgbinder's Treads, plate feet (War Handler Ashka)", "Zarmok's Plated Signet, ring: Stamina, block value, hit (Twilight Commander Zarmok)",
             "Krol'dok Warplate Gauntlets, Legplates and Pauldrons are bind-on-equip drops: check the auction house too", "Slavecrusher Scepter, 1H mace (Slavecrusher Grox)",
             "Band of Bossman, ring, and Toofbreaker, 1H mace (Bossman Toof)", "Emblem of Slamming, trinket (Overlord Mugg)", "Chain of the Corruptor, neck (Nar'gurk)"] },

    { id: "ulda", name: "Uldaman", zone: "Badlands", range: [41, 51], hard: 39, ready: 41,
      note: "Fly to Kargath. Start the necklace chain from the Shattered Necklace, which drops off Shadowforge mobs outside the portal; it ends in Jarkal's Enhancing Necklace, a top tank neck for 40–45. The full chain takes two visits unless your group clears to Archaedas.",
      quests: [
        { id: 2342, name: "Reclaimed Treasures", lvl: 33, giver: "Patrick Garrett", zone: "Undercity", area: "near the bank ring", way: "62.8 48.5",
          task: "Open the Garrett family chest in the South Common Hall (just outside the portal, in the dig).", where: "outside" },
        { id: 2202, name: "Uldaman Reagent Run", lvl: 36, giver: "Jarkal Mossmeld", zone: "Badlands", area: "Kargath", way: "2.4 46.1",
          pre: "Badlands Reagent Run (outdoor Badlands quest from Jarkal).", task: "Collect 12 Magenta Fungus Caps inside.", reward: "Restorative Elixirs" },
        { id: 2418, name: "Power Stones", lvl: 30, giver: "Rigglefuzz", zone: "Badlands", area: "central", way: "42.4 52.8",
          task: "8 Dentrium and 8 An'Alleum Power Stones from Shadowforge mobs, outside and inside." },
        { id: 709, name: "Solution to Doom", lvl: 30, giver: "Theldurin the Lost", zone: "Badlands", area: "south", way: "51.2 76.7",
          task: "Find the Tablet of Ryun'eh inside." },
        { id: 2283, name: "Necklace Recovery (chain)", lvl: 37, giver: "Shattered Necklace drop, then Dran Droffers", zone: "Orgrimmar", area: "The Drag", way: "59.6 36.5",
          task: "Necklace Recovery → Take 2 → Translating the Journal → Find the Gems and Power Source (Ironaya, Grimlok, Archaedas) → Deliver the Gems.",
          reward: "Jarkal's Enhancing Necklace" },
        { id: 2278, name: "The Platinum Discs", lvl: 40, giver: "The Discs of Norgannon", zone: "Inside the dungeon", area: "room behind Archaedas",
          task: "Talk to the stone watcher, then take the discs to a sage in Thunder Bluff.", where: "inside" }
      ],
      loot: ["Jarkal's Enhancing Necklace (necklace chain)", "Stoneslayer / The Rockpounder are two-handers: skip for tanking", "Olaf's All Purpose Shield (The Lost Dwarves event)"] },

    { id: "zf", name: "Zul'Farrak", zone: "Tanaris", range: [44, 54], hard: 42, ready: 44,
      note: "Someone needs the Mallet of Zul'Farrak (Hinterlands) to summon Gahz'rilla.",
      quests: [
        { id: 2865, name: "Scarab Shells", lvl: 40, giver: "Tran'rek", zone: "Tanaris", area: "Gadgetzan", way: "51.5 26.8", pre: "Tran'rek, from Krazek in Booty Bay.", task: "5 Uncracked Scarab Shells." },
        { id: 3042, name: "Troll Temper", lvl: 40, giver: "Trenton Lighthammer", zone: "Tanaris", area: "Gadgetzan", way: "51.4 28.7", task: "20 Vials of Troll Temper from the trolls." },
        { id: 2768, name: "Divino-matic Rod", lvl: 40, giver: "Chief Engineer Bilgewhizzle", zone: "Tanaris", area: "Gadgetzan", way: "52.4 28.5", task: "Rescue the prisoners at the pyramid; loot the rod from Sergeant Bly." },
        { id: 2846, name: "Tiara of the Deep", lvl: 40, giver: "Tabetha", zone: "Dustwallow Marsh", way: "46.0 57.1", pre: "Tabetha's Task (optional lead-in).", task: "Kill Hydromancer Velratha." },
        { id: 3527, name: "The Prophecy of Mosh'aru", lvl: 40, giver: "Yeh'kinya", zone: "Tanaris", area: "Steamwheedle Port", way: "67.0 22.4", pre: "Screecher Spirits (Feralas).", task: "Both Mosh'aru Tablets, from Theka and Velratha." },
        { id: 2936, name: "The Spider God", lvl: 40, giver: "Master Gadrin", zone: "Durotar", area: "Sen'jin Village", way: "55.9 74.7", pre: "Venom Bottles chain from the Hinterlands.", task: "Read the Tablet of Theka." },
        { id: 2770, name: "Gahz'rilla", lvl: 40, giver: "Wizzle Brassbolts", zone: "Thousand Needles", area: "Shimmering Flats", way: "78.1 77.1", task: "Gahz'rilla's Electrified Scale. Needs the Mallet." }
      ],
      loot: ["Blood Ritual Ring (+13 Stamina, +3 defense)", "Big Bad Pauldrons, plate (Chief Ukorz, 30%)", "Jang'thraze the Protector, 1H sword (10%)"] },

    { id: "mara", name: "Maraudon", zone: "Desolace", range: [46, 55], hard: 41, ready: 45,
      note: "Three wings. Legends of Maraudon builds the Scepter of Celebras, a shortcut to the inner wing. This is also when you return for Agamaggan's Blood.",
      quests: [
        { id: 7068, name: "Shadowshard Fragments", lvl: 39, giver: "Uthel'nay", zone: "Orgrimmar", area: "Valley of Spirits", way: "39.2 86.3", task: "10 fragments from the rumblers outside the portals.", where: "outside" },
        { id: 7029, name: "Vyletongue Corruption", lvl: 41, giver: "Vark Battlescar", zone: "Desolace", area: "Shadowprey Village", way: "23.2 70.3", task: "Fill the vial at the orange pool, cleanse the plants." },
        { id: 7028, name: "Twisted Evils", lvl: 41, giver: "Willow", zone: "Desolace", way: "62.2 39.6", task: "15 Theradric Crystal Carvings." },
        { id: 7067, name: "The Pariah's Instructions", lvl: 39, giver: "Centaur Pariah", zone: "Desolace", area: "south, patrols", way: "50.4 86.7", task: "Assemble the Amulet of Union from the Khans." },
        { id: 7044, name: "Legends of Maraudon", lvl: 41, giver: "Cavindra", zone: "Desolace", area: "outside the orange portal", task: "Leads into The Scepter of Celebras." },
        { id: 7064, name: "Corruption of Earth and Seed", lvl: 45, giver: "Selendra", zone: "Desolace", area: "south of Shadowprey", way: "26.9 77.7", task: "Kill Princess Theradras, then take Seed of Life from Zaetar's Spirit." }
      ], loot: [] },

    { id: "alcaz", name: "Alcaz Prison", zone: "Alcaz Island, Dustwallow Marsh", range: [48, 53], hard: 46, ready: 48, isNew: true,
      note: "New in Forever. Quest and loot details are not published yet; this fills in before you reach 46.", quests: [], loot: [] },

    { id: "st", name: "Sunken Temple", zone: "Swamp of Sorrows", range: [50, 60], hard: 46, ready: 49,
      note: "Might of Hakkar and Warrior's Embrace are top Protection Paladin picks at 50. The paladin class quest at 50 also sends you here.",
      quests: [
        { id: 1445, name: "The Temple of Atal'Hakkar", lvl: 38, giver: "Fel'zerul", zone: "Swamp of Sorrows", area: "Stonard", way: "47.9 54.8", pre: "Three quests starting with Pool of Tears.", task: "20 Fetishes of Hakkar.", reward: "Guardian Talisman (+9 Stamina trinket)" },
        { id: 1446, name: "Jammal'an the Prophet", lvl: 38, giver: "Atal'ai Exile", zone: "The Hinterlands", way: "33.8 75.2", task: "Head of Jammal'an." },
        { id: 3446, name: "Into the Depths / Secret of the Circle", lvl: 46, giver: "Marvon Rivetseeker", zone: "Tanaris", way: "52.7 45.9", pre: "The Sunken Temple, from Witch Doctor Uzer'i in Feralas.", task: "Altar of Hakkar and the statue circle." },
        { id: 3528, name: "The God Hakkar", lvl: 40, giver: "Yeh'kinya", zone: "Tanaris", area: "Steamwheedle Port", way: "67.0 22.4", pre: "Follows The Prophecy of Mosh'aru (Zul'Farrak).", task: "Summon and kill the Avatar of Hakkar." },
        { id: 4146, name: "Zapper Fuel", lvl: 47, giver: "Liv Rizzlefix", zone: "The Barrens", area: "Ratchet", way: "62.4 38.7", pre: "Two quests starting with Larion and Muigin (Un'Goro).", task: "5 Atal'ai Haze." }
      ], loot: [] },

    { id: "brd", name: "Blackrock Depths", zone: "Blackrock Mountain", range: [52, 60], hard: 50, ready: 52, note: "Around 25 Horde quests, most from Kargath. Planned in detail when you reach 48.", quests: [], loot: [] },
    { id: "blackmaw", name: "Blackmaw Hold", zone: "Azshara", range: [55, 60], hard: 53, ready: 55, isNew: true, note: "New in Forever.", quests: [], loot: [] },
    { id: "lbrs", name: "Lower Blackrock Spire", zone: "Blackrock Mountain", range: [55, 60], hard: 53, ready: 55, quests: [], loot: [] },
    { id: "dm", name: "Dire Maul", zone: "Feralas", range: [54, 60], hard: 54, ready: 56, quests: [], loot: [] },
    { id: "scholo", name: "Scholomance", zone: "Western Plaguelands", range: [58, 60], hard: 56, ready: 58, note: "Plaguelands: one of your favourite zones.", quests: [], loot: [] },
    { id: "strat", name: "Stratholme", zone: "Eastern Plaguelands", range: [58, 60], hard: 56, ready: 58, note: "Plaguelands: one of your favourite zones.", quests: [], loot: [] },
    { id: "shaper", name: "Shaper's Terrace", zone: "Un'Goro Crater", range: [58, 60], hard: 57, ready: 58, isNew: true, quests: [], loot: [] },
    { id: "ubrs", name: "Upper Blackrock Spire", zone: "Blackrock Mountain", range: [59, 60], hard: 58, ready: 59, quests: [], loot: [] }
  ],

  /* Equipped gear from the armory, and the best realistic replacement per slot.
     how: craft | quest | drop | buy.  at = level you can use it.  bs = Blacksmithing skill needed. */
  gear: [
    { slot: "Head", cur: "Tusken Helm", ilvl: 34, targets: [
      { name: "Protector's Chain Helm", stats: "+11 Stamina, +7 defense", how: "craft", bs: 125, at: 37 },
      { name: "Serpentbane Crown", stats: "mail", how: "drop", from: "drowned", src: "Min'loth the Serpent", at: 37 },
      { name: "Heavy Mithril Helm", stats: "469 armor, +15 Stamina (plate)", how: "craft", bs: 220, at: 45 } ] },
    { slot: "Neck", cur: "Abomination Chain", ilvl: 42, targets: [
      { name: "Dragon's Blood Necklace", stats: "+12 Stamina, +8 block value", how: "quest", from: "smcath", src: "Into the Scarlet Monastery", at: 37 },
      { name: "Abomination Chain", stats: "", how: "drop", from: "rfd", src: "Glutton", at: 37 },
      { name: "Jarkal's Enhancing Necklace", stats: "+10 Stamina, +12 spell power", how: "quest", from: "ulda", src: "necklace chain", at: 41 } ] },
    { slot: "Shoulders", cur: "Battle Spaulders", ilvl: 36, targets: [
      { name: "Viscera Spaulders", stats: "+10 Stamina, +9 Strength", how: "drop", from: "drowned", src: "Deathless Marrow", at: 37 },
      { name: "Warder's Pauldrons", stats: "375 armor, +10 defense, +13 Stamina (plate)", how: "craft", bs: 210, at: 45 } ] },
    { slot: "Back", cur: "Wildhunter Cloak", ilvl: 32, targets: [
      { name: "Silky Spider Cape", stats: "", how: "drop", from: "rfd", src: "Tuten'kash, 33%", at: 37 },
      { name: "Waterlogged Burial Shroud", stats: "", how: "drop", from: "drowned", src: "Primeval Elemental", at: 37 } ] },
    { slot: "Chest", cur: "Mutant Scale Breastplate", ilvl: 23, targets: [
      { name: "Green Iron Hauberk", stats: "358 armor, +11 Stamina, +7 Strength", how: "craft", bs: 180, at: 37 },
      { name: "Carapace of Tuten'kash", stats: "plate", how: "drop", from: "rfd", src: "Tuten'kash, 33%", at: 40 },
      { name: "Krol'dok Warplate Chest", stats: "490 armor, +13 defense, +10 Stamina", how: "drop", from: "kroldok", src: "Nar'gurk", at: 42 } ] },
    { slot: "Wrist", cur: "Undead Knight's Bracers", ilvl: 36, targets: [
      { name: "Berserker Shackles", stats: "mail", how: "drop", from: "drowned", src: "Zul'Alai", at: 37 },
      { name: "Warder's Wristguards", stats: "231 armor, +8 defense, +11 Stamina (plate)", how: "craft", bs: 225, at: 45 } ] },
    { slot: "Hands", cur: "Warsong Gauntlets", ilvl: 27, targets: [
      { name: "Warder's Gauntlet", stats: "+10 Stamina, +7 defense", how: "craft", bs: 175, at: 37 },
      { name: "Krol'dok Warplate Gauntlets", stats: "300 armor, +15 parry, +9 Stamina", how: "drop", from: "kroldok", src: "bind-on-equip drop, or auction house", at: 40 } ] },
    { slot: "Waist", cur: "Twilight Lord Girdle", ilvl: 30, targets: [
      { name: "Warder's Belt", stats: "+10 Stamina, +7 defense", how: "craft", bs: 150, at: 37 } ] },
    { slot: "Legs", cur: "Dual Reinforced Leggings", ilvl: 37, targets: [
      { name: "Krol'dok Warplate Legplates", stats: "429 armor, +19 Stamina, +8 defense", how: "drop", from: "kroldok", src: "bind-on-equip drop, or auction house", at: 42 } ] },
    { slot: "Feet", cur: "Treacherous Treads", ilvl: 28, targets: [
      { name: "Dusty Mail Boots", stats: "270 armor, +14 Stamina", how: "drop", from: "smcath", src: "High Inquisitor Fairbanks, 33%", at: 37 },
      { name: "Linken's Boots of Iron", stats: "mail", how: "drop", from: "drowned", src: "Primeval Elemental", at: 37 },
      { name: "Worgbinder's Treads", stats: "plate", how: "drop", from: "kroldok", src: "War Handler Ashka", at: 42 } ] },
    { slot: "Ring 1", cur: "Purified Ring (caster stats)", ilvl: 44, targets: [
      { name: "Dragonclaw Ring", stats: "", how: "quest", from: "rfd", src: "Extinguishing the Idol", at: 37 },
      { name: "Knucklebone Ring", stats: "", how: "drop", from: "drowned", src: "Deathless Marrow", at: 37 },
      { name: "Zarmok's Plated Signet", stats: "+9 Stamina, +11 block value, +5 hit", how: "drop", from: "kroldok", src: "Twilight Commander Zarmok", at: 42 } ] },
    { slot: "Ring 2", cur: "Tundra Ring of the Knight", ilvl: 33, targets: [
      { name: "Blood Ritual Ring", stats: "+13 Stamina, +3 defense", how: "drop", from: "zf", at: 45 } ] },
    { slot: "Trinkets", cur: "Both slots empty", ilvl: 0, targets: [
      { name: "Defiler's Talisman", stats: "+8 Stamina", how: "buy", src: "Defilers vendor in Hammerfall, Arathi (Horde version of Talisman of Arathor, about 1g 50s; may need Arathi Basin reputation)", at: 37 },
      { name: "Heart of the Primeval", stats: "", how: "drop", from: "drowned", src: "Primeval Elemental", at: 37 },
      { name: "Rune of Perfection / Rune of Duty", stats: "+8 Stamina", how: "buy", src: "Warsong Gulch vendor, about 4g", at: 40 } ] },
    { slot: "Main hand", cur: "Vanquisher's Sword", ilvl: 44, targets: [
      { name: "Vanquisher's Sword", stats: "", how: "quest", from: "rfd", src: "Bring the End", at: 37 },
      { name: "Dreadfrost Saber", stats: "", how: "drop", from: "drowned", src: "Captain Dreadrise", at: 37 },
      { name: "Runed Mithril Hammer", stats: "+7 Stamina, +4 defense", how: "craft", bs: 220, at: 45 } ] },
    { slot: "Shield", cur: "Aegis of the Scarlet Commander (assumed)", ilvl: 44, targets: [
      { name: "Aegis of the Scarlet Commander", stats: "1548 armor, +8 Stamina, +7 Strength", how: "drop", from: "smcath", src: "Scarlet Commander Mograine", at: 38 },
      { name: "Maw of Min'loth", stats: "", how: "drop", from: "drowned", src: "Min'loth the Serpent", at: 37 } ] }
  ],

  milestones: [
    { at: 40, id: "plate", name: "Train plate armor", detail: "Opens Carapace of Tuten'kash, Icemetal Barbute and the Krol'dok Warplate set." },
    { at: 40, id: "mount", name: "Warhorse quest", detail: "Take Report to Danitha from Garen Largo, your trainer in Undercity, and ride to Bandarion Keep. It is a one-step class quest with no gold fee, so do it before paying for anything in Brill." },
    { at: 40, id: "dualspec", name: "Dual specialization (50g)", detail: "Bought. Protection stays the main spec; second spec undecided, leaning shockadin over Retribution." },
    { at: 35, id: "firstaid", name: "Expert First Aid book", detail: "Expert First Aid – Under Wraps from Balai Lok'Wein in Brackenwall Village, or the auction house. At First Aid 225, Doctor Gregory Victor in Hammerfall gives the Triage quest." },
    { at: 50, id: "classq50", name: "Level 50 class quest", detail: "Sends you into the Sunken Temple." }
  ],

  unknowns: [
    "Whether you ran Excavation Site: Wetlands",
    "Which step of the Rom'gar chain you are on",
    "Your current gold after buying dual spec",
    "Which shield dropped in Scarlet Monastery, and whether you turned in Into the Scarlet Monastery for the necklace",
    "Whether plate is trained",
    "First Aid: did you buy the Expert book?"
  ]
};
