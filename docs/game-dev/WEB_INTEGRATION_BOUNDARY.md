# Batas integrasi web dan game (status aktif, 22 November 2026)

Dokumen lama mengenai branch `release/yz-e-farmer-web` dan `develop/yz-farm-life` merupakan **sejarah integrasi**. Jangan menggunakan prosedur stage merge lama untuk mengubah `main` sekarang; source game dan web E-Farmer telah berada pada repository yang sama.

## Struktur yang dipakai

- `main` adalah sumber Git untuk kedua proyek Vercel yang terhubung: `yanzen-e-farmer` (web lengkap) dan `yanzen-e-farmer-staging` (game-only playtest).
- Project staging Hobby menggunakan `scripts/deploy/vercel-game-playtest.mjs` **hanya pada build sementara Vercel** untuk menjaga jumlah route serverless di bawah kuota. Delapan route yang dibutuhkan game dipertahankan; route web lainnya tetap ada di GitHub.
- Build web penuh **tidak** boleh memakai route pruning staging karena dapat menghilangkan halaman pertanian dan administrasi.
- Saat rilis, cocokkan project, environment, commit SHA, domain, hasil typecheck/test, status READY, dan URL yang benar. Staging READY tidak membuktikan web lengkap READY.
- Tetap pisahkan data/save game dari akun/operasional E-Farmer. Jangan mengubah schema save atau RLS tanpa migrasi dan regresi.

## Pemeriksaan sebelum produksi

Jalankan `npm run test`, `npm run typecheck`, `npm run test:game`, `npm run chars:public:check`, dan build untuk target yang benar. Cek endpoint Warga, navigasi YZ Phone, transaksi pertanian, login, simpan/muat, serta tidak ada error runtime. Jika provisioning Vercel gagal sebelum build, laporkan sebagai masalah infrastruktur; jangan menurunkan keamanan tes atau menghapus route utama untuk menyembunyikan masalah.

Referensi deployment terbaru ada di hasil Vercel, bukan di SHA atau daftar fitur historis. Baca `AGENTS.md` dan `PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`.
