# Standar HD Asset YZ Farm Life — Revisi 23 November 2026

## 1. Keputusan kualitas
- **Master**: PNG hasil generasi asli (umumnya 1254×1254 px), tidak diturunkan menjadi 48×48 untuk bangunan.
- **Runtime**: frame 320×320 px, dua atlas transparan (eksterior 960×640, interior 640×640), diperuntukkan bagi objek tampil ±104–154 px; tidak melakukan distorsi gambar sumber.
- **Tidak semua objek harus HD 1024 px:** tile 20×20 dan sprite karakter 24×32 tetap ukuran logisnya; resolusi master tidak sama dengan ukuran display.
- **Renderer:** Phaser dan Canvas memakai gambar dan ukuran yang setara; pengaturan scale tidak mengubah collision atau save.
- **Sumber dan runtime terpisah:** semua sumber dipertahankan, dan keluaran optimasi dapat dibuat ulang melalui `npm run assets:assemble:hd`.
- **Proses QA:** kompresi, alpha, proporsi, pintu, player occlusion, kontrol seluler, save lama, jam toko, interaksi NPC.

## 2. Atlas dan urutan frame
Eksterior `public/game/assets/hd/housing-market-hd.webp` (3×2; 320px per frame):
0. Rumah Yanzen (rumah utama)
1. Gudang Yanzen (logistik)
2. Rumah warga Inggit (gang)
3. Rumah warga Ayu (gang)
4. **Toko Serbaguna Ayu** (pasar, bukan rumah pribadi atau sekadar kios bibit)
5. **Toko Pancing Widi** (pasar; peralatan ikan dan umpan)

Interior `public/game/assets/hd/housing-interiors-hd.webp` (2×2; 320px per frame):
0. Rumah Yanzen — base lantai dan dinding
1. Rumah Yanzen — furnitur aktif
2. Gudang Yanzen — base lantai dan dinding
3. Gudang Yanzen — rak alat dan simpanan

**Penting:** interior rumah Ayu di gang tidak berubah menjadi toko. Warung Inggit dan kios sayur lama tetap aktif sampai tersedianya master khusus yang lulus QA. Semua nama NPC canonical, produk yang sudah bisa ditransaksikan, hitbox, dan akses misi tetap sama.

## 3. Ukuran runtime, bukan master
| Elemen | Frame source | Ukuran visual game | Anchor |
|---|---:|---:|---|
| Rumah Yanzen | 320×320 | 124×124 | bottom-center |
| Gudang Yanzen | 320×320 | 104×104 | bottom-center |
| Rumah warga | 320×320 | 108×108 | bottom-center |
| Ayu General Store | 320×320 | 154×154 | bottom-center |
| Widi Fishing Shop | 320×320 | 140×140 | bottom-center |
| Interior rumah dan gudang | 320×320 × 2 layer | 232×244 dalam map 480×320 | x132, y63 |

*Catatan*: sumber frame berbentuk persegi dengan margin transparan sehingga ukuran area bangunan sesungguhnya bisa lebih kecil. Proporsi akhir harus diperiksa visual dengan pemain 24×32 dan tile 20×20.

## 4. Aturan penempatan
- Area pasar: toko Ayu menggantikan visual `lapak-benih` pada `x128, y174`; Widi mengganti visual `lapak-pancing` pada `x550, y159`. Titik transaksi dan rute NPC **tetap**.
- Tutup toko tidak berarti bangunan menghilang; jam transaksi diatur oleh model, bukan oleh texture.
- Jika sumber HD gagal dimuat, renderer kembali memakai aset yang telah ada.
- Jangan menutupi NPC dan interaksi yang sudah eksis dengan layar khusus; periksa mobilitas di viewport nyata, bukan artboard.
- Objek furnitur dalam atlas belum otomatis menjadi entity collision individual. Registrasi interaksi aktif tetap pada model.

## 5. Standar audit otomatis
- Jalankan `npm run assets:assemble:hd` untuk memvalidasi semua bagian base64 yang committed, merakit WebP, dan memeriksa SHA-256.
- Jalankan `npm run test:game`, `npm run typecheck`, dan build Vercel.
- Tinjau secara visual dua renderer, pintu rumah, kasur, rak gudang, Ayu jual/beli bibit/timun, Widi pelet/ikan, jam buka/tutup, respons UI ponsel.
- Jangan merge ke `main` sebelum deployment preview READY dan uji visual akhir diterima.

## 6. Inventaris sumber
Nama master dan asal file tersimpan pada `game-assets/hd-pack/v3/sources.json`.
Asset payload runtime tersimpan dalam potongan base64 agar tetap dapat dikirim melalui konektor; potongan tersebut di-assemble byte-for-byte menjadi WebP **tanpa rekonstruksi warna lossy tambahan** saat build.
