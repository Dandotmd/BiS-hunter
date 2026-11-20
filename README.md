# WoW Forever Leveling Tracker (local)

Danadin's dungeon-first leveling tracker, run from this folder. No claude.ai account needed.

## Run it

Double-click `start.bat`, or:

```bash
python server.py
```

Then open http://127.0.0.1:8765/. The server only listens on this PC.

## Files (one source of truth each)

| File | What it holds | Who edits it |
|---|---|---|
| `data.js` | The plan: dungeons, quests, gear targets, milestones, open questions | Claude, when the plan changes |
| `state.json` | Your progress: level, professions, quest/dungeon/gear/milestone ticks | The page (every click saves here); Claude may edit it directly |
| `index.html` | The page that renders `data.js` + `state.json` | Claude, for layout/logic changes |
| `server.py` | Serves the folder and saves to `state.json` | Rarely |
| `HANDOFF.md` | Character, preferences, current status and routes for a new Claude session | Claude, at the end of each session |

## state.json keys

- `character`: `level`, `mining`, `blacksmithing`, `firstAid` (numbers).
- `progress`: `d_<dungeon id>` = `"done"`; `q_<quest id>` = `"have"` or `"done"`;
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
- The old claude.ai artifact (`Q13oByuzMcLNFbMFEW93hk`) still exists with its own database. It is no longer
  updated; this folder is the live copy as of 2026-11-20.
