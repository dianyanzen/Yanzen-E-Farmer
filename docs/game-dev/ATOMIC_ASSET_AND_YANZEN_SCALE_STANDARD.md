# YZ Farm Life — 100% Atomic Assets & Locked Yanzen Scale v1.0

**Keputusan pemilik: 24 November 2026. Status: aturan WAJIB, prioritas tertinggi untuk asset pipeline dan visual character.**
Berlaku lintas scene, semua cabang proyek game, termasuk staged migration dan final production. Tidak berlaku untuk halaman administrasi E-Farmer non-game.

## A. ATURAN ABSOLUT
**1 entitas visual logis + 1 varian/arah/frame + 1 pemilik = 1 file individual.**
Tidak ada penggabungan, berbagi, cropping, atlas untuk source maupun runtime final.

| DILARANG | PENGGANTI WAJIB |
| --- | --- |
| Semua bentuk sprite sheet, tile sheet, texture atlas, contact-sheet runtime, multi-frame WebP | Berkas transparan individual setiap frame / tile / efek / varian |
| Gambar rumah yang sudah mengandung kasur/peti/rak aktif | Base floor/walls terpisah, atap/foreground terpisah, setiap perabot masing-masing satu file |
| Atlas toko 6 bangunan dalam satu PNG/WebP | Setiap rumah, toko, pintu dan fasad sebagai file berbeda |
| Mengambil frame memakai `drawImage(sx, sy, sw, sh,...)` atau `backgroundPosition` | Renderer membaca `image` langsung dari path individual; cropping untuk viewport kamera saja tetap diperbolehkan, bukan mengambil item dari sheet |
| Satu tekstur untuk beberapa karakter/pekerjaan/entitas/instance visual | Path gambar individual dengan identitas owner unik, bukan alias bersama atau duplikasi byte identik palsu |
| Membuat satu gambar grid lalu menggunting setiap objek | Generate/paint satu objek atau satu pose per file sejak awal |
| Membungkus banyak file ke atlas runtime otomatis untuk optimasi | Optimasi file individual, preload berbasis area, lazy loading, HTTP caching, disk/memory profiling tanpa packing |
| Manipulasi skala karakter per frame demi mengejar tinggi bbox | Satu body model skala tetap, foot anchor dan alpha-offset benar, revisi anatomi pose yang salah pada sumber |

Satu file dapat mengandung bagian visual yang menyatu sebagai **satu entitas** (contoh tubuh+busana dalam satu pose Yanzen). Joran, senar, float, shadow, VFX, furnitur, pintu, ikon item lain adalah entitas mandiri dan harus dipisah. Semua file master dan runtime terpisah. Preview multi-panel hanya untuk QA developer dan **tidak boleh menjadi aset produksi**.

**Larangan berbagi identitas:** setiap assetId/ownerId merujuk tepat satu file unik; bahkan jika motif mirip, rekaman per instance dibuat eksplisit dan di-review. Hindari menyalin gambar yang sama hanya demi lolos validasi keunikan path.

**Legacy:** katalog dan kode lama saat ini memang belum patuh; pertahankan untuk kompatibilitas sementara dan label `LEGACY_BLOCKED_FOR_NEW_USE`. Jangan menambah atlas baru. Larangan adalah standar target dan langsung berlaku pada output baru; migrasi lama dilakukan satu cluster demi satu cluster, tanpa merusak save/gameplay.

## B. NOMENKLATUR DAN FOLDER

```text
public/game/assets/
  characters/A01/
    idle/down/frame-000.png
    walk/down/frame-000.png
    run/left/frame-000.png
    turn/up/frame-000.png
    hoe/right/frame-000.png
    fish/cast/down/frame-000.png
  characters/<canonical-npc-id>/<action>/<direction>/frame-NNN.png
  locations/yanzen/
    exterior/house-main.png
    exterior/front-door.png
    exterior/roof-foreground.png
    interior/floor-base.png
    interior/walls.png
    interior/bed-01.png
    interior/wooden-chest-01.png
    interior/computer-desk-01.png
  items/<item-owner-id>/...
  terrain/<location-id>/<tile-or-instance-id>.png
```

Asset manifest per item (JSON) memuat setidaknya:
`assetId`, `ownerId`, `objectId`, `variant`, `direction`, `animation`, `frameIndex`, `runtimeFile`, `sourceFile`, `sourceSha256`, `runtimeSha256`, `canvasW`, `canvasH`, `visibleAlphaBounds`, `pivotFoot`, `worldOffset`, `displayW`, `displayH`, `collisionFootprint`, `interactionHotspot`, `zFootY`, `provenance`, `qaStatus`.
Keunikan manifest: (1) assetId unik, (2) runtimeFile unik, (3) file merepresentasikan satu entitas dan satu frame, (4) tidak ada `sheetRect`, `cropSource`, `frameOffsetInAtlas`, `sharedTextureOwner`.

## C. YANZEN: SKALA TUBUH DAN JALUR ANIMASI

### Bukti 23–24 November 2026
Berdasarkan `src/lib/game/character-frame-bounds.json` pada `feat/pasirluyu-indoor-ux-layout-20261123`:
- Reference visible height: **30 px**, threshold alpha > 50; foot baseline target model **tileY*20 + 18**.
- **Idle:** 72 frame stage1 total (gabungan beberapa tokoh), tinggi bbox 29px (43 frame) dan 30px (29 frame). Jangan menyebut 72 semuanya milik Yanzen.
- **Gait Yanzen:** 48 frame, tinggi bbox 28px (2), 29px (9), 30px (8), 31px (24), 32px (3), 33px (2).
- **Turn Yanzen:** 24 frame, 30px (5), 31px (7), 32px (5), 33px (7).
- **Aksi berkebun:** masih memakai source frame **48×48** yang mencampur siluet tubuh dan alat; butuh audit alpha-body terpisah dan frame individual.
- **Fishing:** pose memakai variasi frame people; butuh pose milik Yanzen yang mandiri untuk cast/wait/bite/reel/success/fail.
- Frame PNG 24×32 vs 32×40 atau 48×48 adalah ukuran kanvas, bukan otomatis badan membesar. Masalah prioritas adalah perpindahan texture, offset, foot anchor, perspektif dan variasi gambar badan.

### Kontrak rendering
1. Gunakan `canonicalBodyScale` tunggal untuk semua frame/scene (sementara referensi silhouette upright ~30 logical px, bukan tinggi canvas). **Tidak stretch** hanya untuk membuat bbox 30.
2. Semua frame menyimpan `groundFootPivot` dalam metadata; posisi dunia pemijak tetap saat idle→walk→run→turn→tool→fish→indoor. Hubungan kepala-pinggul-kaki diukur terpisah dari baju, topi, alat dan pose. Pose crouch/bend tetap anatomis tanpa zoom.
3. Canvas dan Phaser wajib membaca manifest dan transform yang sama. Tidak boleh ada offset terpisah seperti `tileY*20-12` vs `-18` vs `-23` tanpa kalibrasi metadata yang menjelaskan perubahan posture/alat.
4. Skala yang sama pada rumah, gudang, pasar, sungai, jalan, kebun, day/night. Avatar tidak berubah size saat portal, pergantian tindakan, atau transisi frame.
5. Batas penerimaan: **toleransi 0–1 px** untuk top-of-head / foot contact pose berdiri ekuivalen (dibanding pada world zoom yang sama); perubahan tinggi karena lutut menekuk atau tubuh condong harus masuk akal dan dianotasi di metadata. Tidak ada teleport/popping titik kaki pada pergantian animasi.
6. Hitung `alpha-body bounds` terpisah dari alat/efek. Normalisasi posisi melalui `footPivot`, bukan crop gambar komposit. Untuk aksi, joran/senar/pelampung/VFX adalah aset milik aksi dengan file mandiri, dan world attachment point ke tangan.
7. Ukur manual setiap arah dan frame yang tidak sesuai anatomi; perbaiki/re-generate frame mandiri tersebut. Jangan mengubah proporsi seluruh karakter setiap kali salah satu frame meleset.

## D. URUTAN MIGRASI YANG AMAN
P0: Yanzen animation pipeline (idle/walk/run/turn/hoe/seed/water/harvest/fishing) → seluruh frame individual, foot-pivot dan dual renderer.
P0: Rumah Yanzen floor/walls/pintu/kasur/peti/meja/rak/lemari terpisah, collision/hotspot per objek.
P1: Gudang Yanzen dan seluruh dekorasi/alatnya mandiri.
P1: Enam bangunan pada housing-market HD dan tiap objek pasar punya file individual.
P1: NPC aktif dan strip 8 ekspresi per tokoh → satu file per ekspresi; tidak menyamakan orang yang berbeda.
P2: Terrain/plot/komoditas/hewan/ikan/props/efek dan semua media lainnya mengikuti katalog per owner.
P3: Ekspansi Bandung, individu per bangunan/lokasi/instance.

Jangan rewrite massal sekaligus, jangan hapus sumber sebelum referensi game / TS / CSS / JSON / SQLite / dynamic resolver / save / story / UI terverifikasi. Perubahan file visual tidak boleh mengubah nama NPC, quest, ekonomi, atau save schema diam-diam.

## E. QA/ENFORCEMENT
- *Audit pengembang:* inventaris semua `.png/.webp/.svg`, `load.spritesheet`, `drawImage` source rect, `background-position`, `atlas`, pemetaan `texture frame`, texture yang di-alias dua owner; identifikasi setiap pelanggaran legacy dengan lokasi dan consumer. Bedakan crop kamera dari crop sprite sheet.
- *Manifest validator (target migrasi):* reject duplicate owner/path, multi-frame metadata, source crop, master komposit, file 404, missing frame, ukuran berubah yang tidak dianotasi; fingerprint konten diperiksa untuk duplikasi byte-identik lintas owner sebagai RED FLAG.
- *Scale Lab:* keluarkan tabel bbox dan pivot setiap pose dan semua arah, image side-by-side tiap transisi pada zoom 1:1, 2×, 3×, Canvas, Phaser, mobile dan desktop.
- *Uji gameplay:* lintasan dari pintu ke semua benda aktif tanpa collision invisible; cek semua NPC, quest, toko, panen, minigame, save lama, kamera, UI, FPS, request count, peak memory dan loading.
- *Stop gate:* tidak boleh mengklaim compliant/production ready tanpa tes dan inspeksi langsung, atau menghapus atlas lama sampai consumer semua dimigrasikan.

## F. PRIORITAS ANTAR DOKUMEN
Jika dokumen sebelum 24 Nov 2026 menyebut "build atlas", "one sheet per scene", "crop atlas", "frame sheet untuk animasi" atau "dedup shared asset", **aturan di dokumen ini mengalahkan saran historis tersebut**. Pertahankan dokumentasi lama sebagai bukti kondisi sebelumnya, tetapi implementasi baru harus individual. Skill wajib: `.agents/skills/yz-farm-atomic-assets/SKILL.md`.

Status saat aturan ini dibuat: **policy tersimpan, migrasi runtime belum selesai**. Adopsi aturan tidak berarti seluruh binari legacy telah dipisah.
