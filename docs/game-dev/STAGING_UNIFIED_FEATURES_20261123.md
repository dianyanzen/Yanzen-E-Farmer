# Integrasi tunggal YZ Farm Life untuk staging main — 23 November 2026

## Sumber yang digabung
- Main terbaru (PR #51 + PR #52): lima NPC aktif dengan misi awal dan lima misi lanjutan, aset quest khusus dengan aksi, rumah NPC dan izin bertamu selama misi, YZ Phone/Kronik, reset akun/progres sepenuhnya termasuk NPC serta perlindungan save usang.
- Preview lama commit `6250fd26f68ab626e270b4df8f7fc3139ecb9870` dari `feat/fishing-wait-bite-animation-20261123`: mekanik memancing V2 yang memiliki waktu tunggu, peluang gagal/lepas, visual joran dan pelampung, lele/nila, statistik memancing, portrait Widi dan atlas ekspresi, UI/dialog pasar dan aset ikon jual beli, serta referensi cutscene pintu air yang pernah dibuat.
- Semua perubahan diterapkan secara selektif pada main terkini. **Jangan merge mentah branch preview lama**, sebab ia tidak memuat reset akun baru, lima misi lanjutan atau sistem izin masuk rumah NPC.

## Kontrak fitur aktif
1. Memancing: durasi casting 560ms, menunggu acak 4,8–9,2 detik, peluang sambaran 80%, window 1,7 detik, peluang tangkapan 70% setelah reaksi tepat; kegagalan no-bite, terlalu dini, terlambat dan ikan lepas dicatat. Lele dan nila adalah ikan sungai; tiga stok ikan lama tetap dapat dijual. Tingkat keberhasilan adalah parameter playtest, bukan jaminan.
2. Interaksi NPC: nama canonical, wajah/ekspresi runtime, portrait Widi, dialog pasar tetap terpisah dari UI toko, hubungan dan histori karakter tidak dibuang.
3. Quest: lima misi pertama + lima lanjutan yang tercatat di YZ Phone; inspeksi objek hanya setelah misi terkait diterima, objek Ryan/Ayu/Widi/Inggit di dalam rumah, pot Nani di luar; misi pertama maupun lanjutan dapat memberi izin bertamu sementara tanpa persyaratan poin kedekatan.
4. Akun dan save: tidak menulis progres lama secara buta, revision guard pada PUT; reset dikonfirmasi pengguna, menciptakan `newGame()` dan me-reset NPC, cerita, item, ikan, misi dan statistik; tidak menghapus akun autentikasi.
5. Cutscene: dokumen `NPC_QUEST_CUTSCENE_CONCEPT.md` memuat tujuh **ide baru saja**, tidak diaktifkan. Pemutar pintu air/kenangan dari preview lama adalah konten historis berbeda yang dapat menampilkan fallback poster jika sumber MP4 pemilik tidak tersedia.

## Batasan penting video historis
Dokumen `PASIRLUYU_VIDEO_IMPORT_STATUS.md` menegaskan file `public/game/assets/cutscenes/sluice-gate.mp4` **belum dikomit permanen** dan preview sebelumnya mengandalkan `YZ_SLUICE_VIDEO_SOURCE_URL` sementara. Aset poster dan dua frame referensi sudah ada, tetapi keduanya bukan pengganti video asli. Jangan menyatakan cutscene video 10 detik tersedia di staging main sampai asset asli yang cocok hash telah diimpor secara permanen dan diuji. Jangan membuat ulang video tanpa persetujuan pemilik.

## Gerbang QA integrasi
- `npm run typecheck`, `npm run test:game`, `npm run build:vercel:game-playtest`.
- Pastikan test NPC quest, akses rumah, indeks aset 2499 media, model memancing, portrait Widi, menu pasar, Kronik, reset dan navigasi ketuk lulus bersamaan.
- Deployment exact merge SHA `main` harus mencapai READY pada proyek `yanzen-e-farmer-staging`, dan alias `https://yanzen-e-farmer-staging.vercel.app/game` harus mengarah ke versi baru.
- Uji visual ponsel sungguhan/animasi dan cutscene berkas asli tetap pekerjaan QA terpisah; READY bukan sertifikasi perilaku iPhone.
