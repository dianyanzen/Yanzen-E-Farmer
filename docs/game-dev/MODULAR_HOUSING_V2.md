# YZ Farm Life — Modular Housing V2 (preview / staging QA)

## Status
Owner-generated artwork uploaded as a **48×48 per-frame indexed PNG atlas**, 4 columns × 2 rows, 192×96 total. This is a reduced-resolution first playable asset, **not** the original 1254×1254 PNG masters.

This iteration changes presentation only. It does not change canonical room coordinates, entrance/exit positions, NPC ownership, quest access, inventory, sleep save transitions, or Supabase state.

## Eight independent visual layers
Atlas path: `public/game/assets/locations/yanzen/housing-atlas-v2.png`

| Frame | Asset | Layer |
|---:|---|---|
| 0 | Yanzen house exterior | outdoor sprite |
| 1 | Yanzen house floor/walls | interior base |
| 2 | Bed, workstation, chest, plants | interior furniture |
| 3 | Yanzen storage shed exterior | outdoor sprite |
| 4 | Shed floor/walls | interior base |
| 5 | Storage racks, farm equipment, baskets | interior furniture |
| 6 | Villager house A | pilot facade: Inggit |
| 7 | Villager house B | pilot facade: Ayu |

Canvas and Phaser share `src/lib/game/housing-v2.ts`. `exteriorHousingSprite` uses existing footprint anchors; `drawHousingInterior` composites background and props without moving gameplay hotspots.

## Design acceptance checklist
- [ ] Exterior has natural proportions relative to Yanzen and visible door anchor
- [ ] Interior has a walkable central area and readable wall vs floor edges
- [ ] Bed sleep prompt appears with existing facing action, and night/day progresses once
- [ ] Shed rack inventory opens and updates stored/carried tools without duplicate state changes
- [ ] Exits return to field at original coordinates
- [ ] Inggit and Ayu still use their existing house IDs, locations and quest prerequisites
- [ ] Both Canvas fallback and Phaser renderers look coherent on desktop/mobile
- [ ] Layered house assets do not overlap HUD or mobile controls
- [ ] Asset catalog matches tracked Git media and no existing assets were deleted

## Limitations
The uploaded atlas is a compressed first-pass 48px preview to minimize staging impact. It is not the full-resolution generated PNG pack. Before visual approval, replace only the visual master/atlas with a higher-resolution properly aligned version if the house feels overly pixelated at the chosen zoom. Do not adjust model collision boxes until real playtest confirms object alignment. The furniture layer is rendered under the character; individual furniture depth and interaction hotspots can be refined after visual QA.
