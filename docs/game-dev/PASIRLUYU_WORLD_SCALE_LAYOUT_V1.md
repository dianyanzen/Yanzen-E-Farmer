# YZ Farm Life — Pasirluyu World Scale & Layout V1 (Tahap 0–5)
**Status:** implementasi iterasi pertama pada branch `feat/pasirluyu-world-v1-scale-20261123`, 23 November 2026. Bukan persetujuan visual final atau migrasi master massal.

Dokumen ini wajib dibaca bersama `WORLD_SCALE_AND_PROPORTION_STANDARD.md`, `YZ_VISUAL_IDENTITY_BIBLE.md`, dan `ASSET_REDESIGN_LIFECYCLE.md`.

## Tahap 0 — Scale Lab (diterapkan)
- Audit nyata 144 frame Yanzen: idle 72 frame 24×32 (alpha body 29–30px), gait 48 frame 32×40 (28–33px), turn 24 frame 32×40 (30–33px).
- Metadata SHA-256 dan batas alpha: `src/lib/game/character-frame-bounds.json`. Fungsi anchor kaki: `world-scale.ts`; digunakan langsung oleh Phaser agar animasi tidak menggeser posisi kaki.
- Ukuran tubuh tetap tidak dikompensasi dengan stretch vertikal per frame. Selisih tinggi 2–3px yang disebabkan pose berjalan adalah wajar; kesesuaian visual ditinjau pada ukuran game.
- Alat perbandingan desain tersedia melalui URL pengembang `/game/asset-lab.html`; tidak ditambahkan ke YZ Phone/menu pemain.
- Frame aksi dengan alat berukuran 48px tidak dinilai dari alpha bounds total karena gambar memuat alat yang melampaui tubuh. Dibutuhkan uji manual pada animasi panen/hoe/watering.

## Tahap 1 — Rumah Yanzen (diterapkan, master art dipertahankan)
- Proyeksi interior 320×320 menjadi 232×232 world-pixel, **satu skala seragam**; sebelumnya 232×244 membuat benda terlihat tertarik.
- Kasur: source crop 97×147, display **50×76px**, sebelumnya kira-kira 70×112px; perubahan menjaga aspect ratio tanpa menghapus detail gambar.
- Peti, rak buku, meja kerja, karung, dan lemari juga direposisi dan ukurannya mengikuti aspect ratio sumber.
- Collision dalam `world-layout-data.json` ditata agar jalan dari spawn (12,12), kasur, pintu, dan benda aktif tetap tersedia.
- Furniture berada di layer terpisah dan kedalaman mengikuti kaki; hindari kesan pemain menginjak kasur.
- Canvas fallback kini memusatkan room bila viewport lebih lebar daripada world, menghindari pergeseran satu sisi.
- Catatan: sprite furnitur masih merupakan crop dari master artwork, belum PNG transparan individual hasil seni ulang.

## Tahap 2 — Gudang, exterior, halaman (diterapkan, perlu penilaian visual)
- Rumah utama berubah dari display 112×112 ke 100×100; gudang tetap 104×104. Jarak gambar terlihat di antara rumah/gudang setidaknya mendekati satu tile pada bbox alpha sumber, tanpa memindahkan portal/collision.
- Gudang: kelompok rak, meja, peti, irigasi, karung dan kabinet diperkecil, ditempatkan ulang, dibuat proporsional dan tetap dapat dijangkau.
- Pot depan rumah diturunkan ukuran dan digeser ke area teras; bayangan tetap menggunakan lebar visual HD.
- Rute rumah–gudang dan door thresholds dari iterasi sebelumnya dipertahankan; jangan mengubah ID objek atau spawn save tanpa migrasi.

## Tahap 3 — Rumah warga dan Gang Pasirluyu (polish awal)
- Penataan ulang bangku di depan Nani, tanaman/teras Ryan, tanda dan bunga sekitar Widi agar tidak mengaburkan pintu.
- Seluruh `rumah-nani/ryan/inggit/ayu/widi.png` sudah **480×320**, sama seperti ukuran runtime sehingga tidak perlu stretch khusus.
- Rumah warga yang sudah konsisten tidak diregenerasi hanya karena resolusi. Uji masing-masing pintu dan akses NPC pada staging.
- **Belum dilakukan** regenerasi full individual rumah warga; hanya penataan environment agar tidak tambah ramai.

## Tahap 4 — Pasar Warga (polish awal)
- Toko Ayu tetap toko serbaguna terbesar, display 154×154 → **146×146px**.
- Toko Widi 140×140 → **132×132px**. Keduanya diperkecil **uniform**, sehingga proporsi sumber tidak terdistorsi dan character size tetap sama.
- Kios kecil di sisi selatan dan jalur layanan yang sudah dipindahkan pada Housing HD tetap dipertahankan. Collision dan counter Ayu/Widi tidak berubah.
- Pengembangan fitur produk/merchant tidak dilakukan dalam pekerjaan desain asset, supaya dataset canonical tidak rusak.
- **Belum dilakukan** generasi ulang desain facade berukuran besar; nilai visualnya pada screenshot sesungguhnya dahulu.

## Tahap 5 — Sungai, kebun, world clutter (diterapkan)
- Jumlah patch rumput dekoratif awal 1550/area menjadi **field 840, gang 660, pasar 340, sungai 760** untuk menyediakan ruang tenang.
- Tiga petak padi tepi sungai menggunakan jarak tanaman lebih longgar, variasi ukuran rumpun, warna dan bagian air terbuka. Collision dan mekanik budidaya tidak diganti.
- Papan kolam di kawasan Bandung menggunakan label `KOLAM`; pemisahan kolam ikan dari aliran sungai tetap dipertahankan.
- Pintu air, jembatan, struktur sungai, dan identitas terrain yang berkualitas tidak dihapus.

## Validasi teknis
- `npm run typecheck`
- `npm run test:game` (termasuk `game-pasirluyu-scale-lab.mjs`, `game-world-layout-hd.mjs`).
- `game-pasirluyu-scale-lab.mjs` memvalidasi checksum 3 spritesheet, 144 frame idle/gait/turn, foot-anchor, source aspect ratios 12 furnitur, skala interior seragam, gap rumah/gudang, hirarki pasar, collision dan density vegetasi.
- Tidak ada penghapusan master atau perubahan skema save; prioritas QA manual: animation idle/gait/turn, kasur, rak, jalan rumah/gudang, gang, plaza, dan bantaran sungai.

## Masalah tersisa untuk iterasi seni berikutnya
- Sebagian furnitur crop lama masih memuat detail dekoratif sendiri; artist perlu menghasilkan asset sprite transparan individual untuk kontrol overlap sempurna.
- Fasad Ayu masih memiliki ornamen yang relatif kaya dibanding gang. Perlu pembandingan screenshot dengan desain toko versi lebih sederhana.
- Rumah warga, kios pasar, dan lingkungan ekspansi belum mendapat satu per satu approval art direction.
- UI game mobile membutuhkan evaluasi tersendiri dan tidak otomatis selesai karena perubahan asset world.
- Jangan mengklaim semua asset Pasirluyu sudah didesain ulang dari nol. Iterasi ini memperbaiki **skala, komposisi, kepadatan, kedalaman, dan koherensi** dengan master lama tetap sebagai acuan.
