# Audit integrasi staging main — animasi mancing dan film pintu air (23 November 2026)

## Bukti dari laporan pemain (dua tangkapan layar)
- Pada **Pasar Warga** video pintu air tidak dapat dimainkan, meskipun poster tampil; pemain mendapat tombol retry dan skip. **Penyebab terkonfirmasi di Git:** `public/game/assets/cutscenes/sluice-gate.mp4` tidak ada, sedangkan `cutscene-catalog.ts` memanggil URL tersebut. Tidak valid menganggap READY build sebagai bukti video ada.
- Di **Bantaran Sungai** animasi joran dan pelampung muncul besar di **tengah kamera**, menjauh dari tangan dan permukaan air. **Penyebab terkonfirmasi:** `fishing-scene.tsx` membuat `yzg-fishing-effect` berukuran 194×120 CSS px dengan `left:50%;top:44%` terpisah dari dunia Phaser/Canvas.

## Perubahan gameplay — tanpa mengubah schema save, peluang, harga
- Animasi yang sama dengan gaya top-down YZ Farm Life dijalankan **di tubuh Yanzen**, dalam koordinat tile 20px. Sprite karakter menggunakan frame ekspresi gerak sesuai arah: melempar, menunggu, pelampung tersambar dan menarik.
- Lengan bergerak mengayunkan **joran kecil** (panjang <30 piksel dunia) yang menempel pada tangan. Tali tipis menyambung ujung joran ke **pelampung 4×6 piksel** pada **tile air di depan pemain**. Riak mini menyala saat mengambang, tenggelam dan ditarik. Tidak ada lagi joran/pelampung HTML di tengah layar.
- Kedua renderer, Phaser aktif dan fallback Canvas, memakai `fishingGeometry` yang sama; pergeseran kamera, mode portrait, zoom, kontrol mobile, arah memancing dan framing tidak memisahkan perangkat dari karakter.
- Hasil berhasil/gagal muncul 2,9 detik sebagai label kecil tepat **di atas kepala Yanzen**, bukan toast di tengah layar. Contoh `LELE +1`, `NILA +1`, `IKAN LEPAS`. Angka tangkapan/statistik dicatat oleh `finishFishingAttempt` yang sudah ada. Tidak ditambahkan peluang/imbalan instan.
- Durasi existing tetap: lempar 560 ms, tunggu acak 4,8–9,2 dtk, kesempatan bereaksi 1,7 dtk, tarik 1,75 dtk, peluang sambaran 80% dan berhasil mengangkat 70% setelah timing tepat.

## Film pintu air: kesenjangan aset nyata
- Poster `sluice-poster.jpg`, frame `frames/sluice-start.jpg` dan `frames/sluice-end.jpg` **sudah terintegrasi dan SHA Git identik** dengan preview `feat/fishing-wait-bite-animation-20261123`.
- **MP4 asli yang sudah disetujui pemilik tetap belum tersimpan di GitHub baik pada preview lama maupun main**. Manifest mencatat ukuran 6.199.340 byte, sumber 910×512, 30 fps, 10 dtk, SHA256 `6692a1a19cf1f466121bc0ba2dcec5e431bab1e9043f4103ca9e7804be105b20`. Video di preview tertentu sebelumnya dapat muncul hanya jika URL sumber sementara valid; itu bukan migrasi permanen.
- Saat browser gagal memuat MP4, pemutar **tidak menahan pemain pada layar error**. Ia memakai ilustrasi bergerak berupa **dua frame asli** yang crossfade selama 10 dtk, dengan subtitel asli dan penanda terlihat `Ilustrasi dua frame · video asli belum tersedia`. Tidak mengklaim dua JPG sebagai video. Tidak ada perubahan foto asli, aspect-ratio 910:512 atau wilayah controller.
- Begitu pemilik memberikan kembali **berkas MP4 asli identik hash** ke repo melalui `scripts/game-cinematics/import-owner-video.mjs --file ...`, jalur `cutscene-catalog.ts` tetap sama sehingga video otomatis menjadi sumber utama; jangan membuat video sintetis yang menimpa karya pemilik.

## Audit migrasi aktif antara preview lama dan main
Verifikasi berdasarkan path dan SHA blob Git (bukan dugaan dari UI):
| Aspek | Hasil audit |
|---|---|
| UI memancing & probabilitas V2 | Sumber `fishing-session.ts` dan `fishing-scene.tsx` ada di main; perbaikan ini mengganti efeknya agar menempel pada aktor |
| Ikan lele/nila | **Dua PNG sama dengan preview lama** |
| Ekspresi dialog Widi | `portraits/C07.png` **identik** dengan preview lama |
| Toko Ayu/Widi | `ayu-shop-atlas.png` dan `widi-shop-atlas.png` **identik** |
| Poster serta dua frame cutscene | **Ketiga file JPEG identik** |
| MP4 pintu air asli | **Belum ada** pada kedua Git branch; gap utama yang masih membutuhkan berkas asli |
| Lima misi lanjutan, properti di rumah dan pot Nani di luar | Ada di main setelah PR #52/#53; bukan konten branch film yang perlu di-merge ulang |
| Reset akun, YZ Phone, nama canonical dan simpanan | Tetap memakai versi main terbaru, tidak menimpa dari branch lama |

Audit tidak menyatakan semua 2.499 media sudah memiliki animasi aktif atau semua 248 NPC sudah playable; katalog aset tidak sama dengan pemakaian peta.

## Gerbang kualitas
- `tests/game-fishing-anchored.mjs`: setiap arah menghadapkan bobber ke satu tile air di depan karakter, panjang joran, animasi lempar/reel dan popup di kepala.
- `tests/game-fishing-v2.mjs`: mencegah pancing instan/100% sukses serta memeriksa kompatibilitas save.
- `tests/game-cutscene-fallback.mjs`: dua frame asli, subtitle, fallback jujur, durasi, skip aman dan MP4 path dipertahankan.
- `tests/game-fishing-ui.mjs`, `tests/game-cutscene-viewport-ui.mjs` (uji browser manual): viewport tidak menutup kontrol mobile.
- `npm run typecheck && npm run test:game && npm run build:vercel:game-playtest`: wajib lulus sebelum merge; verifikasi SHA main pada alias staging utama setelah merge. Build READY bukan sertifikat QA visual pada semua perangkat.
