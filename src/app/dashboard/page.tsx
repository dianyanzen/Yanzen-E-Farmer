import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import BudgetEditor from './budget-editor';
export const dynamic='force-dynamic';
type Project={id:string;name:string;crop:string;area_tumbak:number};
type Item={id:string;project_id:string;name:string;category:string;quantity:number;unit:string;unit_price:number};
export default async function Dashboard(){
 const db=await createClient();
 const {data:auth,error:authError}=await db.auth.getClaims();
 if(authError||!auth?.claims?.sub)redirect('/login');
 const [{data:projects,error:pError},{data:items,error:iError}]=await Promise.all([
  db.from('farm_projects').select('id,name,crop,area_tumbak').order('created_at',{ascending:false}),
  db.from('budget_items').select('id,project_id,name,category,quantity,unit,unit_price').order('created_at',{ascending:true})
 ]);
 if(pError||iError)throw new Error('Gagal memuat anggaran dari Supabase');
 return <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
 <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Yanzen E-Farmer</p><h1 className="mt-1 text-3xl font-bold">Manajemen Anggaran Pertanian</h1></div><form action="/auth/signout" method="post"><button className="rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold">Keluar</button></form></header>
 {(projects??[]).length===0?<section className="rounded-xl bg-amber-50 p-6"><h2 className="font-bold">Belum ada proyek</h2><p className="mt-2 text-sm">Silakan keluar dan masuk kembali untuk mengimpor anggaran Timun Part 3.</p></section>:<BudgetEditor projects={(projects??[]) as Project[]} initialItems={(items??[]) as Item[]}/>}
 </main>;
}
