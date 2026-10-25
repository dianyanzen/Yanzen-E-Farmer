import Image from 'next/image';
import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import PrintBonButton from './print-bon-button';
export const dynamic='force-dynamic';
const rupiah=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
type Expense={id:string;project_id:string;expense_date:string;description:string;amount:number;quantity:number|null;unit:string|null;unit_price:number|null;receipt_number:string|null;vendor:string|null;note:string|null;receipt_group:string|null};
export default async function BonDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-fA-F-]{36}$/.test(id))notFound();
 const db=await createClient();
 const {data:auth,error:authError}=await db.auth.getClaims();
 if(authError||!auth?.claims?.sub)redirect('/login');
 const columns='id,project_id,expense_date,description,amount,quantity,unit,unit_price,receipt_number,vendor,note,receipt_group';
 const result=await db.from('expenses').select(columns).eq('receipt_group',id).order('line_position',{ascending:true,nullsFirst:false}).order('created_at',{ascending:true}).limit(100);
 const {error}=result;let rows=result.data;
 if(error)throw new Error('Gagal membaca bon pengeluaran');
 if(!rows?.length){
  const single=await db.from('expenses').select(columns).eq('id',id).maybeSingle();
  if(single.error)throw new Error('Gagal membaca catatan pengeluaran');
  rows=single.data?[single.data]:[];
 }
 if(!rows.length)notFound();
 const items=rows as Expense[];
 const first=items[0];
 const {data:project,error:pError}=await db.from('farm_projects').select('id,name,crop,area_tumbak').eq('id',first.project_id).maybeSingle();
 if(pError||!project)notFound();
 const subtotal=items.reduce((s,x)=>s+Number(x.amount),0);
 const date=first.expense_date.split('-').reverse().join('/');
 const bonNumber=first.receipt_number||('BON-'+first.expense_date.replaceAll('-','')+'-'+id.slice(0,8).toUpperCase());
 return <main className="farm-page max-w-3xl print:!m-0 print:!w-full print:!max-w-full print:!p-0">
  <div className="receipt-screen-tools mb-6 flex flex-wrap items-center justify-between gap-3">
   <Link href="/keuangan" className="text-sm font-bold text-[#225844]">← Riwayat Keuangan</Link>
   <PrintBonButton/>
  </div>
  <div id="farm-receipt-paper" className="mx-auto max-w-xl rounded-[24px] border border-[#dfe6d8] bg-white px-5 py-8 shadow-sm sm:px-9 print:!max-w-full print:!rounded-none print:!border-0 print:!p-0 print:!shadow-none">
   <header className="border-b-2 border-dashed border-[#acc0ad] pb-6 text-center">
    <Image src="/brand/yanzen-mark.svg" width={54} height={54} className="mx-auto" alt="Logo Yanzen E-Farmer"/>
    <p className="mt-3 text-lg font-black tracking-tight">YANZEN E-FARMER</p>
    <h1 className="mt-1 text-base font-extrabold uppercase tracking-[.12em]">Bon Pengeluaran</h1>
    <p className="mt-2 text-xs text-[#718177]">Dokumen pencatatan internal pertanian</p>
   </header>
   <dl className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 text-sm">
    <dt className="text-[#718177]">Nomor bon</dt><dd className="max-w-56 break-all text-right font-bold">{bonNumber}</dd>
    <dt className="text-[#718177]">Tanggal</dt><dd className="text-right font-semibold">{date}</dd>
    <dt className="text-[#718177]">Proyek</dt><dd className="text-right font-semibold">{project.name}</dd>
    <dt className="text-[#718177]">Komoditas</dt><dd className="text-right">{project.crop}</dd>
    {first.vendor&&<><dt className="text-[#718177]">Pemasok / Toko</dt><dd className="text-right font-semibold">{first.vendor}</dd></>}
   </dl>
   <div className="my-6 border-t-2 border-dashed border-[#acc0ad]"/>
   <section aria-label="Rincian pengeluaran">
    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#51745e]">Rincian Barang & Biaya</h2>
    <div className="grid gap-4">
     {items.map((x,i)=><article key={x.id} className="border-b border-[#e4e9df] pb-3 text-sm">
      <div className="flex items-start justify-between gap-4"><strong className="leading-snug">{i+1}. {x.description}</strong><strong className="shrink-0 tabular-nums">{rupiah(Number(x.amount))}</strong></div>
      <p className="mt-1 pl-4 text-xs text-[#718177]">{x.quantity!=null&&x.unit_price!=null?Number(x.quantity).toLocaleString('id-ID')+' '+(x.unit||'item')+' × '+rupiah(Number(x.unit_price)):'1 pengeluaran'}</p>
     </article>)}
    </div>
   </section>
   <div className="mt-5 flex justify-between gap-3 rounded-xl bg-[#eff4e7] px-4 py-4 text-base font-black print:!rounded-none print:!bg-white print:!border-t-2 print:!border-[#103e32] print:!px-0"><span>TOTAL</span><span className="tabular-nums">{rupiah(subtotal)}</span></div>
   {first.note&&<div className="mt-5 text-sm"><p className="font-bold">Catatan</p><p className="mt-1 whitespace-pre-wrap text-[#718177]">{first.note}</p></div>}
   <div className="mt-10 grid grid-cols-2 gap-5 text-center text-xs">
    <div><p>Dibuat oleh,</p><div className="mt-14 border-t border-[#cbd9c8] pt-2">(...........................)</div></div>
    <div><p>Diterima / Diketahui,</p><div className="mt-14 border-t border-[#cbd9c8] pt-2">(...........................)</div></div>
   </div>
   <footer className="mt-8 border-t border-dashed border-[#acc0ad] pt-4 text-center text-[11px] leading-relaxed text-[#718177]">
    Tersimpan di Yanzen E-Farmer. Bon ini merupakan rekaman pengeluaran internal, bukan bukti pembayaran resmi dari pemasok.
   </footer>
  </div>
 </main>;
}
