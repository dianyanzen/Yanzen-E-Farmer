# YZ Farm Life — Asset Redesign, Retention & Removal Protocol v1.0

> **ATURAN MUTLAK TERBARU — 24 November 2026:** Semua aset game termasuk setiap frame animasi, setiap ekspresi NPC, tile, furnitur, bangunan, dan efek **wajib berupa file individual milik satu entitas**, tanpa spritesheet, atlas, sumber gambar gabungan, teknik cutting/cropping dari sheet, atau penggunaan file bersama lintas entitas/instance. Tidak boleh mengemas ulang ke atlas pada runtime. Baca [Atomic Assets & Yanzen Scale Standard](./ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md) dan skill [yz-farm-atomic-assets](../../.agents/skills/yz-farm-atomic-assets/SKILL.md). Kunci skala tubuh dan titik kaki Yanzen di semua animasi. Instruksi historis dalam dokumen ini yang menyarankan atlas, sheet, shared asset, atau cutting **tidak berlaku lagi**. Aset lama dimigrasikan bertahap dan tidak boleh dihapus sebelum QA/rollback.


**Tanggal:** 23 November 2026. **Status:** kebijakan pengelolaan aset yang disetujui pemilik: kurasi menyeluruh A–Z, kualitas lebih penting daripada kuantitas yang tidak berguna, namun *aset berkualitas untuk ekspansi harus tetap dipertahankan*. **Tidak ada otorisasi untuk menghapus aset secara massal hanya dari dokumen ini.**

**Baca dulu:** \`docs/game-dev/YZ_VISUAL_IDENTITY_BIBLE.md\`, \`AGENTS.md\`, katalog aset terindeks, dan file runtime renderer/model terkait.

## 1. Tujuan dan batasan
- Buat identitas estetika game yang khas dan konsisten; aset jelas, tidak terlalu ramai, berfungsi, dan mempunyai alasan berada di lokasi.
- Perlakukan **seluruh aset** sebagai koleksi yang harus dievaluasi, bukan sekadar folder yang perlu dikosongkan.
- Pisahkan **source/master**, **runtime aktif**, **candidate redesign**, **future expansion**, **legacy/historical**, **licensed third-party**, dan **redundant/orphan**.
- Jangan menghapus atau mengganti artwork apa pun yang masih dipakai Canvas, Phaser, UI, NPC, item, komoditas, cutscene, quest, save, atau data katalog sampai ada pengganti teruji.
- Jangan menyamakan jumlah file besar dengan masalah: aset ekspansi berkualitas layak menjadi perpustakaan meskipun belum dipakai.
- Jangan mengubah aplikasi E-Farmer administrasi dalam pekerjaan aset game.

## 2. Klasifikasi aset
| Status | Arti | Kebijakan |
|---|---|---|
| \`ACTIVE_KEEP\` | Dipakai dan sesuai standar | Pertahankan dan dokumentasikan. |
| \`ACTIVE_POLISH\` | Dipakai, masalah minor alignment, palette, collision atau kompresi | Perbaiki dahulu sebelum generate ulang. |
| \`ACTIVE_REDESIGN\` | Dipakai, art style, fungsi atau bentuk fundamental tidak sesuai | Buat blueprint + pengganti, uji staging, baru swap. |
| \`FUTURE_KEEP\` | Berkualitas, kandidat ekspansi | Pertahankan di vault; tidak perlu memasukkannya ke peta sekarang. |
| \`SOURCE_MASTER\` | File sumber HD / PSD / atlas produksi | Jangan hapus karena bukan runtime. |
| \`LEGACY_ARCHIVE\` | Tergantikan tetapi bisa dibutuhkan rollback atau kontinuitas | Simpan dengan referensi riwayat dan versi. |
| \`QUARANTINE\` | Rusak, salah identitas, lisensi/provenance belum jelas, placeholder | Jangan aktifkan sampai selesai QA/izin. |
| \`REMOVE_CANDIDATE\` | Terbukti duplikat tidak berguna/berkualitas buruk dan tidak punya dependensi | Ajukan penghapusan berbasis bukti, jangan otomatis. |

Prioritas visual: **P0** rusak / akses terhalang / collision, **P1** proporsi dan style mismatch, **P2** clutter dan polish, **P3** dekorasi tambahan. Ini bukan lisensi untuk menghapus.

## 3. Inventaris lengkap sebelum penggantian

Audit wajib menelusuri:
1. Lokasi file dan hash SHA-256, resolusi, alpha, kualitas gambar, license, tipe master/runtime, art family.
2. Semua referensi literal maupun dinamis di \`src/app/game\`, \`src/lib/game\`, \`public/game/data\`, \`game-assets\`, test, manifest, skrip generator, spritesheet/atlas maps, cutscenes dan caching.
3. Penggunaan Canvas dan Phaser, skala aktual, world tile, posisi, z-depth, footprint, seasonal/night variants.
4. NPC/quest/item/produk/komoditas terkait. Identitas canonical NPC tidak berubah karena revisi gambar.
5. Master yang perlu dipertahankan, alternatif yang sudah ada, reuse yang mungkin, kualitas dan calon lokasi ekspansi.
6. Potensi hubungan tidak eksplisit (generated atlas / dynamic path / file glob / implicit fallback). Hasil pencarian string nol **tidak membuktikan orphan**.

Dataset audit minimum per entri:
\`assetId, canonicalName, family, sourcePath, runtimePaths[], originalDimensions, displaySize, SHA256, alphaValid, palette, perspective, purpose, activeConsumers[], dynamicConsumers[], relatedNpcIds[], relatedQuestIds[], relatedItemIds[], locations[], license, proposedAction, rationale, reviewer, state, replacementIds[], rollbackPath, qaEvidence[]\`.

Simpan hasil audit sebagai data internal, bukan halaman pemain.

## 4. Matriks keputusan (bukan penilaian estetika otomatis)
Beri penilaian **1–5 dengan bukti** untuk:
- **Readability** pada ukuran UI/game asli;
- **World cohesion**: perspektif, line weight, palet, pencahayaan, kerapatan;
- **Functional fit**: bentuk sesuai pekerjaan/cerita/interaksi;
- **Technical fit**: resolusi, transparansi, depth, footprint, collision, optimasi;
- **Reusability** untuk dunia/ekspansi;
- **Provenance/legal**: sumber dan hak penggunaan jelas.

Satu hard fail keselamatan data/gameplay, lisensi, atau ketidakmampuan memuat file tidak bisa dibatalkan oleh rerata skor tinggi. Jangan menulis angka keyakinan seolah hasil pengukuran kalau penilaian hanya visual editorial.

### Tindakan yang benar
- **Keep**: bagus dan cocok → jangan diutak-atik.
- **Polish**: gambar cocok tapi kurang sejajar → perbaiki layout, shadow, anchor, sprite cropping tanpa men-generate ulang.
- **Redesign**: silhouette/style/fungsi salah → rancang blueprint, buat alternatif minimal satu, bandingkan pada zoom runtime.
- **Consolidate**: duplikat identik → pindahkan referensi ke satu sumber dengan tes.
- **Archive**: punya sejarah/rollback/master → dipertahankan, status eksplisit.
- **Remove**: hanya setelah review dependensi, gameplay QA, backup/rollback, dan persetujuan pemilik.

## 5. Pipeline perubahan A sampai Z

**A — Audit** pemakaian dan kualitas; **B — Baseline** screenshot staging desktop/mobile; **C — Canonical** ID bangunan/NPC; **D — Define** kebutuhan lokasi/fungsi; **E — Evidence** konflik proporsi/visual; **F — Footprint** dan denah tile; **G — Geometry** pintu dan collision; **H — Hotspot** dan interaksi; **I — Illustration** alternatif desain; **J — Justify** setiap dekorasi; **K — Keep** aset bagus; **L — Layers** independen dengan alpha; **M — Master** resolusi penuh; **N — Naming** dan metadata; **O — Optimization** runtime; **P — Preview** 1:1 terhadap avatar; **Q — QA** mobile+desktop; **R — References** audit semua consumer; **S — Staging** dual renderer; **T — Tests** gameplay dan save; **U — UX** readability; **V — Versioning**; **W — World fit** terhadap tetangga; **X — Cross-check** atlas/variants; **Y — YZ signature** direview pemilik; **Z — Zero broken references** sebelum merge dan penghapusan.

### Gate 0 — Sebelum membuat gambar
Tidak boleh generate batch massal tanpa: konsep visual, matriks skala, ukuran footprint, pembagian area padat/tenang, dokumen tempat/objek dan kebutuhan gameplay, contoh dua style variants dibandingkan pada layar game.

### Gate 1 — Sebelum integrasi
Source/master terverifikasi; runtime hasil ekspor, alpha, atlas mapping, collision, path, pintu, layer, lisensi/provenance, metadata serta fallback benar. Jangan membuat gambar dekoratif menjadi fitur aktif tanpa kode gameplay.

### Gate 2 — Sebelum merge/deploy
Build/typecheck dan test game; screenshot before/after masing-masing lokasi, dua renderer, ukuran mobile, siang/malam, karakter di depan-belakang bangunan, jalur pintu, NPC dan save lama. Daftar masalah visual yang masih terbuka harus transparan.

### Gate 3 — Sebelum menghapus
- Pengganti sudah disetujui pemilik dan berjalan pada staging.
- Tak ada pemakaian kode/data/manifes/scene/runtime/CSS/import dinamis yang tersisa, termasuk cutscene/quest/portraits.
- File master dan histori/rollback ada; lisensi/provenance tercatat.
- Katalog aset diperbarui secara deterministik dan tidak ada broken refs.
- Rencana/commit penghapusan **terpisah** dari commit penambahan, mudah revert.
- Penghapusan benar-benar diminta/diotorisasi; **audit tidak sama dengan persetujuan menghapus**.

## 6. Aturan operasional untuk repo saat ini
Katalog awal ada di \`game-assets/catalog/asset-database.json\`, indeks kategori di \`game-assets/library/\`, generator \`scripts/game-assets/build-asset-database.mjs\`, \`asset-category-rules.mjs\`. Verifikasi skema aktual saat menjalankan, bukan mengira metadata di atas sudah tersedia semua.

Khusus penambahan/penggantian:
- Hindari nama file generik seperti \`final2.png\`, \`better-house.png\`; gunakan ID bangunan, versi dan role.
- Sediakan katalog pasangan \`master → exported runtime → atlas frame → buildingId → world placement\`.
- Jangan menghapus file yang dilisensikan pihak ketiga; aturan atribusi tetap berlaku.
- Tidak menghapus aset ekspansi berkualitas hanya karena belum ada di map Pasirluyu.
- Jangan bulk-rewrite 248 NPC atau cerita agar referensi gambar baru cocok dengan nama lama.
- Asset review bersifat iteratif per cluster: rumah/gudang → pasar → gang → sungai → kebun → objek kecil → dunia ekspansi.
- Redesign dapat mengganti proporsinya **bersama** world planning; jangan menaikkan width tanpa menguji ruang antarbangunan.

## 7. Hasil yang wajib ada pada tiap putaran
1. **Before/after** pada ukuran tampil sesungguhnya + daftar aset yang berubah.
2. **Tabel putusan** \`keep / polish / redesign / archive / remove-candidate\` beserta alasan.
3. **Daftar dependensi** dan perubahan fitur yang disentuh.
4. **QA report** (fakta tes otomatis vs pengamatan visual dibedakan).
5. **GitHub branch, commit, PR**, laporan deploy/rollback dan status yang benar (QUEUED/BUILDING/READY).
6. **Daftar kekurangan** yang belum diselesaikan dan prioritas iterasi berikutnya.

## 8. Pengaman khusus
- Tidak ada mass delete dalam tugas desain umum.
- Tidak mengganti identitas wajah, profesi, cerita NPC atau arah cerita hanya untuk menyesuaikan aset.
- Save-schema dan data aktif tidak diubah tanpa migrasi.
- Kode untuk pengelolaan kebun fisik di luar game tidak terkena perubahan.
- Konsep/sketsa yang indah **bukan** aset produksi: harus melalui slicing, alignment, QA, dan pemilihan final oleh pemilik.
