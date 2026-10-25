import { FarmPageTemplate } from "@/components/farm-template";
import Link from 'next/link';
import Image from 'next/image';
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
 const {data:expenses,error:expenseError}=await db.from('expenses').select('id,project_id,expense_date,description,amount,receipt_number,vendor,note,receipt_group,quantity,unit,unit_price').order('expense_date',{ascending:false}).limit(200);
 if(expenseError)throw new Error('Tidak dapat memuat pengeluaran');
 return <FarmPageTemplate title="Pengeluaran aktual" eyebrow="Keuangan" subtitle="Catat biaya yang benar-benar dibayar. Data ini terpisah dari rencana anggaran." backHref="/home" backLabel="Beranda"><section className="farm-hero relative mt-6 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"><div className="relative z-10"><span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#d8ecbb]">Fitur unggulan</span><h2 className="mt-3 text-2xl font-extrabold">Buat Bon / Struk Pengeluaran</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-[#e1efdf]">Satu bon bisa memuat banyak barang, menghitung subtotal dan total otomatis, lalu dicetak atau disimpan sebagai PDF.</p><Link href="/keuangan/bon/baru" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#d8ecbb] px-5 font-bold text-[#153f32] hover:bg-white">+ Buat Bon Baru</Link></div><Image src="/brand/bon-pengeluaran-premium.svg" alt="" aria-hidden="true" width={390} height={300} className="pointer-events-none absolute -bottom-16 -right-16 hidden w-[390px] opacity-90 lg:block"/><div aria-hidden="true" className="farm-hero-hill"/><div aria-hidden="true" className="farm-hero-hill farm-hero-hill-back"/></section><ExpenseManager projects={projects??[]} initialExpenses={expenses??[]}/></FarmPageTemplate>;
}