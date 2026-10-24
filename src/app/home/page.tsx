import Link from 'next/link';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import FarmIcon from '@/components/farm-icon';
export const dynamic='force-dynamic';
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export default async function Home(){
 const db=await createClient();
 const {data,error}=await db.auth.getClaims();
 if(error||!data?.claims?.sub)redirect('/login');
 const {data:projects,error:pError}=await db.from('farm_projects').select('id,name,area_tumbak').order('created_at',{ascending:false});
 if(pError)throw new Error('Gagal memuat proyek');
 const ids=(projects??[]).map(p=>p.id);
 const {data:items,error:iError}=ids.length?await db.from('budget_items').select('project_id,quantity,unit_price').in('project_id',ids):{data:[],error:null};
 if(iError)throw new Error('Gagal memuat anggaran');
 const {data:expenses,error:eError}=await db.from('expenses').select('amount');
 if(eError)throw new Error('Gagal memuat pengeluaran');
 const total=(items??[]).reduce((sum,i)=>sum+Number(i.quantity)*Number(i.unit_price),0);
 const spent=(expenses??[]).reduce((sum,e)=>sum+Number(e.amount),0);
 const latest=projects?.[0];
 return <div className="min-h-dvh pb-24">
  <header className="sticky top-0 z-20 border-b border-[#dfe6d8] bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"><Link href="/home" className="flex items-center gap-2 font-extrabold"><Image src="/brand/yanzen-mark.svg" width={38} height={38} alt="Logo Yanzen E-Farmer"/><span>Yanzen E-Farmer</span></Link><form action="/auth/signout" method="post"><button className="farm-button farm-button-secondary text-sm"><FarmIcon name="log-out" size={17}/> Keluar</button></form></div></header>
  <main className="farm-page">
   <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#718177]">Selamat datang di kebunmu</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Beranda</h1></div><Link href="/anggaran/baru" className="farm-button farm-button-primary text-sm"><FarmIcon name="plus" size={18}/> Proyek</Link></div>
   <section className="farm-hero relative mt-6 overflow-hidden rounded-[26px] px-6 py-8 text-white sm:px-9"><div className="relative z-10 max-w-lg"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-[#d8ecbb]"><FarmIcon name="sprout" size={16}/> Tumbuh bersama</span><h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">Kelola pertanian lebih mudah, setiap hari.</h2><p className="mt-3 text-[#e1efdf]">Rencanakan kebutuhan, catat pengeluaran, dan lanjutkan kegiatan usahamu.</p><Link href="/keuangan" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#d8ecbb] px-5 font-bold text-[#153f32] transition hover:bg-white"><FarmIcon name="plus" size={18}/> Catat pengeluaran <FarmIcon name="arrow-right" size={17}/></Link></div><div aria-hidden="true" className="farm-hero-hill"/><div aria-hidden="true" className="farm-hero-hill farm-hero-hill-back"/></section>
   <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5" aria-label="Ringkasan usaha">
    <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name="folder" size={19}/></span><p className="farm-kpi-label mt-3">Proyek pertanian</p><p className="farm-kpi-value">{projects?.length??0}</p></div>
    <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name="calculator" size={19}/></span><p className="farm-kpi-label mt-3">Rencana anggaran</p><p className="farm-kpi-value">{money(total)}</p></div>
    <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name="receipt" size={19}/></span><p className="farm-kpi-label mt-3">Pengeluaran tercatat</p><p className="farm-kpi-value">{money(spent)}</p></div>
    <div className="farm-kpi"><span className="farm-icon farm-icon-sm"><FarmIcon name="sprout" size={19}/></span><p className="farm-kpi-label mt-3">Sisa rencana biaya</p><p className="farm-kpi-value">{money(total-spent)}</p><p className="mt-1 text-xs text-[#718177]">Anggaran dikurangi pengeluaran tercatat</p></div>
   </section>
   <section className="mt-9"><h2 className="farm-section-title">Menu utama</h2><div className="mt-4 grid grid-cols-2 gap-3">
    <Link href="/anggaran" className="farm-card p-4 sm:p-5"><span className="farm-icon"><FarmIcon name="calculator"/></span><strong className="mt-4 block">Anggaran</strong><span className="mt-1 block text-xs text-[#718177]">Rencana kebutuhan</span></Link>
    <Link href="/keuangan" className="farm-card p-4 sm:p-5"><span className="farm-icon"><FarmIcon name="wallet"/></span><strong className="mt-4 block">Keuangan</strong><span className="mt-1 block text-xs text-[#718177]">Pengeluaran aktual</span></Link>
   </div></section>
   <section className="mt-9"><div className="flex items-center justify-between gap-3"><h2 className="farm-section-title">Lanjutkan proyek</h2><Link href="/anggaran" className="text-sm font-bold text-[#225844] underline underline-offset-4">Lihat semua</Link></div>{latest?<Link href={`/anggaran/${latest.id}`} className="farm-card mt-4 flex items-center justify-between gap-3 p-5"><span className="flex items-center gap-3"><span className="farm-icon"><FarmIcon name="sprout"/></span><span><strong className="block text-lg">{latest.name}</strong><span className="mt-1 block text-sm text-[#718177]">Lanjutkan mengelola anggaran</span></span></span><FarmIcon name="arrow-right"/></Link>:<div className="farm-empty mt-4"><span className="farm-icon mx-auto"><FarmIcon name="sprout"/></span><p className="mt-4 text-lg font-bold">Mulai dari proyek pertamamu</p><p className="mt-2 text-sm text-[#718177]">Catat jenis tanaman dan luas lahan untuk mulai merencanakan biaya.</p><Link href="/anggaran/baru" className="farm-button farm-button-primary mt-5"><FarmIcon name="plus" size={18}/> Buat proyek</Link></div>}</section>
  </main>
  <nav aria-label="Navigasi utama" className="farm-nav fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] sm:hidden"><div className="mx-auto grid max-w-lg grid-cols-3"><Link href="/home" aria-current="page" className="farm-nav-link"><FarmIcon name="home"/>Beranda</Link><Link href="/anggaran" className="farm-nav-link"><FarmIcon name="calculator"/>Anggaran</Link><Link href="/keuangan" className="farm-nav-link"><FarmIcon name="wallet"/>Keuangan</Link></div></nav>
 </div>;
}