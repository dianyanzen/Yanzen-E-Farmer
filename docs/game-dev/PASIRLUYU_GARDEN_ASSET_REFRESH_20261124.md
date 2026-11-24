# Pasirluyu Field Asset Refresh

**Date:** 24 November 2026  
**Branch:** `feat/pasirluyu-garden-asset-refresh-20261124`  
**Scope:** visual assets and render paths for the active garden field only.

## Visual direction

A warm, lived-in West Java farm: clear cultivation rows, varied cucumber growth, bamboo and woven work objects, visible water care, and enough open ground to move. The KDM/Lembur Pakuan reference is used for rural material and activity cues, not as a literal location recreation.

Research references:
- [Radar Bogor: field work and weed care in Lembur Pakuan](https://radarbogor.jawapos.com/jawa-barat/2610280060/sore-di-sawah-lembur-pakuan-dedi-mulyadi-pegang-arit-dan-beri-pelajaran-soal-tanggung-jawab)
- [Radar Bandung: bamboo fences and woven bamboo craft](https://www.radarbandung.id/2023/09/29/dedi-mulyadi-betah-di-lembur-pakuan-sukadaya-subang-mayoritas-pendapatan-disebar-ke-warga-sekitar/)
- [detikJabar: bamboo fishing poles and community activity](https://www.detik.com/jabar/berita/d-6108709/dedi-mulyadi-mancing-bersama-anak-anak-lembur-pakuan-subang/amp)

## Runtime changes

- Four cucumber growth stages now load as individual files, with one alternate silhouette per stage. A stable tile-coordinate rule alternates variants so same-age plants do not form a repeated checkerboard.
- Dry and watered tilled ground use separate single-tile SVGs. The prior soil atlas remains as a fallback.
- Individual decorative assets for a bamboo crop support, woven harvest basket, caping, and butterfly are registered in the field placement list.
- Existing cangkul and gembor art is placed as scenery only.
- New props carry explicit display bounds and are positioned outside the main approach lane.
- Canvas and Phaser use the same crop-stage and plot-moisture state. Gameplay progression, harvest rules, collisions, NPCs, dialogue, and player-facing wording are unchanged.

## Asset inventory

See `game-assets/catalog/pasirluyu-field-atoms.json` for asset IDs, paths, source checksums, placement bounds, provenance, and QA state. Runtime paths are under `public/game/assets/tiles/farm-kit/kebun/`.

## QA and retention

Runtime screenshots and interaction checks have not yet been performed. Verify the same field view in Canvas and Phaser, including empty/tilled/wet plots, all growth stages, visibility of the aisle, and mobile/desktop scale. Alpha edges are flagged for visual review at runtime size.

The old cucumber and soil atlas files remain in the repository while fallback paths are active. No old field asset was deleted because unused status has not been confirmed across all consumers.
