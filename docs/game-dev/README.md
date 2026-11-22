# YZ Farm Life — pustaka kerja game

**Daftar rujukan aktif, 22 November 2026.** Repositori menyimpan game dan web E-Farmer. Isi dokumen yang dibuat lebih awal dapat berupa proposal/historis; jangan menyatakan fitur sudah aktif tanpa melihat kode atau tes.

## Baca ini dahulu (aturan aktif)

1. [AGENTS.md](../../AGENTS.md) — sumber prioritas, batas agen, canonical, lint dan QA.
2. [Player vs Developer](PLAYER_DEVELOPER_CONTENT_BOUNDARY.md) — apa yang boleh ditampilkan ke pemain dan apa yang harus tetap berada pada alat pengembangan.
3. [Game Text Style Guide](GAME_TEXT_STYLE_GUIDE.md) — Humanizer untuk setiap teks dalam game.
4. [YZ Phone Warga & Kronik](YZ_PHONE_WARGA_KRONIK.md) — pengalaman ponsel terkini dan batas data save.
5. [NPC Publication Policy](NPC_PUBLICATION_POLICY.md) — 248 identitas, kameo, bukti dan privasi.
6. [Humanizer Editorial Pipeline](HUMANIZER_DIALOGUE_PIPELINE.md) — alur Codex, review narasi, QA.
7. [Story System](STORY_SYSTEM.md) — aturan naratif, dengan bagian proposal/legacy ditandai.
8. [Standar Potret NPC Aktif](ACTIVE_NPC_PORTRAIT_STANDARD.md) — lima tokoh gameplay, sprite, konsep, delapan ekspresi, dan quality gate (termasuk blocker Widi).
9. [Art Direction](ART_DIRECTION.md) dan [Asset Library Master](ASSET_LIBRARY_MASTER.md) — visual dan manajemen aset.

Skill proyek: `.agents/skills/yz-farm-dialogue/SKILL.md`, `.agents/skills/yz-farm-encyclopedia/SKILL.md`, dan upstream terkunci `.agents/skills/humanizer/SKILL.md`.

## Kebenaran implementasi

- Game: kode di `src/app/game/`, `src/lib/game/`, rute Next.js, registri peta, dan tes aktif.
- Katalog 248: `game-assets/catalog/npc-public-roster.json` dan `public/game/data/npc/index.json`; sumber Character Bible per tokoh `public/game/data/npc/{ID}.json`. **Bukan** `cast.json` 32 yang lama.
- User-facing Warga: `wargaPlayerView`, bukan tampilan otomatis 12 kategori.
- Kronik: hanya kejadian dari save. Draf lore 246 NPC tidak mengaktifkan quest/spawn.
- Staging game Vercel Hobby hanya memakai rute game terpilih; ini bukan bukti semua halaman web pertanian sudah ter-deploy.

## Dokumen perencanaan (bukan mandat runtime)

`GAME_DESIGN_DOCUMENT.md`, `BANDUNG_MASTER_WORLD_BLUEPRINT_v1.md`, `REFERENCE_DOCUMENTS.md`, `TOOLS_AND_PLUGINS.md` dan atlas merupakan gagasan, penelitian dan arah ekspansi. `WEB_INTEGRATION_BOUNDARY.md` menjelaskan **jalur historis** integrasi branch lama — tidak boleh diterapkan langsung ke main sekarang.

Catatan `NPC_ROSTER_PRIVATE_SYNC.md`, `NPC_248_PRIVATE_ENRICHMENT_ROLLOUT.md`, `AUDIT_NPC_DOCKER_DAN_POSTGRES.md` menyimpan **riwayat migrasi**. Gunakan untuk audit asal keputusan, bukan untuk mengganti 248 nama/profesi/potret terbaru.

## Pemeriksaan inti

```bash
npm run chars:public:check
npm run test:game:humanizer
npm run test:game:copy
npm run typecheck
npm run test:game
npm run test:portraits
```

Lanjutkan browser QA untuk halaman Warga, dialog, inventaris, suara, fullscreen, panen, tidur, dan simpan/muat. Pertahankan lisensi serta provenance aset. Penghapusan aset/dokumen wajib didahului audit referensi, tidak karena terlihat belum dipakai.
