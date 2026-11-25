# Batas integrasi web dan game — aktif 25 November 2026

Baca [Standar deployment](../DEPLOYMENT_POLICY.md) sebagai sumber tunggal kebijakan rilis dan [skill deployment](../../.agents/skills/yz-farm-deployment/SKILL.md).

- Satu repository, dua project Vercel permanen. Web pertanian hanya dari main; game dari branch aktif pada standar deployment. Game tidak dirilis publik, tetapi domain staging adalah target production playtest yang stabil.
- Build game-only memakai scripts/deploy/vercel-game-playtest.mjs di checkout sementara. Build web-only mengecualikan tombol, route, API dan public/game; jangan hapus source di GitHub. Jangan memakai konfigurasi game untuk website.
- Data pertanian, autentikasi, database dan save tetap terjaga. Tidak ada reset, migrasi atau perubahan RLS tanpa izin dan QA.
- Rilis langsung ke project game yang benar sesudah tes, tidak membuat preview rutin; pemain yang sedang online tidak menghalangi rilis yang kompatibel. Verifikasi SHA, READY, alias live dan QA. 
- Dokumen lama release/yz-e-farmer-web, develop/yz-farm-life dan prosedur integrasi game ke main adalah sejarah, bukan perintah sekarang.
- Status web-only masih terhambat provisioning pada snapshot 25 Nov; lihat policy dan Vercel untuk status aktual. Jangan menyatakan web-only live hanya karena konfigurasi telah diterima.

Untuk tes dan storage, ikuti policy. Jangan menghapus aset sumber, mengurangi validasi NPC, atau menurunkan keamanan karena kuota.
