# YZ Farm Life — Cutscene Pintu Air (Remotion)

Remotion digunakan **hanya untuk authoring dan render**. Runtime Phaser/Next.js memutar MP4 yang sudah dihasilkan; tidak mengunduh Remotion Player saat bermain.

- Durasi: 330 frame / 30 fps = **11 detik**.
- 960×540, H.264, gerak kamera + panorama, Yanzen canon sprite, roda/gate, arus air, color grading, subtitle singkat, audio kanal.
- Aset sumber disalin dari repository: `public/game/assets/characters/stage1.png` dan `game-assets/yz-farm-life/aset/audio/kanal.wav` ketika job dijalankan.
- Cara render lokal: `cd cutscenes/remotion && npm install && cp ../../public/game/assets/characters/stage1.png public/yanzen-actor.png && cp ../../game-assets/yz-farm-life/aset/audio/kanal.wav public/kanal.wav && npm run render`.
- Output film: `public/game/assets/cutscenes/sluice-gate.mp4`, dimainkan saat misi Ryan, dan tersedia lewat YZ Phone → Kenangan sesudah ditemukan.
- Jangan mengubah state di video; gameplay menyimpan `sluiceOpen` dan `sluiceCutsceneSeen` sebelum memutar film. Skip/replay tidak memicu pembayaran ulang.
- Lisensi Remotion: verifikasi kategori Free/Company License sebelum penggunaan operasional organisasi.

Komposisi render memakai kode Remotion nyata, bukan GIF/image statis atau animasi CSS dengan label palsu. Jika file MP4 belum dipublikasikan, komponen runtime harus jatuh kembali ke animasi yang sudah ada.
