# Setup Yanzen E-Farmer
1. Clone repository dan jalankan `npm install`.
2. Buat project Supabase terpisah, aktifkan Auth email/password. Untuk penggunaan pribadi, matikan public signups setelah akun dibuat.
3. Jalankan SQL `supabase/migrations/202610240001_initial.sql` melalui Supabase SQL Editor.
4. Salin `.env.example` menjadi `.env.local`; isi URL dan publishable key dari Supabase Project Connect. Jangan commit `.env.local`.
5. Buat akun sendiri melalui Supabase Auth (Dashboard / Users) atau alur pendaftaran yang terkontrol.
6. Jalankan `npm run dev`; login di `/login`.
7. Setelah login, buat musim tanam dari formulir dashboard: Timun Part 3, luas_tumbak = 1150. Owner ID otomatis diisi dari sesi pengguna.
8. Data pembelian riil jangan di-commit ke repository publik. Masukkan melalui UI setelah login atau impor privat setelah memverifikasi pemilik data.
9. Sebelum produksi: jalankan `npm run typecheck`, `npm run lint`, `npm run build`; aktifkan backup, proteksi branch, dan lakukan uji dua akun untuk membuktikan isolasi RLS.

Catatan: UI V1 mendukung tambah dan hapus pengeluaran, belum edit langsung. Halaman panen dan impor privat akan ditambahkan pada fase berikutnya.
