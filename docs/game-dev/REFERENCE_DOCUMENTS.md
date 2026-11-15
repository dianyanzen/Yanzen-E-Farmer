# Referensi Teknis dan Penelitian — YZ Farm Life

**Kumpulan dokumen sumber terverifikasi, 16 November 2026.** Teks asli tetap berada di situs masing-masing; catatan ini merupakan ringkasan implementasi orisinal, bukan salinan dokumentasi yang berhak cipta.

| Bidang | Dokumen/URL | Bagian yang dipakai dalam proyek |
|---|---|---|
| Renderer 2D | [Phaser 4 Docs](https://phaser.io/oss/docs/) | Opsi pengganti Canvas bila animasi/scene berkembang |
| Kamera portrait | [Phaser Camera Follow](https://docs.phaser.io/phaser/concepts/cameras) | Follow main character, rounding pixel, boundaries per kecamatan |
| Sprite/atlas | [Phaser Loader](https://docs.phaser.io/phaser/concepts/loader) | Preload critical spritesheets; lazy-load per district |
| Peta tiled | [Tiled Documentation](https://docs.mapeditor.org/en/stable/) | Tilesets, object layers, transitions, collision |
| JSON peta | [Tiled JSON Export](https://doc.mapeditor.org/en/stable/manual/export-generic/) | Map export format for browser |
| Collision tiles | [Tiled Tilesets](https://docs.mapeditor.org/en/stable/manual/editing-tilesets/) | tile collision metadata |
| Story branching | [ink open-source narrative language](https://github.com/inkle/ink) | Evaluate compiled authored dialogue and choices |
| Save security | [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) | user-only records, SQL policies, test account isolation |
| Mobile accessibility | [Game Accessibility Guidelines — Basic](https://gameaccessibilityguidelines.com/basic/) | simple controls, subtitles, readable text, no color-only clues |
| Contrast | [W3C WCAG 2.2](https://www.w3.org/TR/wcag/) | text/button contrast, accessible phone UI |
| Licenses | [Creative Commons — CC0](https://creativecommons.org/public-domain/) | understand public-domain dedication limits |
| Sprite editing | [Pixelorama](https://pixelorama.org/) | 4-direction animation, palette and atlas exports |
| Sprite editor alternative | [LibreSprite](https://github.com/LibreSprite/LibreSprite) | GPL-2.0 editor; user artwork is separate |
| Kota Bandung (30 districts) | [Disdukcapil 2025 Bandung Population Profile](https://disdukcapil.bandung.go.id/api/public/uploads/buku-profil/PROFIL_PERKEMBANGAN_KEPENDUDUKAN_KOTA_BANDUNG_2025.pdf) | authoritative administrative names |
| Regol/Pasirluyu | [Regol district information (PPID Bandung)](https://ppid.bandung.go.id/storage/ppid_pembantu/informasi_setiap_saat/ve9fulLtg5MFbsT7FNyBIifzWjxnJ1SBAMRYWOsv.pdf) | origin and 7 official kelurahan |

## Research synthesis and decisions
1. **MVP art pipeline:** Tiled (maps) + Pixelorama (sprites) + a project-specific optimized atlas and source ledger. For stage 1 Canvas renderer, adapt world loader only when image source is ready.
2. **Story system:** authored storylets/ink-like authored branching conditions; persistent NPC memories; no mandatory open-ended generative AI requirement.
3. **Browser architecture:** Next.js UI overlay and Supabase save; game renderer lazily loaded for `/game`; no long-running backend needed for Stage 1.
4. **Data/rights:** no actual IKD or NIK; IKD menu is a fictional character identity; authentic geography does not mean precise private land positions.
5. **Art compatibility:** Kenney Tiny Town uses 3/4 style; compare source shading, roof angle and sprite scale with any farm pack before using together.
6. **Asset licensing:** every downloaded candidate needs a URL, declared author, exact license, date checked, SHA-256, source ZIP metadata and a reviewer.

## Quality gate for each official reference
- Link should be available at audit time; if unavailable, mark NEEDS_RECHECK rather than silently assuming.
- Attribute factual city history to a verified source; do not invent a landmark's administrative placement or access rules.
- Document what was actually implemented versus planned.
