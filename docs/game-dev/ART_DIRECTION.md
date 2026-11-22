# YZ Farm Life — Visual and Pixel Art Standard

## Creative brief
**Familiar GBA-era warmth; an original Bandung identity.** The player begins on a fictional farm in **Kelurahan Pasirluyu, Kecamatan Regol, Kota Bandung**. Visual motifs: shallow irrigation channels, cucumber trellises, wet/dry paddy plots, compact kampung gang, modest rooftops, fruit crates, market food stalls and urban building silhouettes. Never duplicate Harvest Moon's copyrighted characters, map layouts, sprites or UI.

**Potret dan ekspresi NPC yang sudah aktif:** gunakan [ACTIVE_NPC_PORTRAIT_STANDARD.md](./ACTIVE_NPC_PORTRAIT_STANDARD.md) sebagai quality gate identitas dan tampilan, khususnya pasangan potret profesi, strip dialog delapan emosi, dan sprite dunia. Jangan merilis ulang wajah Widi dari PR #43 sebelum diselaraskan dengan ekspresi aslinya.

## Mandatory art rules
- **Portrait mobile target:** internal viewport **288 × 512** (target, not yet implemented); keep current 480 × 320 Canvas prototype unchanged until renderer/movement redesign is reviewed.
- **Tiles:** **16 × 16 pixels**. Maps use a consistent 3/4 top-down angle for structures and orthogonal movement.
- **People:** proposed 16×24 or 24×32 sprites, 4 cardinal directions; final size chosen after real visual tests against doors/trees and collision grid.
- **Animation baseline:** idle 1–2 frames; walk 4–6 per direction; interact 2–4; hoe/plant/water/harvest 3–6 each; flexible frame counts if visually coherent.
- **Portrait dialogs:** author high-quality emotion portraits from the **private reference sheets**, then optimize for runtime only. Avoid uploading full 1122×1402 reference sheets to public web.
- **Palette:** warm leaf green, wet-soil umber, beige stone, muted terracotta, rain-blue; urban-neutral buildings. High contrast for dialogue and UI, distinguish wet/dry soil by shape/pattern as well as color.
- **Rendering:** nearest-neighbor filtering, integer camera rounding, no anti-alias smoothing on pixel tiles. Avoid scale factors that cause shimmering.
- **Layers:** terrain → paths/water → soil/crops → props → characters → foreground → interaction → HUD → YZ Phone.
- **Seasonal identity:** Bandung's tropical rainy and relatively drier periods, *not* mandatory four temperate seasons, snow or autumn leaf cycles.
- **Landmarks:** creative silhouettes inspired by documented Bandung sites. Do not use logos or proprietary map tiles without permission.
- **Authenticity:** distinguish verified location names, fictional farm streets, and invented NPC establishments.

## Asset harmonization
Source packs may vary in hue, perspective, shadow and line weight. Do not simply combine all packages:
1. Choose **one primary terrain pack** and **one compatible city pack**.
2. Compare character proportions, roof projection, stroke outlines, shadows and palette.
3. Redraw inconsistent doors, market props and irrigation art into a unified sprite atlas.
4. Normalize to 16px grid; crop transparent margins without shifting pivots; register world-position offsets.
5. Export PNG with alpha, atlas JSON, thumbnails and source attribution IDs.

## Performance budgets (targets, to measure)
- Main entry initial network asset transfer: target 5–15 MB or less; portrait area-specific assets lazy-loaded.
- World tile sheets ideally <256 KB each after optimization, subject to readability.
- 30 districts should load as separate scenes/atlas collections: avoid shipping the entire city on first load.
- Critical 4-direction character controls, interaction targets and phone affordance must be reachable one-handed on mobile.

## Pixel quality acceptance
- Pixel-grid correctness (no subpixel blur).
- All characters readable in foliage and twilight.
- Collision box does not include overhead character sprites or tree canopy.
- Camera framing and UI safe zones at 360×800, 393×852, 430×932 CSS px.
- Player-to-NPC orientation and walk cycles coherent at 2x–4x nearest-neighbor scaling.
- No copyrighted Harvest Moon imagery or restricted third-party asset files added to repository.
