# Potret karakter YZ Farm Life — katalog aset dan arsip standar 32 tokoh

> **Standar operasional terkini untuk NPC yang aktif:** [ACTIVE_NPC_PORTRAIT_STANDARD.md](./ACTIVE_NPC_PORTRAIT_STANDARD.md). Saat ini **5 NPC playable** (Ryan, Ayu, Nani, Widi, Inggit), sedangkan **248 profil Warga** tidak berarti 248 strip ekspresi playable. Catatan katalog 32 karakter di bawah merupakan inventaris ekspresi legacy, bukan daftar 248 NPC canonical.


32 karakter mengikuti `game-assets/catalog/cast.json`: Yanzen (A01) + 31 NPC. Setiap karakter memiliki delapan ekspresi original, total **256 potret**.

| Kolom | ID ekspresi | Nama |
| --- | --- | --- |
| 0 | neutral | Netral |
| 1 | happy | Senang |
| 2 | sad | Sedih |
| 3 | worried | Khawatir |
| 4 | surprised | Terkejut |
| 5 | annoyed | Kesal |
| 6 | shy | Malu |
| 7 | laughing | Tertawa |

Ekspresi malu menunjukkan rasa sungkan sosial; tidak menambahkan jalur romansa.

## Referensi dan konsistensi
Wajah dan pakaian mengikuti sprite depan dari dua paket referensi yang sudah ada: `gba-v2` (A01–A16), `gba-v2-c` (C01–C16). Rambut Ryan hitam; Nani mengenakan hijab beige dan blus bunga; Inggit bersanggul dan memakai apron cokelat. Nida tetap bermasker. Tatang dan Heri tetap berkumis pada seluruh ekspresi.

Potret dibuat dalam delapan kelompok berisi empat karakter. Aset memakai OpenAI image generation dan diperiksa terhadap referensi. Prompt dan checksum sumber/hasil tercatat dalam `game-assets/catalog/portrait-production.json`. Tidak ada gambar Harvest Moon yang dimasukkan ke aset.

## Runtime
- `public/game/assets/portraits/{ID}.png`: satu strip 1536×256 per karakter, delapan sel 192×256.
- `public/game/assets/portraits/manifest.json`: pemetaan 32 karakter dan delapan ekspresi.
- Potret memakai lazy-loaded image. Mengganti ekspresi menggeser strip yang sama, bukan mengunduh gambar lain.
- ID tidak dikenal atau gambar gagal dimuat menampilkan placeholder; tidak meminjam wajah karakter lain.
- Dialog lima NPC aktif Pasirluyu memakai strip delapan ekspresi masing-masing. Katalog Warga memakai potret profesi statis; progres kedekatan tetap bergantung pada save dan persetujuan tautan identitas. Profil IKD karakter utama memakai potret Yanzen.
- YZ Phone → **Warga**: cari nama/pekerjaan dan baca profil relevan dalam katalog canonical 248 karakter. Potret Warga berbentuk persegi; **delapan ekspresi adalah milik dialog permainan, bukan pemilih ekspresi di Warga**.
- Menambah potret tidak membuat karakter lain otomatis muncul pada peta atau membuka cerita/misi. Per November 2026, hanya lima NPC yang memiliki jadwal dan interaksi aktif.

Atlas lama `characters/portraits.png` dipertahankan untuk kompatibilitas URL; komponen runtime baru memakai strip per karakter.

## Pemeriksaan
`npm run test:portraits`: jumlah, identitas, dimensi, pemetaan ekspresi, fallback, dan ukuran aset.
`npm run test:portraits:ui`: memuat semua 32 strip, delapan ekspresi, pencarian, lazy loading, dan fallback gambar gagal di browser.
Pengujian dialog/rumah, save lama, TypeScript, ESLint, dan build produksi juga dijalankan.
