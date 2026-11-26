---
name: yz-farm-dialogue
description: Editorial Humanizer untuk seluruh teks yang dilihat pemain YZ Farm Life, termasuk dialog, quest, YZ Phone, HUD, papan, inventaris, kronik, tutorial, dan pesan error. Melindungi kontrak gameplay dan suara unik NPC.
---

# YZ Farm Life — narasi yang terasa hidup

Skill ini khusus **proses penulisan atau review developer**, bukan filter AI pada browser. Untuk aturan gaya baca `../humanizer/SKILL.md`, ikuti `docs/game-dev/GAME_TEXT_STYLE_GUIDE.md` serta `docs/game-dev/PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`.

## Sumber yang benar saat ini

1. Cek adegan/komponen **aktif** di `src/app/game/`, `src/lib/game/model.ts`, `src/lib/game/personal-quests.ts`, `src/lib/game/phone-story.ts` dan kondisi save. Struktur cerita yang hanya ditulis di dokumen belum tentu ada di engine.
2. Kunci identitas tokoh pada `game-assets/catalog/npc-public-roster.json` dan `public/game/data/npc/{ID}.json`. Dari 248 Character Bible, banyak sifat/asal/keluarga masih usulan cerita; jangan mengaku sebagai memori pemain yang telah terjadi.
3. `game-assets/catalog/cast.json`, `game-assets/characters/profiles/index.json`, dan contoh Ryan (A03), Nani (C01), Inggit (C08), Ayu (A04) berlaku untuk alur **legacy yang masih aktif**. Cocokkan sebelum mengadopsi; asosiasi lama ke identitas 248 harus disahkan via `approvedLegacyId`.
4. `docs/game-dev/STORY_SYSTEM.md` dan `docs/game-dev/PASIRLUYU_LIVING_WORLD.md` menjadi latar perancangan; `docs/game-dev/YZ_PHONE_WARGA_KRONIK.md` menjelaskan runtime ponsel yang sebenarnya.

## Tiga suara yang jangan tertukar

- **Tokoh berbicara**: kalimat punya tujuan, informasi terbatas dan kebiasaan khas; mereka boleh menolak, ragu atau tidak tahu. Tidak membaca tugas seperti petunjuk sistem.
- **UI pemain**: ringkas, jelas, ramah, bernuansa dunia; beritahu apa yang bisa dilakukan sekarang dan dampaknya. Jangan memakai kosakata pengembangan, menyebut kode NPC atau status approval.
- **Developer/QA**: boleh teknis, eksplisit, dapat diaudit; di skill, dokumen, console/error server dan alat debug terotorisasi — tidak dicampur ke layar bermain.

## Pemeriksaan sebelum menulis ulang

- Tentukan penutur, tempat, waktu/cuaca, apa yang diketahui, tujuan percakapan, pilihan dan dampak nyata.
- Catat kontrak `NpcId`, `storyId`, `questId`, `phase`, `requires`, `excludes`, `setFlags`, `reward`, `price`, `coins`, `day`, placeholder dan bentuk save. **Jangan mengganti angka atau mekanik diam-diam**.
- Cari ciri suara lewat tindakan: Ryan teliti soal aliran air; Nani mengingat benda dan kebun; Inggit memperhatikan stok; Ayu memahami persemaian. Jangan menempelkan satu template tutur pada semua orang.
- Tulis ulang *hanya* player-facing copy yang bermasalah. Kurangi pengulangan, frasa kebijakan, penutup moral, pujian tanpa alasan, dan teks panjang yang menghalangi kontrol.
- **Jangan** menambah urusan pribadi ke figur publik atau menyalin dialog dari Harvest Moon. Catatan fakta Kota Bandung memerlukan sumber bila digunakan sebagai sejarah nyata.
- Setelah itu, baca pada layar ponsel dan desktop, dengarkan percakapan seolah berlangsung di tempatnya, lalu cek variasi pilihan, NPC yang menolak, dan jalan cerita sesudah aksi pemain.

## Standar wajib 26 November 2026 — Sundanese Cozy Farming RPG dan pedagang universal

Gunakan `docs/game-dev/SUNDANESE_COZY_MERCHANT_STANDARD.md` sebagai kontrak desain dan penerimaan seluruh lokasi, terutama pasar, NPC pedagang, produk dan dialog. Widi menjadi baseline struktur interaksi pedagang; Iyan harus berdiri di depan lapak sebagai NPC independen. Ayu dan Widi memakai frontage pasar; Inggit boleh melayani dari balik konter sesuai fungsi warung. Komponen dialog, katalog, ekspresi, input dan transaksi memakai standar bersama tanpa menghilangkan suara masing-masing tokoh. Semua aset baru wajib individual, termasuk delapan ekspresi dan seluruh frame; aturan atomic assets, canonical NPC, scale lock dan staging-only tetap lebih tinggi daripada contoh historis. Dilarang menyatakan pekerjaan selesai tanpa bukti QA runtime pada kandidat rilis yang sama.

## Area wajib

Dialog/ekspresi, reaksi pilihan, pesan, quest, Kronik, Warga, inventaris, gudang, HUD, plang, peta, panduan, toko, rumah, bangun tidur, sistem panen, notifikasi, kesalahan save dan state kosong. Utamakan perbaikan teks yang **aktif** di permainan sebelum menulis ratusan dialog ekspansi yang belum dipakai.

Jika tugas melibatkan penyajian Character Bible atau ensiklopedia, gunakan pula skill `../yz-farm-encyclopedia/SKILL.md`. UI Warga memakai proyeksi `wargaPlayerView`, bukan semua 12 kategori raw.

## QA sebelum selesai

Jalankan `npm run test:game:humanizer`, `npm run test:game:copy`, `npm run test:game:phone`, `npm run typecheck`, `npm run test:game` dan tes UI yang relevan. Linter hanya menemukan pola mekanis; **penilaian kualitas dialog tetap editorial manusia**. Jangan menandai game "sepenuhnya humanized" hanya karena build lulus.
