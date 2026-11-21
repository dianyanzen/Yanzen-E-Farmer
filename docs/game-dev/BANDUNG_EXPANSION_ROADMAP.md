# Roadmap perluasan YZ Farm Life

## Fokus prototipe PC ? empat lokasi, empat karakter

Target rilis internal adalah satu siklus bermain lengkap bersama Yanzen, Inggit, Nani, dan Ryan. Perluasan wilayah dan aktivasi warga katalog masuk tahap sesudah siklus ini lulus uji.

[Harvest Moon: Back to Nature](https://www.bokumono.com/sub/harvest.php) menjadi referensi untuk keterbacaan bidang tanam, batas lahan, dan area kegiatan. [Galeri A Wonderful Life](https://www.storyofseasons.com/awl/gallery/) menjadi referensi untuk landmark yang berbeda antara rumah, alun-alun, dan sungai. [Friends of Mineral Town](https://www.xseedgames.com/games/story-of-seasons-friends-of-mineral-town/) menjadi referensi untuk pengelolaan petak, alat, dan hubungan warga. Peta, palet, fasad, dan aset YZ Farm Life dibuat orisinal dengan identitas Bandung.

| Lokasi | Tata visual dan rute | Kegiatan dan interaksi |
| --- | --- | --- |
| Kebun Yanzen | Teras dan rumah di utara, petak di tengah-kiri, kanal di barat, jalan tanah bertepi rumput menuju Gang di timur. Gunakan paving hanya di area teras dan bangunan. | Keluar rumah, ambil alat, cangkul, tanam, isi gembor, siram, panen, tidur. Pertahankan koordinat petak pada save lama. |
| Gang warga | Simpang yang menghubungkan kebun, pasar, dan sungai. Rumah Nani dikenali dari teras melati. Gunakan satu pagar dan atap berbeda pada rumah tetangga untuk membedakan siluet. | Baca petunjuk arah dan temui Nani. Ambang rumah dapat diklik atau dipakai dengan tombol aksi. Rumah kosong menampilkan ?Terkunci?. |
| Pasar Warga | Pelataran batu hangat, lorong bebas dari akses selatan, etalase Warung Inggit menghadap lorong, area bongkar muat di samping. | Beli bibit, setor pesanan empat timun, lihat jam warung. Uji satu interior warung dengan kasir dan pintu pulang. |
| Bantaran Sungai | Jalur kering menuju pintu air. Bedakan tepian dangkal dan arus dalam, dengan riak animasi sebagai lapisan sendiri. | Temui Ryan di pintu air dan periksa saluran. Objek tepi air punya titik pendekatan di jalur kering. |

### Build yang siap diuji

Empat zona luar memakai material jalan dan tanah yang diperbarui. Kanal Kebun dan Bantaran memakai riak animasi di lapisan terpisah. Warung Inggit di pasar punya interior yang bisa dimasuki selama jam buka. Pintu rumah warga memberi pesan status. Peta utama Phaser menampilkan penanda rute klik dan menggerakkan Yanzen sampai ambang lalu dari sisi tujuan. Poster loading menutupi peta sampai progres dan renderer siap.

### Rutinitas warga

- Nani merawat bunga pagi hari, berada di teras pada sore hari, lalu berjalan masuk ke Rumah Nani.
- Inggit membuka pasar, melayani pesanan, lalu menutup warung dan berjalan pulang melalui gang.
- Ryan memeriksa kebun dan pintu air, lalu berjalan pulang melalui gang. Jadwal publik ditampilkan di YZ Phone dengan petunjuk tempat dan waktu.
- Jalur pemain dan NPC memakai data yang sama untuk petak jalan, tabrakan, gerbang, dan pintu. Perpindahan NPC di depan pemain harus menampilkan langkah aktual. Progres perjalanan dihitung dari jadwal saat save dimuat atau pemain datang dari zona lain.

### Urutan kerja dan verifikasi

1. Buat blockout empat peta dengan koneksi saat ini. Tetapkan ambang, titik keluar, jalur NPC, batas air, dan tinggi fasad. Uji keterbacaan dengan kamera dan skala PC sebelum memfinalkan tileset orisinal jalan, air, dan bangunan.
2. Bereskan langkah Yanzen dan transisi gerbang. Klik tujuan menampilkan penanda jalur, keyboard membatalkan rute klik, dan kamera mengikuti dengan halus. Gunakan animasi menghadap, berjalan, dan memakai alat sesuai arah.
3. Pasang interaksi semua pintu yang terlihat dan uji jadwal pulang tiga NPC. Pastikan hujan hanya outdoor. Pertahankan navigasi dialog, YZ Phone, toko, dan tidur dengan keyboard maupun mouse.
4. Buat poster loading orisinal dari desain kebun yang sudah dipilih. Tahan poster sampai save sudah diterapkan dan satu frame dari peta yang benar siap ditampilkan. Tawarkan coba lagi saat pemuatan gagal.
5. Lulus uji PC dengan save lama dan save baru. Jalankan muat ulang di rumah, keluar, tanam, kunjungi ketiga lokasi lain, setor timun, lihat warga pulang, lalu tidur dan muat ulang. Uji semua transisi dua arah, klik dan keyboard, jam siang dan malam, serta cuaca hujan.

## Yang tersedia sekarang

YZ Phone > Warga memuat 248 profil pada server lokal. KDM dan Farhan memakai potret P01 dan P02 sebagai gubernur dan wali kota dalam cerita fiksi. Tujuh potret unik yang tersisa di empat atlas warga sudah dipakai untuk menambah profesi kota. Entri katalog perlu sprite empat arah, jadwal, dialog, dan penempatan sebelum bisa ditemui di peta.

Paket Atlas Bandung menyediakan 151 peta kelurahan dan 30 peta kecamatan dalam format Tiled, enam rancangan bab, 534 definisi misi, 30 profesi, dan 15 kegiatan malam. Peta bersifat fiksi dan modular. Proyek lokal menyimpan ZIP yang sudah diekstrak di game-assets/imported. Galeri mengambil 38 PNG dan metadata karakter dari paket Atlas Bandung.

## Urutan implementasi

| Tahap | Lingkup | Syarat selesai |
| --- | --- | --- |
| 1. Cimincrang | Bab 2, Selisih satu jam. Impor satu TMJ, definisikan spawn dan pintu pulang, lalu hubungkan petunjuk foto Bab 1. | Pemain bisa berangkat, menyelesaikan misi, simpan, muat ulang, dan pulang. Pilihan foto lama tetap terbaca. |
| 2. Jalur cerita inti | Cisurupan, Pasirjati, Karasak, lalu Bab 6 di Babakan Ciparay. Tambahkan NPC per bab dengan sprite gerak empat arah, jadwal, dialog, dan titik interaksi. | Setiap bab dapat dimainkan dari pembuka hingga penutup. NPC dan pintu memakai koordinat peta yang sama. |
| 3. Profesi dan malam | Mulai dari satu giliran ronda di Pasirluyu dan satu kegiatan malam, kemudian perluas profesi, fauna, dan suasana audio sesuai jalur cerita. | Jadwal, prasyarat, upah, dan konsekuensi dapat diuji. Misi belum selesai dapat dilanjutkan setelah muat ulang. |
| 4. Perluasan kota | Aktifkan peta kelurahan secara bertahap sesuai rute dan cerita yang sudah teruji. Gunakan katalog untuk menelusuri lokasi yang disiapkan. | Setiap lokasi aktif memiliki jalan masuk dan keluar, interaksi yang dapat dijangkau, serta uji renderer dan input PC. |

## Catatan teknis

- Peta Tiled memakai ubin 16 px dan ukuran 26 x 17 petak pada 151 peta kelurahan. Pasirluyu yang bisa dimainkan menggunakan 24 x 16 petak dengan ubin 20 px. Saat mengimpor, baca koordinat sebagai indeks petak dan gunakan transformasi yang sama untuk gambar, tabrakan, spawn, dan interaksi.
- Lapisan Tiled yang dibutuhkan adalah Lingkungan, Tabrakan, dan Interaksi. Validasi tileset eksternal, GID tabrakan, serta keterjangkauan titik aksi sebelum membuka peta.
- SQLite paket berfungsi sebagai sumber desain. Pilih dan validasi data bab dan misi yang akan dipakai. Save pemain disimpan di PostgreSQL lokal. Tambahkan penanda bab dan misi dengan default yang kompatibel untuk save lama.
- Potret konsep N, P, dan K adalah gambar tunggal. Karakter yang akan muncul di dunia perlu sprite, jadwal, dialog, dan aturan interaksi. Pertahankan ID paket agar potret, cerita, dan progres tetap merujuk ke karakter yang sama.


## Audit peta dan bangunan

- Kebun memakai latar 480 ? 320 dengan bangunan, tanah, dan jalan yang sebagian sudah menyatu. Ujung jalan, pagar, dan sambungan antarpeta perlu ditempatkan sebagai lapisan tersendiri supaya tampilan bisa diubah tanpa menggeser tabrakan maupun petak pada save.
- Fasad perlu terlihat berbeda dari siluetnya. Terapkan atap genteng dan teras pada rumah, bukaan jualan dan kanopi pada warung, pintu lebar dan palet lebih gelap pada gudang. Pakai ambang bertekstur, kusen, dan lampu sebagai petunjuk pintu. Ambil rumah, warung, dan halte dari direktori properti Atlas, lalu selaraskan skala, arah cahaya, bayangan, dan palet sebelum menaruhnya.
- Bangun satu peta baru percobaan di Tiled dengan lapisan tanah, jalan, fasad, kanopi, tabrakan, serta objek pintu dan interaksi. Tetapkan ID permanen tiap bangunan. Kaitkan tiap rumah dengan interior, area pintu yang mengikuti gambar, titik muncul, dan pintu pulang. Pakai ulang tata ruang dasar dengan variasi perabot sesuai penghuninya. Uji satu rute lengkap dengan keyboard dan mouse sebelum memperluas.
- Rumah Yanzen dan gudang sudah punya interior. Berikutnya prioritaskan Warung Inggit dengan etalase, meja, rak, dan dapur. Untuk rumah warga gunakan paket furnitur tidur dan ruang keluarga. Untuk layanan kota siapkan lemari arsip, rak perpustakaan, loket, dan kursi tunggu. Kandidat referensi adalah [LPC Building indoors](https://lpc.opengameart.org/static/LPC-Style-Guide/build/assets.html). [Kenney Tiny Town](https://kenney.nl/assets/tiny-town) dan [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon) memberi pilihan ubin 16 px berlisensi CC0 untuk prototipe. Cek lisensi per aset bila memilih LPC.
- Prioritas karakter yang muncul setelah warung adalah penyuluh kebun untuk misi panen, petugas pintu air untuk konflik irigasi, pengelola bank sampah untuk kompos, petugas halte untuk pembukaan rute, serta pustakawan untuk arsip warga. Kader gizi, mekanik, perajin, dan profesi layanan kota lain bisa masuk per kawasan. Tempatkan Farhan pada bab kunjungan pasar dan KDM pada bab pertemuan warga. Buat sprite baru sesuai potret ketika jadwal dan lokasi sudah ditetapkan.

## Audit profesi sehari-hari

Katalog awal kuat di pertanian, kuliner pasar, kerajinan, dan kesenian. Dokter, bidan, pustakawan, montir sepeda, dan pengelola penatu sudah ada. Gelombang profesi kota menambah guru SD, perawat, apoteker, sopir angkot, tukang bangunan, petugas kebersihan, teknisi listrik, kasir minimarket, tukang cukur, petugas laundry hotel, tukang ledeng, teknisi komputer, konselor remaja, pemadam kebakaran, teller, dan satpam.

Prioritas berikutnya adalah petugas loket kelurahan, pengantar surat, polisi lalu lintas, petugas parkir, mekanik motor, pengemudi ojek, guru TK, penjaga sekolah, petugas lingkungan sungai, dan petugas layanan darurat. Kelompokkan calon NPC per lokasi supaya profesinya punya aktivitas. Sekolah dapat memulai misi kebun kelas. Sopir angkot dapat memberi petunjuk rute. Petugas kebersihan dapat menghubungkan pasar dengan misi kompos.
