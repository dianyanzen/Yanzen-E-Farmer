import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FarmActionLink,
  FarmButton,
  FarmEmpty,
  FarmPageTemplate,
  FarmSectionTitle,
  FarmStat,
  FarmSurface,
  FarmTable,
  FarmTag,
  FarmTextField,
} from "@/components/farm-template";

export const dynamic = "force-dynamic";
const swatches = [
  { name: "Forest", token: "var(--farmer-color-forest)", hex: "#103E32" },
  { name: "Leaf", token: "var(--farmer-color-leaf)", hex: "#387C55" },
  { name: "Ivory", token: "var(--farmer-color-canvas)", hex: "#F7F8F1" },
  { name: "Paper", token: "var(--farmer-color-paper)", hex: "#FFFFFF" },
  { name: "Gold", token: "var(--farmer-color-gold)", hex: "#C6A76B" },
] as const;
export default async function DesignSystem() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");

  return <FarmPageTemplate
    eyebrow="Foundation · Botanical Minimal"
    title="Base Template"
    subtitle="Galeri komponen standar Yanzen E-Farmer. Halaman ini adalah referensi visual untuk setiap menu baru, bukan sumber data operasional."
    backHref="/additional"
    backLabel="Kembali ke Additional"
    actions={<FarmActionLink href="/home" tone="secondary">Beranda utama</FarmActionLink>}
  >
    <FarmSurface>
      <FarmSectionTitle title="Palet warna" subtitle="Gunakan token CSS sebagai acuan tunggal. Hindari menambahkan hex baru langsung di halaman." right={<FarmTag>Version 1.0</FarmTag>}/>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {swatches.map(s=><div key={s.name} className="min-w-0">
          <div className="farmer-ui-swatch" style={{backgroundColor:s.token}} aria-label={s.name}/>
          <strong className="mt-2 block text-sm">{s.name}</strong>
          <span className="text-xs text-[#596e61]">{s.hex}</span>
        </div>)}
      </div>
    </FarmSurface>

    <section className="mt-7">
      <FarmSectionTitle title="Tombol & tindakan" subtitle="Tindakan primer hanya satu per konteks; sekunder untuk navigasi atau aksi pendukung."/>
      <FarmSurface>
        <div className="flex flex-wrap items-center gap-2">
          <FarmActionLink href="/keuangan/bon/baru">+ Buat Bon</FarmActionLink>
          <FarmActionLink href="/catat" tone="secondary">Catat Aktivitas</FarmActionLink>
          <FarmActionLink href="/additional" tone="quiet">Lihat Additional</FarmActionLink>
          <FarmButton tone="primary" disabled>Nonaktif</FarmButton>
          <FarmButton tone="danger" disabled>Batalkan (demo)</FarmButton>
        </div>
      </FarmSurface>
    </section>

    <section className="mt-7">
      <FarmSectionTitle title="Ringkasan & status" subtitle="Format angka menggunakan tabular numerals agar sejajar di dashboard dan laporan."/>
      <div className="grid gap-3 sm:grid-cols-3">
        <FarmStat label="Proyek aktif" value="—" hint="Dihitung dari database saat modul memakai komponen ini."/>
        <FarmStat label="Pengeluaran aktual" value="—" hint="Tidak menggunakan contoh transaksi palsu."/>
        <FarmStat label="Bon pengeluaran" value="—" hint="Rujukan ke transaksi yang benar-benar tersimpan."/>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <FarmTag>Netral</FarmTag>
        <FarmTag tone="positive">Tersimpan</FarmTag>
        <FarmTag tone="warning">Perlu ditinjau</FarmTag>
        <FarmTag tone="negative">Kesalahan</FarmTag>
      </div>
    </section>

    <section className="mt-7">
      <FarmSectionTitle title="Formulir" subtitle="Label selalu terlihat, area sentuh nyaman, pesan kesalahan terkait dengan field."/>
      <FarmSurface className="max-w-xl">
        <div className="grid gap-4">
          <FarmTextField id="template-item" label="Nama kebutuhan" placeholder="Contoh: Pupuk organik" hint="Contoh tampilan; tidak akan disimpan."/>
          <FarmTextField id="template-qty" label="Jumlah" type="number" placeholder="0" min={0}/>
          <FarmTextField id="template-error" label="Contoh field bermasalah" placeholder="Nilai tidak valid" error="Lengkapi informasi sebelum menyimpan."/>
          <p className="text-xs text-[#596e61]">Halaman referensi ini tidak mempunyai tombol simpan sehingga tidak mengubah database.</p>
        </div>
      </FarmSurface>
    </section>

    <section className="mt-7">
      <FarmSectionTitle title="Tabel laporan" subtitle="Header terbaca, angka rata kanan, dan tabel dapat digulir horizontal pada layar sempit."/>
      <FarmTable caption="Contoh struktur tabel laporan">
        <thead><tr><th scope="col">Tanggal</th><th scope="col">Uraian</th><th scope="col">Kategori</th><th scope="col" className="is-number">Jumlah</th></tr></thead>
        <tbody><tr><td>—</td><td>Data akan dimuat dari Supabase</td><td>—</td><td className="is-number">—</td></tr></tbody>
      </FarmTable>
    </section>

    <section className="mt-7">
      <FarmSectionTitle title="Keadaan kosong" subtitle="Jika sebuah modul belum memiliki transaksi, arahkan pengguna pada tindakan yang jelas."/>
      <FarmEmpty title="Belum ada catatan" description="Setiap modul baru memakai pola yang sama, tanpa membuat data contoh di database." action={<FarmActionLink href="/catat" tone="secondary">Mulai pencatatan</FarmActionLink>}/>
    </section>

    <FarmSurface className="mt-7">
      <FarmSectionTitle title="Aturan penggunaan" subtitle="Konsistensi komponen sebelum menambahkan efek visual."/>
      <p className="farmer-ui-muted">Setiap menu baru harus memanfaatkan halaman dasar, token warna, komponen tombol/kartu/form/tabel, dan navigasi aplikasi yang sudah ada. Pertahankan autentikasi dan RLS Supabase. Lakukan pemeriksaan TypeScript, ESLint, pengujian database, dan tampilan mobile sebelum deploy.</p>
      <Link href="/additional" className="mt-4 inline-flex text-sm font-bold text-[#225844] underline underline-offset-4">Kembali ke seluruh modul</Link>
    </FarmSurface>
  </FarmPageTemplate>;
}
