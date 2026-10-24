'use client';
import {useState,type FormEvent} from 'react';
import {createClient} from '@/lib/supabase/browser';
type Project={id:string;name:string};
type Expense={id:string;project_id:string;expense_date:string;description:string;amount:number;receipt_number:string|null;vendor:string|null;note:string|null};
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export default function ExpenseManager({projects,initialExpenses}:{projects:Project[];initialExpenses:Expense[]}){
 const [expenses,setExpenses]=useState(initialExpenses);
 const [projectId,setProjectId]=useState(projects[0]?.id??'');
 const [description,setDescription]=useState('');
 const [amount,setAmount]=useState('');
 const [date,setDate]=useState(()=>new Date().toLocaleDateString('sv-SE'));
 const [vendor,setVendor]=useState('');
 const [receipt,setReceipt]=useState('');
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [failed,setFailed]=useState(false);
 const current=expenses.filter(e=>e.project_id===projectId);
 const total=current.reduce((sum,e)=>sum+Number(e.amount),0);
 async function add(e:FormEvent){
  e.preventDefault();if(busy)return;
  const n=Number(amount);
  if(!projectId||!description.trim()||!date||!amount.trim()||!Number.isFinite(n)||n<=0){setFailed(true);setNotice('Lengkapi proyek, tanggal, keterangan, dan jumlah biaya yang valid.');return;}
  setBusy(true);setNotice('');setFailed(false);
  try{
   const db=createClient();
   const {data,error}=await db.from('expenses').insert({project_id:projectId,expense_date:date,description:description.trim(),amount:n,vendor:vendor.trim()||null,receipt_number:receipt.trim()||null}).select('id,project_id,expense_date,description,amount,receipt_number,vendor,note').single();
   if(error||!data)throw error??new Error('Gagal menyimpan');
   setExpenses(old=>[data as Expense,...old]);setDescription('');setAmount('');setVendor('');setReceipt('');setNotice('Pengeluaran berhasil disimpan.');
  }catch{setFailed(true);setNotice('Pengeluaran belum tersimpan. Periksa koneksi dan coba lagi.');}
  finally{setBusy(false);}
 }
 async function remove(id:string){
  if(busy||!window.confirm('Hapus catatan pengeluaran ini?'))return;
  setBusy(true);setNotice('');setFailed(false);
  try{
   const {data,error}=await createClient().from('expenses').delete().eq('id',id).eq('project_id',projectId).select('id').single();
   if(error||!data)throw error??new Error('Gagal menghapus');
   setExpenses(old=>old.filter(x=>x.id!==id));setNotice('Catatan pengeluaran dihapus.');
  }catch{setFailed(true);setNotice('Catatan belum berhasil dihapus.');}
  finally{setBusy(false);}
 }
 return <div className="mt-6 grid gap-5">
  {projects.length===0?<div className="farm-empty">Belum ada proyek. <a href="/anggaran/baru" className="font-bold underline">Buat proyek terlebih dahulu</a> untuk mencatat pengeluaran.</div>:<>
  <section className="farm-card p-5"><label className="farm-label" htmlFor="expense-project">Proyek pertanian</label><select id="expense-project" className="farm-input" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="mt-5 border-t border-[#dfe6d8] pt-4"><p className="text-sm text-[#718177]">Total dari catatan yang ditampilkan</p><p className="farm-money mt-1 text-2xl">{money(total)}</p><p className="mt-1 text-xs text-[#718177]">Ringkasan sementara dari transaksi yang dimuat. Riwayat dibatasi 200 transaksi terbaru lintas proyek.</p></div></section>
  <section className="farm-card p-5"><h2 className="text-xl font-extrabold">+ Catat pengeluaran</h2><p className="mt-1 text-sm text-[#718177]">Masukkan biaya aktual, bukan estimasi anggaran.</p><form onSubmit={add} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="farm-label">Tanggal<input required type="date" className="farm-input mt-2" value={date} onChange={e=>setDate(e.target.value)}/></label><label className="farm-label">Jumlah (Rp)<input required type="number" min="0.01" step="any" inputMode="decimal" className="farm-input mt-2" placeholder="Contoh: 150000" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="farm-label sm:col-span-2">Untuk apa?<input required maxLength={200} className="farm-input mt-2" placeholder="Contoh: Pembelian pupuk" value={description} onChange={e=>setDescription(e.target.value)}/></label><label className="farm-label">Penjual / pemasok (opsional)<input maxLength={160} className="farm-input mt-2" value={vendor} onChange={e=>setVendor(e.target.value)}/></label><label className="farm-label">Nomor bon (opsional)<input maxLength={100} className="farm-input mt-2" value={receipt} onChange={e=>setReceipt(e.target.value)}/></label><button disabled={busy} className="farm-button farm-button-primary sm:col-span-2">{busy?'Menyimpan...':'Simpan pengeluaran'}</button></form></section>
  {notice&&<p role="status" aria-live="polite" className={"rounded-xl p-4 text-sm "+(failed?'bg-red-50 text-red-800':'bg-[#eff4e7] text-[#153f32]')}>{notice}</p>}
  <section className="farm-card p-5"><h2 className="text-xl font-extrabold">Riwayat pengeluaran</h2><p className="mt-1 text-sm text-[#718177]">{current.length} catatan dimuat</p><div className="mt-4 grid gap-3">{current.length?current.map(x=><article key={x.id} className="rounded-xl border border-[#dfe6d8] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{x.description}</p><p className="mt-1 text-sm text-[#718177]">{x.expense_date}{x.vendor?' · '+x.vendor:''}</p>{x.receipt_number&&<p className="mt-1 text-xs text-[#718177]">Bon: {x.receipt_number}</p>}</div><strong className="farm-money text-right">{money(Number(x.amount))}</strong></div><button type="button" disabled={busy} onClick={()=>remove(x.id)} className="mt-3 min-h-11 text-sm font-semibold text-red-700">Hapus catatan</button></article>):<p className="farm-empty">Belum ada pengeluaran untuk proyek ini.</p>}</div></section>
  </>}
 </div>;
}