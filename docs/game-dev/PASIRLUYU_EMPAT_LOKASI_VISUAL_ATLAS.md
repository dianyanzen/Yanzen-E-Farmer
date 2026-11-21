# YZ Farm Life — Dokumentasi Integrasi Visual 4 Wilayah Pasirluyu & Pembesaran Peta

**Dokumen Revisi Teknis & Artistik**

**Tanggal:** 20 November 2026
**Status:** Terimplementasi, Terverifikasi, dan Lulus Seluruh Unit Test (`npm run test:game` & `npm run build`)

---

## 1. Ringkasan Eksekutif & Sasaran Desain

Berdasarkan permintaan dan arahan dari gambar konsep master pixel-art 2×2, proyek **YZ Farm Life Bandung (Pasirluyu, Regol)** diperbarui secara menyeluruh agar:
1. **Benar-benar merefleksikan visual dan estetika otentik pedesaan Sunda/Bandung** sebagaimana tampak pada gambar referensi master 4 kawasan.
2. **Ukuran peta diperbesar dan diseragamkan:** Seluruh 4 kawasan dunia luar (*Field/Kebun*, *Gang Pasirluyu*, *Pasar Tradisional*, dan *Bantaran Sungai*) memiliki ukuran yang **sama besar (seragam)** dengan proporsi seimbang dalam tata letak kisi 2×2.
3. **Kamera & Eksplorasi Lebih Luas:** Kamera pemain tidak lagi terkunci statis di kebun; pemain kini dapat menjelajah dengan pelacakan kamera halus (*smooth dynamic camera tracking*) di seluruh kawasan.
4. **Dokumentasi Lengkap:** Mencatat seluruh analisa visual gambar referensi, struktur koordinat matematis, integrasi aset beresolusi tinggi, dan berkas kode yang dimodifikasi.

---

## 2. Analisis Mendalam 4 Kuadran Gambar Referensi

Gambar referensi menampilkan panorama desa agraris-urban Pasirluyu dalam format kisi 2×2 dengan gaya *16/32-bit pixel art* hangat dan detail lingkungan yang sangat kaya:

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ KUADRAN 1 (Kiri Atas):                │ KUADRAN 2 (Kanan Atas):               │
│ Kebun Petani & Rumah Yanzen (Field)   │ Pemukiman Warga (Gang Pasirluyu)      │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ KUADRAN 3 (Kiri Bawah):               │ KUADRAN 4 (Kanan Bawah):              │
│ Pasar Tradisional & Warung Inggit     │ Bantaran Sungai, Pintu Air & Sawah    │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### 2.1. Kuadran 1: Kebun Petani & Rumah Yanzen (`field`)
* **Rumah Tinggal Pemain (Rumah Yanzen):**
  * Rumah panggung kayu tradisional berpilar kokoh dengan atap genteng terakota merah-bata khas Jawa Barat.
  * Teras depan berlantai papan kayu terbuka dengan pot tanaman hias dan karung-karung hasil panen di sisi beranda.
  * Titik masuk pintu depan sejajar dengan koridor jalan setapak.
* **Gudang Perkakas & Bengkel Kerja (Shed):**
  * Struktur kayu terbuka di samping kanan rumah.
  * Dilengkapi dinding gantungan perkakas (tali tambang, roda gerobak kayu, cangkul, sabit, keranjang jerami) dan gentong penyimpanan.
* **Jalan Setapak Tanah (Dirt Paths):**
  * Jalan setapak tanah liat padat alami yang meliuk dinamis dari beranda rumah dan gudang, bercabang ke arah kebun sayur, kandang ayam, dan gerbang timur.
* **Lahan Pertanian 4 Bedengan (4 Crop Beds):**
  * Lahan olahan teratur berbentuk 4 bedengan gembur paralel:
    * **Baris 1:** Kol / kubis bulat hijau segar.
    * **Baris 2:** Tanaman umbi/cabai/akar rimbun.
    * **Baris 3:** Terong ungu siap petik.
    * **Baris 4:** Sawi/pakcoy hijau segar.
* **Kandang Ayam Panggung Tradisional (Chicken Coop):**
  * Kandang bambu bertingkat dengan atap rumbia/jerami di area tenggara.
  * Area umbaran berpagar kayu renggang dengan pintu palang kayu, tempat pakan (palung), serta ayam kampung putih dan cokelat yang berkeliaran di halaman.
* **Saluran Irigasi Berbatu (Canal Stream):**
  * Parit saluran air jernih berdasar batu kali di tepi barat (kiri), dilengkapi jembatan batu lengkung kecil, rumpun pohon pisang, dan semak berbunga liar.
* **Karakter Pemain:** Berdiri di tengah percabangan jalan kebun mengenakan kemeja rompi, celana gelap, dan sepatu bot kerja.

---

### 2.2. Kuadran 2: Pemukiman Warga Pasirluyu (`gang`)
* **Rumah Nani (Kanan Atas):**
  * Atap genteng glasir hijau lumut (*green glazed tile roof*), dinding berlepa putih bersih, jendela kayu khas priangan.
  * Kanopi teritisan depan dipenuhi sulur bunga melati putih yang mekar rimbun, pot bunga marigold kuning, serta figur Nenek (Nani) bersanggul kebaya menyapa ramah di ambang pintu.
* **Rumah Warga Tetangga (Kanan Bawah):**
  * Atap genteng terakota merah tanah, jendela berdaun kayu berterali, bangku santai kayu panjang di beranda samping, pot tanaman hias warna-warni.
* **Area Domestik Jemuran Tradisional:**
  * Tiang kayu dengan tali jemuran merentang di kiri atas, memajang kain dan pakaian warna-warni (krem, biru, merah) yang sedang dijemur di bawah sinar matahari pagi.
* **Dinding Talud / Undakan Terasering Batu Kali:**
  * Struktur teras penahan tanah dari susunan batu kali bulat di sisi barat, menyangga taman bunga berundak yang tertata rapi.
* **Persimpangan Jalan Tanah Desa (Crossroad):**
  * Jalur perempatan lebar menghubungkan:
    * **Barat:** Menuju Kebun Yanzen.
    * **Utara:** Menuju Taman Desa / jalan utara.
    * **Selatan:** Menuju Bantaran Sungai dan Pasar.
    * **Timur:** Menuju Gang Timur.
* **Vegetasi:** Rumpun pohon pisang berdaun lebar, pohon peneduh rindang berbatang kokoh, tanaman hias puring berdaun merah tua, dan semak bunga kuning.

---

### 2.3. Kuadran 3: Pasar Tradisional Pasirluyu & Warung Inggit (`pasar`)
* **Alun-Alun Pasar Ubin Batu (Cobblestone Square):**
  * Lantai lapangan pasar beraspal/berubin batu kali tersusun rapi (*cobblestone paving*), memberikan kesan area publik yang bersih dan hidup.
* **Warung Inggit (Sentra Kuliner & Sembako Desa):**
  * Bangunan warung kayu beratap genteng terakota di sudut timur laut.
  * Kanopi peneduh kain kanvas motif garis oranye-putih (*striped awning*).
  * Meja pajangan depan dengan toples-toples kaca jajanan pasar dan kerupuk beraneka warna tutup toples.
  * Meja dan bangku kayu panjang untuk pelanggan makan di luar.
  * Tempayan/gentong tanah liat besar untuk cadangan air bersih di samping pintu warung.
* **Kios Sayur Berkanopi Biru (Kiri Atas):**
  * Kios kayu beratap terpal biru cerah, memajang keranjang-keranjang kubis, wortel, umbi-umbian, dan sisir pisang matang yang tergantung.
* **Lapak Sayur Berkanopi Krem (Kiri Bawah):**
  * Meja dagangan kayu beratap kanvas krem/tan, memajang peti-peti kayu berisi terong, tomat merah, kubis, dan keranjang anyaman bambu berisi daun bawang/seledri segar.
* **NPC Pedagang (Inggit):**
  * Figur pedagang ramah bercelemek putih berdiri menyambut pembeli di tengah alun-alun pasar.
* **Akses Selatan:** Pagar kayu rendah dengan pilar batu pembatas yang mengarahkan pembeli ke jalan tanah arah selatan.

---

### 2.4. Kuadran 4: Bantaran Sungai, Pintu Air Irigasi & Sawah Terasering (`sungai`)
* **Aliran Sungai Jernih (Turquoise River):**
  * Badan sungai lebar mengalir dari utara ke selatan di sisi barat dengan air berwarna biru kehijauan jernih, memperlihatkan bebatuan kali halus di tepian dan dasarnya.
* **Pintu Air Bendungan Irigasi Tradisional (Wooden Sluice Weir):**
  * Pintu air pengatur debit air berbahan kayu ulin tebal dengan roda putar kayu/besi di atasnya untuk menaik-turunkan pintu air.
  * Didukung fondasi dinding batu kali kokoh dan anak tangga batu kali bagi petugas irigasi.
  * Limpasan air berbusa putih (*foaming rapids*) mengalirkan air ke parit irigasi timur.
* **Jembatan Kayu Penyeberangan (Wooden Footbridge):**
  * Jembatan balok kayu kokoh melintang di atas sungai pada sisi selatan, dilengkapi pagar pengaman kayu horizontal di kedua sisinya.
* **Sawah Terasering Berundak (Rice Terraces):**
  * Petak-petak sawah hijau berundak di sebelah timur jalur setapak, digenangi air irigasi yang tenang dengan rumpun bibit padi muda.
* **Rumpun Bambu Rindang (Bamboo Grove):**
  * Deretan rumpun bambu hijau lebat menjulang tinggi di tepi jalan setapak dan bantaran sungai, memberikan nuansa sejuk alami khas Priangan.
* **NPC Petani (Ryan):**
  * Figur pengelola irigasi mengenakan topi caping anyaman bambu tradisional dan rompi berdiri di dekat pintu air memantau ketinggian muka air.

---

## 3. Struktur Dimensi, Pembesaran Peta & Keseragaman Ukuran

### 3.1. Ukuran Peta Sama Besar di Seluruh Dunia (Uniform Sized Worlds)
Sesuai arahan *"sepertinya setiap world ukuranya sama besar"*, keempat dunia kini dirancang dan dirender dengan dimensi geometris yang identik:

| Parameter | Dimensi Teknis | Rasio Aspek | Keterangan |
|---|---|---|---|
| **Master Grid 2×2** | **1536 × 1024 px** | 3 : 2 | Menampung 4 kuadran sekaligus |
| **Ukuran Setiap World (HD)** | **768 × 512 px** | 3 : 2 | Resolusi tinggi master pixel art |
| **Ukuran Setiap World (Standard Grid)** | **480 × 320 px** | 3 : 2 | 24 tile horizontal × 16 tile vertikal (20px/tile) |
| **Tile Grid Scale (HD Native)** | **32 px / tile** | 1 : 1 | $24 \times 32 = 768\text{ px}$, $16 \times 32 = 512\text{ px}$ |

### 3.2. Keselarasan Matematis & Kompatibilitas 100%
Keuntungan arsitektur ini adalah **keselarasan faktor pengali $1.6\times$ yang sempurna**:
$$\frac{768}{480} = 1.6 \quad\text{dan}\quad \frac{512}{320} = 1.6$$
$$\frac{768}{24\text{ tile}} = 32\text{ px/tile} \quad\text{dan}\quad \frac{512}{16\text{ tile}} = 32\text{ px/tile}$$

Artinya:
* **Seluruh koordinat logika game (0..23, 0..15)** tidak perlu diubah secara membingungkan.
* **Sistem deteksi tabrakan (`areaBlocked`), portal jalan (`ROUTE_PORTALS`), titik pintu (`home-door`, `shed-door`, `bed`), dan posisi NPC** tetap valid 100%.
* **Sistem berkas simpanan game (`GameState` JSONB v1)** tidak mengalami kerusakan atau korupsi data.
* **Seluruh unit test otomatis (`tests/game-stage1.mjs`, `tests/game-life.mjs`, `tests/game-living-world.mjs`, dll.) tetap hijau 100%**.

---

## 4. Rincian Berkas yang Dibuat & Dimodifikasi

### 4.1. Berkas Aset Visual Baru
* `public/game/assets/pasirluyu/worlds/field-768.png` & `field-480.png`: Latar master otentik Kebun Yanzen.
* `public/game/assets/pasirluyu/worlds/gang-768.png` & `gang-480.png`: Latar master otentik Gang Pasirluyu.
* `public/game/assets/pasirluyu/worlds/pasar-768.png` & `pasar-480.png`: Latar master otentik Pasar Tradisional & Warung Inggit.
* `public/game/assets/pasirluyu/worlds/sungai-768.png` & `sungai-480.png`: Latar master otentik Bantaran Sungai, Pintu Air & Sawah.
* `public/game/assets/pasirluyu/worlds/pasirluyu-master-overview.png`: Gambar panorama gabungan 2×2 resolusi 768×512 untuk aplikasi Jelajah pada YZ Phone.

### 4.2. Berkas Kode Sumber yang Diperbarui

#### 1. `src/lib/game/modular-outdoor.ts`
* Mendaftarkan tekstur master 4 dunia (`fieldMaster`, `gangMaster`, `pasarMaster`, `sungaiMaster`, beserta varian HD) ke dalam `outdoorSources`.
* Memperbarui `drawModularGround`: Bila citra master tersedia, fungsi langsung merender karya seni pixel master resolusi penuh pada kanvas dunia, lengkap dengan marka penutup jalan (`drawRouteClosures`) dan papan petunjuk (`drawSignposts`). Bila belum selesai dimuat, tetap memiliki *fallback prosedural* yang aman tanpa flicker.
* Mengoptimalkan `outdoorObjects`: Ketika master art aktif, objek bangunan statis yang sudah terlukis rapi di latar tidak diduplikasi lagi, mencegah bayangan tumpang tindih (*z-fighting*).

#### 2. `src/lib/game/phaser-world.ts`
* Memuat seluruh varian master art ke dalam pustaka tekstur Phaser.
* Membuka kunci kamera kebun (*unfreeze field camera*): Menghapus pembatasan kamera statis di kebun sehingga kamera bergerak dinamis mengikuti pemain di seluruh 4 kawasan (*field, gang, pasar, sungai*) dengan skala rendering yang konsisten.
* Mengintegrasikan tekstur master dunia ke layer latar belakang *YZWorldScene*.

#### 3. `src/lib/game/draw-world.ts`
* Memastikan renderer Canvas 2D fallback mendeteksi ketersediaan master art dan tidak menduplikasi objek statis yang telah dilukis di latar belakang.
* Menjaga overlay petak pertanian dinamis (tanah basah, bibit tumbuh, buah timun, panen emas) terlukis presisi di atas 4 bedengan kebun.

#### 4. `src/app/game/game-client.tsx`
* Memperbarui antarmuka aplikasi **Jelajah** pada YZ Phone (`phoneTab === "map"`).
* Menyematkan kartu gambar peta 4 wilayah terpadu (*master overview 2×2*) sehingga pemain dapat melihat orientasi geografis seluruh desa Pasirluyu secara intuitif.

---

## 5. Hasil Verifikasi & Jaminan Kualitas (QA)

| Kategori Pengujian | Perintah | Hasil | Keterangan |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` | **PASS (0 error)** | Seluruh tipe data & properti valid |
| **Linting & Kode Bersih** | `npm run lint` | **PASS (0 error)** | Standar Next.js & ESLint terpenuhi |
| **PostgreSQL Database** | `npm run test:database:game` | **PASS** | Isolasi akun & penyimpanan save game aman |
| **Model & Alur Bertani** | `node tests/game-stage1.mjs` | **PASS** | Siklus cangkul, tanam, siram, panen timun berjalan |
| **Sistem Sosial & Warga** | `node tests/game-life.mjs` | **PASS** | Dialog, tidur di rumah, siklus hari normal |
| **Atlas & Dunia Hidup** | `node tests/game-living-world.mjs` | **PASS** | Transisi 4 peta, rute NPC, dan collision utuh |
| **Registri Kota Bandung** | `node tests/game-bandung-world.mjs` | **PASS** | 30 kecamatan & 151 kelurahan terdaftar |
| **Renderer Phaser Prototype** | `npm run test:game:phaser` | **PASS** | Interaksi 4 papan arah & navigasi lancar |
| **Produksi Standalone** | `npm run build` | **PASS (Exit 0)** | Halaman statis & dinamis Next.js berhasil dikompilasi |

---

## 6. Analisa Kendala "Game Masih Tidak Full" & Solusinya

Berdasarkan screenshot browser game, teridentifikasi 3 penyebab mengapa tampilan game tampak belum penuh ("tidak full"):

### A. Container Docker Belum Di-rebuild
- **Temuan:** Service web diakses melalui Docker compose pada port 3002. Container `yz-farm-life-app-1` telah berjalan sebelum pembuatan file aset `public/game/assets/pasirluyu/worlds/` dan modifikasi kode.
- **Dampak:** Browser masih menyajikan bundle JavaScript dan aset lama (tampilan ladang prosedural dengan 3 bangunan sejajar dan petak timun 6x9).
- **Solusi:** `Dockerfile` diperbaiki agar menyalin seluruh direktori `public/` (`COPY --from=builder /app/public ./public`), kemudian container di-rebuild dan di-restart (`docker compose build app && docker compose up -d app`).

### B. Border Kanopi Hutan Samping (`yz-field-surround`) & Camera Bounds
- **Temuan:** Pada kode Phaser lama, area `field` memiliki objek `yz-field-surround` selebar 1440px dengan pohon di koordinat x negatif ($-480$ s/d $0$) dan x positif ($+480$ s/d $+960$). Kamera diatur `camera.removeBounds()`.
- **Dampak:** Pada layar monitor desktop (16:9/16:10), kamera memperlihatkan area di luar batas kebun. Kebun tampak sempit di tengah diapit "hutan buatan" di kiri dan kanan, bukan peta penuh yang mengisi layar.
- **Solusi:**
  1. `this.surround.setVisible(field && !hasMaster)`: dinonaktifkan saat aset master aktif.
  2. Kamera dikunci seragam di semua 4 lokasi: `camera.setBounds(0, 0, WIDTH, HEIGHT)`. Kamera tidak akan pernah menampilkan margin pohon sintetis di luar batas peta asli.

### C. Konsistensi Skala Viewport & Fullscreen
- Semua 4 area kini memiliki aspek rasio seragam $3:2$ ($768 \times 512$ / $480 \times 320$).
- Mode Phaser `Scale.EXPAND` dengan zoom dinamis memastikan kanvas membentang penuh mengisi area bermain tanpa letterboxing palsu atau artefak tepi.

---

## 7. Kesimpulan & Panduan Selanjutnya

Game **YZ Farm Life** kini telah sepenuhnya menampilkan tampilan visual pixel art pedesaan Pasirluyu yang indah, seragam, dan luas persis seperti gambar konsep master yang diberikan.

Pemain dapat:
1. Menikmati pemandangan kebun yang luas, kandang ayam, dan parit batu alami.
2. Berjalan melintasi batas timur menuju Gang Pasirluyu yang asri dengan Rumah Nani bergenteng hijau.
3. Mengunjungi Pasar Tradisional berlantai batu dengan Warung Inggit dan lapak-lapak sayur segar.
4. Menyeberangi jembatan kayu di atas sungai biru kehijauan menuju pintu air bendungan dan sawah terasering.
5. Membuka ponsel YZ Phone untuk melihat peta desa 4 wilayah terpadu kapan saja.
