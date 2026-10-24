'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase/browser';
type Project={id:string;name:string;crop:string;area_tumbak:number};
type Item={id:string;project_id:string;name:string;category:string;quantity:number;unit:string;unit_price:number};
const money=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const field='w-full min-w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none';
export default function BudgetEditor({projects,initialItems}:{projects:Project[];initialItems:Item[]}){
 const [items,setItems]=useState(initialItems);
 const [selected,setSelected]=useState(projects[0]?.id??'');
 const [draft,setDraft]=useState({name:'',category:'Lainnya',quantity:'1',unit:'unit',unit_price:''});
 const [dirty,setDirty]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState(false);
 useEffect(()=>{if(dirty.length===0)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty.length]);
 const current=items.filter(x=>x.project_id===selected);
 const project=projects.find(x=>x.id===selected);
 const total=useMemo(()=>current.reduce((a,x)=>a+Number(x.quantity)*Number(x.unit_price),0),[current]);
 function edit(id:string,key:keyof Item,value:string){
  setItems(old=>old.map(x=>x.id===id?{...x,[key]:key==='quantity'||key==='unit_price'?Number(value):value}:x));
  setDirty(old=>old.includes(id)?old:[...old,id]);setMessage('');
 }
 async function save(){
  if(!selected||busy)return;
  const changed=items.filter(x=>dirty.includes(x.id));
  if(changed.some(x=>!x.name.trim()||!x.category.trim()||!x.unit.trim()||!Number.isFinite(x.quantity)||x.quantity<0||!Number.isFinite(x.unit_price)||x.unit_price<0)){setError(true);setMessage('Periksa kolom yang kosong atau nilai negatif.');return;}
  setBusy(true);setMessage('');setError(false);
  const db=createClient();
  try{
   for(const x of changed){
    const {error:e}=await db.from('budget_items').update({name:x.name.trim(),category:x.category.trim(),quantity:x.quantity,unit:x.unit.trim(),unit_price:x.unit_price}).eq('id',x.id).eq('project_id',selected).select('id').single();
    if(e)throw e;
    setDirty(old=>old.filter(id=>id!==x.id));
   }
   setMessage('Perubahan anggaran berhasil disimpan ke Supabase.');
  }catch{setError(true);setMessage('Sebagian perubahan belum tersimpan. Periksa koneksi lalu klik Simpan lagi.');}
  finally{setBusy(false);}
 }
 async function add(event:React.FormEvent){
  event.preventDefault();if(busy||!selected)return;
  const qty=Number(draft.quantity),price=Number(draft.unit_price);
  if(!draft.name.trim()||!draft.category.trim()||!draft.unit.trim()||!Number.isFinite(qty)||qty<0||!Number.isFinite(price)||price<0){setError(true);setMessage('Isi semua kolom dengan angka valid.');return;}
  setBusy(true);setMessage('');setError(false);
  const {data,error:e}=await createClient().from('budget_items').insert({project_id:selected,name:draft.name.trim(),category:draft.category.trim(),quantity:qty,unit:draft.unit.trim(),unit_price:price}).select('id,project_id,name,category,quantity,unit,unit_price').single();
  if(e||!data){setError(true);setMessage('Gagal menambahkan kebutuhan.');}else{setItems(old=>[...old,data as Item]);setDraft({name:'',category:'Lainnya',quantity:'1',unit:'unit',unit_price:''});setMessage('Kebutuhan berhasil ditambahkan.');}
  setBusy(false);
 }
 async function remove(id:string){
  if(busy||!window.confirm('Hapus kebutuhan ini dari anggaran?'))return;
  setBusy(true);setMessage('');setError(false);
  const {error:e}=await createClient().from('budget_items').delete().eq('id',id).eq('project_id',selected).select('id').single();
  if(e){setError(true);setMessage('Gagal menghapus kebutuhan.');}else{setItems(old=>old.filter(x=>x.id!==id));setDirty(old=>old.filter(x=>x!==id));setMessage('Kebutuhan dihapus.');}
  setBusy(false);
 }
 return <div className="space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Editor Anggaran</h2><p className="text-sm text-slate-500">Tambah kebutuhan melalui formulir, lalu edit rincian langsung pada tabel di bawah.</p></div><label className="text-sm font-semibold">Proyek<select className={'ml-2 '+field} value={selected} onChange={e=>{if(dirty.length&&!window.confirm('Ada perubahan belum disimpan. Pindah proyek dan batalkan perubahan?'))return;setSelected(e.target.value);setDirty([]);setMessage('')}}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
 <div className="grid gap-4 sm:grid-cols-3">
 <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total anggaran rencana</p><p className="mt-2 text-2xl font-bold">{money(total)}</p></div>
 <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Jumlah kebutuhan</p><p className="mt-2 text-2xl font-bold">{current.length} item</p></div>
 <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Biaya per tumbak</p><p className="mt-2 text-2xl font-bold">{project?.area_tumbak?money(total/Number(project.area_tumbak)):'—'}</p></div>
 </div>
 <section className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="mb-4 text-lg font-bold">Tambah kebutuhan baru</h3><form onSubmit={add} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
 <label className="text-sm lg:col-span-2">Nama kebutuhan<input required maxLength={160} className={'mt-1 '+field} placeholder="Contoh: Pupuk tambahan" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 <label className="text-sm">Kategori<input required maxLength={80} className={'mt-1 '+field} value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></label>
 <label className="text-sm">Jumlah<input required type="number" min="0" step="any" className={'mt-1 '+field} value={draft.quantity} onChange={e=>setDraft({...draft,quantity:e.target.value})}/></label>
 <label className="text-sm">Satuan<input required maxLength={40} className={'mt-1 '+field} value={draft.unit} onChange={e=>setDraft({...draft,unit:e.target.value})}/></label>
 <label className="text-sm">Harga satuan (Rp)<input required type="number" min="0" step="any" className={'mt-1 '+field} value={draft.unit_price} onChange={e=>setDraft({...draft,unit_price:e.target.value})}/></label>
 <button disabled={busy||!selected} className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2 lg:col-span-6">+ Tambah kebutuhan</button></form></section>
 <section className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h3 className="text-lg font-bold">Rincian anggaran</h3><p className="text-sm text-slate-500">Klik kolom untuk mengedit, kemudian tekan Simpan perubahan.</p></div><button onClick={save} disabled={busy||dirty.length===0} className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?'Memproses...':dirty.length?'Simpan perubahan ('+dirty.length+')':'Semua tersimpan'}</button></div>
 {message&&<p role="status" className={'mx-5 mt-4 rounded-lg p-3 text-sm '+(error?'bg-red-50 text-red-800':'bg-emerald-50 text-emerald-900')}>{message}</p>}
 <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-emerald-50"><tr><th className="p-3">No.</th><th className="p-3">Kebutuhan</th><th className="p-3">Kategori</th><th className="p-3">Jumlah</th><th className="p-3">Satuan</th><th className="p-3">Harga satuan</th><th className="p-3 text-right">Total</th><th className="p-3">Aksi</th></tr></thead><tbody>{current.map((x,i)=><tr key={x.id} className={'border-t '+(dirty.includes(x.id)?'bg-amber-50':'')}><td className="p-3">{i+1}</td><td className="p-2"><input aria-label={'Nama kebutuhan '+(i+1)} className={field} value={x.name} onChange={e=>edit(x.id,'name',e.target.value)}/></td><td className="p-2"><input aria-label={'Kategori '+(i+1)} className={field} value={x.category} onChange={e=>edit(x.id,'category',e.target.value)}/></td><td className="p-2"><input aria-label={'Jumlah '+(i+1)} className={field} type="number" min="0" step="any" value={x.quantity} onChange={e=>edit(x.id,'quantity',e.target.value)}/></td><td className="p-2"><input aria-label={'Satuan '+(i+1)} className={field} value={x.unit} onChange={e=>edit(x.id,'unit',e.target.value)}/></td><td className="p-2"><input aria-label={'Harga '+(i+1)} className={field} type="number" min="0" step="any" value={x.unit_price} onChange={e=>edit(x.id,'unit_price',e.target.value)}/></td><td className="p-3 text-right font-bold whitespace-nowrap">{money(Number(x.quantity)*Number(x.unit_price))}</td><td className="p-3"><button disabled={busy} onClick={()=>remove(x.id)} className="font-semibold text-red-700 disabled:opacity-50">Hapus</button></td></tr>)}</tbody><tfoot><tr className="border-t-2 bg-emerald-50 font-bold"><td colSpan={6} className="p-4 text-right">TOTAL ANGGARAN</td><td className="p-4 text-right whitespace-nowrap">{money(total)}</td><td/></tr></tfoot></table></div></section>
 </div>;
}
