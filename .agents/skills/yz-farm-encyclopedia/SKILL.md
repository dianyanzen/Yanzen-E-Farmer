---
name: yz-farm-encyclopedia
description: Merancang dan mengaudit menu Warga/ensiklopedia YZ Farm Life yang terasa natural, memisahkan teks pemain dari Character Bible 12 kategori untuk developer, melindungi identitas canonical dan progres save.
---

# Warga dan Ensiklopedia YZ Farm Life

Skill ini digunakan saat mengedit daftar warga, profil, potret, identitas, biodata, lore publik, panel pertemanan dan tautan ke Kronik. Baca juga `../yz-farm-dialogue/SKILL.md`, `../humanizer/SKILL.md` dan `docs/game-dev/PLAYER_DEVELOPER_CONTENT_BOUNDARY.md`.

## Arsitektur yang dipakai

- **Canonical 248:** `game-assets/catalog/npc-public-roster.json`, dengan fingerprint terkunci. Indeks untuk browser di `public/game/data/npc/index.json`. Kunci ID dan portrait tetap diperlukan dalam kode, **bukan tulisan yang dilihat pemain**.
- **Editor:** `public/game/data/npc/{ID}.json` menyimpan 12 kategori, `fieldProvenance`, `visualEvidence`, `approval`, konsep quest, kontinuitas dan catatan sumber. Karena berada di folder public, berkas ini **bukan rahasia**: jangan memasukkan PII, token, password atau catatan reviewer privat.
- **Penyajian pemain:** `src/lib/game/public-wargapedia.ts` — `wargaPlayerView` dan allowlist `WARGA_PLAYER_FIELD_POLICY`. Dipakai oleh `src/app/game/phone-wargapedia.tsx` serta `src/app/game/encyclopedia/encyclopedia-client.tsx`. Hanya data yang relevan dan layak dipahami yang ditampilkan.
- **Penyimpanan progres:** `game.bonds`, `game.personalQuests`, `game.story` hanya dari save. Hubungan baru ke tokoh canonical hanya lewat `approvedLegacyId`.
- **Editor privat terotorisasi:** `/api/game/resident-bible/[id]?draft=1` dengan izin server. Endpoint ini bukan halaman mainan; jangan memanggilnya otomatis atau memberi toggle developer dalam Warga.

## Kontrak pengalaman pemain

1. Menu bernama **Warga**, satu tempat untuk mencari dan membaca cerita. Tidak ada tab Wargapedia duplikat atau bab berjudul `01_core_identity` sampai `12_continuity_current_state`.
2. Daftar memakai nama yang dibaca manusia, pekerjaan, potret, pencarian nama/profesi, navigasi rapi. ID seperti `A03` hanya untuk key, URL dan atribut pengujian, bukan label atau query yang disarankan kepada pemain.
3. Profil menunjukkan **sedikit informasi yang benar-benar bermakna**: keseharian, cerita asal yang tidak mengklaim tempat lahir, atau ciri visual yang didukung potret. Tidak perlu memaparkan setiap kolom Character Bible.
4. Jangan menulis "bisa dibaca tanpa level", "semua informasi terbuka", "data berasal dari save", "konsep", "draf", "legacy", "quest belum aktif" atau status program kepada pemain. Cukup tampilkan profil secara langsung; bila seseorang belum pernah ditemui, jangan munculkan notifikasi hubungan kosong.
5. Kedekatan dan misi hanya tampil bila benar-benar tercatat dan dipetakan secara sah. Jangan memberi lokasi jadwal ke NPC yang belum aktif atau menganggap profil sama dengan dialog yang sudah terjadi.
6. Tokoh nyata P01/P02: tampilkan pendidikan/riwayat publik yang bersumber, serta sumber yang bisa dibuka; adegan dan dialog game secara ringkas ditegaskan fiksi. Jangan tampilkan psikologi rekaan atau dukungan politik palsu.
7. Gaya tulis setiap tokoh dan narasi di review dengan Humanizer, **tanpa API/runtime AI**. Jangan menambah kisah khusus yang bertentangan dengan profesi atau teks di game.
8. Mobile portrait: ringkas, tak ada layar gulir tanpa akhir, dukungan keyboard, fokus, alt potret, loading/error manusiawi, serta pencegahan profil lama muncul saat berpindah NPC.

## Lapisan developer

Developer tetap dapat melihat penuh 12 kategori melalui JSON/dokumentasi, identitas dan fingerprint, provenance dan confidence, peta linkage, skema save serta QA. Presentasi audit harus menyebut `source`, `claimType`, `requiresReview`, dan status approval; tidak boleh diam-diam menulis ulang profile canonical dari proyeksi pemain.

## Acceptance

- `npm run chars:public:check` menjamin 248 identitas, 12 kategori internal dan 248 potret.
- `npm run test:game` memeriksa pemisahan legacy, sumber kedekatan dan copy UI.
- `npm run test:portraits:ui` / tes browser Warga memeriksa daftar, detail, nama, potret, state kosong, pencarian, akses tanpa level, serta tidak bocornya teks developer ke UI.
- `npm run test:game:copy` dan `npm run typecheck` lulus. QA manusia wajib meninjau variasi bahasa pada beberapa profesi/kelompok potret.
- Jangan membangun rute baru yang menghabiskan fungsi Vercel staging Hobby bila tidak diperlukan.
