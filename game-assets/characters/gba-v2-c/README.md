# YZ Farm Life — C-series character expansion

Short names and fictional `occupation`, `hobby`, and `personality` attributes are in the [character bible](../../catalog/CHARACTER_BIBLE.md) and [canonical cast data](../../catalog/cast.json). Each manifest character links to its profile by stable ID, and the gallery displays its short name.

16 additional fictional NPCs, C01–C16, matching the A01 style anchor from [the original pack](../gba-v2/README.md). The combined cast is **32 characters: A01 is the only main character; A02–A16 and C01–C16 are 31 NPCs**. Original A-series PNGs are unchanged.

## Files and slicing

- `sheets/C01.png`–`sheets/C16.png`: new generated RGBA sheets, 12 poses each, 3 columns × 4 rows.
- `manifest.json`: actual sizes, SHA-256 hashes, frame rectangles, alpha statistics, mobility and source-reference fingerprints.
- `PREVIEW.md`: gallery. `QA.md`: visual findings, checks and runtime limits.
- `prompts.json`: exact built-in image generation prompts. `PROVENANCE.md`: origin and rights record.
- [Combined cast](../../catalog/cast.json): all 32 character IDs and their pack manifests.

Rows are south/front, west/left, east/right, north/back. Columns are step-left, idle, step-right. **C15 remains seated in a manual wheelchair in every pose**, with push-left, idle, push-right columns. Do not animate C15 as walking.

Frame rectangles use `[x, y, width, height]` in source-image pixels. `contentBounds` is `[left, top, right, bottom]` relative to its cell, measured at alpha ≥128. `originPixels` estimates bottom-center in cell-local pixels and needs tuning after native export. Use explicit rectangles and nearest-neighbor rendering. Source-resolution sheets are not native 24×32 game exports or tested collision shapes.

The requested anatomy is two arms/hands and two legs/feet; far limbs can be occluded in profile. C15's legs and shoes remain on the footrests. Clothing has no official IKD/government identifiers or commercial logos. Other people shown in the source sheets are excluded.

## Delivery status

Generated asset staging, matching the previous pack's delivery level. Native pixel-grid/alpha cleanup, authored pivot and walk/roll animation timing, map-scale readability and gameplay checks remain before runtime approval. No production deployment is part of this work.

Run `node scripts/game-assets/verify-character-pack.mjs` and `node scripts/game-assets/verify-catalog.mjs` from the repository root. Original private reference sheets are not included in this repository.
