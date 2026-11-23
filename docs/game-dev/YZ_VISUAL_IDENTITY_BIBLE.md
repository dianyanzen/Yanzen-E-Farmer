# YZ Farm Life — Visual Identity & Asset Design Bible v1.0

**Status:** keputusan arah desain pemilik proyek, 23 November 2026. **Cakupan:** semua aset game (bangunan, interior, pasar, terrain, pertanian, perairan, NPC world sprites, furnitur, props, UI in-world, efek, dan ekspansi). Tidak berlaku bagi aplikasi E-Farmer administrasi pertanian di repo yang sama.

## 0. Identitas yang wajib dipertahankan

**YZ Farm Life adalah dunia farming-life Bandung yang hangat, hidup, sedikit nostalgik, bersahabat, dan konsisten. Detailnya kaya tetapi selektif, sehingga tempat dan aktivitas mudah dibaca pada layar ponsel.**

- **Jelas sebelum ramai.** Pemain harus mengenali pintu, jalur, objek aktif, toko, sungai, dan NPC tanpa menebak fungsi dari ornamen.
- **Satu dunia, banyak karakter.** Rumah, gudang, warung, toko, sawah, pasar, dan sungai punya identitas masing-masing; tetap memakai perspektif, ketebalan detail, material, bayangan, dan palet keluarga yang selaras.
- **Fungsi membentuk arsitektur.** Gudang berisi area kerja dan jalur angkut; toko serbaguna punya frontage jual-beli dan penyimpanan; warung punya area pelayanan dan duduk; rumah punya ruang tinggal dan ambang pintu yang masuk akal.
- **Ruang kosong disengaja.** Hindari mengisi setiap petak dengan tanaman, dekorasi, perabot, papan, peti, atau efek hanya karena tersedia ruang.
- **Identitas lokal tanpa menjadi karikatur.** Referensi Bandung/Jawa Barat: genteng, teritisan untuk hujan, drainase, pagar, teras, tanaman pekarangan, jalan kampung, pasar. Gunakan variasi masuk akal alih-alih menempel semua simbol budaya di setiap objek.
- **Aset terbaik bukan yang paling baru atau paling besar resolusinya.** Aset lama boleh tetap dipakai kalau lebih sesuai, lebih mudah dibaca, dan lebih alami di dunia.

### 1. Bahasa visual yang dianjurkan
| Dimensi | Aturan produksi |
|---|---|
| Media | Detailed HD pixel art / pixel-inspired game art yang *konsisten secara kolektif*, bukan gambar realistik bercampur sprite kecil. |
| Perspektif | Ikuti world camera dan grid game; exterior 3/4 serta interior top-down/3/4 yang kompatibel. Jangan mengganti vanishing angle antarbangunan sembarangan. |
| Palet | Dominan warna bumi hangat, kayu, krem tanah, hijau dedaunan, genteng terakota, air teal/biru yang tertahan. Warna cerah dipakai sebagai aksen cerita, interaksi, dan penanda layanan, bukan untuk setiap detail. Nilai warna final ditetapkan lewat visual calibration, bukan asumsi HEX acak. |
| Material | Bentuk dan respons pencahayaan konsisten untuk kayu, batu, genteng, kaca, air, tanah, tanaman, logam. |
| Cahaya | Sumber cahaya lingkungan koheren; bayangan kontak bangunan harus menapak. Variasi siang/sore/malam berasal dari sistem lighting yang sama. |
| Outline | Tingkat detail/outline seragam pada ukuran tampil. Jangan menyatukan sebuah toko ilustratif sangat halus dengan kios primitif tanpa proses stylization bersama. |
| Kerapatan | Detail terkumpul pada pusat perhatian dan ruang fungsi; koridor, lantai, jalan, tanah terbuka, dan perairan diberi visual rest. Jangan menerapkan angka persentase dekorasi tanpa uji. |
| Mobilitas | Bentuk, proporsi, pintu, furnitur, dan props mendukung karakter 24×32 px pada grid world 20 px. Ukuran master dan ukuran render dipisahkan. |
| UI in-world | Tanda toko, pagar, penanda lokasi, petunjuk interaksi mengikuti skala world. Jangan membuat tulisan kecil tak terbaca pada ponsel. |
| Identitas objek | Visual aktif harus berbeda dari objek dekoratif lewat keterbacaan fungsi dan feedback saat interaksi; tidak perlu semua objek berkilau/berkedip. |

### 2. Peraturan detail dan ruang tenang

**Larangan gaya:** filler foliage massal; pola tanaman berulang tanpa variasi ritme; deretan karung/peti untuk mengisi lantai; empat bentuk kios berbeda digabung dalam satu silhouette; neon/saturasi berlebihan; tanda toko bertumpuk; bayangan ganda; material interior yang saling menabrak; backdrop kotak-kotak/artefak generator tersisa; aset 48×48 upscale sebagai bangunan HD final.

**Kualitas yang dicari:** siluet jelas; 1 focal point per area kecil; 1–2 secondary accents bila relevan; zona lantai/aspal/tanah dengan negative space yang cukup; variasi berkaitan dengan fungsi; repetisi pertanian diselingi tanah/gulma/jalur yang memang logis; detail lebih banyak di lokasi spesial daripada setiap rumah warga.

### 3. Standar komposisi per lokasi

**Rumah Yanzen:** rumah tokoh utama, sederhana namun berkarakter; teras dan akses langsung ke kebun; perabot yang masuk akal; ruang kerja/pengembangan yang dapat dipakai; hubungan visual nyata dengan gudang. Tidak boleh terlihat seperti toko suvenir atau vila mewah yang terlepas dari ekonomi dunia game.

**Gudang Yanzen:** utilitarian; jalan dorong/angkut, rak dan meja kerja; barang disusun berdasarkan jenis (benih, alat, irigasi, hasil panen); barang bukan dekorasi yang menghalangi karakter. Pintu harus cukup terbaca dan akses ke lahan masuk akal.

**Ayu General Store:** bangunan perdagangan utama lebih besar dari kios; barang beragam dan tertata dalam kategori, signage terbaca, depan toko tidak penuh; fungsi jual/beli mengikuti runtime yang memang ada (jangan mengklaim kategori baru aktif hanya karena digambar). Rumah pribadi Ayu adalah bangunan lain.

**Widi Fishing Shop:** ciri khas pancing, umpan, joran, wadah ikan/peralatan sungai; jangan diberi dekorasi generik lapak bibit. Hubungan wajar dengan sungai, pengelola ikan, dan penjualan.

**Warung Inggit:** skala manusiawi, tempat makan/bertemu, frontage dan area servis sederhana. **Rumah warga:** tetap bervariasi menurut penghuni, bukan variasi acak tanpa logika sosial, fungsi atau ekonomi.

**Pasar:** pembagian jalur publik, frontage utama, kios kecil pendukung, zona bongkar, dan titik NPC; hindari gabungan bangunan yang menindih jalan atau mendominasi map. **Gang:** ambang pintu terhubung ke jalur; teras, pot, jemuran, drainase punya letak masuk akal. **Bantaran sungai:** perairan, dermaga, jalan, jembatan, alat memancing, dan tanaman tepian harus mengarahkan pemain, bukan mengaburkan air yang bisa dipancing. **Kebun:** plot yang mudah dibaca, tanaman memiliki fase berbeda, keteraturan beralasan, tidak seluruh tanah diseragamkan menjadi tekstur kotak rapat.

### 4. Kontrak blueprint per bangunan (WAJIB sebelum generate)

Satu \`buildingId\` canonical memiliki:
- \`purpose\`, \`ownerId\` bila ada, \`locationId\`, konteks ekonomi/narasi, style family dan material utama.
- \`tileFootprint\` (area tanah yang dipakai), \`displaySize\` (ukuran render), \`masterSize\`, \`pixelDensity\`, \`perspective\`.
- \`foundationAnchor\`, \`doorThreshold\`, \`entrySpawn\`, \`exitSpawn\`, \`roadConnection\`, \`frontY\`, \`contactShadow\`.
- \`floorPlan\`, koridor berjalan, titik pelayanan NPC, \`collisionPolygons/tiles\`, \`hotspots\`, \`zDepth\`.
- \`layers\`: ground/base, floor-wall, exterior/body, roof/upper foreground, furniture-behind, furniture-front, active objects, shadows/lighting, optional weather.
- \`sourceAssetIds\`, \`runtimeAssetIds\`, provenance, dependency references, checksum, fallback, status QA, version, acceptance screenshot set.

**Urutan kerja:** fungsi dan konteks → lahan dan peta → blockout tile → pintu dan akses → collision dan jalur → proporsi terhadap karakter → konsep/palet → render HD master → layer individual → atlas/runtime → QA perangkat → staging → persetujuan → main.

**Jangan** mengandalkan \`footOffset\` dan patch koordinat berulang sebagai pengganti blueprint; itu alat kompatibilitas sementara. Jangan menghasilkan satu gambar interior lengkap lalu menyebut satu cropping atlas sebagai furniture independen jika alpha background masih terbawa.

### 5. Standar teknis yang mengikuti repo, bukan menggantikannya
- Runtime sekarang: world tile 20px; karakter 24×32px; outdoor game world 640×320px. Verifikasi bila engine berubah.
- Ukuran seperti 112px rumah dan 154px toko adalah **implementasi yang sedang diuji**, bukan standar universal.
- Source/master beresolusi tinggi disimpan terpisah dari runtime/WebP/atlas; resolusi efektif harus diperiksa pada ukuran tampil ponsel, bukan hanya kanvas 1024px.
- Active props punya sprite alpha terpisah, footprint terukur, hotspot dan depth kaki; pemain tidak boleh menginjak kasur/rak atau tertutup benda secara salah.
- Pastikan paritas Canvas/Phaser dan responsif mobile. Tidak boleh ada object, subtitle, toast, atau kontrol game menabrak area gameplay.
- Door-to-path dan elevation/threshold berada di dunia yang sama dengan collision. Semua lorong utama terjangkau dan portal kembali ke posisi benar.
- Variant siang/malam, toko buka/tutup, cuaca, dan season tidak menciptakan objek berganda atau mengubah save tanpa migrasi.
- Jangan menambah mekanik hanya dari gambar (rak, peti, atau etalase dekoratif ≠ fitur gameplay selesai).
- Jangan mengubah aset/kunci identitas NPC canonical, save, quest, game economy, atau aplikasi administrasi E-Farmer hanya karena redesain visual.

### 6. Kriteria penerimaan
**Hard fail (tidak boleh merge):** pintu terhalang; koridor putus; player tertahan/stuck; objek aktif tak bisa dijangkau; collision tidak sesuai benda; clipping parah; PNG checkerboard terbakar; asset path 404; native image ratio terdistorsi; game/save regress; produk/nama NPC tertukar; material utama tidak terbaca pada ukuran mobile.

**Review desainer (butuh persetujuan pemilik):** satu tempat terlihat terlalu ramai; style berbeda dari tetangga; bangunan terlalu megah untuk fungsi/lore; palet tidak serasi; tanaman repetitif; penempatan props terasa artifisial; ukuran rumah tak masuk akal terhadap karakter dan peta.

**Minimum evidence:** before/after pada zoom game, siang dan sore/malam, exterior+interior, desktop dan ponsel, posisi karakter di pintu dan samping furnitur, interaksi, tabel benturan serta hasil tes.

### 7. Aturan aset dari A sampai Z
- **A — Audit** seluruh aset dan pemakaiannya aktual.
- **B — Blueprint** bangunan/lokasi sebelum gambar.
- **C — Canonical identity** pemilik, bangunan, NPC, produk.
- **D — Density** dan ruang visual tenang.
- **E — Exterior** berproporsi dan fungsional.
- **F — Footprint** area tanah sesuai visual.
- **G — Grounding** pondasi, bayangan, kontak tanah.
- **H — Hotspot** interaksi tepat pada benda.
- **I — Interior** modular, tidak bisa diinjak.
- **J — Jalan** terhubung ke threshold pintu.
- **K — Konteks** Bandung, pekerjaan, dan kehidupan dunia.
- **L — Layering** serta foreground dan urutan kedalaman.
- **M — Material** konsisten.
- **N — NPC** akses, quest, identitas dan jadwal tidak rusak.
- **O — Occlusion** avatar tidak menghilang salah lapisan.
- **P — Palette & perspective** bersama.
- **Q — Quality gate** bukti gambar dan tes.
- **R — Reuse** aset bagus sebelum mengganti.
- **S — Scale** relatif karakter, grid, tetangga.
- **T — Terrain** cocok dengan gedung, jalur dan musim.
- **U — Usability** terbaca di mobile.
- **V — Variants** siang/malam, buka/tutup, cuaca.
- **W — World cohesion** tidak terasa kolase generator.
- **X — Cross-renderer** Canvas dan Phaser serupa.
- **Y — YZ signature** hangat, pertanian, lokal, tidak berisik.
- **Z — Zero orphan**: tidak ada referensi rusak, file terganti tanpa audit, atau data lama terhapus sembarangan.

### 8. Prioritas aturan dan tautan kerja
1. Dokumen ini: visi visual lintas kategori dan prinsip penerimaan.
2. \`docs/game-dev/ASSET_REDESIGN_LIFECYCLE.md\`: tindakan terhadap aset lama, deduplikasi, penggantian dan penghapusan.
3. \`docs/game-dev/ASSET_VISUAL_AUDIT_20261123.md\`: observasi baseline dari screenshot 23 Nov; bukan kontrak yang abadi.
4. \`docs/game-dev/HD_ASSET_STANDARD.md\`: spesifikasi HD runtime saat ini; jika angkanya konflik dengan blueprint baru, lakukan migrasi yang diuji dan revisi dokumen, bukan improvisasi.
5. \`AGENTS.md\` + \`.agents/skills/yz-farm-art-director/SKILL.md\`: kewajiban agen untuk semua pekerjaan aset.

Perubahan konsep, palet final, dan penghapusan luas memerlukan persetujuan pemilik setelah meninjau contoh nyata dalam game. Setiap desain baru boleh menambah aset perpustakaan, tetapi **tidak otomatis menjadi runtime**.
