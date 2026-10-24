# Yanzen E-Farmer

Aplikasi manajemen pertanian untuk pencatatan musim tanam, pengeluaran, persediaan, panen, dan analisis laba/rugi.

## Teknologi
- Next.js (App Router) + TypeScript
- Supabase PostgreSQL + Supabase Auth
- Tailwind CSS

## Modul V1
1. Musim tanam (termasuk Timun Part 3)
2. Kategori dan rincian pengeluaran per item
3. Pencatatan panen dan penjualan
4. Dashboard modal, biaya per tumbak, dan laba/rugi

## Mulai pengembangan
```bash
npx create-next-app@latest yanzen-e-farmer --ts --tailwind --eslint --app --src-dir
cd yanzen-e-farmer
npm install @supabase/supabase-js @supabase/ssr zod
```

Konfigurasi Supabase melalui environment variables lokal; jangan commit secrets.

## Keamanan
- Aktifkan RLS untuk setiap tabel publik dan kebijakan berdasarkan user ID.
- Autentikasi dan otorisasi dilakukan di server untuk operasi perubahan data.
- Jangan masukkan data transaksi pribadi, password, atau service-role key ke repository publik.
- Migrasi SQL dan data contoh sintetis boleh disimpan di GitHub.

Status: tahap awal persiapan repository. Aplikasi dan koneksi Supabase belum dideploy.
