import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import NewReceiptForm from './new-receipt-form';
import FarmIcon from '@/components/farm-icon';
export const dynamic='force-dynamic';

export default async function NewBonPage(){
  const db=await createClient();
  const {data:auth,error:authError}=await db.auth.getClaims();
  if(authError||!auth?.claims?.sub)redirect('/login');
  const {data:projects,error:projectsError}=await db.from('farm_projects')
    .select('id,name').order('created_at',{ascending:false});
  if(projectsError)throw new Error('Gagal memuat proyek untuk bon');
  const {data:budget,error:budgetError}=await db.from('budget_items')
    .select('id,project_id,name,unit,unit_price').order('name');
  if(budgetError)throw new Error('Gagal memuat referensi anggaran');
  return <main className="farm-page max-w-4xl">
    <Link href="/keuangan" className="inline-flex items-center gap-2 text-sm font-bold text-[#225844]">← Kembali ke Keuangan</Link>
    <header className="mt-7 flex items-start gap-3">
      <span className="farm-icon"><FarmIcon name="receipt"/></span>
      <div><p className="text-sm font-semibold text-[#51745e]">Yanzen E-Farmer · Pencatatan biaya</p>
      <h1 className="farm-section-title mt-1">Buat Bon Pengeluaran</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#718177]">Satu bon untuk beberapa kebutuhan sekaligus. Total dihitung otomatis, lalu disimpan ke Supabase sebagai pengeluaran aktual.</p></div>
    </header>
    <NewReceiptForm projects={projects??[]} budgetItems={budget??[]}/>
  </main>;
}
