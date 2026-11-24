# Rumah Yanzen & Gudang — Redesign Work Brief

**Date:** 24 November 2026  
**Branch:** `feat/yanzen-home-shed-kdm-redesign-20261124`  
**State:** first modular interior pass integrated in Canvas and Phaser; pending in-game visual and interaction QA.

## Scope

Redesign the Rumah Yanzen and Gudang Peralatan cluster as the first visual and usability pilot for a warm, lived-in Sundanese farming-life setting, informed by the greenery and community atmosphere associated with KDM/Lembur Pakuan. The game remains a contemporary farming-life world.

Locked: NPC identities, portraits, sprites, clothing, dialogue, all player-facing language, quest/save/economy behavior, and farm-administration app.

## Verified baseline from the 23 Nov screenshot audit

- **Gudang is P0 usability:** the room is visually crowded around its edges and the lower doorway is close to a crate. The redesign should preserve storage access and open a clear carry aisle from the door to the rack.
- **Rumah Yanzen is P1 polish:** the center floor is mostly open, but lower-left decorative objects compete with movement and the bed/storage functions can read ambiguously. Reorganize around sleep, work, storage, and a clear route.
- Existing world interactions are tied to artwork bounds. Current model coordinates include exterior doors at field tiles `(3,4)` and `(9,4)`, bed at home tile `(9,7)`, and tool rack at shed tile `(9,7)`. Keep these stable unless a separately reviewed blueprint and runtime change prove necessary.
- Existing composite files are still referenced by Canvas/Phaser loaders and game asset checks:
  - `public/game/assets/pasirluyu/rumah-yanzen-interior-day.svg`
  - `public/game/assets/pasirluyu/rumah-yanzen-interior-evening.svg`
  - `public/game/assets/pasirluyu/gudang-interior.svg`
  They are active legacy consumers, not removal candidates yet.

Evidence: `docs/game-dev/ASSET_VISUAL_AUDIT_20261123.md`, `src/lib/game/model.ts`, `src/app/game/game-client.tsx`, `src/lib/game/phaser-world.ts`, and `tests/game-stage1.mjs`.

## Visual and spatial brief

### Exterior cluster

- Preserve the existing footprint and door destinations while auditing the approach path and collision.
- Make the house and tool shed read as two related, modest farm buildings with distinct functions.
- Use restrained KDM-inspired environmental cues: shade trees, bamboo as a small screen/fence detail, a lived-in veranda, planted edges, rain-aware roof/eaves, and a modest wood detail.
- Keep the approach legible and uncluttered. Avoid a palace, tourist-village display, or dense ornamental façade.

### Rumah Yanzen interior

- Keep the bed within its current interaction region and make its sleep function visually clear.
- Organize the room into sleep, work, and storage zones. Keep a direct, unobstructed route from entrance into the open center and toward each usable object.
- Treat the modern farmer/technology identity as a natural part of the room; do not add new labels or alter the YZ Phone interface.
- Move decorative items away from the movement lane and active hotspots.

### Gudang interior

- Prioritize a continuous clear aisle from entrance to the current rack hotspot.
- Group individual props by practical use: hand tools, irrigation, seed/harvest containers, and work surface. Keep the floor near the doorway and aisle clear.
- Retain only the objects supported by current gameplay as interactive. Decorative tools and containers must not imply new mechanics.
- Use the warm wood/earth palette and selective local details, with lower visual density than the current screenshot.

## Asset production contract

- Produce one object/instance/variant per independent transparent image file; no combined-room artwork, packing, atlas, sprite-sheet, or cropping.
- Separate floor, wall, door, bed, desk, chest, shelf/rack, tool props, shadows, and decorative objects. Give each distinct placed instance its own asset ownership and manifest record.
- Before production, record building footprint, perspective, display bounds, floor plan, collision, hotspot, z-depth, door threshold, walkable route, and source provenance.
- Use the existing visual identity bible and world-scale contract for palette, pixel density, avatar scale, indoor/outdoor consistency, and viewport review.

## Work order and gates

1. Capture current house/shed at the same game zoom and viewport; record renderer, time-of-day, player position, and interaction state.
2. Produce a floor-plan blockout for both interiors and the exterior connection. Verify the current bed and rack hotspots and the paths to them.
3. Compare the visual direction at game scale against the current character and neighboring outdoor art. Concept boards are review references only; they are never runtime assets.
4. Generate/paint individual replacement assets, one entity per file, with unique owner IDs and manifest entries.
5. Integrate per-file loading in Canvas and Phaser; retain legacy fallback only while both renderers are being migrated.
6. Verify entrance/exit, collision, reachability, depth/occlusion, bed sleep action, rack storage action, save compatibility, mobile and desktop, day/evening.
7. Only after replacement QA and approval, remove the old composite consumers and files in a separate, reversible cleanup commit.

## Retention decisions for this cluster

| Existing asset group | Initial decision | Reason |
| --- | --- | --- |
| House day/evening composites | `ACTIVE_REDESIGN / LEGACY_BLOCKED_FOR_NEW_USE` | Still loaded at runtime; migrate consumers before removal. |
| Gudang composite | `ACTIVE_REDESIGN / LEGACY_BLOCKED_FOR_NEW_USE` | Crowded layout and composite format; still loaded at runtime. |
| Strong unique items/details not used in the current room | `FUTURE_KEEP` pending inspection | Unused does not by itself mean low quality or unnecessary. |
| Proven orphan/redundant cluster assets | `REMOVE_CANDIDATE` only after dependency, catalog, and rollback checks | No deletion based solely on filename search. |

## Acceptance evidence

- Before/after screenshot pair at the same zoom for exterior, home interior, and shed interior.
- At least one character position at each doorway and beside the bed/rack.
- Walkable route and interaction checks; no furniture overlap, invisible blocking, clipping, or broken path.
- Canvas/Phaser parity and mobile/desktop visual checks.
- Asset manifest validation and a complete old-path → replacement-path dependency list.
- Report distinguishes automated checks from visual review. No claim of production readiness until evidence exists.


## Implemented on the feature branch

- Added unique architecture layers for the Rumah Yanzen floor/wall and Gudang floor/wall.
- Added separate PNGs for the bed, worktable, woven cabinet, tool rack, and shed workbench. Added the independent asset manifest at `game-assets/catalog/yanzen-home-shed-atomic-manifest.json`.
- Added `src/lib/game/yanzen-interior-art.ts` as the shared placement map. Both Canvas and Phaser load each item as an individual file; no sprite sheet or crop is used for this room set.
- The shed layout leaves the middle approach open. The bed and rack retain their existing hotspot tiles `(9,7)`.
- Kept existing day/evening house and shed composites as fallback. They remain in use until the new rooms are visually verified and the fallback/dependency checks are complete.
- NPC data/art, dialogue, language, and gameplay interactions were not intentionally changed.

## Remaining before cleanup or merge

- Run the game in Canvas and Phaser, capture the same-view before/after, and check entry/exit, bed sleep, rack access, room scale, transparent edges, and phone/desktop layouts.
- Verify the generated PNG alpha edges at runtime scale and adjust object bounds/placement if needed.
- Update asset lifecycle/catalog references after QA.
- Do not delete the legacy composites until every runtime and validation consumer has migrated; make cleanup its own reversible change.
