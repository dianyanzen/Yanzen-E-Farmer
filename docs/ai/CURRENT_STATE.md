# Snapshot keadaan proyek — 2026-11-21 (WIB)

**PENTING:** Ini titik awal untuk sesi baru, bukan status real-time. Sebelum coding, cek HEAD branch, Issue/PR, Vercel deployment/alias, dan server Docker lagi. Jangan menganggap SHA di bawah masih HEAD.

## Repo terverifikasi

- Repository: https://github.com/dianyanzen/Yanzen-E-Farmer
- `main` pada saat drafting: `3330580b90a75f194f7f96b5e48326b7e1945c4e` (Next.js patch 16.4.6; sebelumnya gameplay pasar Pasirluyu).
- `develop/yz-farm-life` pada saat drafting: `7e386f38ed9ef35be29258bedaf573d1896e5dc2` (standalone Docker yang tertinggal dari main).
- `release/yz-e-farmer-web`: integrasi historis, bukan penunjuk production yang dapat dipercaya.
- Aplikasi kebun dan game masih dalam satu web tree main; belum benar-benar dipisah menjadi dua aplikasi/subdomain.
- Rute game web yang diketahui: `/game`, `/game/phaser`, `/game/canvas`.
- Database game web: tabel Supabase `public.yz_game_saves` dengan RLS; database Docker berbeda.
- Domain yang sebelumnya digunakan: `https://yanzen-e-farmer.vercel.app`, dengan riwayat alias yang tidak selalu sesuai project bernama serupa.

## Yang diputuskan secara konseptual

- Smart Farm ditargetkan menjadi `farm.<domain-pemilik>` pada Vercel.
- YZ Farm Life ditargetkan menjadi `play.<domain-pemilik>` pada Docker server milik pengguna.
- **Belum ada klaim bahwa domain kustom dimiliki atau DNS sudah diubah.**
- GitHub akan menjadi sumber tunggal kode dan tugas; tidak ada sinkronisasi otomatis antara chat ChatGPT dan sesi Codex.

## Backlog awal (belum diklaim agen mana pun)

1. Pilih domain nyata dan siapkan DNS/TLS setelah keputusan pengguna.
2. Tentukan cara mengisolasi folder game dari E-Farmer tanpa menghilangkan web lama.
3. Uji autentikasi dan save pada Docker serta migrasi/proses kompatibilitas progres cloud.
4. Pisahkan build pipeline farm vs game dan verifikasi deployment target masing-masing.
5. Bentuk aturan review/approval dan mulai menggunakan template handoff ini.

## Format pembaruan snapshot

Ketika ada milestone nyata, ubah tanggal pemeriksaan, SHA, status deploy, risiko, dan tautan PR bukti. **Jangan menandai backlog sebagai done hanya karena AI mengusulkan atau mengaku mengerjakannya.** Perbarui melalui PR, bukan kolaborasi edit langsung ke main.
