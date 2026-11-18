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

## Aksi kontekstual dan pertukaran alat
- Tombol **E / Aksi** membaca petak di depan: pintu → masuk/keluar, kasur → tidur, NPC → dialog, objek → inspeksi, tanah siap tanam → tanam tangan kosong, tanaman matang → panen tangan kosong, petak kosong → cangkul aktif, tanaman belum disiram → gembor aktif. Tanpa target, tidak ada perubahan progres atau stamina.
- Alat aktif terlihat di HUD dan hanya alat dalam tas dapat diganti lewat Q/R, angka 1–9, atau tombol alat dan panah ‹/› pada HP. Cangkul/gembor terbatas pada petak kebun; alat lain masih direncanakan.
- Alat aktif, isi tas, isi gudang, dan tingkat tas disimpan dalam JSONB save versi 1. Save lama dimigrasikan tanpa mengubah cerita, saldo, atau tanaman.
- Tidur mensyaratkan karakter **menghadap kasur**. Periksa lemari/meja saat ini hanya menampilkan informasi; belum ada sistem furnitur/pakaian.
- Inspirasi berasal dari pola farming klasik; tidak memakai aset maupun kode Harvest Moon.

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

## Gudang, kapasitas tas, dan aksi otomatis
- **Menanam dan memanen menggunakan tangan**. Saat menghadap tanah yang sudah dicangkul, tombol E/Aksi menanam satu bibit dari persediaan. Saat menghadap tanaman matang, E/Aksi langsung panen, meskipun memegang kapak atau alat lainnya.
- **Cangkul** hanya berfungsi pada petak tanah kosong; **gembor** hanya digunakan untuk menyiram tanaman yang membutuhkan air. Keduanya harus dibawa dan sedang dipilih. Petak yang membutuhkan alat menampilkan pesan alat yang diperlukan.
- Gudang berada di sebelah utara peta awal (pintu tile 17,4). Berdiri di (17,5) menghadap atas dan tekan E; interior terpisah. Di dekat rak dalam gudang (pemain tile 9,8 menghadap atas), E membuka daftar alat dan katalog.
- Perpindahan alat dan peningkatan tas hanya dapat dilakukan saat di depan rak gudang. Awal permainan membawa cangkul dan gembor (2/3 slot); gudang menampung kapak, sabit, joran, beliung sebagai aset peralatan potensial **belum aktif**.
- Tas Lv. 1=3 slot, Lv. 2=5, Lv. 3=8, Lv. 4=12. Upgrade perlu saldo dan level pemain (lihat `BAG_UPGRADE_COSTS` / `BAG_UNLOCK_LEVELS`). Hotbar hanya menampilkan item yang dibawa, dengan Q/R dan angka 1–9.
- Katalog saat ini berisi **44 jenis alat dan fungsinya**; hanya cangkul dan gembor punya aksi gameplay. Alat berstatus `planned` tidak memberikan fungsi sebelum map/hewan/ikan/tambang ditambahkan.
- Tindakan menanam/memanen bukan item alat. Bibit dan panen adalah persediaan terpisah, tidak memakan slot tas peralatan.
- Migrasi save v1 memindahkan logika alat lama `seed`/`harvest` ke aksi tangan tanpa menghapus progres quest, bibit, panen, atau saldo.
