# Humanizer — sumber terkunci

Skill di folder ini adalah salinan langsung `SKILL.md` dari **[blader/humanizer](https://github.com/blader/humanizer)**, dipasang pada repository untuk Codex yang bekerja langsung pada YZ Farm Life.

- Repository upstream: `https://github.com/blader/humanizer`
- Commit upstream terkunci: `a32f24407364c74c812b43c15926d638bee1e072`
- Versi dalam frontmatter: `4.0.0`
- Blob Git `SKILL.md`: `bc51a89764e96c0178c707a2a7158d8dca4e6920`
- Blob Git `LICENSE`: `625297fb778f32eb39d3a5b97e3e3b611b7304d6`
- Lisensi: MIT (Copyright 2025 Siqi Chen); lihat [LICENSE](LICENSE).
- Pembaruan tidak otomatis: periksa diff, lisensi, dan dampak pada dialog, kemudian perbarui pin dan pengujian pada PR terpisah.

## Pakai di Codex

Buka proyek hasil `git pull` menggunakan versi Codex yang membaca skill lokal di `.agents/skills/`, lalu minta `$humanizer` untuk penyuntingan umum atau `$yz-farm-dialogue` untuk dialog, quest, jurnal, serta pesan NPC YZ Farm Life.

Skill berupa instruksi Markdown; **tidak ada npm package, API key, service, middleware runtime, atau transmisi data ke server Humanizer**. Perubahan tulisan hanya terjadi ketika agen diminta menyunting teks dan hasilnya disetujui/review sesuai workflow proyek.
