"""Turn the ForeverTracker addon's saved file into characters.json.

    python tools/snapshot.py              # write characters.json + context.md and print a summary
    python tools/snapshot.py --quiet      # write only
    python tools/snapshot.py --source <ForeverTracker.lua> --out <file.json>

The game writes the saved file on /reload, logout or exit, so the data is as
fresh as each character's last one of those ("lastSeenText").
"""
import argparse
import glob
import json
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOW = "F:/World of Warcraft/_forever_"
SOURCE_GLOB = WOW + "/WTF/Account/*/SavedVariables/ForeverTracker.lua"
OUT = os.path.join(ROOT, "characters.json")
CONTEXT = os.path.join(ROOT, "context.md")
INTRO = os.path.join(ROOT, "briefing-intro.md")


class LuaError(ValueError):
    pass


class _Parser:
    """Reads the table literals WoW writes to SavedVariables files."""

    def __init__(self, data):
        self.d = data
        self.i = 0

    def skip(self):
        d, n = self.d, len(self.d)
        while self.i < n:
            c = d[self.i:self.i + 1]
            if c in b" \t\r\n":
                self.i += 1
            elif d.startswith(b"--", self.i):
                end = d.find(b"\n", self.i)
                self.i = n if end < 0 else end
            else:
                break

    def fail(self, what):
        line = self.d.count(b"\n", 0, self.i) + 1
        raise LuaError(f"{what} at line {line}")

    def expect(self, token):
        self.skip()
        if not self.d.startswith(token, self.i):
            self.fail(f"expected {token.decode()!r}")
        self.i += len(token)

    def name(self):
        self.skip()
        start = self.i
        while self.i < len(self.d) and (self.d[self.i:self.i + 1].isalnum() or self.d[self.i:self.i + 1] == b"_"):
            self.i += 1
        if start == self.i:
            self.fail("expected a name")
        return self.d[start:self.i].decode()

    def string(self):
        quote = self.d[self.i:self.i + 1]
        self.i += 1
        out = bytearray()
        simple = {b"n": b"\n", b"r": b"\r", b"t": b"\t", b"a": b"\a", b"b": b"\b", b"f": b"\f", b"v": b"\v"}
        while True:
            if self.i >= len(self.d):
                self.fail("unterminated string")
            c = self.d[self.i:self.i + 1]
            self.i += 1
            if c == quote:
                break
            if c != b"\\":
                out += c
                continue
            e = self.d[self.i:self.i + 1]
            if e.isdigit():
                j = self.i
                while j < self.i + 3 and self.d[j:j + 1].isdigit():
                    j += 1
                out.append(int(self.d[self.i:j]) & 0xFF)
                self.i = j
            else:
                out += simple.get(e, e)
                self.i += 1
        return out.decode("utf-8", "replace")

    def value(self):
        self.skip()
        c = self.d[self.i:self.i + 1]
        if c == b"{":
            return self.table()
        if c in (b'"', b"'"):
            return self.string()
        for word, val in ((b"true", True), (b"false", False), (b"nil", None)):
            if self.d.startswith(word, self.i):
                self.i += len(word)
                return val
        start = self.i
        while self.i < len(self.d) and self.d[self.i:self.i + 1] in b"+-.0123456789eExXabcdefABCDEFinf":
            self.i += 1
        text = self.d[start:self.i].decode()
        try:
            if text.lower().startswith(("0x", "-0x")):
                return int(text, 16)
            return int(text)
        except ValueError:
            try:
                return float(text)
            except ValueError:
                self.i = start
                self.fail("expected a value")

    def table(self):
        self.expect(b"{")
        keyed, positional = {}, []
        while True:
            self.skip()
            c = self.d[self.i:self.i + 1]
            if c == b"}":
                self.i += 1
                break
            if c == b"[":
                self.i += 1
                key = self.value()
                self.expect(b"]")
                self.expect(b"=")
                keyed[key] = self.value()
            else:
                save = self.i
                is_named = False
                if c.isalpha() or c == b"_":
                    key = self.name()
                    self.skip()
                    if self.d[self.i:self.i + 1] == b"=" and self.d[self.i:self.i + 2] != b"==":
                        self.i += 1
                        keyed[key] = self.value()
                        is_named = True
                if not is_named:
                    self.i = save
                    positional.append(self.value())
            self.skip()
            if self.d[self.i:self.i + 1] in (b",", b";"):
                self.i += 1
        for n, v in enumerate(positional, 1):
            keyed.setdefault(n, v)
        keyed = {k: v for k, v in keyed.items() if v is not None}
        n = len(keyed)
        if n and all(isinstance(k, int) and not isinstance(k, bool) for k in keyed) and set(keyed) == set(range(1, n + 1)):
            return [keyed[k] for k in range(1, n + 1)]
        return {(str(k) if not isinstance(k, str) else k): v for k, v in keyed.items()}


def parse_saved_variables(data):
    """bytes or str of a SavedVariables file -> {variable name: value}."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    if data.startswith(b"\xef\xbb\xbf"):
        data = data[3:]
    p = _Parser(data)
    out = {}
    while True:
        p.skip()
        if p.i >= len(p.d):
            return out
        key = p.name()
        p.expect(b"=")
        out[key] = p.value()


def money_text(copper):
    copper = int(copper or 0)
    return f"{copper // 10000}g {copper // 100 % 100}s {copper % 100}c"


def _age(seconds):
    if seconds < 3600:
        return f"{int(seconds // 60)} min ago"
    if seconds < 86400:
        return f"{seconds / 3600:.1f} h ago"
    return f"{seconds / 86400:.1f} days ago"


def _list(value):
    """An empty Lua table parses as {}; the fields below are always lists."""
    return value if isinstance(value, list) else []


def build(db, source="", now=None):
    """The addon's ForeverTrackerDB -> the characters.json document."""
    now = time.time() if now is None else now
    chars = {}
    for key, c in sorted((db.get("chars") or {}).items()):
        if not isinstance(c, dict):
            continue
        c = dict(c)
        for field in ("questLog", "questsDone", "kills", "professions", "talents"):
            c[field] = _list(c.get(field))
        for field in ("bags", "bank"):
            if isinstance(c.get(field), dict):
                c[field] = dict(c[field], items=_list(c[field].get("items")))
        if not isinstance(c.get("equipped"), dict):
            c["equipped"] = {}
        c["moneyText"] = money_text(c.get("money"))
        if c.get("lastSeen"):
            c["lastSeenAge"] = _age(max(0, now - c["lastSeen"]))
        if isinstance(c.get("bank"), dict) and c["bank"].get("seen"):
            c["bank"]["seenAge"] = _age(max(0, now - c["bank"]["seen"]))
        chars[key] = c
    return {
        "generated": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
        "source": source,
        "addonDbVersion": db.get("version"),
        "lastChar": db.get("lastChar"),
        "characters": chars,
    }


def summary(doc):
    lines = []
    for key, c in doc["characters"].items():
        profs = ", ".join(f"{p.get('name')} {p.get('rank')}/{p.get('max')}" for p in c["professions"]) or "none read"
        bank = c.get("bank")
        bank_text = f"{len(bank['items'])} item types ({bank.get('seenAge', '?')})" if isinstance(bank, dict) else "not seen (open the bank once)"
        bags = c.get("bags") if isinstance(c.get("bags"), dict) else {"items": []}
        lines.append(
            f"{key}: level {c.get('level')} {c.get('race', '')} {c.get('class', '')}, {c['moneyText']}, "
            f"{c.get('zone', '?')}, seen {c.get('lastSeenAge', '?')}\n"
            f"  gear {len(c['equipped'])} slots | bags {len(bags['items'])} item types | bank {bank_text}\n"
            f"  quests: {len(c['questLog'])} in log, {len(c['questsDone'])} done | boss kills {len(c['kills'])}\n"
            f"  skills: {profs}"
        )
    return "\n".join(lines) or "No characters recorded yet. Log in with ForeverTracker enabled, then /reload or log out."


RACES = {"Scourge": "Undead", "BloodElf": "Blood Elf", "NightElf": "Night Elf"}
NOISE = ("Durability", "Sell Price", "<Right Click", "<Shift")
SLOT_ORDER = ["Head", "Neck", "Shoulder", "Back", "Chest", "Shirt", "Tabard", "Wrist", "Hands", "Waist", "Legs", "Feet",
              "Finger1", "Finger2", "Trinket1", "Trinket2", "MainHand", "OffHand", "Ranged"]
STAT_ORDER = ["Health", "Mana", "Armor", "Strength", "Agility", "Stamina", "Intellect", "Spirit", "AttackPower",
              "SpellPowerHoly", "Healing", "DodgePct", "ParryPct", "BlockPct", "CritPct"]


def _ordered(d, order):
    """Lua tables come back in no fixed order; show known keys in a set order, then any others by name."""
    return [(k, d[k]) for k in order if k in d] + sorted((k, v) for k, v in d.items() if k not in order)


def load_tracker(root=ROOT):
    """data.js (the plan) is JavaScript, so node reads it. Returns None when that is not possible."""
    path = os.path.join(root, "data.js")
    if not os.path.exists(path):
        return None
    script = "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.TRACKER||null))"
    try:
        out = subprocess.run(["node", "-e", script, path], capture_output=True, timeout=20)
        return json.loads(out.stdout.decode("utf-8")) if out.returncode == 0 else None
    except (OSError, ValueError, subprocess.SubprocessError):
        return None


def load_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def _who(c):
    race = RACES.get(c.get("race"), c.get("race") or "")
    return " ".join(x for x in (f"level {c.get('level', '?')}", race, str(c.get("class") or "").title()) if x)


def _recorded(c):
    """False for a record written before gold, gear and bags were read (a 0 there is not a real 0)."""
    return bool(c["equipped"]) or bool(c.get("money")) or isinstance(c.get("bags"), dict) and bool(c["bags"]["items"])


def _items(items):
    return ", ".join(f"{i.get('name') or 'item ' + str(i.get('id'))}" + (f" x{i['count']}" if i.get("count", 1) != 1 else "")
                     for i in items) or "empty"


def _talent_text(t):
    """': text at the rank held. At N/N: text at full rank.' with a warning when the numbers are not rank-aware."""
    if not t.get("desc"):
        return ""
    text = f": {t['desc']}"
    if t.get("descMax"):
        text += f" At {t.get('max')}/{t.get('max')}: {t['descMax']}"
    if t.get("descFrom") == "spell":
        text += " (numbers unreliable: this text ignores the rank)"
    return text


def _talent_lines(trees, out):
    for tree in trees:
        talents = _list(tree.get("talents"))
        out.append(f"- **{tree.get('tab')}**: {tree.get('points', 0)} points")
        for t in talents:
            if t.get("rank"):
                out.append(f"  - {t.get('name') or 'node ' + str(t.get('node'))} {t['rank']}/{t.get('max', '?')}{_talent_text(t)}")
        open_ones = [t for t in talents if not t.get("rank")]
        if open_ones:
            out.append("  - Not taken (text shown is for rank 1):")
            for t in open_ones:
                row = f"row {t['row']}, " if t.get("row") else ""
                out.append(f"    - {t.get('name') or 'node ' + str(t.get('node'))} ({row}max {t.get('max', '?')}){_talent_text(t)}")


def _plan_lines(tracker, state, out):
    progress = (state or {}).get("progress") or {}
    prefs = (tracker.get("character") or {}).get("prefs") or []
    if prefs:
        out += ["Standing preferences:", ""] + [f"- {p}" for p in prefs] + [""]
    plan = tracker.get("plan") or []
    if plan:
        out += ["Plan to 60, in order (the first step not done is the current one):", ""]
        for step in plan:
            done = progress.get("p_" + str(step.get("id"))) or (
                step.get("d") and not step.get("manual") and progress.get("d_" + step["d"]) == "done")
            lv = step.get("lv") or ["?", "?"]
            note = f" {step['note']}" if step.get("note") else ""
            zone = f" (zone range {step['zr']})" if step.get("zr") else ""
            out.append(f"- [{'x' if done else ' '}] Level {lv[0]}-{lv[1]}: {step.get('t')}{zone}.{note}")
        if tracker.get("planOptional"):
            out += ["", tracker["planOptional"]]
        out.append("")
    todo = [m for m in tracker.get("milestones") or [] if not progress.get("m_" + str(m.get("id")))]
    if todo:
        out += ["Milestones not ticked yet:", ""] + [f"- Level {m.get('at')}: {m.get('name')}. {m.get('detail', '')}" for m in todo] + [""]
    if tracker.get("unknowns"):
        out += ["Open questions the tracker lists:", ""] + [f"- {u}" for u in tracker["unknowns"]] + [""]


def render_context(doc, intro="", tracker=None, state=None):
    """characters.json document -> one Markdown briefing an AI can be handed whole."""
    chars = sorted(doc["characters"].values(), key=lambda c: -(c.get("level") or 0))
    out = [
        "# WoW Forever: character briefing",
        "",
        f"Generated {doc['generated']} from the ForeverTracker addon's saved data. Everything an assistant needs to "
        "advise on talents, gear, gold and what to do next is meant to be in this one file.",
        "",
        "## How to read this",
        "",
        "- Each character is only as fresh as its \"last seen\" time: the game writes addon data on /reload or logout.",
        "- \"Not recorded\" means the addon has not seen it yet, not that it is empty. Bank, flight points and "
        "recipes are only read while that window is open in game.",
        "- WoW Forever has its own items, talents, quests and dungeons. Trust the item and talent text here over "
        "memory of Classic. Quest IDs can be looked up on EverlookDB.",
        "- If something needed is missing, say so and ask; do not fill gaps from Classic knowledge.",
        "",
    ]
    if intro.strip():
        out += [intro.strip(), ""]
    if tracker:
        out += ["## Current plan (from the tracker)", ""]
        _plan_lines(tracker, state, out)
    out += ["## Characters at a glance", "", "| Character | | Gold | Where | Last seen |", "|---|---|---|---|---|"]
    for c in chars:
        gold = c["moneyText"] if _recorded(c) else "not recorded"
        out.append(f"| {c.get('name', '?')} | {_who(c)} | {gold} | {c.get('zone', '?')} | "
                   f"{c.get('lastSeenText', '?')} ({c.get('lastSeenAge', '?')}) |")
    out.append("")

    for c in chars:
        ok = _recorded(c)
        out += [f"## {c.get('name', '?')}: {_who(c)}", ""]
        where = c.get("zone", "?") + (f", {c['subzone']}" if c.get("subzone") else "")
        facts = [f"Faction {c.get('faction', '?')}", f"guild {c.get('guild') or 'none'}", f"in {where}"]
        if c.get("hearth"):
            facts.append(f"hearth set to {c['hearth']}")
        if c.get("xpMax"):
            facts.append(f"XP {c.get('xp', 0)}/{c['xpMax']} ({c.get('rested', 0)} rested)")
        facts.append(f"gold {c['moneyText']}" if ok else "gold not recorded")
        out += [", ".join(facts) + ".", ""]

        if isinstance(c.get("stats"), dict) and c["stats"]:
            out += ["### Stats", "", ", ".join(f"{k} {v}" for k, v in _ordered(c["stats"], STAT_ORDER)) + ".", ""]

        out += ["### Skills", ""]
        out += [f"- {p.get('name')} {p.get('rank')}/{p.get('max')}" for p in c["professions"]] or ["Not recorded."]
        out.append("")

        out += ["### Talents", ""]
        points = c.get("talentPoints") if isinstance(c.get("talentPoints"), dict) else {}
        if c["talents"]:
            if points.get("unspent") is not None:
                out += [f"Unspent points: {points['unspent']}.", ""]
            _talent_lines(c["talents"], out)
            other = _list(c.get("talentsOtherSpec"))
            if other:
                out += ["", "Second spec (not active):", ""]
                _talent_lines(other, out)
        else:
            out.append("Not recorded.")
        out.append("")

        out += ["### Gear worn", ""]
        if c["equipped"]:
            for slot, item in _ordered(c["equipped"], SLOT_ORDER):
                ilvl = f" (item level {item['ilvl']})" if item.get("ilvl") else ""
                text = [t for t in _list(item.get("text")) if not t.startswith(NOISE)]
                detail = ": " + "; ".join(text) if text else ""
                out.append(f"- {slot}: {item.get('name') or 'item ' + str(item.get('id'))}{ilvl}{detail}")
        else:
            out.append("Not recorded.")
        out.append("")

        bags = c.get("bags") if isinstance(c.get("bags"), dict) else None
        out += ["### Bags", ""]
        out += [f"{bags.get('used', '?')} of {bags.get('slots', '?')} slots used. {_items(bags['items'])}." if bags and ok
                else "Not recorded.", ""]
        bank = c.get("bank") if isinstance(c.get("bank"), dict) else None
        out += ["### Bank", ""]
        out += [f"Seen {bank.get('seenText', '?')} ({bank.get('seenAge', '?')}). {_items(bank['items'])}." if bank
                else "Not recorded (the bank has not been opened since the addon was installed).", ""]

        recipes = c.get("recipes") if isinstance(c.get("recipes"), dict) else {}
        if recipes:
            out += ["### Known recipes", ""]
            for prof, r in recipes.items():
                names = ", ".join(x.get("name", "?") for x in _list(r.get("list")))
                out.append(f"- {prof} (seen {r.get('seenText', '?')}): {names}")
            out.append("")

        rep = _list(c.get("reputation"))
        if rep:
            out += ["### Reputation", ""]
            out += [f"- {r.get('name')}: {r.get('standing')}" + (f" {r['have']}/{r['need']}" if r.get("need") else "") for r in rep]
            out.append("")

        flights = c.get("flights") if isinstance(c.get("flights"), dict) else {}
        if flights:
            out += ["### Known flight points", "", ", ".join(sorted(flights)) + ".", ""]

        out += [f"### Quest log ({len(c['questLog'])})", ""]
        if not c["questLog"]:
            out.append("Empty or not recorded.")
        for q in c["questLog"]:
            objs = "; ".join(o.get("text") or "" for o in _list(q.get("objectives")) if o.get("text"))
            state_text = "ready to turn in" if q.get("complete") else ("failed" if q.get("failed") else objs or "in progress")
            lvl = f", level {q['level']}" if q.get("level") else ""
            out.append(f"- {q.get('title')} (quest {q.get('id')}, {q.get('zone') or '?'}{lvl}): {state_text}")
        out.append("")

        out += ["### Dungeon boss kills (since the addon was installed)", ""]
        out += [f"- {k.get('timeText', '?')}: {k.get('boss')} in {k.get('instance', '?')} at level {k.get('level', '?')}"
                for k in c["kills"]] or ["None recorded."]
        out.append("")

        out += [f"### Completed quest IDs ({len(c['questsDone'])})", "", ", ".join(str(i) for i in c["questsDone"]) or "Not recorded.", ""]
    return "\n".join(out).rstrip() + "\n"


def find_source():
    found = glob.glob(SOURCE_GLOB)
    return max(found, key=os.path.getmtime) if found else None


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--source", help="path to ForeverTracker.lua (default: newest under the WoW Forever WTF folder)")
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--context", default=CONTEXT, help="where to write the Markdown briefing")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args(argv)

    source = args.source or find_source()
    if not source or not os.path.exists(source):
        print("No ForeverTracker.lua yet. Enable the ForeverTracker addon, log in, then /reload or log out.\n"
              f"Looked for: {args.source or SOURCE_GLOB}", file=sys.stderr)
        return 2
    with open(source, "rb") as f:
        saved = parse_saved_variables(f.read())
    db = saved.get("ForeverTrackerDB")
    if not isinstance(db, dict):
        print(f"{source} has no ForeverTrackerDB table.", file=sys.stderr)
        return 2
    doc = build(db, source=source.replace("\\", "/"))
    tmp = args.out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
    os.replace(tmp, args.out)

    intro = ""
    if os.path.exists(INTRO):
        with open(INTRO, encoding="utf-8") as f:
            intro = f.read()
    tracker = load_tracker()
    briefing = render_context(doc, intro=intro, tracker=tracker, state=load_json(os.path.join(ROOT, "state.json")))
    with open(args.context + ".tmp", "w", encoding="utf-8", newline="\n") as f:
        f.write(briefing)
    os.replace(args.context + ".tmp", args.context)

    if not args.quiet:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        print(summary(doc))
        print(f"\nWrote {args.out}")
        print(f"Wrote {args.context} ({len(briefing) // 1024 + 1} KB)" + ("" if tracker else " without the plan: node could not read data.js"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
