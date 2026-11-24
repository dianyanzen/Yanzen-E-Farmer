# Handoff sinkronisasi roster NPC — 2026-11-21

## Status rilis

**Belum ada baris roster Docker yang dipublikasikan.** Snapshot web tetap `[]` sampai identitas, pemetaan portrait, dan provenance disetujui. Dari 248 baris sumber, 0 diekspor, ditambahkan, atau diperbarui; 248 dilewati dengan alasan pada tabel di bawah. Ini bukan klaim bahwa 248 warga telah tersinkron.

## Sumber runtime yang diverifikasi

- Docker Compose `app`, `db`, dan `proxy` sehat; `GET /api/health` mengembalikan 200.
- `GAME_RESIDENT_ROSTER` aktif menunjuk ke `/run/yz-game-private/residents.json`, yang berasal dari bind mount `deploy/private` pada checkout Docker. `src/lib/local-auth/residents.ts` membaca file itu; `src/app/game/page.game.tsx` meneruskan hasilnya ke YZ Phone.
- Berkas runtime berisi **248 baris**, masing-masing tepat empat field (`id`, `name`, `occupation`, `portrait`). ID, nama case-insensitive, dan referensi portrait unik; tidak ada field tambahan.
- Checkout yang dipasang ke container ternyata branch lokal `pr-28-phaser` pada `683746bb85a566b0af126e926b51ac52460e880a`, bukan branch remote yang disebut sebagai sumber, `develop/yz-farm-life` pada `7e386f38ed9ef35be29258bedaf573d1896e5dc2`. File privat tidak dilacak Git. Konfirmasi branch sumber otoritatif sebelum ekspor berikutnya.
- Ref web saat audit: `main` `53d0cfee55344e804a31a3b22f4cdddec0f60bf5`; `release/yz-e-farmer-web` `7ee6468404209e49c76a8da4ee0b07ffa89efc3a`. Keduanya tidak diubah.
- PostgreSQL tidak menyediakan master NPC. Inventaris metadata read-only menemukan `yz_game_users` (4 baris), `yz_game_sessions` (8), dan `yz_game_saves` (4). Isi baris tidak dibaca, tidak ada dump dibuat, dan tidak ada data akun/sesi/save yang disalin.

## Rekonsiliasi katalog dan keputusan per ID

GitHub saat audit memuat 32 karakter inti (A01 dan 31 NPC), 36 konsep fiktif ekspansi, 2 cameo figur publik, serta 179 ilustrasi warga yang belum ditetapkan sebagai karakter.

| Kategori sumber Docker | Jumlah | ID | Keputusan |
| --- | ---: | --- | --- |
| NPC inti | 31 | `A02-A16`, `C01-C16` | Dilewati: seluruh 31 nama berbeda dari katalog publik. |
| Konsep fiktif ekspansi | 36 | `K01-K30`, `N01-N06` | Dilewati: nama berbeda; 28 pekerjaan juga berbeda. |
| Cameo figur publik | 2 | `P01-P02` | Dilewati: meski nama dan pekerjaan cocok, review legal dan art masih pending. |
| Warga tambahan | 179 | `W001-W156`, `W576-W582`, `W584-W599` | Dilewati: tidak memiliki Character Bible yang disetujui; pasangannya masih berstatus artwork unassigned. |
| **Total** | **248** |  | **0 dipublikasikan** |

ID dengan pekerjaan yang berbeda dari katalog konsep publik: `K01`, `K03`, `K05-K09`, `K11-K16`, `K18-K21`, `K23-K27`, `K29-K30`, dan `N03-N06`. Nama sumber sengaja tidak dicantumkan di handoff publik. A01 adalah `mainCharacterId`/karakter pemain, bukan baris roster warga; A01 tidak disisipkan untuk mengejar jumlah tertentu.

Roster tidak membawa field role, playable, spawned, atau relasi Character Bible. Status yang dapat diverifikasi dari game model: lima NPC ditempatkan di dunia saat ini, yaitu A03, A04, C01, C07, dan C08. Warga katalog lainnya tidak otomatis menjadi NPC yang dimainkan atau di-spawn.

## Audit portrait dan aset

- Semua **248** referensi memiliki file lokal Docker dan pasangan path canonical di GitHub; **248/248 SHA-256 cocok**, tidak ada file hilang atau berbeda, dan tidak ada hash konten duplikat. Tidak ada aset baru yang perlu diunggah.
- Docker memakai path datar `public/game/assets/portraits/bandung/{portrait}.png`; katalog web memakai subfolder kategori. `bandungConceptPortraitPath` memetakan URL web canonical. Ekspor awal PR #37 gagal karena hanya mencari path ber-subfolder; exporter sekarang memeriksa path canonical dan fallback datar Docker. Dry-run ulang memvalidasi 248 baris tanpa menulis snapshot.
- Semua 248 aset di `game-assets/catalog/asset-database.json` masih berstatus `public-candidate`, `origin-needs-record`, dan `concept-art-not-dialogue`, dengan style family `bandung-concept-illustration-v1`. Karena provenance sumber belum tercatat dan kualitasnya bukan portrait dialog/runtime, aset belum disetujui untuk identitas warga baru.
- `game-assets/characters/profiles/unassigned-artwork.json` menyatakan 179 Rxxx belum memiliki `characterId`, identitas, atau art approval. Pemetaan privat juga menyilangkan kategori: 17 baris Wxxx memakai portrait K/N, sementara 17 baris K/N memakai portrait R. Tidak ada ID atau portrait yang diubah otomatis.
- Seluruh 179 R portrait pada roster cocok dengan inventaris unassigned: `R001-R128`, `R130`, `R132`, `R134`, `R136-R137`, `R139`, `R141-R142`, `R144`, `R152-R158`, `R164-R182`, dan `R184-R199`. Rentang ini tidak menyetujui identitas Wxxx yang mungkin dipasangkan dengannya.
- Tidak ada asset manifest baru karena semua file sudah tercatat dan tidak ada pemetaan privat yang aman untuk dipublikasikan. Fingerprint audit untuk daftar 248 path canonical: **SHA-256 `4e361ef2e06a783beefb7049655e055bd5fae4ea3941eed6dbb876d1872a773d`**, dihitung dari baris terurut `path<TAB>file-SHA256<LF>`.

## Snapshot, manifest, dan hash

- Snapshot web: [`src/lib/game/data/published-residents.json`](../../src/lib/game/data/published-residents.json), tetap `[]`.
- SHA-256 byte snapshot Git (`[]` diikuti LF): `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`.
- Indeks metadata aset yang telah ada: [`game-assets/catalog/asset-database.json`](../../game-assets/catalog/asset-database.json). Tidak ada hash roster privat atau data baris yang dicatat di dokumen ini.

## Git, PR, dan QA

- Branch integrasi web: `fix/game-npc-docker-vercel-roster-20261121`, base `main`. PR #36 tetap **draft/open**: https://github.com/dianyanzen/Yanzen-E-Farmer/pull/36
- Branch exporter Docker: `chore/docker-npc-exporter-20261121`, base `develop/yz-farm-life`. PR #37 tetap **draft/open**: https://github.com/dianyanzen/Yanzen-E-Farmer/pull/37
- Commit integrasi yang diuji: `71748b3885ece3b6d668801ad21b4d75e06042d7`. Commit exporter/layout fix PR #37: `425cdae0681073c103b1d1559f570c22f7d9fd2b`.
- `npm run test:game`: **PASS**. `npm run typecheck`: **PASS**. `npm run build`: **PASS**. Dry-run exporter/schema/uniqueness/portrait-path checks: **PASS**, 248 valid, tidak menulis file. Pemeriksaan workflow aset (`assets:index:check`, `assets:categories:check`, `test:game:assets`, `assets:quality`): **PASS**. ESLint pada file yang diubah: **PASS**.
- `npm run lint`: **FAIL** pada dua file baseline yang tidak berubah dari `origin/main`: `src/lib/game/phone-profiles.ts` dan `tests/game-bandung-world.mjs` (masing-masing rule `no-assign-module-variable`); ada 17 warning baseline lainnya.
- GitHub Actions `quality` berstatus **failure** pada kedua PR karena akun GitHub terkunci akibat billing: annotation menyatakan job tidak dimulai, dengan `runner_id: 0` dan tanpa steps. Jadi CI belum menjalankan tes kode. Pemilik akun perlu menyelesaikan isu billing lalu rerun workflow. Ini terpisah dari kegagalan lint lokal di atas.
- Tidak ada merge ke `main` atau `release/yz-e-farmer-web`, preview Vercel belum dijalankan, dan tidak ada deployment production.

## Perbedaan web dan langkah integrasi aman

- Docker membaca file privat melalui local auth dan galeri Docker mengganti daftar default saat roster tidak kosong. A01 karena itu tidak muncul di daftar warga Docker. Integrasi web PR #36 memakai snapshot publik dan menggabungkan roster dengan katalog canon, sehingga 32 karakter inti dan 38 konsep tetap terlihat.
- Vercel tidak dapat membaca bind mount Docker. Hanya JSON publik yang ditinjau boleh masuk ke snapshot; jangan sambungkan akun, sesi, atau saves Docker ke Supabase.
- Pertahankan `[]` sampai pemilik mengonfirmasi alias fiktif untuk ID yang berbeda, meninjau 28 pekerjaan yang berubah, menyetujui cameo P01/P02, dan memberikan Character Bible serta approval art/provenance untuk warga Wxxx dan pemetaan portrait silang.
- Setelah persetujuan: buat input privat terkurasi yang hanya berisi baris yang disetujui; jangan jalankan `--write` terhadap roster 248 baris mentah. Jalankan exporter tanpa `--write`, tinjau subset ID/nama/pekerjaan/portrait, pastikan portrait dan lisensinya siap, baru tulis subset itu ke snapshot. Jalankan ulang semua tes dan lakukan QA Vercel Preview (YZ Phone, portrait, dialog, save/load, serta halaman E-Farmer) sebelum meminta review/merge. Jangan merge atau deploy production dalam tahap ini.

## Known issues dan rollback

- Sumber checkout Docker aktif tidak cocok dengan branch `develop/yz-farm-life` yang diminta; perlu konfirmasi pemilik sebelum sinkronisasi data berikutnya.
- **Belum ada warga baru yang siap dipublikasikan** berdasarkan bukti saat audit. Semua 67 nama ber-ID canon yang bukan cameo berbeda dari nilai publik; 179 Wxxx belum merupakan identitas karakter yang disetujui.
- Perubahan yang dikirim hanya exporter, pemeriksaan deterministik lintas line ending Windows, tes, dan handoff. Snapshot tetap kosong; PostgreSQL, game saves, aset canon, main, release, dan production tidak diubah.
- Rollback: tutup PR draft bila tidak dilanjutkan atau revert commit handoff/integrasi pada branch PR #36 dan commit exporter `425cdae0681073c103b1d1559f570c22f7d9fd2b` pada PR #37. Tidak diperlukan pemulihan database atau save.
