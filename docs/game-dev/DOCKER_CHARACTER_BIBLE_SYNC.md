# Docker adalah sumber identitas NPC YZ Farm Life

Character Bible tidak boleh memperbaiki identitas melalui nama katalog lama.
Sumber prioritas: **deploy/private/residents.json** yang dibaca Next.js server
setelah pemeriksaan autentikasi. Empat field: `id`, `name`, `occupation`, `portrait`.
File ini dan Bible hasil kompilasi **tidak boleh masuk GitHub**, termasuk melalui
`git add -f`, ZIP aset, atau artefak CI.

## Sinkronisasi roster ke Bible privat

Pada checkout Docker yang memiliki bind mount dan data resmi:

```bash
node scripts/game-characters/complete-docker-bibles.mjs --input deploy/private/residents.json
node scripts/game-characters/complete-docker-bibles.mjs --input deploy/private/residents.json --write
node scripts/game-characters/complete-docker-bibles.mjs --input deploy/private/residents.json --check
npm run test:game:docker-bibles
```

Hasil: `deploy/private/resident-bibles.json` (12 kategori/ID) dan
`deploy/private/character-bible-audit.json`. Keduanya tidak dilacak Git.
Bila folder bind mount server berbeda, atur `YZ_GAME_RESIDENT_ROSTER_FILE`
dan `YZ_GAME_RESIDENT_BIBLES_FILE` menjadi path file di dalam **container Next.js**.
Jangan menyalin database PostgreSQL, akun pengguna, save, atau SQLite ke repo.

Ketika Bible privat belum dibuat, server menyusun draft dari roster Docker dan
katalog cerita yang tersedia. Editor tetap harus memeriksa keunikan karakter.

## Aturan rekonsiliasi dan kontinuitas

- **Unchanged**: ID, nama, dan profesi identik; pertahankan Bible fiktif lama,
  tetapi portrait yang ditunjuk Docker tetap menang.
- **Expanded**: nama Docker memperpanjang nama pendek yang sama dan profesinya
  cocok; tambahan kisah, hobi, dan rutinitas dari paket Bandung 151 boleh menjadi
  rancangan fiktif. Ini BUKAN biografi nyata.
- **Recast**: nama dan/atau pekerjaan tidak cocok; hapus warisan lore lama dari
  Bible baru, tandai save/quest/bond lama untuk rekonsiliasi, jangan mereset save.
- **New Wxxx**: bangun 12 bagian berupa konsep; tidak mengarang umur asli,
  keluarga, alamat pribadi, hubungan nyata, atau pernah bertemu pemain.
- Cameo P01/P02 hanya memakai sumber publik dan skenario jelas fiksi.
- Portrait Docker bersifat otoritatif, meski file art-nya menggunakan ID lain;
  cocokkan hash dan lakukan visual QA. Expression sheet lama adalah fallback,
  bukan pengganti portrait Docker.
- Dua belas kategori hanya menandakan struktur lengkap; status `draft`
  **belum** berarti 248 tokoh telah mendapat penulisan narasi unik yang disetujui.

## Uji perilaku

`npm run test:game:docker-bibles`, `npm run test:game`,
`npm run typecheck`, dan `npm run build`.
Uji Docker dalam keadaan login dan lihat daftar warga, detail 12 kategori,
portrait, dialog, serta perubahan save. Pada Vercel tanpa file privat,
hanya roster yang telah disetujui untuk publik yang tersedia.

Lakukan review pribadi sebelum menerbitkan nama lengkap, cerita, gambar,
atau data yang berasal dari individu nyata. Tidak ada otomatisasi yang
mengunggah roster privat ke repository.

## Sinkronisasi semua 248 identitas Docker ke Vercel Preview

Untuk menghindari nama pendek lama, Vercel membaca roster terenkripsi
dari `YZ_GAME_RESIDENT_ROSTER_JSON` khusus branch integrasi. Jika checkout
Docker memiliki data lengkap 248 NPC dan potret sudah berada di lokasi
kanonis GitHub, Codex di mesin Docker dapat menjalankan:

```bash
npm run chars:docker:vercel -- --input deploy/private/residents.json
npm run chars:docker:vercel -- --input deploy/private/residents.json --apply
```

Perintah kedua memerlukan variabel lingkungan `VERCEL_TOKEN` di mesin lokal;
jangan masukkan token ke chat, log atau repository. Script menolak roster
yang bukan 248 entri, field tambahan privat, ID ganda, potret yang tidak
ada dalam aset kanonis dan payload yang melampaui batas. Setelah berhasil,
deploy ulang Preview branch `fix/game-npc-docker-vercel-roster-20261121`.
Production tidak otomatis berubah.

Rangkaian ini hanya mengirim empat field identitas yang dirender game.
Character Bible 12 kategori yang lengkap dan telah disetujui tetap
berada di Docker dan tidak dapat dikirim sebagai satu environment variable
bila ukurannya melampaui batas Vercel. Untuk Vercel, saat ini Bible
disusun berdasarkan roster terverifikasi serta naskah fiksi Bandung 151,
dengan status draft hingga proses editorial selesai.
