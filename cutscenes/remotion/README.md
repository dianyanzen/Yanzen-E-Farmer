# YZ Farm Life — Cutscene Pintu Air (Remotion)

Remotion digunakan **hanya untuk authoring dan render**. Runtime Phaser/Next.js memutar MP4 yang sudah dihasilkan; tidak mengunduh Remotion Player saat bermain.

- Durasi: 330 frame / 30 fps = **11 detik**.
- 960×540, H.264, gerak kamera + panorama, Yanzen canon sprite, roda/gate, arus air, color grading, subtitle singkat, audio kanal.
- Aset sumber disalin dari repository: `public/game/assets/characters/stage1.png` dan `game-assets/yz-farm-life/aset/audio/kanal.wav` ketika job dijalankan.
- Cara render lokal: `cd cutscenes/remotion && npm install && cp ../../public/game/assets/characters/stage1.png public/yanzen-actor.png && cp ../../game-assets/yz-farm-life/aset/audio/kanal.wav public/kanal.wav && npm run render`.
- Source render penuh tersedia sebagai `cutscenes/remotion/out/sluice-gate.mp4` di lingkungan render. Salinan runtime yang sudah terpasang di `public/game/assets/cutscenes/sluice-gate.mp4` adalah **MP4 H.264 320×180, 10 fps, 19.776 byte**, diperkecil dari source 960×540 30 fps agar ringan pada iPhone. Keduanya berisi film Remotion yang sama (11 detik). Film diputar saat misi Ryan dan tersedia melalui YZ Phone → Kenangan setelah ditemukan.
- Jangan mengubah state di video; gameplay menyimpan `sluiceOpen` dan `sluiceCutsceneSeen` sebelum memutar film. Skip/replay tidak memicu pembayaran ulang.
- Lisensi Remotion: verifikasi kategori Free/Company License sebelum penggunaan operasional organisasi.

Komposisi render memakai kode Remotion nyata, bukan GIF/image statis atau animasi CSS dengan label palsu. Jika file MP4 belum dipublikasikan, komponen runtime harus jatuh kembali ke animasi yang sudah ada.

## Catatan build dan distribusi

Film runtime pertama berhasil dirender pada 22 November 2026 menggunakan Vercel Sandbox (Linux Chrome Headless Shell dengan paket `libnspr4` dan `libnss3`). Hasil render 330 frame lulus dan runtime MP4 diverifikasi SHA blob Git `693e94c85606a33ffcf7c930d7985b8c1e0770c8`. Pengiriman biner ke GitHub dilakukan dari render berhasil; workflow GitHub Actions otomatis yang pertama tidak berhasil sehingga **tidak** menjadi bukti QA. Untuk versi baru, render dahulu, inspeksi visual dan suara, kompres dengan FFmpeg, sinkronkan tiga indeks aset, lalu masukkan MP4 ke branch dengan QA. Jangan mendorong video render baru ke `main` tanpa review dan pembaruan katalog.

## Koreksi kualitas untuk iPhone (22 November 2026)

- Film sebelumnya diterbitkan sebagai H.264 **320×180 @ 10 fps / 19.776 byte**, sehingga teks dan detail menjadi tidak terbaca pada layar penuh. Versi ini kini hanya fallback di repository.
- Remotion telah dirender ulang pada **960×540 @ 30 fps**, durasi 11,008 detik. Profil HD runtime: H.264 CRF30, audio AAC 48 kb/s, **336.058 byte**. Gerak kamera, gate, dan air tetap mengikuti komposisi 330 frame.
- SHA256 HD: `dd3cd00f8efb11e1296e1cd9d2f1152243615b623e5c11435648dc217c9c08be`.
- Karena workflow GitHub Actions render gagal sebelum menjalankan tahap distribusi, master HD disimpan secara utuh sebagai 15 segmen base64 di `game-assets/cinematics/sluice-gate-hd/`. Script `scripts/game-cinematics/restore-hd-sluice.mjs` memverifikasi SHA, byte, signature MP4, dan menulis keluaran HD tepat sebelum `next build` pada Vercel. Ini bukan streaming asset yang diunduh pengguna dari 15 segmen.
- `npm run cutscene:hd:verify` memastikan source transport lengkap; `npm run build:vercel:game-playtest` memastikan output final ikut deployment.
- Video memiliki subtitle besar dan high-contrast; player iPhone menambahkan read-along caption terpisah, serta tombol layar penuh, suara, skip, dan SVG fallback.
- Kenangan terbuka berdasarkan peristiwa yang sudah tersimpan: flag cutscene, misi Ryan pribadi selesai/dalam tahap membuka pintu air, maupun pencapaian cerita Ryan di Bab 1. Migrasi aman: tidak mengubah saldo, kedekatan, atau membayar quest kedua kali.
- **QA visual Safari iPhone tetap diperlukan sebelum main.** Jangan menyebut semua emosi Widi, posisi dialog, atau rotasi video telah terverifikasi hanya berdasarkan screenshot lama.
