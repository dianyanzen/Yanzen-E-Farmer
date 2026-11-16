# YZ Farm Life — Character Pack v2

16 fictional characters: **A01 is the only main character**, A02–A16 are NPCs. C-series reference sheets are outside this pack. The separate private-reference catalog remains an inventory of source material, not a playable cast.

## Contents and slicing

`sheets/A01.png` through `sheets/A16.png` are newly generated RGBA art. `manifest.json` records exact image sizes, SHA-256 hashes and all 12 frame rectangles per character. Rectangles use top-left origin and `[x, y, width, height]`. Rows: south, west, east, north. Columns: step-left, idle, step-right. Use the explicit rectangles rather than assuming a fixed source size. `contentBounds` uses `[left, top, right, bottom]` relative to the frame, measured at alpha ≥128; `originPixels` estimates bottom-center of that silhouette in frame-local pixels. These are starting points for pivot tuning, not collision boxes. Render with nearest-neighbor filtering. Art is supplied at generated source resolution; these are not native 24×32 runtime sprites.

The requested anatomy is two arms/hands and two legs/feet in every pose. Side views can naturally occlude a far limb. No government insignia, IKD lettering, official uniform, flags or identification lanyards are intended in the generated art. Each character has civilian clothes, retaining hair/head covering, glasses and broad facial features from the corresponding private reference.

## Status

This is an asset-library delivery, not a runtime integration or production release. Consult `QA.md` for the visual findings and limits. Before gameplay use, normalize to a native pixel grid, align pivots, refine walk timing, and test against the map at actual scale. The generated three-pose layout is not a claim of a polished 4–6-frame walk cycle.

`prompts.json` contains the generation prompts. `PROVENANCE.md` records origin and rights status. Original private reference sheets are deliberately excluded.
