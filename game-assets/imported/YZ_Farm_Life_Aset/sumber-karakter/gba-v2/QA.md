# Character Pack v2 — QA audit

Date: 16 November 2026. Reviewer: Codex visual inspection plus local asset validation. Scope: generated asset catalog only. This is **not a gameplay release approval**.

## Acceptance checks

| Check | Result | Evidence / limit |
|---|---|---|
| Cast | 16 sheets; A01 main, A02–A16 NPC | Manifest and pack verifier enforce IDs and roles |
| Layout | 12 poses per sheet, four directions | Visual sheet inspection; 3 columns × 4 rows |
| Slicing | Explicit rectangles recorded | Bounds and non-overlap verified against actual PNG dimensions |
| Anatomy | No third hand/arm or extra leg observed in inspected sheets | Visual screening of all 12 poses per sheet; idle side views naturally occlude far limbs |
| Official identifiers | None observed | Civilian clothes, no IKD text, insignia, flags, official lanyards or uniforms |
| Style | Consistent chibi farming-RPG treatment | A01 reused as style anchor; muted civilian palette and dark outlines |
| Identity | Broad features retained | Hair, hijab, glasses and mask where applicable; subtle age/face details simplified |
| Origin | Private reference IDs and SHA-256 recorded by filename | Original sheets and private Drive URLs excluded |
| Rights | Documented; public reuse grant unspecified | See PROVENANCE.md; no invented CC0 license |
| Production | Not integrated | No runtime code, public assets, configuration, production branch or deployment changed by this delivery |

## Per-character visual review

Each row covers front, left, right and back poses, including idle and the two step silhouettes.

| ID | Role | Distinguishing features / clothes | Visual screening |
|---|---|---|---|
| A01 | Main | Messy black hair; cream shirt, navy vest | No extra limbs or official marks observed |
| A02 | NPC | Navy hijab; sage tunic | No extra limbs or official marks observed |
| A03 | NPC | Gray temples, stubble; ochre shirt | No extra limbs or official marks observed |
| A04 | NPC | Blue-gray hijab; blue tunic | No extra limbs or official marks observed |
| A05 | NPC | Rectangular glasses; teal shirt | No extra limbs or official marks observed |
| A06 | NPC | Black hair; orange shirt | Gray textured background rejected; regenerated transparent result re-inspected |
| A07 | NPC | Taupe hijab; olive tunic | No extra limbs or official marks observed |
| A08 | NPC | Low black bun; terracotta blouse | No extra limbs or official marks observed |
| A09 | NPC | Glasses; plum shirt, tan trousers | No extra limbs or official marks observed |
| A10 | NPC | Black hair, strong brows; green shirt | No extra limbs or official marks observed |
| A11 | NPC | Mauve hijab; mustard tunic | No extra limbs or official marks observed |
| A12 | NPC | Short black hair; brick shirt | No extra limbs or official marks observed |
| A13 | NPC | Navy hijab, white mask; lavender tunic | No extra limbs or official marks observed |
| A14 | NPC | Glasses; slate shirt, cream trousers | No extra limbs or official marks observed |
| A15 | NPC | Swept hair; olive overshirt | No extra limbs or official marks observed |
| A16 | NPC | High bun, glasses; rose blouse | No extra limbs or official marks observed |

## Limits that block runtime approval

- These are generated source-resolution pixel-style sheets, not native 16×24 / 24×32 pixel exports. Semi-transparent edge pixels and small colored fringes remain; some sheets also have faint nonzero alpha at sampled corners. Per-sheet alpha statistics and corner checks are in the manifest. Native pixel-grid and alpha cleanup are still required to satisfy ART_DIRECTION.md's strict no-blur standard.
- The three silhouettes per direction supply poses; some step silhouettes are very similar. A polished alternating walk cycle, animation timing, foot sliding and pivot stability have not been validated in motion. Do not label this a finished 4–6-frame walk animation.
- Origin estimates use silhouette bounds, not authored foot markers. Tune pivots and collision boxes after final native export.
- Actual map-scale legibility, doors/trees, lighting, collision, mobile rendering, palette budgets and performance have not been tested because no runtime integration was requested.

## Reproduce structural verification

Run `node scripts/game-assets/verify-character-pack.mjs` and `node scripts/game-assets/verify-catalog.mjs` from the repository root. The first verifies cast, PNG signatures, RGBA type, dimensions, every source-file hash and all frame rectangles. It does **not** infer anatomy or certify motion. The original reference catalog remains private-source metadata, with a link to this 16-character active pack.

Recorded local results: both commands **PASS**. All 16 sheets are 1086×1448 RGBA, laid out as 362×362 cells. A separate local alpha inspection found nonempty silhouettes in all 192 cells and recorded the alpha statistics in the manifest. Output PNG total: 14,584,477 bytes. This is a source art size, not an optimized runtime download budget.
