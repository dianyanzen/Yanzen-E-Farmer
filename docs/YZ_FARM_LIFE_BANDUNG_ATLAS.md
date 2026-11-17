# YZ Farm Life — Bandung World Atlas (Stage 1.1)

## Core decision
The playable origin is **Kelurahan Pasirluyu, Kecamatan Regol, Kota Bandung, Jawa Barat, Indonesia**. This is the user's fictional farm setting, NOT a claimed survey of a particular real parcel. The maps are stylized and hand-designed, with real administrative names. Never publish the actual location of a private farm or depict a specific residential property without its owner's approval.

**Administrative reference**: Disdukcapil Kota Bandung, Profil Perkembangan Kependudukan Kota Bandung 2025, pp. 10–11 (30 kecamatan, 151 kelurahan): https://disdukcapil.bandung.go.id/api/public/uploads/buku-profil/PROFIL_PERKEMBANGAN_KEPENDUDUKAN_KOTA_BANDUNG_2025.pdf

**Pasirluyu confirmation**: Kecamatan Regol profile: https://ppid.bandung.go.id/storage/ppid_pembantu/informasi_setiap_saat/ve9fulLtg5MFbsT7FNyBIifzWjxnJ1SBAMRYWOsv.pdf

Regol has seven kelurahan: Ancol, Balonggede, Ciateul, Cigereleng, Ciseureuh, Pasirluyu, Pungkur.

## Map design
- **World atlas:** a stylized Kota Bandung map with 30 districts and actual district adjacency, to be derived from legitimately reusable administrative boundary data. The base map is navigational, **not precise cadastral/GIS**.
- **District scenes:** each kecamatan has one scenic hub with unique NPC/community identity; optional scene expansions by kelurahan. Avoid 30 mechanically identical empty maps.
- **Travel:** discovery on foot within a hub; transit/angkot between districts, loading only needed area assets. Do not fabricate real transport routes, fares or travel times in educational screens.
- **Phone:** 'Jelajah' shows all 30 district names, unlocked/locked play state, real region facts from verified sources, discovery journal and story markers.
- **Photography/education:** optional cultural, culinary, history and geography cards; cite authoritative sources in game credits.
- **Story:** Pasirluyu home farm -> Regol neighborhood stories -> citywide networks; farming remains the central gameplay loop and progress stays in private Supabase game saves.
- **Performance:** portrait camera, internal 288 × 512 target, 16 × 16 tiles. Lazy load district tilemaps, sprite atlases and music.

## Proposed narrative itinerary (NOT completed playable content)
1. **Regol** — fictional Pasirluyu farm, 7 kelurahan; hub near Tegallega (Ciateul) and downtown (Balonggede).
2. **Sumur Bandung** — Braga heritage and city history: photograph buildings, search for archival clues.
3. **Bojongloa Kidul** — Cibaduyut craft and commerce: footwear workshop/market supply quest.
4. **Cibeunying Kidul** — Saung Angklung Udjo in Pasirlayung: respectful arts and music exploration.
5. **Other 26 kecamatan** — unlock progressively, with curated attractions and unique NPC stories.

References: City Tourism Office study (https://patrakomala.disbudpar.bandung.go.id/id/publications/download-document/kajian-pemetaan-potensi-ekonomi-kreatif-pada-lokasi-kampung-wisata-rintisan-di-kota-bandung-tahun-2023); Perwal city heritage inventory (https://jdih.bandung.go.id/media/11492).

### Scope guardrails
- This commit does **NOT** implement 30 playable district maps. Only the starting scene has been renamed to Pasirluyu and all 30 districts can be browsed as a locked/unlocked directory in the in-game phone.
- Distinguish factual geographic names from fictional NPCs, fictional workplaces and creative land use in UI and documentation.
- No government affiliation or approval is implied. IKD in game is a fictional character identity card.
- Original sprite/art/audio are required for recognizable landmarks unless a suitable licensed resource is available. Don't clone copyrighted Harvest Moon maps.
- Actual boundaries should later be sourced from an authorized spatial dataset with clear reuse license, simplified and redrawn, not scraped from commercial maps.
- Release gate: preserve old saved state format; test interactions on portrait mobile before changing camera dimensions or world coordinates.

## Implementation status
Source of truth for 30 kecamatan names and seven Regol kelurahan: `src/lib/game/bandung-locations.ts`.
Current playable region: **Pasirluyu (Regol)**. All other locations are discoverable by name only pending further maps and story content.
