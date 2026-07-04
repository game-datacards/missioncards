# Mission Cards

Print-ready mission cards for Warhammer 40,000 11th edition, available to all, in two sizes: Tarot and standard (MTG) card size.

## Origin

When the 11th edition of Warhammer 40,000 arrived, physical mission card decks were not something every player had easy access to. This project exists to change that: a freely available, community-maintained set of mission cards that anyone can download, print, and bring to the table.

## What's in this repository

The cards come in two sizes, each with a no-bleed and a print-bleed variant. Every variant contains the same decks, including the card backs:

- **[`tarot/no-bleed/`](tarot/no-bleed/README.md)** — Tarot sized cards (70 x 120 mm), no bleed, ready to print and trim at home.
- **[`tarot/bleed/`](tarot/bleed/README.md)** — Tarot sized cards (70 x 120 mm) with print bleed, ready to upload to a print-on-demand service.
- **[`mtg/no-bleed/`](mtg/no-bleed/README.md)** — Standard / Magic the Gathering sized cards (63 x 88 mm), no bleed, ready to print and trim at home.
- **[`mtg/bleed/`](mtg/bleed/README.md)** — Standard / Magic the Gathering sized cards (63 x 88 mm) with print bleed, ready to upload to a print-on-demand service.

In addition, a set of terrain layout cards shows the recommended terrain placement for each mission matchup:

- **[`terrain/`](terrain/README.md)** — Tarot sized terrain layout cards, in no-bleed and print-bleed variants, each with a *with measurements* and a *without measurements* set. MTG sized versions are not available yet.

Each deck lives in its own folder as individual card images, ready for printing. The `card-backs` folder holds the colour-coded reverse sides shared across each deck.

| Deck | Tarot (no bleed) | Tarot (bleed) | MTG (no bleed) | MTG (bleed) |
| --- | --- | --- | --- | --- |
| Attacker Secondary Missions | [View](tarot/no-bleed/attacker-secondary-missions/README.md) | [View](tarot/bleed/attacker-secondary-missions/README.md) | [View](mtg/no-bleed/attacker-secondary-missions/README.md) | [View](mtg/bleed/attacker-secondary-missions/README.md) |
| Defender Secondary Missions | [View](tarot/no-bleed/defender-secondary-missions/README.md) | [View](tarot/bleed/defender-secondary-missions/README.md) | [View](mtg/no-bleed/defender-secondary-missions/README.md) | [View](mtg/bleed/defender-secondary-missions/README.md) |
| Disruption | [View](tarot/no-bleed/disruption/README.md) | [View](tarot/bleed/disruption/README.md) | [View](mtg/no-bleed/disruption/README.md) | [View](mtg/bleed/disruption/README.md) |
| Force Disposition | [View](tarot/no-bleed/force-disposition/README.md) | [View](tarot/bleed/force-disposition/README.md) | [View](mtg/no-bleed/force-disposition/README.md) | [View](mtg/bleed/force-disposition/README.md) |
| Priority Assets | [View](tarot/no-bleed/priority-assets/README.md) | [View](tarot/bleed/priority-assets/README.md) | [View](mtg/no-bleed/priority-assets/README.md) | [View](mtg/bleed/priority-assets/README.md) |
| Purge the Foe | [View](tarot/no-bleed/purge-the-foe/README.md) | [View](tarot/bleed/purge-the-foe/README.md) | [View](mtg/no-bleed/purge-the-foe/README.md) | [View](mtg/bleed/purge-the-foe/README.md) |
| Reconnaissance | [View](tarot/no-bleed/reconnaissance/README.md) | [View](tarot/bleed/reconnaissance/README.md) | [View](mtg/no-bleed/reconnaissance/README.md) | [View](mtg/bleed/reconnaissance/README.md) |
| Take and Hold | [View](tarot/no-bleed/take-and-hold/README.md) | [View](tarot/bleed/take-and-hold/README.md) | [View](mtg/no-bleed/take-and-hold/README.md) | [View](mtg/bleed/take-and-hold/README.md) |
| Card Backs | [View](tarot/no-bleed/card-backs/README.md) | [View](tarot/bleed/card-backs/README.md) | [View](mtg/no-bleed/card-backs/README.md) | [View](mtg/bleed/card-backs/README.md) |

## Printing

All images are PNG files. Pick the size and variant that match the sleeves and printing method you intend to use. Use a **no-bleed** variant to print and trim at home; use a **bleed** variant for print-on-demand services such as MakePlayingCards, which expect a bleed around the finished card.

### Tarot size (`tarot/`)

Designed as tarot sized cards: 70 x 120 mm (2.76 x 4.72 in), roughly 600 DPI at card size, comfortably above the 300 DPI typically required for sharp card printing. Tarot sized card sleeves (70 x 120 mm) fit these cards.

- **No bleed (`tarot/no-bleed/`)** — 1653 x 2833 pixels. Print and trim at home, or print fronts only and sleeve with an opaque backing.
- **With bleed (`tarot/bleed/`)** — 1855 x 3036 pixels, the same artwork extended past the cut line. Best suited to print-on-demand services.

### Standard / MTG size (`mtg/`)

Designed as standard playing card size: 63 x 88 mm (2.5 x 3.5 in), the same size as Magic the Gathering and most trading card games. Standard / poker sized card sleeves (66 x 91 mm) fit these cards.

- **No bleed (`mtg/no-bleed/`)** — 1500 x 2100 pixels, exactly 2.5 x 3.5 in at 600 DPI. Print and trim at home, or print fronts only and sleeve with an opaque backing.
- **With bleed (`mtg/bleed/`)** — 1642 x 2242 pixels, the same artwork extended past the cut line, roughly 600 DPI at card size. Best suited to print-on-demand services.

Print fronts and backs double-sided, or print fronts only and use sleeves with an opaque backing. The colour-coded card backs live in each variant's `card-backs` folder.

### Terrain layouts (`terrain/`)

Tarot sized (70 x 120 mm) terrain layout cards showing the recommended terrain placement for each mission matchup. Every matchup comes as three alternative layouts. They are offered along two axes:

- **Bleed** — `terrain/no-bleed/` (1653 x 2833 px) prints and trims at home; `terrain/bleed/` (1796 x 2976 px) adds a print bleed and cut marks for print-on-demand.
- **Measurements** — a `with-measurements` set prints the placement / movement measurements onto the layout, and a `no-measurements` set leaves them off.

Only Tarot sized versions exist for now; MTG sized terrain layouts are not available yet. See [`terrain/README.md`](terrain/README.md) for the full index.

## Contributing

Contributions are welcome: new decks, corrections, improved layouts, translations. A few ground rules:

- All contributions must adhere to the project license (AGPL-3.0).
- By submitting a contribution you agree that it is licensed under the same AGPL-3.0 terms as the rest of the project. See [CONTRIBUTING.md](CONTRIBUTING.md).
- Open an issue or pull request to get started.

## License

Copyright (C) 2026 the Mission Cards contributors

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). You are free to use, modify, and redistribute this work, provided that you comply with the AGPL terms, including making your modifications available under the same license.

## Disclaimer

This is an unofficial, fan-made project. It is not endorsed by or affiliated with Games Workshop. Warhammer 40,000 and all associated names are trademarks of Games Workshop Limited.
