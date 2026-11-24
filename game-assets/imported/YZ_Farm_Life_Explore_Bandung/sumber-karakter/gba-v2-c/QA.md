# C-series expansion — QA audit

Date: 16 November 2026. Reviewer: Codex visual screening and local structural validation. Delivery level matches the A-series source-art pack; this document is **not runtime release approval**.

## Scope and method

Inspect every generated sheet visually for its four directions, 12 poses, complete silhouettes, anatomy, identity cues and excluded identifiers. Check no third arm/hand or extra leg is visible. Natural occlusion in profile is allowed. Preserve C15 as a seated wheelchair user, with two legs/shoes at the footrests and two arms/hands; hands and wheels need a separate motion review before gameplay.

Structural checks must independently verify 16 C-sheet IDs, 192 nonempty frame rectangles, PNG dimensions, RGBA type, bounded non-overlapping rectangles and every SHA-256. The combined cast must have 32 unique IDs, exactly one main character (A01), 31 NPCs and correct pack links. Source images stay private; C08's original is JPEG while its generated output is PNG.

## Runtime limits

- Generated source-resolution pixel-style images are not authored native 16×24 / 24×32 exports. Semi-transparent edges and small colored fringes require cleanup, matching the limitation already recorded for A-series. Alpha/corner statistics are in the manifest; RGBA format alone does not certify clean alpha.
- The actual source canvases can differ from the prompt's requested size and from A-series. Use recorded frame rectangles, not a hard-coded cell size. Native scale and palette harmonization are still required.
- Step poses can be visually similar. Alternating walk/roll motion, wheel rotation, hand-to-rim contact, timing and foot sliding are not validated in a running game. The three poses per direction are not a polished 4–6-frame animation claim.
- Bottom-center origins are computed silhouette estimates, not authored foot/wheel anchors or collision boxes. Tune these after native export.
- Map-scale legibility, doors/trees, lighting, collision, mobile rendering and performance are not tested. No runtime files or production deployment are part of this expansion.
- Broad facial/age features are simplified by sprite style. Public reuse rights are unspecified; see PROVENANCE.md.

## Verification commands

`node scripts/game-assets/verify-character-pack.mjs` validates both packs and the combined cast. `node scripts/game-assets/verify-catalog.mjs` validates the source inventory. Structural validation does not automatically count limbs or certify motion; visual screening is recorded below.

## Recorded visual screening

All 16 sheets were opened and visually inspected, covering all 12 poses in each. No extra arm/hand or extra leg was observed. No official IKD/government marks, commercial logos, extra people or held objects were observed. Age and broad identity cues remain recognizable, with stylized simplification. Side/rear views can occlude limbs or glasses naturally.

| ID | Distinguishing reference cues | Result |
|---|---|---|
| C01 | elderly woman age 65, gentle wrinkled face, beige hijab | Four directions present; no extra limbs or excluded marks observed. |
| C02 | mature man age 42, short wavy black hair, light stubble | Four directions present; no extra limbs or excluded marks observed. |
| C03 | elderly man age 70, gray hair and mustache, oval glasses, tan flat cap | Four directions present; no extra limbs or excluded marks observed. |
| C04 | woman age 31, dark brown high bun, side fringe | Four directions present; no extra limbs or excluded marks observed. |
| C05 | teenage boy age 17, tousled short black hair, cheerful face | Four directions present; no extra limbs or excluded marks observed. |
| C06 | young woman age 21, pale gray hijab, round glasses | Four directions present; no extra limbs or excluded marks observed. |
| C07 | young man age 27, swept wavy black hair | Four directions present; no extra limbs or excluded marks observed. |
| C08 | woman age 29, black high bun, friendly face | Four directions present; no extra limbs or excluded marks observed. |
| C09 | young man age 26, wavy black hair, round glasses | Four directions present; no extra limbs or excluded marks observed. |
| C10 | man age 30, neat wavy black hair | Four directions present; no extra limbs or excluded marks observed. |
| C11 | young man age 23, messy short black hair | Four directions present; no extra limbs or excluded marks observed. |
| C12 | woman age 30, beige hijab | Four directions present; no extra limbs or excluded marks observed. |
| C13 | mature man age 54, gray temples, mustache, small goatee, rectangular glasses, plain black peci cap | Four directions present; no extra limbs or excluded marks observed. |
| C14 | young man age 28, short side-swept black hair, plain olive helmet with no logo | Four directions present; no extra limbs or excluded marks observed. |
| C15 | young adult man age 27, short wavy black hair, rectangular glasses, seated in manual wheelchair | Seated wheelchair preserved in all directions; no extra limbs observed. |
| C16 | woman age 27, long wavy dark brown hair | Four directions present; no extra limbs or excluded marks observed. |

C15's backrest hides the lower body from the rear; this is natural occlusion, not removal of the legs. Wheelchair representation is preserved. Accurate wheel motion and push mechanics still require a runtime animation review.

## Recorded structural result

Both verification commands **PASS** locally. The C expansion has 16 RGBA sheets and 192 nonempty slicing cells; both packs together have 32 sheets and 384 frame rectangles. All output file hashes match their manifests. The combined cast has A01 as its sole main character and 31 NPCs. The A-series art pack is unchanged from the previous delivery; originals remain private.

All C canvases are 1055×1491 pixels. Rounded cell boundaries are stored explicitly in the manifest. Total C PNG size: 14,757,200 bytes, before any native export or runtime optimization. Some sampled corners have faint nonzero alpha; see the per-sheet alpha audit and cleanup requirement above.

