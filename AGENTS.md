# Panduan agen — Yanzen E-Farmer / YZ Farm Life

Repositori ini mencakup aplikasi E-Farmer dan game YZ Farm Life. **Aturan Humanizer ini hanya untuk penyuntingan narasi game**; jangan mengubah workflow database pertanian, autentikasi, konfigurasi server, atau UI lain karena instruksi ini.

## Penulisan game (Codex / agen coding)

1. Ketika diminta membuat, mengaudit, atau menyunting **dialog NPC, quest, catatan jurnal, cerita, atau pesan YZ Phone**, baca `docs/game-dev/STORY_SYSTEM.md`, `game-assets/catalog/cast.json`, `docs/game-dev/HUMANIZER_DIALOGUE_PIPELINE.md`, lalu gunakan skill `yz-farm-dialogue` dan Humanizer (`.agents/skills/humanizer/SKILL.md`). Untuk tugas kode murni, tidak perlu Humanizer.
2. Tulis konten game dalam **Bahasa Indonesia yang wajar**. Nuansa Sunda/Bandung boleh halus dan kontekstual; jangan karikatur. Setiap NPC punya motivasi, kegiatan, dan keputusan sendiri; jangan semua tokoh berbicara dengan gaya sama.
3. Terapkan Humanizer sebagai **langkah editorial** setelah pemeriksaan fakta dan kontinuitas. Hindari narasi yang terlalu formal, pujian generik, pengulangan, atau moral penutup yang tidak ditunjukkan oleh adegan. Jangan menghapus keheningan, keraguan, perbedaan pendapat, atau suara unik tokoh hanya demi kalimat singkat.
4. **Jaga kontrak game:** ID karakter, quest, event, flags, kunci JSON, placeholder, state, prasyarat, pilihan, harga, hadiah, relasi, dan penjadwalan tetap identik kecuali perubahan mekanik diminta. Jangan mengubah teks menjadi perubahan sistem terselubung. Jangan mengganti nama tempat atau menambah sejarah faktual tanpa rujukan.
5. Perubahan narasi dilakukan per adegan/quest dan diperiksa bersama efek gameplay, percabangan, bahasa, serta UI layar ponsel. Jangan menulis ulang semua dialog secara massal tanpa review karakter.
6. Skill bersifat **alat penulisan pada saat pengembangan**, bukan dependency runtime, filter otomatis yang dijalankan setiap pemain, atau layanan AI yang menyunting save. Pastikan tidak ada pemanggilan jaringan/API dari game untuk Humanizer.
7. Setelah mengubah dokumen skill atau menambahkan dialog, jalankan `npm run test:game:humanizer` dan `npm run test:game`; untuk perubahan runtime/dialog lakukan uji UI dan review manual sebelum merge.
