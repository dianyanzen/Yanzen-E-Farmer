# Kontrak kepemilikan dagang dan notifikasi NPC — YZ Farm Life

**Audit pasca-merge staging, 23 November 2026.** Berlaku untuk kelima NPC yang sudah aktif dalam area awal Pasirluyu. Untuk canonical identity, lihat `game-assets/catalog/npc-public-roster.json` dan `public/game/data/npc/{ID}.json`; data cerita legacy hanya dipakai setelah pencocokan identitas disetujui.

## Pemilik transaksi

| NPC aktif | ID | Peran | Barang/transaksi yang benar-benar dapat dilakukan |
|---|---|---|---|
| Ayu Indah Sari | A04 | Penjual benih | Pemain **membeli** 5 bibit timun seharga 40 G; Ayu **menerima timun surplus** dari pemain seharga 25 G per buah |
| Inggit Marsela | C08 | Penjual makanan pasar / pemilik warung | Menerima **empat timun yang telah dipesan** dengan pembayaran 160 G satu kali, serta misi tambahan dua timun untuk dapur; **bukan penjual bibit** |
| Widi Munajat | C07 | Spesialis ikan dan memancing | Pemain membeli 5 pelet seharga 15 G, dan menjual ikan yang dimiliki pada harga per spesies |
| Ryan Andryana Achadiat | A03 | Pengelola irigasi | Pintu air, pencatatan debit, dan misi; tidak berdagang bibit |
| Nani Sumartini | C01 | Pekebun bunga senior | Bunga, semai, lore, dan misi; bukan penjual bibit |

**Penting:** Frasa “jual-beli bibit” sering ambigu. Mekanik saat audit **belum** mendukung pemain menjual stok bibit kembali kepada Ayu; jangan menulis notifikasi “Jual bibit di Ayu” seolah itu sudah tersedia. Jika mekanik jual ulang bibit benar-benar diinginkan, rancang dulu harga beli kembali, jumlah transaksi, batas pengulangan, anti-eksploit, dan migrasi save. Yang telah ada adalah **beli bibit dari Ayu** dan **jual hasil panen timun ke Ayu**.

## Sumber pesan

- **Ayu** adalah pengirim kartu YZ Phone tentang stok bibit dan tempat membeli bibit. Saat stok bibit benar-benar **nol**, notifikasi kontekstual dapat ditampilkan dan mengarah ke Pesan; pembelian tetap **di lapak Ayu**.
- **Inggit** tetap menjadi pengirim notifikasi **pesanan empat timun** pada Bab 1. Jangan mengalihkannya ke Ayu karena itu akan memutus kontinuitas narasi dan pembayaran 160 G.
- **Widi** menjadi pengirim seluruh pesan dan panduan tentang joran, pelet, jenis ikan, hasil tangkapan, dan penjualan ikan.
- **Ryan** tentang irigasi, **Nani** tentang kebun bunga/foto. Mereka boleh muncul dalam percakapan NPC lain sebagai hubungan cerita, tanpa mengubah pemilik transaksi.

## Invarian permainan

1. `marketTrade(state,"A04","seeds")` hanya valid di pasar saat berhadapan dengan Ayu dan lokasinya buka; menambah 5 bibit dan mengurangi 40 G.
2. `marketTrade(state,"A04","cucumber")` hanya mengambil **timun di luar 4 yang sudah dialokasikan untuk Inggit** bila pesanan diterima tetapi belum selesai.
3. Inggit menyelesaikan pesanan utama hanya saat pemain benar-benar menyerahkan 4 timun, dan pembayaran 160 G tidak boleh dapat diambil lagi.
4. Widi hanya menerima umpan atau ikan; menjual ikan lama (dari save lama) tetap diizinkan. Penangkapan sungai baru menggunakan lele/nila; fungsi memancing V2, statistik, dan peluang ikan lepas tidak boleh berubah akibat audit copy.
5. Jurnal, HUD, tooltip tanam saat bibit habis, peta pasar mode ringan, YZ Phone, dan balasan transaksi harus merujuk pedagang yang benar.
6. Simpanan cloud tidak boleh diberi label “Tersimpan lokal”; status yang dilihat pemain adalah “Tersimpan” setelah server mengakui save.
7. Pilihan foto Nani harus dirender hanya satu kali meski JSX berasal dari beberapa branch; perubahan ini tidak boleh mengganti `photoChoice` atau save lama.

## Temuan dan koreksi pasca-merge

- **P0**: tooltip “Temui Inggit untuk membeli bibit” — salah NPC → Ayu.
- **P0**: jurnal bab 1 “jual panen di warung” — tidak sejalan dengan `marketTrade` Ayu → arahkan ke lapak Ayu.
- **P1**: farmOverview “pasar → Pesan” — membingungkan chat dengan transaksi → arahkan ke lapak langsung.
- **P1**: pesan gagal menjual timun menyebut “tidak dapat dibeli” → perjelas stok timun surplus.
- **P1**: dua blok JSX foto + dua pilihan Nani → hapus pasangan duplikat tanpa menyentuh opsi cerita.
- **P1**: tidak ada kartu Ayu di YZ Phone → tambah kartu dagang Ayu, pisahkan dari pesanan Inggit.
- **P2**: fallback map masih melabel kios Ayu sebagai “KIOS SAYUR”, sebutan “nelayan” kurang cocok dengan pakar pancing sungai, status save menyebut lokal → sesuaikan.
- **P2 arsip**: sejumlah dokumen lama, katalog legacy dan rencana wilayah lain menyimpan pekerjaan/label historis. Jangan mass-replace tanpa membedakan `runtime`, `canonical`, dan `legacy`.

## Gerbang QA
`node tests/game-trade-ownership-consistency.mjs` wajib lulus sebagai bagian dari `npm run test:game`, di samping tes reset, NPC quest, portrait, memancing, dan `npm run typecheck`. Staging harus READY dari SHA commit yang tepat sebelum diberi status selesai. Uji browser manual untuk pop-up dan tampilan mobile tetap diperlukan.
