> **Pembaruan sumber:** Character Bible canonical kini berisi **248 tokoh fiksi publik** di `public/game/data/npc/{ID}.json`, dengan halaman wiki di `docs/game-dev/characters/`. Contoh 32 tokoh di bawah berlaku untuk **runtime quest lama**, bukan bukti identitas legacy yang sama dengan roster baru. Review setiap NPC berdasarkan canonical ID + portrait, jangan pindahkan quest/relasi dari cast lama secara otomatis.

# Humanizer untuk narasi YZ Farm Life

**Status:** skill agent dipasang dalam repository, siap dipakai pada sesi Codex setelah checkout/pull dan pembacaan ulang skill. Ini bukan fitur otomatis runtime dan bukan bukti seluruh dialog telah ditulis ulang.

## Tujuan

Pemain seharusnya mendengar warga Pasirluyu sebagai orang dengan rutinitas dan masalahnya masing-masing, bukan suara chatbot yang sama pada setiap NPC. Gunakan Humanizer untuk **mengedit cara suatu cerita disampaikan**, bukan mengubah siapa yang tahu apa, syarat quest, atau dampak pilihan.

Humanizer upstream: [blader/humanizer](https://github.com/blader/humanizer). Versi terkunci dan lisensi ada di `../../.agents/skills/humanizer/UPSTREAM.md`; panduan spesifik dunia game di `../../.agents/skills/yz-farm-dialogue/SKILL.md`.

## Di mana skill dipakai

| Media | Sasaran | Batas penting |
| --- | --- | --- |
| Dialog NPC (Pasirluyu) | Suara tiap karakter, emosi dan subteks | Cocokkan dengan `cast.json`, jadwal dan progres |
| Pilihan dialog | Jawaban masuk akal, tokoh bisa berbeda pendapat | ID opsi, efek flag, affinity, save tidak diubah |
| Quest bercabang | Motivasi dan informasi terasa natural | Fase, kontak, reward, item, urutan tetap |
| YZ Phone | Notifikasi singkat, personal dan relevan | Jangan membuat klaim lokasi NPC yang belum playable |
| Jurnal dan papan petunjuk | Bahasa jelas dan tidak bertele-tele | Jangan memindahkan instruksi game ke HUD secara berlebihan |
| Dokumentasi teknis game | Boleh merapikan prosa editorial | Jangan mengedit kode, API, nama path, parameter atau data |

## Karakter awal dan gaya bicara

| NPC | Sumber identitas | Ketika bicara | Hindari |
| --- | --- | --- | --- |
| Ryan (A03) | Pengelola irigasi, tenang, praktis, tegas | Observasi air, kondisi dan tindakan terukur | Monolog filsafat atau tebakan pasti tanpa bukti |
| Nani (C01) | Perawat ingatan keluarga dan tetangga | Detail keseharian, benda, jeda, ingatan yang personal | Membeberkan rahasia langsung tanpa trust |
| Inggit (C08) | Pedagang/warung, peduli makanan dan warga | Stok, pelanggan, harga, hasil panen; ramah tetapi realistis | Selalu menuruti pemain atau menjadi toko tutorial |
| Ayu (A04) | Penjual benih, ceria, komunikatif | Benih, tanah, saran praktis dari pengalaman | Semua ucapannya terdengar seperti tutorial resmi |

**Contoh khusus:** subteks bisa muncul ketika Ryan terus mengukur air yang sama karena takut tetangga menyalahkannya. Pemain tidak perlu diberi narasi eksplisit “Ryan merasa bersalah”. Nani boleh mengetahui kebiasaan tetangga tetapi tidak otomatis mengetahui pilihan yang dibuat player di lokasi lain.

## Workflow Codex

1. Panggil `$yz-farm-dialogue` saat mengarang/menyunting cerita, lalu gunakan Humanizer lokal `$humanizer` sebagai pemeriksaan gaya bila perlu.
2. Baca seluruh bagian/adegan yang dituju, `cast.json`, `STORY_SYSTEM.md`, `PASIRLUYU_LIVING_WORLD.md`, serta konteks kode di `model.ts` atau `personal-quests.ts`.
3. Sebelum mengubah, catat **kontrak mekanik**: NPC ID, prasyarat, flag, fase, rewards, item, hari, pilihan, cooldown, lokasi dan referensi yang tersimpan di save.
4. Ubah hanya teks dialog, deskripsi misi atau notifikasi yang diminta. Periksa adanya pengulangan narasi AI, suara semua karakter yang identik, info yang NPC tak mungkin ketahui, dan kesimpulan moral yang tidak disampaikan kejadian.
5. Bandingkan sebelum/sesudah: pemain menerima **informasi dan pilihan yang sama**, dengan pembawaan yang lebih tepat untuk tokoh. Jangan hilangkan informasi instruksi yang dibutuhkan player.
6. `npm run test:game:humanizer` memverifikasi pemasangan skill dan lisensi, bukan kualitas dialog. `npm run test:game`, typecheck, serta uji scene NPC dan YZ Phone memastikan tidak ada regresi. Review manusia menentukan kualitas suara karakter.

## Checklist revisi

- [ ] Nama, ID, pekerjaan, sifat tokoh, dan kontinuitas konsisten.
- [ ] Bahasa Indonesia terasa alami; nuansa Sunda seperlunya dan tanpa stereotip.
- [ ] Tujuan dan ketegangan adegan terlihat dari tindakan, pilihan dan ucapan.
- [ ] Setiap opsi memberi implikasi masuk akal; hubungan/trust tidak otomatis positif.
- [ ] Batas layar portrait dan teks dapat dibaca tanpa label/tumpukan petunjuk.
- [ ] Semua id/flags/persyaratan/reward/JSON key/placeholders tidak berubah.
- [ ] Tidak menambah klaim sejarah, budaya, lokasi playable, atau identitas pribadi tanpa sumber.
- [ ] Tidak mengubah file source art, database pertanian, RLS, atau konfigurasi deploy sebagai efek samping.

## Contoh permintaan untuk Codex

> Gunakan `$yz-farm-dialogue` dan `$humanizer` untuk mengaudit seluruh dialog Ryan (A03) dalam quest saluran. Pertahankan ID, flags, pilihan, hadiah, state, hubungan Nani, dan seluruh logika dari `src/lib/game/personal-quests.ts`. Baca referensi karakter dan world blueprint dulu; ubah hanya prosa yang terasa generik. Berikan diff serta hasil tes; jangan deploy atau mengubah save schema.

## Cara operasional

```bash
git pull origin main
npm run test:game:humanizer
npm run test:game
```

Buka **sesi Codex baru dari root repository** supaya ia mengenali instruksi dan skill project-local. Jika belum terlihat, panggil path skill eksplisit dan cek dukungan skill discovery di versi Codex terpasang. Tidak perlu `npm install`, API key baru, maupun daemon untuk Humanizer ini.

## Perluasan cakupan — setiap teks game yang terlihat pemain

Standar yang sama sekarang berlaku untuk teks HUD, peta, interior, papan petunjuk, tutorial, status error, menu Warga dan Kronik; lihat [Game Text Style Guide](GAME_TEXT_STYLE_GUIDE.md) dan [YZ Phone](YZ_PHONE_WARGA_KRONIK.md). Rangkuman sejarah harus diturunkan dari save dan peristiwa yang sudah ditonton, bukan dari rancangan Character Bible yang belum diaktifkan. Jalankan `npm run test:game:copy` setelah setiap edit copy; inspeksi manual tetap wajib.
