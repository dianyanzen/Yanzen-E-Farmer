# Audit Yanzen — Tinggi Antara Frame Animasi (24 November 2026)

**Observasi yang telah diverifikasi melalui kode dan metadata**, bukan hasil inspeksi seluruh screenshot live. Metadata berasal dari branch `feat/pasirluyu-indoor-ux-layout-20261123`, file `src/lib/game/character-frame-bounds.json` dan `src/lib/game/world-scale.ts`. Pada `main`, sebagian normalisasi tersebut belum terdapat dalam runtime yang diperiksa. Jangan menyamakan branch eksperimen dengan deployment yang sudah aktif.

## 1. Angka terukur

Alpha bounds (threshold piksel alpha > 50) pada frame sumber:

| Animasi | File sumber (legacy) | Canvas frame | Total frame yang diukur | Min–max tinggi bbox | Sebaran |
|---|---|---|---:|---:|---|
| Idle, beberapa tokoh | `characters/stage1.png` | 24×32 | 72 | 29–30 px | 29: 43; 30: 29 |
| Yanzen gait/run | `characters/yanzen-gaits.png` | 32×40 | 48 | 28–33 px | 28: 2; 29: 9; 30: 8; 31: 24; 32: 3; 33: 2 |
| Yanzen turn | `characters/yanzen-turns.png` | 32×40 | 24 | 30–33 px | 30: 5; 31: 7; 32: 5; 33: 7 |
| Tool/action | `tiles/actions.png` | 48×48 | butuh pengukuran tubuh tanpa tool | belum terukur | gambar mencakup benda alat |
| Fishing | menggunakan pose people lama + VFX | variatif | butuh pose baru | belum terukur | bodyShift dan frame berubah menurut fase |

Jumlah tiga grup metadata: **144 frame**, tetapi hanya 72 idle yang mencakup banyak tokoh; **tidak benar** jika menyatakan 144 frame semuanya Yanzen.

Bukti kode:
- `src/lib/game/phaser-world.ts` (branch pilot) memuat `load.spritesheet` stage1 24×32, gait/turn 32×40, action 48×48 dan memilih texture berdasarkan aksi. 3 kategori pertama menggunakan `playerSpriteTopY` dari `world-scale.ts`.
- `src/lib/game/world-scale.ts`: `PLAYER_FEET_PIXEL=18`, `PLAYER_BODY_TARGET_PX=30`, `playerSpriteTopY=tileY*20+18-bottomOfAlphaBounds+animationShift`.
- Pada branch yang sama, action frame 48×48 tidak masuk jalur `playerSpriteTopY` dan fishing memakai sheet people; perlu pose khusus dan body-only bounds.
- `src/lib/game/draw-world.ts` masih memiliki positional offsets yang berbeda di beberapa jalur: idle `tileY*20-12`, gait `-18`, action `-23` dan per-frame source-rect crop. Ini kandidat kuat penyebab `popping` antar animasi / renderer.

## 2. Diagnosis

| Temuan | Kemungkinan sebab | Confidence bukti | Alternatif / perlu bukti |
|---|---|---:|---|
| Frame 24×32 vs 32×40 vs 48×48 | Canvas padding dan tool berbeda; **bukan otomatis perbedaan badan** | 100% ukuran sumber | Body-only bbox diperlukan |
| Tinggi visible bbox gait 28–33 px | Dinamika langkah, pose, posisi top/bottom piksel | 100% nilai metadata; 70% interpretasi | Wajah/kepala/pundak mungkin memang digambar dengan proporsi berbeda |
| Avatar terlihat 'naik-turun' saat ganti animasi | Offset top-left tidak memakai satu foot anchor di seluruh renderer | 95% kode | Camera pixel snapping / zoom fractional dan origin scene |
| Action terasa membesar | Tool asset 48×48 memakai offset sendiri dan belum diukur body-only | 85% hipotesis teknis | Siluet tool besar, bukan tubuh yang membesar |
| Fishing tak konsisten | Frame idle dikombinasikan bodyShift dan pose kegiatan tanpa body reference khusus | 85% hipotesis teknis | Distorsi antialias/render saat zoom |

**Efek UX:** kesan 'Yanzen tumbuh-menyusut', melayang atau melangkah tanpa berat; mengurangi rasa kontrol serta polish game. Ini persoalan kualitas permainan, bukan perubahan mekanik pertanian sebenarnya.

## 3. Target perbaikan yang bisa diuji
1. Tetapkan satu *identity/body model* Yanzen dan render scale global untuk semua animasi.
2. Generate individual frame per arah + langkah/aksi; tiap pose punya gambar tersendiri. **Tidak boleh menggunakan sheet/atlas/crop atau aset berbagi**.
3. Buat body-only alpha bounds dan head/hip/foot landmarks; bedakan penurunan saat jongkok dari perubahan tinggi badan.
4. Gunakan per-frame foot pivot yang menghasilkan titik kontak kaki dunia sama di Canvas dan Phaser. Jangan stretch untuk memperbaiki ketidakselarasan.
5. Animasi pertanian dan fishing harus mengikuti kontrak body yang sama, bukan copy pose idle dengan tool besar. Senar, pancing, pelampung, efek mandiri.
6. Toleransi test untuk pose berdiri setara: perbedaan top-of-head 0–1px dan foot contact 0–1px; pose membungkuk dicatat sebagai perubahan anatomi yang disengaja.
7. Rekam playback per arah, semua transisi (idle↔walk, walk↔run, run↔turn, idle↔hoe, water↔idle, fish cast↔wait↔reel↔idle), pintu indoor/outdoor, player berada tepat pada grid ground yang sama. Cek zoom 1×, 2×, 3× dan mobile/desktop.
8. Jangan merge perubahan runtime sebelum tes, review video, status deployment aktual dan pengecekan save lama.

## 4. Tahap implementasi
- **P0**: audit semua frame body/tool; buat manifest per pose + tool, image queue individual; buat player renderer yang memuat file gambar per frame.
- **P0**: migrasi kedua renderer ke satu kaki/pivot/height; tangani action dan fishing.
- **P1**: migrasi NPC, potret/ekspresi, furnitur/interior, eksterior dan environment ke file individual.
- **P2**: audit sisa penggunaan sheet/atlas dan shared paths, lalu hapus legacy yang tidak direferensikan setelah izin pemilik.

**Keputusan final policy:** lihat `docs/game-dev/ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md` dan `.agents/skills/yz-farm-atomic-assets/SKILL.md`. Penulisan aturan ini tidak mengklaim sudah membuat file PNG mandiri, memodifikasi runtime, menjalankan browser QA atau deploy.
