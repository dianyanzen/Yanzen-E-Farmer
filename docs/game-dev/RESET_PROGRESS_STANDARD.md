# YZ Farm Life — Standar Reset Seluruh Progres

## Makna tombol

**Keluar akun** menutup sesi dan mempertahankan seluruh save permainan.

**Reset akun** berarti **mulai permainan baru** untuk pemilik akun yang sedang masuk. Pemain tetap bisa masuk dengan akun yang sama. Semua catatan progres milik akun itu diganti oleh `newGame()`. Jangan memakai `TRUNCATE TABLE yz_game_saves` atau menghapus tabel pengguna/autentikasi: itu akan menghilangkan progres pemain lain.

## Cakupan wajib

Reset tidak boleh menyisakan progres dalam save lama:

- Kedekatan dan memori interaksi seluruh NPC: `bonds`, poin kedekatan, jumlah percakapan, pilihan terakhir, suasana hati dan hari interaksi.
- Seluruh cerita utama, foto, percabangan, pilihan dialog, pembukaan dunia, `story`, `personalQuests`, `nurseryChecked`, `sluiceOpen` serta pengembangan cerita di kemudian hari.
- Misi yang sudah diterima, sudah selesai, hadiah, dan progres Kronik/YZ Phone yang dihitung dari save.
- Hari, jam, lokasi dan posisi pemain, progres tutorial, level, XP, stamina, langkah, statistik, pencapaian, aktivitas sosial dan aktivitas produksi.
- Kebun, tanaman, pertumbuhan, penyiraman, panen, bibit, uang, tas, alat yang dibawa, barang gudang dan semua pembelian.
- Ikan yang diperoleh, jumlah tangkapan, umpan, hasil penjualan, inventaris dan statistik memancing.

**Kondisi setelah reset harus persis sama dengan pemain pertama kali masuk.** Tidak berarti semua angka harus literal nol: uang, bibit dan peralatan awal harus kembali ke nilai default dari `newGame()`, bukan nilai bekas progres.

## Batas yang tidak ikut dihapus

- Auth, password, akun login, sesi yang sah dan identitas pemain yang terkait ke akunnya.
- Canonical Character Bible, identitas/portrait warga, Wargapedia publik, aset game, data dunia statis dan lore.
- Progres akun **lain** dan data farm operational non-game.

## Kontrak implementasi

1. YZ Phone menampilkan dialog `alertdialog` yang menjelaskan dampak reset dan pilihan **Batal, simpan progres** (aman/default) / **Ya, reset semua progres**.
2. Setelah konfirmasi, hentikan autosave, tunggu antrian penyimpanan yang sedang berlangsung, dan kirim `POST /api/game/reset`.
3. Server memastikan autentikasi dan same-origin, lalu membuat **sendiri** `newGame()`; upsert hanya `public.yz_game_saves` dengan `user_id = auth.uid()`. Browser tidak menentukan state yang harus dianggap sebagai reset.
4. Versi `updated_at` bertambah monoton. Semua PUT save biasa menyertakan `expectedUpdatedAt` dari GET/PUT terakhir. Save usang yang tidak cocok mendapat 409 dan tidak boleh menimpa reset.
5. Beri tahu tab lain lewat `BroadcastChannel` dan reload halaman untuk membuang seluruh state runtime; pada perangkat lain, konflik save memaksa reload.
6. Jika reset gagal, jangan menandai progres sebagai terhapus; tampilkan masalah dengan aman dan pertahankan catatan yang tersedia.

## Gerbang regresi

- Simulasikan akun dengan hubungan NPC meningkat, misi aktif/selesai, cerita bercabang, kebun, uang, XP, barang, tangkapan dan statistik yang sudah berkembang.
- Setelah reset, `safeLoad(savedAfterReset)` harus **deep-equal** dengan `safeLoad(newGame())`.
- Uji `phoneChronicle`: tidak ada bab selesai, misi aktif/selesai, atau kenalan lama.
- Uji kondisi awal barang, uang, dan bibit; pastikan NPC mempunyai poin 0.
- Uji save lama berdasarkan revisi sebelumnya tidak dapat tersimpan lagi.
- Uji akun lain dan data karakter canonical tidak berubah.
- Periksa dialog reset di ponsel: terpusat dalam YZ Phone, tidak menabrak pengontrol permainan.

**Aturan ekspansi:** Setiap penambahan field progres wajib masuk ke kontrak `GameState`, `safeLoad`, `newGame`, serta tes reset penuh. Jangan menyimpan progres tersembunyi di storage lain tanpa mekanisme reset yang ikut diuji.
