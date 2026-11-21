# Protokol sinkronisasi ChatGPT ↔ Codex — v1.0

**Status:** rancangan aturan operasional; mulai efektif untuk semua pekerjaan setelah PR dokumen ini masuk ke `main` dan diambil oleh lingkungan Codex.

## 1. Siapa yang mengatur?

- **Pemilik produk (pengguna):** menetapkan prioritas, keputusan arsitektur final, persetujuan merge/rilis, target server, domain, dan migrasi data.
- **GitHub (single source of truth):** menyimpan kode, riwayat commit, branch, Issues (daftar tugas), Pull Requests (review + kepemilikan tugas), serta dokumen handoff.
- **Codex di server/lokal:** pelaksana utama implementasi fitur game/Docker, pengujian lokal, dan proposal PR; bukan pemilik main atau production.
- **ChatGPT:** analisis arsitektur, telaah PR, koordinasi, riset, penyusunan spesifikasi, dukungan implementasi lintas modul dan verifikasi deployment jika diminta. ChatGPT boleh mengimplementasikan fitur yang didelegasikan melalui branch/PR miliknya.
- **Aturan kepemilikan tugas lebih penting daripada identitas agen.** Jika pengguna menugaskan fitur game kepada ChatGPT, Codex tidak boleh sekaligus mengedit file yang sama tanpa handoff.

Tidak ada sinkronisasi memori/chat otomatis antara kedua agen. **Hanya artefak yang benar-benar di-commit/ditulis pada GitHub** yang dianggap handoff antarsistem.

## 2. Sumber dan batas aplikasi saat ini

| Ruang kerja | Lokasi saat ini | Backend/runtime saat ini | Batas keras |
| --- | --- | --- | --- |
| Smart Farm | Modul non-game `src/app/`, `src/lib/supabase/`, `supabase/migrations/` | Next.js + Supabase/Vercel | Data panen, biaya, kasbon, gaji, inventaris, keuangan nyata |
| YZ Farm Life WEB | `src/app/game/`, `src/lib/game/`, `public/game/assets/`, `game-assets/catalog/` | Phaser + Next.js + Supabase `yz_game_saves` | Tidak boleh mengubah data riil Smart Farm |
| YZ Farm Life DOCKER | Branch historis `develop/yz-farm-life` | Game standalone, PostgreSQL lokal, auth lokal | Jangan merge seluruh tree ke aplikasi kebun |
| Shared | `public/brand/`, komponen/kontrak yang disepakati | Belum dijadikan package terpisah | Jangan membuat dependensi silang tanpa desain |

Branch `release/yz-e-farmer-web` adalah artefak alur integrasi sebelumnya, **bukan otomatis branch production**. Selalu cek branch yang disetel pada Vercel dan alias domain saat ini; nama project dan nama domain tidak menjamin deployment sama.

## 3. Cara mengklaim pekerjaan (single writer)

1. Sebelum coding, lakukan `git fetch origin --prune`, cek `origin/main` dan PR/Issue terbuka. Catat base SHA.
2. Buat satu GitHub Issue atau Draft PR per task dengan **Goal, owner ChatGPT/Codex, batas file, base SHA, kriteria selesai**. Gunakan judul `[GAME]`, `[FARM]`, `[SHARED]`, atau `[INFRA]`.
3. Branch berbeda untuk setiap pekerjaan: `feat/game/<slug>-codex`, `feat/farm/<slug>-chatgpt`, `fix/infra/<slug>`, `docs/<slug>`. Bukan `main` dan bukan branch yang dipakai agen lain.
4. Agen lain harus membaca daftar tugas aktif sebelum mengambil file yang beririsan. Jika overlap, **berhenti dan serahkan pekerjaan lewat PR/handoff**. Label/penamaan branch adalah kesepakatan koordinasi, bukan file lock teknis yang otomatis mencegah race.
5. Perubahan lintas batas GAME/FARM/SHARED memerlukan PR terpisah atau satu PR integrasi yang secara eksplisit menjelaskan dampaknya dan mendapat review pemilik.

## 3A. Kontrak audit untuk semua tugas YZ Farm Life

Untuk setiap sesi/PR menyangkut game, wajib membuka [Master Audit](../game-dev/GAME_AUDIT_MASTER.md), [Audit Playbook](../game-dev/AUDIT_PLAYBOOK.md), dan [Audit History](../game-dev/AUDIT_HISTORY.md). Cocokkan ID G-xxx dan SHA sumber. Jika temuan baru, tambahkan ID berikutnya melalui PR. Ikuti 7 langkah observasi → penyebab → keyakinan (%) → kemungkinan lain → rekomendasi → dampak pada game → prioritas. Screenshot/tes berakun yang belum dijalankan harus dicatat NOT_RUN, bukan PASS.

Status `FIXED_IN_PR` bukan `VERIFIED` dan tidak sama dengan `RELEASED`. Codex server harus menarik docs dari branch terbaru; ChatGPT harus memeriksa konektor GitHub pada sesi analisis baru. Kedua AI tidak berbagi memori chat otomatis.

## 4. Mulai setiap sesi (ChatGPT dan Codex)

- Pastikan repository `dianyanzen/Yanzen-E-Farmer`, branch dan HEAD benar; jangan salah mengira branch game Docker adalah main.
- Baca `AGENTS.md`, dokumen ini, [arsitektur](ARCHITECTURE_SPLIT.md), [status](CURRENT_STATE.md), Issue/PR terkait, lalu inspeksi kode aktual. Bila main belum memuat instruksi, gunakan branch PR dokumen yang diberikan pengguna.
- Verifikasi pohon kerja bersih. Jika perubahan lokal bukan milikmu, jangan `reset --hard`, `clean -fd`, atau overwrite.
- Cocokkan base SHA dengan `origin/main` terbaru, pahami commit baru yang relevan. Bila branch bergerak saat bekerja, lakukan diff/rebase pada branch pribadi dengan aman; jangan paksa update branch bersama.
- Nyatakan pekerjaan dan file yang akan disentuh di Issue/PR sebelum coding. Jangan menyimpulkan tugas selesai berdasarkan klaim AI sebelumnya.

Contoh pemeriksaan oleh Codex:

    git remote -v
    git fetch origin --prune
    git status --short
    git branch --show-current
    git rev-parse HEAD
    git rev-parse origin/main
    git log --oneline -5 origin/main
    git diff --name-status origin/main...HEAD

ChatGPT yang memakai konektor GitHub wajib membaca file dan metadata branch/PR melalui konektor; ringkasan percakapan hanya petunjuk awal.

## 5. Menutup dan menyerahkan task

Setelah coding, agen:
1. Jalankan tes minimum sesuai modul; cantumkan perintah dan bukti PASS/FAIL yang benar, bukan perkiraan.
2. Catat file berubah, SHA lengkap, base commit, perubahan migrasi, aset baru dan atribusi lisensinya, risiko, serta hasil QA mobile/desktop yang sudah/belum dijalankan.
3. Buat/update PR dengan [format handoff](HANDOFF_TEMPLATE.md), tangkapan layar bila UI berubah, dan tautan deployment preview bila benar-benar tersedia.
4. Beri status tegas `READY_FOR_REVIEW`, `BLOCKED`, atau `NEEDS_TEST`, bukan “sudah deploy” bila hanya berhasil push.
5. Agen penerima membaca diff PR dan menjalankan tes ulang pada commit tersebut; tidak menerima hanya berdasarkan narasi chat.
6. Pemilik memutuskan merge. Hanya setelah approval dan smoke test dilakukan deployment/promotion.

## 6. Resolusi konflik

- **File sama, dua PR:** pilih satu owner, agen kedua menahan edit; pindahkan pekerjaan melalui handoff, atau jadikan PR turunan dari branch pemilik dengan izin.
- **Perbedaan main vs Docker:** port fitur/asset game *selektif*, pertahankan auth Supabase untuk web dan auth PostgreSQL untuk Docker; jangan mengganti package, layout, route, atau konfigurasi website secara menyeluruh.
- **Konflik data/game save:** buat rencana backup, kompatibilitas versi `safeLoad`, migrasi idempotent, pengujian dua akun, dan rollback. Jangan impor data save pengguna tanpa keputusan pemilik.
- **CI gagal atau deployment ERROR:** anggap belum lulus; bedakan error kode, dependency, resource provisioning, dan runtime. Jangan menyamakan `READY` dengan seluruh fitur telah dites.
- **Koneksi GitHub/Codex offline:** tidak boleh mengaku telah menyinkronkan GitHub; simpan perubahan lokal, laporkan SHA/bukti, lanjut push setelah tersambung.

## 7. Checklist sebelum merge dan rilis

**Web Smart Farm:** `npm ci`; `npm run test`; `npm run typecheck`; `npm run test:game`; `npm run build`; lint bila relevan; halaman `/`, `/login`, `/home`, `/anggaran`, `/keuangan`, `/panen` tidak regress; validasi RLS.

**Game:** simpan/muat ulang menggunakan akun uji; akses NPC, quest, toko/pancing, tanam-panen, tidur, pergerakan lintas peta, collider, responsive/mobile/touch, aset 200 dan transparansi; tidak ada error browser. Uji akun kedua untuk isolasi save.

**Docker:** database sendiri, volume persisten, backup, healthcheck, reverse proxy TLS, secret environment server-side, tes build/container/runtime. Jalur ini tidak otomatis sama dengan Vercel.

**Release:** approval pemilik yang menyebut target dan commit SHA, snapshot/backup jika migrasi, deployment `READY`, tes URL sebenarnya, verifikasi alias/DNS, dan rollback target yang diketahui. Jika belum terpenuhi, jangan pindahkan traffic.

## 8. Kebijakan keamanan dan kewenangan

Tidak menghapus volume, migrate produksi, mengubah DNS/subdomain, memindah traffic, mengganti auth, mematikan RLS, memperlebar CORS, membagikan token, atau membeli domain tanpa otorisasi eksplisit. Untuk task yang memang disetujui pengguna, jalankan hanya perubahan yang diperlukan.

Setiap hasil kerja mengandung: **commit SHA + PR + tes + status deploy + risiko tersisa + siapa yang mengambil langkah berikutnya**. Ini adalah kontrak sinkronisasi dua AI.
