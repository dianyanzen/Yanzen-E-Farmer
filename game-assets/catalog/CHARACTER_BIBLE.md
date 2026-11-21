# YZ Farm Life — Nama dan profil karakter

> **ARSIP KARAKTER GENERASI AWAL — BUKAN SUMBER IDENTITAS RUNTIME.**
> Nama pendek, usia, wajah dan detail pekerjaan di bawah adalah rancangan fiksi sebelum roster Docker diperbarui. Pada game aktif, identitas dan portrait resmi harus mengikuti ID dari `deploy/private/residents.json` (Docker), atau snapshot sensitif Vercel Preview `YZ_GAME_RESIDENT_ROSTER_JSON`. Character Bible terbaru dibentuk dengan `scripts/game-characters/complete-docker-bibles.mjs` dan dibaca melalui endpoint YZ Phone saat profil dibuka. Jangan gunakan tabel lama ini untuk menimpa nama, pekerjaan atau portrait Docker. Lihat `docs/game-dev/DOCKER_CHARACTER_BIBLE_SYNC.md`. Seluruh biografi lama adalah fiksi, bukan data individu nyata.


**32 karakter: Yanzen (A01) satu-satunya main character, serta 31 NPC.** Nama NPC memakai nama pendek yang dipilih dan direvisi pengguna, tanpa gelar dan dibuat unik. Pemilihan ini bukan pencocokan identitas orang pada daftar dengan wajah karakter.

Pekerjaan, hobi, dan kepribadian di bawah adalah **rancangan fiktif untuk game**, bukan profil pegawai asli atau kesimpulan faktual dari penampilan. Arah visual membantu variasi peran dan cerita; atribut yang tidak terlihat ditentukan secara kreatif. NIP, nama lengkap, gelar, dan jabatan kepegawaian tidak diimpor.

Sumber data profil: [cast.json](cast.json), field `name`, `occupation`, `hobby`, `personality`, dan `designRationale`. Manifest tiap paket menghubungkan sprite dengan profil melalui ID yang tetap.

## Paket A

| ID | Nama | Pekerjaan | Hobi | Kepribadian |
|---|---|---|---|---|
| A01 | **Yanzen** | Petani dan pengelola kebun | Berkebun, Menjelajah desa | Penasaran, Tekun, Suka membantu |
| A02 | **Nabila** | Perawat kebun bunga | Merangkai bunga, Membuat teh herbal | Ramah, Telaten, Optimistis |
| A03 | **Ryan** | Pengelola irigasi | Memancing, Merakit saluran air mini | Tenang, Praktis, Tegas |
| A04 | **Ayu** | Penjual benih | Mengoleksi benih, Menggambar tanaman | Ceria, Komunikatif, Antusias |
| A05 | **Vicky** | Teknisi alat pertanian | Merakit perkakas, Bermain catur | Analitis, Teliti, Pendiam |
| A06 | **Asep** | Kurir hasil kebun | Bersepeda, Bermain sepak bola | Energik, Spontan, Setia kawan |
| A07 | **Dewi** | Pengelola persemaian | Merawat anggrek, Memasak sayur | Sabar, Penyayang, Teratur |
| A08 | **Astri** | Perajin keranjang | Menganyam bambu, Membuat hiasan rumah | Kreatif, Mandiri, Ramah |
| A09 | **Fajar** | Fotografer desa | Fotografi alam, Mengamati burung | Observatif, Santai, Ingin tahu |
| A10 | **Dadan** | Penjaga kebun bersama | Latihan kebugaran, Merawat bonsai | Disiplin, Dapat diandalkan, Lugas |
| A11 | **Anggi** | Pengelola pasar desa | Memasak bersama, Mengoleksi resep | Supel, Adil, Suka berinisiatif |
| A12 | **Denden** | Pengemudi angkutan panen | Merawat kendaraan, Berkemah | Tangguh, Humoris, Praktis |
| A13 | **Nida** | Penjaga perpustakaan benih | Membaca, Menyusun jurnal tanaman | Tenang, Cermat, Penuh pertimbangan |
| A14 | **Desna** | Teknisi radio desa | Merakit radio, Mendengarkan musik | Logis, Sabar, Suka memecahkan masalah |
| A15 | **Heru** | Pengurus koperasi tani | Bermain bulu tangkis, Merencanakan kegiatan desa | Percaya diri, Kooperatif, Bertanggung jawab |
| A16 | **Khansa** | Perancang sistem kebun | Membuat sketsa tata kebun, Mengerjakan teka-teki | Fokus, Kreatif, Terstruktur |

## Paket C

| ID | Nama | Pekerjaan | Hobi | Kepribadian |
|---|---|---|---|---|
| C01 | **Nani** | Pekebun bunga senior | Menanam melati, Membuat kue tradisional | Hangat, Sabar, Gemar bercerita |
| C02 | **Risky** | Petani kebun buah | Mencangkok tanaman, Memancing | Pekerja keras, Peduli, Bersahaja |
| C03 | **Tatang** | Perajin kayu senior | Membuat mainan kayu, Bermain catur | Bijaksana, Humoris, Telaten |
| C04 | **Desi** | Pembuat roti desa | Mencoba resep roti, Merawat tanaman dapur | Ramah, Cekatan, Perhatian |
| C05 | **Eza** | Pelajar dan peserta klub kebun | Bermain sepak bola, Menanam sayur percobaan | Antusias, Mudah penasaran, Kadang terburu-buru |
| C06 | **Yani** | Mahasiswi pertanian | Membaca buku tanaman, Menggambar jurnal lapangan | Ingin tahu, Rajin, Sedikit pemalu |
| C07 | **Widi** | Pedagang hasil bumi | Mencoba masakan lokal, Bermain bulu tangkis | Luwes, Percaya diri, Pandai bernegosiasi |
| C08 | **Inggit** | Penjual makanan pasar | Bereksperimen dengan resep, Berkebun cabai | Ceria, Cekatan, Kreatif |
| C09 | **Bela** | Ilustrator desa | Menggambar lanskap, Fotografi | Imajinatif, Mandiri, Santai |
| C10 | **Yogi** | Pencatat keuangan koperasi | Mengerjakan teka-teki angka, Menyeduh kopi | Rapi, Teliti, Dapat dipercaya |
| C11 | **Ray** | Pemagang kebun keliling | Menjelajah jalur desa, Membuat jurnal perjalanan | Adaptif, Berani mencoba, Ramah |
| C12 | **Fatihah** | Penjaga toko perlengkapan kebun | Merawat tanaman pot, Menyusun dekorasi etalase | Teratur, Sopan, Teguh pendirian |
| C13 | **Heri** | Penggerak kegiatan kampung | Bermain catur, Mengoleksi cerita rakyat | Ramah, Bijaksana, Suka bermusyawarah |
| C14 | **Arya** | Kurir kebutuhan desa | Merawat sepeda motor, Mencari jalur baru | Gesit, Suka membantu, Optimistis |
| C15 | **Malik** | Perancang peta desa | Menggambar peta, Bermain permainan strategi | Mandiri, Kreatif, Terbuka untuk kerja sama |
| C16 | **Karisma** | Perangkai bunga | Merangkai bunga liar, Melukis | Ekspresif, Ramah, Penuh ide |

## Dasar pilihan kreatif

- **A01 / Yanzen:** Rompi kerja dan pakaian lapangan menjadi arah desain petani utama yang aktif menjelajah.
- **A02 / Nabila:** Tunik sage memberi arah palet untuk kebun bunga; sifat dan minat merupakan pilihan cerita.
- **A03 / Ryan:** Ciri visual lebih matang dan baju kerja ochre cocok untuk rancangan mentor pekerjaan lapangan.
- **A04 / Ayu:** Palet biru lembut dipakai untuk karakter toko benih yang mudah dikenali.
- **A05 / Vicky:** Kacamata dan kemeja teal menjadi ciri desain teknisi; kemampuan teknis ditetapkan untuk cerita.
- **A06 / Asep:** Kemeja jingga dan siluet muda memberi arah karakter kurir yang dinamis.
- **A07 / Dewi:** Kesan visual dewasa dan palet taupe-olive dipakai untuk rancangan pembimbing persemaian.
- **A08 / Astri:** Sanggul dan pakaian terracotta menjadi identitas visual perajin di pasar desa.
- **A09 / Fajar:** Kacamata dan palet plum membedakannya sebagai karakter dokumentasi alam dalam cerita.
- **A10 / Dadan:** Alis tegas dan kemeja hijau menjadi arah desain penjaga kebun; sifat merupakan rancangan fiktif.
- **A11 / Anggi:** Palet mauve-mustard dipakai sebagai penanda visual penghubung para pedagang.
- **A12 / Denden:** Siluet matang dan kemeja merah bata memberi arah karakter transportasi panen.
- **A13 / Nida:** Palet lavender dan navy digunakan untuk rancangan penjaga arsip benih; masker hanya unsur penampilan.
- **A14 / Desna:** Kacamata dan kemeja slate memberi identitas visual teknisi komunikasi desa.
- **A15 / Heru:** Overshirt olive dipakai untuk rancangan karakter yang menghubungkan para petani.
- **A16 / Khansa:** Sanggul tinggi, kacamata, dan palet rose menjadi identitas perancang; keahlian adalah pilihan cerita.
- **C01 / Nani:** Ciri lansia dan motif bunga pada baju memberi arah mentor kebun bunga.
- **C02 / Risky:** Kemeja olive dan ciri visual matang digunakan untuk rancangan petani kebun buah.
- **C03 / Tatang:** Rambut abu-abu, kumis, kacamata, dan topi datar memberi identitas mentor kerajinan.
- **C04 / Desi:** Kardigan krem dan sanggul dipakai sebagai arah visual karakter toko roti.
- **C05 / Eza:** Siluet remaja dan kemeja lilac cocok untuk rancangan pelajar; usia cerita tidak diambil dari data pegawai.
- **C06 / Yani:** Hoodie krem dan kacamata dipakai untuk rancangan peserta belajar pertanian.
- **C07 / Widi:** Kemeja charcoal dan celana beige memberi arah visual pedagang hasil bumi.
- **C08 / Inggit:** Apron pada sprite menjadi petunjuk desain paling langsung untuk usaha makanan.
- **C09 / Bela:** Kacamata dan overshirt olive digunakan sebagai identitas karakter pekerja kreatif.
- **C10 / Yogi:** Kemeja biru polos menjadi arah desain petugas pencatatan koperasi, bukan jabatan pegawai asli.
- **C11 / Ray:** Hoodie dan celana cargo memberi arah karakter pendatang yang belajar dari kebun ke kebun.
- **C12 / Fatihah:** Tunik plum menjadi identitas penjaga toko sipil; atribut jabatan pada referensi tidak diadopsi.
- **C13 / Heri:** Peci, rambut beruban, dan motif baju digunakan untuk rancangan tokoh senior kampung tanpa jabatan resmi.
- **C14 / Arya:** Helm polos dan jaket kerja menjadi petunjuk desain profesi kurir tanpa merek.
- **C15 / Malik:** Perancang peta dipilih untuk variasi pekerjaan dalam cerita, bukan disimpulkan dari kursi roda; mobilitas sprite tetap dipertahankan.
- **C16 / Karisma:** Rambut panjang dan jaket denim memberi identitas visual perangkai bunga dengan gaya kasual.

C15 / Malik tetap menggunakan kursi roda. Pekerjaan dan sifatnya tidak didasarkan pada disabilitas. Perubahan ini hanya menambah profil dan label galeri; gambar, frame, serta status staging aset tetap sama.

## Pemeriksaan profil

Pemeriksaan lokal lulus untuk 32 nama pendek unik tanpa gelar, A01 bernama Yanzen, satu main character dan 31 NPC, serta kelengkapan `occupation`, `hobby`, `personality`, dan alasan rancangan. Nama pada kedua manifest cocok dengan katalog profil. Pemeriksaan hash seluruh PNG dan koordinat 384 frame tetap lulus. Dokumen dan data profil yang diekspor tidak memuat nomor kepegawaian 16–18 digit; lampiran daftar sumber tidak disalin ke repository.

Jalankan `node scripts/game-assets/verify-character-pack.mjs` dan `node scripts/game-assets/verify-catalog.mjs` dari akar repository untuk memeriksa konsistensi katalog. Pemeriksaan ini tidak mengesahkan atribut sebagai fakta tentang orang nyata.


## Character Bible 12 kategori (70 karakter bernama)

Profil terstruktur telah ditambahkan sebagai satu file JSON per karakter di [Character Bible](../characters/profiles/README.md), dengan [indeks karakter](../characters/profiles/index.json). Seluruh **32 A/C** mempunyai dua belas kategori beserta rancangan psikologis, riwayat, relasi, gaya bicara dan perkembangan. Sebanyak **36 N/K** juga memiliki profil ekspansi penuh dalam status konsep; **2 P** hanya cameo fiksi dengan batasan biografi figur publik. Ada **179 ilustrasi Rxxx yang belum menjadi tokoh bernama** dan dicatat pada [inventaris R](../characters/profiles/unassigned-artwork.json).

Sumber canon ini (`cast.json`) tetap menjadi kontrak nama/pekerjaan/hobi/sifat yang sudah ada; usulan baru tidak mengubah data runtime. Validasi melalui `npm run test:game:characters`.
