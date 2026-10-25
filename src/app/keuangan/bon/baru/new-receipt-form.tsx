'use client';
import {useRef,useMemo,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/browser';
import FarmIcon from '@/components/farm-icon';

type Project={id:string;name:string};
type BudgetRef={id:string;project_id:string;name:string;unit:string;unit_price:number};
type Line={key:string;name:string;quantity:string;unit:string;unitPrice:string;budgetRef:string};
const rupiah=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const newLine=(key:string):Line=>({key,name:'',quantity:'1',unit:'pcs',unitPrice:'',budgetRef:''});

export default function NewReceiptForm({projects,budgetItems}:{projects:Project[];budgetItems:BudgetRef[]}){
 const router=useRouter();
 const [projectId,setProjectId]=useState(projects[0]?.id??'');
 const [date,setDate]=useState(()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta'}).format(new Date()));
 const groupId=useRef('');
 const [vendor,setVendor]=useState('');
 const [receiptNumber,setReceiptNumber]=useState('');
 const [note,setNote]=useState('');
 const [lines,setLines]=useState<Line[]>([newLine('initial')]);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');

 const references=budgetItems.filter(i=>i.project_id===projectId);
 const totals=useMemo(()=>lines.map(l=>{
   const quantity=Number(l.quantity),price=Number(l.unitPrice);
   return Number.isFinite(quantity)&&Number.isFinite(price)&&quantity>0&&price>=0?Math.round((quantity*price+Number.EPSILON)*100)/100:0;
 }),[lines]);
 const total=totals.reduce((sum,n)=>sum+n,0);
 function change(key:string,patch:Partial<Line>){setLines(old=>old.map(l=>l.key===key?{...l,...patch}:l));setError('');}
 function chooseBudget(key:string,id:string){
  const item=references.find(b=>b.id===id);
  change(key,item?{budgetRef:id,name:item.name,unit:item.unit,unitPrice:String(item.unit_price)}:{budgetRef:''});
 }
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(saving)return;
  if(!projectId||!date||lines.length===0||!/^\d{4}-\d{2}-\d{2}$/.test(date)){setError('Pilih proyek dan tanggal yang benar.');return;}
  if(lines.some(l=>!l.name.trim()||!l.unit.trim()||Number(l.quantity)<=0||!Number.isFinite(Number(l.quantity))||l.unitPrice.trim()===''||Number(l.unitPrice)<0||!Number.isFinite(Number(l.unitPrice))||Number(l.quantity)*Number(l.unitPrice)>999999999999)){setError('Periksa nama, jumlah, satuan, dan harga setiap item.');return;}
  if(total<=0){setError('Total bon harus lebih dari Rp0.');return;}
  setSaving(true);setError('');
  const group=groupId.current||(groupId.current=crypto.randomUUID());
  const number=receiptNumber.trim()||('BON-'+date.replaceAll('-','')+'-'+group.slice(0,8).toUpperCase());
  const payload=lines.map((l,i)=>({
    project_id:projectId,expense_date:date,description:l.name.trim(),
    quantity:Number(l.quantity),unit:l.unit.trim(),unit_price:Number(l.unitPrice),
    amount:totals[i],line_position:i+1,budget_item_id:l.budgetRef||null,receipt_group:group,receipt_number:number,
    vendor:vendor.trim()||null,note:note.trim()||null
  }));
  try{
   const {data,error:insertError}=await createClient().rpc('farm_save_receipt',{receipt_id:group,items:payload});
   if(insertError||!data||data.length!==payload.length)throw insertError??new Error('Pencatatan tidak lengkap');
   router.push('/keuangan/bon/'+group);router.refresh();
  }catch{
   setError('Bon belum berhasil tersimpan. Periksa koneksi lalu coba lagi. Data formulir tidak dihapus.');
   setSaving(false);
  }
 }
 return projects.length===0?<div className="farm-empty mt-6"><h2 className="text-lg font-bold">Buat proyek terlebih dahulu</h2><p className="mt-2 text-sm">Bon harus terhubung ke salah satu proyek pertanian milikmu.</p><Link href="/anggaran/baru" className="farm-button farm-button-primary mt-5">Buat proyek</Link></div>:
 <form onSubmit={save} className="mt-6 grid gap-5">
  <section className="farm-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
   <div className="sm:col-span-2"><h2 className="text-lg font-extrabold">Identitas Bon</h2><p className="mt-1 text-sm farm-muted">Nomor bon dibuat otomatis jika dikosongkan.</p></div>
   <label className="farm-label">Proyek pertanian<select className="farm-input mt-2" required value={projectId} onChange={e=>{setProjectId(e.target.value);setLines(old=>old.map(x=>({...x,budgetRef:''})));}}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <label className="farm-label">Tanggal transaksi<input className="farm-input mt-2" type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>
   <label className="farm-label">Pemasok / toko<input className="farm-input mt-2" maxLength={160} placeholder="Contoh: Toko Tani Makmur" value={vendor} onChange={e=>setVendor(e.target.value)}/></label>
   <label className="farm-label">Nomor bon (opsional)<input className="farm-input mt-2" maxLength={100} placeholder="Otomatis jika kosong" value={receiptNumber} onChange={e=>setReceiptNumber(e.target.value)}/></label>
  </section>
  <section className="farm-card p-4 sm:p-6">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">Rincian Barang & Biaya</h2><p className="mt-1 text-sm farm-muted">Tambahkan beberapa kebutuhan dalam satu bon.</p></div><span className="farm-badge">{lines.length} item</span></div>
   <div className="mt-5 grid gap-4">
   {lines.map((l,i)=><article key={l.key} className="rounded-2xl border border-[#dfe6d8] bg-[#fbfcf8] p-4">
    <div className="mb-4 flex items-center justify-between"><h3 className="font-extrabold">Item {i+1}</h3>{lines.length>1&&<button type="button" onClick={()=>setLines(old=>old.filter(x=>x.key!==l.key))} disabled={saving} className="text-sm font-bold text-[#a33136]">Hapus item</button>}</div>
    {references.length>0&&<label className="farm-label">Ambil dari anggaran (opsional)<select className="farm-input mt-2" value={l.budgetRef} onChange={e=>chooseBudget(l.key,e.target.value)}><option value="">Isi manual</option>{references.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>}
    <div className="mt-3 grid gap-3 sm:grid-cols-4">
     <label className="farm-label sm:col-span-4">Nama kebutuhan<input required className="farm-input mt-2" maxLength={200} placeholder="Misalnya: Pupuk Tawon" value={l.name} onChange={e=>change(l.key,{name:e.target.value,budgetRef:''})}/></label>
     <label className="farm-label">Jumlah<input required className="farm-input mt-2" type="number" inputMode="decimal" min="0.001" step="any" value={l.quantity} onChange={e=>change(l.key,{quantity:e.target.value})}/></label>
     <label className="farm-label">Satuan<input required className="farm-input mt-2" maxLength={40} placeholder="kg, karung" value={l.unit} onChange={e=>change(l.key,{unit:e.target.value})}/></label>
     <label className="farm-label sm:col-span-2">Harga satuan (Rp)<input required className="farm-input mt-2" type="number" inputMode="decimal" min="0" step="any" placeholder="Contoh: 12000" value={l.unitPrice} onChange={e=>change(l.key,{unitPrice:e.target.value})}/></label>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-[#dfe6d8] pt-3"><span className="text-sm farm-muted">Subtotal</span><strong className="farm-money">{rupiah(totals[i])}</strong></div>
   </article>)}
   </div>
   <button type="button" disabled={saving||lines.length>=50} onClick={()=>setLines(old=>[...old,newLine(crypto.randomUUID())])} className="farm-button farm-button-secondary mt-4 w-full"><FarmIcon name="plus" size={18}/> Tambah item</button>
  </section>
  <section className="farm-card p-5 sm:p-6">
   <label className="farm-label">Catatan tambahan (opsional)<textarea className="farm-input mt-2 min-h-20 resize-y" maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Keterangan pembayaran, pengiriman, dll."/></label>
   <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#dfe6d8] pt-5"><div><p className="text-sm font-semibold farm-muted">Total Bon Pengeluaran</p><p className="text-xs farm-muted">{lines.length} item · {date||'Tanggal belum dipilih'}</p></div><strong className="farm-money text-xl sm:text-3xl">{rupiah(total)}</strong></div>
   {error&&<p className="farm-notice farm-notice-error mt-4 text-sm" role="alert">{error}</p>}
   <button type="submit" disabled={saving} aria-busy={saving} className="farm-button farm-button-primary mt-5 w-full text-base">{saving?<span className="farm-spinner"/>:<FarmIcon name="check" size={19}/>} {saving?'Menyimpan bon...':'Simpan & Lihat Struk'}</button>
   <p className="mt-3 text-center text-xs leading-relaxed farm-muted">Bon ini adalah catatan pengeluaran internal Yanzen E-Farmer, bukan nota resmi yang diterbitkan penjual.</p>
  </section>
 </form>;
}
