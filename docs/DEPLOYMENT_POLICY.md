# Standar deployment dan isolasi aplikasi — 25 November 2026

**Aktif dan wajib.** Keputusan pemilik: satu repository, dua project Vercel permanen, tanpa game pada aplikasi pertanian. Game masih live development/playtest, belum rilis publik. Istilah Vercel Production pada project staging hanya menandai domain stabil, bukan peluncuran publik.

## Matriks target
| | E-Farmer Web Only | YZ Farm Life Game Only |
|---|---|---|
| Project | yanzen-e-farmer | yanzen-e-farmer-staging |
| Domain | https://yanzen-e-farmer.vercel.app/ | https://yanzen-e-farmer-staging.vercel.app/game |
| Project ID | prj_xdgYmmEYYaldB4TVzjvIFrp7qepl | prj_NShhHPImzY1zNXHRksrYAOHGYkJ5 |
| Branch sumber yang diizinkan | main | feat/yanzen-spatial-irrigation-20261125 (branch aktif saat ini) |

Team: dianyanzens-projects. Repo: dianyanzen/Yanzen-E-Farmer. Branch game tidak boleh diganti atau digabung ke main otomatis. Jika pemilik menetapkan branch aktif baru, sinkronkan aturan ignore, production branch, dan dokumen ini sebelum deploy. Jangan membuat project, domain, atau preview baru untuk revisi rutin.

## Batas aplikasi dan build
- Web-only: seluruh modul pertanian, login, data, anggaran, panen, laporan tetap utuh; tombol Coba YZ Farm Life beserta wrapper kosong, route /game, /api/game/* dan public/game dikeluarkan dari salinan build sementara. Jangan hapus source canonical dari Git. Set NEXT_PUBLIC_YZ_GAME_PLAYTEST=0 pada build web.
- Game-only: gunakan npm run build:vercel:game-playtest dan scripts/deploy/vercel-game-playtest.mjs --check/--apply sesuai guard project dan env NEXT_PUBLIC_YZ_GAME_PLAYTEST=1. Hanya route game, login dan API auth/save/roster/bible yang diperlukan, plus layout/aset pendukung. Jangan deploy modul pertanian di game.
- Jangan membagikan cookie, kredensial, data privat atau melakukan migrasi/reset database untuk memisahkan domain. Pertahankan RLS, akun, save, identitas 248 NPC dan kompatibilitas save.
- Konfigurasi Vercel game telah menerima outputFileTracingExcludes untuk public, docs, tests dan media master; verify actual function trace, ukuran bundle, endpoint dan seluruh aset CDN. Warning dynamic filesystem access pada private-residents.ts / private-resident-bibles.ts masih perlu audit; pengecualian bukan bukti masalah selesai. Jangan ubah validasi roster atau membuka data privat demi optimasi.
- Optimasi tanpa atlas/spritesheet/cutting/shared asset. Pertahankan atomic assets, kualitas visual, lazy load lokasi, dan media statis di luar bundle server. CDN eksternal hanya setelah persetujuan, audit lisensi, URL dan fallback.

## Prosedur rilis
1. Cek branch, SHA, project ID dan alias live melalui Vercel; jangan bergantung pada URL preview lama. Jangan gunakan project yang keliru karena folder .vercel lokal.
2. Kerjakan dan uji lokal/Docker/CI. Untuk game: typecheck, test:game, chars:public:check dan tes UI yang relevan; khusus area awal, test:game:starter dan test:game:starter:ui / test:game:starter:ui:phaser bila tersedia pada branch. Untuk web: test database, typecheck, login, home dan modul pertanian. Tidak mengklaim tes perangkat nyata jika tidak dilakukan.
3. Satu rilis teruji ke production environment project staging untuk setiap paket perubahan game yang siap. Tidak perlu persetujuan tambahan hanya karena pemain sedang online (izin pemilik 25 Nov); tetap jaga kompatibilitas dan rollback. Tidak membuat preview rutin. Vercel tetap menghasilkan deployment immutable baru; domain stabil harus menunjuk versi READY baru.
4. Verifikasi build log, route output, SHA, alias yang aktif, login, save/load, NPC dan browser error. Pada web-only, pastikan tombol game tidak tampil dan /game serta /api/game tidak tersedia. Jangan menyatakan rilis selesai hanya karena build dimulai atau preview READY.
5. Jika alias tidak berpindah, verifikasi project ownership dan domain, lalu gunakan pengalihan hanya pada domain yang disetujui. Jangan mengalihkan domain pertanian ke game. Jangan menimpa domain dengan build gagal. Laporkan blocker dan jangan melakukan redeploy berulang.
6. Dokumentasi saja tidak memerlukan build. Ignore command kedua project telah disetel untuk menolak branch di luar target serta commit docs-only dengan judul `docs(deploy): ... [skip vercel]`. Marker hanya untuk commit yang seluruh diff-nya dokumen Markdown/skill (jangan pakai untuk kode, aset, test, workflow atau config runtime). Jika rilis manual diperlukan, pilih SHA runtime teruji atau override ignore secara sadar. Verifikasi status aktual; konfigurasi yang diterima tidak selalu berarti deploy otomatis sudah teruji.

## Storage dan pembersihan
- Kuota Hobby dipakai bersama dalam team; dua project tidak menggandakan kuota. Functions Storage pernah 13,26/10 GB. Target operasional di bawah 5 GB, ideal 3 GB, bukan jaminan.
- Pertahankan satu deployment live dan maksimal dua cadangan layak rollback per project sebagai target. Pengecualian sementara untuk alias web yang masih berada di staging. Cek alias dan ID setiap kali, jangan hapus deployment aktif atau cadangan yang masih diperlukan.
- Bersihkan deployment historis dengan URL/ID tepat, misalnya `npx vercel remove <deployment-hostname> --scope dianyanzens-projects`. Jangan gunakan nama project tanpa proteksi dan jangan hapus project, branch, database, aset master atau save. Periksa konfirmasi, ukur kembali Usage dan jangan paksa penghapusan yang ditolak platform. Retensi otomatis mengikuti opsi Hobby yang tersedia; lindungi production/rollback.
- Jika resource provisioning failed sebelum kompilasi, itu blocker infrastruktur, bukan bukti bug aplikasi. Jangan mengulang tanpa diagnosis. Alternatif build lokal dengan project link yang sudah diverifikasi, production env aman, dan prebuilt deploy ke project yang benar.

## Snapshot faktual 25 November 2026 (bukan status permanen)
- 34 deployment historis dihapus pemilik via CLI; 41 menjadi 7 saat verifikasi, sebelum build berikutnya. Penghematan storage aktual belum diukur.
- Game commit a0b3727067a082c7f1eb89cb654e108aefadb882, deployment dpl_7h8ZRmarDrzPkCPqnDgzbiEraKBc, READY; alias staging terverifikasi menunjuk deployment ini. Build log hanya berisi rute game/auth dan aset pendukung. Gameplay login belum diuji end-to-end.
- Website main commit 7ad08ce38bdf01035ab23603a7c8740bcef578fb, build web-only gagal Resource provisioning failed. Domain utama masih menunjuk deployment gabungan lama dpl_FFVB4SMVFAFVTiX1e5MhjGWf1Z1q milik staging. Tombol game belum hilang dari live web; jangan klaim sudah. Jangan rollback ke web Oktober tanpa audit dampak fitur.
- Production Branch otomatis game belum bisa diubah melalui konektor; pemilik perlu menyetel branch aktif tersebut di Vercel Settings bila menginginkan push langsung menjadi production. Sampai terverifikasi, deploy eksplisit ke project staging dengan target production. Jangan menganggap setting branch ignore sama dengan Production Branch.
- Ukur Usage setelah pembersihan; status dan SHA terbaru harus diambil dari platform.

Rujukan: AGENTS.md, docs/game-dev/WEB_INTEGRATION_BOUNDARY.md, .agents/skills/yz-farm-deployment/SKILL.md.
