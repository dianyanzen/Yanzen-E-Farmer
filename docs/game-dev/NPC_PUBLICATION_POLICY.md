> **Integrasi YZ Phone terbaru:** Menu tunggal **`Warga`** menggabungkan katalog Wargapedia 248 karakter, 12 kategori lore publik tanpa syarat level, dan data kedekatan yang benar-benar berasal dari save (hanya untuk asosiasi identitas yang approved). Ikon Wargapedia terpisah sudah dihapus. `Kedekatan` dan `Kronik` tetap menggunakan state aktual, bukan isi draf lore. Lihat `YZ_PHONE_WARGA_KRONIK.md`.

# Kebijakan ensiklopedia NPC publik — YZ Farm Life

Perubahan 22 November 2026: pemilik proyek memberikan izin untuk **mempublikasikan identitas karakter fiksi** beserta rancangan Character Bible sebagai dokumentasi game. Ini menggantikan keputusan privat untuk *identitas fiksi* saja; **tidak** mencabut perlindungan kredensial, file persetujuan asosiasi legacy, save pemain, maupun data aktual di server.

## Batas rilis

- **Publik:** 248 ID, nama karakter, pekerjaan, portrait key, halaman ensiklopedia dan 12 kategori cerita fiksi berlabel `public-fictional-draft`.
- **Tetap internal:** file sumber privat, catatan review internal, email/ID akun, data pengguna, file penyimpanan save, `approved-legacy.json`, lingkungan server serta secrets.
- **Tidak disimpulkan:** umur, riwayat pribadi, keluarga, pendidikan, diagnosis psikologis dan informasi yang tidak diverifikasi. Untuk dua kameo figur publik P01/P02, tidak ada motif psikologis atau riwayat keluarga rekaan; dialog ditegaskan sebagai dialog fiksi.
- **Draft bukan gameplay:** status `approval:draft` tetap. Profil publik bisa dibaca seperti buku dunia game, tetapi tidak membuat karakter ter-spawn, memiliki jadwal aktif, mendapat relasi ataupun mewarisi quest/flags lama.

## Struktur

- `game-assets/catalog/npc-public-roster.json`: sumber publik empat atribut canonical, fingerprint tetap.
- `public/game/data/npc/index.json`: katalog publik untuk pencarian.
- `public/game/data/npc/{ID}.json`: dossier publik per tokoh, 12 kategori, diambil *on demand*.
- `docs/game-dev/characters/{ID}.md`: halaman wiki untuk tiap NPC.
- `src/app/game/encyclopedia`: antarmuka katalog publik dan penjelajah profil.
- `src/app/game/character-gallery.tsx`: YZ Phone membaca profil publik, tanpa otomatis memindahkan cerita dari cast legacy.

## Aturan pengembangan

1. Selalu kunci fingerprint empat atribut; perbedaan harus dihentikan, bukan diselaraskan diam-diam.
2. Kurasi dialog dan sifat yang terlalu mirip, serta tindak lanjuti review art style dan sprite sebelum menganggap final.
3. Semua ide baru masih `draft` dan narasi baru tidak boleh mengaku sudah terjadi di save. Jika ada tokoh yang dapat ditemui, tetapkan spawn, schedule, assets dan flags terpisah.
4. Validasi menggunakan `npm run chars:public:check`, `npm run test:game`, `npm run typecheck`, serta cek UI mobile/desktop.
5. GitHub publik hanya memuat versi kurasi. **Jangan** commit file bernama `*_PRIVATE.json` ataupun provenance/editing notes internal secara mentah.
6. Jika nanti beberapa karakter merujuk pada individu nyata, minta izin untuk detail personal; nama karakter game sendiri tidak boleh diperlakukan sebagai bukti riwayat nyata.
