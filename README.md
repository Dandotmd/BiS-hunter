# WoW Forever Leveling Tracker (local)

Danadin's dungeon-first leveling tracker, run from this folder. No claude.ai account needed.

## Run it

From anywhere on this PC: Start Menu or Desktop, **WoW Forever Tracker**. It runs `launch.pyw` with
`pythonw` (no console window). That starts `server.py` hidden if it isn't already running, then opens the page
in its own Edge app window. **Stop WoW Forever Tracker** in the Start Menu stops the hidden server. The
server's output goes to `server.log` (git-ignored).

```powershell
.\install-shortcuts.ps1              # (re)create the shortcuts; run again if this folder moves
.\install-shortcuts.ps1 -AutoStart   # also start the hidden server at sign-in
.\install-shortcuts.ps1 -Remove      # delete every shortcut it made
```

Console fallback: double-click `start.bat`, or `python server.py`, then open http://127.0.0.1:8765/.
The server only listens on this PC.

## Pages

- `index.html`: character, focus list, **Plan to 60** (the 48-60 steps from `data.js` `plan`, current step
  highlighted; dungeon steps tick themselves when that dungeon is marked done, the two Dire Maul visits are
  ticked on the plan as `p_<step id>`), dungeon route, gear, milestones.
- `research.html`: reader for `research/dungeon-quests/*.md`, with a filter box, "only quests I can take at
  my level", copyable /way buttons and EverlookDB/Wowhead links. `research.html?f=st` opens one file.
  Each dungeon card links to its file.

## Files (one source of truth each)

| File | What it holds | Who edits it |
|---|---|---|
| `data.js` | The plan: dungeons, quests, gear targets, milestones, open questions | Claude, when the plan changes |
| `state.json` | Your progress: level, professions, quest/dungeon/gear/milestone ticks | The page (every click saves here); Claude may edit it directly |
| `index.html` | The page that renders `data.js` + `state.json` | Claude, for layout/logic changes |
| `research.html` | Reader for the dungeon quest research files | Claude, for layout/logic changes |
| `server.py` | Serves the folder, saves to `state.json`, `POST /api/shutdown` stops it | Rarely |
| `launch.pyw`, `install-shortcuts.ps1`, `tracker.ico` | PC-wide launcher and its shortcuts | Rarely |
| `HANDOFF.md` | Character, preferences, current status and routes for a new Claude session | Claude, at the end of each session |

## Character data from the game (ForeverTracker addon)

The goal: give Claude, or any other AI, everything it needs to advise on talents, gear, gold and what to do
next, without you typing it out. The `ForeverTracker` addon records every character you log in: level, XP,
gold, zone, hearth, sheet stats, equipped gear with each item's tooltip text, bag and bank contents,
professions and known recipes, every talent (taken or not) with its description, reputation, flight points,
the quest log with objective progress, every completed quest ID, and dungeon boss kills. It has no window. `/ft` prints a status line, `/ft save` reloads the UI so the
game writes the data to disk now.

```powershell
.\install-addon.ps1          # copy addon\ForeverTracker into the WoW AddOns folder (after any addon change)
python tools/snapshot.py     # read the game's saved file, write characters.json + context.md, print a summary
```

| File | What it holds |
|---|---|
| `addon/ForeverTracker/` | Addon source (the one source of truth; the copy in the WoW folder is installed from it) |
| `tools/snapshot.py` | Reads `WTF/Account/*/SavedVariables/ForeverTracker.lua`, writes `characters.json` |
| `characters.json` | Generated, git-ignored. One entry per character, keyed by name (the realm is empty on Forever) |
| `context.md` | Generated, git-ignored. The briefing: paste or hand this one file to an AI |
| `briefing-intro.md` | Hand-written top of the briefing: what the game is, who the player is, how to advise |
| `tools/test_snapshot.py` | Tests: the reader, and the addon run against a mock game client |

Limits to remember when reading `characters.json`:

- The game only writes addon data on `/reload`, logout or exit. Each character is as fresh as its
  `lastSeenText`; an alt that has not been logged in since the install is missing.
- `bank` is only read while the bank window is open. `bank.seenText` says when; no `bank` key means never.
  The same goes for `flights` (open a flight master's map) and `recipes` (open each profession window).
- `context.md` takes the plan, preferences and milestones from `data.js` and the ticks from `state.json`.
  `data.js` is JavaScript, so `node` reads it; without `node` the briefing is written without the plan.
- `context.md` and `characters.json` stay on this PC (owner, 2026-11-27). Do not commit or publish them.
- At logout the client reports 0 gold, 0 XP, no gear and empty bags. The addon only stamps the time then.
- `kills` only has bosses killed since the install. Earlier dungeon ticks in `state.json` stand.
- The addon does not touch `state.json`. Claude updates the tracker from the snapshot when planning.
- The client hides some values from addons ("secret" values). Those fields are left out, never guessed.

Verify:

```bash
python -m pip install lupa            # once; without it the addon tests are skipped, the reader tests still run
python -m unittest tools/test_snapshot.py -v
```

## state.json keys

- `character`: `level`, `mining`, `blacksmithing`, `firstAid` (numbers).
- `progress`: `d_<dungeon id>` = `"done"`; `q_<quest id>` = `"have"` or `"done"`; `p_<plan step id>` = `"1"`;
  `g_<item slug>` = `"1"` (name lowercased, each non-alphanumeric run → `-`); `m_<milestone id>` = `"1"`.
  Posting `""` for a key removes it.

## Saving fallbacks

1. Served by `server.py` → saves to `state.json` (status reads "Saved to state.json").
2. Opened as a file (`file://`) → saves in that browser only. Start the server to save to disk.

## Verify

```bash
python server.py --port 8765
```

then `curl http://127.0.0.1:8765/api/state` should print the contents of `state.json`.

## Landmines

- Stop the server before hand-editing `state.json`, or the page may overwrite your edit on its next click
  (the server re-reads the file on each save, so edits between clicks are kept, but a page left open shows
  stale values until reloaded).
- Only one server can hold port 8765. If one is already running (a `start.bat` console, or an older copy),
  the launcher just opens the page against it. Pages are read from disk, so page changes show at once;
  `server.py` changes need that server stopped first (Stop shortcut, close its console, or sign out).
- The research reader decodes the files as UTF-8 itself, so accented characters read right even on an
  older server that sends `.md` without a charset.
- The old claude.ai artifact (`Q13oByuzMcLNFbMFEW93hk`) still exists with its own database. It is no longer
  updated; this folder is the live copy as of 2026-11-20.
