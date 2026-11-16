# Game runtime art (approved only)

This directory intentionally has **no imported third-party binary assets** in asset library v0.1.

After a source and license review, place only required optimized output into dedicated `tiles/`, `characters/`, `portraits/`, `ui/`, and `audio/` subfolders, with a recorded source SHA-256 in the asset ledger.

**No private Google Drive reference sheets. No Harvest Moon sprite rips. No restricted standalone asset packs.**

See [asset pipeline](../../../docs/game-dev/ASSET_PIPELINE.md) and [source manifest](../../../game-assets/catalog/sources.json).

Stage 1 uses two local runtime atlases. `characters/stage1.png` contains Yanzen,
Ryan, Nani and Inggit (A01, A03, C01, C08), in that order. Each actor has four
direction rows and three 24×32 frames per row. Rebuild with Python and Pillow
using `python scripts/game-assets/export-stage1.py`. Source hashes and project
usage notices remain in the A/C pack manifests and PROVENANCE files.
`tiles/cucumber.png` is original game pixel art, four 16×16 cells ordered by
plot stage: planted seed, seedling, flowering vine and harvestable cucumbers.
