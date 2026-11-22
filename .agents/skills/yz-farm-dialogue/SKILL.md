---
name: yz-farm-dialogue
description: Menulis atau menyunting dialog NPC, quest, jurnal, cerita, dan pesan YZ Phone YZ Farm Life dalam Bahasa Indonesia yang alami, sesuai cast, progres, pilihan, dan kontinuitas Pasirluyu.
---

> **Sumber canonical baru (22 Nov 2026):** gunakan `game-assets/catalog/npc-public-roster.json` untuk identitas 248 NPC dan `public/game/data/npc/{ID}.json` atau `docs/game-dev/characters/{ID}.md` untuk Character Bible fiksi 12 kategori. `cast.json` dan 70 profile lama hanyalah **legacy**; hanya digunakan untuk quest lama yang memang sudah aktif dan **tidak boleh diwariskan ke identitas baru tanpa asosiasi manual**. Semua lore publik tetap `draft` dan belum otomatis playable. Baca `docs/game-dev/NPC_PUBLICATION_POLICY.md`.

# YZ Farm Life — Humanized narrative authoring

Aktifkan skill ini pada pekerjaan *naratif game*; untuk penyuntingan gaya baca juga `../humanizer/SKILL.md`. Ikuti aturan Humanizer sebagai **editor, bukan generator fakta atau mesin perubahan gameplay**. Jika pengguna hanya meminta bugfix, rendering, database, atau optimasi aset, jangan mengubah narasi.

## Referensi wajib

- `game-assets/catalog/cast.json` — 32 ID, nama, peran, pekerjaan, sifat/hobi.
- `game-assets/characters/profiles/index.json` — direktori semua 70 karakter bernama dan 12 dimensi masing-masing; baca profil karakter target sebelum membuat dialog; gunakan konteks psikologis, relasi dan kontinuitas tanpa mengubah proposal menjadi fakta runtime.
- `docs/game-dev/STORY_SYSTEM.md` — suara, memori, konsekuensi, kecocokan kondisi cerita.
- `docs/game-dev/PASIRLUYU_LIVING_WORLD.md` — jadwal dan motivasi Ryan (A03), Nani (C01), Inggit (C08).
- `src/lib/game/personal-quests.ts` dan `src/lib/game/model.ts` — kebenaran runtime, urutan cerita, reward, flag dan state.
- `docs/game-dev/HUMANIZER_DIALOGUE_PIPELINE.md` — checklist keputusan/editorial.

## Proses penulisan

1. **Konteks.** Identifikasi siapa bicara, lokasi, jam/cuaca, tingkat kedekatan, informasi yang diketahui NPC, dan tujuan percakapan. Pahami percabangan sebelum mengedit kalimat.
2. **Draf karakter.** Gunakan kata dan ritme khas karakter. Ryan praktis dan mengamati saluran; Nani peka pada kebiasaan tetangga; Inggit menghitung kebutuhan warung dan menghindari pemborosan; Ayu antusias dan memahami benih. Periksa tokoh lain dari `cast.json`, jangan menggeneralisasikan sifat seluruh NPC.
3. **Humanizer.** Baca `../humanizer/SKILL.md`; hilangkan penjelasan berlebihan, kalimat generik, triad/punchline buatan, dan dialog yang terdengar seperti panduan aplikasi. Hindari penyederhanaan yang menghilangkan konflik, emosi implisit, atau informasi yang dibutuhkan player.
4. **Kontrak.** Pertahankan seluruh nilai nonprosa dan token teknis: `NpcId`, `storyId`, `questId`, `setFlags`, `requires`, `excludes`, `fee`, `coins`, `day`, nama objek, placeholder, JSON key, dan urutan efek. Hanya ubah field teks yang memang diminta.
5. **Baca di UI.** Usahakan satu bubble menyampaikan satu gagasan yang bisa dipahami pada layar portrait. Pecah sesuai jeda emosional dan alur dialog, bukan batas kata kaku. Tidak semua NPC harus selalu berbaik hati, dan tidak semua baris memuat tutorial.
6. **Audit.** Bandingkan fakta, relasi, suara, humor, pilihan dan akibat dengan versi semula. Jika substansi berubah, hentikan edit dan tandai untuk persetujuan. Jalankan tes dan review manual scene terkait.

## Larangan / keamanan

- Jangan menyatakan 30 kecamatan/151 kelurahan playable jika belum dibangun; Pasirluyu masih area prototipe.
- Jangan menjadikan figur publik atau peristiwa sejarah sebagai fakta game tanpa sumber yang valid. Tokoh fiksi harus konsisten.
- Jangan menyalin dialog berhak cipta dari Harvest Moon atau game lain.
- Jangan mendekati proses ini sebagai cara “lolos AI detector”, dan jangan memasang AI di browser game.
- Saat diminta menyunting file game, berikan hasil final dan ringkasan perubahan narasi, bukan dua versi semua dialog dalam file runtime.

## Contoh perbedaan suara (contoh baru; bukan dialog live)

Ryan (A03): “Pintu airnya terbuka, tapi tanda di batu kedua belum naik. Kalau kamu lewat hilir nanti, lihat apa Nani juga memperhatikan itu.”

Nani (C01): “Sejak pagi ada daun kecil nyangkut di pagar. Biasanya baru terbawa sejauh ini setelah air datang. Aku ingin tahu dari mana asalnya.”

Inggit (C08): “Timunnya bagus. Ambil yang dua itu saja dulu, ya. Kalau besok masih ada yang segar, kubeli lagi supaya tak banyak terbuang.”

Ayu (A04): “Kalau tanahnya masih lembap, jangan buru-buru menyiram. Aku juga pernah terlalu rajin; dua pot jadi layu gara-gara itu.”

## Teks sistem dan YZ Phone

Saat menulis pesan layar, status alat, papan arah, error, tutorial, daftar Warga atau kronologi, pakai Humanizer juga. Referensi `docs/game-dev/GAME_TEXT_STYLE_GUIDE.md` dan `docs/game-dev/YZ_PHONE_WARGA_KRONIK.md`. Jangan mengubah data `sourceFacts`, hadiah/flag, atau lore yang belum dikonfirmasi. Rangkuman harus membaca state permainan, bukan mengarang hari kejadian. Periksa penggunaan bahasa dalam konteks layar portrait, suara karakter, dan tindakan sesungguhnya.
