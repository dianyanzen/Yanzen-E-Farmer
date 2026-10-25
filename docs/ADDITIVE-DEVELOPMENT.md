# Keputusan arsitektur — pengembangan additive

Tanggal: 25 Oktober 2026

## Aturan yang wajib ditaati
- Production Vercel pada rollback `eb40163fdf452247c7f6b5b2a5cda550965ed967` adalah **baseline tampilan existing**, bukan branch `main` saat Farm Operations V2 dirilis.
- Jangan mengganti `/home`, `/anggaran`, `/keuangan`, `/pertanian`, `/panen`, `/wawasan`, ataupun `FarmBottomNav` untuk memperkenalkan modul baru.
- Pengembangan fitur baru menggunakan jalur mandiri di `/operasional` dengan infrastruktur `/api/farm` dan tabel `farm_*` yang terisolasi.
- Integrasi ke halaman lama cukup menambahkan *satu shortcut* "Operasional (baru)" pada menu utama Beranda. Tidak ada pengalihan login, redirect, penggantian dashboard, atau perubahan urutan navigasi lama.
- Existing data di `farm_projects`, `budget_items`, dan `expenses` tetap digunakan oleh menu existing. Pencatatan transaksi baru di `farm_entries` tidak boleh dianggap otomatis masuk ke catatan lama; perbedaan ledger ditampilkan secara jujur, bukan digabung tanpa rekonsiliasi.
- Migrasi selalu non-destruktif dan harus bisa dijalankan terpisah; jangan menghapus tabel/kolom/record lama untuk merilis fitur baru.
- Versi produksi baru hanya boleh dipromosikan setelah pemeriksaan diff semua existing page, autentikasi, RLS, input-output, responsif HP, dan uji regresi.
- Pembuatan branch, build preview, dan pull request **tidak mengubah alias produksi**. Dilarang merge/promotion otomatis.

## Yang dipulihkan dari baseline
`src/app/dashboard/budget-editor.tsx`, `src/app/dashboard/page.tsx`,
`src/app/home/loading.tsx`, `src/app/home/page.tsx`,
`src/app/keuangan/bon/[id]/page.tsx`, `src/app/keuangan/bon/baru/new-receipt-form.tsx`,
`src/app/keuangan/expense-manager.tsx`, `src/app/panen/page.tsx`,
`src/app/wawasan/page.tsx`, dan `src/components/farm-bottom-nav.tsx`.

Hanya satu perubahan yang disengaja di existing Beranda: kartu `Operasional (baru)`.

## Modul tambahan
`/operasional` menyediakan ruang kerja untuk lahan, siklus budidaya, pekerjaan kelompok, kas, kasbon, panen, stok, aset, dan laporan. Route baru `/catat`, `/catatan`, `/lahan`, `/laporan`, `/pengaturan` tetap merupakan bagian modul operasional dan tidak mengganti menu existing. Modul ini menggunakan data `farm_*`, bukan memodifikasi ulang halaman existing.

## Batasan
- Perubahan pada branch ini **belum dipublikasikan ke produksi**.
- Skema farm_operations_v2 dan farm_evidence_v2 sudah ada di Supabase. Tidak dilakukan rollback database.
- Uji end-to-end autentikasi dan interaksi via browser akun asli masih perlu dilakukan sebelum promotion.
