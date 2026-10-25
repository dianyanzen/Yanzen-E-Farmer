'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {createClient} from '@/lib/supabase/browser';
import FarmIcon from '@/components/farm-icon';
type Project={id:string;name:string};
type Expense={id:string;project_id:string;expense_date:string;description:string;amount:number;receipt_number:string|null;vendor:string|null;note:string|null;receipt_group:string|null;quantity:number|null;unit:string|null;unit_price:number|null};
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
 const [search,setSearch]=useState('');
 const current=expenses.filter(e=>e.project_id===projectId);
 const total=current.reduce((sum,e)=>sum+Number(e.amount),0);
 const grouped=Object.values(current.reduce<Record<string,Expense[]>>((acc,x)=>{const key=x.receipt_group??x.id;(acc[key]??=[]).push(x);return acc;},{}));
 const visible=grouped.filter(group=>group.some(e=>(e.description+' '+(e.vendor??'')+' '+(e.receipt_number??'')).toLocaleLowerCase('id').includes(search.trim().toLocaleLowerCase('id'))));
 async function add(e:FormEvent){
  e.preventDefault();if(busy)return;
  const n=Number(amount);
  if(!projectId||!description.trim()||!date||!amount.trim()||!Number.isFinite(n)||n<=0){setFailed(true);setNotice('Lengkapi proyek, tanggal, keterangan, dan jumlah biaya yang valid.');return;}
  setBusy(true);setNotice('');setFailed(false);
  try{
   const db=createClient();
   const {data,error}=await db.from('expenses').insert({project_id:projectId,expense_date:date,description:description.trim(),amount:n,vendor:vendor.trim()||null,receipt_number:receipt.trim()||null}).select('id,project_id,expense_date,description,amount,receipt_number,vendor,note,receipt_group,quantity,unit,unit_price').single();
   if(error||!data)throw error??new Error('Gagal menyimpan');
   setExpenses(old=>[data as Expense,...old]);setDescription('');setAmount('');setVendor('');setReceipt('');setNotice('Pengeluaran berhasil disimpan.');
  }catch{setFailed(true);setNotice('Pengeluaran belum tersimpan. Periksa koneksi dan coba lagi.');}
  finally{setBusy(false);}
 }
 async function remove(id:string,groupId:string|null){
  if(busy||!window.confirm(groupId?'Hapus seluruh item dalam bon ini? Pengeluaran aktual akan berkurang.':'Hapus catatan pengeluaran ini?'))return;
  setBusy(true);setNotice('');setFailed(false);
  try{
   let query=createClient().from('expenses').delete().eq('project_id',projectId);
   query=groupId?query.eq('receipt_group',groupId):query.eq('id',id);
   const {data,error}=await query.select('id');
   if(error||!data?.length)throw error??new Error('Gagal menghapus');
   const ids=new Set(data.map(x=>x.id));
   setExpenses(old=>old.filter(x=>!ids.has(x.id)));setNotice('Catatan pengeluaran berhasil dihapus.');
  }catch{setFailed(true);setNotice('Catatan belum berhasil dihapus.');}
  finally{setBusy(false);}
 }
 return <div className="mt-6 grid gap-5">
  {projects.length===0?<div className="farm-empty">Belum ada proyek. <Link href="/anggaran/baru" className="font-bold underline">Buat proyek terlebih dahulu</Link> untuk mencatat pengeluaran.</div>:<>
  <section className="farm-card p-5"><label className="farm-label" htmlFor="expense-project">Proyek pertanian</label><select id="expense-project" className="farm-input" value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="mt-5 border-t border-[#dfe6d8] pt-4"><p className="text-sm farm-muted">Total dari catatan yang ditampilkan</p><p className="farm-money mt-1 text-2xl">{money(total)}</p><p className="mt-1 text-xs farm-muted">Ringkasan sementara dari transaksi yang dimuat. Riwayat dibatasi 200 transaksi terbaru lintas proyek.</p></div></section>
  <section className="farm-card p-5"><h2 className="flex items-center gap-2 text-xl font-extrabold"><span className="farm-icon farm-icon-sm"><FarmIcon name="receipt" size={19}/></span> Catat pengeluaran</h2><p className="mt-1 text-sm farm-muted">Masukkan biaya aktual, bukan estimasi anggaran.</p><form onSubmit={add} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="farm-label">Tanggal<input required type="date" className="farm-input mt-2" value={date} onChange={e=>setDate(e.target.value)}/></label><label className="farm-label">Jumlah (Rp)<input required type="number" min="0.01" step="any" inputMode="decimal" className="farm-input mt-2" placeholder="Contoh: 150000" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="farm-label sm:col-span-2">Untuk apa?<input required maxLength={200} className="farm-input mt-2" placeholder="Contoh: Pembelian pupuk" value={description} onChange={e=>setDescription(e.target.value)}/></label><label className="farm-label">Penjual / pemasok (opsional)<input maxLength={160} className="farm-input mt-2" value={vendor} onChange={e=>setVendor(e.target.value)}/></label><label className="farm-label">Nomor bon (opsional)<input maxLength={100} className="farm-input mt-2" value={receipt} onChange={e=>setReceipt(e.target.value)}/></label><button disabled={busy} aria-busy={busy} className="farm-button farm-button-primary sm:col-span-2">{busy?<span className="farm-spinner" aria-hidden="true"/>:<FarmIcon name="check" size={18}/>} {busy?"Menyimpan...":"Simpan pengeluaran"}</button></form></section>
  {notice&&<p role="status" aria-live="polite" className={"farm-notice text-sm "+(failed?"farm-notice-error":"")}>{notice}</p>}
  <section className="farm-card p-5">
   <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">Riwayat Bon & Pengeluaran</h2><p className="mt-1 text-sm farm-muted">{current.length} item pengeluaran · {grouped.length} catatan/bon dimuat</p></div><Link href="/keuangan/bon/baru" className="farm-button farm-button-primary text-sm">+ Bon</Link></div>
   <label className="farm-label mt-4" htmlFor="expense-search">Cari transaksi / bon</label>
   <input id="expense-search" type="search" className="farm-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari barang, pemasok, atau nomor bon"/>
   <p className="mt-2 text-xs farm-muted">{visible.length} transaksi/bon cocok. Riwayat terbatas pada 200 item terbaru.</p>
   <div className="mt-4 grid gap-3">
    {visible.length?visible.map(group=>{
      const x=group[0];
      const isBon=Boolean(x.receipt_group);
      const sum=group.reduce((n,row)=>n+Number(row.amount),0);
      return <article key={x.receipt_group??x.id} className="rounded-2xl border border-[#dfe6d8] bg-white p-4">
       <div className="flex items-start justify-between gap-3"><div className="min-w-0">
        <p className="font-extrabold">{isBon?(x.receipt_number||'Bon pengeluaran'):x.description}</p>
        <p className="mt-1 text-sm farm-muted">{x.expense_date.split('-').reverse().join('/')}{x.vendor?' · '+x.vendor:''}</p>
        {isBon&&<p className="mt-1 text-xs farm-muted">{group.length} item · {group.slice(0,2).map(row=>row.description).join(', ')}{group.length>2?', ...':''}</p>}
        {!isBon&&x.receipt_number&&<p className="mt-1 text-xs farm-muted">Bon: {x.receipt_number}</p>}
       </div><strong className="farm-money shrink-0 text-right">{money(sum)}</strong></div>
       <div className="mt-4 flex flex-wrap gap-2"><Link href={'/keuangan/bon/'+(x.receipt_group??x.id)} className="farm-button farm-button-primary text-sm"><FarmIcon name="receipt" size={17}/> Lihat / Cetak Bon</Link><button type="button" disabled={busy} onClick={()=>remove(x.id,x.receipt_group)} className="farm-button farm-button-danger text-sm">Hapus</button></div>
      </article>;
    }):<div className="farm-empty">{current.length===0&&<Image src="/brand/empty-expense-photo.jpg" alt="Ilustrasi bon pengeluaran" width={360} height={270} className="mx-auto h-auto w-full max-w-[220px]"/>}<p className="mt-2 text-sm">{current.length===0?'Belum ada pengeluaran untuk proyek ini.':'Tidak ada bon atau transaksi yang cocok dengan pencarian.'}</p></div>}
   </div>
  </section>
  </>}
 </div>;
}