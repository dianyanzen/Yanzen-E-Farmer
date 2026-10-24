import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export default async function Home(){
 const db=await createClient();const {data,error}=await db.auth.getClaims();
 if(error||!data?.claims?.sub)redirect('/login');
 const {data:projects,error:pError}=await db.from('farm_projects').select('id,name,area_tumbak').order('created_at',{ascending:false});
 if(pError)throw new Error('Gagal memuat proyek');
 const ids=(projects??[]).map(p=>p.id);
 const {data:items,error:iError}=ids.length?await db.from('budget_items').select('project_id,quantity,unit_price').in('project_id',ids):{data:[],error:null};
 if(iError)throw new Error('Gagal memuat anggaran');
 const total=(items??[]).reduce((sum,i)=>sum+Number(i.quantity)*Number(i.unit_price),0);
 const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
 return <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
 <header className="flex items-center justify-between gap-4"><Link href="/home" className="text-xl font-bold text-emerald-900">🌱 Yanzen E-Farmer</Link><form action="/auth/signout" method="post"><button className="rounded-lg border px-4 py-2 text-sm">Keluar</button></form></header>
 <section className="mt-12"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Beranda</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Selamat datang di kebunmu</h1><p className="mt-3 text-slate-600">Kelola rencana biaya pertanian dari satu tempat.</p></section>
 <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-5"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Proyek pertanian</p><p className="mt-2 text-3xl font-bold">{projects?.length??0}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total rencana anggaran</p><p className="mt-2 break-words text-xl font-bold sm:text-3xl">{money(total)}</p></div></section>
 <h2 className="mt-10 text-xl font-bold">Menu utama</h2><Link href="/anggaran" className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm hover:border-emerald-500"><span><strong className="text-lg">Manajemen Anggaran</strong><span className="mt-1 block text-sm text-slate-600">Buat proyek, tambah kebutuhan, dan kelola rencana biaya.</span></span><span aria-hidden="true">→</span></Link>
 <h2 className="mt-10 text-xl font-bold">Proyek terakhir</h2>{projects?.length?<Link href={`/anggaran/${projects[0].id}`} className="mt-4 block rounded-2xl bg-white p-5 shadow-sm"><strong>{projects[0].name}</strong><p className="mt-1 text-sm text-slate-500">Buka dan kelola anggaran →</p></Link>:<div className="mt-4 rounded-2xl border border-dashed p-6"><p>Belum ada proyek pertanian.</p><Link href="/anggaran/baru" className="mt-3 inline-block font-semibold text-emerald-800 underline">Buat proyek pertama →</Link></div>}
 </main>;
}