# Character Bible 248 — migrasi privat dan audit lintas modul

Status: kode integrasi di branch review. Semua 248 profil hasil enrichment tetap DRAFT (22 November 2026).

## Hierarki kebenaran
1. Empat kolom canonical (id, name, occupation, portrait) dan fingerprint berasal dari roster privat yang sudah disahkan dan tidak berubah.
2. Character Bible 12 kategori yang sudah ada adalah baseline editorial, bukan jaminan fakta pribadi atau quest yang telah dimainkan.
3. editorialAdditions.values dan fieldSources adalah ide penulisan baru per kategori. Statusnya editorial-fictional-draft atau unverified. Keberadaan berkas potret di tree GitHub adalah repository-path-verified, bukan QA visual.

Jangan commit file identitas/narasi privat ke GitHub publik, public/assets, src, client bundle, log, atau CI artifact.

## Integrasi yang tersedia
- Pembaca server tetap APPROVED ONLY untuk pemain biasa.
- Editor terautentikasi yang user ID Supabase-nya dicantumkan pada environment server-only GAME_BIBLE_EDITOR_USER_IDS boleh memakai query npcDraftPreview=1 di URL game untuk melihat dossier yang belum disahkan. Browser mengakses /api/game/resident-bible/[id]?draft=1, tidak mengakses JSON privat langsung. Tanpa izin server, request ditolak 403.
- Status draf tidak berubah otomatis. Menampilkan profil tidak membuka misi, NPC spawn, relasi, jadwal, save flag, atau Kronik.
- Potret selalu dicari memakai key portrait dari roster canonical, bukan urutan file atau identitas legacy.
- Audit privat memeriksa 248 profil, 12 kategori, fingerprint, identitas, fieldSources, izin draft, serta berkas PNG. Audit bukan sertifikasi art style.

## Install di Docker
1. Checkout branch review, pastikan file GAME_RESIDENT_ROSTER terpasang di server.
2. Transfer YZ_Farm_Life_NPC_248_Character_Bible_ENRICHED_DRAFT_PRIVATE.json melalui kanal terenkripsi ke folder PRIVAT DI LUAR WEBROOT. Set chmod 600.
3. Preflight: node scripts/game-characters/install-private-bibles.mjs /secure/source/CHARACTER_BIBLE_PRIVATE.json --check
4. Instal: node scripts/game-characters/install-private-bibles.mjs /secure/source/CHARACTER_BIBLE_PRIVATE.json
5. Installer melakukan audit file sementara, backup file lama di lokasi privat, dan penggantian atomik; target tidak diubah jika validasi gagal.
6. Jalankan: npm run chars:roster:check, npm run chars:bible:audit:strict, npm run test:game:phone, npm run test:game:humanizer, npm run test:game:copy, npm run test:game, npm run typecheck.
7. Preview editor: atur GAME_BIBLE_EDITOR_USER_IDS di environment Docker, buka halaman game dengan ?npcDraftPreview=1, klik warga, dan buka panel Catatan editor.

Vercel tidak otomatis memiliki file Docker. Jangan taruh file 5+ MB ini di environment variable atau bundle publik. Perlu storage privat dan backend otorisasi khusus untuk preview Vercel. Storage eksternal tersebut belum diintegrasikan.

## Matriks dampak
| Modul | Kondisi sekarang | Risiko/syarat lanjutan |
|---|---|---|
| Roster canonical | Tidak diubah | Hash selalu cocok |
| Character Bible 248 | Enrichment offline, semua draft | Review editorial per tokoh |
| Portraits | Semua 248 key terhubung ke PNG | QA dimensi, alpha, gaya, ekspresi, sprite |
| YZ Phone Warga | Editor preview terlindungi | Uji iOS, scroll, 12 seksi |
| Kronik | Tidak diubah | Hanya event nyata berdasarkan save |
| GameState, save | Tidak diubah | Hindari waris otomatis state legacy |
| Dialog, quest, relationship | Tidak dimigrasikan otomatis | Validasi storyId, flags, choices per adegan |
| World, schedule, spawn | Tidak diasumsikan playable | Mapping lokasi dan jadwal setelah art/runtime QA |
| Cameo P01 dan P02 | Tidak mendapat riwayat/psikologi buatan | Ikuti batasan figur publik |
| Docker | Installer backup + preflight tersedia | Eksekusi dari server berizin |
| GitHub | Hanya kode dan panduan nonprivat | CI dan PR sebelum merge |

## Kriteria lulus
- 248 ID, nama, pekerjaan, portrait key, fingerprint, dan 12 seksi tidak berubah.
- Status approval tetap draft sampai manusia menyetujui.
- Tidak ada data privat yang muncul dalam diff atau CI artifacts.
- Semua tes dan typecheck lulus setelah checkout lokal; pembacaan data draf selalu melalui gate editor.
- Tidak ada perubahan state, quest, atau relasi akibat ID kebetulan sama.
- Kualitas dialog, ekspresi, alpha, style, dan spawn diperiksa manual sebelum tokoh disebut playable.
