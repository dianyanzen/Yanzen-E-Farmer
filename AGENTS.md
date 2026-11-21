# AGENTS.md — Instruksi kerja AI untuk Yanzen E-Farmer

Berlaku untuk Codex, ChatGPT yang mengakses GitHub, dan agen coding lainnya. Bahasa komunikasi: Bahasa Indonesia. **Pengguna adalah pemilik produk dan satu-satunya pemberi persetujuan rilis.** AI tidak mempunyai otoritas otomatis untuk menggabungkan kode atau memindahkan domain.

## Baca sebelum bekerja

1. Baca [protokol koordinasi](docs/ai/SYNC_PROTOCOL.md), [rencana pemisahan aplikasi](docs/ai/ARCHITECTURE_SPLIT.md), dan [snapshot status](docs/ai/CURRENT_STATE.md).
2. Baca kode dan pengujian relevan pada branch tujuan; jangan mengandalkan ringkasan percakapan AI lain.
3. Jalankan/cek `git fetch origin --prune`, `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, serta PR/Issue aktif. Jangan menimpa working tree kotor.
4. Jika bekerja di branch lama yang belum memiliki AGENTS.md, baca instruksi terbaru melalui `git show origin/main:AGENTS.md` sesudah dokumen ini digabung ke main, atau gunakan URL PR dokumen yang diberikan pengguna.
5. Periksa apakah ada AI lain memegang tugas yang sama. **Satu tugas = satu penanggung jawab = satu feature branch/PR.** Jangan menyunting file yang sedang dimiliki PR agen lain tanpa koordinasi.

## Aturan wajib

- GitHub adalah sumber kebenaran **kode**, bukan memori percakapan, folder kerja lokal, maupun hasil deploy lama. GitHub Issues/PR dan handoff tertulis adalah sumber status tugas. Sinkronisasi tidak terjadi otomatis hanya karena dua agen membaca file ini.
- Buat branch baru dari dasar yang diverifikasi, misalnya `feat/game/<topik>`, `feat/farm/<topik>`, atau `docs/<topik>`; ajukan PR. Jangan push langsung ke `main`, force push, reset branch bersama, atau auto-merge.
- Pisahkan aplikasi **Smart Farm (data operasional nyata)** dan **YZ Farm Life (simulasi fiktif)**. Keduanya saat ini masih berbagi struktur aplikasi web pada main: pemisahan subdomain/repository belum dilakukan.
- Lokasi kode web game: `src/app/game/`, `src/lib/game/`, `public/game/assets/`, `game-assets/catalog/`. Aplikasi kebun dan keuangan: modul non-game dalam `src/app/` dan data Supabase. Jangan mengganti `src/app/page.tsx`, `src/app/layout.tsx`, autentikasi web, atau modul keuangan untuk memasang game standalone.
- Branch `develop/yz-farm-life` berisi jalur Docker/PostgreSQL lokal yang BERBEDA dari web main. **Jangan merge branch itu utuh ke main.** Port fitur game secara selektif dan adaptasikan auth/save backend.
- Jangan mencampur tabel game `yz_game_saves` dengan transaksi panen, gaji, kasbon, anggaran, atau pembukuan kebun. Pertahankan RLS, identitas pengguna, validasi save, kompatibilitas progres, dan migrasi data yang aman.
- Tidak boleh menyimpan kredensial, token, `.env`, dump data pribadi, atau key service-role ke GitHub; jangan mengubah DNS, akses domain, database produksi, atau deploy tanpa izin eksplisit untuk tindakan itu.
- Sebelum menyatakan selesai, laporkan commit SHA, daftar file berubah, perintah tes beserta hasil sebenarnya, dampak, risiko, PR, status deploy, dan hal yang belum teruji. Gunakan [template serah terima](docs/ai/HANDOFF_TEMPLATE.md).

## Gerbang verifikasi

Web: `npm ci`, `npm run test`, `npm run typecheck`, `npm run test:game`, `npm run build`; `npm run lint` untuk perubahan yang relevan. Jika tes gagal karena infrastruktur/lingkungan, nyatakan **belum lulus**, jangan klaim hijau. Untuk game uji peta, tabrakan, interaksi NPC, transaksi, tidur/hari, save/load, mobile, dan aset; untuk kebun uji keuangan, RLS, serta tanpa perubahan data nyata.

**Rilis adalah operasi terpisah dari commit/PR.** Build READY saja tidak membuktikan login, save, gameplay, DNS, atau domain sehat. Ikuti checklist dalam protokol.
