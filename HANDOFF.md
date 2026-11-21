# WoW Forever Leveling Tracker: Handoff (v2)

Snapshot: **2026-11-21** (armory read 13:55 ET). Replaces the 2026-11-20 handoff.

## 0. How to use this in a new session

Open a session in `D:\ScratchPad\WoW-Forever-Tracker` and say:

> Continue as my WoW Forever planning assistant. Read HANDOFF.md, treat Section 3 as current status, and verify quest facts with Firecrawl before giving me routes.

The tracker lives in this folder (Section 7). Edit `data.js` / `state.json` in place; see `README.md`.

Goal (user's words): *"a solid tracker where you help me determine what I should focus / target on for wow forever."*

---

## 1. Character

| | |
|---|---|
| Name | **Danadin Lightbrindan** |
| Game | World of Warcraft: Forever, US, Normal ruleset (Forever has no realms) |
| Faction / race / class | Horde, Undead, Paladin |
| Spec | **Protection** tank, 34 points (armory, 11-19). Dual spec bought; second spec undecided, leaning shockadin |
| Level | **45, about 70%** (user, 11-21) |
| Guild | Send Ibuprofen |
| Armory | Search at https://wowarmory.gg/forever/us (first name Danadin, surname Lightbrindan). The direct `/forever/us/character/...` URL redirects to the home page; the search lands on `https://wowarmory.gg/?region=us&forever=danadin-lightbrindan`. Profile only updates after logout. |
| Plate | Trained (wearing plate pauldrons) |
| Mount | Warhorse done |
| Gold | Unknown |

### Professions (armory 11-21)
Mining 215/225, Blacksmithing 173/225, First Aid 150/150, Cooking 57/150, Fishing 1/75.

### Talents (armory 11-19, all Protection)
Redoubt 5, Precision 3, Sacred Duty 2, Templar's Bulwark 1, Shield Specialization 2, Toughness 2, Swift Judgement 1, Improved Righteous Fury 3, Anticipation 5, Holy Shield 1, Reckoning 5, Iron Creed 3, Shieldsworn 1.

### Stats (armory 11-21, level 45)
Health 2,156, Mana 1,847, Armor 3,928, Str 143, Agi 48, Sta 155, Int 66, Spirit 62, AP 429, SP 9, Dodge 5.2%, Parry 8.2%, Block 6.2%. Average item level 38. Talents: Protection 34, Retribution 2.

### Equipped (armory 11-21)
| Slot | Item | ilvl |
|---|---|---|
| Head | Warbringer's Crown of the Champion (plate, +8 Str, +14 Sta, +4 def) | 45 |
| Neck | Abomination Chain (+10 Sta, +3 def, +6 AP) | 42 |
| Shoulders | Krol'dok Warplate Pauldrons (plate, set 1/5) | 46 |
| Back | Cloak of the Cult | 46 |
| Chest | Zealot Plate (plate, 509 armor, +13 Str, mana on hit) | 48 |
| Wrist | Undead Knight's Bracers | 36 |
| Hands | Warsong Gauntlets | 27 |
| Waist | Twilight Lord Girdle | 30 |
| Legs | Dual Reinforced Leggings | 37 |
| Feet | Treacherous Treads | 28 |
| Ring 1 | Zarmok's Plated Signet | 45 |
| Ring 2 | Purified Ring (+12 Int, +5 SP: caster ring) | 44 |
| Shirt | Brawler's Harness | |
| Trinkets | Carrot on a Stick (mount speed); one empty | 50 |
| Main hand | Vanquisher's Sword (46-86, 2.20, +22 AP); Rock on Stick is about equal on damage | 44 |
| Off hand | Aegis of the Scarlet Commander | 44 |

Krol'dok Battlegear set: Helmet, Pauldrons, Chest, Legplates, Gauntlets. 2pc +100 armor, 3pc +5 defense, 4pc heal on block, 5pc stacking Stamina.

---

## 2. Preferences and working style

- Dungeon-first leveling as a tank. Pick up every dungeon quest and its prerequisites first, then do them all in one run.
- **Wants routes as plain bullet points, grouped by location, in travel order, with no back-and-forth.**
- Wants facts checked, not recalled. Twice this session the assistant got things wrong from Classic data (Uldaman quests assumed inside the instance when they were in the outdoor dig site; Necklace Recovery order). User pushed back both times and was right. **Verify against Forever sources before routing.**
- Give reasons for suggestions; no filler.
- Dislikes Arathi Highlands. Favourite later zones: Plaguelands, Winterspring.
- **Blacksmithing is on hold until level 60** (user, 2026-11-20). Don't route crafting or plan-buying stops; gear comes from drops, quests and the AH. `data.js` has `deferCrafting: true`.

---

## 3. Current status (2026-11-20)

### Dungeons done
Ragefire Chasm or Hall of Thanes, Ruins of Lordaeron, Wailing Caverns, Shadowfang Keep (all four per user, for Legacy), Gnomeregan, Razorfen Kraul, SM Graveyard / Library / Armory / Cathedral, City of Dalaran, Razorfen Downs, The Drowned City, Krol'dok Stronghold (all four Horde quests), Uldaman (all quests), **Zul'Farrak** (11-21, one run: Scarab Shells, Troll Temper, Divino-matic Rod, Tiara of the Deep, Gahz'rilla, Zum'rah's Head). Skipped: The Prophecy of Mosh'aru, The Spider God.

### Still open
- **Necklace Recovery, Take 3** (Jarkal, Kargath): armory still shows Abomination Chain. For tanking, Abomination Chain (+10 Sta, +3 def) beats Jarkal's (+10 Sta, +12 SP), so the turn-in is only for XP.
- Shadowshard Fragments in log (Maraudon).
- Into the Scarlet Monastery still listed as "in log" (q_1048); confirm.

### Next
1. **Maraudon (46-55)**, one Desolace trip for all quests first (Section 3b).
2. **Legacy solo runs:** Deadmines (VanCleef) and Excavation Site: Wetlands (Relic Guardian) for Novice Spelunker; Blackfathom Deeps (Aku'mai) for Experienced Spelunker. Experienced Paladin (level 45) should now be credited.
3. Weakest slots: hands (27), feet (28), waist (30), ring 2 (caster), one trinket.
4. Blacksmithing deferred to 60.

### 3b. Maraudon pickups (re-checked 11-21; Warcraft Tavern Forever, which says it uses Classic data, plus Wowhead Forever tooltips)

Fly to Shadowprey Village (Desolace's Horde flight point), then make one loop through the zone:

**Shadowprey Village**
- Vark Battlescar (23.2 70.3): **Vyletongue Corruption** (gives the Coated Cerulean Vial)
- Selendra (Shadowprey area, about 26.9 77.7): **Corruption of Earth and Seed** (kill Princess Theradras)

**Southern road, south of Mannoroc Coven**
- Centaur Pariah (patrols, about 50.4 86.7): **The Pariah's Instructions**. Kill The Nameless Prophet for the Amulet of Spirits, use it on the five Khans (Kolk, Gelk, Magra, Maraudos, Veng), loot their gems and combine them. Not shareable.

**Kormek's Hut, near Thunderaxe Fortress**
- Willow (62.2 39.6): **Twisted Evils** (Theradric Crystal Carvings: 25 per Wowhead Forever, 15 per Warcraft Tavern; the Nameless Prophet always drops them)

**Maraudon entrance (caves, west Desolace)**
- Cavindra, in the caves outside the portal: **Legends of Maraudon** (Rod from Noxxion, Diamond from Lord Vyletongue, then kill Celebras the Cursed)
- Fill the Cerulean Vial at an **orange-crystal pool** outside the orange (right-hand) entrance before going in.
- Collect the 10 Shadowshard Fragments from the rumblers outside (already in log).

**Inside (no pickup needed)**
- The Scepter of Celebras: from Celebras the Redeemed after Legends; gives the inner-wing shortcut.
- Seed of Life: from Zaetar's Spirit after Theradras.

No other prerequisites: every Horde Maraudon quest can be picked up directly. Alliance versions (Talendria, Keeper Marandis, Archmage Tervosh) don't apply.

---

## 4. Zul'Farrak route (DONE 11-21; kept for reference) (re-checked 2026-11-20: Wowhead Forever tooltips, Gfinity, Conquest Capped, Frostyboost, Warcraft Tavern)

User was in Thunder Bluff after turning in the Platinum Discs.

**Mulgore**
- Mazu'kon, Skywatcher Plateau (32.4 20.6): **Zum'rah's Head** (Horde, level 42, kill Witch Doctor Zum'rah; about 10,100 XP, 65s). Zum'rah also drops the Blood Ritual Ring (25%).

**Orgrimmar**
- Uthel'nay (39.2 86.3): **Shadowshard Fragments** (Maraudon, for later)
- Deino (38.4 85.8): **Tabetha's Task**. Take it: sources disagree on whether the Tiara needs it.

**Kargath**
- Jarkal: turn in **Necklace Recovery, Take 3**

**Dustwallow Marsh**
- Brackenwall Village: Balai Lok'Wein sells Expert First Aid – Under Wraps, if you don't have it yet
- Tabetha, hut in the Quagmire (46 57): turn in Tabetha's Task, take **Tiara of the Deep** (kill Hydromancer Velratha). Reward: Gemshale Pauldrons (plate, +5 Str, +10 Sta, +8 Int) or Dank Shoulderpads, plus Spellshifter Rod.

**Gadgetzan**
- Tran'rek (51.6 26.8): **Scarab Shells** (5 Uncracked Scarab Shells from scarabs inside). Gfinity and Frostyboost say Krazek's Booty Bay breadcrumb, Tran'rek, is required; Conquest Capped and Warcraft Tavern (Classic-based) say not. Try Tran'rek directly; if he offers nothing, the breadcrumb is the reason.
- Trenton Lighthammer (51.4 28.6): **Troll Temper** (20 vials from elite trolls inside)
- Chief Engineer Bilgewhizzle (52.4 28.4): **Divino-matic Rod** (from Sergeant Bly)

**Skipped unless one lines up**
- The Prophecy of Mosh'aru (Yeh'kinya, Steamwheedle Port 67 22.4): needs Screecher Spirits (Feralas) first. Leads on to The God Hakkar (Sunken Temple).
- The Spider God (Master Gadrin, Sen'jin): needs the Venom Bottles chain (Hinterlands, Tarren Mill).
- Gahz'rilla (Wizzle Brassbolts, Shimmering Flats 78 77): someone in the group needs the Mallet of Zul'Farrak. The Brassbolts Brothers lead-in is Alliance only.

ZF loot to watch:
- Blood Ritual Ring (+13 Sta, +3 def, requires 43, from Zum'rah)
- Big Bad Pauldrons (plate, +12 Str, +12 Sta, requires 45, Chief Ukorz, about 25%)
- Jang'thraze the Protector (1H sword with an absorb proc, rare; where it drops is unclear)

---

## 5. Gear priorities (re-checked 2026-11-20)

Several crafted "Warder's" and older pieces are **mail**, not plate. Paladins can wear mail, but it has less armor.

1. **Chest: done** (Zealot Plate, ilvl 48). Older options:
   - Best: Krol'dok Warplate Chest (plate, +13 def, Nar'gurk 26%).
   - Or Carapace of Tuten'kash (plate, RFD).
2. **Hands (ilvl 27):** Krol'dok Warplate Gauntlets (plate, +1% parry, BoE, AH). Warder's Gauntlet is crafted: after 60.
3. **Feet (28):**
   - Dusty Mail Boots (mail, +14 Sta, SM Cathedral).
   - Warder's Boots (BS 200) is crafted: after 60.
   - Worgbinder's Treads is a Str/Int item: **not** a tank target.
4. **Waist (30):** Girdle of Extracted Answers (plate, Alcaz Prison, 48+). Warder's Belt is crafted: after 60.
5. **Head: done** (Warbringer's Crown, ilvl 45). Older notes:
   - The Krol'dok Warplate Helmet has **no tank stats** (Str/Spirit): skip it.
   - Protector's Chain Helm is a level 25 item: dropped.
   - Serpentbane Crown (mail, +16 Sta, Drowned City) is the only non-crafted target listed; look for drops in ZF/Maraudon.
6. **Neck:** Jarkal's Enhancing Necklace (pending turn-in).
7. **Ring 2 is a caster ring:**
   - Blood Ritual Ring (ZF).
   - Or Knucklebone Ring (Drowned City).
   - Band of Bossman is a healer ring: dropped.
8. **Trinkets empty:**
   - Rune of Duty (+8 Sta, +10 resistances, Friendly with Warsong Outriders).
   - Defiler's Talisman (+8 Sta plus an absorb, Friendly with The Defilers).
   - Guardian Talisman (Sunken Temple quest).
   - Fingerbreaker Stamp (+6 def, Alcaz).

Stat weights: the earlier "ForeverDB leveling-mode" numbers could not be found again and are **unverified**. Icy Veins (written for level 60) ranks Stamina > Defense > spell power.

---

## 6. Open questions for the user

1. Current gold.
2. Take 3: turning it in, or skipping since Abomination Chain is the better tank neck?
3. Into the Scarlet Monastery: turned in? Which reward?
4. Expert First Aid book bought?
5. Second spec plan (shockadin?).
6. Did solo dungeon kills count in the Legacy window?
7. What dropped in ZF? (Zealot Plate and Warbringer's Crown are now equipped; were they ZF drops?)

---

## 7. The tracker (local, since 2026-11-20)

- **Folder:** `D:\ScratchPad\WoW-Forever-Tracker` (git repo). Run `start.bat` or `python server.py`, open http://127.0.0.1:8765/.
- `data.js` = the plan, `state.json` = progress (every click on the page saves here), `index.html` = the page, `server.py` = local save server. Details in `README.md`.
- `state.json` was seeded from the artifact database as of this snapshot (character v2, progress v7).
- Key conventions: `d_<dungeon id>` = "done"; `q_<quest id>` = "have" or "done"; `g_<slug>` = "1" (item name lowercased, every non-alphanumeric run turned into `-`); `m_<milestone id>` = "1"; `""` clears.
- Superseded, no longer updated: claude.ai artifact https://claude.ai/artifact/Q13oByuzMcLNFbMFEW93hk (and its db), the older tracker `EWChMpRK4RLcVgdhfFrvcu`, and the `Dandotmd/BiS-hunter` branch.

When the necklace is turned in: set `q_2283` to "done" and `g_jarkal-s-enhancing-necklace` to "1". ZF quest ids in `data.js`: 2865, 3042, 2768, 2846, 3527, 2936, 2770, and `zumrah`.

---

## 8. Sources used this session
- wowarmory.gg Forever character page (11-19, via the built-in browser).
- Warcraft Tavern Forever: Legacy guide, Uldaman quests, Zul'Farrak quests.
- Frostyboost: WoW Forever Zul'Farrak quests.
- Method.gg, Odealo, Icy Veins: Legacy challenges (Novice Spelunker list).
- Warcraft Wiki / Wowpedia / wowclassicdb: Classic quest text for Badlands Reagent Run, Necklace Recovery chain, Shadowshard Fragments, Scarab Shells.
- seemeta.com, metaforge.app: Warder's Gauntlet (BS 175).
- 2026-11-20 re-check: Wowhead Forever quest/item tooltips (nether.wowhead.com/forever/tooltip), Warcraft Tavern Forever (dungeons, Legacy, Maraudon, Sunken Temple, Alcaz, blacksmithing plans), Conquest Capped, Gfinity, Frostyboost, Method.gg, Warcraft Wiki (Forever blacksmithing plans, Novice Spelunker), Icy Veins (search snippets only: 403).
