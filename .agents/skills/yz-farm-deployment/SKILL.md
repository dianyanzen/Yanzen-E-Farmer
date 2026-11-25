---
name: yz-farm-deployment
description: Wajib untuk deployment, Vercel, GitHub release, perbaikan domain, storage, build, rollback, CI dan pemisahan E-Farmer web-only dari YZ Farm Life game-only. Satu repo, dua project, domain tetap, tanpa preview rutin.
---

# YZ Farm Life / E-Farmer — Deployment & Release

Baca AGENTS.md dan docs/DEPLOYMENT_POLICY.md terlebih dahulu; kebijakan tersebut mengalahkan petunjuk preview, promosi, integrasi main, dan atlas lama. Jangan memuat seluruh arsip untuk satu tugas.

## Routing
- Permintaan game: hanya yanzen-e-farmer-staging, domain https://yanzen-e-farmer-staging.vercel.app/game. Gunakan branch aktif pada policy, target production project staging. Game belum rilis publik; pemain online bukan blocker deployment.
- Permintaan pertanian: hanya yanzen-e-farmer, domain https://yanzen-e-farmer.vercel.app/. Build web-only, tidak ada tombol game, route game, API game atau aset game.
- Dokumen/skill saja: commit Markdown-only dengan marker docs(deploy): ... [skip vercel]; jangan build atau membuat preview. Jangan menggunakan marker untuk perubahan runtime.
- Jangan membuat project baru, merge game ke main, atau menjalankan migration/reset/secret export untuk menyelesaikan deployment.

## Eksekusi
1. Verifikasi scope project/team/branch/SHA dan domain alias. Gunakan hasil GitHub dan Vercel aktual.
2. Jalankan tes lokal/Docker/CI yang relevan; gunakan atomic asset dan skill spesifik pekerjaan. Game-only route pruning harus di salinan ephemeral Vercel, bukan repo. 
3. Rilis paket perubahan teruji ke domain tetap. Jangan membuat preview rutin. Vercel immutable: satu deployment baru per rilis, bukan overwrite file deployment lama.
4. Verifikasi READY, build logs, route isolation, alias, runtime login, save dan UI yang disentuh. Catat tes yang tidak dijalankan; kegagalan provisioning dilaporkan sebagai blocker, jangan redeploy berulang.
5. Retensi: satu aktif + maksimal dua rollback per project sebagai target, cek semua alias sebelum menghapus URL/ID historis. Jangan menghapus project atau database. Ukur Functions Storage nyata; jangan mengasumsikan dua project = dua kuota. 
6. Simpan bukti commit, project, deployment ID, domain live, QA, storage jika tersedia dan blocker. Jangan menampilkan metadata internal pada pemain.

## Guardrail optimasi
Jangan mengubah 248 identitas canonical, RLS, fingerprint, save schema, atau standar individual asset untuk mengecilkan build. Audit dynamic filesystem tracing dan media statis; tidak boleh membuat atlas/cutting/shared files. Dokumentasikan keputusan yang belum diterapkan dan bedakan snapshot historis dari keadaan aktual.
