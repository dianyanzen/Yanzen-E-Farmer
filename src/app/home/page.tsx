import Link from 'next/link';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export default async function Home(){
 const db=await createClient();const {data,error}=await db.auth.getClaims();
 if(error||!data?.claims?.sub)redirect('/login');
 const {data:projects,error:pError}=await db.from('farm_projects').select('id,name,area_tumbak').order('created_at',{ascending:false});
 if(pError)throw new Error('Gagal memuat proyek');
 const ids=(projects??[]).map(p=>p.id);
 const {data:items,error:iError}=ids.length?await db.from('budget_items').select('project_id,quantity,unit_price').in('project_id',ids):{data:[],error:null};
 if(iError)throw new Error('Gagal memuat anggaran');
 const total=(items??[]).reduce((sum,i)=>sum+Number(i.quantity)*Number(i.unit_price),0);
 const latest=projects?.[0];
 return <div className="min-h-dvh pb-24">
 <header className="sticky top-0 z-20 border-b border-[#dfe6d8] bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
 <Link href="/home" className="flex items-center gap-2 font-extrabold"><Image src="/brand/yanzen-mark.svg" width={38} height={38} alt="Logo Yanzen E-Farmer"/><span>Yanzen E-Farmer</span></Link>
 <form action="/auth/signout" method="post"><button className="farm-button farm-button-secondary text-sm">Keluar</button></form>
 </div></header>
 <main className="farm-page">
 <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#718177]">Selamat datang 👋</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Beranda</h1></div><Link href="/anggaran/baru" className="farm-button farm-button-primary text-sm">+ Proyek</Link></div>
 <section className="relative mt-6 overflow-hidden rounded-[26px] bg-[#153f32] px-6 py-8 text-white sm:px-9"><div className="relative z-10 max-w-lg"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#c9e3a2]">Kelola pertanianmu</p><h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Lebih mudah merencanakan biaya usaha.</h2><p className="mt-3 text-[#dce9db]">Buat proyek, atur kebutuhan, dan pantau total anggaran dari satu tempat.</p><Link href="/anggaran" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#d8ecbb] px-5 font-bold text-[#153f32]">Buka Anggaran →</Link></div><div aria-hidden="true" className="absolute -right-12 -bottom-20 h-64 w-64 rounded-full border-[38px] border-white/5"/></section>
 <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5" aria-label="Ringkasan proyek"><div className="farm-card p-5"><p className="text-sm text-[#718177]">Proyek pertanian</p><p className="mt-3 text-3xl font-extrabold tabular-nums">{projects?.length??0}</p></div><div className="farm-card p-5"><p className="text-sm text-[#718177]">Total rencana anggaran</p><p className="farm-money mt-3 text-xl sm:text-2xl">{money(total)}</p></div></section>
 <section className="mt-9"><h2 className="farm-section-title">Menu utama</h2><Link href="/anggaran" className="farm-card mt-4 flex items-center justify-between gap-3 p-5 transition-colors hover:border-[#86bc6a]"><span className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff4e7] text-2xl" aria-hidden="true">▤</span><span><strong className="block text-lg">Manajemen Anggaran</strong><span className="mt-1 block text-sm text-[#718177]">Tambah, edit, dan hitung kebutuhan pertanian.</span></span></span><span aria-hidden="true">→</span></Link></section>
 <section className="mt-9"><div className="flex items-center justify-between"><h2 className="farm-section-title">Proyek terbaru</h2><Link href="/anggaran" className="text-sm font-bold underline underline-offset-4">Lihat semua</Link></div>
 {latest?<Link href={`/anggaran/${latest.id}`} className="farm-card mt-4 block p-5"><strong className="text-lg">{latest.name}</strong><p className="mt-2 text-sm text-[#718177]">Lanjutkan mengedit anggaran →</p></Link>:<div className="farm-empty mt-4"><p className="text-lg font-bold">Belum ada proyek</p><p className="mt-2 text-sm text-[#718177]">Buat proyek pertamamu untuk mulai menyusun anggaran.</p><Link href="/anggaran/baru" className="farm-button farm-button-primary mt-5">+ Buat proyek pertama</Link></div>}
 </section>
 </main>
 <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dfe6d8] bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"><div className="mx-auto grid max-w-lg grid-cols-2"><Link href="/home" aria-current="page" className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold text-[#153f32]"><span aria-hidden="true" className="text-xl">⌂</span>Beranda</Link><Link href="/anggaran" className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-[#718177]"><span aria-hidden="true" className="text-xl">▤</span>Anggaran</Link></div></nav>
 </div>;
}