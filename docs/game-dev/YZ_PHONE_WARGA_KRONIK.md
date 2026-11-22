> **PEMBARUAN PUBLIK (22 NOVEMBER 2026):** Seluruh 248 karakter canonical kini memiliki katalog fiksi publik dan 12 kategori Character Bible draf. YZ Phone mengambil `/game/data/npc/{ID}.json` sebagai fallback jika biografi privat yang approved tidak tersedia; `/game/encyclopedia` menyediakan wiki publik. Rincian di bawah mendokumentasikan fitur awal dan sebagian status sebelumnya; hanya flag dari save yang boleh dianggap kejadian yang benar-benar dialami pemain.

# YZ Phone — Warga, Kedekatan, dan Kronik

## Warga — ensiklopedia dan hubungan jadi satu (implementasi terbaru)

**Satu ikon `Warga` di beranda YZ Phone.** Tidak ada lagi aplikasi Wargapedia yang terpisah. Ketika memilih warga, semua informasi tampil dalam satu halaman detail yang sama:

1. **Daftar publik 248 NPC** (canonical): foto, nama lengkap, pekerjaan, pencarian nama/profesi/ID, 10 entri per halaman. Termasuk tokoh ekspansi yang belum muncul di peta.
2. **Halaman detail tunggal**: potret konsep → catatan hubungan yang benar-benar tersimpan dalam save → **12 kategori Character Bible publik**. Seluruh bab boleh dibaca sejak Lv. 0 tanpa harus berkenalan atau membuka quest.
3. **Hubungan dan misi**: ringkasan progres hanya muncul saat ada asosiasi canonical↔legacy yang **disetujui eksplisit**, melalui `approvedLegacyId`. Tanpa asosiasi, tampil penjelasan bahwa belum ada hubungan yang terhubung; tidak menebak berdasarkan nama/ID yang bertabrakan.
4. **Kronik → Warga** membuka halaman detail karakter yang sama, bukan aplikasi lain. ESC/tombol kembali membawa pengguna ke daftar warga, kemudian beranda aplikasi.
5. **Editor internal** tetap dapat meninjau catatan nonpublik lewat `npcDraftPreview=1` bila akun diizinkan server melalui `GAME_BIBLE_EDITOR_USER_IDS`. Tidak ada data editor pada JSON publik.

Sumber publik: `/game/data/npc/index.json` dan `/game/data/npc/{ID}.json`; pembaca `src/app/game/phone-wargapedia.tsx`, gerbang UI `src/app/game/character-gallery.tsx`. File arsip/proposal `cast.json` bukan roster canonical. Lore yang masih `approval:draft` bukan bukti peristiwa sudah terjadi, NPC aktif, atau quest siap dimainkan.

**QA:** `npm run chars:public:check`, `npm run test:game`, `npm run test:portraits:ui`, `npm run typecheck` dan uji nyata iOS/desktop (Lv. 0, pencarian 248 karakter, 12 bab, jaringan gagal, ESC, riwayat save).

---

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
