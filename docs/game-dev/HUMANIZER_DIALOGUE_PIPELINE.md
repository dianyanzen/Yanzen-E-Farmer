# Humanizer editorial — seluruh YZ Farm Life

**Status: proses developer aktif.** Humanizer upstream `.agents/skills/humanizer/SKILL.md` dipasang dengan versi dan lisensi yang dipin. **Jangan mengubah upstream untuk mengikuti karakter game**; gunakan adapter `.agents/skills/yz-farm-dialogue/SKILL.md` dan `.agents/skills/yz-farm-encyclopedia/SKILL.md`.

## Cakupan sebenarnya

Proses ini untuk semua teks yang tampil di `src/app/game/`, termasuk HUD, kontrol, tutorial, Warga, Kronik, gudang, peta, toko, rumah, tidur, pesan error, aksesibilitas, serta dialog dan quest pada `src/lib/game/`. Teks yang hanya ada dalam skema, audit dan catatan developer tidak diubah menjadi bahasa tokoh.

## Alur praktis untuk Codex

1. Baca `AGENTS.md`, `GAME_TEXT_STYLE_GUIDE.md`, `PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`.
2. Temukan komponen/rute yang benar-benar dimainkan, sumber stringnya, kondisi game sebelum muncul, dan aksi yang dapat dilakukan.
3. Bila menyangkut NPC, kunci nama/profesi/potret dari `game-assets/catalog/npc-public-roster.json` dan dossier 248 canonical. `game-assets/catalog/cast.json` (32 karakter) serta arsip 70 profil adalah **legacy** untuk adegan yang masih berjalan, bukan pengganti roster baru.
4. Kelompokkan teks: suara tokoh, UI pemain, system status, atau developer. Tulislah dengan bobot dan detail yang sesuai; hilangkan jargon, pola generik dan penjelasan yang sudah disampaikan gambar/aksi.
5. Gunakan fakta runtime sebagai batas cerita. Tidak mengarang kejadian yang belum terjadi, keluarga/relasi yang belum disahkan, lokasi saat ini tanpa jadwal aktif, atau psikologi kameo nyata.
6. Buat diff kecil dan cek semua konsekuensi mekanik: ID, flags, harga, hadiah, timing, kondisi quest, pilihan, save, terjemahan, dan label aksesibilitas harus konsisten.
7. Uji layar ponsel, dialog bercabang, rerender profil saat pilihan berubah, serta state kosong/jaringan gagal. QA manusia menilai apakah teks enak dibaca.

## Kontrak Warga

- Semua 12 kategori internal tetap untuk penulis. Jangan membuat tabel properti mentah di layar pemain.
- `wargaPlayerView` memilih ringkasan natural yang dapat dibaca sebagai kisah dunia game; raw generator yang repetitif atau menyebut "draf" belum layak ditampilkan.
- Kedekatan/misi muncul dari save hanya jika ID legacy telah ditautkan secara resmi.
- Tautan sumber untuk kameo disediakan, sementara adegan/kutipan fiksi diberi batas dengan bahasa singkat.
- Editor privat tidak diakses melalui query parameter pemain.

## QA per perubahan

```bash
npm run test:game:humanizer
npm run test:game:copy
npm run chars:public:check
npm run test:game
npm run typecheck
npm run test:portraits:ui
```

Tes Playwright memerlukan browser yang terpasang dan URL/fixture yang valid. Build Next.js staging tidak otomatis membuktikan interaksi tap/keyboard. Jangan menandai semua dialog telah direvisi hanya karena linter tidak menemukan pola lama.

## Contoh suara

- **Ryan (A03, pengelola irigasi):** mengamati aliran, memberi alasan praktis; dapat menolak solusi yang tergesa-gesa.
- **Nani (C01, pekebun bunga senior):** mengenali benda, halaman, dan kebiasaan tetangga; cerita keluarga tidak diobral ke orang asing.
- **Inggit (C08, pedagang pasar):** menghitung stok, menjaga kesegaran, menawarkan kompromi.
- **Ayu (A04, penjual benih):** mencoba dan mengamati persemaian, tidak berbicara seperti buku petunjuk.

Itu adalah arah untuk adegan legacy yang masih aktif, **bukan alasan mengaitkan identitas baru secara otomatis**. Contoh lain harus ditinjau per Character Bible dan kondisi runtime.
