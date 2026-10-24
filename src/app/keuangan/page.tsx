import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ExpenseManager from './expense-manager';
export const dynamic='force-dynamic';
export default async function Keuangan(){
 const db=await createClient();
 const {data:auth,error:authError}=await db.auth.getClaims();
 if(authError||!auth?.claims?.sub)redirect('/login');
 const {data:projects,error:projectError}=await db.from('farm_projects').select('id,name').order('created_at',{ascending:false});
 if(projectError)throw new Error('Tidak dapat memuat proyek');
 const {data:expenses,error:expenseError}=await db.from('expenses').select('id,project_id,expense_date,description,amount,receipt_number,vendor,note').order('expense_date',{ascending:false}).limit(200);
 if(expenseError)throw new Error('Tidak dapat memuat pengeluaran');
 return <main className="farm-page"><Link href="/home" className="text-sm font-bold text-[#225844]">← Beranda</Link><div className="mt-6"><p className="text-sm font-semibold text-[#718177]">Yanzen E-Farmer / Keuangan</p><h1 className="farm-section-title mt-1">Pengeluaran aktual</h1><p className="mt-2 text-sm text-[#718177]">Catat biaya yang benar-benar dibayar. Data ini terpisah dari rencana anggaran.</p></div><ExpenseManager projects={projects??[]} initialExpenses={expenses??[]}/></main>;
}