## Ringkasan
<!-- Satu PR = satu perubahan/tujuan; rujuk Issue jika ada. -->

- Produk/ruang kerja: GAME / FARM / SHARED / INFRA / DOCS
- Owner tugas: ChatGPT / Codex / manusia
- Issue:
- Base branch + SHA:
- Dokumen handoff: [docs/ai/HANDOFF_TEMPLATE.md](../docs/ai/HANDOFF_TEMPLATE.md)

## Checklist koordinasi
- [ ] Sudah membaca `AGENTS.md` dan `docs/ai/SYNC_PROTOCOL.md`
- [ ] Sudah memeriksa PR/Issue aktif dan tidak menimpa file milik agen lain
- [ ] Tidak ada kredensial/secret atau dump pengguna
- [ ] Perubahan game dan data kebun nyata tetap terisolasi
- [ ] Perubahan database/domain/production memerlukan keputusan pemilik tersendiri

## Audit YZ Farm Life (wajib bila produk = GAME)
- [ ] Sudah membaca [master audit](../docs/game-dev/GAME_AUDIT_MASTER.md) dan [playbook](../docs/game-dev/AUDIT_PLAYBOOK.md)
- ID temuan terkait (G-xxx) / alasan temuan baru:
- Bukti observasi, penyebab, confidence (%), alternatif, dampak, prioritas:
- Skenario QA F-xx yang benar-benar lulus:
- Status yang harus diperbarui pada master & audit history:
- Gameplay test/preview build terverifikasi? YA/TIDAK + URL:
- Rilis production tetap perlu approval pengguna terpisah.

## Verifikasi
- [ ] `npm run test` — hasil:
- [ ] `npm run typecheck` — hasil:
- [ ] `npm run test:game` — hasil:
- [ ] `npm run build` — hasil:
- [ ] QA manual desktop/mobile/login/save — hasil:
- [ ] Daftar risiko + rollback telah didokumentasikan

## Serah terima
- SHA commit:
- File yang berubah:
- Status: NEEDS_TEST / BLOCKED / READY_FOR_REVIEW
- Rilis production: **BELUM** (kecuali ada approval terpisah dan bukti)
- Berikutnya dikerjakan oleh:
