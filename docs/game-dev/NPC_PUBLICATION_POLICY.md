# Kebijakan publikasi profil Warga — YZ Farm Life

**Status: berlaku sejak 22 November 2026.** Pemilik proyek mengizinkan identitas dan lore fiksi 248 NPC dipublikasikan sebagai dokumentasi semesta game. Ini **bukan** izin menyertakan file privasi server, save pengguna, kunci akses atau data pribadi nonpublik.

## Sumber dan batas

- Identitas canonical: `game-assets/catalog/npc-public-roster.json` (ID, nama, pekerjaan, portrait) beserta fingerprint SHA; indeks pengunjung `public/game/data/npc/index.json`.
- Character Bible 12 kategori: `public/game/data/npc/{ID}.json`, `docs/game-dev/characters/{ID}.md`. Draf asal, keluarga, pendidikan, memori dan sifat fiksi adalah usulan pengembangan, **bukan** rekaman orang nyata maupun kejadian yang sudah dialami pemain.
- Warga untuk pemain: `wargaPlayerView` di `src/lib/game/public-wargapedia.ts` memilih hanya kisah yang relevan. Detail developer (ID, provenance, source claim, audit/null, approval, runtime status, rencana quest) tidak menjadi teks layar.
- Relasi actual dan Kronik: `GameState` dan hanya mapping `approvedLegacyId`. `cast.json` lama tidak dijadikan identitas 248 baru secara otomatis.
- Kameo P01/P02: hanya fakta biografi publik yang dibuktikan sumber ditampilkan sebagai fakta; dialog dan pertemuan adalah fiksi tanpa dukungan politik resmi. Motif/psikologi/privasi yang tak bersumber tidak dibuat-buat.
- Bahan editorial internal yang memerlukan otorisasi menggunakan endpoint `/api/game/resident-bible/[id]?draft=1` atau media developer yang aman. **Public JSON tidak privat hanya karena UI menyembunyikan field.**

## Aturan antarmuka

- Pemain melihat daftar nama, pekerjaan, potret, kisah singkat, serta progres jika benar-benar ada. Tidak ada label `A03`, "NPC", "12 kategori", "draf", "belum terintegrasi", "save" atau instruksi tingkat kedekatan di profil.
- Teks warga ditulis sebagai bagian dari dunia Pasirluyu. Hindari pola template dari hasil pengayaan massal; kelola lewat kurasi sebelum masuk proyeksi pemain.
- Informasi yang tidak berguna pada layar ponsel **boleh tetap ada di JSON untuk developer**, tetapi tidak otomatis dirender.
- Jangan menghapus validasi atau mengubah empat identitas canonical hanya agar suatu dialog/buku terlihat rapi.

## Pemeriksaan

Jalankan `npm run chars:public:check`, `npm run test:game:humanizer`, `npm run test:game:copy`, `npm run test:game`, `npm run typecheck`, lalu inspeksi browser mobile/desktop. Untuk detail klasifikasi lihat `PLAYER_DEVELOPER_CONTENT_BOUNDARY.md` dan skill `yz-farm-encyclopedia`.
