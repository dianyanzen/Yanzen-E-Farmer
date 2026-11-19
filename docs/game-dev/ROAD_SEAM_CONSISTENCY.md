# YZ Farm Life — Road Seam Consistency v1.1
Date: 19 November 2026 | Scope: Pasirluyu prototype | Release: preview/draft PR

## 1. Reproduced visual defect
The farm uses a baked winding dirt road in `tiles/pasirluyu.png` and a house/yard SVG overlay. A later renderer painted **full 20×20-pixel square road tiles** over two rows (x=17–23, y=10–11), and another rectangular strip at the southern exit (x=18–19, y=13–15). This made the road change from narrow and curved to a gray rectangular slab near the Gang sign. The other three areas drew local roads with inconsistent colors, overlapping calls, and a rectangular market courtyard.

## 2. Single road design system
- ROAD_STYLE lives in `src/lib/game/pasirluyu-master-map.ts`.
- Shared earth-road base = `#ddc38a`, matching the original field tiles.
- Pebble/highlight noise uses **global tile coordinates** (`PASIRLUYU_CHUNKS`).
- Shared portal cross-section = 40 pixels, exactly two 20px tiles.
- Farm east entry is a **clipped, tapered winding approach** from x≈319 to x=480, narrowing back into the old dirt track. At the portal it occupies y=200..240, exactly the Gang western road at y=10..11.
- The southern farm branch uses a separate curved corridor that finishes x=360..400 at its blocked gate (two-tile width).
- Other areas draw their road base **only once**, in the master terrain layer, *before* building and vegetation props.
- Market gets a rounded warm courtyard, rather than paving nearly every tile inside a huge rectangle.
- Scenes that differ substantially visually receive a brief 260ms **crossfade of the outgoing frame to the arriving frame**. `prefers-reduced-motion` disables the effect.

## 3. Physical connectivity
| Portal | Outbound | Entry | Width | Collision |
| --- | --- | --- | --- | --- |
| Kebun ↔ Gang | Field (23,10–11) | Gang (0,10–11) | 2 tiles | open |
| Gang ↔ Pasar | Gang (11–12,0) | Pasar (11–12,15) | 2 tiles | open |
| Gang ↔ Sungai | Gang (11–12,15) | Sungai (11–12,0) | 2 tiles | open |

Crossings are world-adjacent and share the same road material. Closed routes still have blockers and descriptions, never invisible portals. Interior doors retain their behavior.

## 4. Quality gates
- TypeScript build.
- All model and save/story regression tests.
- `npm run test:roads`: six directional exits, collision, shared material, exact world-coordinate continuity, clipped farm roads and market courtyard, correct render order and reduced-motion handling.
- `npm run build` Next.js production build.
- **Not yet validated on a real mobile browser**: visual screenshot review of field east junction, north/south seam, route closures, rain and day/night, crossfade timing, reduced-motion preference, tap-to-walk, cloud reload.
- Production / `main` must remain unchanged until manual signoff.

## 5. Known limitations
This patch removes the abrupt rectangular road stamping and provides consistent road styling **across four currently playable outdoor scenes**. It is not an implementation of a single continuously scrolling 30-kecamatan world. A fully seamless camera crossing (simultaneously rendering both neighboring chunks) still requires multi-chunk streaming and an always-global camera; the 260ms crossfade is an interim visual transition.

The screenshot defect should no longer be a broad rectangular block, but the final aesthetic needs inspection in staging. If residual old art remains, the next step is to regenerate the original landscape base using a single editable tilemap layer rather than hand-painting new masks per scene.
