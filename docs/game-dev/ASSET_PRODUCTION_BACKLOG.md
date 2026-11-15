# Asset Production Backlog — First Cut

## Priority 0: license and source readiness
- [x] List 32 private character sheets; no image copies in public repository.
- [x] Curate seven candidate source packs; note CC0 vs restricted redistribution.
- [x] Document primary art direction and technical sources.
- [x] Add automated metadata validator and opt-in CC0 ZIP staging downloader.
- [ ] Download first CC0 crops ZIP on a network-enabled developer machine and verify SHA-256 plus internal LICENSE file.
- [ ] Download Kenney Tiny Town and Pixel UI only from official creator pages.
- [ ] Manually review each reodesuxz archive/license before game embedding; no raw pack mirroring.

## Priority 1: portrait Pasirluyu prototype visual vertical slice
- [ ] Screenshot audit current landscape game and retain baseline.
- [ ] Convert camera only after image-ready tile pipeline, to target 288×512 (16:9 portrait) using 16×16 tiles.
- [ ] Produce **one** original 16px terrain atlas: grass, wet soil, path, water, crop trellis.
- [ ] Derive 5-stage cucumber growth from CC0 source, using a stage adapter compatible with 4-step existing game state.
- [ ] Create main character 4-direction 4-frame walk (no reference sheet copying).
- [ ] Pixel-art NPC Raka (A01 reference), Bu Sari (C01 reference) and Naya (C08 reference), with original outfits.
- [ ] Sprite dialogs portrait for these 3 NPCs, with 3 expressions each.
- [ ] Build story-dedicated props (photo of old irrigation canal, letter in warung) not generic fetch-quest icons.
- [ ] Test camera and YZ Phone on mobile screen sizes 360×800, 393×852, 430×932 CSS px.
- [ ] Verify save compatibility after panning/retiling.

## Priority 2: Bandung urban identity assets
- [ ] Original Pasirluyu area direction signs with factual administrative naming.
- [ ] Warung and alley tiles with Bandung-local visual motifs, not reproductions of a specific private property.
- [ ] Regol story hub / seven authentic kelurahan labels and portal markers.
- [ ] In-game phone: stylized authentic district discovery map, no deceptive real-time location or real-world GPS data.
- [ ] Choose one transport mode design for district travel (fictional routes clearly marked).

## Priority 3: reusable content expansion
- [ ] Create a Character Bible for all 32 reference IDs, unique jobs and social relationships.
- [ ] Implement NPC asset animation and atlas import interface.
- [ ] Populate the first ten storylets with event conditions and alternate endings.
- [ ] Add photo, chat and notifications assets within 5–15 MB initial target.
- [ ] Maintain an attribution screen and record original creators even when CC0 does not require credit.

## Release gates
- No new license ambiguities.
- Mobile portrait game remains playable using one-handed controls.
- UI and NPC tiles don't vanish or blur under device pixel ratios.
- TypeScript, lint, deterministic game tests and asset catalog audit pass.
- Browser cloud save and restore verified with at least two distinct accounts.
- Production alias remains untouched until explicit release approval.
