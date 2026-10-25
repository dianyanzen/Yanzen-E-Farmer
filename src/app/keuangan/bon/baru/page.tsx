import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import NewReceiptForm from './new-receipt-form';
import FarmIcon from '@/components/farm-icon';
import Image from 'next/image';
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
    <section className="mt-6 grid items-center gap-4 overflow-hidden rounded-[24px] border border-[#dce8d4] bg-[#f0f6e9] p-4 sm:grid-cols-[1fr_175px] sm:p-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.13em] text-[#388255]">Cara cepat membuat bon</p>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight text-[#123f31]">Tiga langkah, satu struk tersimpan.</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#566c5d]">Pilih proyek dan tanggal · Tambahkan kebutuhan · Simpan untuk melihat dan mencetak bon.</p>
        <p className="mt-3 text-xs font-semibold text-[#51745e]">Pengeluaran aktual tidak mengubah anggaran rencana.</p>
      </div>
      <Image src="/brand/bon-pengeluaran-photo.jpg" alt="Ilustrasi bon pengeluaran digital" width={1100} height={825} className="hidden h-auto w-full sm:block"/>
    </section>
    <NewReceiptForm projects={projects??[]} budgetItems={budget??[]}/>
  </main>;
}
