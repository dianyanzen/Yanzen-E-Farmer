# Sinkronisasi Character Bible berbasis Docker

Dokumen ini melengkapi NPC_SYNC_HANDOFF_20261121.md. Referensi identitas teratas untuk NPC fiktif yang diperbarui adalah roster runtime Docker pada checkout yang benar. Karakter pemain A01 bukan warga.

## Alur yang berlaku

1. Pastikan file privat \`deploy/private/residents.json\` yang dipasang ke container memang roster otoritatif. Periksa nama, pekerjaan, hak penggunaan potret, dan status fiktif per ID. Jangan mengimpor pengguna, save, sesi, e-mail, lokasi rumah, data identitas atau data pribadi.
2. Jalankan exporter yang sudah ada secara dry-run. Jika isinya disetujui untuk disimpan di repository publik, gunakan \`--write\` untuk memperbarui \`src/lib/game/data/published-residents.json\`.
3. Jalankan \`npm run chars:residents\` untuk membangun \`src/lib/game/data/published-resident-bibles.json\`. Periksa 12 dimensi pada setiap entri draft dan lakukan penyuntingan editorial sebelum memutuskan canon.
4. Jalankan \`npm run chars:residents:check\`, \`npm run test:game\`, \`npm run typecheck\`, \`npm run build\`. Audit semua perubahan nama yang muncul dalam dialog dan quest. Uji YZ Phone serta portrait pada Vercel Preview, lalu review PR sebelum rilis.

## Prinsip rekonsiliasi

- Bila ID, nama, dan pekerjaan masih persis sama dengan katalog, pertahankan Character Bible panjang yang sudah ditulis; jangan buang cerita dan relasi berkualitas.
- Bila ID tetap tetapi nama/pekerjaan berubah, siapkan draft baru yang mengikuti roster Docker. **Jangan mewariskan usia, keluarga atau kisah pribadi karakter lama kepada nama baru.**
- Bila Wxxx baru muncul, buat 12 dimensi dengan identitas dan pekerjaan sesuai roster. Pengembangan sifat, kebiasaan, konflik, hubungan, dan quest dalam draft adalah **usulan fiksi**, bukan fakta dari Docker. Usia dan keluarga tidak dikarang sebagai fakta.
- Generasi pertama memakai tema pekerjaan untuk menghindari profil kosong; ini dasar kerja editorial, bukan pengganti penulisan unik per NPC. Lakukan humanizer, audit dialog dan peninjauan hubungan sebelum menetapkan kanon.
- Cameo P01/P02 hanya boleh memakai kanon publik yang telah disetujui; perubahan identitas cameo menyebabkan generator gagal.
- Potret konseptual W/R/K/N tetap bukan sprite emosi dialog. Jangan mengklaim jadwal, quest, kedekatan atau lokasi sudah aktif jika game belum mengimplementasikannya.
- PostgreSQL tetap khusus data autentikasi, sesi dan game save. ID NPC wajib stabil agar relasi save tidak rusak.

## Mengapa data tidak langsung terbit

Vercel tidak membaca bind mount Docker. Berkas JSON yang menjadi data publik perlu ditinjau, di-commit, lalu di-build. Generator hanya membaca snapshot publik; menjalankannya pada repo tanpa roster terbit akan menghasilkan objek kosong, bukan menyalin isi privat secara diam-diam.
