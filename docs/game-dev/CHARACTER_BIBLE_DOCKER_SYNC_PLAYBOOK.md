# Prosedur penyelarasan 248 NPC Docker → Character Bible → YZ Phone → Vercel

Dokumen 22 November 2026 · **Tidak menjalankan deploy**. Data private Docker **tidak** boleh disalin mentah ke GitHub.

## Status yang sudah dibuktikan

- 69 NPC bernama memiliki 12 seksi Character Bible di GitHub; A01/Yanzen pemain terpisah.
- 179 potret `Rxxx` secara fisik ada di GitHub tetapi tidak memiliki pemetaan ID karakter yang disahkan.
- File foto yang tercatat dalam audit: 248 path unik; **membuktikan keberadaan file, bukan kecocokan orang atau keseragaman gaya**.
- Empat nama terlihat pada screenshot lokal Docker: A02 Nabila Septia Julfiadi, A03 Ryan Andryana Achadiat, A04 Ayu Indah Sari, A05 Vicky Prasti Verdiana. Dua cameo mempunyai nama dua unsur dalam file sumber. Nama lainnya tetap menunggu roster Docker.

## Tahap pengambilan data di server Docker

1. Ambil file roster pada path konfigurasi `GAME_RESIDENT_ROSTER`; lokasi umum yang pernah dipakai ialah `deploy/private/residents.json`. Tidak perlu dump PostgreSQL karena akun, sesi, dan save adalah data privat terpisah.
2. Cocokkan semua anggota roster dengan ID yang stabil, nama panjang, pekerjaan, identitas portrait dan checksum aset. Catat duplicate ID, duplicate nama, source portrait yang rusak, dan portrait yang tidak dapat dibuka.
3. Gunakan exporter whitelist yang telah direview (rujukan PR #37); hanya `id`, `name`, `occupation`, `portrait` yang boleh masuk snapshot publik. Ekspor default dry run; `--write` hanya setelah audit pemilik.
4. Berhenti bila jumlah NPC runtime bukan **248**, bila masih ada nama satu unsur padahal Docker menyimpan nama panjang, bila path potret hilang, atau bila ID portrait tidak sinkron.
5. Buat laporan beda karakter untuk semua ID, termasuk ID baru dan perubahan nama. **Jangan** mencocokkan berdasarkan urutan larik, nama panggilan, ataupun kemiripan wajah.

## Pengembangan 12 kategori secara aman

Setiap NPC mesti punya:
- 01 Core Identity: nama panjang, panggilan, umur, asal, bahasa dan identitas, dengan field sumber-versus-fiksi
- 02 Physical Appearance: ciri tubuh umum, gesture, QA anatomi (dua tangan, dua kaki)
- 03 Fashion & Aesthetic: pakaian/warna/aksesoris yang konsisten dengan frame portrait dan sprite
- 04 Social Profile: pekerjaan, komunitas, pendidikan dan kegiatan
- 05 Personality: trait, kebiasaan, nilai, kelemahan, kontradiksi manusiawi
- 06 Psychological Profile: kebutuhan, motivasi, kecemasan dan coping yang bukan diagnosis
- 07 Background & History: riwayat, hubungan keluarga fiksi, momen pembentuk
- 08 Relationship Dynamics: edge relasi, tingkat trust, batas, keputusan player
- 09 Dialogue & Behavior: variasi gestur, pilihan kata, konflik dan reaksi berbeda; bukan dialog AI generik
- 10 Narrative Development: awal, perubahan, konflik, quest, konsekuensi dan akhir terbuka
- 11 Visual References: asset ID/path, emosi, palet, QA sprite, ref checksum, lisensi/provenance
- 12 Continuity & Current State: canon tetap versus state dinamis dari save, flags quest dan timeline

Cameo figur publik hanya masuk cerita fiksi dengan klaim fiksi yang jelas; jangan menambahkan pernyataan atau kejadian sebagai fakta.

## Syarat aplikasi dan potret

- Satu service/resolver profil yang sama dipakai `/game`, `/game/phaser`, `/game/canvas`, panel dialog, dan YZ Phone → Warga.
- Halaman **Warga** menampilkan nama panjang terverifikasi, ringkas peran, portrait yang dipasangkan ID, dan ketika diklik menampilkan 12 dimensi yang relevan sesuai progres, tanpa membuka rahasia cerita.
- Portret default dan ekspresi dialog harus berasal dari set yang sama; jangan memakai ilustrasi `Rxxx` sebagai NPC bernama sebelum ada ID canonical.
- Continuity/affinity/quest dibaca dari save; Character Bible hanya memberi aturan canon dan baseline.
- Setiap dialog harus humanized, sesuai dialek, usia, profesi, hubungan, dan peristiwa yang sudah dialami; jangan tampilkan seluruh info sekaligus di UI.

## Gate QA dan publikasi

- Kinerja: 248 roster terverifikasi, **semua nama panjang**, tidak ada ID/portrait ganda, setiap karakter punya 12 seksi terisi individual.
- Seni: pemeriksaan manusia side-by-side seluruh portrait dan sprite terhadap art direction; potret rusak/beda gaya diberi tiket produksi, bukan di-overwrite otomatis.
- Teknologi: tes `npm run typecheck`, `npm run test:game`, `npm run build`, lalu Preview Vercel READY. Uji login, dialog, reaksi, YZ Phone, daftar/detail Warga, persistensi save, dan backward compatibility.
- Keamanan: whitelist field publik; jangan unggah email, akun, hash password, token sesi, isi save atau file konfigurasi.
- Rilis: hanya merge setelah lulus QA; tidak otomatis deploy dari branch audit ini.

## Berkas referensi

- [Master Character Bible](CHARACTER_BIBLE_248_MASTER.md)
- [Registry potret dan status identitas](../../game-assets/catalog/character-portrait-audit-248.json)
- [Exporter aman dari Docker](https://github.com/dianyanzen/Yanzen-E-Farmer/pull/37)
- [Bridge sinkronisasi web yang perlu diuji](https://github.com/dianyanzen/Yanzen-E-Farmer/pull/36)
