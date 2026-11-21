# YZ Farm Life — Character Bible, 12 kategori

**70 karakter bernama = 32 inti (1 karakter utama + 31 NPC) + 36 NPC konsep ekspansi + 2 cameo figur publik**. Masing-masing memiliki 12 bagian informasi terstruktur. Selain itu, tersedia **179 ilustrasi Rxxx** yang sengaja **belum menjadi karakter** sampai mendapat nama, motivasi dan desain cerita yang disetujui.

## Indeks

- [Indeks 70 karakter](index.json)
- [Profil inti A01–A16 dan C01–C16](core/)
- [Profil ekspansi N01–N06, K01–K30 dan cameo P01–P02](expansion/)
- [Inventaris 179 potret R yang belum dipasangkan](unassigned-artwork.json)
- [Cast canon yang sudah ada](../../catalog/cast.json)
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

**Data canon awal:** ID, nama, pekerjaan, hobi, sifat, alasan rancangan visual pada `cast.json`; potret dan manifest pada `npc-portrait-register.json`; beberapa lokasi/jadwal dan dialog pada `src/lib/game/model.ts` dan `personal-quests.ts`.

**Rancangan baru:** usia fiktif, asal, pendidikan, latar keluarga, keterbatasan, motivasi, hubungan tambahan, sample dialog, serta alur tiga babak. Seluruhnya berstatus `narrative-proposal` atau `planned-fictional`. Belum otomatis menjadi canon tersetujui, event game, atau lore yang sudah dilalui pemain.

**Status saat bermain:** hubungan, trust, mood, flag quest, pilihan pemain, waktu dan lokasi aktual tetap menjadi tanggung jawab runtime/save. `12_continuity_current_state` merekam baseline desain, bukan menyimpan state satu pemain. Perubahan story flag perlu migrasi dan tes save terpisah.

**Ilustrasi Rxxx:** 179 PNG ini belum punya data karakter yang disahkan. Jangan membuat 179 tokoh identik hanya untuk mengisi tabel. Setiap R yang akan digunakan harus mendapat satu ID identitas unik, 12 dimensi bermakna, hubungan dan fungsi cerita serta audit art style; baru pindahkan dari inventaris `unassigned` ke index bernama.

**Cameo P01/P02:** figur publik dipakai sebagai latar kejadian fiksi sesuai premis sumber. Tidak mengarang usia, keluarga, keyakinan, ciri kesehatan atau pikiran pribadi; hanya mendeskripsikan peran dalam naskah yang jelas fiksi. Validasi role aktual/sumber bila kelak dipakai untuk rilis komersial.

## Pemakaian Codex / Humanizer

1. Temukan profil dari `index.json` melalui ID. Baca ke-12 bagian dan sumber `cast.json`.
2. Catat mana canon dan mana proposal. Dalam cerita, gunakan `09_dialogue_behavior`, `06_psychological_profile` dan `08_relationship_dynamics`; periksa `12_continuity_current_state` serta save runtime sebelum mengungkap spoiler.
3. Jalankan `$yz-farm-dialogue` + `$humanizer` pada naskah, tetapi jangan menyunting kode game / hadiah / flags berdasarkan proposal tanpa persetujuan.
4. Tambahan karakter baru wajib memiliki 12 kategori dan relasi ID valid. Perbarui `cast.json` atau `bandung-character-previews.json`, buat profil file baru, lalu indeks ulang.
5. Gunakan `npm run chars:index`, `npm run chars:index:check`, dan `npm run test:game:characters` untuk memeriksa kelengkapan dan referensi.

## Catatan QA

Tes menegakkan kelengkapan, keunikan ID dan path, sumber visual, serta integritas hubungan. Tes **tidak** membuktikan estetika seni atau kualitas psikologi dan dialog. Review manusia masih dibutuhkan sebelum dianggap canon final.

Pemisahan ini sengaja menjaga banyak aset untuk ekspansi Bandung sambil menghindari beban awal, pengerjaan ulang dunia, dan perubahan runtime yang tidak diminta.
