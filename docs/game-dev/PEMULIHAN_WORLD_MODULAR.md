# Pemulihan dunia modular · 20 November 2026

Permintaan pemain adalah kembali ke kebun sebelum percobaan atlas empat gambar. Dokumen PASIRLUYU_EMPAT_LOKASI_VISUAL_ATLAS.md menjelaskan percobaan terdahulu. Acuan tampilan kebun untuk pemulihan ini adalah [tangkapan layar kebun](../../game-assets/generated/terrain/kebun-yanzen-review.png).

Kode yang dibangun memakai drawModularGround dan outdoorObjects untuk keempat lokasi. Kamera kebun menampilkan seluruh petak dengan hutan dekoratif di tepi layar lebar. Setiap lokasi luar berukuran 24 × 16 tile, masing-masing 20 piksel. Paket 16 aset kebun luas tersedia untuk iterasi berikutnya.

Build aplikasi sebelum pemulihan disimpan secara lokal dengan tag Docker yz-farm-life-app:sebelum-pemulihan-1926. Perintah pemulihan membangun service app dan memperbarui container app saja. Suite npm run test:game lulus, termasuk enam transisi, empat lokasi, jadwal NPC, dan simpan/muat.

Untuk revisi berikutnya, bandingkan tangkapan layar di posisi dan jam permainan yang sama. Referensi kebun menempatkan kanal di kiri, rumah dan gudang di utara, bedeng interaktif di barat daya serta kandang dekat gerbang. Gang berpusat pada halaman dan teras, pasar pada pelataran batu dan kios, sungai pada pintu air dan jembatan. Pembesaran empat peta merupakan tahap terpisah. Catat ukuran aktual, perubahan posisi pintu, hasil uji save lama, serta gambar sebelum dan sesudah setiap tahap.
Sumber pemulihan adalah snapshot build Docker 448, versi kebun modular pukul 18.26 WIB. Perbandingan folder src menemukan empat file berbeda, yaitu game-client.tsx, draw-world.ts, modular-outdoor.ts, dan phaser-world.ts. Keempatnya dipulihkan dari snapshot tersebut.
