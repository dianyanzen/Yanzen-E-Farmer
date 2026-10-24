import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export const dynamic='force-dynamic';
const rupiah=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
type Project={id:string;name:string;crop:string;area_tumbak:number};
type Item={id:string;project_id:string;name:string;category:string;quantity:number;unit:string;unit_price:number};
export default async function Dashboard(){
 const db=await createClient();
 const {data:auth,error:authError}=await db.auth.getClaims();
 if(authError||!auth?.claims?.sub)redirect('/login');
 const {data:projects,error:pError}=await db.from('farm_projects').select('id,name,crop,area_tumbak').order('created_at',{ascending:false});
 if(pError)throw new Error('Gagal membaca proyek pertanian');
 const {data:items,error:iError}=await db.from('budget_items').select('id,project_id,name,category,quantity,unit,unit_price').order('created_at',{ascending:true});
 if(iError)throw new Error('Gagal membaca anggaran');
 const ps=(projects??[]) as Project[];const rows=(items??[]) as Item[];
 const total=rows.reduce((sum,item)=>sum+Number(item.quantity)*Number(item.unit_price),0);
 return <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
 <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Yanzen E-Farmer</p><h1 className="mt-1 text-3xl font-bold">Anggaran Pertanian</h1></div><form action="/auth/signout" method="post"><button className="rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold">Keluar</button></form></header>
 <section className="mb-7 grid gap-4 sm:grid-cols-3">
 <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total anggaran</p><p className="mt-2 text-2xl font-bold">{rupiah(total)}</p></div>
 <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Komponen biaya</p><p className="mt-2 text-2xl font-bold">{rows.length}</p></div>
 <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Luas lahan</p><p className="mt-2 text-2xl font-bold">{ps.reduce((s,p)=>s+Number(p.area_tumbak),0).toLocaleString('id-ID')} tumbak</p></div>
 </section>
 {ps.length===0?<section className="rounded-xl bg-amber-50 p-6"><h2 className="font-bold">Belum ada proyek</h2><p className="mt-2 text-sm">Silakan keluar lalu masuk kembali untuk menjalankan impor Timun Part 3 secara otomatis.</p></section>:ps.map(p=><section key={p.id} className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
 <div className="border-b p-5"><h2 className="text-xl font-bold">{p.name}</h2><p className="text-sm text-slate-500">{p.crop} · {Number(p.area_tumbak).toLocaleString('id-ID')} tumbak</p></div>
 <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-emerald-50"><tr><th className="p-3">Kebutuhan</th><th className="p-3">Kategori</th><th className="p-3 text-right">Jumlah</th><th className="p-3 text-right">Harga satuan</th><th className="p-3 text-right">Total</th></tr></thead>
 <tbody>{rows.filter(x=>x.project_id===p.id).map(x=><tr key={x.id} className="border-t"><td className="p-3 font-medium">{x.name}</td><td className="p-3">{x.category}</td><td className="p-3 text-right">{Number(x.quantity).toLocaleString('id-ID')} {x.unit}</td><td className="p-3 text-right">{rupiah(Number(x.unit_price))}</td><td className="p-3 text-right font-semibold">{rupiah(Number(x.quantity)*Number(x.unit_price))}</td></tr>)}</tbody>
 </table></div></section>)}
 </main>;
}
