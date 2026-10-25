import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FarmIcon from "@/components/farm-icon";
import { additionalModules, getAdditionalModule } from "@/lib/farm/additional";
import { labels, money, names } from "@/lib/farm/model";

export const dynamic = "force-dynamic";
type Entry={id:string;kind:string;title:string;entry_date:string;amount:number;quantity:number|null;unit:string;parent_id:string|null;cycle_id:string|null;status:string;details:Record<string,unknown>};
type Partner={id:string;name:string;category:string;employment_status:string;job_role:string;notes:string};
type Account={id:string;name:string};
const n=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0;
const text=(v:unknown)=>typeof v==="string"?v:"";
const date=(s:string)=>s?new Date(s+"T12:00:00Z").toLocaleDateString("id-ID",{timeZone:"UTC",day:"2-digit",month:"short",year:"numeric"}):"—";

export default async function AdditionalDetail({params}:{params:Promise<{module:string}>}) {
 const {module:slug}=await params;
 const item=getAdditionalModule(slug);
 if(!item)notFound();
 const db=await createClient();
 const {data:auth,error:authErr}=await db.auth.getUser();
 if(authErr||!auth.user)redirect("/login");
 const {data:orgs,error:orgError}=await db.from("farm_organizations").select("id,name,owner_id").order("created_at");
 if(orgError)throw new Error("Tidak dapat membaca izin usaha.");
 const org=orgs?.[0];
 const {data:member}=org?await db.from("farm_members").select("role").eq("organization_id",org.id).eq("user_id",auth.user.id).maybeSingle():{data:null};
 const canWrite=!!org&&(org.owner_id===auth.user.id||!!member?.role&&member.role!=="reader");
 let records:Entry[]=[];
 let partners:Partner[]=[];
 let accounts:Account[]=[];
 let errorMessage="";
 let scopeNote="";
 if(org) {
   if(slug==="mitra") {
     const r=await db.from("farm_parties").select("id,name,category,employment_status,job_role,notes").eq("organization_id",org.id).order("name").limit(300);
     if(r.error)errorMessage="Direktori mitra belum dapat dimuat.";else partners=(r.data??[]) as Partner[];
   } else if(slug==="rekening") {
     const r=await db.from("farm_accounts").select("id,name").eq("organization_id",org.id).order("name").limit(300);
     if(r.error)errorMessage="Rekening usaha belum dapat dimuat.";else accounts=(r.data??[]) as Account[];
   } else {
     let ids:string[]|null=null;
     if(slug==="perikanan"||slug==="perkebunan") {
       const r=await db.from("farm_cycles").select("id").eq("organization_id",org.id).eq("production_type",slug==="perikanan"?"fish":"perennial");
       if(r.error)errorMessage="Siklus budidaya belum dapat dimuat.";else ids=(r.data??[]).map(x=>x.id);
       scopeNote="Hanya kegiatan dengan siklus "+(slug==="perikanan"?"perikanan":"tanaman tahunan")+" yang terhubung.";
     }
     if(!errorMessage&&ids?.length!==0) {
       let query=db.from("farm_entries").select("id,kind,title,entry_date,amount,quantity,unit,parent_id,cycle_id,status,details")
        .eq("organization_id",org.id).eq("status","posted").in("kind",item.kinds)
        .order("entry_date",{ascending:false}).order("created_at",{ascending:false}).limit(300);
       if(ids)query=query.in("cycle_id",ids);
       const r=await query;
       if(r.error)errorMessage="Catatan modul belum dapat dimuat. Periksa koneksi atau akses usaha.";
       else records=(r.data??[]) as Entry[];
     }
   }
 }
 const acquisitions=records.filter(r=>r.kind==="asset");
 const uses=records.filter(r=>r.kind==="asset_use");
 const maintenance=records.filter(r=>r.kind==="maintenance");
 const stockIns=records.filter(r=>r.kind==="stock_in");
 const stockOuts=records.filter(r=>r.kind==="stock_use");
 const entityCount=slug==="mitra"?partners.length:slug==="rekening"?accounts.length:records.length;
 const actions=item.actions;
 return <main className="farm-page farm-additional">
  <nav aria-label="Jejak navigasi" className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#225844]">
   <Link href="/home">Beranda</Link><span aria-hidden="true">/</span>
   <Link href="/additional">Additional</Link><span aria-hidden="true">/</span>
   <span className="farm-muted">{item.title}</span>
  </nav>
  <header className="farm-module-hero relative mt-5 overflow-hidden rounded-[27px] border border-[#dce7d7] bg-[#edf4e7]">
   <div className="grid min-h-[230px] gap-5 sm:grid-cols-[1.4fr_.6fr]">
    <div className="relative z-10 p-6 sm:p-8">
     <p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#387c55]">Additional · {item.group}</p>
     <h1 className="mt-3 max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-[#103e32] sm:text-4xl">{item.title}</h1>
     <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#526d5b]">{item.description}</p>
     <div className="mt-5 flex flex-wrap gap-2">
      {actions.map((action,i)=><Link key={action.href} href={action.href} aria-disabled={!canWrite&&i===0?true:undefined}
       className={i===0?"farm-button farm-button-primary text-sm":"farm-button farm-button-secondary text-sm"}>{i===0?"+ ":""}{action.label}</Link>)}
     </div>
    </div>
    <div className="relative hidden min-h-[230px] sm:block">
     <Image src={item.image} alt="" fill className="object-cover opacity-85" sizes="360px"/>
     <div className="absolute inset-0 bg-gradient-to-r from-[#edf4e7] via-transparent to-transparent"/>
    </div>
   </div>
  </header>
  {!org&&<section className="farm-card mt-5 p-5"><h2 className="text-xl font-bold">Belum ada usaha</h2><p className="mt-2 text-sm">Mulai dengan membuat usaha di beranda. Data Additional mengikuti usaha aktif.</p><Link href="/home" className="farm-button farm-button-primary mt-4">Buat usaha</Link></section>}
  {org&&<>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm"><p className="farm-muted">Usaha: <strong className="text-[#103e32]">{org.name}</strong> · {entityCount} catatan ditampilkan</p><Link href="/additional" className="font-bold text-[#225844]">Semua modul Additional →</Link></div>
   {scopeNote&&<p className="mt-3 text-sm text-[#526d5b]">{scopeNote}</p>}
   {errorMessage?<div className="farm-notice farm-notice-error mt-5" role="alert">{errorMessage}</div>:null}
   {!errorMessage&&slug==="aset"&&<>
    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan aset">
     {[
      ["Unit / aset tercatat",String(acquisitions.length)],
      ["Nilai perolehan",money(acquisitions.reduce((s,r)=>s+n(r.amount),0))],
      ["Jam pemakaian",uses.reduce((s,r)=>s+n(r.details?.hours),0).toLocaleString("id-ID",{maximumFractionDigits:2})+" jam"],
      ["Biaya perawatan",money(maintenance.reduce((s,r)=>s+n(r.amount),0))]
     ].map(([label,value])=><div className="farm-kpi" key={label}><p className="farm-kpi-label">{label}</p><strong className="farm-kpi-value mt-2 block">{value}</strong></div>)}
    </section>
    {acquisitions.length>0?<section className="mt-6"><h2 className="text-xl font-black">Katalog inventaris</h2><p className="mt-1 text-sm farm-muted">Riwayat pemakaian dan biaya perawatan tercatat terpisah dari harga beli.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
      {acquisitions.map(asset=>{
       const usage=uses.filter(x=>x.parent_id===asset.id);
       const repairs=maintenance.filter(x=>x.parent_id===asset.id);
       const hours=usage.reduce((s,r)=>s+n(r.details?.hours),0);
       const last=usage[0];
       const category=text(asset.details?.category);
       return <article key={asset.id} className="farm-card farm-asset-card overflow-hidden p-5">
        <div className="flex items-start justify-between gap-3">
         <span className="farm-icon"><FarmIcon name="calculator"/></span>
         <span className="rounded-full border border-[#d3e5ca] bg-[#edf6e8] px-3 py-1 text-xs font-bold text-[#225844]">{labels[category]||"Aset terdaftar"}</span>
        </div>
        <h3 className="mt-4 text-lg font-black">{asset.title}</h3>
        <p className="mt-1 text-sm farm-muted">{text(asset.details?.brand)||"Merek belum dicatat"} · {text(asset.details?.location)||"Lokasi belum dicatat"}</p>
        {text(asset.details?.serial)&&<p className="mt-1 text-xs farm-muted">Identitas: {text(asset.details.serial)}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#dce7d7] pt-4">
         <div><p className="text-xs farm-muted">Nilai perolehan</p><strong className="farm-money mt-1 block">{money(asset.amount)}</strong></div>
         <div><p className="text-xs farm-muted">Total jam digunakan</p><strong className="farm-money mt-1 block">{hours.toLocaleString("id-ID",{maximumFractionDigits:2})} jam</strong></div>
         <div><p className="text-xs farm-muted">Sesi pemakaian</p><strong className="mt-1 block">{usage.length}</strong></div>
         <div><p className="text-xs farm-muted">Biaya perawatan</p><strong className="farm-money mt-1 block">{money(repairs.reduce((s,r)=>s+n(r.amount),0))}</strong></div>
        </div>
        {last&&<p className="mt-4 rounded-xl bg-[#f4f8f0] px-3 py-2 text-xs text-[#526d5b]">Terakhir digunakan {date(last.entry_date)} · {text(last.details?.operator)||"Petugas tidak tercatat"}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
         <Link href={`/catat?action=entry:asset_use&parent_id=${asset.id}&title=${encodeURIComponent("Pemakaian "+asset.title)}`} className="farm-button farm-button-primary text-xs">Catat pemakaian</Link>
         <Link href={`/catat?action=entry:maintenance&parent_id=${asset.id}&title=${encodeURIComponent("Perawatan "+asset.title)}`} className="farm-button farm-button-secondary text-xs">Catat perawatan</Link>
        </div>
       </article>;
      })}
     </div></section>:<section className="farm-empty mt-6"><Image src="/brand/empty-project-photo.jpg" alt="Perlengkapan pertanian" width={310} height={230} className="mx-auto max-h-[210px] w-auto rounded-2xl"/><h2 className="mt-4 text-xl font-extrabold">Belum ada aset dicatat</h2><p className="mx-auto mt-2 max-w-lg text-sm farm-muted">Daftarkan mesin, pompa, kendaraan, atau alat. Setelah itu catat pemakaian dan perawatan tanpa menambah biaya pembelian.</p><Link href="/catat?action=entry:asset" className="farm-button farm-button-primary mt-5">+ Tambah aset pertama</Link></section>}
    {uses.length>0&&<section className="farm-card mt-6 p-5"><h2 className="text-lg font-extrabold">Riwayat pemakaian terbaru</h2>{uses.slice(0,20).map(r=><div key={r.id} className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#dce7d7] pt-3 text-sm"><div><strong>{r.title}</strong><p className="mt-1 text-xs farm-muted">{date(r.entry_date)} · {text(r.details.operator)} · {text(r.details.purpose)}</p></div><strong>{n(r.details.hours).toLocaleString("id-ID")} jam</strong></div>)}</section>}
   </>}
   {!errorMessage&&slug==="stok"&&<section className="mt-6"><h2 className="text-xl font-black">Posisi bahan & persediaan</h2><p className="mt-2 text-sm farm-muted">Saldo dihitung dari stok masuk dikurangi pemakaian yang ditautkan ke stok tersebut. Tidak menjumlah satuan berbeda.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
     {stockIns.map(source=>{const used=stockOuts.filter(r=>r.parent_id===source.id).reduce((s,r)=>s+n(r.quantity),0);return <article key={source.id} className="farm-card p-5"><p className="text-xs font-bold uppercase tracking-[.1em] text-[#387c55]">Persediaan · {date(source.entry_date)}</p><h3 className="mt-3 text-lg font-extrabold">{source.title}</h3><p className="mt-3 text-2xl font-black">{(n(source.quantity)-used).toLocaleString("id-ID")} <span className="text-sm font-semibold">{source.unit}</span></p><p className="mt-1 text-xs farm-muted">Masuk {n(source.quantity).toLocaleString("id-ID")} · Dipakai {used.toLocaleString("id-ID")} {source.unit}</p><Link href={`/catat?action=entry:stock_use&parent_id=${source.id}&title=${encodeURIComponent("Pemakaian "+source.title)}`} className="farm-button farm-button-secondary mt-4 text-sm">Catat pemakaian</Link></article>})}
     {!stockIns.length&&<div className="farm-empty sm:col-span-2"><h3 className="text-lg font-extrabold">Stok belum dicatat</h3><p className="mt-2 text-sm farm-muted">Mulai dari pembelian pupuk, benih, atau bahan yang disimpan.</p><Link href="/catat?action=entry:stock_in" className="farm-button farm-button-primary mt-4">+ Tambah stok</Link></div>}
    </div>
   </section>}
   {!errorMessage&&slug==="mitra"&&<section className="farm-card mt-6 p-5"><h2 className="text-xl font-extrabold">Direktori usaha</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{partners.map(p=><div key={p.id} className="rounded-2xl border border-[#dce7d7] p-4"><strong>{p.name}</strong><p className="mt-1 text-xs farm-muted">{labels[p.category]||p.category} · {p.job_role||"Peran belum diisi"}</p>{p.notes&&<p className="mt-2 text-sm">{p.notes}</p>}</div>)}{!partners.length&&<p className="text-sm farm-muted">Belum ada pegawai, kelompok, pemasok, atau pembeli yang didaftarkan.</p>}</div></section>}
   {!errorMessage&&slug==="rekening"&&<section className="farm-card mt-6 p-5"><h2 className="text-xl font-extrabold">Kas & rekening terdaftar</h2>{accounts.map(a=><div key={a.id} className="mt-3 flex items-center gap-3 rounded-xl border border-[#dce7d7] p-4"><span className="farm-icon"><FarmIcon name="wallet"/></span><strong>{a.name}</strong></div>)}{!accounts.length&&<p className="mt-3 text-sm farm-muted">Belum ada kas atau rekening. Tambahkan melalui tombol di atas.</p>}<p className="mt-4 text-xs farm-muted">Saldo dihitung di halaman Laporan berdasarkan transaksi posted, bukan jumlah rekening.</p></section>}
   {!errorMessage&&!["aset","stok","mitra","rekening"].includes(slug)&&<section className="farm-card mt-6 p-5">
     <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-extrabold">Riwayat {item.title.toLowerCase()}</h2><p className="mt-2 text-sm farm-muted">Menampilkan data yang sudah tersimpan, bukan contoh atau simulasi.</p></div><span className="farm-badge">{records.length} catatan</span></div>
     <div className="mt-5 divide-y divide-[#dce7d7]">
      {records.map(r=><article key={r.id} className="py-4">
       <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.09em] text-[#387c55]">{names[r.kind]||r.kind} · {date(r.entry_date)}</p><h3 className="mt-1 font-extrabold">{r.title}</h3>
          {r.kind==="labor"&&<p className="mt-1 text-xs farm-muted">Jumlah penugasan: {n(r.details?.assignments).toLocaleString("id-ID")} · Lembur {money(r.details?.overtime)}</p>}
          {r.quantity!=null&&<p className="mt-1 text-xs farm-muted">{n(r.quantity).toLocaleString("id-ID")} {r.unit}</p>}
        </div>
        {n(r.amount)>0&&<strong className="farm-money">{money(r.amount)}</strong>}
       </div>
      </article>)}
      {!records.length&&<div className="farm-empty"><Image src={item.image} alt="" width={280} height={180} className="mx-auto max-h-[170px] w-full max-w-[250px] rounded-xl object-cover"/><h3 className="mt-4 text-lg font-bold">Belum ada transaksi</h3><p className="mt-2 text-sm farm-muted">Catat kegiatan pertama menggunakan tombol pada bagian atas.</p></div>}
     </div>
    </section>}
   {!errorMessage&&records.length>=300&&<p className="farm-notice mt-4 text-sm">Tampilan dibatasi pada 300 catatan terbaru. Laporan operasional memberikan rangkuman yang lebih lengkap.</p>}
   {canWrite===false&&<p className="farm-notice mt-5 text-sm">Akunmu memiliki akses baca. Penambahan atau perubahan data memerlukan izin pencatat, pengurus, keuangan, atau pemilik.</p>}
  </>}
  <section className="farm-card-soft mt-8 flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="font-extrabold">Kembali ke pekerjaan utama</h2><p className="mt-1 text-sm farm-muted">Beranda, lahan, pencatatan harian, bon, dan laporan tetap sama.</p></div><Link href="/home" className="farm-button farm-button-primary">Buka beranda <FarmIcon name="arrow-right" size={16}/></Link></section>
  <nav className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-[#225844]" aria-label="Modul Additional lain">{additionalModules.filter(m=>m.slug!==slug).slice(0,7).map(m=><Link href={`/additional/${m.slug}`} key={m.slug} className="rounded-full border border-[#d6e6cf] bg-white px-3 py-2">{m.title}</Link>)}</nav>
 </main>;
}
