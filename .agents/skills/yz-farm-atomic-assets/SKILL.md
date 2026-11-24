---
name: yz-farm-atomic-assets
description: Aturan wajib 100% individual file per aset dan per frame animasi untuk YZ Farm Life, tanpa atlas/spritesheet/cutting/berbagi gambar antar-entitas, serta penguncian skala dan titik kaki Yanzen pada seluruh animasi. Trigger setiap perubahan artwork, karakter, NPC, animasi, tiles, gedung, furnitur, HUD, efek, dan loader.
---

# YZ Farm Life — Atomic Assets Extreme (WAJIB)

**Keputusan pemilik: 24 November 2026.** Tingkat aturan: HARD REQUIREMENT untuk seluruh aset baru, revisi, migrasi, dan semua output runtime final. Baca `AGENTS.md`, `docs/game-dev/ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md`, `docs/game-dev/YANZEN_ANIMATION_SCALE_AUDIT_20261124.md`, `docs/game-dev/YZ_VISUAL_IDENTITY_BIBLE.md`, dan `WORLD_SCALE_AND_PROPORTION_STANDARD.md`. Dokumen lama yang menyarankan atlas untuk optimasi bukan pengecualian.

## 1. Kebijakan absolut: satu entitas visual / varian / frame = satu file independen
1. **DILARANG** memproduksi, menyimpan sebagai keluaran final, memuat, atau merakit: spritesheet, texture atlas, contact sheet sebagai asset game, grid beberapa barang, potongan `drawImage(sx,sy,sw,sh,...)` untuk mengambil satu benda dari gambar lain, `background-position` untuk memotong ekspresi, atau komposit furnitur-interior sebagai sprite tunggal.
2. **DILARANG SHARED ASSET**: dua objek/karakter/skin/gerak/ekspresi/varian/instance yang berbeda tidak boleh mengacu ke satu file gambar. Setiap identitas aset memiliki file unik dan metadata pemiliknya sendiri. Jangan menyalin byte identik hanya untuk menyiasati aturan; produk visual harus benar-benar disengaja untuk instance itu. Penggunaan berulang objek dalam peta harus diinventarisasi dan dimigrasikan per instance, bukan diasumsikan sudah patuh.
3. Background lantai/dinding, atap/occluder, bayangan, pintu, furnitur, alat, hasil panen, material terrain, papan, tanaman, tiap ikan, tiap emosi NPC, efek, dan **tiap frame tiap arah tiap aksi** harus berdiri sendiri sebagai file PNG transparan (atau format terpisah lain yang disetujui dengan dukungan alpha). Satu PNG boleh memuat bagian anatomis dari **satu** pose karakter (tubuh + pakaian dalam satu pose), tetapi tidak boleh berisi beberapa frame atau beberapa entitas logis.
4. Desain/edit file harus dikerjakan **satu objek per generasi** dengan referensi visual untuk konsistensi, bukan generate contact sheet lalu crop. Artefak referensi/storyboard untuk peninjauan boleh multi-panel tetapi **tidak boleh menjadi source-of-truth atau runtime asset**.
5. Asset yang sudah tampak baik boleh direproduksi ulang setia sebagai file individual; jangan mengubah identitas, pekerjaan, palet/umur wajah NPC, cerita, dan save hanya untuk migrasi format.
6. Legacy sheet/atlas masih ada sampai setiap referensi berhasil dimigrasikan. Status wajib `LEGACY_BLOCKED_FOR_NEW_USE`; ini **bukan pengecualian permanen** dan tidak boleh menjadi dependensi aset baru. Penghapusan lama hanya setelah QA dependensi dan rollback.
7. **Tidak boleh menyiasati ketentuan** lewat data URI berisi sheet, SVG berisi beberapa benda, CSS masking dari sheet, WebP grid, hidden temporary atlas runtime, atau loader yang secara diam-diam mengemas file ke atlas dinamis. Texture cache yang hanya menyimpan satu file untuk pemilik tunggal diperbolehkan; packing texture/alias bersama lintas pemilik tidak.

## 2. Identitas file dan manifest
- Nama path mencerminkan **ownerId + objectId + variant/action + direction + frame index**, misal `characters/A01/walk/down/frame-0001.png`, `locations/yanzen/interior/bed-01.png`, `locations/yanzen/interior/chest-01.png`.
- Setiap item punya `assetId`, `ownerId`, `objectId`, `sourceFile`, `runtimeFile`, `frameIndex` (bila bergerak), `action`, `direction`, `variant`, `canvasSize`, `visibleAlphaBounds`, `footAnchor`, `bodyReferencePx`, `drawOffset`, `displaySize`, `footprint`, `hotspot`, `zDepth`, `sourceSHA256`, `runtimeSHA256`, `status`, `consumers`, dan `qaEvidence`.
- Satu `runtimeFile` dimiliki tepat satu `assetId`; tidak ada `assetId` menunjuk sub-rectangle dari gambar lain; tidak ada satu file berisi beberapa item. Pemakaian di banyak render pass untuk **entitas fisik yang sama** dapat menggunakan pemilik yang sama, bukan berbagi lintas entitas.
- File master resolusi tinggi juga dipisah per entitas. Source PSD berlapis untuk sebuah objek boleh dipertahankan sebagai dokumen kerja, tetapi export finalnya tetap atomik.
- Loader menggunakan file URL untuk masing-masing aset, `load.image`/equivalent untuk setiap frame, lalu membangun animasi sebagai **daftar frame file mandiri** (tanpa `load.spritesheet`).

## 3. Kontrak Yanzen — ANATOMI & SKALA LOCK
- Baseline terukur saat ini: `idle` 29–30px (72 frame seluruh stage1; Yanzen bagian di dalamnya), `gait` 28–33px (48), `turn` 30–33px (24), referensi 30px; data `character-frame-bounds.json` pada branch `feat/pasirluyu-indoor-ux-layout-20261123`. Angka ini adalah tinggi bbox alpha, bukan selalu tinggi anatomi.
- **Tinggi berdiri netral, skala kepala/torso/kaki, lebar bahu, identitas, pakaian, dan proporsi di semua animasi wajib konsisten**. Perubahan pose (melangkah/menekuk/menunduk) boleh mengubah bbox sementara dengan alasan anatomi; **dilarang** memanjangkan/mengecilkan seluruh tokoh untuk menyeimbangkan tiap frame.
- Satukan coordinate system: tile dunia 20px, avatar foot-contact world coordinate yang sama untuk Canvas dan Phaser, `origin` di kaki, pivot/offset per frame berbasis visible-alpha, bukan ukuran canvas sheet. Tinggi frame PNG tidak menentukan tinggi tubuh. Jangan mengganti zoom/scale saat animasi atau pindah lokasi.
- Pisahkan tubuh, efek, joran dan pelampung dari art frame lain bila merupakan entitas independen. Untuk fishing, tangan/pose tubuh punya frame unik per tahap casting/waiting/bite/reeling/success/fail, dengan satu body scale; senar/riakan diposisikan relatif ke tangan dan titik air.
- Idle, walk, run, turn, action hoe/seed/water/harvest, fishing, indoor/outdoor semua wajib melewati `character scale lab` yang sama. Aksi 48×48 historis tidak boleh mengubah ukuran Yanzen.
- Metode QA: ukur bbox pixel-alpha (> threshold yang didokumentasikan), line of ground contact, top-of-head pada pose upright, pivot kaki, delta posisi frame-to-frame, shoulder/hip proportions. Simpan laporan histogram per animasi, side-by-side pada zoom dunia, screen recording Canvas/Phaser/mobile. Uji tidak ada popping > 1px pada stance yang setara; variasi kepala saat membungkuk dinilai secara pose, bukan dipaksa angka tetap.

## 4. Prosedur produksi satu-per-satu
1. Audit sumber, status digunakan, asal, kualitas, size, placeholder/crop, semua ref langsung dan dinamis.
2. Tentukan assetId unik, fungsi interaksi/owner, perspektif, skala acuan Yanzen dan blueprint denah/collision.
3. Generate/paint **tepat satu entitas atau satu frame** pada satu canvas tanpa item lain, transparan, proporsi konsisten dengan style reference; catat varian dan identitas.
4. Simpan master & export runtime individual, tambah manifest unik (bukan atlas). Periksa background alpha, tidak ada checkerboard permanen.
5. Integrasi loader per file, depth berdasarkan kaki, collider footprint, trigger/hotspot sesuai objek. Tidak ada slicing.
6. QA otomatis duplicate path/duplicate art/provenance, pose metrics, file exist, scene coverage, performance requests/memory (lazy loading per scene; kompresi individual, bukan packing).
7. QA manual fungsi, rute, clipping, interaksi, dua renderer, portrait mobile/desktop, siang/malam, save lama, ekonomi/quest. Review screenshot/video.
8. Promosikan setelah QA dan persetujuan. Pertahankan backup legacy; hapus hanya setelah bukti nol dependensi, persetujuan pemilik dan rollback siap.

## 5. Kriteria hard fail
- Ada komposit beberapa entitas, atlas/spritesheet, background sprite cropping, path asset dipakai dua pemilik, frame tak punya file mandiri, frame badan terdistorsi, popping skala, kaki melayang, depth clipping, collision tidak cocok, pintu buntu, hotspot salah, image 404, gameplay/save regress.
- Test memperingatkan legacy secara terpisah; **tidak boleh** mengklaim seluruh repo sudah compliant sebelum migrasi kode dan biner selesai. Tidak ada menghapus aset massal.

## 6. Bukti keluaran tiap pekerjaan
Daftar `KEEP/POLISH/RECREATE/LEGACY`, file individual baru dan ownerId, peta referensi lama→baru, tabel bbox/footAnchor, screenshot dan rekaman animasi, test/QA, branch/commit, status deploy faktual, serta daftar legacy yang tersisa. Jangan tampilkan istilah developer kepada pemain.
