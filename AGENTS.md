# Pedoman agen — YZ Farm Life / Yanzen E-Farmer

**Berlaku untuk pekerjaan game, diperbarui 23 November 2026.** Repository juga berisi aplikasi pertanian E-Farmer. Jangan mengubah data, autentikasi, anggaran, atau operasi pertanian karena permintaan revisi narasi/game. Baca dokumen yang relevan, bukan seluruh arsip tanpa memeriksa statusnya.

## Prioritas sumber (wajib)

1. **Kebenaran runtime**: `src/app/game/`, `src/lib/game/model.ts`, `src/lib/game/personal-quests.ts`, `src/lib/game/phone-story.ts`, save schema dan tes yang sedang berjalan. Fitur dalam dokumen desain belum tentu playable.
2. **248 identitas canonical**: `game-assets/catalog/npc-public-roster.json` (ID, nama, profesi, portrait key) dan `public/game/data/npc/index.json`. Keempat atribut dan fingerprint dikunci; perubahan hanya setelah persetujuan pemilik dan audit menyeluruh.
3. **Character Bible 12 kategori**: `public/game/data/npc/{ID}.json`, berlabel draf fiksi; catatan visual/provenance adalah bahan editor, bukan teks yang harus dilihat pemain. Wiki `docs/game-dev/characters/{ID}.md` diturunkan dari JSON, bukan sumber identitas terpisah.
4. **Cerita runtime lama**: `game-assets/catalog/cast.json` dan `game-assets/characters/profiles/` adalah sumber untuk sistem/quest legacy yang masih hidup. **Jangan** menyamakan karakter lama dengan roster baru berdasarkan ID, nama pendek, atau gambar. Relasi hanya melalui `approvedLegacyId` dengan izin manual.
5. **Rencana jangka panjang**: dokumen desain/atlas/ekspansi adalah proposal sampai didukung kode dan tes. 30 kecamatan/151 kelurahan belum berarti seluruh peta dimainkan.

## Identitas visual dan kurasi aset (wajib untuk SEMUA pekerjaan aset)

**Keputusan pemilik 23 November 2026:** YZ Farm Life harus terasa sebagai dunia farming-life Bandung yang hangat, natural, jelas, kaya detail secara selektif, **tidak terlalu ramai**, dan mempunyai ciri khas yang konsisten. Keindahan satu aset tidak mengalahkan keserasian seluruh game. Jangan langsung generate ulang massal atau menghapus koleksi lama.

- **Sumber arah visual canonical:** baca `docs/game-dev/YZ_VISUAL_IDENTITY_BIBLE.md`; untuk audit, regenerasi, tata letak, folder aset, penghapusan atau ekspansi wajib baca `docs/game-dev/ASSET_REDESIGN_LIFECYCLE.md` dan skill `.agents/skills/yz-farm-art-director/SKILL.md`. Gunakan `docs/game-dev/ASSET_VISUAL_AUDIT_20261123.md` sebagai baseline dari tujuh screenshot pemilik, bukan kesimpulan permanen.
- **Sebelum generate:** tetapkan fungsi bangunan, style family, perspektif, ukuran relatif 20px tile / 24×32px karakter (verifikasi runtime), footprint, pintu, jalan, interior, active props, density, dan akses. Bandingkan usulan terhadap aset paling baik yang sudah ada.
- **Aset harus jelas namun tidak berisik:** fokus visual, ruang tenang, warna-material harmonis, bentuk bangunan logis, jalan benar-benar menyentuh ambang pintu, perabot punya collision/interaksi sesuai bentuk. Uji di ukuran ponsel dan kedua renderer.
- **Kebijakan retensi:** KEEP/POLISH/REDESIGN/FUTURE_KEEP/ARCHIVE/QUARANTINE/REMOVE_CANDIDATE; jangan hapus master, aset referensi, aset ekspansi berkualitas, atau file yang masih dipakai game/quest/NPC/komoditas/UI. Penghapusan hanya setelah audit dependensi, QA pengganti, rollback, dan persetujuan pemilik terpisah.
- **Sebelum merge:** screenshot before/after, tes navigasi/collision/save, QA ketajaman/overlap, validasi katalog media, Vercel status sebenarnya, dan keputusan final yang dijelaskan kepada pemilik. Jangan mengubah sistem pertanian non-game.

**Potret NPC aktif:** sebelum membuat/mengganti wajah, strip ekspresi atau potret profesi Ryan/Ayu/Nani/Widi/Inggit, wajib baca `docs/game-dev/ACTIVE_NPC_PORTRAIT_STANDARD.md` dan verifikasi `tests/game-active-portrait-standard.mjs`. Potret profesi statis tidak boleh menggantikan ekspresi pada dialog. Potret Widi yang dipilih pemilik pada PR #43 sudah menggantikan kandidat 512px yang tidak serasi; tetap wajib uji pada UI mobile dan sprite dunia sebelum menandai QA runtime selesai.

## Untuk setiap perubahan yang tampil ke pemain

- Gunakan **Bahasa Indonesia alami**, dialek Sunda secukupnya. Baca `.agents/skills/humanizer/SKILL.md` (upstream terkunci) bersama `.agents/skills/yz-farm-dialogue/SKILL.md`. Untuk Warga, baca juga `.agents/skills/yz-farm-encyclopedia/SKILL.md`.
- **Pisahkan pemain dan developer** sesuai `docs/game-dev/PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`: pemain melihat tokoh, cerita yang relevan, tindakan, dan akibat nyata; developer melihat canonical ID, approval, provenance, audit, kondisi runtime, QA, dan kontrak data.
- Menu **YZ Phone → Warga** adalah satu direktori NPC, tanpa aplikasi Wargapedia kedua. Profil yang disajikan mengikuti allowlist `wargaPlayerView` di `src/lib/game/public-wargapedia.ts` — **jangan render 12 seksi mentah**, key JSON, ID, draft, lore status, source code, atau catatan internal.
- **Jangan memberi pengumuman bahwa profil dapat dibuka sejak awal**. Akses pengetahuan umum tidak bergantung pada `bondLevel`; yang mengikuti save adalah pertemuan, kedekatan, pilihan dan misi. `Kronik` hanya menceritakan peristiwa yang benar-benar tercatat.
- Cegah nada generator/template: hindari paragraf berulang, moral penutup, frasa bantuan berlebihan, dan semua NPC bersuara sama. Pertahankan jeda, pilihan, humor, konflik, serta konteks profesi, lokasi, cuaca, dan progres.
- Jangan tampilkan istilah `legacy`, `runtime`, `draft`, `NPC ID`, `JSON`, `Phaser`, `PostgreSQL`, `confidence` atau masalah build sebagai narasi game. Kesalahan user cukup menjelaskan dampak dan langkah yang dapat dilakukan. Log teknis tetap tersedia untuk developer.
- **Jangan menjalankan Humanizer saat runtime atau mengirim dialog/save pemain ke layanan AI**. Ini skill editorial pada saat development; tidak mengganti quest ID, flags, hadiah, jadwal, keuangan, pilihan, atau skema save.
- **Aset dan aksi misi NPC:** sebelum menambahkan permintaan warga, baca `docs/game-dev/QUEST_ASSETS_ACTIONS_PASIRLUYU.md`. Properti baru harus dimuat Canvas/Phaser, punya aksi berprasyarat, tidak menghalangi rute NPC, memiliki metadata di `asset-database.json` serta indeks kategori, dan menyimpan progres tanpa hadiah ganda. Pastikan reset kembali ke `newGame()` dan save lama tetap valid.
- **Penempatan & akses properti misi:** simpan properti quest milik NPC di **interior rumah pemilik**, bukan di jalan/lapak; satu pengecualian adalah **dua pot Bu Nani di gang**. Aktifkan render, collision dan interaksi hanya saat quest terkait diterima dan belum selesai. Buka akses rumah selama 07.00–20.30 untuk misi aktif meskipun kedekatan belum naik dan pemilik sedang di luar; cabut izin setelah selesai tanpa mengubah poin kedekatan. Uji di Canvas, Phaser, tap mobile dan save lama.
- **Cutscene hanya konsep:** `docs/game-dev/NPC_QUEST_CUTSCENE_CONCEPT.md` mendokumentasikan 7 kandidat dan standar produksi, **tidak mengizinkan pembuatan trigger/video/runtime cutscene** tanpa instruksi eksplisit berikutnya. Pemilik membuat video Google Flow dan menyerahkannya secara terpisah.

## Kameo figur publik P01/P02

Bedakan biografi publik yang memiliki URL sumber (riwayat jabatan/pendidikan) dari dialog dan adegan fiksi. Jangan menciptakan pandangan politik, motif, kelemahan psikologis, atau cerita intim yang tidak bersumber. Potret maupun cerita tidak boleh menyiratkan dukungan resmi. Fakta yang berbeda antar-sumber wajib ditandai dalam data/editorial, bukan diputuskan dari ilustrasi.

## Prosedur perubahan

1. Temukan file runtime yang dipakai dan sumber canonical tokohnya. Catat apa yang benar-benar tampil dan apa yang hanya artefak pengembangan.
2. Ubah **player presentation** dan narasi dengan perubahan minimal; jangan mengedit 248 JSON massal untuk menyembunyikan sebuah field di UI.
3. Jaga tautan aksesibel, navigasi sentuh/keyboard, potret, dan kemampuan pencarian. Informasi teknis untuk reviewer tetap ada di docs/tes/log yang sesuai izin.
4. Jalankan `npm run test:game:humanizer`, `npm run test:game:copy`, `npm run chars:public:check`, `npm run typecheck`, `npm run test:game` dan tes UI terkait. Periksa `tests/game-portraits-ui.mjs` untuk alur Warga.
5. Build di staging khusus game; cek URL/commit, endpoint, interaksi mobile, dan browser error sebelum merge/release. Konfigurasi staging memangkas route di Vercel Hobby; itu **bukan** izin menghapus kode web pertanian dari repository.
6. Jangan memodifikasi lisensi atau berkas upstream `humanizer` yang checksum-nya dikunci. Perbarui adapter proyek dan dokumen aktif; tandai materi lama sebagai **historis**, bukan membuat aturan yang saling bertentangan.
