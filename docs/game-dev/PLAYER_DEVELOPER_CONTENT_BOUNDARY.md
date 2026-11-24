# Batas penyajian: pemain vs developer — YZ Farm Life

**Status: aturan aktif, 22 November 2026.** Perbedaan ini bukan soal menyembunyikan informasi dengan CSS. Data untuk pemain **diproyeksikan dengan daftar field yang dipilih**; data developer memiliki lapisan dan media sendiri. Catatan dalam `public/` tetap dapat diambil melalui HTTP, walaupun UI game tidak merendernya. Jangan simpan rahasia di sana.

## Matriks lapisan

| Informasi | Dalam game untuk pemain | Developer / penulis |
|---|---|---|
| Nama, pekerjaan, potret | Tampilan manusiawi, tanpa ID | Nilai canonical persis + ID/portrait key/fingerprint |
| Keseharian dan cerita asal | Ringkas, relevan, tanpa jargon dan klaim tempat lahir palsu | 12 kategori, status draf, provenance, tingkat keyakinan |
| Rancangan hubungan keluarga | Jangan dipajang sebelum kurasi narasi dan kesesuaian lore | Bahan review Character Bible, bukan relasi canonical otomatis |
| Naskah dialog dan quest yang belum aktif | Tidak diumumkan, tidak disamakan dengan perjalanan pemain | `sideQuestConcept`, `threeActBeats`, rencana ekspansi |
| Pertemuan, persahabatan, misi | Hanya dari save dan mapping yang disahkan | Nilai poin, flags, ID, fase, tes dan migrasi |
| Status runtime/pemrograman | Tidak terlihat sebagai label tokoh | Log, QA, kode, dokumentasi, pemeriksaan build |
| Error jaringan/save | Dampak dan langkah praktis tanpa stack/error internal | Console, status HTTP, trace dan langkah diagnosis |
| Kameo P01/P02 | Informasi publik tersumber, fiksi pertemuan dijelaskan singkat | URL, provenance, konflik sumber, guardrail pribadi |
| YZ Phone → Kronik | Peristiwa yang terjadi dalam save | Kontrak save, timestamp, branching, idempotensi |

## Kontrak layar Warga

- `src/lib/game/public-wargapedia.ts` adalah satu-satunya **presenter** untuk Warga. `wargaPlayerView` menyaring data yang layak dan mengubah nama display tanpa mengganti nama canonical. Jangan menulis `Object.entries(profile.sections)` ke UI pengguna.
- `src/app/game/phone-wargapedia.tsx` dan `src/app/game/encyclopedia/encyclopedia-client.tsx` harus menampilkan isi yang konsisten. Pencarian menggunakan nama/profesi, bukan ID NPC yang diberi label pada pemain.
- Semua 248 tokoh boleh dibaca sebagai bagian dari dunia game; **tidak perlu memberitahu pemain bahwa tidak ada syarat level**. Akses profil umum berbeda dari rahasia/kejadian yang benar-benar dibuka oleh cerita.
- Panel Kedekatan dapat menunjukkan progres hanya saat ada pertemuan tersimpan. Tidak menulis status "belum terkait ke legacy", "belum ada quest runtime", atau "12 dimensi".
- Editor mengakses dokumen/kode atau endpoint review server yang diautentikasi. Tidak ada mode debug lewat query string yang disisipkan ke UI Warga pemain.

## Humanizer seluruh game

Kerjakan *player-facing strings* aktif pada dialog, HUD, notifikasi, help, menu, plang, interaksi dengan rumah/gudang/kebun, peta, misi, Kronik, error, aksesibilitas. Edit per konteks, bukan substitusi massal semata: pantau suara NPC, kata yang berulang, implikasi gameplay dan panjang bubble di portrait.

Contoh:

| Draf teknis yang tidak ditampilkan | Bahasa pemain |
|---|---|
| "A03 · NPC canonical, 12 kategori, approval draft" | "Ryan Andryana Achadiat — Pengelola irigasi" |
| "Belum ada hubungan permainan yang terhubung" | Tidak perlu kartu hubungan sampai ada pertemuan |
| "Gagal memuat save: Error 500 ..." | "Catatan perjalananmu belum bisa dibuka. Coba masuk lagi." |
| "Quest belum terintegrasi di runtime" | Jangan tampilkan quest sebagai aktif |
| "Profil terbuka pada Lv. 0" | Profil langsung tersedia tanpa penjelasan |

## Inspeksi yang tidak mencemari game

Untuk melihat persis apa yang dilihat pemain dan apa yang dimiliki developer, gunakan CLI di root repo:

```bash
npm run chars:inspect -- A03 --view=player
npm run chars:inspect -- A03 --view=developer
npm run chars:inspect -- A03 --view=developer --full
```

Mode pemain memakai presenter `wargaPlayerView`; mode developer menampilkan 12 seksi, jumlah null, dan provenance dengan opsi `--full`. Keduanya hanya membaca JSON yang sudah dipublikasikan dan tidak membuka file privat/server. Jangan memindahkan output developer ke UI game.

## Review dan perbaikan berikutnya

- Audit penulisan 248 dossier per kelompok profesi dan kelompok ilustrasi. Generator sebelumnya masih menyisakan frasa yang terlalu mirip; hanya pakai bagian yang lolos review untuk layar pemain.
- Linter di `scripts/game-narrative/audit-game-copy.mjs` menangkap regresi **yang dapat diprogram**; inspeksi editorial manusia dan uji browser tetap wajib.
- Jika informasi benar-benar privat, pindahkan dari `public/` ke penyimpanan server terotorisasi; menyembunyikan satu field di React bukan kontrol akses.
