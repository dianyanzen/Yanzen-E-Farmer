> **PEMBARUAN PUBLIK (22 NOVEMBER 2026):** Seluruh 248 karakter canonical kini memiliki katalog fiksi publik dan 12 kategori Character Bible draf. YZ Phone mengambil `/game/data/npc/{ID}.json` sebagai fallback jika biografi privat yang approved tidak tersedia; `/game/encyclopedia` menyediakan wiki publik. Rincian di bawah mendokumentasikan fitur awal dan sebagian status sebelumnya; hanya flag dari save yang boleh dianggap kejadian yang benar-benar dialami pemain.

# YZ Phone — Warga dan Kronik

**Implementasi UI:** `src/app/game/character-gallery.tsx`, `src/app/game/phone-chronicle.tsx`, `src/lib/game/phone-profiles.ts`, `src/lib/game/phone-story.ts`.

## Warga: dua tahap seperti buku kontak

1. Buka **YZ Phone → Warga**. Daftar 32 karakter inti tampil dahulu dalam halaman 12 warga; nama/pekerjaan dapat dicari. Tombol **Lihat warga dari kawasan lain** membuka 38 konsep bernama yang belum playable.
2. Ketuk satu warga untuk membuka detail dalam ponsel. **Kembali** kembali ke daftar (juga tombol kembali pada header ponsel dan Esc).
3. Detail memuat 12 bagian sesuai Character Bible: identitas, penampilan, pakaian, kegiatan, sifat/kebiasaan, yang dipikirkan, sejarah, hubungan, dialog, cerita bersama, potret, dan kontinuitas.
4. Detail beberapa bagian hanya terbuka setelah benar-benar bertemu: saat `bonds[npcId].talks > 0`; kebiasaan pada **Lv.1**, harapan/hubungan pada **Lv.2**, ketakutan pada **Lv.3**. Cerita masa lalu memerlukan **peristiwa cerita nyata** selain kedekatan, sehingga profil proposal tidak bocor. `C01` membuka kenangan foto setelah `story.photoSeen`; `A03` membuka catatan air setelah `story.canalClue`.
5. NPC yang belum aktif hanya punya informasi umum; tidak ada klaim mereka bisa ditemui. Cameo figur publik tidak memperoleh psikologi pribadi yang dikarang.

**Sumber:** 70 Character Bible dimuat **on demand** dari file JSON per ID. Daftar tidak mengirim prompt, menghubungi layanan AI, atau menulis ulang save.

## Kronik: ringkasan cerita berdasarkan save

Buka **YZ Phone → Kronik**. Tersedia tiga pilihan:

- **Kisah**: ringkasan Bab 1, progres lima milestone dan detail peristiwa yang sudah dialami. Peristiwa setelah tahap saat ini tampil terkunci. Foto Nani dan keputusan `nani/warung` mengikuti save, termasuk `completedDay` jika tercatat.
- **Misi**: status lima quest personal dari `personalQuests`: belum diambil, berjalan, menunggu, selesai. Tautan dapat membuka profil pemberi misi.
- **Jejak hari**: hari keberapa, panen, percakapan, malam istirahat, warga yang pernah ditemui, dan kedekatan. Tombol **Salin ringkasan cerita** membuat teks kronologi tanpa kontak ke AI eksternal; jika clipboard tidak tersedia, tampil kotak teks untuk disalin manual.

**Sumber kebenaran:** `GameState` v1 (story flags, bonds, personalQuests, stats, game day). **Tidak menambah kolom SQL atau bentuk save**. Semua perhitungan dilakukan saat ponsel dibuka dan berubah mengikuti state. Peristiwa lama yang tidak memiliki tanggal tidak diberi tanggal palsu. Kronik belum mencatat setiap langkah, setiap tempat yang dikunjungi atau dialog lengkap; untuk granular event log perlu migrasi save dengan validasi terpisah.

## QA

- `npm run test:game:phone`: memverifikasi milestone, ending bercabang, quest phase, jumlah teman, impor lazy 70 profil dan save v1.
- `npm run test:portraits:ui`: cek daftar 12 per halaman, klik detail 12 seksi, 32 potret dan 8 ekspresi, fallback saat gambar gagal, serta tab Kronik.
- `npm run test:game:copy`: regresi frasa nonnatural/meta yang pernah muncul.
- `npm run typecheck`, `npm run test:game`, review browser iOS dan desktop termasuk scrolling panjang, tombol kembali, fokus keyboard, dan ukuran potret.

Pengalaman harus tetap nyaman di prototipe Pasirluyu sebelum ekspansi besar berikutnya.
