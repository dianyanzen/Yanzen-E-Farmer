'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';
import FarmIcon from '@/components/farm-icon';

export default function DuplicateProject({projectId,projectName,itemCount}:{projectId:string;projectName:string;itemCount:number}){
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [name,setName]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function submit(e:FormEvent){
  e.preventDefault();if(busy)return;
  if(!name.trim()||name.trim().length>160){setError('Nama proyek wajib diisi (maksimal 160 karakter).');return;}
  setBusy(true);setError('');
  try{
   const {data,error:rpcError}=await createClient().rpc('duplicate_farm_project',{source_project_id:projectId,new_name:name.trim()});
   if(rpcError||typeof data!=='string')throw rpcError??new Error('Duplikasi gagal');
   router.push('/anggaran/'+data);router.refresh();
  }catch{setError('Gagal menduplikasi proyek. Tidak ada proyek baru yang disimpan jika proses gagal. Silakan coba lagi.');setBusy(false);}
 }
 return <><button type="button" className="farm-button farm-button-secondary" onClick={()=>{setName(projectName+' - Salinan');setError('');setOpen(true);}}>Duplikasi proyek</button>
 {open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="duplicate-title" className="farm-card w-full max-w-md p-6 shadow-xl"><h2 id="duplicate-title" className="text-xl font-extrabold">Duplikasi proyek</h2><p className="mt-2 text-sm farm-muted">Buat proyek baru dengan jenis tanaman, luas lahan, dan {itemCount} komponen anggaran yang sama. Pengeluaran tidak ikut disalin.</p><form onSubmit={submit} className="mt-5 grid gap-4"><label className="farm-label">Nama proyek baru<input autoFocus required maxLength={160} className="farm-input mt-2" value={name} onChange={e=>setName(e.target.value)}/></label>{error&&<p role="alert" className="farm-notice farm-notice-error text-sm">{error}</p>}<div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} onClick={()=>setOpen(false)} className="farm-button farm-button-secondary">Batal</button><button disabled={busy} aria-busy={busy} className="farm-button farm-button-primary">{busy?<span className="farm-spinner" aria-hidden="true"/>:<FarmIcon name="plus" size={18}/>} {busy?'Menduplikasi...':'Buat salinan'}</button></div></form></section></div>}</>;
}