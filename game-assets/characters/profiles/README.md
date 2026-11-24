# YZ Farm Life — Arsip Character Bible legacy, 12 kategori

> **PENTING (22 November 2026):** Berkas profil lama pada direktori ini adalah **referensi visual dan konten naratif legacy**, bukan roster warga canonical. Sumber resmi nama, pekerjaan, ID warga, dan kunci potret sekarang adalah **248 NPC canonical** pada `GAME_RESIDENT_ROSTER_JSON` atau `deploy/private/residents.json`, dengan dokumentasi di [NPC_ROSTER_PRIVATE_SYNC.md](../../../docs/game-dev/NPC_ROSTER_PRIVATE_SYNC.md). A01/Yanzen adalah karakter pemain terpisah dari 248 NPC. Nama dan pekerjaan legacy yang tidak cocok **tidak boleh** muncul di YZ Phone, atau ditransfer sebagai kerabat, cerita, misi, kedekatan, dan riwayat warga baru. Potret Rxxx telah terpasang ke ID canonical menurut roster owner; tidak boleh diasumsikan identitas Rxxx berdasarkan angka.

**Arsip lama mencakup 70 karakter bernama = 32 inti (1 karakter utama + 31 NPC) + 36 NPC konsep ekspansi + 2 cameo figur publik**. Masing-masing memiliki 12 bagian informasi terstruktur. Selain itu, tersedia **179 ilustrasi Rxxx** yang **sebelumnya belum dipasangkan**; sekarang acuan pemasangan adalah roster canonical privat 248, bukan inferensi visual/urutan.

## Indeks

- [Indeks 70 karakter](index.json)
- [Profil inti A01–A16 dan C01–C16](core/)
- [Profil ekspansi N01–N06, K01–K30 dan cameo P01–P02](expansion/)
- [Inventaris 179 potret R yang belum dipasangkan](unassigned-artwork.json)
- [Cast legacy, bukan roster canonical](../../catalog/cast.json)
- [Register visual dan status QC](../../catalog/npc-portrait-register.json)

## Struktur wajib setiap karakter

| No. | Kategori | Data yang dicakup |
|---|---|---|
| 01 | Core Identity | Nama, usia, asal, bahasa, identitas |
| 02 | Physical Appearance | Penampilan dan ciri fisik umum |
| 03 | Fashion & Aesthetic | Pakaian, aksesori, gaya personal |
| 04 | Social Profile | Pekerjaan, pendidikan, kehidupan sosial |
| 05 | Personality | Sifat, kebiasaan, nilai, kelemahan |
| 06 | Psychological Profile | Motivasi, kebutuhan, konflik batin |
| 07 | Background & History | Keluarga, masa lalu, pengalaman |
| 08 | Relationship Dynamics | Relasi, kepercayaan, batas pribadi |
| 09 | Dialogue & Behavior | Cara berbicara, respons, bahasa tubuh |
| 10 | Narrative Development | Peran, konflik, perkembangan karakter |
| 11 | Visual References | Referensi ilustrasi dan konsistensi visual |
| 12 | Continuity & Current State | Kondisi karakter sepanjang cerita |

Semua kategori memiliki rincian yang sesuai; contoh [Ryan A03](core/A03.json), [Nani C01](core/C01.json), [Malik C15](core/C15.json), [Tiar K24](expansion/K24.json).

## Perbedaan sumber, rancangan dan gameplay

**Data lama/prototipe (bukan canonical identitas saat ini):** ID, nama, pekerjaan, hobi, sifat, alasan rancangan visual pada `cast.json`; potret dan manifest pada `npc-portrait-register.json`; beberapa lokasi/jadwal dan dialog pada `src/lib/game/model.ts` dan `personal-quests.ts`.

**Rancangan baru:** usia fiktif, asal, pendidikan, latar keluarga, keterbatasan, motivasi, hubungan tambahan, sample dialog, serta alur tiga babak. Seluruhnya berstatus `narrative-proposal` atau `planned-fictional`. Belum otomatis menjadi canon tersetujui, event game, atau lore yang sudah dilalui pemain.

**Status saat bermain:** hubungan, trust, mood, flag quest, pilihan pemain, waktu dan lokasi aktual tetap menjadi tanggung jawab runtime/save. `12_continuity_current_state` merekam baseline desain, bukan menyimpan state satu pemain. Perubahan story flag perlu migrasi dan tes save terpisah.

**Ilustrasi Rxxx:** 179 PNG telah memiliki mapping portrait pada roster 248 milik owner (Rxxx adalah *asset key*, bukan ID orang). Jangan mengambil identitas dari indeks `unassigned`, urutan file, profil lama, atau asumsi ekspresi wajah. Audit visual dan 12 dimensi cerita tetap memerlukan QA serta izin narasi.

**Cameo P01/P02:** figur publik dipakai sebagai latar kejadian fiksi sesuai premis sumber. Tidak mengarang usia, keluarga, keyakinan, ciri kesehatan atau pikiran pribadi; hanya mendeskripsikan peran dalam naskah yang jelas fiksi. Validasi role aktual/sumber bila kelak dipakai untuk rilis komersial.

## Pemakaian Codex / Humanizer

1. Temukan profil dari `index.json` melalui ID. Baca ke-12 bagian dan sumber `cast.json`.
2. Catat mana canon dan mana proposal. Dalam cerita, gunakan `09_dialogue_behavior`, `06_psychological_profile` dan `08_relationship_dynamics`; periksa `12_continuity_current_state` serta save runtime sebelum mengungkap spoiler.
3. Jalankan `$yz-farm-dialogue` + `$humanizer` pada naskah, tetapi jangan menyunting kode game / hadiah / flags berdasarkan proposal tanpa persetujuan.
4. Tambahan karakter baru wajib memiliki 12 kategori dan relasi ID valid. Perbarui roster privat 248 yang telah di-review, verifikasi hash baru, buat Character Bible privat draft, review lalu approve secara individual. `cast.json` atau `bandung-character-previews.json` hanya untuk menjaga kompatibilitas aset/cerita lama, bukan canonical nama warga.
5. Gunakan `npm run chars:index`, `npm run chars:index:check`, dan `npm run test:game:characters` untuk memeriksa kelengkapan dan referensi.

## Catatan QA

Tes menegakkan kelengkapan, keunikan ID dan path, sumber visual, serta integritas hubungan. Tes **tidak** membuktikan estetika seni atau kualitas psikologi dan dialog. Review manusia masih dibutuhkan sebelum dianggap canon final.

Pemisahan ini sengaja menjaga banyak aset untuk ekspansi Bandung sambil menghindari beban awal, pengerjaan ulang dunia, dan perubahan runtime yang tidak diminta.
