# Blueprint pemisahan YZ Farm Life dan Putra Mandiri Smart Farm

**Status: RENCANA, belum menjadi konfigurasi DNS/deployment yang diterapkan.** Alamat di bawah memakai domain contoh; kepemilikan domain belum diverifikasi. Jangan membuat asumsi bahwa `yanzen.id` sudah dimiliki.

## Tujuan

Memisahkan game simulasi pertanian dan aplikasi operasional kebun nyata agar pengembangan game tidak mengubah login, anggaran, biaya, gaji, kasbon, panen, atau laporan bisnis.

| Produk | Subdomain yang diusulkan | Deploy target | Database | Tanggung jawab |
| --- | --- | --- | --- | --- |
| Portal Yanzen (opsional, nanti) | `domain-utama.tld` | Static/Next.js | Tidak wajib | Tautan produk/identitas |
| Putra Mandiri Smart Farm / YZ E-Farmer | `farm.domain-utama.tld` | Vercel | Supabase Auth + Postgres RLS | Operasional kebun nyata |
| YZ Farm Life | `play.domain-utama.tld` | Docker di server pengguna, via HTTPS reverse proxy | PostgreSQL game terisolasi | Game Phaser dan save |
| Staging game (opsional) | `play-staging.domain-utama.tld` | Docker staging terpisah | Database uji | QA sebelum rilis |

**Jika domain sendiri belum ada:** tetap gunakan dua deployment URL terpisah dulu; subdomain kustom baru dikonfigurasi setelah pemilik menyediakan domain dan memutuskan host/penyedia DNS.

## Keadaan sekarang (verifikasi ulang setiap sesi)

Saat dokumen dibuat, satu repo `dianyanzen/Yanzen-E-Farmer` memiliki web kebun dan web game di branch `main`. Route game `/game` adalah bagian dari aplikasi Next.js web yang memakai Supabase, bukan deployment Docker independen. Standalone Docker berada pada branch `develop/yz-farm-life`, dengan auth dan database lokal yang tidak boleh langsung menggantikan web. Nama proyek Vercel `yanzen-e-farmer` dan `yanzen-e-farmer-staging` bukan bukti domain publik menunjuk project tersebut; selalu inspect alias.

## Langkah implementasi bertahap

**Fase 0 — Dokumen dan workflow (tugas ini):** tetapkan AGENTS, protokol handoff, Issue/PR ownership; **tanpa mengubah routing produksi**.

**Fase 1 — Isolasi kode:** tentukan satu jalur sumber game yang otoritatif; pindahkan secara bertahap ke folder/produk terpisah. Kandidat jangka panjang monorepo:

    apps/farm/            # Web Smart Farm (Next.js + Supabase)
    apps/game/            # Web/game Phaser + server game mandiri
    packages/shared/      # Hanya tipe/aset yang benar-benar diperlukan bersama
    docs/ai/              # Kontrak koordinasi lintas AI

Struktur ini **target**, bukan struktur yang sekarang ada. Jangan memindah semua file sekali jalan; lakukan PR bertahap dengan tes path alias, static assets, auth, dan migrasi.

**Fase 2 — Pisahkan runtime:** deploy game ke Docker dengan database, backup, healthcheck, reverse proxy, TLS, WebSocket bila diperlukan, dan batas resource. Smart Farm tetap pada Vercel/Supabase. Tidak ada koneksi tulis game ke tabel keuangan farm.

**Fase 3 — Akun dan save:** tentukan apakah identitas game tetap akun lokal atau mengadopsi SSO OIDC yang benar. Subdomain berbeda tidak otomatis berbagi sesi. Untuk migrasi cloud save ke database server, buat eksport/import terverifikasi, persetujuan user, idempotensi, checksum, dan rollback. Jangan menyalin session cookie atau service role ke klien.

**Fase 4 — Subdomain:** setelah kepemilikan domain tersedia, atur DNS `farm` ke Vercel dan `play` ke proxy server, validasi SSL, HTTPS, caching aset, robots, redirect lama `/game` hanya setelah data/save dan login tervalidasi. Hindari redirect dini yang memutus pemain lama.

**Fase 5 — Operasi:** CI terpisah; release game tidak membangun Smart Farm; release Smart Farm tidak mengubah Docker game. Dokumentasikan monitoring, error budget, backup dan restore.

## Aturan tidak boleh dilanggar

1. Tidak menghapus atau mengganti route web keuangan saat memisahkan game.
2. Jangan memindah proyek, mengubah domain publik, mengubah DNS, atau deploy tanpa persetujuan eksplisit terhadap SHA/target.
3. Pertahankan kompatibilitas save lama; kegagalan baca harus memblok penimpaan save dan menyajikan error jelas.
4. Masing-masing produk punya env, database user, log, backup, dan CI sendiri. Shared branding boleh; shared write database tidak.
5. Inisiasi perubahan lintas produk dengan PR integrasi, bukti QA, dan rencana rollback.

## Kriteria selesai pemisahan

- `farm.<domain>` menampilkan seluruh fungsi manajemen kebun dengan login/keuangan valid.
- `play.<domain>` memainkan game, NPC, quest, save/reload, serta menyimpan progres di database game sendiri.
- Menghentikan Docker game tidak memutus Smart Farm.
- Mematikan/staging Smart Farm tidak menghapus save Docker game.
- CI/rollback terpisah, TLS dan DNS valid, migrasi save teruji.
- Pengguna menyetujui perpindahan traffic dan final URL.
