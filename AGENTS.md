> **Keputusan produk:** `YZ Phone → Wargapedia` memperlihatkan seluruh 248 Character Bible fiksi publik tanpa gate level kedekatan. `Warga`/dialog intim/quest/Kronik tetap dipandu `GameState`; jangan memasukkan syarat `bondLevel` ke pembaca `phone-wargapedia.tsx` atau menganggap draf lore sebagai misi yang telah dimainkan.

<!-- SOURCE PRIORITY: published owner-authorized 248 canonical fictional roster + public draft dossiers > optional validated private overrides > isolated legacy. Never treat cast.json as current NPC identities. -->
# Panduan agen — Yanzen E-Farmer / YZ Farm Life

Repositori ini mencakup aplikasi E-Farmer dan game YZ Farm Life. **Aturan Humanizer ini hanya untuk penyuntingan narasi game**; jangan mengubah workflow database pertanian, autentikasi, konfigurasi server, atau UI lain karena instruksi ini.

## Penulisan game (Codex / agen coding)

1. Ketika diminta membuat, mengaudit, atau menyunting **dialog NPC, quest, catatan jurnal, cerita, atau pesan YZ Phone**, baca `docs/game-dev/NPC_PUBLICATION_POLICY.md`, `docs/game-dev/characters/README.md`, dan untuk riwayat keputusan lama `docs/game-dev/NPC_ROSTER_PRIVATE_SYNC.md`, `docs/game-dev/STORY_SYSTEM.md`, `docs/game-dev/HUMANIZER_DIALOGUE_PIPELINE.md` dan Character Bible yang sudah disahkan. `game-assets/catalog/cast.json` adalah data **legacy**, bukan sumber nama NPC canonical, lalu gunakan skill `yz-farm-dialogue` dan Humanizer (`.agents/skills/humanizer/SKILL.md`). Untuk tugas kode murni, tidak perlu Humanizer.
2. Tulis konten game dalam **Bahasa Indonesia yang wajar**. Nuansa Sunda/Bandung boleh halus dan kontekstual; jangan karikatur. Setiap NPC punya motivasi, kegiatan, dan keputusan sendiri; jangan semua tokoh berbicara dengan gaya sama.
3. Terapkan Humanizer sebagai **langkah editorial** setelah pemeriksaan fakta dan kontinuitas. Hindari narasi yang terlalu formal, pujian generik, pengulangan, atau moral penutup yang tidak ditunjukkan oleh adegan. Jangan menghapus keheningan, keraguan, perbedaan pendapat, atau suara unik tokoh hanya demi kalimat singkat.
4. **Jaga kontrak game:** ID karakter, quest, event, flags, kunci JSON, placeholder, state, prasyarat, pilihan, harga, hadiah, relasi, dan penjadwalan tetap identik kecuali perubahan mekanik diminta. Jangan samakan identitas lama dan baru hanya berdasarkan ID; cek nama, profesi, potret, dan persetujuan asosiasi cerita. Jangan mengubah teks menjadi perubahan sistem terselubung. Jangan mengganti nama tempat atau menambah sejarah faktual tanpa rujukan.
5. Perubahan narasi dilakukan per adegan/quest dan diperiksa bersama efek gameplay, percabangan, bahasa, serta UI layar ponsel. Jangan menulis ulang semua dialog secara massal tanpa review karakter.
6. Skill bersifat **alat penulisan pada saat pengembangan**, bukan dependency runtime, filter otomatis yang dijalankan setiap pemain, atau layanan AI yang menyunting save. Pastikan tidak ada pemanggilan jaringan/API dari game untuk Humanizer.
7. Setelah mengubah dokumen skill atau menambahkan dialog, jalankan `npm run test:game:humanizer` dan `npm run test:game`; untuk perubahan runtime/dialog lakukan uji UI dan review manual sebelum merge.

## Character Bible 12 dimensi (wajib untuk setiap karakter bernama)

- **248 NPC canonical** (tidak termasuk karakter pemain A01) berasal dari katalog fiksi publik `game-assets/catalog/npc-public-roster.json`, dengan override server terverifikasi pada `deploy/private/residents.json` atau `GAME_RESIDENT_ROSTER_JSON`. Fingerprint tidak berubah. File profil di `game-assets/characters/profiles/index.json` adalah proposal/arsip legacy, **bukan** indeks 248 nama canonical. Daftar warga hanya boleh mengambil ID, nama, pekerjaan, dan potret dari roster canonical yang lolos fingerprint.
- **Baca profil yang benar dulu** sebelum menulis dialog, quest, menjadwalkan NPC, memberi relasi, membuat sprite/potret atau menambah tokoh. Periksa `legacyApproved` dan hanya salin konten cerita jika ada persetujuan manual yang sesuai. Pastikan `sourceFacts` dan `proposedFields` tidak tertukar; data proposal tidak otomatis menjadi fakta yang telah dimainkan.
- Untuk perubahan gameplay, bandingkan `12_continuity_current_state` dengan kondisi save dan sistem runtime yang aktual. Lore draf sudah boleh dipublikasi sebagai ensiklopedia fiksi, tetapi peristiwa yang diakui gameplay tetap menunggu flag/unlock save.
- Tokoh cameo publik dibatasi pada adegan fiksi; tidak boleh membuat klaim pribadi nyata. **Kunci aset `Rxxx` bukan ID NPC**: ke-179 ilustrasi `Rxxx` dalam roster canonical fiksi kini terpasang ke identitas yang memiliki ID `Wxxx`/lainnya sesuai mapping empat-field yang telah ditetapkan, tidak boleh dicocokkan ulang berdasarkan urutan gambar.
- Pada penambahan/revisi karakter, jalankan `npm run chars:public:check` dan (jika private Docker digunakan) `npm run chars:roster:check`, `npm run test:game`, serta `npm run chars:index:check && npm run test:game:characters` untuk memastikan arsip lama tidak rusak. Jangan mengubah fingerprint roster kecuali owner telah menyetujui revisi persis.

## Semua teks yang terlihat di dalam game wajib melalui Humanizer

- Humanizer berlaku untuk **setiap player-facing copy** di game: dialog, quest, papan, toast, inventaris, HUD, menu Warga, Kronik, YZ Phone, tutorial, peta, dan pesan kesalahan. Baca `docs/game-dev/GAME_TEXT_STYLE_GUIDE.md` sebelum mengubah teks game; jangan mengaktifkan Humanizer saat runtime.
- Jaga suara setiap karakter (12 dimensi) dan hanya tampilkan kejadian yang benar-benar tercatat di save; data `narrative-proposal` tidak boleh mengaku sebagai kisah yang sudah terjadi.
- Jalankan `npm run test:game:copy && npm run test:game:phone`, lalu typecheck, tests game dan browser QA terkait. Linter hanyalah pagar frasa tertentu; reviewer tetap bertanggung jawab atas mutu dialog dan UX.
