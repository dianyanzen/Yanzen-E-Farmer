# Area awal Yanzen — audit dan arah redesign

Basis audit: staging `feat/staging-home-garden-rupiah-20261124` commit `d3bf6b389dad345d615444b4149fce9b9604e46a` dan screenshot pemilik. Ini bukan persetujuan visual atau pernyataan bebas bug.

## Tujuan pengalaman
Pemain keluar dari rumah petani di Pasirluyu, mudah mengenali pintu gudang dan petak kebun, mengakses alat, menanam lalu kembali tidur. Halaman terasa Sunda yang hangat melalui genteng, kayu, bambu dan tumbuhan setempat dengan detail yang terkurasi. NPC, dialog, uang Rupiah dan penyimpanan tetap kompatibel.

## Temuan yang dapat direproduksi
1. Lima PNG interior (`home/bed-01.png`, `home/worktable-01.png`, `home/woven-cabinet-01.png`, `shed/tool-rack-01.png`, `shed/workbench-01.png`) gagal didekode Pillow; loader sebelumnya menganggap lantai dan dinding yang berhasil dimuat sudah cukup untuk memakai interior modular. Phaser juga memperlakukan error loader sebagai kegagalan renderer. Build sukses tidak membuktikan gambar valid.
2. `kebun/cucumber-stage-3.png`, `keranjang-panen-01.png`, `caping-01.png` dan `kupu-kupu-01.png` juga gagal didekode. File yang sama tetap tersimpan untuk penelusuran atau penggantian; jangan mengklaim berkas sudah diperbaiki.
3. Tata letak baru memakai koordinat visual berbeda dari batas navigasi `homeBlocked` yang dibagi rumah dan gudang. Contoh: kasur digambar x=143..249 y=104..178, sedangkan petak dapat dilalui mengikuti pembatas lama. Sebagian furnitur x=342 ke atas berada di luar area jalan x=8..16 tile. Kesesuaian visual-collision memerlukan pengujian runtime, bukan kesimpulan dari build.
4. Aset modular dalam Phaser memakai depth tetap jauh di bawah karakter; Canvas menggambar semua furnitur sebelum karakter. Hubungan depan/belakang perlu disatukan berdasarkan titik kaki.
5. Standar file terpisah belum terpenuhi menyeluruh: loader lama masih menggunakan spritesheet dan fallback komposit. Perlakukan sebagai legacy, bukan bukti migrasi selesai.

## Stabilisasi yang diusulkan di branch ini
Nonaktifkan pemuatan interior modular rusak dan pakai interior yang ada; jangan minta tiga PNG properti kebun rusak. Tahap timun 3 yang rusak menggunakan fallback renderer yang sudah tersedia. Ini mengurangi risiko ruangan tanpa furnitur atau kegagalan pemuatan; bukan desain akhir.

## Blueprint pekerjaan berikutnya
- Ukur body visible bounds dan anchor kaki pada 20px tile, lalu cek skala rumah, gudang dan kebun pada Canvas/Phaser dan mobile.
- Definisikan satu data ruang untuk dimensi, posisi gambar, footprint, collision, titik aksi, kedalaman dan pintu; pastikan denah cocok dengan save lama dan titik keluar aman.
- Bangun ulang rumah terlebih dahulu: pintu ke area sirkulasi, kasur yang bisa didekati, meja/lemari proporsional, ruang gerak yang terlihat dan benar-benar terbuka.
- Terapkan kontrak yang sama pada gudang: rak dapat diakses, jalur pintu tidak tertutup, alat sesuai fungsi.
- Tata halaman dan bedeng: jalan terhubung ke kedua ambang, tanaman dan properti proporsional, lahan tetap bisa dicangkul, disiram dan dipanen, tanpa dekorasi menghalangi rute.
- Produksi ulang satu aset per file dan validasi decode, alpha, skala dan provenance; perbarui manifest dan katalog. Audit dependensi sebelum membuang apa pun.
- Uji rute, interaksi, keluar/masuk, tidur, gudang, kebun, save lama, respons layar sentuh/keyboard, siang/malam, layering, kedua renderer serta screenshot mobile dan desktop. Deploy preview baru setelah pemeriksaan lulus.

## Batas verifikasi
Tidak ada jaminan zero bug. Status READY Vercel berarti build berhasil, bukan bukti tampilan dan gameplay telah diperiksa setelah login. Berkas pengganti dan pemeriksaan visual masih diperlukan.
