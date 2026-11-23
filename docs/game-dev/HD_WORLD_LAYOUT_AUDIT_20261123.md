# YZ Farm Life — Audit Geometri Interior, Pasar, dan Jalur Rumah (23 November 2026)

**Scope**: branch `feat/yanzen-modular-housing-20261123`, dua renderer Canvas/Phaser, Vercel staging. Ini dokumen *implementasi visual*; data karakter dan save tetap authoritative di `model.ts`.

## 1. Observasi dan penyebab
1. Interior HD sebelumnya digambar sebagai **satu background komposit**. Karakter selalu dirender di atas perabot tanpa urutan kedalaman, sehingga kasur, peti, rak, dan meja seolah bisa diinjak.
2. Collisions rumah/gudang masih berasal dari susunan furnitur lama. Aset HD kini memiliki **12 kelompok furnitur** yang berbeda tata letaknya.
3. Pasar mempertahankan benda dari layout kios kecil: pada y≈159, lapak anyaman, kios sayur, papan, dan atribut Widi saling bertumpuk di ruang yang sama dengan toko Widi 140px. Sekitar x128/y174, peti lama juga beririsan dengan Toko Serbaguna Ayu 154px.
4. Fasad rumah di atlas mengandung margin bawah transparan yang berbeda (6–18px setelah display). Walau koordinat objek sama dengan titik jalan, bagian kaki bangunan tampak melayang/terpisah dari batu pijakan.
5. Jalur lama terhubung ke titik pusat ikon, bukan ke **ambang pintu yang tampak**. Terutama pada rumah Inggit dan Ayu, frontage selatan membutuhkan batu pijakan dari ambang sampai belokan jalan.

## 2. Perbaikan yang diterapkan
- **Sumber tunggal collision**: `src/lib/game/world-layout-data.json` dikonsumsi oleh model dan render metadata. Berkas `world-layout.ts` menyimpan geometri sprite, titik pintu, kelompok furnitur dan amplop toko.
- **Kedalaman interior**: lantai/dinding (base) berada pada kedalaman nol; 6 objek furnitur per ruang dipisah dari atlas 320px dan diberi kedalaman dari kaki sprite. Phaser mengurutkan lewat `setDepth`; Canvas fallback menggambar sebelum/sesudah avatar berdasarkan tinggi kaki.
- **Collision HD**: rumah: kasur + peti + karung di barat, meja/rak/lemari di utara-timur; gudang: rak alat/hasil di kiri, meja & karung di atas-kanan. Lajur tengah tetap bisa dilewati.
- **Interaksi furnitur**: kasur (tidur), rak buku, meja kerja, lemari, peti rumah; rak peralatan dan kabinet gudang masuk melalui titik di depan furnitur. Jangan memunculkan UI storage rumah palsu.
- **Migrasi save lama**: save valid dari denah lama yang kini menempatkan karakter di dalam furnitur baru dinormalisasi ke tile lantai terdekat di ruang yang sama, tanpa menyentuh saldo, inventaris, hari, atau relasi NPC.
- **Pasar**: toko Ayu dan Widi dipertahankan pada posisi layanan NPC existing; kios sayur/anyaman dipindah ke sisi selatan, hiasan yang berada di bawah atap toko dibersihkan, display produk ditempel di tepi fasad.
- **Jalan**: ujung path kebun/rumah warga dirapikan dan threshold stones ditarik hingga x/y pintu baru tanpa memutus rute NPC yang sudah berlaku.
- **Atlas transparansi**: footer visual disejajarkan dengan anchor sprite, bukan dasar kanvas yang transparan. Rumah Yanzen disesuaikan agar atap tidak terpotong viewport atas.

## 3. Kontrak tile dan ukuran
- World tile = **20×20 px**; player sprite 24×32 px.
- Interior map 480×320 px; proyeksi artwork x=132, y=63, ukuran=232×244 px.
- Atlas interior = 2×2 sel 320px: frame 0 dasar rumah, 1 furniture rumah, 2 dasar gudang, 3 furniture gudang.
- Atlas eksterior = 3×2 sel 320px. Ukuran visual rumah Yanzen 112px, gudang 104px, rumah warga 108px, Ayu General Store 154px, Widi 140px.
- Foot adjustment (pasca margin transparan): rumah +6px, gudang +14px, rumah Inggit +15px, rumah Ayu +18px, General Store +6px, Widi +4px.

## 4. Map layout — referensi world-pixel
| Zone | Bangunan | Koordinat sprite (x, y) | Threshold |
|---|---|---|---|
| Field | Rumah Yanzen | (78,102) | (72,102) |
| Field | Gudang | (191,95) | (186,95) |
| Field | Warung kebun | (387,95) | (387,95) |
| Gang | Nani | (160,155) | (160,155) |
| Gang | Ryan | (403,155) | (403,155) |
| Gang | Inggit | (90,277) | (85,277) |
| Gang | Ayu | (310,277) | (305,277) |
| Gang | Widi | (530,155) | (530,155) |
| Pasar | Toko Ayu | (128,174), 154px | (128,174) |
| Pasar | Toko Widi | (550,159), 140px | (550,159) |
| Pasar | Kios Sayur | (441,298) | Selatan |
| Pasar | Anyaman kecil | (516,299) | Selatan |

Interaksi NPC dan akses warung tetap berasal dari `model.ts`. Anchor visual tidak boleh diam-diam dijadikan portal baru.

## 5. Interaksi dan jalur aman
- Rumah: spawn (12,12); exit (12,13); kasur diakses dari (10,8) menghadap atas.
- Gudang: spawn (12,12); exit (12,13); rak alat dari (10,7) menghadap kiri, meja kerja gudang dari (12,8) menghadap atas, simpanan sisi kanan dari (13,10) menghadap kanan.
- Market: layanan Ayu di (6,9), Widi (27,8). Lajur pasar tengah harus tetap terbuka.
- Uji lintasan BFS dari 9 titik depan pintu dan counter ke jalur utama, serta uji collision dan validasi save lama, ada di `tests/game-world-layout-hd.mjs`.

## 6. Risiko tersisa dan QA penerimaan
1. **Uji visual aktual perangkat** tetap diperlukan: pengujian statis/TypeScript tidak setara dengan screenshot runtime game.
2. Tidak semua furnitur kini punya stateful inventory sendiri. UI peti rumah masih informasi, sedangkan gudang tetap memakai sistem penyimpanan alat yang ada.
3. Toko Widi menyertakan pemrosesan alpha khusus karena sumber gambar menghasilkan latar kotak-kotak. Periksa kembali di perangkat.
4. Bangunan tambahan seperti Warung Inggit dan kios pasar masih memakai sebagian aset lama, belum seluruhnya HD.
5. Periksa transisi day/night, skala kontrol mobile, serta side-scroll camera agar batu pijakan dan atap tidak menabrak HUD.

**Acceptance**: lintasan masuk rumah dan pasar terbuka; pemain tidak berdiri di atas furniture solid; hotspot mengacu ke barang yang terlihat; core shop tidak overlap; screenshot pada 2 renderer dan 2 viewport jelas, dan build staging READY sebelum perubahan diterima ke main.
