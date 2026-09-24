# CLAUDE.md

Project instructions for Claude Code. These OVERRIDE default behavior.

## Project overview

Print-ready mission card image sets for Warhammer 40,000 (11th edition). The
repo stores exported card artwork (PNG) organized by deck, card size, and bleed
variant. There is no application code — the deliverables are the images and the
per-folder README galleries that index them.

## Repository layout

- `mtg/`, `tarot/` — card sets, each split into `bleed/` and `no-bleed/`
  variants, then into per-deck subfolders (e.g. `disruption/`,
  `priority-assets/`, `card-backs/`).
- Each folder has a `README.md` gallery that references the images by filename.
  Keep filenames stable so these galleries stay valid.
- `scripts/` — maintenance scripts (see below).
- `data/` — English snapshot of the mission pack from
  `game-datacards/datasources` (`data/chapter_approved_2026_2027.en.json`) plus
  `data/source.json` recording the upstream commit and data version. Written by
  the sync workflow; do not edit by hand.

## Datasources sync

`.github/workflows/sync-missions.yml` runs hourly (and on demand). It projects
`11th/gdc/missions/chapter_approved_2026_2027.json` from datasources to English,
drops the version/timestamp fields, and compares it with `data/`. When the
content differs it pushes the new snapshot to the `datasources-sync/missions`
branch and opens (or updates) a PR listing the changed missions and the card
images that need re-rendering. Translation-only and version-only upstream
changes are ignored.

The card artwork is not regenerated automatically: re-render the listed cards,
run the optimizer, push them to the sync branch, then merge. Run the comparison
locally with:

```bash
node scripts/sync-missions.mjs --source <datasources>/11th/gdc/missions/chapter_approved_2026_2027.json \
  --snapshot data/chapter_approved_2026_2027.en.json --out /tmp/sync
```

## Commit author

ALWAYS commit as:

```
GD Developer <develop@gdmissions.app>
```

This repo's `git config user.name` / `user.email` are already set to this. Do
not commit under any other name, and never add a co-author or sign-off.

Other commit rules: imperative mood, short and to the point, no emojis.

## Always optimize images before committing

Card PNGs exported from design tools carry metadata and suboptimal compression.
Before importing/committing ANY new or updated cards, run the optimizer:

```bash
scripts/optimize-cards.sh <folder> [<folder> ...]
```

- Default is LOSSLESS: pixels stay byte-for-byte identical (safe for print),
  files shrink ~2-4x, and PNG metadata is stripped so unchanged re-exports stop
  showing up as git diffs.
- Run it on the affected set(s), e.g. `scripts/optimize-cards.sh tarot` or point
  it straight at a download folder before copying in.
- `--colors N` gives an extra ~10-20% but alters pixels; leave it off unless
  asked.
- Requires `oxipng` (`brew install oxipng`); `--colors` also needs
  `imagemagick`.

Workflow for a new/updated set: copy images into the matching `bleed/` and
`no-bleed/` folders (preserve existing READMEs) -> run the optimizer -> commit.

## Remote

`origin` is `https://github.com/game-datacards/missioncards.git`. Push there
unless told otherwise.
