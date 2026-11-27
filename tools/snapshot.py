"""Turn the ForeverTracker addon's saved file into characters.json.

    python tools/snapshot.py              # write characters.json and print a summary
    python tools/snapshot.py --quiet      # write only
    python tools/snapshot.py --source <ForeverTracker.lua> --out <file.json>

The game writes the saved file on /reload, logout or exit, so the data is as
fresh as each character's last one of those ("lastSeenText").
"""
import argparse
import glob
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOW = "F:/World of Warcraft/_forever_"
SOURCE_GLOB = WOW + "/WTF/Account/*/SavedVariables/ForeverTracker.lua"
OUT = os.path.join(ROOT, "characters.json")


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


def find_source():
    found = glob.glob(SOURCE_GLOB)
    return max(found, key=os.path.getmtime) if found else None


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--source", help="path to ForeverTracker.lua (default: newest under the WoW Forever WTF folder)")
    ap.add_argument("--out", default=OUT)
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
    if not args.quiet:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        print(summary(doc))
        print(f"\nWrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
