# Vault Box — Repack Site

Static site (plain HTML/CSS/JS, no build step) for Vault Box Pokémon repacks.

- `index.html`: box lineup (Grail, Nuclear, Obsidian, Spark; Vintage is shown locked as "coming soon"). Click a box to open it and see its price range, every spot, and the possible-pulls checklist for each spot. You can filter by main set, alt art/SIR or promo, search the whole box, and try a just-for-fun "crack a random pull". Also has a near mint / graded condition section and a "Where's my Pokémon?" spot finder.
- `spots.html`: every spot and the Pokémon that come with it, with a filter for each box. Tap a spot to open its checklist.

## Editing

| What | Where |
| --- | --- |
| Prices, taglines, colours | `data/config.js` |
| Possible-pulls checklist | `data/possible-pulls.csv`, then run `python3 tools/build-data.py` |
| Box artwork | `assets/boxes/<edition>.webp` (these were cropped from a screenshot; swap in full-res art with the same names) |

To launch Vintage, set `comingSoon: false` on it in `data/config.js` and add `VINTAGE` rows to the CSV.

## Running locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

## Hosting

This works on any static host. On GitHub Pages, go to Settings → Pages and deploy from the branch root.
