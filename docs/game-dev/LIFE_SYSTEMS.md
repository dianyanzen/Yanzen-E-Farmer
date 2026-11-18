# Dialog, kedekatan, statistik, dan rumah

Implementasi memperluas build `release/yz-life-production-20261117`.

## Cara bermain
- Hadapi Ryan, Nani, atau Inggit lalu tekan E / Aksi. Teks tampil per halaman; tombol Tampilkan teks mempercepatnya. Pilihan jawaban tersedia setelah halaman terakhir.
- Dengarkan (+12), tawarkan bantuan (+20), atau jawab terburu-buru (-8). Poin hanya berubah sekali per NPC per hari; percakapan berikutnya tetap memperbarui ekspresi dan jumlah percakapan.
- Kedekatan 0–1000, level 0–10. Cerita pribadi terbuka pada level 2. Tidak ada jalur romansa dalam pembaruan ini.
- YZ Phone → Kedekatan: level, poin, suasana, jumlah percakapan, status hari ini. Statistik: stamina, XP, level pemain, aksi bertani, panen, percakapan, malam tidur, saldo.
- Pintu rumah adalah pintu bangunan kiri/utara kebun. Berdiri di tile (3,5), menghadap atas, lalu E / Aksi.
- Di rumah, dekati ranjang (tile pemain 9,8), E / Aksi, lalu pilih Tidur sampai pagi. Tidur mengembalikan stamina ke 100, memajukan hari, dan menumbuhkan petak yang disiram.
- Keluar melalui pintu bawah ruangan. Tombol tidur dari luar rumah telah dihapus; model juga menolak pergantian hari di luar ranjang.
- Setiap aksi tani berhasil memakai 4 stamina dan memberi 5 XP. Jawaban sosial pertama ke setiap NPC per hari memberi 8 XP. Level pemain = floor(sqrt(XP/50))+1.

## Penyimpanan dan aset
Save tetap versi 1. Save lama yang belum memiliki location/bonds/stats dimigrasikan dengan nilai awal; progres cerita, tanaman, persediaan, dan saldo dipertahankan. Save baru menyimpan rumah, stamina, statistik, suasana, dan kedekatan dalam JSONB yang sama; tidak perlu migrasi database tambahan.

Potret kini mencakup seluruh 32 karakter dengan delapan ekspresi (256 potret), mengikuti sprite asli. Runtime memakai strip per karakter pada `public/game/assets/portraits/`; lihat [PORTRAIT_CATALOG.md](PORTRAIT_CATALOG.md). Interior rumah dirender dengan Canvas.

## Validasi
- TypeScript dan ESLint untuk berkas implementasi.
- Model cerita lama, kedua akhir cerita, migrasi save, roundtrip JSONB dan isolasi akun.
- Model fitur kehidupan: larangan tidur luar rumah, collision, stamina, percabangan, batas poin harian, unlock level, save rumah.
- Browser desktop dan HP: cerita Bab 1, percakapan, ekspresi, HP, rumah, tidur, reload, keluar, pemulihan save gagal dan kontrol gerak.
- Build produksi Next.js.

Pengujian browser memakai adapter autentikasi/cloud khusus tes. Integrasi cloud produksi belum diuji langsung dalam pembaruan ini.
