"""Crawl EverlookDB for every quest tied to the remaining 48-60 dungeons, follow chains both ways,
and write per-dungeon research files into the tracker repo."""
import json, pathlib, re, sys, time, urllib.request

import tempfile
SCR = pathlib.Path(tempfile.gettempdir()) / "everlookdb-dungeon-quests"  # download cache, safe to delete
SCR.mkdir(parents=True, exist_ok=True); CACHE = SCR / "q"; CACHE.mkdir(parents=True, exist_ok=True)
OUT = pathlib.Path(__file__).resolve().parent / "dungeon-quests"; OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "tracker-research/1.0"}
import datetime
TODAY = datetime.date.today().isoformat()

DUNGEONS = [  # tracker id, title, EverlookDB list slugs
    ("alcaz", "Alcaz Prison", ["alcaz-prison"]),
    ("st", "Sunken Temple", ["sunken-temple", "the-temple-of-atalhakkar"]),
    ("brd", "Blackrock Depths", ["blackrock-depths", "blackrock-mountain"]),
    ("dm", "Dire Maul", ["dire-maul"]),
    ("blackmaw", "Blackmaw Hold", ["blackmaw-hold"]),
    ("brs", "Blackrock Spire", ["blackrock-spire"]),
    ("strat", "Stratholme", ["stratholme"]),
    ("scholo", "Scholomance", ["scholomance"]),
    ("shaper", "The Shaper's Terrace", ["the-shapers-terrace"]),
]

def get(url):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            err = e; time.sleep(2)
    raise err

def quest_md(qid):
    f = CACHE / f"{qid}.md"
    if not f.exists():
        f.write_text(get(f"https://everlookdb.com/quest/{qid}.md"), encoding="utf-8"); time.sleep(0.25)
    return f.read_text(encoding="utf-8")

LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")
def clean(s):
    s = LINK.sub(r"\1", s)
    return re.sub(r"\s+", " ", s).strip()

def parse(qid):
    md = quest_md(qid)
    if not md.startswith("# "):
        return None
    q = {"id": qid, "name": md.split("\n", 1)[0][2:].strip()}
    facts = {}
    sec = None; objs = []; rewards = {}; objtext = []
    for line in md.split("\n"):
        if line.startswith("## "):
            sec = line[3:].strip(); continue
        if sec == "Facts" and line.startswith("- ") and ":" in line:
            k, v = line[2:].split(":", 1); facts.setdefault(k.strip(), v.strip())
        elif sec == "Objectives":
            if line.startswith("|") and "---" not in line and line.strip("| ").strip():
                cells = [clean(c) for c in line.strip().strip("|").split("|")]
                cells = [re.sub(r"\((npc|item|object) \d+\)", "", c).strip() for c in cells if c.strip()]
                if cells: objs.append(" ".join(cells))
            elif line.strip() and not line.startswith("|"):
                objtext.append(clean(line.replace("(EG Link (CC BY 4.0))", "")))
        elif sec and (sec.startswith("Choose") or sec.startswith("You get") or sec.startswith("Rewards") or sec.startswith("You receive")) and line.startswith("- "):
            rewards.setdefault(sec, []).append(re.sub(r"\(item \d+\)", "", clean(line[2:])).strip())
    q["level"] = facts.get("Level"); q["req"] = facts.get("Requires level")
    q["faction"] = facts.get("Faction", "")
    q["type"] = facts.get("Type", "")
    q["zone"] = clean(facts.get("Zone", ""))
    q["start"] = re.sub(r"\((npc|item|object) \d+\)", "", clean(facts.get("Start", ""))).replace(" ,", ",").strip()
    q["start_item"] = bool(re.search(r"\(item \d+\)", facts.get("Start", "")))
    q["end"] = re.sub(r"\((npc|item|object) \d+\)", "", clean(facts.get("Turn in", ""))).replace(" ,", ",").strip()
    q["xp"] = facts.get("Experience"); q["money"] = facts.get("Money"); q["rep"] = facts.get("Reputation")
    q["chain"] = facts.get("Quest chain"); q["shareable"] = facts.get("Shareable")
    q["class"] = facts.get("Class", ""); q["repeatable"] = facts.get("Repeatable", "")
    if q["start"].startswith("Unknown yet"): q["start"] = "not recorded on EverlookDB yet (likely inside the dungeon)"
    q["before"] = [int(x) for x in re.findall(r"\(quest (\d+)\)", facts.get("Before this", ""))]
    q["after"] = [int(x) for x in re.findall(r"\(quest (\d+)\)", facts.get("After this", ""))]
    q["objectives"] = objs; q["objective_text"] = " ".join(objtext)
    q["rewards"] = rewards
    return q

def horde_ok(q):
    """Usable by a Horde paladin: Horde or both factions, and no class lock that excludes Paladin."""
    f = q["faction"].lower()
    if f and "horde" not in f: return False
    if q.get("class") and "paladin" not in q["class"].lower(): return False
    return True

def list_ids(slug):
    f = SCR / f"list-{slug}.html"
    if not f.exists():
        f.write_text(get(f"https://everlookdb.com/quests/{slug}"), encoding="utf-8")
    return sorted({int(x) for x in re.findall(r"/quest/(\d+)/", f.read_text(encoding="utf-8"))})

allq = {}
summary = {}
for did, title, slugs in DUNGEONS:
    seeds = []
    for s in slugs: seeds += list_ids(s)
    seen, todo = set(), list(dict.fromkeys(seeds))
    while todo:
        qid = todo.pop(0)
        if qid in seen: continue
        seen.add(qid)
        q = allq.get(qid) or parse(qid)
        if not q: continue
        allq[qid] = q
        if not horde_ok(q): continue          # do not follow Alliance-only links
        for n in q["before"] + q["after"]:
            if n not in seen: todo.append(n)
    horde = [allq[i] for i in seen if i in allq and horde_ok(allq[i])]
    summary[did] = {"title": title, "slugs": slugs, "seed_ids": seeds, "horde_ids": sorted(q["id"] for q in horde)}
    print(did, "seeds", len(seeds), "horde incl. chains", len(horde), flush=True)

# group into chains (connected components over before/after, Horde only)
def chains(ids):
    ids = set(ids); comp = []; done = set()
    for i in sorted(ids):
        if i in done: continue
        stack, c = [i], set()
        while stack:
            x = stack.pop()
            if x in c or x not in ids: continue
            c.add(x)
            stack += allq[x]["before"] + allq[x]["after"]
        done |= c
        # order: roots first (no Horde predecessor inside the component), then BFS
        order, seen = [], set()
        frontier = sorted(x for x in c if not any(p in c for p in allq[x]["before"]))
        while frontier:
            nxt = []
            for x in frontier:
                if x in seen: continue
                seen.add(x); order.append(x)
                nxt += [a for a in allq[x]["after"] if a in c]
            frontier = nxt
        order += sorted(c - seen)
        comp.append(order)
    return comp

def fmt(q):
    lines = [f"- **{q['name']}** (quest {q['id']}; level {q['level']}, requires {q['req']}; {q['faction'] or 'faction not listed'}{'; ' + q['type'] if q['type'] else ''})"]
    if q["start"]: lines.append(f"  - Start: {q['start']}{' (starts from an item)' if q['start_item'] else ''}")
    if q["end"]: lines.append(f"  - Turn in: {q['end']}")
    if q["objectives"] or q["objective_text"]:
        ot = q["objective_text"].replace("EG Link (CC BY 4.0)", "").strip()
        lines.append("  - Do: " + "; ".join(q["objectives"]) + (" — " if q["objectives"] and ot else "") + ot)
    if q.get("class"): lines.append(f"  - Class: {q['class']}")
    if q.get("repeatable"): lines.append(f"  - Repeatable: {q['repeatable']}")
    bits = [b for b in (q["xp"] and f"{q['xp']} XP", q["money"], q["rep"]) if b]
    for k, v in q["rewards"].items(): bits.append(f"{k.lower()}: {', '.join(v)}")
    if bits: lines.append("  - Reward: " + "; ".join(bits))
    return "\n".join(lines)

build = ""
for f in CACHE.glob("*.md"):
    m = re.search(r"game client build ([0-9.]+)", f.read_text(encoding="utf-8"))
    if m: build = max(build, m.group(1))

percomp = {}
count = {}
for did, title, slugs in DUNGEONS:
    comps = chains(summary[did]["horde_ids"])
    percomp[did] = comps
    for c in comps:
        k = frozenset(c); count[k] = count.get(k, 0) + 1
shared = {k for k, n in count.items() if n >= 3}
shared_where = {}
for did, title, slugs in DUNGEONS:
    for c in percomp[did]:
        if frozenset(c) in shared: shared_where.setdefault(frozenset(c), []).append(title)

HEADER = ["Horde quests a paladin can take (other classes' quests are left out). Alliance-only links are not followed. Chains are listed first-step first.",
          "Start/turn-in coordinates are zone-map percent (/way). 'Faction not listed' means EverlookDB has no faction for it yet.",
          "Generated by the tracker's research crawl; check a quest's page before routing if anything looks off."]

sh = ["# Chains that span several dungeons", "",
      f"Source: EverlookDB, read {TODAY} (WoW Forever client build {{BUILD}}).", *HEADER,
      "These chains have steps in three or more of the 48-60 dungeons, so they live here once instead of in each dungeon file.", ""]
for n, k in enumerate(sorted(shared, key=lambda k: -len(k)), 1):
    c = next(c for d in percomp.values() for c in d if frozenset(c) == k)
    sh.append(f"## {allq[c[0]]['name']} ({len(c)} steps; touches {', '.join(shared_where[k])})"); sh.append("")
    sh += [fmt(allq[i]) for i in c]; sh.append("")

for did, title, slugs in DUNGEONS:
    comps = [c for c in percomp[did] if frozenset(c) not in shared]
    comps.sort(key=lambda c: (-len(c), allq[c[0]]["name"]))
    out = [f"# {title}: Horde quests and their chains",
           "",
           f"Source: EverlookDB quest list(s) {', '.join('/quests/' + s for s in slugs)}, plus every quest linked before or after them, read {TODAY} (WoW Forever client build {build}).",
           *HEADER]
    sl = [allq[next(iter(k))] for k in shared if any(frozenset(c) == k for c in percomp[did])]
    sl = [next(c for c in percomp[did] if frozenset(c) == k) for k in shared if any(frozenset(c) == k for c in percomp[did])]
    if sl:
        out.append("Also touching this dungeon, written up once in shared-chains.md: " + "; ".join(f"{allq[c[0]]['name']} ({len(c)} steps, level {allq[c[0]]['level']})" for c in sl) + ".")
    out.append("")
    for n, c in enumerate(comps, 1):
        head = f"## Chain {n}: {allq[c[0]]['name']}" if len(c) > 1 else f"## Single: {allq[c[0]]['name']}"
        out.append(head + (f" ({len(c)} steps)" if len(c) > 1 else ""))
        out.append("")
        out += [fmt(allq[i]) for i in c]
        out.append("")
    (OUT / f"{did}.md").write_text("\n".join(out), encoding="utf-8")
(OUT / "shared-chains.md").write_text("\n".join(sh).replace("{BUILD}", build), encoding="utf-8")

json.dump({"generated": TODAY, "source": "everlookdb.com", "build": build,
           "dungeons": summary, "quests": {str(k): v for k, v in sorted(allq.items())}},
          open(OUT / "quests.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("build", build, "total cached quests", len(allq))
