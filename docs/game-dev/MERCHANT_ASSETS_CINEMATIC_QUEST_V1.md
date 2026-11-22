> **HISTORIS — digantikan 22 November 2026.** Bagian cutscene SVG/CSS/Remotion pada dokumen ini tidak lagi digunakan. Video final resmi adalah file milik pemilik game: `public/game/assets/cutscenes/sluice-gate.mp4` (10 detik, H.264/AAC, 910×512). Untuk standar baru, baca [CUTSCENE_PRODUCTION_STANDARD.md](CUTSCENE_PRODUCTION_STANDARD.md) serta skill `../../.agents/skills/yz-farm-cutscene/SKILL.md`. Bagian aturan ikon Ayu/Widi tetap relevan.

# Merchant Assets & Cinematic Quest V1 — 22 November 2026

Status: implemented on feature branch; awaiting mobile acceptance and merge.

## Basis
Screenshot Safari iOS dari user menunjukkan Widi punya potret sedikit bergeser, fragmen sprite gelap di bawah frame, placeholder lingkaran/bintang untuk pelet dan bibit, dan tombol navigasi yang perlu dirapikan. Generated reference assets: Widi eight expressions 4×2 (candidate); Ayu four shop items 2×2; Widi six items 3×2. Identity and canonical professions must remain unchanged.

## Yang sekarang digunakan
- `public/game/assets/tiles/ayu-shop-atlas.png`: hasil olah optimasi dari empat gambar Ayu sebelumnya menjadi 2×2 sel 56×56; frame (0,0) bungkus benih, (0,1) timun. Lima biji dan lapak tetap disimpan di sel lain untuk pemakaian kelak.
- `public/game/assets/tiles/widi-shop-atlas.png`: hasil olah optimasi dari enam gambar Widi sebelumnya menjadi 3×2 sel 56×56; pelet dan kotak pelet, bandeng, kakap putih, belanak, dan lapak/timbangan.
- PNG tersebut merupakan versi runtime kecil dari gambar hasil generasi yang disetujui untuk prototipe, dengan bentuk sumber dipertahankan dan tidak mengambil karya pihak ketiga.
- Ekspresi Widi: **tetap memakai** `public/game/assets/portraits/C07.png` 8×1 1536×256. Art generasi Widi 4×2 yang dibuat sesudah screenshot tidak secara otomatis mengganti identitas canonical atau kontrak atlas. Koreksi ini dilakukan pada crop CSS tepat 8 sel, bukan mengarang wajah baru. Periksa seluruh delapan emosi pada browser sebelum produksi.

## Kartu pasar
- Ayu: beli bibit = gambar bungkus bibit; jual timun = peti timun.
- Widi: beli 5 pelet = peti umpan; penjualan ikan = sprite spesies yang dimiliki; stok nol hanya menampilkan pesan ringan.
- Nilai harga, inventory dan save lama **tidak berubah**.

## Momen pintu air
- Pemicu: pemain membuka pintu air dalam misi pribadi Ryan pada fase kedua untuk pertama kalinya.
- Transisi save `sluiceOpen` disimpan **sebelum** animasi visual; `sluiceCutsceneSeen` opsional ditambahkan untuk mencegah pengulangan otomatis. Nilai tidak ada pada save v1 lama diperlakukan sebagai belum ditonton.
- Animasi SVG/CSS asli berisi panorama Pasirluyu, Yanzen, roda berputar, pintu kayu naik, dan air mengalir. Durasi sekitar 4,8 detik; dapat dilewati dengan tombol dan keyboard. Layar mengikuti `prefers-reduced-motion`.
- Setelah unlock, adegan bisa dilihat kembali di YZ Phone → Kronik. Replay **tidak** mengubah progres, keuangan, statistik atau hubungan sosial.
- Animasi menggunakan sprite/layer SVG ringan, bukan streaming video atau GIF runtime yang berjalan saat kontrol masih aktif. GIF untuk preview bisa dibuat kelak dari frame yang sama tanpa mengubah sistem misi.

## QA
1. `npm run typecheck`, `npm run test:game`, `npm run test:portraits`, browser UI tests terkait.
2. Browser verifikasi `ayu-shop-atlas.png` (112×112) dan `widi-shop-atlas.png` (168×112) dapat diakses dan tidak terpotong pada ukuran 56px.
3. Periksa delapan ekspresi Widi di 80px dan 112px. Frame tidak boleh menunjukkan satu bagian wajah lain, garis keluar, atau kepala ganda.
4. Navigasi D-pad punya tombol 44px atau lebih, segitiga centered; jangan mengubah keyboard/input hitboxes.
5. Cutscene hanya ketika misi Ryan fase dua, bukan saat pemain membuka pintu air sebelum misi. Satu kali otomatis lintas reload, dapat skip, dan replay via Kronik tanpa reward kedua.
6. Cek iOS Safari orientasi portrait, Android Chrome dan desktop/fullscreen, termasuk ketika modal lain ditutup.
7. Pastikan deployment preview benar-benar READY dan CI game lulus sebelum merge ke main. Jangan menimpa URL staging production hanya untuk mengetes.

## Ekspansi berikutnya
Gunakan pola visual cutscene ketika momen mempunyai akibat: panen pertama, bantuan warga berhasil, ikan langka, penemuan foto di pintu air. Tidak setiap tugas memerlukan cutscene. Untuk adegan naratif, urutan persiapan → tindakan → konsekuensi dan satu replika dialog lebih kuat daripada efek dekoratif yang diulang.
