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
    char.xp = nth(1, UnitXP, "player")
    char.xpMax = nth(1, UnitXPMax, "player")
    char.rested = nth(1, GetXPExhaustion) or 0
    char.money = nth(1, GetMoney) or char.money
    char.zone = nth(1, GetRealZoneText) or char.zone
    char.subzone = nth(1, GetSubZoneText)
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

local function Equipped()
    local gear = {}
    for slot, slotName in ipairs(SLOTS) do
        local link = nth(1, GetInventoryItemLink, "player", slot)
        if link then
            local id, name = itemFromLink(link)
            id = id or nth(1, GetInventoryItemID, "player", slot)
            gear[slotName] = { id = id, name = name, ilvl = ItemLevel(link) }
        end
    end
    char.equipped = gear
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

local function Talents()
    local tabs = nth(1, GetNumTalentTabs)
    if type(tabs) ~= "number" or type(GetTalentInfo) ~= "function" then return end
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
    if #out > 0 then char.talents = out end
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

local SECTIONS = { Basics, Equipped, Bags, Bank, Professions, Talents, QuestLog, QuestsDone }

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
    local key = name .. "-" .. realm
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
}
for _, event in ipairs(EVENTS) do pcall(frame.RegisterEvent, frame, event) end

frame:SetScript("OnEvent", function(_, event, ...)
    if event == "PLAYER_LOGIN" then
        Init()
    elseif not char then
        return
    elseif event == "PLAYER_LOGOUT" then
        questsDoneStale = true
        Snapshot()
        return
    elseif event == "BANKFRAME_OPENED" then
        bankOpen = true
    elseif event == "BANKFRAME_CLOSED" then
        pcall(Bank) -- last look before it closes
        bankOpen = false
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
