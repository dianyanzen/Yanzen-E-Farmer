# AGENTS.md — Instruksi kerja AI untuk Yanzen E-Farmer

Berlaku untuk Codex, ChatGPT yang mengakses GitHub, dan agen coding lainnya. Bahasa komunikasi: Bahasa Indonesia. **Pengguna adalah pemilik produk dan satu-satunya pemberi persetujuan rilis.** AI tidak mempunyai otoritas otomatis untuk menggabungkan kode atau memindahkan domain.

## Rujukan audit game yang WAJIB (single source of truth)

**Untuk SEMUA tugas YZ Farm Life**, termasuk screenshot, keluhan pemain, arsitektur, gameplay, NPC, animasi, aset, audio, QA, PR, Docker, deploy, riset, atau implementasi, baca dahulu:
1. [Master Audit / temuan dan prioritas](docs/game-dev/GAME_AUDIT_MASTER.md).
2. [Audit Playbook / prosedur pemeriksaan](docs/game-dev/AUDIT_PLAYBOOK.md).
3. [Audit History / riwayat bukti](docs/game-dev/AUDIT_HISTORY.md).
4. [Template temuan baru](docs/game-dev/AUDIT_CASE_TEMPLATE.md).

**Wajib per sesi:** verifikasi ulang `main`/PR #30/Docker HEAD terbaru dan rilis sebenarnya, cocokkan Issue ID G-xxx, lalu laporkan delta, penyebab, keyakinan (%), alternatif, rekomendasi, dampak dan prioritas. Jangan menyimpulkan screenshot pemain telah diuji tanpa browser/perangkat, jangan mengaku preview sudah production, dan jangan membuat audit tandingan di chat tanpa memperbarui dokumen master melalui PR. Pengguna memutuskan merge dan deploy.

## Prioritas produk YZ Farm Life (keputusan pemilik 2026-11-21)

**Wajib baca [Experience-First Roadmap](docs/game-dev/EXPERIENCE_FIRST_ROADMAP.md) setelah master audit.** Docker hanya untuk eksperimen; hentikan sementara pekerjaan migrasi cloud save, SSO, pembagian domain, dan penambahan masif area/NPC. Fokus EX-01 gerak/kamera/jam/tidur, EX-02 pasar/atmosfer, EX-03 lima NPC aktif, EX-04 daily loop. Jaga save lokal serta isolasi data Smart Farm. Jangan menafsirkan `P0 RELEASE_GATE` di backlog sebagai perintah mengalihkan sprint dari game experience menuju migrasi infrastruktur selama belum ada permintaan rilis publik.

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
