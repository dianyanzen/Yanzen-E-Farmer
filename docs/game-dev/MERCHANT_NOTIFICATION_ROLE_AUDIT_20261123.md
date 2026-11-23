# Audit Kepemilikan Transaksi & Notifikasi — YZ Farm Life
**23 November 2026 · Koreksi setelah merge #53 · ruang lingkup: lima NPC Pasirluyu aktif**

## Sumber kebenaran runtime
- **Ayu Indah Sari (A04)** adalah pedagang **bibit timun** serta pembeli **hasil panen timun bebas** di Pasar Warga. Pembelian: 5 bibit / 40 G. Penjualan: 25 G per timun (mekanik saat ini menjual semua stok bebas sekaligus). Tidak ada mekanik jual-bibit-pemain ke NPC pada versi ini; istilah "jual" di sini berarti pemain menjual *hasil panen* kepada Ayu.
- **Inggit Marsela (C08)** adalah pemilik warung dan **pembeli pesanan cerita empat timun**. Empat timun disisihkan saat pesanan aktif, dibayar 160 G tepat sekali saat penyerahan; tidak boleh direbut transaksi lapak Ayu.
- **Widi Munajat (C07)** menjual pelet pancing 5 / 15 G, membeli hasil memancing, dan mendampingi misi ikan.
- **Nani Sumartini (C01)** dan **Ryan Andryana Achadiat (A03)** bukan pedagang bibit/timun.

## Temuan dan koreksi pada UI pemain
| Keparahan | Letak | Temuan lama | Perbaikan |
|---|---|---|---|
| P0 | `applyFarmTool` | Saat bibit habis, pemain disuruh membeli pada Inggit | Tunjuk Ayu di lapak benih |
| P0 | `farmOverview` YZ Phone | Petunjuk beli bibit Ayu berakhir dengan `→ Pesan`, padahal transaksi tidak terjadi di chat | Tunjuk interaksi langsung di lapak |
| P0 | `chapterJournal` setelah Bab 1 | "jual panen di warung" salah untuk hasil timun umum | Jual ke Ayu, pesanan khusus tetap ke Inggit |
| P1 | `marketTrade` | Bukti pembelian/jual-beli tanpa nama pemilik, kegagalan jual timun memakai kalimat "timun lepas" | Nama Ayu/Widi eksplisit, alasan kegagalan jelas |
| P1 | `game-client.tsx` dialog foto | Foto Nani dan tombol pilihan keduanya tercetak dua kali akibat penggabungan | Tinggal satu gambar dan satu pasang tombol |
| P1 | YZ Phone Pesan | Pesan komersial dari Ayu tidak muncul saat stok bibit menipis atau ada surplus hasil panen | Pesan kontekstual Ayu dengan syarat berbasis inventaris, tanpa mengubah pilihan cerita |
| P2 | `pasirluyu-areas.ts` | Kios benih berlabel "KIOS SAYUR" | "KIOS BENIH" |
| P2 | Profil/aktivitas NPC | Inggit dianggap pedagang sayur umum, Widi menyambut "nelayan" | Inggit penjual makanan warung, Widi melayani pemancing sungai |
| P2 | Petunjuk pasar | Lokasi Ayu/Widi tidak disebut jelas | Deskripsi pasar dan plang jalur menjelaskan lapak masing-masing |

## Pesan yang sengaja tetap dimiliki Inggit
Notifikasi pertama `Inggit: Ada pesanan timun untuk warungku!` **tidak salah**, sebab itu undangan tugas utama Bab 1, bukan transaksi bibit. Kronik `Pesan dari Inggit`, `Terima pesanan 4 timun`, dan pembayaran 160 G di warung tetap dipertahankan.

## Pencegahan regresi
`tests/game-merchant-ownership.mjs` wajib ikut `npm run test:game`. Tes ini menegaskan pembelian bibit, penjualan timun umum, reservasi empat timun, pedagang pelet, pesan kontekstual YZ Phone, tulisan kios, serta jumlah foto dan pilihan Nani.

Audit berbasis kode/tes otomatis. Uji akhir layout di layar mobile dan pemeriksaan teks secara visual tetap diperlukan setelah deployment. Dokumen ini tidak menyatakan seluruh 248 NPC telah diaudit sebagai NPC playable.
