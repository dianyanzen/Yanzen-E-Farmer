# Pasirluyu Master Atlas — Design & Chunk Streaming (v0.3)
Tanggal: 19 November 2026 | Status: Implemented in prototype branch, **NOT merged to production**.

## Masalah yang terverifikasi dari kode sebelumnya
- Empat kanvas dunia berukuran 24 × 16 tile digambar terpisah; pembagian warna, noise dekorasi dan tekstur jalan memakai koordinat per-area, sehingga sambungan terlihat terputus.
- Pemain bisa berpindah gang→pasar pada koordinat lokal y=5, lalu muncul di pasar y=14; perpindahan di tengah peta ini bukan perpindahan antar tile dunia yang bersebelahan. Begitu pula gang↔sungai.
- Collision dan aset penutup jalan pernah disusun terpisah; pendekatan itu menghasilkan tembok tak terlihat atau benda yang bisa ditembus.
- Terdapat save game lama yang memakai posisi tepi. Kompatibilitas perlu dipertahankan.

## Solusi langsung yang diimplementasikan
Satu **master grid logis 48 × 48 tile**, dengan dimensi chunk 24 × 16 tile (tile 20 px pada game runtime). Total enam posisi chunk, empat di antaranya playable saat ini. Setiap chunk mempunyai asal global (originX,originY) dan semua posisi dapat diubah menjadi koordinat dunia.

```text
   MASTER 48 × 48 tile          X global
                     x=0..23         x=24..47
 Y=0..15          [ belum dibuka ]  [ Pasar Warga   ]
 Y=16..31         [ Kebun Yanzen  ]─[ Gang Pasirluyu ]
 Y=32..47         [ belum dibuka ]  [ Bantaran Sungai]
 ```

Passages:
- Field (23,10–11) ↔ Gang (0,10–11). Kedua tile ada di global y=26–27 dan global x yang bersebelahan.
- Gang (11–12,0) ↔ Pasar (11–12,15). Global y=16 dan 15 bersebelahan.
- Gang (11–12,15) ↔ Sungai (11–12,0). Global y=31 dan 32 bersebelahan.
- Semua tepi lain tertutup dengan obyek nyata (tanaman, sungai, pagar, gerobak, gerbang, dan seterusnya). Menekan Aksi pada blockade menampilkan alasan, bukan "Tidak ada objek".

**PENTING:** Ini adalah **master atlas data-driven** yang sekarang dirender per chunk. Kamera masih berpindah antar scene ketika melintasi tepi. Belum mengimplementasikan kamera tunggal meluncur terus melalui banyak chunk tanpa perpindahan scene, streaming beberapa chunk sekaligus, ataupun file master beresolusi tinggi sebagai satu PNG. Itu fase lanjutan.

## Satu sumber kebenaran
- `src/lib/game/model.ts` memuat `PASIRLUYU_MASTER`, `PASIRLUYU_CHUNKS`, `ROUTE_PORTALS`, `ROUTE_BARRIERS`, `isMasterRoad`, `routeBarrierAt`, `areaBlocked`, `mapExit`. Posisi, jalur, dan pemblokiran tidak boleh diduplikasi di renderer.
- `src/lib/game/pasirluyu-master-map.ts` menggambar tanah, jalan konsisten memakai koordinat global, dan lima jenis rintangan pixel-art orisinal.
- `src/lib/game/pasirluyu-areas.ts` merender dekorasi/rumah/toko unik tiap chunk di atas layer tanah bersama; menambahkan blocker dan koridor pada akhirnya.
- `src/lib/game/draw-world.ts` mempertahankan scene kebun lama agar alur bertani, rumah, dan gudang tidak berubah; overlay koridor global dan blocker memperbaiki sambungan.
- `src/lib/game/tap-navigation.ts` dapat berjalan menuju blocker lalu melakukan inspeksi, bukan memberikan rute melewatinya.
- `src/app/game/game-client.tsx` menampilkan mini map 2 × 3 chunk dan alasan lima area yang belum dibuka.
- `tests/game-living-world.mjs` memverifikasi perjalanan dua arah, kesinambungan koordinat global, collision, dialog barrier, dan penerimaan save posisi tepi.

## Lima penutup jalan yang tidak generik
| Lokasi | Sisi | Penutup jalan | Cerita/aksi | Destinasi masa depan |
|---|---|---|---|---|
| Utara Pasar | Utara | Gerbang melati merambat, bunga berwarna lembut | Nani ingin merawat melati terlebih dulu | Taman Kampung |
| Timur Gang | Timur | Gerobak jeruk-pisang, kucing tidur | Mang Ujang harus memindahkan gerobak | Gang Timur |
| Selatan Sungai | Selatan | Jembatan bambu diperbaiki, pita peringatan, bebek | Pekerjaan jembatan belum selesai | Kebun Hilir |
| Selatan Kebun | Selatan | Pagar bambu, dua kambing tidur | Pemilik lahan belum membuka jalan | Kebun Selatan |
| Timur Pasar | Timur | Umbul-umbul dan panggung persiapan | Persiapan festival warga belum selesai | Lapangan Warga |

Barriers **tidak dapat dibuka sekarang**; metadata destinasi hanya untuk pengembangan masa depan. Tidak ada syarat quest/level yang dibuat-buat tanpa desain cerita dan aset target.

## Lapisan peta yang wajib dijaga
1. **Ground / terrain:** tanah, jalan, jalan berbatu, air; tile dengan world-coordinate.
2. **Collision / navigation:** solid, jalan terbuka, pintu rumah, portal antarchunk; terpisah dari gambar tapi berasal dari satu registry.
3. **Static decoration:** pepohonan, pagar, bebatuan, rumah, rak warung, lampu dan flora, semuanya diposisikan deterministik.
4. **Dynamic objects:** tanaman tumbuh, NPC jadwal, hewan, quest blockers berubah status.
5. **Foreground/effects:** bayangan, pohon yang menutupi pemain, cuaca, efek aksi.
6. **Semantic overlays:** nama lokasi, papan petunjuk, tanda jalan ditutup, peta di YZ Phone.

## Rekomendasi produksi aset: master tilemap, bukan JPG/PNG tunggal
Alternatif A — satu foto/pixel painting 960 × 960 px yang dipotong: cepat untuk latar statis tetapi collision, perubahan musim, akses jalan, NPC, dan tanaman menjadi sulit diedit. Tidak direkomendasikan sebagai sumber utama.

Alternatif B — **peta Tiled/TMX/TMJ dengan layer dan chunk**: seluruh jalan digambar pada world grid, lalu sistem membagi data jadi 24×16 tile per chunk. Tiap tile menggunakan tileset dari sprite buatan sendiri. Renderer cukup membaca chunk kamera saat ini serta chunk tetangga (untuk transisi halus), bukan memuat seluruh kota di iPhone. Ini rekomendasi final.

Sumber untuk perencanaan migrasi:
- Tiled JSON chunks: https://doc.mapeditor.org/en/stable/reference/json-map-format/
- Tiled Infinite Maps: https://doc.mapeditor.org/en/latest/manual/using-infinite-maps/
- Tiled Worlds: https://doc.mapeditor.org/en/latest/manual/worlds/
- Tiled Tile Sets and terrain: https://doc.mapeditor.org/en/latest/manual/maps/

## Tahap berikutnya — jangan klaim sudah selesai
1. *Real continuous scrolling:* kamera global tunggal melihat 2–4 chunk yang dimuat secara dinamis, sehingga tidak ada layar yang "berganti".
2. *World editor:* ekspor master grid dan layer ke `.tmj` Tiled agar seniman bisa mengedit jalur, fence, water tanpa menyentuh TypeScript.
3. *Performance budget iOS:* batasi sprite draw calls, load chunk sekitar kamera, cache atlas, uji iPhone portrait/landscape (target stabil 60fps bila perangkat mampu, 30fps fallback).
4. *Unlock mechanics:* aksi papan gerobak/jembatan/gerbang baru bisa dibuka setelah quest dan area tujuan benar-benar tersedia; update state persisten tanpa mematahkan save v1.
5. *Road boundary screenshot checks:* setiap seam horizontal dan vertikal diperiksa piksel serta walkability-nya, termasuk NPC sedang menghalangi jalan.
6. *Regional expansion:* perluas dari Pasirluyu ke Regol lainnya hanya jika jalur, rumah, cerita warga, asset pipeline dan QA selesai.

**Rilis:** staging terlebih dahulu. Production domain tetap tidak diubah kecuali diminta eksplisit dan QA visual berhasil.
