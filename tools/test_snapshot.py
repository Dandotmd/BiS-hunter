"""Tests for tools/snapshot.py and, when the `lupa` Lua runtime is importable,
for the addon itself run against a mock of the game API.

    python -m unittest tools/test_snapshot.py -v
"""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import snapshot  # noqa: E402

ADDON = os.path.join(os.path.dirname(HERE), "addon", "ForeverTracker", "ForeverTracker.lua")

try:
    from lupa import lua55 as _lua
except ImportError:
    try:
        import lupa as _lua
    except ImportError:
        _lua = None

SAMPLE = b'''
ForeverTrackerDB = {
["version"] = 1,
["chars"] = {
["Danadin-Forever"] = {
["name"] = "Danadin",
["money"] = 1234567,
["guild"] = "Send \\"Ibuprofen\\"",
["zone"] = "Zul\\'Farrak \\195\\169",
["lastSeen"] = 1000,
["questsDone"] = {
709, -- [1]
1048, -- [2]
},
["equipped"] = {
["Head"] = {
["id"] = 111,
["name"] = "Warbringer's Crown",
["ilvl"] = 45.5,
},
},
["questLog"] = {
},
["flag"] = true,
["sparse"] = {
[1] = "a",
[3] = "c",
},
["neg"] = -1,
},
},
}
OtherVar = nil
Third = "x"
'''

# A small stand-in for the WoW client: enough API for the addon to run.
MOCK = r'''
SECRET = {}
function issecretvalue(v) return v == SECRET end
local script
local theFrame = {}
function theFrame:RegisterEvent(event)
    if event == "PLAYER_TALENT_UPDATE" then error("unknown event") end
end
function theFrame:SetScript(_, fn) script = fn end
function CreateFrame() return theFrame end
function Fire(event, ...) script(theFrame, event, ...) end
C_Timer = { After = function(_, fn) fn() end }
SlashCmdList = {}
clock = 1795000000
function time() return clock end
function date() return "2026-11-26 12:00:00" end

function UnitName() return "Danadin" end
function GetRealmName() return "Forever" end
function UnitGUID() return "Player-91-0001" end
function UnitClass() return "Paladin", "PALADIN" end
function UnitRace() return "Undead", "Scourge" end
function UnitFactionGroup() return "Horde" end
function UnitLevel() return 49 end
function UnitXP() return 100 end
function UnitXPMax() return 9000 end
function GetXPExhaustion() return nil end
function GetMoney() return 1234567 end
function GetRealZoneText() return "Tanaris" end
function GetSubZoneText() return SECRET end
function GetGuildInfo() return "Send Ibuprofen" end
function GetInstanceInfo() return "Sunken Temple", "party", 1, "Normal", 5, 0, false, 109 end

local worn = { [1] = "|cff1eff00|Hitem:111::::::::49:::::|h[Warbringer's Crown]|h|r",
               [16] = "|cff0070dd|Hitem:222:::|h[Thrash Blade]|h|r" }
function GetInventoryItemLink(_, slot) return worn[slot] end
function GetDetailedItemLevelInfo() error("boom") end

local function item(id, name, count)
    return { itemID = id, stackCount = count, hyperlink = "|cffffffff|Hitem:" .. id .. ":::|h[" .. name .. "]|h|r" }
end
NUM_BAG_SLOTS = 4
BANK_CONTAINER = -1
NUM_BANKBAGSLOTS = 6
bankReadable = false
local contents = {
    [0] = { [1] = item(3371, "Empty Vial", 20), [2] = item(3371, "Empty Vial", 5), [5] = item(6948, "Hearthstone", 1),
            [6] = { itemID = SECRET, stackCount = 1, hyperlink = SECRET } },
    [1] = { [1] = item(2589, "Linen Cloth", 3) },
    [-1] = { [1] = item(12359, "Thorium Bar", 12), [2] = item(2589, "Linen Cloth", 40) },
    [5] = { [3] = item(12359, "Thorium Bar", 8) },
}
local sizes = { [0] = 16, [1] = 10, [-1] = 24, [5] = 12 }
C_Container = {
    GetContainerNumSlots = function(bag)
        if (bag == -1 or bag > 4) and not bankReadable then return 0 end
        return sizes[bag] or 0
    end,
    GetContainerItemInfo = function(bag, slot)
        if (bag == -1 or bag > 4) and not bankReadable then return nil end
        return contents[bag] and contents[bag][slot]
    end,
}

function GetProfessions() return 3, nil, 7, 9 end
local profs = { [3] = { "Mining", "icon", 228, 300, 0, 0, 186 }, [7] = { "Blacksmithing", "icon", 173, 225, 0, 0, 164 },
                [9] = { "First Aid", "icon", 150, 150, 0, 0, 129 } }
function GetProfessionInfo(i) return table.unpack(profs[i]) end

function GetNumTalentTabs() return 2 end
function GetTalentTabInfo(tab) return tab, tab == 1 and "Holy" or "Protection", "desc", "Interface\\Icons\\x", 0 end
function GetNumTalents() return 2 end
function GetTalentInfo(tab, i)
    if tab == 2 and i == 1 then return "Redoubt", "icon", 1, 1, 5, 5 end
    return "Unspent", "icon", 1, 2, 0, 5
end

local log = {
    { title = "Tanaris", isHeader = true },
    { title = "The Essence of Eranikus", questID = 3373, level = 55 },
    { title = "Hidden tracker", questID = 9999, isHidden = true },
    { title = "Feralas", isHeader = true },
    { title = "Done one", questID = 1445, level = 50 },
}
C_QuestLog = {
    GetNumQuestLogEntries = function() return #log end,
    GetInfo = function(i) return log[i] end,
    IsComplete = function(id) return id == 1445 end,
    GetQuestObjectives = function(id)
        if id == 3373 then return { { text = "Essence placed: 0/1", finished = false, numFulfilled = 0, numRequired = 1 } } end
        return {}
    end,
    GetAllCompletedQuestIDs = function() return doneIDs end,
}
doneIDs = { 1048, 709, 3341 }

function UnitStat(_, i) return 100 + i, 110 + i end
function UnitHealthMax() return 2309 end
function UnitPowerMax() return SECRET end
function UnitArmor() return 4000, 4629 end
function UnitAttackPower() return 400, 30, -6 end
function GetDodgeChance() return 5.8349 end
C_TooltipInfo = { GetInventoryItem = function(_, slot)
    if slot == 1 then return { lines = {
        { leftText = "Warbringer's Crown" }, { leftText = "|cffffffff+14 Stamina|r" }, { leftText = "Head", rightText = "Plate" },
    } } end
end }
FACTION_STANDING_LABEL5 = "Friendly"
C_Reputation = {
    GetNumFactions = function() return 2 end,
    GetFactionDataByIndex = function(i)
        if i == 1 then return { name = "Horde", isHeader = true, reaction = 4 } end
        return { name = "Orgrimmar", reaction = 5, currentStanding = 4500, currentReactionThreshold = 3000,
            nextReactionThreshold = 9000, factionID = 76 }
    end,
}
function GetBindLocation() return "Orgrimmar" end
local taxi = { { "Orgrimmar, Durotar", "CURRENT" }, { "Gadgetzan, Tanaris", "REACHABLE" }, { "Unknown Place", "NONE" } }
function NumTaxiNodes() return #taxi end
function TaxiNodeName(i) return taxi[i][1] end
function TaxiNodeGetType(i) return taxi[i][2] end
local recipes = { { name = "Steel Plate Helm", learned = true, numAvailable = 2 }, { name = "Unlearned Thing", learned = false },
    { name = "Golden Scale Bracers", learned = true, numAvailable = 0 } }
C_TradeSkillUI = {
    GetAllRecipeIDs = function() return { 1, 2, 3 } end,
    GetBaseProfessionInfo = function() return { professionName = "Blacksmithing" } end,
    GetRecipeInfo = function(id) return recipes[id] end,
}
'''

SERIALIZE = r'''
local function q(s) return '"' .. s:gsub('\\', '\\\\'):gsub('"', '\\"') .. '"' end
local function ser(v, out)
    if type(v) == "table" then
        out[#out + 1] = "{\n"
        local n = #v
        for i = 1, n do ser(v[i], out) out[#out + 1] = ", -- [" .. i .. "]\n" end
        for k, val in pairs(v) do
            if not (math.type(k) == "integer" and k >= 1 and k <= n) then
                out[#out + 1] = "[" .. (type(k) == "string" and q(k) or tostring(k)) .. "] = "
                ser(val, out)
                out[#out + 1] = ",\n"
            end
        end
        out[#out + 1] = "}"
    elseif type(v) == "string" then out[#out + 1] = q(v)
    else out[#out + 1] = tostring(v) end
end
function SavedFile()
    local out = { "\nForeverTrackerDB = " }
    ser(ForeverTrackerDB, out)
    out[#out + 1] = "\n"
    return table.concat(out)
end
'''


class ParserTests(unittest.TestCase):
    def setUp(self):
        self.saved = snapshot.parse_saved_variables(SAMPLE)
        self.char = self.saved["ForeverTrackerDB"]["chars"]["Danadin-Forever"]

    def test_top_level_variables(self):
        self.assertEqual(set(self.saved), {"ForeverTrackerDB", "OtherVar", "Third"})
        self.assertIsNone(self.saved["OtherVar"])
        self.assertEqual(self.saved["Third"], "x")

    def test_scalars_and_escapes(self):
        c = self.char
        self.assertEqual(c["money"], 1234567)
        self.assertEqual(c["guild"], 'Send "Ibuprofen"')
        self.assertEqual(c["zone"], "Zul'Farrak é")
        self.assertIs(c["flag"], True)
        self.assertEqual(c["neg"], -1)
        self.assertEqual(c["equipped"]["Head"]["ilvl"], 45.5)

    def test_arrays_and_sparse_tables(self):
        self.assertEqual(self.char["questsDone"], [709, 1048])
        self.assertEqual(self.char["sparse"], {"1": "a", "3": "c"})
        self.assertEqual(self.char["questLog"], {})

    def test_bad_input_names_the_line(self):
        with self.assertRaises(snapshot.LuaError) as cm:
            snapshot.parse_saved_variables(b"X = {\n1,\n@\n}")
        self.assertIn("line 3", str(cm.exception))

    def test_build_normalises_and_formats(self):
        doc = snapshot.build(self.saved["ForeverTrackerDB"], source="s", now=1000 + 7200)
        c = doc["characters"]["Danadin-Forever"]
        self.assertEqual(c["moneyText"], "123g 45s 67c")
        self.assertEqual(c["lastSeenAge"], "2.0 h ago")
        self.assertEqual(c["questLog"], [])
        self.assertEqual(c["kills"], [])
        self.assertIn("level None", snapshot.summary(doc))

    def test_summary_with_no_characters(self):
        self.assertIn("No characters", snapshot.summary(snapshot.build({"chars": {}})))


@unittest.skipIf(_lua is None, "lupa (Lua runtime) not installed")
class AddonTests(unittest.TestCase):
    """Runs the real addon file against the mock client, then reads what it saved."""

    def setUp(self):
        self.boot()

    def boot(self, before_addon=""):
        """Start a fresh client; before_addon is Lua run after the mock and before the addon loads."""
        self.lua = _lua.LuaRuntime(unpack_returned_tuples=True)
        self.lua.execute(MOCK)
        self.lua.execute(SERIALIZE)
        if before_addon:
            self.lua.execute(before_addon)
        with open(ADDON, encoding="utf-8") as f:
            self.lua.execute(f.read())
        self.fire = self.lua.globals().Fire
        self.fire("PLAYER_LOGIN")
        self.fire("PLAYER_ENTERING_WORLD")

    def char(self, key="Danadin-Forever"):
        saved = snapshot.parse_saved_variables(self.lua.globals().SavedFile())
        doc = snapshot.build(saved["ForeverTrackerDB"], now=1795000000)
        self.assertEqual(doc["lastChar"], key)
        self.assertEqual(list(doc["characters"]), [key])
        return doc["characters"][key]

    def test_logout_does_not_wipe_gold_gear_or_bags(self):
        # Seen in game 2026-11-27: at PLAYER_LOGOUT the client answers 0 gold, 0 XP, no gear, 0 bag slots.
        before = self.char()
        self.lua.execute('''
            clock = clock + 300
            function GetMoney() return 0 end
            function UnitXP() return 0 end
            function UnitXPMax() return 0 end
            function GetInventoryItemLink() return nil end
            function GetRealZoneText() return "" end
            C_Container.GetContainerNumSlots = function() return 0 end
            C_QuestLog.GetQuestObjectives = function() return {} end
        ''')
        self.fire("PLAYER_LOGOUT")
        after = self.char()
        self.assertEqual(after["lastSeen"], before["lastSeen"] + 300)
        for field in ("money", "xp", "xpMax", "zone", "equipped", "bags", "questLog"):
            self.assertEqual(after[field], before[field], field)
        self.assertEqual(after["money"], 1234567)

    def test_empty_bag_or_gear_answer_keeps_the_last_good_scan(self):
        self.lua.execute('''
            function GetInventoryItemLink() return nil end
            function UnitXPMax() return 0 end
            C_Container.GetContainerNumSlots = function() return 0 end
        ''')
        self.fire("BAG_UPDATE_DELAYED")
        c = self.char()
        self.assertEqual(len(c["equipped"]), 2)
        self.assertEqual(len(c["bags"]["items"]), 3)
        self.assertEqual(c["xpMax"], 9000)

    def test_empty_realm_keys_by_name_and_adopts_the_old_record(self):
        self.boot('''
            function GetRealmName() return "" end
            ForeverTrackerDB = { chars = { ["Danadin-"] = { kills = { { boss = "Old Kill", time = 1 } }, money = 0 } } }
        ''')
        c = self.char("Danadin")
        self.assertEqual(c["kills"][0]["boss"], "Old Kill")
        self.assertEqual(c["money"], 1234567)

    def test_trait_tree_talents_when_the_old_talent_api_is_missing(self):
        self.boot('''
            GetNumTalentTabs, GetTalentTabInfo, GetNumTalents, GetTalentInfo = nil, nil, nil, nil
            C_ClassTalents = { GetActiveConfigID = function() return 7 end }
            local nodes = {
                [11] = { groupIDs = { 2 }, ranksPurchased = 5, maxRanks = 5, entryIDs = { 111 }, posX = 300, posY = 100 },
                [12] = { groupIDs = { 2 }, ranksPurchased = 0, activeRank = 0, maxRanks = 3, entryIDs = { 112 }, posX = 100, posY = 200 },
                [15] = { groupIDs = { 2 }, ranksPurchased = 1, maxRanks = 1, entryIDs = { 115 }, posX = 100, posY = 100, isVisible = false },
                [13] = { groupIDs = { 1 }, ranksPurchased = 0, activeRank = 2, maxRanks = 5, activeEntry = { entryID = 113 } },
                [14] = { groupIDs = { 99 }, ranksPurchased = 1, maxRanks = 1, entryIDs = { 114 } },
            }
            C_Traits = {
                GetConfigInfo = function(id) return { treeIDs = { 40 } } end,
                GetGroupDisplayInfoByTreeID = function() return {
                    { groupID = 2, displayName = "Protection", orderIndex = 2 },
                    { groupID = 1, displayName = "Holy", orderIndex = 1 },
                } end,
                GetTreeNodes = function() return { 12, 11, 13, 14, 15 } end,
                GetTreeCurrencyInfo = function() return { { quantity = 3, spent = 7, maxQuantity = 10 } } end,
                GetNodeInfo = function(_, id) return nodes[id] end,
                GetEntryInfo = function(_, id) return { definitionID = id + 1000 } end,
                GetDefinitionInfo = function(id) return { spellID = id + 10000 } end,
            }
            C_Spell = {
                GetSpellName = function(id) return id == 11111 and "Redoubt" or "Spell " .. id end,
                GetSpellDescription = function(id) return id == 11111 and "Raises your block chance." or "" end,
            }
        ''')
        self.maxDiff = None
        c = self.char()
        self.assertEqual(c["talents"], [
            {"tab": "Holy", "points": 2,
             "talents": [{"name": "Spell 11113", "spellID": 11113, "node": 13, "rank": 2, "max": 5, "row": 1, "col": 1}]},
            {"tab": "Protection", "points": 5, "talents": [
                {"name": "Redoubt", "spellID": 11111, "node": 11, "rank": 5, "max": 5, "row": 1, "col": 2,
                 "desc": "Raises your block chance."},
                {"name": "Spell 11112", "spellID": 11112, "node": 12, "rank": 0, "max": 3, "row": 2, "col": 1},
            ]},
        ])
        self.assertEqual(c["talentPoints"], {"unspent": 3, "spent": 7, "max": 10})

    def test_basics(self):
        c = self.char()
        self.assertEqual((c["name"], c["class"], c["race"], c["faction"], c["level"]), ("Danadin", "PALADIN", "Scourge", "Horde", 49))
        self.assertEqual(c["moneyText"], "123g 45s 67c")
        self.assertEqual(c["zone"], "Tanaris")
        self.assertNotIn("subzone", c)  # secret value dropped, not stored
        self.assertEqual(c["rested"], 0)

    def test_gear(self):
        gear = self.char()["equipped"]
        # ilvl call threw: left out. text is the tooltip without the name line and colour codes.
        self.assertEqual(gear["Head"], {"id": 111, "name": "Warbringer's Crown", "text": ["+14 Stamina", "Head  Plate"]})
        self.assertEqual(gear["MainHand"]["name"], "Thrash Blade")
        self.assertEqual(len(gear), 2)

    def test_bags_are_totalled_per_item(self):
        bags = self.char()["bags"]
        self.assertEqual(bags["items"], [
            {"id": 3371, "name": "Empty Vial", "count": 25},
            {"id": 6948, "name": "Hearthstone", "count": 1},
            {"id": 2589, "name": "Linen Cloth", "count": 3},
        ])
        self.assertEqual((bags["slots"], bags["used"]), (26, 4))

    def test_bank_only_while_open_and_kept_after(self):
        self.assertNotIn("bank", self.char())
        self.lua.globals().bankReadable = True
        self.fire("BAG_UPDATE_DELAYED")
        self.assertNotIn("bank", self.char())  # readable but the bank window is not open
        self.fire("BANKFRAME_OPENED")
        bank = self.char()["bank"]
        self.assertEqual(bank["items"], [
            {"id": 2589, "name": "Linen Cloth", "count": 40},
            {"id": 12359, "name": "Thorium Bar", "count": 20},
        ])
        self.lua.globals().bankReadable = False
        self.fire("BANKFRAME_CLOSED")
        self.fire("BAG_UPDATE_DELAYED")
        self.fire("PLAYER_LOGOUT")
        self.assertEqual(len(self.char()["bank"]["items"]), 2)

    def test_professions_and_talents(self):
        c = self.char()
        self.assertEqual([(p["name"], p["rank"], p["max"], p["line"]) for p in c["professions"]],
                         [("Mining", 228, 300, 186), ("Blacksmithing", 173, 225, 164), ("First Aid", 150, 150, 129)])
        self.assertEqual(c["talents"][0], {"tab": "Holy", "points": 0, "talents": {}})
        self.assertEqual(c["talents"][1], {"tab": "Protection", "points": 5,
                                           "talents": [{"name": "Redoubt", "rank": 5, "max": 5}]})

    def test_quests(self):
        c = self.char()
        self.assertEqual([(q["id"], q["zone"], q["complete"]) for q in c["questLog"]],
                         [(3373, "Tanaris", False), (1445, "Feralas", True)])
        self.assertEqual(c["questLog"][0]["objectives"],
                         [{"text": "Essence placed: 0/1", "done": False, "have": 0, "need": 1}])
        self.assertEqual(c["questsDone"], [709, 1048, 3341])

    def test_done_quests_refresh_on_turn_in_and_survive_an_empty_answer(self):
        self.lua.execute("doneIDs = { 709, 1048, 3341, 3373 }")
        self.fire("QUEST_LOG_UPDATE")
        self.assertEqual(len(self.char()["questsDone"]), 3)  # not re-read on every log update
        self.fire("QUEST_TURNED_IN", 3373)
        self.assertEqual(self.char()["questsDone"], [709, 1048, 3341, 3373])
        self.lua.execute("doneIDs = {}")
        self.fire("PLAYER_LOGOUT")
        self.assertEqual(len(self.char()["questsDone"]), 4)

    def test_boss_kills(self):
        self.fire("ENCOUNTER_END", 492, "Wiped Boss", 1, 5, 0)
        self.fire("ENCOUNTER_END", 493, "Shade of Eranikus", 1, 5, 1)
        self.fire("BOSS_KILL", 493, "Shade of Eranikus")
        self.lua.execute("clock = clock + 600")
        self.fire("BOSS_KILL", 494, "Avatar of Hakkar")
        kills = self.char()["kills"]
        self.assertEqual([k["boss"] for k in kills], ["Shade of Eranikus", "Avatar of Hakkar"])
        self.assertEqual((kills[0]["instance"], kills[0]["instanceID"], kills[0]["encounterID"]), ("Sunken Temple", 109, 493))

    def test_sheet_stats_reputation_and_hearth(self):
        c = self.char()
        self.assertEqual(c["stats"], {"Strength": 111, "Agility": 112, "Stamina": 113, "Intellect": 114, "Spirit": 115,
                                      "Health": 2309, "Armor": 4629, "AttackPower": 424, "DodgePct": 5.83})
        self.assertEqual(c["reputation"], [{"name": "Orgrimmar", "id": 76, "standing": "Friendly", "have": 1500, "need": 6000}])
        self.assertEqual(c["hearth"], "Orgrimmar")

    def test_flight_points_and_recipes_are_read_when_their_window_opens(self):
        c = self.char()
        self.assertNotIn("flights", c)
        self.assertNotIn("recipes", c)
        self.fire("TAXIMAP_OPENED")
        self.fire("TRADE_SKILL_SHOW")
        c = self.char()
        self.assertEqual(sorted(c["flights"]), ["Gadgetzan, Tanaris", "Orgrimmar, Durotar"])
        self.assertEqual(c["recipes"]["Blacksmithing"]["list"], [
            {"name": "Golden Scale Bracers", "id": 3, "canMake": 0},
            {"name": "Steel Plate Helm", "id": 1, "canMake": 2},
        ])

    def test_briefing_covers_every_section_in_plain_text(self):
        self.lua.globals().bankReadable = True
        self.fire("BANKFRAME_OPENED")
        self.fire("TAXIMAP_OPENED")
        self.fire("TRADE_SKILL_SHOW")
        self.fire("BOSS_KILL", 494, "Avatar of Hakkar")
        saved = snapshot.parse_saved_variables(self.lua.globals().SavedFile())
        doc = snapshot.build(saved["ForeverTrackerDB"], now=1795000000)
        tracker = {"character": {"prefs": ["Dungeon-first"]},
                   "plan": [{"id": "st", "lv": [49, 50], "d": "st", "t": "Sunken Temple"},
                            {"id": "wpl", "lv": [50, 52], "t": "Quest: Western Plaguelands", "zr": "48-60"}],
                   "milestones": [{"at": 40, "id": "mount", "name": "Warhorse"}, {"at": 50, "id": "cq", "name": "Class quest"}]}
        state = {"progress": {"d_st": "done", "m_mount": "1"}}
        text = snapshot.render_context(doc, intro="## The game\n\nIntro text.", tracker=tracker, state=state)
        for expected in (
            "## The game", "Intro text.",
            "- [x] Level 49-50: Sunken Temple.", "- [ ] Level 50-52: Quest: Western Plaguelands (zone range 48-60).",
            "- Level 50: Class quest.",
            "| Danadin | level 49 Undead Paladin | 123g 45s 67c | Tanaris |",
            "hearth set to Orgrimmar", "XP 100/9000 (0 rested)",
            "Health 2309, Armor 4629, Strength 111, Agility 112, Stamina 113, Intellect 114, Spirit 115, AttackPower 424, DodgePct 5.83.",
            "- Head: Warbringer's Crown: +14 Stamina; Head  Plate\n- MainHand: Thrash Blade",
            "- Mining 228/300",
            "- **Protection**: 5 points", "  - Redoubt 5/5",
            "- Head: Warbringer's Crown: +14 Stamina; Head  Plate",
            "4 of 26 slots used. Empty Vial x25, Hearthstone, Linen Cloth x3.",
            "Linen Cloth x40, Thorium Bar x20.",
            "- Blacksmithing (seen 2026-11-26 12:00:00): Golden Scale Bracers, Steel Plate Helm",
            "- Orgrimmar: Friendly 1500/6000",
            "Gadgetzan, Tanaris, Orgrimmar, Durotar.",
            "- The Essence of Eranikus (quest 3373, Tanaris, level 55): Essence placed: 0/1",
            "- Done one (quest 1445, Feralas, level 50): ready to turn in",
            "Avatar of Hakkar in Sunken Temple at level 49",
            "### Completed quest IDs (3)", "709, 1048, 3341",
        ):
            self.assertIn(expected, text)
        self.assertNotIn("Warhorse", text)  # ticked milestone left out

    def test_briefing_says_not_recorded_instead_of_zero(self):
        doc = snapshot.build({"chars": {"Alt": {"name": "Alt", "level": 8, "money": 0, "bags": {"items": {}, "slots": 0}}}}, now=10)
        text = snapshot.render_context(doc)
        self.assertIn("| Alt | level 8 | not recorded |", text)
        self.assertIn("gold not recorded", text)
        for section in ("Skills", "Talents", "Gear worn", "Bags"):
            self.assertIn(f"### {section}\n\nNot recorded.", text)
        self.assertIn("### Bank\n\nNot recorded (the bank has not been opened", text)
        self.assertIn("### Quest log (0)\n\nEmpty or not recorded.", text)

    def test_slash_command_runs(self):
        printed = []
        self.lua.globals().print = lambda *a: printed.append(a[0])
        self.lua.execute('SlashCmdList["FOREVERTRACKER"]("")')
        self.assertIn("Danadin level 49", printed[0])
        self.assertIn("2 quests in log", printed[0])


if __name__ == "__main__":
    unittest.main()
