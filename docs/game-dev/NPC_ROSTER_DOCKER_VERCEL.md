# Sinkronisasi aman NPC: Docker → GitHub → Vercel

## Kondisi yang terverifikasi (21 November 2026)

- Katalog inti GitHub berisi Yanzen dan 31 NPC; profil Character Bible mencakup 70 karakter bernama.
- Data runtime Docker **tidak** membaca master NPC dari PostgreSQL: tabel PostgreSQL menyimpan akun, sesi, dan save. Roster tambahan bersumber dari `deploy/private/residents.json`, yang tidak masuk Git.
- Vercel menjalankan build dari repository dan tidak dapat membaca file privat di mesin Docker. Halaman game web perlu mendapat salinan **publik-tertinjau** untuk nama, pekerjaan, dan pointer portrait saja.
- GitHub tetap menjadi sumber aset dan naskah game; progres hubungan, quest dan pilihan pemain tidak diekspor dari server Docker.

## Prosedur pada server Docker

1. Periksa `deploy/private/residents.json` secara lokal. Setiap baris hanya boleh berisi empat field: `id`, `name`, `occupation`, `portrait`. Pastikan data fiktif/publikasi telah disetujui. Jangan sertakan kontak, tanggal lahir, alamat, kredensial, identitas kependudukan atau status permainan.
2. Pastikan portrait yang dipilih sudah ada di `public/game/assets/portraits/bandung/` dan telah melalui QA visual/lisensi.
3. Jalankan (dalam checkout Git yang sudah memuat script ini):

   ```sh
   node scripts/game-characters/prepare-public-resident-roster.mjs --input deploy/private/residents.json
   ```

4. Jika validasi lolos dan daftar telah diperiksa, jalankan:

   ```sh
   node scripts/game-characters/prepare-public-resident-roster.mjs --input deploy/private/residents.json --write
   npm run test:game
   npm run typecheck
   npm run build
   ```

5. Review diff **hanya** `src/lib/game/data/published-residents.json` beserta aset portrait baru yang diperlukan. Jangan commit file privat Docker, volume, PostgreSQL dump, `.env`, token, akun, sesi, atau saves.
6. Kirim perubahan tersebut ke branch integrasi web melalui PR; pastikan hasil validasi GitHub dan deployment Vercel Preview `READY`, uji YZ Phone → Warga, dialog, avatar, save dan halaman E-Farmer sebelum promosi.

## Aturan penting

- Exporter memakai **allowlist field yang ketat** dan dry-run sebagai default. Field ekstra membuat ekspor gagal; penggunaan `--write` memerlukan tindakan sadar.
- Roster yang dipublikasi **menimpa atribut tampilan** pada ID yang sama, tidak membuang karakter canon yang tidak tercantum. Karakter Wxxx yang baru menjadi entri warga, **bukan NPC dengan jadwal, quest dan dialog otomatis**.
- JSON publik adalah **snapshot versioned**, bukan replikasi database live. Rebuild/deploy dibutuhkan setiap perubahan; jangan menanamkan kredensial Docker di Vercel.
- Backup/restore save PostgreSQL harus dikerjakan terpisah. Sinkronisasi akun maupun sesi Docker ke akun Supabase/Vercel **tidak dilakukan**.
- Jika roster privat belum tersedia, `published-residents.json` tetap `[]`; Vercel memakai seluruh katalog karakter yang telah ada.
- Selalu verifikasi alamat dan izin deployment; jangan mengubah production branch atau merge ke `main` sebelum pemeriksaan dan persetujuan rilis.
