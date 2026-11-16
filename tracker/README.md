# Forever tracker

A leveling tracker for World of Warcraft: Forever, built around dungeon-first leveling:
gather every dungeon quest and its prerequisites, then clear them in one run.

- `data.js` — the character snapshot, dungeon route, Horde quest lists with prerequisites,
  per-slot gear targets and milestones. This is the file to edit when the plan changes.
- `index.html` — the page. It recomputes "Focus now" from the character's level,
  Blacksmithing skill and what has been ticked off.

Open `index.html` in a browser to use it locally (progress is kept in that browser).
The published copy keeps progress in its own shared store instead.

Game data was checked on 2026-11-16 against Wowhead's Forever guides, ForeverDB and Forever Codex.
