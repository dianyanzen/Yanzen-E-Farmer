# YZ Farm Life — Game Development Library

**Version:** research & curation v0.1 · 2026-11-16 · **NOT** an imported sprite pack or game-release build.

This folder is the working knowledge base for YZ Farm Life, an original GBA-style, story-rich 2D top-down life simulation based in **Pasirluyu, Regol, Kota Bandung**, with a district discovery system spanning Bandung's 30 kecamatan and an in-game **YZ Phone**.

## Start here
1. [Game Design Document](GAME_DESIGN_DOCUMENT.md) — what we are building, minimum playable experience, and narrative principles.
2. [Art Direction](ART_DIRECTION.md) — 16x16 tile language, portrait view, camera and assets quality gates.
3. [Asset Source Catalog](../../game-assets/catalog/sources.json) — licensed external asset candidates, no vendor binaries imported.
4. [32 Visual References](../../game-assets/catalog/characters.json) — character-sheet inventory from private Drive; no source file export.
5. [Asset Licensing & Integration](ASSET_PIPELINE.md) — safe acquisition, provenance, redistribution, technical optimization.
6. [Tools & Plugins](TOOLS_AND_PLUGINS.md) — installed/connected app tools and external desktop editors.
7. [Technical & Research References](REFERENCE_DOCUMENTS.md) — authoritative links and how they apply to the implementation.
8. [Story/NPC specification](STORY_SYSTEM.md) — event dependency graph, NPC memory and narrative QA.
9. [Bandung Atlas plan](../YZ_FARM_LIFE_BANDUNG_ATLAS.md) — district metadata and geography methodology.

## Asset import status
- **Shortlisted**: 7 external packs, 4 CC0 and 3 free-commercial/restricted-redistribution.
- **Verified owner inventory**: 32 private character visual sheets (A01–A16, C01–C16; C08.jpg).
- **Imported into game runtime from those external packs**: **0**. No claim of visual integration until the files are downloaded, verified, optimized and rendered.
- **Prototype**: local hand-drawn Canvas pixel-art tiles and placeholder NPCs.
- **Next integration gate**: manually obtain source files, preserve licenses, extract chosen frames, verify the exact sprite perspective and test mobile memory/performance.

## Operational safety
- Work in isolated GitHub branch `feat/yz-farm-life-asset-library`, based on the existing Stage 1 prototype.
- Do not merge production, deploy live aliases, write to Supabase farms, or commit source visual references.
- Use descriptive original names and credit metadata in code: avoid Harvest Moon trademarked assets, UI and maps.
- Licensing records are a workflow aid, not a substitute for checking the upstream author's license on download day.

## Commands
```bash
node scripts/game-assets/verify-catalog.mjs
node scripts/game-assets/fetch-cc0-crops.mjs --accept-cc0
```
The second command downloads the CC0 source ZIP into a *gitignored, private staging area*; it does not alter the game or commit binaries.
