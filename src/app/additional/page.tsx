import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FarmIcon from "@/components/farm-icon";
import { FarmActionLink, FarmPageTemplate } from "@/components/farm-template";
import { additionalGroups, additionalModules } from "@/lib/farm/additional";
export const dynamic = "force-dynamic";

export default async function AdditionalHub() {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) redirect("/login");
  return <FarmPageTemplate
    className="farm-additional"
    eyebrow="Ekosistem usaha tani"
    title="Additional"
    subtitle="Modul lanjutan yang melengkapi pekerjaan inti, tanpa meramaikan navigasi utama."
    backHref="/home"
    backLabel="Kembali ke beranda"
    actions={<>
      <FarmActionLink href="/catat" tone="primary" size="sm">+ Catat</FarmActionLink>
      <FarmActionLink href="/pengaturan" tone="secondary" size="sm">Pengaturan usaha</FarmActionLink>
    </>}
  >
    <section className="farm-additional-hero relative mt-5 overflow-hidden rounded-[30px] bg-[#103e32] text-white">
      <Image src="/brand/farm-sunrise-photo.jpg" alt="" fill className="object-cover opacity-25" sizes="(max-width: 1100px) 100vw, 1080px" priority={false}/>
      <div className="relative z-10 max-w-2xl p-6 sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#d8ecbb]">Yanzen E-Farmer / Additional</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Lebih lengkap, tanpa lebih rumit.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#f0f6e9] sm:text-base">
          Menu utama tetap fokus pada pekerjaan sehari-hari. Semua kebutuhan tambahan—mulai dari aset sampai perikanan—tersusun di sini dan terhubung ke data usahamu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/additional/aset" className="farm-button bg-[#d8ecbb] font-extrabold text-[#153f32] hover:bg-white">Kelola aset <FarmIcon name="arrow-right" size={17}/></Link>
          <Link href="/keuangan/bon/baru" className="farm-button border border-white/35 text-white hover:bg-white/15">+ Buat bon pengeluaran</Link>
        </div>
      </div>
    </section>
    <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Akses cepat">
      <Link href="/additional/aset" className="farm-card flex items-center gap-4 p-4"><span className="farm-icon"><FarmIcon name="calculator"/></span><span><strong className="block">Inventaris & alat</strong><span className="text-xs farm-muted">Catat beli, pakai, rawat</span></span></Link>
      <Link href="/additional/pekerja" className="farm-card flex items-center gap-4 p-4"><span className="farm-icon"><FarmIcon name="harvest"/></span><span><strong className="block">Upah pekerja</strong><span className="text-xs farm-muted">Kelompok & lembur</span></span></Link>
      <Link href="/additional/stok" className="farm-card flex items-center gap-4 p-4"><span className="farm-icon"><FarmIcon name="folder"/></span><span><strong className="block">Bahan & stok</strong><span className="text-xs farm-muted">Masuk, pakai, sisa</span></span></Link>
    </section>
    {additionalGroups.map((group)=> <section key={group.id} className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[#dce7d7] pb-4">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#387c55]">Additional / {group.id}</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{group.label}</h2><p className="mt-1 text-sm farm-muted">{group.description}</p></div>
        <span className="rounded-full bg-[#e8f2e4] px-3 py-1 text-xs font-bold text-[#225844]">{additionalModules.filter(m=>m.group===group.id).length} modul</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {additionalModules.filter(m=>m.group===group.id).map(m=><Link key={m.slug} href={`/additional/${m.slug}`} className="farm-card farm-additional-tile group flex min-h-[166px] flex-col p-5">
          <div className="flex items-start justify-between gap-3"><span className="farm-icon"><FarmIcon name={m.icon}/></span><span className="farm-additional-arrow" aria-hidden="true"><FarmIcon name="arrow-right" size={18}/></span></div>
          <h3 className="mt-4 text-base font-extrabold">{m.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed farm-muted">{m.description}</p>
          <span className="mt-4 text-xs font-extrabold text-[#286142]">Buka modul →</span>
        </Link>)}
      </div>
    </section>)}
    <aside className="farm-card-soft mt-10 p-5 text-sm leading-relaxed text-[#526d5b]">
      <strong className="block text-base text-[#103e32]">Data nyata, satu sumber.</strong>
      Riwayat Additional memakai database usaha dan otorisasi yang sama. Pencatatan upah, pemakaian aset, stok, atau penjualan tidak otomatis disamakan dengan arus kas—pembayaran dan penggunaan dicatat sesuai jenis transaksinya.
    </aside>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#596e61]">
      <span>Seluruh halaman baru mengikuti Botanical Minimal Base Template.</span>
      <Link href="/design-system" className="font-bold text-[#225844] underline underline-offset-4">Lihat Base Template →</Link>
    </div>
  </FarmPageTemplate>;
}
