# Yanzen E-Farmer

Aplikasi pertanian **mobile-first** untuk mengelola proyek kebun, anggaran rencana, pengeluaran aktual, dan bon internal. Identitas visual: **Botanical Luxury** (forest green, ivory, sage, gold).

## Aplikasi
- Production: https://yanzen-e-farmer.vercel.app
- GitHub: https://github.com/dianyanzen/Yanzen-E-Farmer
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security (RLS)
- Deployment otomatis ke proyek Vercel yang sama dari branch `main`.

## Modul yang terimplementasi
1. **Beranda** — ringkasan proyek, anggaran, pengeluaran, shortcut buat bon.
2. **Anggaran** — buat proyek, ubah rincian kebutuhan, pencarian, duplikasi proyek, total dan biaya/tumbak otomatis.
3. **Unduh Excel** — export .xlsx dari anggaran tersimpan, tiga worksheet: Anggaran, Ringkasan, Petunjuk; rumus `SUM`, `SUMIF`, `COUNTIF`. Akses melalui detail proyek.
4. **Keuangan** — catatan pengeluaran aktual terpisah dari rencana.
5. **Bon / Struk Pengeluaran** — beberapa kebutuhan dalam satu bon, subtotal dan total otomatis, nomor bon, tanggal, pemasok, catatan, simpan ke Supabase, riwayat bon, cetak atau simpan PDF via browser. Ini **dokumen pencatatan internal**, bukan bukti resmi pembayaran dari penjual.
6. **Pertanian** — daftar proyek dan tanaman yang tersimpan.
7. **Wawasan** — ringkasan dan perbandingan anggaran vs pengeluaran.
8. **Panen** — layar persiapan; pencatatan belum diimplementasikan.

## Data Timun Part 3
Database terhubung berisi satu proyek **Timun Putra Mandiri**, luas **1.150 tumbak**, dengan **24 item anggaran** bernilai **Rp74.262.000**. Data dapat diubah oleh pemilik akun; angka ini adalah snapshot awal dan bukan nilai hardcoded pada dashboard.

## Struktur database
- `public.farm_projects` — proyek dan luas lahan
- `public.budget_items` — rincian anggaran
- `public.expenses` — pengeluaran aktual, item bon, kelompok bon dan nomor bon

Kolom `receipt_group` menghubungkan beberapa baris pengeluaran ke satu bon. Kolom `line_position` mempertahankan urutan item.

Tabel di `public` mengaktifkan RLS berbasis `auth.uid()`. Kredensial Supabase **tidak boleh** disimpan di GitHub; `SUPABASE_SERVICE_ROLE_KEY` hanya aman di sisi server dan tidak diperlukan oleh frontend.

Migrasi di `supabase/migrations/` merepresentasikan struktur database yang dipakai sekarang. Jangan menerapkannya lagi secara membabi buta jika database sudah dimigrasi.

## Pengembangan lokal
1. `npm install`
2. Set `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di `.env.local`
3. `npm run dev`
4. `npm run build`

## Catatan batasan
- Excel dapat diedit secara mandiri tetapi tidak tersinkron kembali otomatis ke Supabase.
- Export Excel dibatasi kurang dari 1.000 rincian per proyek per permintaan, untuk mencegah pemotongan data oleh batas paginasi.
- Pengelola riwayat Keuangan saat ini memuat 200 baris pengeluaran terbaru lintas proyek.
- Foto nota, POS resmi, dan fitur panen lengkap belum tersedia.
- Belum ada pengujian end-to-end interaktif menggunakan akun pelanggan, meski build Vercel telah berhasil.
