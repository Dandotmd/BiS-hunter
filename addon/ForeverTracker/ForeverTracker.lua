-- ForeverTracker: records a snapshot of the logged-in character into
-- ForeverTrackerDB. No window, no settings. The game writes the file on
-- /reload, logout or exit; tools/snapshot.py in the tracker repo reads it.
--
-- Every game call goes through call(): the function may be missing on this
-- client, may throw, or may return a "secret" value that must not be stored.

local DB_VERSION = 1
local frame = CreateFrame("Frame")
local char            -- this character's record inside ForeverTrackerDB.chars
local bankOpen = false
local pending = false
local questsDoneStale = true

local SLOTS = {
    "Head", "Neck", "Shoulder", "Shirt", "Chest", "Waist", "Legs", "Feet", "Wrist", "Hands",
    "Finger1", "Finger2", "Trinket1", "Trinket2", "Back", "MainHand", "OffHand", "Ranged", "Tabard",
}

local function clean(v)
    if type(issecretvalue) == "function" then
        local ok, secret = pcall(issecretvalue, v)
        if ok and secret then return nil end
    end
    local t = type(v)
    if t == "string" or t == "number" or t == "boolean" or t == "table" then return v end
    return nil
end

local function pack(ok, ...)
    if not ok then return nil end
    local n = select("#", ...)
    local r = { n = n }
    for i = 1, n do r[i] = clean((select(i, ...))) end
    return r
end

-- call(fn, ...) -> { n = count, [1] = first result, ... } or nil if fn is missing or threw.
local function call(fn, ...)
    if type(fn) ~= "function" then return nil end
    return pack(pcall(fn, ...))
end

local function nth(i, fn, ...)
    local r = call(fn, ...)
    return r and r[i] or nil
end

local function now()
    return nth(1, time) or 0
end

local function itemFromLink(link)
    if type(link) ~= "string" then return nil end
    return tonumber(link:match("item:(%d+)")), link:match("%[(.-)%]")
end

local function sortedList(map)
    local list = {}
    for _, v in pairs(map) do list[#list + 1] = v end
    table.sort(list, function(a, b)
        local an, bn = tostring(a.name or a.id or ""), tostring(b.name or b.id or "")
        if an ~= bn then return an < bn end
        return (tonumber(a.id) or 0) < (tonumber(b.id) or 0)
    end)
    return list
end

---------------------------------------------------------------- basics

local function Basics()
    char.name = nth(1, UnitName, "player") or char.name
    char.realm = nth(1, GetRealmName) or char.realm
    char.guid = nth(1, UnitGUID, "player") or char.guid
    char.class = nth(2, UnitClass, "player") or char.class
    char.race = nth(2, UnitRace, "player") or char.race
    char.faction = nth(1, UnitFactionGroup, "player") or char.faction
    char.level = nth(1, UnitLevel, "player") or char.level
    local xpMax = nth(1, UnitXPMax, "player")
    if type(xpMax) == "number" and xpMax > 0 then
        char.xp = nth(1, UnitXP, "player")
        char.xpMax = xpMax
        char.rested = nth(1, GetXPExhaustion) or 0
    end
    char.money = nth(1, GetMoney) or char.money
    local zone = nth(1, GetRealZoneText)
    if type(zone) == "string" and zone ~= "" then
        char.zone = zone
        char.subzone = nth(1, GetSubZoneText)
    end
    char.guild = nth(1, GetGuildInfo, "player")
    char.lastSeen = now()
    char.lastSeenText = nth(1, date, "%Y-%m-%d %H:%M:%S")
end

---------------------------------------------------------------- gear

local function ItemLevel(link)
    local lvl
    if type(C_Item) == "table" then lvl = nth(1, C_Item.GetDetailedItemLevelInfo, link) end
    if not lvl then lvl = nth(1, GetDetailedItemLevelInfo, link) end
    return lvl
end

local function Plain(text)
    return (text:gsub("|c%x%x%x%x%x%x%x%x", ""):gsub("|r", ""):gsub("|T.-|t", ""):gsub("%s+$", ""))
end

local scanTip
-- The tooltip text of a worn item, without its name line: stats, effects, set
-- bonuses. WoW Forever has its own items, so the text is the only description.
local function ItemText(slot)
    local out = {}
    if type(C_TooltipInfo) == "table" then
        local data = nth(1, C_TooltipInfo.GetInventoryItem, "player", slot)
        for _, line in ipairs(type(data) == "table" and type(data.lines) == "table" and data.lines or {}) do
            if type(line) == "table" then
                local left, right = clean(line.leftText), clean(line.rightText)
                if type(left) == "string" and left ~= "" then
                    if type(right) == "string" and right ~= "" then left = left .. "  " .. right end
                    out[#out + 1] = Plain(left)
                end
            end
        end
    end
    if #out == 0 then
        if scanTip == nil then
            local ok, tip = pcall(CreateFrame, "GameTooltip", "ForeverTrackerTip", nil, "GameTooltipTemplate")
            scanTip = ok and type(tip) == "table" and type(tip.SetInventoryItem) == "function" and tip or false
        end
        if scanTip then
            call(scanTip.SetOwner, scanTip, WorldFrame or UIParent, "ANCHOR_NONE")
            call(scanTip.ClearLines, scanTip)
            call(scanTip.SetInventoryItem, scanTip, "player", slot)
            for i = 1, nth(1, scanTip.NumLines, scanTip) or 0 do
                local line = _G["ForeverTrackerTipTextLeft" .. i]
                local text = line and nth(1, line.GetText, line)
                if type(text) == "string" and text ~= "" then out[#out + 1] = Plain(text) end
            end
        end
    end
    if #out > 0 then table.remove(out, 1) end
    return #out > 0 and out or nil
end

local function Equipped()
    local gear = {}
    for slot, slotName in ipairs(SLOTS) do
        local link = nth(1, GetInventoryItemLink, "player", slot)
        if link then
            local id, name = itemFromLink(link)
            id = id or nth(1, GetInventoryItemID, "player", slot)
            gear[slotName] = { id = id, name = name, ilvl = ItemLevel(link), text = ItemText(slot) }
        end
    end
    if next(gear) or not char.equipped then char.equipped = gear end
end

---------------------------------------------------------------- bags and bank

local function NumSlots(bag)
    local n
    if type(C_Container) == "table" then n = nth(1, C_Container.GetContainerNumSlots, bag) end
    if not n then n = nth(1, GetContainerNumSlots, bag) end
    return tonumber(n) or 0
end

-- returns itemID, count, link for one slot, or nil when it is empty
local function SlotItem(bag, slot)
    if type(C_Container) == "table" and type(C_Container.GetContainerItemInfo) == "function" then
        local info = nth(1, C_Container.GetContainerItemInfo, bag, slot)
        if type(info) ~= "table" then return nil end
        local link = clean(info.hyperlink)
        local id = clean(info.itemID) or itemFromLink(link)
        return id, clean(info.stackCount) or 1, link
    end
    local r = call(GetContainerItemInfo, bag, slot)
    if not r or not r[1] then return nil end
    local link = r[7]
    return r[10] or itemFromLink(link), r[2] or 1, link
end

local function ScanBags(bags)
    local items, total, used, seen = {}, 0, 0, {}
    for _, bag in ipairs(bags) do
        if not seen[bag] then
            seen[bag] = true
            local n = NumSlots(bag)
            total = total + n
            for slot = 1, n do
                local id, count, link = SlotItem(bag, slot)
                if id then
                    used = used + 1
                    local entry = items[id]
                    if not entry then
                        local _, name = itemFromLink(link)
                        entry = { id = id, name = name, count = 0 }
                        items[id] = entry
                    end
                    entry.count = entry.count + (tonumber(count) or 1)
                end
            end
        end
    end
    return sortedList(items), total, used
end

local function CarriedBags()
    local last = tonumber(NUM_TOTAL_EQUIPPED_BAG_SLOTS) or tonumber(NUM_BAG_SLOTS) or 4
    local bags = {}
    for bag = 0, last do bags[#bags + 1] = bag end
    return bags, last
end

local function BankBags()
    local _, last = CarriedBags()
    local bags = {}
    if type(BANK_CONTAINER) == "number" then bags[#bags + 1] = BANK_CONTAINER end
    for bag = last + 1, last + (tonumber(NUM_BANKBAGSLOTS) or 7) do bags[#bags + 1] = bag end
    if type(Enum) == "table" and type(Enum.BagIndex) == "table" then
        for key, bag in pairs(Enum.BagIndex) do
            if type(key) == "string" and type(bag) == "number" and key:find("^CharacterBankTab") then
                bags[#bags + 1] = bag
            end
        end
    end
    return bags
end

local function Bags()
    local items, total, used = ScanBags((CarriedBags()))
    if total == 0 then return end -- bags not readable right now; keep the last good scan
    char.bags = { items = items, slots = total, used = used }
end

local function Bank()
    if not bankOpen then return end
    local items, total, used = ScanBags(BankBags())
    if total == 0 then return end -- bank not readable right now; keep the last good scan
    char.bank = { items = items, slots = total, used = used, seen = now(),
        seenText = nth(1, date, "%Y-%m-%d %H:%M:%S") }
end

---------------------------------------------------------------- skills and talents

local function Professions()
    local list = {}
    local slots = call(GetProfessions)
    if slots and type(GetProfessionInfo) == "function" then
        for i = 1, math.max(slots.n or 0, 6) do
            local index = slots[i]
            if index then
                local r = call(GetProfessionInfo, index)
                if r and type(r[1]) == "string" then
                    list[#list + 1] = { name = r[1], rank = r[3], max = r[4], line = r[7] }
                end
            end
        end
    end
    if #list == 0 and type(GetNumSkillLines) == "function" then
        for i = 1, nth(1, GetNumSkillLines) or 0 do
            local r = call(GetSkillLineInfo, i)
            if r and type(r[1]) == "string" and not r[2] then
                list[#list + 1] = { name = r[1], rank = r[4], max = r[7] }
            end
        end
    end
    if #list > 0 then char.professions = list end
end

local function LegacyTalents()
    local tabs = nth(1, GetNumTalentTabs)
    if type(tabs) ~= "number" or type(GetTalentInfo) ~= "function" then return nil end
    local out = {}
    for tab = 1, tabs do
        local info = call(GetTalentTabInfo, tab) or {}
        local tabName
        for i = 1, info.n or 0 do
            if type(info[i]) == "string" and not info[i]:find("[\\/]") then tabName = info[i] break end
        end
        local entry = { tab = tabName or tostring(tab), points = 0, talents = {} }
        for i = 1, nth(1, GetNumTalents, tab) or 0 do
            local r = call(GetTalentInfo, tab, i)
            local rank = r and tonumber(r[5])
            if r and type(r[1]) == "string" and rank and rank > 0 then
                entry.points = entry.points + rank
                entry.talents[#entry.talents + 1] = { name = r[1], rank = rank, max = r[6] }
            end
        end
        out[#out + 1] = entry
    end
    return #out > 0 and out or nil
end

local function SpellName(spellID)
    if not spellID then return nil end
    local name
    if type(C_Spell) == "table" then name = nth(1, C_Spell.GetSpellName, spellID) end
    return name or nth(1, GetSpellInfo, spellID)
end

-- Talent text arrives late from the server; keep what was read so a later
-- empty answer does not blank it.
local descCache = {}
local function SpellDesc(spellID)
    if not spellID then return nil end
    local text
    if type(C_Spell) == "table" then
        text = nth(1, C_Spell.GetSpellDescription, spellID)
        if type(text) ~= "string" or text == "" then call(C_Spell.RequestLoadSpellData, spellID) end
    end
    if type(text) ~= "string" or text == "" then text = nth(1, GetSpellDescription, spellID) end
    if type(text) == "string" and text ~= "" then descCache[spellID] = text end
    return descCache[spellID]
end

-- A talent's text at one rank, as the talent window shows it. The plain spell
-- description (SpellDesc) ignores the rank: seen in game 2026-11-27, Redoubt
-- 5/5 read "block by 0%" and Toughness 2/5 read its rank 1 value.
local function TraitText(entryID, rank, talentName)
    if type(C_TooltipInfo) ~= "table" or not entryID then return nil end
    local data = nth(1, C_TooltipInfo.GetTraitEntry, entryID, rank)
    if type(data) ~= "table" or type(data.lines) ~= "table" then return nil end
    local out = {}
    for _, line in ipairs(data.lines) do
        local text = type(line) == "table" and clean(line.leftText)
        if type(text) == "string" then
            text = text:gsub("|c%x%x%x%x%x%x%x%x", ""):gsub("|r", ""):gsub("^%s+", ""):gsub("%s+$", "")
            if text ~= "" and text ~= talentName then out[#out + 1] = text end
        end
    end
    return #out > 0 and table.concat(out, " ") or nil
end

-- Turns raw tree coordinates into 1, 2, 3... by their sorted order.
local function Ranked(values)
    local list, seen, rank = {}, {}, {}
    for _, v in ipairs(values) do
        if not seen[v] then seen[v] = true list[#list + 1] = v end
    end
    table.sort(list)
    for i, v in ipairs(list) do rank[v] = i end
    return rank
end

-- WoW Forever keeps talents in the trait tree: one tree per class, with the
-- three talent trees as its groups. Every visible talent is recorded, taken
-- or not, with its text, so an adviser can see what is still on offer.
local function TraitTrees(configID)
    local T = C_Traits
    if type(T) ~= "table" or not configID then return nil end
    local config = nth(1, T.GetConfigInfo, configID)
    local treeID = type(config) == "table" and type(config.treeIDs) == "table" and clean(config.treeIDs[1])
    if not treeID then return nil end
    local displays = nth(1, T.GetGroupDisplayInfoByTreeID, treeID)
    local nodeIDs = nth(1, T.GetTreeNodes, treeID)
    if type(displays) ~= "table" or type(nodeIDs) ~= "table" then return nil end
    local groups, byID = {}, {}
    for _, d in ipairs(displays) do
        local id = type(d) == "table" and clean(d.groupID)
        if id then
            local g = { tab = clean(d.displayName) or tostring(id), order = tonumber(clean(d.orderIndex)) or #groups,
                points = 0, talents = {} }
            groups[#groups + 1] = g
            byID[id] = g
        end
    end
    if #groups == 0 then return nil end
    for _, nodeID in ipairs(nodeIDs) do
        local info = nth(1, T.GetNodeInfo, configID, nodeID)
        if type(info) == "table" and clean(info.isVisible) ~= false then
            local g
            for _, groupID in ipairs(type(info.groupIDs) == "table" and info.groupIDs or {}) do
                g = byID[groupID]
                if g then break end
            end
            if g then
                local rank = tonumber(clean(info.ranksPurchased)) or 0
                if rank <= 0 then rank = tonumber(clean(info.activeRank)) or 0 end
                local entryID = type(info.activeEntry) == "table" and clean(info.activeEntry.entryID)
                    or type(info.entryIDs) == "table" and clean(info.entryIDs[1])
                local entry = entryID and nth(1, T.GetEntryInfo, configID, entryID)
                local def = type(entry) == "table" and entry.definitionID and nth(1, T.GetDefinitionInfo, entry.definitionID)
                local spellID = type(def) == "table" and (clean(def.spellID) or clean(def.overriddenSpellID)) or nil
                g.points = g.points + rank
                local talentName = SpellName(spellID)
                local max = tonumber(clean(info.maxRanks)) or 1
                -- desc: the text at the rank held (rank 1 when none is held). descMax: at full rank, when that differs.
                local shown = rank > 0 and rank or 1
                local desc, descMax, descFrom = TraitText(entryID, shown, talentName), nil, nil
                if desc then
                    if max > shown then
                        descMax = TraitText(entryID, max, talentName)
                        if descMax == desc then descMax = nil end
                    end
                else
                    desc = SpellDesc(spellID)
                    -- Not rank-aware: the numbers are only right for a one-rank talent.
                    if desc and max > 1 then descFrom = "spell" end
                end
                g.talents[#g.talents + 1] = { name = talentName, spellID = spellID, node = nodeID,
                    rank = rank, max = max, desc = desc, descMax = descMax, descFrom = descFrom,
                    y = tonumber(clean(info.posY)) or 0, x = tonumber(clean(info.posX)) or 0 }
            end
        end
    end
    table.sort(groups, function(a, b) return a.order < b.order end)
    for _, g in ipairs(groups) do
        g.order = nil
        local ys, xs = {}, {}
        for i, t in ipairs(g.talents) do ys[i], xs[i] = t.y, t.x end
        local rowOf, colOf = Ranked(ys), Ranked(xs)
        for _, t in ipairs(g.talents) do
            t.row, t.col, t.y, t.x = rowOf[t.y], colOf[t.x], nil, nil
        end
        table.sort(g.talents, function(a, b)
            if a.row ~= b.row then return a.row < b.row end
            if a.col ~= b.col then return a.col < b.col end
            return a.node < b.node
        end)
    end
    return groups, treeID
end

local function Talents()
    local ok, trees = pcall(LegacyTalents)
    if ok and trees then
        char.talents = trees
        local unspent = nth(1, UnitCharacterPoints, "player")
        if unspent then char.talentPoints = { unspent = unspent } end
        return
    end
    local S = C_SpecializationInfo
    local active = type(S) == "table" and nth(1, S.GetActiveSpecGroup) or nil
    local configID
    if type(C_ClassTalents) == "table" then configID = nth(1, C_ClassTalents.GetActiveConfigID) end
    if not configID and active then configID = nth(1, S.GetCombatConfigIDForSpecGroup, active) end
    local treeID
    trees, treeID = TraitTrees(configID)
    if not trees then return end
    char.talents = trees
    local currencies = nth(1, C_Traits.GetTreeCurrencyInfo, configID, treeID, false)
    local first = type(currencies) == "table" and currencies[1]
    if type(first) == "table" then
        char.talentPoints = { unspent = clean(first.quantity), spent = clean(first.spent), max = clean(first.maxQuantity) }
    end
    -- Dual spec: the other spec group, when the client will show it.
    if active then
        char.activeSpecGroup = active
        for group = 1, 2 do
            if group ~= active then
                local other = nth(1, S.GetCombatConfigIDForSpecGroup, group)
                local otherTrees = other and other ~= configID and TraitTrees(other) or nil
                if otherTrees then char.talentsOtherSpec = otherTrees end
            end
        end
    end
end

---------------------------------------------------------------- sheet stats, reputation, travel, recipes

local function Round(v)
    return type(v) == "number" and math.floor(v * 100 + 0.5) / 100 or nil
end

local function Stats()
    local s = char.stats or {}
    local function set(key, value) if value ~= nil then s[key] = value end end
    for i, statName in ipairs({ "Strength", "Agility", "Stamina", "Intellect", "Spirit" }) do
        set(statName, nth(2, UnitStat, "player", i))
    end
    set("Health", nth(1, UnitHealthMax, "player"))
    set("Mana", nth(1, UnitPowerMax, "player", 0))
    set("Armor", nth(2, UnitArmor, "player"))
    local ap = call(UnitAttackPower, "player")
    if ap and type(ap[1]) == "number" then set("AttackPower", ap[1] + (tonumber(ap[2]) or 0) + (tonumber(ap[3]) or 0)) end
    set("SpellPowerHoly", nth(1, GetSpellBonusDamage, 2))
    set("Healing", nth(1, GetSpellBonusHealing))
    set("DodgePct", Round(nth(1, GetDodgeChance)))
    set("ParryPct", Round(nth(1, GetParryChance)))
    set("BlockPct", Round(nth(1, GetBlockChance)))
    set("CritPct", Round(nth(1, GetCritChance)))
    if next(s) then char.stats = s end
end

local function Reputation()
    local out = {}
    local R = type(C_Reputation) == "table" and C_Reputation or {}
    local count = nth(1, R.GetNumFactions) or nth(1, GetNumFactions) or 0
    for i = 1, count do
        local name, standing, value, low, high, isHeader, id
        local data = nth(1, R.GetFactionDataByIndex, i)
        if type(data) == "table" then
            name, standing, value = clean(data.name), clean(data.reaction), clean(data.currentStanding)
            low, high, id = clean(data.currentReactionThreshold), clean(data.nextReactionThreshold), clean(data.factionID)
            isHeader = clean(data.isHeader) and not clean(data.isHeaderWithRep)
        else
            local r = call(GetFactionInfo, i)
            if r then
                name, standing, low, high, value, id = r[1], r[3], r[4], r[5], r[6], r[14]
                isHeader = r[9] and not r[11]
            end
        end
        if type(name) == "string" and not isHeader and type(standing) == "number" then
            local label = clean(_G["FACTION_STANDING_LABEL" .. standing])
            local entry = { name = name, id = id, standing = type(label) == "string" and label or standing }
            if type(value) == "number" and type(low) == "number" and type(high) == "number" then
                entry.have, entry.need = value - low, high - low
            end
            out[#out + 1] = entry
        end
    end
    if #out > 0 then char.reputation = out end
end

local function Travel()
    char.hearth = nth(1, GetBindLocation) or char.hearth
end

-- Only readable while the flight map is open.
local function FlightPoints()
    local known = type(char.flights) == "table" and char.flights or {}
    -- What the client called each node (CURRENT, REACHABLE, DISTANT, a state number), kept so a
    -- wrong list can be diagnosed: on 2026-11-27 a level 10 character listed far-off nodes.
    local kinds = type(char.flightKinds) == "table" and char.flightKinds or {}
    char.flightKinds = kinds
    local found = false
    for i = 1, nth(1, NumTaxiNodes) or 0 do
        local name, kind = nth(1, TaxiNodeName, i), nth(1, TaxiNodeGetType, i)
        if type(name) == "string" and name ~= "" and kind ~= "NONE" then known[name] = true kinds[name] = kind or "?" found = true end
    end
    if not found and type(C_TaxiMap) == "table" and type(C_Map) == "table" then
        local map = nth(1, C_Map.GetBestMapForUnit, "player")
        local nodes = map and nth(1, C_TaxiMap.GetAllTaxiNodes, map)
        for _, node in ipairs(type(nodes) == "table" and nodes or {}) do
            local name, state = clean(node.name), clean(node.state)
            if type(name) == "string" and name ~= "" and state ~= 2 then known[name] = true kinds[name] = state or "?" found = true end
        end
    end
    if found then char.flights = known end
end

-- Only readable while a profession window is open.
local function Recipes()
    local T = C_TradeSkillUI
    local prof, list = nil, {}
    if type(T) == "table" and type(T.GetAllRecipeIDs) == "function" then
        local base = nth(1, T.GetBaseProfessionInfo)
        prof = type(base) == "table" and clean(base.professionName) or nil
        local ids = nth(1, T.GetAllRecipeIDs)
        for _, id in ipairs(type(ids) == "table" and ids or {}) do
            local info = nth(1, T.GetRecipeInfo, id)
            if type(info) == "table" and clean(info.learned) and type(clean(info.name)) == "string" then
                list[#list + 1] = { name = info.name, id = id, canMake = clean(info.numAvailable),
                    difficulty = clean(info.relativeDifficulty) }
            end
        end
    end
    if #list == 0 and type(GetNumTradeSkills) == "function" then
        prof = nth(1, GetTradeSkillLine)
        for i = 1, nth(1, GetNumTradeSkills) or 0 do
            local r = call(GetTradeSkillInfo, i)
            if r and type(r[1]) == "string" and r[2] ~= "header" then
                list[#list + 1] = { name = r[1], difficulty = r[2], canMake = r[3] }
            end
        end
    end
    if type(prof) ~= "string" or prof == "" or #list == 0 then return end
    table.sort(list, function(a, b) return a.name < b.name end)
    if type(char.recipes) ~= "table" then char.recipes = {} end
    char.recipes[prof] = { list = list, seen = now(), seenText = nth(1, date, "%Y-%m-%d %H:%M:%S") }
end

---------------------------------------------------------------- quests

local function Objectives(questID)
    if type(C_QuestLog) ~= "table" then return nil end
    local objs = nth(1, C_QuestLog.GetQuestObjectives, questID)
    if type(objs) ~= "table" then return nil end
    local out = {}
    for _, o in ipairs(objs) do
        if type(o) == "table" then
            out[#out + 1] = { text = clean(o.text), done = clean(o.finished) and true or false,
                have = clean(o.numFulfilled), need = clean(o.numRequired) }
        end
    end
    return out
end

local function QuestLog()
    local log, header = {}, nil
    local modern = type(C_QuestLog) == "table" and type(C_QuestLog.GetInfo) == "function"
    local count
    if type(C_QuestLog) == "table" then count = nth(1, C_QuestLog.GetNumQuestLogEntries) end
    count = count or nth(1, GetNumQuestLogEntries) or 0
    for i = 1, count do
        local title, level, isHeader, complete, questID
        local info = modern and nth(1, C_QuestLog.GetInfo, i) or nil
        if type(info) == "table" then
            title, level, isHeader, questID = clean(info.title), clean(info.level), clean(info.isHeader), clean(info.questID)
            if clean(info.isHidden) and not isHeader then
                questID = nil
            elseif questID and not isHeader then
                complete = nth(1, C_QuestLog.IsComplete, questID)
            end
        else
            local r = call(GetQuestLogTitle, i)
            if r then title, level, isHeader, complete, questID = r[1], r[2], r[4], r[6], r[8] end
        end
        if isHeader then
            header = title
        elseif questID and title then
            if level == 0 then level = nil end -- no fixed level on this client
            log[#log + 1] = { id = questID, title = title, level = level, zone = header,
                complete = (complete == true or complete == 1) and true or false,
                failed = (complete == -1) and true or nil,
                objectives = Objectives(questID) }
        end
    end
    char.questLog = log
end

local function QuestsDone()
    if not questsDoneStale then return end
    local ids
    if type(C_QuestLog) == "table" then
        local list = nth(1, C_QuestLog.GetAllCompletedQuestIDs)
        if type(list) == "table" then
            ids = {}
            for _, id in ipairs(list) do if type(id) == "number" then ids[#ids + 1] = id end end
        end
    end
    if not ids then
        local map = nth(1, GetQuestsCompleted)
        if type(map) == "table" then
            ids = {}
            for id, done in pairs(map) do if done and type(id) == "number" then ids[#ids + 1] = id end end
        end
    end
    if not ids then return end
    -- An empty answer right after login usually means the list has not arrived yet.
    if #ids == 0 and char.questsDone and #char.questsDone > 0 then return end
    table.sort(ids)
    char.questsDone = ids
    questsDoneStale = false
end

---------------------------------------------------------------- boss kills

local function RecordKill(encounterID, bossName)
    bossName = clean(bossName)
    if type(bossName) ~= "string" then return end
    char.kills = char.kills or {}
    local t = now()
    local last = char.kills[#char.kills]
    if last and last.boss == bossName and t - (last.time or 0) < 120 then return end -- both events fire
    local inst = call(GetInstanceInfo) or {}
    char.kills[#char.kills + 1] = { boss = bossName, encounterID = clean(encounterID),
        instance = inst[1], instanceType = inst[2], instanceID = inst[8], level = char.level,
        time = t, timeText = nth(1, date, "%Y-%m-%d %H:%M:%S") }
end

---------------------------------------------------------------- snapshot

local SECTIONS = { Basics, Stats, Equipped, Bags, Bank, Professions, Talents, Reputation, Travel, QuestLog, QuestsDone }

local function Snapshot()
    pending = false
    if not char then return end
    for _, section in ipairs(SECTIONS) do pcall(section) end
    char.snapshots = (char.snapshots or 0) + 1
end

local function Queue()
    if pending then return end
    if type(C_Timer) == "table" and type(C_Timer.After) == "function" then
        pending = true
        C_Timer.After(2, Snapshot)
    else
        Snapshot()
    end
end

local function Init()
    if type(ForeverTrackerDB) ~= "table" then ForeverTrackerDB = {} end
    local db = ForeverTrackerDB
    db.version = DB_VERSION
    if type(db.chars) ~= "table" then db.chars = {} end
    local name = nth(1, UnitName, "player") or "Unknown"
    local realm = nth(1, GetRealmName) or "Forever"
    -- The realm is empty on WoW Forever: key by name alone, and move a record saved as "Name-".
    local key = realm ~= "" and (name .. "-" .. realm) or name
    if realm == "" and type(db.chars[name .. "-"]) == "table" then
        if type(db.chars[key]) ~= "table" then db.chars[key] = db.chars[name .. "-"] end
        db.chars[name .. "-"] = nil
    end
    if type(db.chars[key]) ~= "table" then db.chars[key] = {} end
    char = db.chars[key]
    db.lastChar = key
end

local EVENTS = {
    "PLAYER_LOGIN", "PLAYER_ENTERING_WORLD", "PLAYER_LOGOUT", "PLAYER_LEVEL_UP", "PLAYER_XP_UPDATE",
    "PLAYER_MONEY", "PLAYER_EQUIPMENT_CHANGED", "BAG_UPDATE_DELAYED", "ZONE_CHANGED_NEW_AREA",
    "QUEST_LOG_UPDATE", "QUEST_ACCEPTED", "QUEST_REMOVED", "QUEST_TURNED_IN",
    "SKILL_LINES_CHANGED", "CHARACTER_POINTS_CHANGED", "PLAYER_TALENT_UPDATE",
    "BANKFRAME_OPENED", "BANKFRAME_CLOSED", "PLAYERBANKSLOTS_CHANGED",
    "ENCOUNTER_END", "BOSS_KILL",
    "UPDATE_FACTION", "HEARTHSTONE_BOUND", "TRAIT_CONFIG_UPDATED", "ACTIVE_TALENT_GROUP_CHANGED",
    "TAXIMAP_OPENED", "TRADE_SKILL_SHOW", "TRADE_SKILL_LIST_UPDATE",
}
for _, event in ipairs(EVENTS) do pcall(frame.RegisterEvent, frame, event) end

frame:SetScript("OnEvent", function(_, event, ...)
    if event == "PLAYER_LOGIN" then
        Init()
    elseif not char then
        return
    elseif event == "PLAYER_LOGOUT" then
        -- Gold, XP, gear and bags already read as empty here; the last
        -- snapshot (at most 2 seconds after the last change) is the good one.
        char.lastSeen = now()
        char.lastSeenText = nth(1, date, "%Y-%m-%d %H:%M:%S")
        return
    elseif event == "BANKFRAME_OPENED" then
        bankOpen = true
    elseif event == "BANKFRAME_CLOSED" then
        pcall(Bank) -- last look before it closes
        bankOpen = false
    elseif event == "TAXIMAP_OPENED" then
        pcall(FlightPoints)
    elseif event == "TRADE_SKILL_SHOW" or event == "TRADE_SKILL_LIST_UPDATE" then
        pcall(Recipes)
    elseif event == "QUEST_TURNED_IN" or event == "PLAYER_ENTERING_WORLD" then
        questsDoneStale = true
    elseif event == "ENCOUNTER_END" then
        local encounterID, bossName, _, _, success = ...
        success = clean(success)
        if success == 1 or success == true then pcall(RecordKill, encounterID, bossName) end
    elseif event == "BOSS_KILL" then
        local encounterID, bossName = ...
        pcall(RecordKill, encounterID, bossName)
    end
    Queue()
end)

SLASH_FOREVERTRACKER1 = "/ft"
SLASH_FOREVERTRACKER2 = "/forevertracker"
SlashCmdList["FOREVERTRACKER"] = function(msg)
    msg = tostring(msg or ""):lower()
    if msg:find("save") then
        Snapshot()
        if type(ReloadUI) == "function" then ReloadUI() end
        return
    end
    Snapshot()
    if not char then return end
    local bank = char.bank and (#char.bank.items .. " item types, seen " .. tostring(char.bank.seenText)) or "not seen yet (open your bank)"
    print(("ForeverTracker: %s level %s, %d bag item types, %d quests in log, %d quests done, %d boss kills. Bank: %s. Type /ft save to write it to disk now (reloads the UI)."):format(
        tostring(char.name), tostring(char.level), char.bags and #char.bags.items or 0,
        char.questLog and #char.questLog or 0, char.questsDone and #char.questsDone or 0,
        char.kills and #char.kills or 0, bank))
end
