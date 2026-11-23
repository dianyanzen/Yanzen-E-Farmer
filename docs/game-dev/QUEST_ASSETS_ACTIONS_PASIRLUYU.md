# YZ Farm Life — Audit Aset dan Aksi untuk 30 Rancangan Misi NPC Aktif

**Status 23 November 2026 (revisi lokasi dan akses rumah):** lima misi pertama dari masing-masing NPC tetap mengikuti runtime lama; lima **misi lanjutan tahap awal** pada gameplay `main` dan penataan rumah pada branch `feat/quest-props-inside-homes-20261123` memiliki objek fisik baru dan aksi penyelesaian. **20 misi lain dalam matriks di bawah masih rancangan**, bukan quest runtime. Tulis metadata dan pengalaman pemain secara terpisah; jangan menyatakan aset cadangan sebagai fitur yang sudah dimainkan.

## Prinsip pembuatan

- Keberadaan aset dalam perpustakaan tidak otomatis menjadikannya bisa digunakan. Aktif hanya jika sprite dimuat Canvas + Phaser, punya penempatan/akses, `getActionContext`, perilaku dengan prasyarat, persistensi, dan tes.
- Utamakan aset yang sudah ada: kelima rumah warga, ruang tamu, buku ukur air di rumah Ryan, meja semai, pot, lapak benih, lapak pancing, bendung buka/tutup, gudang, warung, pasar, petak timun, joran dan ikan.
- Pertahankan satu bahasa visual: pixel-object 24×28, edge tajam, palet hangat, alpha transparan, anchor bawah, target interaksi 20×20. Kualitas harus dinilai pada skala ponsel dan peta dunia, bukan hanya file terpisah.
- Jangan mengubah identitas, potret wajah, nama canonical, atau sprite ekspresi saat menambah properti quest.
- Interaksi memakai tombol Aksi/keyboard maupun ketuk. Keempat aset milik Ryan, Ayu, Widi, dan Inggit ditempatkan **di interior rumah masing-masing**, bukan di jalan atau lapak; **pot Nani tetap di gang**.
- Aset khusus misi hanya dirender, menghalangi langkah, dan memiliki tombol Aksi selama quest pemiliknya sudah diterima (`followUpQuests.phase = 1 atau 2`). Misi belum aktif atau telah selesai tidak boleh menyisakan benda interaktif/collider tak terlihat.
- Saat quest rumah aktif, akses bertamu dibuka **meskipun kedekatan 0** selama pukul **07.00–20.30**, termasuk ketika pemilik sedang di luar. Setelah quest selesai, akses kembali memakai aturan bertamu normal. Pemain yang telah akrab tetap mengikuti aturan akses akrab yang lama.
- Tidak ada efek otomatis pada poin kedekatan hanya karena berhasil masuk rumah. Uji `npcSchedule`, `areaBlocked`, tap route, interaksi interior dan jalur keluar.
- Aksi gagal tidak menghapus item atau memberi hadiah; hasil periksa yang benar mencatat state; mengulang aksi tak dapat mengklaim reward lagi.
- `newGame()` dan reset harus menghilangkan `followUpQuests` berikut semua reward/progresnya. Loading save v1 sebelum fitur baru tetap valid.

## Lima aset dan tindakan yang disiapkan dan terhubung

| Pemilik | Quest lanjutan | Aset asli (file) | Lokasi/tile | Action nyata | Prasyarat |
|---|---|---|---|---|---|
| Ryan A03 | Jejak Dua Garis | `quests/quest-water-marks.svg` | **rumah-ryan (13,7)** | Aksi: periksa contoh penanda air milik Ryan; lapor Ryan | Misi pertama Ryan selesai, quest aktif, jam bertamu |
| Nani C01 | Pot yang Terlupa | `quests/quest-nani-pots.svg` | gang (10,9) | Aksi: membandingkan kelembapan dua pot; lapor Nani | Misi pertama Nani selesai |
| Ayu A04 | Menunggu Kecambah | `quests/quest-ayu-seeds.svg` | **rumah-ayu (13,7)** | Aksi: memeriksa kecambah; baru valid hari setelah menerima tugas | Misi pertama Ayu selesai, quest aktif, hari berikutnya |
| Widi C07 | Tiga Tanda di Air | `quests/quest-widi-ledger.svg` | **rumah-widi (10,7)** | Aksi: mencatat dua ikan baru yang didapat setelah misi diterima | Misi pertama Widi selesai, quest aktif, tambah >=2 tangkapan |
| Inggit C08 | Pagi yang Sibuk | `quests/quest-inggit-orders.svg` | **rumah-inggit (10,7)** | Aksi: menyerahkan dua timun tambahan di dapur rumah | Misi pertama Inggit selesai, quest aktif, ada >=2 timun bebas |

Implementasi:
- `model.ts`: registri lokasi, collision, action context, field `followUpQuests`, validasi `safeLoad`.
- `quest-props.ts`: antarmuka baca per-id untuk modul aset.
- `personal-quests.ts`: syarat, cerita, progres tindakan, reward satu kali per misi.
- `modular-outdoor.ts`: registri sumber aset; tanpa penempatan permanen untuk quest.
- `draw-world.ts` dan `phaser-world.ts`: render kontekstual objek quest aktif di interior rumah dan satu pot Nani di luar.
- `tap-navigation.ts`: hanya mengenali objek misi yang sedang aktif untuk navigasi ketuk.
- `phaser-world.ts`: loader SVG 24×28 untuk Phaser, sedangkan Canvas memakai `outdoorSources`.
- `game-client.tsx`: tombol aksi dan dialog menerima/melaporkan misi.
- `phone-story.ts` dan `phone-chronicle.tsx`: jejak dan status misi baru berdasarkan save.
- `game-assets/catalog/asset-database.json` dan `game-assets/library/props/index.json`: metadata serta provenance karya baru.
- `tests/game-followup-quests.mjs`: tes lokasi, penjangkauan, syarat hari/tangkapan/panen, reward, save dan reset.

## Matriks aset dan mekanik 30 misi

Legenda: **Ada** berarti objek/mekanik dasar ada sekarang; **Aktif P1** berarti properti + aksi dalam branch ini; **Perlu dibuat** berarti belum ada implementasi aksi lengkap. Lima misi pertama masuk kelompok `Ada` dan tidak diganti.

| NPC | Misi | Aset reuse | Tambahan yang dibutuhkan | Aksi/gameplay | Kesiapan |
|---|---|---|---|---|---|
| Ryan | Air sampai ke hilir | Pintu air buka/tutup; sungai; Nani | Tidak perlu aset baru | Tanya, buka, lapor | Ada |
| Ryan | Jejak Dua Garis | Bendung dan jalur sungai | Batu ukur air | Inspeksi fisik, lapor | Aktif P1 |
| Ryan | Sambungan yang Bisu | Saluran dan catatan air | 3 sambungan pipa berstatus | Periksa tiap titik, bandingkan debit, perbaiki | Perlu dibuat |
| Ryan | Saat Hujan Pertama | Cuaca hujan; sungai | Pengukur tinggi air / skala | Ukur pada hari hujan, laporkan | Perlu dibuat |
| Ryan | Air untuk Dua Kebun | Kebun, NPC, bendung | Papan jadwal distribusi | Pilih prioritas, evaluasi akibat | Perlu dibuat |
| Ryan | Buku Air Pasirluyu | Rumah Ryan, buku kerja | Buku rekam pengamatan | Catat pengukuran antarhari | Perlu dibuat |
| Nani | Halaman yang kembali tumbuh | Meja semai, petak, Ayu | Tidak perlu aset baru | Tanam, siram, inspeksi | Ada |
| Nani | Pot yang Terlupa | Gang dan teras | 2 pot dengan kondisi beda | Inspeksi dan lapor | Aktif P1 |
| Nani | Melati Sore Hari | Pot, bunga melati | Rak/slot penempatan pot | Pindah pot menurut cahaya | Perlu dibuat |
| Nani | Foto Tanpa Nama | Foto cerita, rumah Nani | Album dengan halaman bercabang | Periksa foto berdasar keputusan Bab 1 | Perlu dibuat |
| Nani | Tetangga yang Tak Sepakat | Dialog Nani dan warga | Foto/kartu kesaksian | Bandingkan dua cerita, pilihan bercabang | Perlu dibuat |
| Nani | Surat untuk Masa Depan | Rumah/album | Surat, amplop, adegan | Baca surat pada waktu yang tepat | Perlu dibuat |
| Ayu | Benih untuk musim berikutnya | Lapak, tanaman, panen | Tidak perlu aset baru | Tanya Inggit, panen, lapor | Ada |
| Ayu | Dua Amplop Serupa | Lapak benih | Dua/3 amplop benih, penanda | Observasi, cocokkan label | Perlu dibuat |
| Ayu | Menunggu Kecambah | Lapak, waktu tidur | Nampan semai | Tunggu esok hari, inspeksi, lapor | Aktif P1 |
| Ayu | Satu Petak Percontohan | 48 petak dan gembor | 2 papan nama petak | Bandingkan pertumbuhan dua petak | Perlu dibuat |
| Ayu | Pembeli yang Terburu-buru | Lapak, dialog | Slip pesanan pembeli | Putuskan jual/cek bibit, reaksi | Perlu dibuat |
| Ayu | Benih yang Diberikan Kembali | Benih, gudang | Paket benih khusus | Kumpulkan, tukar, peroleh satu hadiah unik | Perlu dibuat |
| Widi | Buku tangkapan tepi sungai | Joran, ikan, Ryan | Tidak perlu aset baru | Tanya, tangkap 2 ikan, lapor | Ada |
| Widi | Menunggu Pelampung | Joran, pelampung | Frame animasi gerak pelampung | Tunggu sambaran valid, tarik | Perlu dibuat |
| Widi | Ikan yang Lepas | Joran, sungai, Widi | Efek ikan lepas/putus senar | Catat gagal, evaluasi tempo tarik | Perlu dibuat |
| Widi | Tiga Tanda di Air | Alat memancing, ikan | Buku tangkapan | Dua tangkapan baru, catat, lapor | Aktif P1 |
| Widi | Senar yang Terkusut | Rumah/meja Widi | Simpul senar, joran dua kondisi | Inspeksi simpul, perbaiki | Perlu dibuat |
| Widi | Hari yang Tak Harus Berhasil | Sungai dan cerita Widi | Efek tenang/event kecil | Bertahan dan mengamati tanpa wajib berhasil | Perlu dibuat |
| Inggit | Dua toples di meja pasar | Warung, ikan, timun | Tidak perlu aset baru | Tanya Widi, serahkan dua timun, lapor | Ada |
| Inggit | Pagi yang Sibuk | Pasar, timun, warung | Keranjang order | Serahkan dua timun bebas, lapor | Aktif P1 |
| Inggit | Bahan yang Tertukar | Warung/pasar, dagangan | 3 wadah bahan berlabel | Cocokkan stok dengan pesanan | Perlu dibuat |
| Inggit | Ikan Belum Datang | Widi, lapak pasar | Slip kiriman ikan | Cek stok, pilih solusi, dapat akibat | Perlu dibuat |
| Inggit | Harga yang Tidak Enak Dibicarakan | Warung, uang dan jual beli | Papan harga sementara | Bandingkan biaya dan keputusan sosial | Perlu dibuat |
| Inggit | Meja Makan Para Tetangga | 5 NPC, interior, meja | Hidangan, meja jamuan, frame peristiwa | Event sosial dengan dialog bergantung relasi | Perlu dibuat |

## UI/UX yang harus dijaga

- Jika pemain belum menerima misi, objek tetap punya dialog inspeksi singkat, tetapi tidak mengubah progres.
- Jika misi aktif namun syarat belum tercapai, tampilkan kebutuhan yang jelas dalam bahasa warga; jangan diam atau klaim sukses.
- Setelah inspeksi yang benar, YZ Phone → Kronik menampilkan misi siap dilaporkan.
- Jika pemain berulang kali menekan Aksi, jangan memberikan barang, uang atau kedekatan tambahan.
- Minimalkan objek pop-up pada layar ponsel. Interaksi utama terjadi di viewport permainan, bukan di atas tombol controller.
- Jangan tampilkan ID quest, event flag, item schema, atribut pengembangan, atau istilah engine kepada pemain.

## Prioritas dan gerbang

- **P0:** tes seluruh objek dapat dicapai, tidak memblokir kerja NPC, tidak mengambil jatah pesanan utama, reward hanya sekali, save lama aman, reset kembali benar-benar awal, dan **izin masuk rumah harus berakhir ketika quest selesai**.
- **P1:** evaluasi visual skala ponsel dan tanggapan player setelah menggunakan lima objek.
- **P2:** siapkan state visual bernapas (kering/basah/terisi), puzzle pengamatan, pilihan hasil dan alat kerja tambahan untuk lima NPC.
- **P3:** perluas event sosial, frame animasi, SFX dan koneksi antarmisi tanpa perlu memperbesar peta Pasirluyu.

**Catatan ekspansi:** aset bernilai tinggi yang belum aktif tetap dipertahankan di pustaka; namun rilis konten baru seharusnya didorong oleh adanya interaksi yang bermakna, bukan hanya menambah gambar.
