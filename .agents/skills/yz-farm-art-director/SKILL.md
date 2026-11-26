---
name: yz-farm-art-director
description: Standar wajib YZ Farm Life untuk audit, konsep, desain, generate, variasi, perbaikan, penggantian, penataan, dan penghapusan aset game (bangunan, interior, market, environment, props, tiles, sprite, dunia ekspansi). Mencegah art style campur, clutter, ukuran salah, collision tidak cocok, dan penghapusan aset tanpa review.
---

**Deployment aktif 25 November 2026:** baca `.agents/skills/yz-farm-deployment/SKILL.md` dan `docs/DEPLOYMENT_POLICY.md`. Perubahan game hanya ke project `yanzen-e-farmer-staging` pada domain tetap setelah QA lokal/CI; tanpa preview rutin, tanpa deploy web pertanian. Verifikasi READY dan alias live. Aturan ini mengalahkan petunjuk preview/promotion lama; pemain online bukan blocker, save tetap kompatibel.


# YZ Farm Life — Art Director & Asset Lifecycle

**Trigger:** gunakan untuk permintaan yang menyebut aset, gambar sprite, pixel art, rumah, gudang, interior, pasar, rumah warga, lingkungan, tile, dekorasi, props, tanaman, UI world, collision visual, asset library, artwork style, kurasi/hapus aset, atau ekspansi peta. Berlaku untuk tahap konsep maupun implementasi.

## Pembaruan WAJIB 24 November 2026 — atomic asset ownership

**Prioritas tertinggi**: baca dan gunakan `.agents/skills/yz-farm-atomic-assets/SKILL.md` dan `docs/game-dev/ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md` untuk semua perubahan. Pemilik MELARANG spritesheet, atlas, multi-object cropping, source rectangle, texture packing runtime, dan sharing satu file antar entitas/varian/frame/instance. Semua source, output produksi dan animation frame harus satu file individual per pemilik. **Poin lama “sprite/atlas naming” dan “satu atlas per scene” di bawah hanya catatan historis, tidak boleh dipakai untuk produksi baru.** Tidak ada pengecualian untuk performa; optimasi dengan lazy loading per lokasi dan file sendiri.

Kunci proporsi tubuh Yanzen dan pivot kaki pada idle, walk, run, turn, tanam, siram, panen dan memancing, tanpa stretch frame dan tanpa perubahan tinggi nyata saat transisi. Audit terukur ada di `docs/game-dev/YANZEN_ANIMATION_SCALE_AUDIT_20261124.md`. Migrasi legacy bertahap, aman bagi save dan quest, tidak mengklaim compliance sebelum runtime benar-benar beralih.

## Sumber wajib sebelum bertindak
1. \`AGENTS.md\` — batas aplikasi game vs E-Farmer, NPC/save/runtime.
2. \`docs/game-dev/YZ_VISUAL_IDENTITY_BIBLE.md\` — *sumber canonical art direction YZ Farm Life*.
3. \`docs/game-dev/ASSET_REDESIGN_LIFECYCLE.md\` — klasifikasi, audit dependensi, approval, rollback dan penghapusan.
4. \`docs/game-dev/WORLD_SCALE_AND_PROPORTION_STANDARD.md\` — skala karakter indoor/outdoor, proporsi furnitur, foot-anchor, Scale Lab dan pilot Pasirluyu.
5. \`docs/game-dev/ASSET_VISUAL_AUDIT_20261123.md\` — baseline visual dari tujuh screenshot pemilik; sifatnya historis dan bisa direvisi.
6. \`docs/game-dev/HD_ASSET_STANDARD.md\`, \`docs/game-dev/HD_WORLD_LAYOUT_AUDIT_20261123.md\` — kontrak teknis Housing HD di branch integrasi; periksa keberadaannya, jangan asumsikan sudah ada di main.
7. Runtime aktual: \`src/lib/game/model.ts\`, \`src/lib/game/modular-outdoor.ts\`, \`src/lib/game/phaser-world.ts\`, \`src/lib/game/draw-world.ts\`, katalog media dan pengujian.

## Prinsip mengikat
**YZ Farm Life: warm Bandung farming life, detailed HD pixel art yang koheren, bentuk jelas, cukup detail, tidak ramai.**
- Jangan generate gambar baru sebelum audit ukuran/posisi/tujuan dan benchmark. **Tidak semua aset perlu diregenerate**.
- Jangan salah menganggap resolusi master besar sebagai kualitas di ukuran tampil.
- Bangunan harus punya fungsi arsitektur, identitas penghuni, akses, skala karakter, footprint, pintu, jalan, bayangan kontak, dan material yang konsisten.
- Tinggi tubuh yang tampak **tidak berubah** ketika masuk/keluar rumah atau berganti animasi; kasur/peti/meja/pintu harus proporsional terhadap karakter, dengan pengujian visible-alpha, footprint, dan zoom permainan. Jangan menyamakan ukuran frame animasi dengan ukuran tubuh.
- Interior wajib dipisah menjadi base floor/walls, props di belakang/depan pemain, objek aktif, collision/hotspot, optional roof/weather/light. Jangan mengambil props bersama lantai secara sembarangan.
- Gameplay, route, NPC, quest, save, katalog tidak boleh berubah diam-diam karena artwork.
- Detail terkonsentrasi secara sadar; ruang tenang dan jalan tetap terbaca. Tolak random asset spam atau decorative overload.
- Simpan dan kurasi master berkualitas untuk masa depan meski belum dipakai; hapus kandidat hanya lewat bukti + persetujuan terpisah.

## Standar wajib 26 November 2026 — Sundanese Cozy Farming RPG dan pedagang universal

Gunakan `docs/game-dev/SUNDANESE_COZY_MERCHANT_STANDARD.md` sebagai kontrak desain dan penerimaan seluruh lokasi, terutama pasar, NPC pedagang, produk dan dialog. Widi menjadi baseline struktur interaksi pedagang; Iyan harus berdiri di depan lapak sebagai NPC independen. Ayu dan Widi memakai frontage pasar; Inggit boleh melayani dari balik konter sesuai fungsi warung. Komponen dialog, katalog, ekspresi, input dan transaksi memakai standar bersama tanpa menghilangkan suara masing-masing tokoh. Semua aset baru wajib individual, termasuk delapan ekspresi dan seluruh frame; aturan atomic assets, canonical NPC, scale lock dan staging-only tetap lebih tinggi daripada contoh historis. Dilarang menyatakan pekerjaan selesai tanpa bukti QA runtime pada kandidat rilis yang sama.

## Prosedur wajib
1. **Observasi (sumber):** screenshot, file aktual, metadata aset, dimensi, resolusi, alpha, kode yang memuat, renderer, screenshot viewport mobile, before/after bila ada.
2. **Diagnosis (penjelasan):** klasifikasikan bug renderer/scale/footprint/palette/perspective/clutter/collision vs memang perlu desain baru. Tulis ketidakpastian.
3. **Concept brief:** jelaskan fungsi bangunan, penghuninya, gaya khas, warna material, tingkat detail, pusat perhatian, dan area kosong. Bandingkan dua pendekatan bila keputusan mendasar.
4. **Blueprint blockout:** tetapkan tile footprint, door threshold, spawn, path, depth, collision, prop location sebelum proses generate.
5. **Master production:** sumber resolusi tinggi dan transparent separated layers; referensi karakter/ciri rumah/original world; hindari checkerboard/watermark/text acak; jangan merusak style.
6. **Runtime pipeline:** individual asset naming, version, source hash, scaled render, shadow, variants, fallback, asset database & kategorial index.
7. **QA:** dual renderer, mobile/desktop, screenshots 1:1, jalan masuk, objek aktif/quest/NPC, day/night, save lama, asset dependency graph, typecheck/test:game.
8. **Review & promotion:** laporkan perubahan dan kekurangan, rilis ke domain staging permanen setelah tes lokal/CI, tunggu persetujuan pemilik sebelum mengganti aset berisiko besar atau menghapus master; jangan mengklaim READY atau visual approved sebelum diverifikasi.

## Klasifikasi laporan untuk setiap aset yang diperiksa
Gunakan tabel dengan \`assetId, lokasi, fungsi, ukuran master/runtime, current consumer, isu nyata, confidence, opsi (KEEP/POLISH/REDESIGN/FUTURE_KEEP/ARCHIVE/REMOVE_CANDIDATE), risiko, tindakan, QA\`. Jika audit kategori besar, buat manifest dahulu, bukan 1.000 sprite baru.

## Gate stop
**HENTIKAN perubahan yang merusak:** tidak ada file master, key NPC tidak cocok, dynamic references belum diaudit, collision/pintu tidak teruji, asal lisensi tidak jelas, mobile readability gagal, atau sebuah aset lama ternyata masih direferensikan. Ubah ke mode review/patch terpisah. Tidak boleh mass delete.

## Output akhir yang disarankan
Konsep yang dipilih + visual-family reference, before/after, perubahan asset manifest, file kode/metadata yang diedit, tes, SHA commit/PR, Vercel deployment URL/status, keterbatasan, dan urutan iterasi berikutnya. Pisahkan data developer dari apa yang tampil ke pemain.
