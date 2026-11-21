# YZ Farm Life — Perpustakaan Aset, Konsistensi Potret, dan Experience Hooks v1.0
**Audit berbasis GitHub `main` SHA `3330580b90a75f194f7f96b5e48326b7e1945c4e` (21 Nov 2026)**

> Instruksi pemilik: **aset boleh jauh lebih banyak daripada isi peta awal.** Perpustakaan aset disiapkan untuk perkembangan Pasirluyu → Regol → Bandung tanpa redraw massal setiap ekspansi. Yang harus kecil adalah **aset yang dimuat runtime dan konten aktif per zona**, bukan seluruh vault. Fokus pengalaman bermain, bukan sekadar jumlah gambar.

Rujukan wajib: [GAME_AUDIT_MASTER.md](GAME_AUDIT_MASTER.md), [AUDIT_PLAYBOOK.md](AUDIT_PLAYBOOK.md), [EXPERIENCE_FIRST_ROADMAP.md](EXPERIENCE_FIRST_ROADMAP.md).

## 1. Observasi terverifikasi (bukan perkiraan)

| Inventaris | Hasil |
| --- | ---: |
| Media di `game-assets/` dan `public/game/assets/` | **2.487 file** (2.407 PNG, 1 WebP, 6 SVG, 72 WAV, 1 MP3) |
| Isi media unik menurut Git blob SHA-1 | **1.195** |
| File ekstra dengan isi identik | **1.292** |
| Ukuran total media di seluruh pohon kerja | ±**128,75 MB** |
| Aset media publik game | **426 media** (418 PNG, 6 SVG, 1 WebP, 1 MP3; metadata JSON dihitung terpisah) |
| `aset/tanaman/` | **196 file**, hanya **25 isi PNG unik**; **171 file ekstra identik** |
| Root strip potret `portraits/Axx,Cxx.png` | **32 strip 1.536×256**, **8 ekspresi** per karakter = 256 frame |
| Ilustrasi konsep `portraits/bandung/` | **268 PNG** (keluarga K/R/work; komposisi lain, jangan dipakai sebagai ekspresi dialog) |
| Karakter playable dalam `model.ts:NPCS` | **5 NPC** dari katalog 31 NPC |
| Database paket aset lama | **4 SQLite** pada `game-assets/yz-farm-life/` (core/aset, bandung-151, explore-bandung, atlas-bandung) |

Catatan: angka duplikasi berasal dari **hash byte identik**, bukan analisis kemiripan perseptual. Dua file yang berisi objek sama tetapi warnanya berbeda akan dianggap unik. Total ukuran pohon kerja tidak sama dengan Git pack storage, disk server atau ukuran unduhan awal; Git sendiri dapat menduplikasi referensi tanpa menyimpan blob fisik berulang.

### Contoh masalah konkret

`game-assets/yz-farm-life/aset/tanaman/aren.png` = `asam-jawa.png`; `padi.png` = `jagung.png` secara byte. Kedua pasangan adalah **sprite keluarga/prototipe**, bukan artwork khusus spesies. **Jangan menyebut 196 variasi tanaman yang benar-benar berbeda** sampai digambar dan lulus review. Jangan menghapus path lama: pengguna berhak mempertahankan seluruh daftar komoditas untuk masa depan.

Berbagai folder `aset`, `bandung-151`, `atlas-bandung`, `explore-bandung` memiliki materi berulang. Ini perlu alias dan indeks sumber yang benar, **bukan penghapusan massal** yang memutus URL atau paket Docker lama.

## 2. Database aset tunggal yang baru (tanpa menghapus database lama)

**Sumber media kanonik:** [`game-assets/catalog/asset-database.json`](../../game-assets/catalog/asset-database.json) — seluruh 2.615 berkas media, dengan path unik, SHA blob Git, ukuran, image/audio/vector, staging, tujuan, keluarga style, provenance/license status, alias duplikasi, quality flag.

**Sumber katalog lain:**
- [`npc-portrait-register.json`](../../game-assets/catalog/npc-portrait-register.json): semua 32 identitas, 8 frame, nama, status playable, source sheet, work illustration dan art review.
- [`asset-experiences.json`](../../game-assets/catalog/asset-experiences.json): **28 pengalaman mikro** dari aset yang sudah ada — **blueprint, belum ditanam ke scene**. Runtime helper [`asset-experience.ts`](../../src/lib/game/asset-experience.ts) tersedia untuk dihubungkan kelak; tidak mengubah progres save maupun collision.
- [`asset-production-queue.json`](../../game-assets/catalog/asset-production-queue.json): **96 spesifikasi aset orisinal tambahan**, tahap `design-only-not-yet-drawn`. **Bukan 96 PNG baru.**
- Manifest lama `sources.json`, `characters.json`, `portrait-production.json`, vendor licenses dan 4 SQLite tetap dipertahankan sebagai arsip sumber. Jangan menyatakan empat SQLite lama telah disinkronkan.

Kenapa tidak langsung memasukkan ke Supabase? Perpustakaan masih berkembang dan Docker hanya tempat uji. JSON yang di-version Git menghindari migrasi database produksi. Untuk pencarian cepat lokal, ekspor normalized SQLite lewat Python stdlib.

```bash
npm run assets:search -- --search tanaman --limit 10
npm run assets:search -- --shared-templates --limit 40
npm run assets:search -- --style dialogue-expression-pixel-v1
npm run assets:index:check      # cocokkan index dengan git dan ukuran file
npm run assets:index            # regenerasi setelah menambah media yang benar-benar di-commit
npm run assets:sqlite           # output game-assets/_generated/yz-asset-library.sqlite (gitignored)
npm run test:game:assets
```

`asset-database.json` adalah **database inventaris media**, bukan CDN dan bukan query runtime 2.615 asset. Jangan import file 650KB ini ke React/Phaser saat startup. Gunakan metadata ringan yang diperlukan per scene.

**SQLite lokal baru** menyimpan tabel `assets`, `portraits`, `experiences`, `metadata` beserta indeks. Ini adalah *export* terpisah. Empat SQLite historis belum digabung isinya; sebelum dihapus/dimigrasi, bandingkan schema, jumlah baris, foreign keys, dan art references di server Codex.

## 3. Konsistensi portrait NPC — standar yang WAJIB

Dari pemeriksaan visual contoh A01/A03/A04/C01/C08/C15 dan K01/K02/R101/work-C01:
- Strip 8 ekspresi A/C adalah **pixel-art bust/shoulder-up** dan memiliki variasi emosi; ukuran 1536×256, potongan 192×256, susunan ekspresi konsisten.
- Potret K/R/work merupakan **ilustrasi konsep satu frame**, lebih halus/lebih bebas pose dan background. Kontras keluarga art ini nyata walaupun sama-sama bertema game pertanian. Background/warna beberapa strip juga tidak seragam; hanya metadata/stylesheet tidak cukup mengubah identitas artistik.
- **Solusi sekarang (non-destruktif):** potret ekspresi tetap **standar tunggal** dialog aktif; arsip ilustrasi konsep dipisah sebagai `<details>` di galeri YZ Phone. Karakter aktif tidak boleh tiba-tiba berganti ke work-concept saat dialog.
- **Solusi produksi lanjut:** seleksi satu style master, buat contact sheet 32×8, redraw/retouch kelompok yang menyimpang (dengan reference sheet yang berizin), evaluasi pada 80px mobile dan 112px dialog, jangan membuat mata/hijab/masker/kursi roda/warna pakaian berubah tak sengaja. Perlakukan karakter C15 yang memakai kursi roda secara hormat dan pastikan pose berjalan diganti frame gerak kursi roda sebagaimana manifest.
- **Tidak diklaim:** gambar lama **belum semuanya digambar ulang** menjadi satu art style. Perlu review manual face/pose, compositing yang teliti, dan persetujuan identitas. Jangan mengubah 32×8 sheet tanpa backup/source checksum.

### Checklist persetujuan potret

1. Identitas/usia karakter tetap terbaca. Tidak ada karakter tertukar antara panel.
2. Siluet, ukuran kepala, sudut kamera, ketebalan outline dan warna kulit/pakaian harmonis.
3. 8 ekspresi benar-benar berbeda, **tidak** hanya copy paste mata/mulut.
4. Proporsi tubuh, jumlah jari/aksesoris dan penutup kepala benar. Masker karakter bermasker konsisten.
5. Transparansi dan tepi tidak kotor, tidak ada huruf/watermark, pencahayaan satu sumber.
6. Dialog desktop/mobile dan katalog tampak serasi; jika belum, status `needs-human-side-by-side`.
7. Simpan file sumber/edit dan catat generator, tanggal, lisensi, hash, review dan penggunaan; jangan overwrite file live tanpa PR.

## 4. Mengubah aset biasa menjadi pengalaman yang bermakna

**Aset dekoratif tidak harus berarti tidak interaktif.** Ada 5 tingkat penggunaan yang dapat dipilih *per objek*, tanpa menjadikan semua pemandangan tombol:
1. **Scenery:** hanya membuat lingkungan hidup, memberi bayangan/tekstur/cerita visual.
2. **Reactive:** animasi minimal berdasar jam, cuaca, kedekatan pemain, atau NPC.
3. **Inspectable:** satu interaksi singkat yang memberi observasi/cerita lokal, tanpa panel atau label besar permanen.
4. **Social/story:** menjadi pemicu dialog NPC, surat, petunjuk lokasi, atau mikro-peristiwa.
5. **Collectible/secret:** penemuan opsional, jurnal, album, lencana dekoratif; jangan jadikan grind tanpa imbalan naratif.

**28 blueprint sudah ditulis** untuk bunga melati, jemuran, peti kayu, pot, batu kanal, kandang ayam, plang arah, warung, gudang, pepohonan, rumput, alat, bangku, jembatan, lapak, angkot, halte, festival dll. Semua mengacu **file yang benar-benar ada**. Helper TypeScript menentukan line/hint yang relevan berdasarkan `zone`, `minutes`, `day`. Karena belum disambungkan ke scene, tidak ada overlay/UI baru yang dipaksakan dan tidak ada klaim bahwa pemain sudah bisa memicunya.

**Contoh ketika diintegrasikan kemudian:** jika player menekan aksi dekat bangku saat sore, NPC dapat berkomentar pendek dan karakter duduk sebentar; jika hanya lewat, tidak muncul pop-up. Papan pasar dapat menampilkan agenda, bukan label permanen. Objek masa depan tetap tinggal dalam vault hingga area relevan hadir.

**QA kontrak pengalaman:** tidak menambah collider pada dekorasi kecil, bukan spam popup, event deterministik/once-per-visit, state flag terukur, jangan menggandakan hadiah, kontrol keyboard/touch sama dan audio bisa mute.

## 5. Tata kelola aset jangka panjang

```text
Aset diusulkan → brief & provenance → gambar sumber
  → cek lisensi/identitas/art style → cek pixel dimensions/atlas/alpha
  → hash & insert asset-database → status curated/approved
  → ekspor runtime per-zona (bukan load seluruh vault)
  → map placement + collider + interactions + QA mobile
  → aktif / dapat dikoleksi / arsip / kandidat ekspansi
```

**Prinsip anti-revisi besar:**
- **Hapus aset tidak layak atau tidak relevan yang telah lolos audit referensi.** Dedup dilakukan melalui canonical `duplicateOfPath`; jangan menghilangkan ID/data 196 tanaman hanya karena sprite-nya generik. Jangan menghapus media aktif, sumber unik, lisensi, atau dependensi arsip tanpa migrasi.
- **Tidak semua file menjadi art produksi.** 25 sprite template bisa cukup untuk placeholder, tetapi sebelum spesies playable wajib punya morfologi dan variasi growth stage yang sesuai.
- **Tidak semua potret konsep masuk dialog.** Gunakan strip ekspresi yang konsisten atau buat versi setara terlebih dahulu.
- **Tidak memuat semua aset di awal game.** Asset vault sebanyak mungkin, runtime per lokasi sekecil mungkin. Evaluasi decoded texture memory, FPS, cold load.
- **Keunikan berperan:** sebagian aset yang terlihat biasa justru bagus untuk micro-stories; nilai dari cara pemain menemukan/mengenali, bukan dari besarnya gambar.
- **Ekspansi tetap perlahan:** produksi perpustakaan dapat besar; integrasi `gameplay/scene` dilakukan satu slice pada satu waktu. 96 rencana baru bukan kewajiban dimasukkan ke Pasirluyu sekarang.

## 6. Analisis tujuh langkah + prioritas

| Observasi | Penyebab / alternatif | Confidence | Tindakan | Dampak experience | Prioritas |
| --- | --- | --- | --- | --- | --- |
| 196 tanaman, 25 isi unik | Aset generik dipakai ulang; tidak selalu bug bila placeholder | 100% hash | tandai `shared-template-sprite`, produksi visual spesifik sesuai kebutuhan | visual unik saat komoditas baru dibuka | P1 curated / P3 expansion |
| Potret ekspresi vs konsep beda gaya | Produksi dari batch/pipeline berbeda; framing dan medium berbeda | 95% observasi sampel | pisahkan penggunaan, review potret kolektif, redraw bertahap | wajah NPC terasa satu dunia | P1 |
| Katalog lama tersebar pada 4 SQLite | Paket pekerjaan dari fase berbeda | 100% keberadaan, isi DB belum diaudit | git asset-index baru + exporter SQLite lokal; archive old | aset mudah ditemukan tanpa dibuat ulang | P1 |
| 2.487 media di repo | Library ekspansi dan clone/duplikasi | 100% inventory | alias, quality flag, lazy-runtime policy | kaya aset dengan loading tetap ringan | P1 |
| Objek sepele tidak punya pengalaman | mekanik inspect/ambient belum terhubung ke scene | 100% kode blueprint baru | 28 hook ready, integrasi ketika relevant | dunia hidup dan mengundang eksplorasi | P2 |
| 96 spesifikasi baru | visi long-term, belum digambar | 100% katalog rancangan | produce per batch + QA art, tidak jadi map langsung | mengurangi revisi ekspansi | P2 design, P3 integration |

**Catatan verifikasi:** script index/SQLite/test ditambahkan dalam PR fitur ini. Sampai CI+manual QA selesai, jangan klaim exporter dan UI telah sukses dijalankan pada semua lingkungan. Tidak ada perubahan Supabase, Docker DB, DNS atau production. Untuk seluruh game gunakan [Master Audit](GAME_AUDIT_MASTER.md) dan dokumentasikan temuan baru setelah PR ini direview.


## 7. Kebijakan kurasi dan penghapusan — keputusan pemilik 21 November 2026

**Arahan baru:** perpustakaan YZ Farm Life harus kaya tetapi tidak boleh dipenuhi aset kualitas rendah, duplikasi tidak diperlukan, dan gambar yang tidak akan dipakai. Aset bermutu untuk ekspansi Bandung tetap disimpan walau belum muncul dalam peta awal. Kebijakan ini menggantikan prinsip lama untuk selalu mempertahankan seluruh PNG.

| Kelompok | Kriteria | Tindakan |
| --- | --- | --- |
| **KEEP · ACTIVE** | Dipakai scene/dialog, cocok art style, lolos QA | pertahankan path dan hash; jangan hapus |
| **KEEP · FUTURE** | Unik, layak visual, punya rencana penggunaan eksplisit pada ekspansi | simpan vault, jangan preload |
| **REWORK** | Penting secara fungsi/karakter tetapi kualitas/proporsi/palet buruk; masih ada referensi | gambar pengganti dulu, migrasi referensi, lalu hapus file lama |
| **DELETE · SAFE** | Korup, sampah render, artefak gagal, atau salinan byte-identik yang tidak direferensikan dan mempunyai sumber kanonik terjaga | hapus dari branch setelah checks |
| **REVIEW** | Kegunaan/kualitas/lisensi belum jelas | jangan promosikan ke runtime; tinjau sebelum keputusan hapus |

### Syarat sebelum menghapus media

1. **Audit penggunaan:** cari rujukan path/file pada TS/TSX/JS, JSON, TMJ/TSJ, CSS, HTML, SQLite, paket ZIP, dokumentasi build, manifest karakter, daftar komoditas, serta pengalaman/mekanisme yang disiapkan. *Tidak ada referensi di scene saat ini tidak sama dengan tidak dibutuhkan untuk ekspansi.*
2. **Audit keunikan:** gunakan SHA untuk duplikasi eksak, lalu periksa kemiripan visual untuk versi resolusi berbeda. Pertahankan satu sumber berkualitas terbaik dan lisensi/provenance yang diperlukan. Angka 1.420 duplikasi adalah **kandidat audit**, bukan otomatis 1.420 file yang aman dihapus.
3. **Audit mutu:** penilaian karakter/tanaman/bangunan meliputi proporsi, outline, palet, anatomi, alpha, framing, resolusi target, kompatibilitas sprite sheet, serta konsistensi 3/4 cozy pixel-art. Status “belum dipakai” bukan kegagalan mutu.
4. **Migrasi:** sebelum menyingkirkan placeholder 196 spesies, ganti referensi gambar dengan aset kanonik/baru tanpa menghapus record komoditas, kebutuhan gameplay, atau progres save. Jangan memutus path dalam empat SQLite legacy, peta historis, atau arsip ZIP tanpa audit dan migrasi eksplisit.
5. **Verifikasi:** commit penghapusan lewat PR, catat daftar path, reason, hash dan aset pengganti; jalankan `assets:index`, `assets:index:check`, `test:game:assets`, test game/typecheck/build, lalu inspeksi Pasirluyu/pasar/dialog di desktop dan mobile. Jika gagal, rollback dari Git.

**Urutan eksekusi:** (P0) sampah/artefak rusak terverifikasi → (P1) duplikasi nonreferensi → (P1) potret dan tanaman yang diganti → (P2) arsip konsep tak relevan setelah review → (P3) aset ekspansi unik hanya jika tidak memenuhi visi dunia Bandung. **Jangan menyamakan jumlah path yang berkurang dengan berkurangnya variasi gameplay.**

**Status pada 21 Nov 2026:** kurasi tahap pertama telah menghapus 128 salinan PNG byte-identik (bukan seluruh pemeriksaan visual). PR #31 masih draft dan memerlukan CI/manual QA. Penghapusan tidak menghilangkan objek dalam riwayat Git.


## 8. Hasil kurasi tahap pertama (21 November 2026)

**Pada branch PR #31, bukan production:** terhapus **128 PNG salinan identik** senilai **117.366.708 byte (117,37 MB)** dari empat paket ekstraksi legacy (`aset`, `atlas-bandung`, `bandung-151`, `explore-bandung`). Seluruh **32 sprite sumber kanonik** tetap berada pada `game-assets/characters/gba-v2*/sheets/`. Delapan manifest dan README diperbarui. Dua ZIP standalone serta empat SQLite legacy tidak diubah.

**Katalog sekarang:** 2.487 media, 1.195 blob konten unik, 1.292 salinan tambahan, 128.751.045 byte media terdaftar. Ini tidak otomatis setara dengan penghematan Git pack atau ukuran download runtime. Daftar SHA/path untuk pemulihan ada di [asset-prune-20261121.json](../../game-assets/catalog/asset-prune-20261121.json); commit sebelum pembersihan `251f78a46b1e617e12a645c29d2c072bf62cf7ad`. Mutu visual potret, tanaman, dan konsep Bandung belum dituntaskan: file unik yang masih layak untuk ekspansi tidak dibuang hanya karena tidak aktif. CI, pemeriksaan browser dan asset index perlu lulus sebelum merge.
