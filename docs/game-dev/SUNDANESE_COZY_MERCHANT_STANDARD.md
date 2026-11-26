# Sundanese Cozy Farming RPG — standar visual dan pedagang universal

**Keputusan pemilik 26 November 2026. Status: wajib untuk pengembangan game.** Berlaku pada desain baru, revisi dan migrasi bertahap; bukan klaim bahwa seluruh runtime lama telah patuh. Sumber terkait: AGENTS.md, YZ_VISUAL_IDENTITY_BIBLE.md, ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md, ACTIVE_NPC_PORTRAIT_STANDARD.md dan docs/DEPLOYMENT_POLICY.md. Jika contoh historis menyarankan atlas/cutting/sharing/main, abaikan contoh itu.

## 1. Identitas visual
- Detailed HD pixel art yang koheren, hangat, natural dan bernuansa pedesaan Sunda/Bandung. Harvest Moon Friends of Mineral Town adalah referensi pengalaman, bukan sumber aset untuk disalin.
- Gunakan material kayu, batu, genteng, krem dan hijau alami; aksen sesuai fungsi, bukan palet HEX yang dipaksakan. Samakan perspektif, pixel density, outline, cahaya dan bayangan kontak pada zoom aktual.
- Pertahankan ruang kosong yang disengaja. Detail di area fungsi, bukan di jalur pemain. Jangan menambah dekorasi massal hanya untuk mengisi map.
- Mulai dari blueprint fungsi, footprint, posisi NPC, akses, hotspot, collision dan depth, lalu produksi aset satu per satu. Seluruh area harus fungsional dan estetis.

## 2. Standar pedagang
| Pedagang | Identitas | Lokasi pelayanan |
|---|---|---|
| Iyan Rustiana | Peternakan, pakan ayam, dedak, jagung, timbangan | Di depan lapak, NPC independen seperti Widi |
| Widi Munajat | Ikan, umpan, joran dan perlengkapan memancing | Di depan lapak; baseline interaksi NPC |
| Ayu Indah Sari | Benih, kemasan bibit, tanaman, perlengkapan semai | Di depan lapak/titik pelayanan pasar yang tervalidasi |
| Inggit | Warung makan dan minum, kopi, teh, makanan Sunda dan olahan telur | Boleh di balik konter karena fungsi warung makan |

Jangan menjadikan pedagang baru bagian dari dekorasi bangunan. Gunakan NPC independen, jadwal, animasi, arah pandang, collision, relasi, quest dan dialog melalui arsitektur bersama; verifikasi pemetaan canonical ID dan approvedLegacyId sebelum mengubah runtime. Saat tutup, hilangkan layanan, tampilkan keadaan lapak yang masuk akal, dan gunakan jadwal/rute aman. Jangan mengklaim fitur aktif hanya karena tergambar. Pertahankan alur beli pakan → beri ayam pakan → tidur → ambil telur → jual ke Inggit → laporan misi Iyan.

## 3. Dialog dan katalog universal
- Gunakan DialoguePanel dan pola katalog Widi sebagai baseline, satu sistem komponen yang dapat dikonfigurasi; hindari pengecualian UI per pedagang yang tidak beralasan.
- Judul nama NPC, potret 3:4 tanpa stretch, teks ringkas dengan pagination aksesibel, ekspresi sesuai adegan dan relasi, tombol teratur dan area sentuh minimal 44 CSS px.
- Katalog memiliki judul layanan, ikon produk individual transparan, nama, jumlah, harga rupiah, stok yang terdefinisi (stok tas dibedakan dari stok penjual), serta kondisi transaksi yang jelas.
- Ikon dasar 56×56 px pada desktop dan 48×48 px pada mobile adalah kontrak tampilan katalog, bukan batas ukuran master. Sesuaikan dengan grid dan uji keterbacaan. Potret delapan ekspresi dibuat individual, bukan crop sheet.
- Isi dialog tetap natural sesuai Character Bible, profesi, waktu, kedekatan dan misi; komponen sama tidak berarti kalimat semua NPC sama. Data developer tidak tampil di dialog.
- Pertahankan harga lama, saldo, stok, hadiah, status quest dan kompatibilitas save. Menu telur baru harus memiliki ikon dan animasi konsumsi yang sesuai, serta transaksi teruji; harga baru dicatat sebagai keputusan desain, tidak mengganti harga lama diam-diam.

## 4. Aset dan QA
Setiap entitas/objek/instance/varian/arah/frame memiliki file sumber dan runtime mandiri, pemilik, alpha, manifest, provenance, hash, footprint dan anchor yang sesuai aturan atomic. Dilarang atlas, crop gabungan, file bersama lintas pemilik, duplikasi byte-identik, atau placeholder dianggap aset final. Aset programatik awal harus ditinjau pada zoom permainan sebelum dianggap kualitas final. Legacy belum patuh ditandai dan dimigrasikan bertahap tanpa merusak save.

| Gate | Syarat penerimaan |
|---|---|
| Visual | Screenshot sebelum/sesudah, style koheren, tidak ada overlap, clipping, distorsi atau objek melayang |
| Navigasi | Footprint akurat, jalan dan hotspot dapat dicapai, NPC tidak menghalangi jalur utama atau menembus bangunan |
| Dialog | Nama, potret, ekspresi, katalog dan aksi konsisten, kontras dan input keyboard/touch berfungsi |
| Ekonomi | Saldo, inventaris, stok, quest dan transaksi idempoten; tidak ada hadiah atau penjualan ganda |
| Kompatibilitas | Save lama dan baru, login, reset, pergantian hari, reload, pengujian regresi |
| Cross-platform | Canvas/Phaser × PC/mobile; siang/malam, buka/tutup; typecheck, test:game, tes UI dan build sukses |
| Rilis | Isolasi project/branch/alias terverifikasi; SHA dan deployment READY sesuai kandidat teruji; rollback siap |

## 5. Aturan rilis
Area 1 Pasirluyu harus stabil sebelum perluasan area. Batasi revisi dalam batch teruji, bukan redeploy kosmetik berulang. Hanya branch game aktif dan project yanzen-e-farmer-staging pada https://yanzen-e-farmer-staging.vercel.app/game yang boleh menjadi target game. Jangan menyentuh main, project web, environment atau database production. Dokumentasi-only menggunakan marker skip Vercel sesuai policy. Jika CI gagal atau isolasi tidak terbukti, jangan mengaktifkan kandidat. Catat status MER-01–MER-14 dalam tracker, dengan bukti tes, bukan centang persetujuan sebagai PASS.
