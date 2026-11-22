# Audit UX dialog NPC, potret dan aset ikan — 22 November 2026

**Status:** implementasi tahap UI di branch `fix/dialogue-market-portrait-mobile-20261122`; **belum lulus QA Safari iOS/preview**. Perubahan ini tidak memodifikasi 248 identitas canonical maupun skema save.

## Observasi dan sebab

| Temuan | Bukti | Keyakinan | Perbaikan |
|---|---|---:|---|
| Deretan tombol toko menutupi dialog Widi dan mendahului percakapan | screenshot pasar mobile + `game-client.tsx` | 100% | Lapak tampil di dalam opsi dialog setelah halaman percakapan, dalam `details` terpisah |
| Tiga gambar ikan terasa seperti stiker di sebelah tombol | `fish-market.png` sebagai `NextImage` 144×48 di atas teks | 100% | Atlas asli dipakai sebagai thumbnail per spesies pada kartu jual, hanya jika stoknya ada |
| Empat tombol jual ikan kosong selalu muncul | `FISH_IDS` dirender tanpa filter stok | 100% | Tampilkan hanya spesies yang dapat dijual; beri pesan alami saat tas kosong |
| Dialog Widi mengulang empat paragraf penjelasan ditambah ambient tiap interaksi | `storyDialogue` + `meetNpc` | 100% | Salam lebih ringkas; informasi spontan menyesuaikan jumlah ikan/umpan; panduan terperinci tetap via pilihan berbicara dan YZ Phone |
| Potret aktif tampak sedikit bergeser antar-frame / ukuran viewport | atlas 5 NPC, CSS crop `left:-n*100%` | 85% untuk isu umum, 55% untuk besaran per karakter | Kalibrasi offset kecil per karakter aktif, non-destruktif; wajib screenshot 8 emosi sebelum diterima |
| Seluruh 248 potret tidak sepenuhnya center | laporan pengguna, belum ada contact sheet QA 248 pada audit ini | 45% soal sebaran/penyebab | Periksa 248 karya bertahap secara terukur; jangan geser atau regenerasi massal tanpa tinjauan |

## Referensi mekanika presentasi (bukan aset untuk ditiru)

- **Harvest Moon: Friends of Mineral Town (GBA)** — percakapan pendek dengan potret dan teks pada kotak dialog bawah; karakter dan dunia di belakang tetap terhubung secara visual. Rujukan: https://www.mobygames.com/game/12227/harvest-moon-friends-of-mineral-town/screenshots/gameboy-advance/81638/
- **Harvest Moon: Back to Nature** — potret menjadi identitas ekspresi, bukan kartu ensiklopedia besar; contoh: https://archive.rpgamer.com/games/harvest/hmpsx/hmpsxss.html
- **Story of Seasons: Friends of Mineral Town** — portrait dalam percakapan dan menu hubungan sebagai kanal berbeda. Rujukan: https://www.fogu.com/sos3/basics/menus.html dan https://www.nintendolife.com/news/2020/03/gallery_feast_your_eyes_on_20_story_of_seasons_friends_of_mineral_town_screenshots

Yang diadaptasi: hirarki percakapan > pilihan > transaksi, ekspresi kuat, panel ringkas, reveal berdasarkan aksi. **Jangan** menyalin gambar UI, sprite, atau tulisan berhak cipta.

## Kontrak perubahan yang telah ditulis

1. Widi (C07) tetap `Spesialis ikan dan memancing`. Dialog gameplay tetap menggunakan strip ekspresi `C07.png`; potret profesi `work-C07.png` di Warga tidak ditukar.
2. Semua item ikan tetap menggunakan ID lama, harga dan stok save lama tetap berlaku. Ikan yang tidak ada di tas tidak muncul sebagai tombol penjualan.
3. `fish-market.png` tetap satu file atlas lama tetapi setiap frame diposisikan di thumbnail pada kartu transaksi yang tepat.
4. `yzg-chapter-dialog` dibatasi ketinggian relatif viewport agar dunia tidak sepenuhnya tertutup. Ketika isi bertambah, panel dapat digulir; tombol tetap minimal 44px.
5. `1/5` dipindahkan menjadi teks khusus screen reader. Progres cerita sebenarnya tetap berada di YZ Phone/Kronik.
6. Offset `--portrait-center-shift` 3–4px untuk lima strip aktif hanya mitigasi UI, bukan bukti QA visual selesai. Jika screenshot aktual menunjukkan frame tertentu terpotong/bleeding, cabut offset pada ID terkait lalu perbaiki frame asli.

## Prosedur QA wajib

- Jalankan `npm run typecheck`, `npm run test:game`, `npm run test:game:life:ui`, `npm run test:portraits`, `npm run test:portraits:ui`, `npm run test:game:copy`.
- Cek di Safari iPhone sekitar 390px, Android Chrome sekitar 360–412px, desktop dan fullscreen: dialog Widi pertama, halaman terakhir, lapak terbuka/tertutup, tombol beli 15 G, jual satu/lebih ikan, hasil transaksi dan kembali berbicara.
- Capture komparasi 8 emosi × 5 NPC pada 80px (mobile) dan 112px (desktop); tes kontur rambut, hijab, posisi mata, transparansi dan overflow setiap frame.
- Audit 248 profesi/katalog dalam contact sheet per kelompok, tandai **face center** dan safe area, jangan otomatis mengganti semua karya. Pisahkan **crop CSS**, **kesalahan framing file**, dan **mismatch identitas**.
- Pastikan waktu dunia berhenti/terkunci sesuai aturan saat menu dialog; tidak ada modal di luar viewport, tombol tertutup safe area iOS, atau scroll halaman di belakang dialog.
- Check kasus coin tidak cukup, tidak ada umpan, tidak ada ikan, save lokal/cloud dan koneksi terputus.

## Pekerjaan berbeda yang tetap terbuka

Memancing **belum** memiliki bite timer, peluang ikan lepas dan statistik lengkap. Semua itu sudah tercakup dalam `FISHING_EXPERIENCE_V2.md` namun tidak diam-diam diubah oleh tugas perbaikan UI ini. Untuk pengalaman ikan yang lebih bernilai, tahap selanjutnya harus menampilkan ikan saat *berhasil ditangkap*, saat *rekor baru*, dan di *Koleksi Ikan* YZ Phone—bukan sekadar menambah stiker ikan ke lapak. Tambahkan hanya setelah sistem peluang/save migrasi dites.

**Batas rilis:** PR boleh diperiksa, tetapi jangan klaim staging Vercel sudah berubah atau QA visual selesai sebelum deployment preview serta pemeriksaan langsung berhasil.
