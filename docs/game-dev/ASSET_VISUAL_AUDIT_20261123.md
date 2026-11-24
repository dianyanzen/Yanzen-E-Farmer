# Baseline Visual Audit — YZ Farm Life Staging (23 November 2026)

**Basis:** tujuh screenshot permainan yang diunggah pemilik pada 23 November 2026 (IMG_8573.jpeg s.d. IMG_8567.jpeg). Ini audit visual dari tangkapan layar perangkat seluler, **bukan** pengukuran langsung isi piksel aset master, collision engine, atau audit menyeluruh semua file. Screenshot tidak disalin ke repository ini; bukti dapat direproduksi dengan capture staging setelah login dan navigasi ke lokasi yang disebut. Penilaian tetap perlu diperbarui setelah QA runtime.

**Prinsip pembanding:** \`docs/game-dev/YZ_VISUAL_IDENTITY_BIBLE.md\`.

## Ringkasan pola
Banyak aset secara individual berkualitas baik dan memiliki detail menarik, tetapi tingkat kerumitan siluet, palet, kerapatan dekorasi, dan skala fungsional berbeda antar-lokasi. Menambah aset HD tanpa menata *visual hierarchy* akan memperbesar inkonsistensi. Masalah “terlalu ramai” paling jelas pada gudang dan ruko Ayu, sementara kebun menampilkan pola bercocok tanam yang terlalu repetitif. Interior Nani adalah referensi baik untuk interior hangat dengan ruang tengah yang lega.

| Screenshot | Lokasi | Observasi yang terlihat | Diagnosis awal — perlu verifikasi | Putusan arah & prioritas |
|---|---|---|---|---|
| **IMG_8573** | Bantaran Sungai, plot kebun | Kebun berpetak dengan pola tanaman kecil yang sangat repetitif; jalan berkelok dan flora sekitar lebih organik; sebagian objek dekoratif saling bersinggungan. | Kerapatan dan ritme berulang berpotensi mendominasi perhatian; detail terrain belum senada sepenuhnya. | **P1 polish**: bedakan tahap pertumbuhan, tepi kebun, variasi tanah dan negative space; jangan menghilangkan fungsi plot. |
| **IMG_8572** | Pintu air, jembatan, sungai | Kompleks pintu air dan jembatan memiliki siluet jelas dan jadi landmark; beberapa karakter/tanaman/alat dekoratif berada dekat akses air. | Secara visual cukup kuat, risiko yang harus diuji adalah hotspot pancing, jalur dan pembacaan akses jembatan. | **KEEP + P2 polish**: jangan generate ulang landmark yang sudah jelas tanpa alasan. Uji tindakan memancing, jembatan, collision. |
| **IMG_8571** | Pasar — Ayu General Store | Toko dominan, atap teal kompleks, banyak papan/etalase/produk; lebih rinci dan megah daripada mayoritas bangunan dan karakter di sekitarnya. Jalan batu lapang di depan relatif tenang. | Mismatch skala dan tingkat detail dengan rumah pasar; focal point kuat tetapi risiko “terlalu mewah”, NPC kecil dan fasad berat. | **P1 redesign/polish berbasis blueprint**: sederhanakan ornamen yang redundan, pertahankan toko serbaguna besar, periksa tinggi pintu, jarak NPC dan relasi bangunan tetangga. |
| **IMG_8570** | Interior Rumah Nani | Kasur dan meja berada jelas di sisi ruangan; karpet luas di tengah; palet cokelat/hijau dan ornamen bunga terasa hangat. | Referensi internal bagus untuk “berisi tetapi tidak penuh”; area luar ruangan hitam/gelap bisa mengurangi kesan world continuity. | **KEEP + P2 polish**: jadikan benchmark komposisi interior, uji interaksi benda dan transisi pintu. |
| **IMG_8569** | Gang Pasirluyu | Beberapa rumah dengan gaya fasad yang berbeda namun masih bernuansa permukiman; teras dan tangga menuju jalan terlihat; jalan besar mendominasi tengah, vegetasi tersebar. | Perlu kalibrasi skala rumah/teras, pintu dan sambungan tangga secara konsisten; beberapa penghias rumah dan pola jalan belum menyatu. | **P1 world-fit**: blueprint tiap rumah, anchor, underfoot shadow, akses dari tangga ke jalan, dekorasi menempel ke bangunan. Pertahankan variasi identitas rumah. |
| **IMG_8568** | Interior Gudang Peralatan | Banyak rak, hasil panen, pipa, peralatan, karung, drum, keranjang; sebagian besar tepi lantai dipenuhi benda; pintu bawah berdekatan dengan peti. | Beban visual terlalu padat untuk ruang kerja kecil, potensi collision dan ergonomi penyimpanan yang tidak masuk akal; tidak otomatis berarti ada bug. | **P0 usability + P1 redesign**: zoning rak/alat/panen, kurangi dekorasi duplikat, buka koridor angkut dan area di depan pintu; ukur collision dan depth. |
| **IMG_8567** | Interior Rumah Yanzen | Kasur kiri, workstation dan meja kanan, rak di dinding atas, peti/karung/kebun mini di kiri bawah; identitas petani-teknologi terbaca; lantai tengah cukup terbuka. | Detail perabot di tepi masih tinggi dan objek dekoratif bagian bawah sedikit mengganggu aliran gerak; perlu perjelas bed vs storage. | **P1 polish**: kurangi barang redundan dan tata ruang berdasar aktivitas tidur/kerja/simpan; utamakan perabot fungsional. |

## Temuan lintas visual
- **Yang sudah kuat:** penanda Pasirluyu, struktur pintu air, sebagian tile jalan, interior Nani, karakter komoditas lokal, pembedaan toko Ayu dan toko Widi.
- **Yang harus diwaspadai:** tingkat detail Ayu vs rumah warga, overdecorating gudang, repetisi grid kebun, proporsi objek dan karakter, sambungan jalan ke fasad, perbedaan perspektif/outline.
- **Bukan temuan aset langsung:** UI kontrol dan toolbar memenuhi sebagian besar layar; masalah UX mobile harus dicatat dalam audit UI terpisah. Jangan membebani desain bangunan untuk menyelesaikan persoalan antarmuka.
- **Tidak ada dasar dari screenshot untuk memastikan** semua collision, kegagalan tombol, atau jumlah aset redundant; validasi tersebut memerlukan kode dan QA bermain.

## Tindakan terurut
1. **P0:** gudang — area pintu, ruang angkut, hotspots, layer furniture, collision; jangan mengubah fitur penyimpanan alat tanpa tes.
2. **P1:** kontrak family style (world, building, terrain, NPC) dan kalibrasi proporsi.
3. **P1:** toko Ayu — pertahankan fungsi toko besar, sederhanakan detail yang tak membantu pembacaan, tinjau perbandingan dengan pasar/gang.
4. **P1:** jalan dan teras gang, alas bangunan, bayangan, koneksi ke pintu dan jalur NPC.
5. **P1:** variasi plot tanaman, terrain/river edge dan density.
6. **P2:** rumah Yanzen — refinement dekorasi dan fungsi perabot, benchmark interior Nani.
7. **P2:** landmark pintu air — polish seperlunya; hindari redesain yang menghilangkan landmark berkualitas.

## Standar perbandingan yang belum tersedia
Agar audit final bisa objektif, perlu screenshot **satu ukuran viewport dan zoom** untuk semua lokasi berikut:
- lokasi dengan karakter berdiri di depan pintu dan samping bangunan;
- interior dengan karakter dekat kasur/rak/peti;
- sudut pasar memperlihatkan Ayu, Widi, Inggit dan kios dalam satu layout/route map;
- dua renderer Canvas dan Phaser pada mobile/desktop serta siang/sore;
- berkas frame PNG transparan dan skala runtime aktual.

## Batas klaim dan keputusan
Dokumen ini tidak melakukan asset deletion, tidak menyetujui mengganti 248 portret NPC, tidak menambah mekanik barang baru, serta **tidak mengklaim** bukti screenshot otomatis membuktikan bug code tertentu. Semua proposal visual membutuhkan blueprint, QA, dan review pemilik sebelum dimasukkan ke main.
