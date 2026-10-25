'use client';
import {useState,useEffect,type FormEvent} from 'react';
import {useParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/browser';
import FarmIcon from '@/components/farm-icon';

export default function EditProject(){
 const {projectId}=useParams<{projectId:string}>();
 const router=useRouter();
 const [name,setName]=useState('');
 const [crop,setCrop]=useState('');
 const [area,setArea]=useState('');
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [failed,setFailed]=useState(false);
 const [original,setOriginal]=useState<{name:string;crop:string;area_tumbak:number}|null>(null);
 // Load only this user's project; RLS also enforces ownership.
 useEffect(()=>{let active=true;
 const load=async()=>{
  try{
   const db=createClient();
   const {data,error}=await db.from('farm_projects').select('name,crop,area_tumbak').eq('id',projectId).single();
   if(error||!data)throw error??new Error('Not found');
   if(!active)return;setName(data.name);setCrop(data.crop);setArea(String(data.area_tumbak));setOriginal(data);setFailed(false);
  }catch{if(active){setFailed(true);setMessage('Proyek tidak ditemukan atau tidak dapat dimuat.');}}
  finally{if(active)setLoading(false);}
 };
 void load();return()=>{active=false;};},[projectId]);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy||!original)return;
  const n=Number(area);
  if(!name.trim()||!crop.trim()||!area.trim()||!Number.isFinite(n)||n<=0){setFailed(true);setMessage('Periksa nama, tanaman, dan luas lahan.');return;}
  setBusy(true);setMessage('');setFailed(false);
  try{
   const {data,error}=await createClient().from('farm_projects').update({name:name.trim(),crop:crop.trim(),area_tumbak:n}).eq('id',projectId).select('id').single();
   if(error||!data)throw error??new Error('Gagal menyimpan');
   router.push('/anggaran/'+projectId);router.refresh();
  }catch{setFailed(true);setMessage('Perubahan belum tersimpan. Periksa koneksi dan coba lagi.');setBusy(false);}
 }
 return <main className="farm-page max-w-xl"><Link href={'/anggaran/'+projectId} className="text-sm font-semibold text-[#225844]">← Kembali ke anggaran</Link><h1 className="farm-section-title mt-6">Edit proyek pertanian</h1><p className="mt-2 text-sm farm-muted">Perbarui identitas proyek tanpa mengubah rincian anggaran.</p>
 {loading?<div className="farm-card mt-6 p-6" role="status">Memuat data proyek...</div>:original?<form onSubmit={submit} className="farm-card mt-6 grid gap-5 p-5 sm:p-7"><label className="farm-label">Nama proyek<input className="farm-input mt-2" required maxLength={160} value={name} onChange={e=>setName(e.target.value)}/></label><label className="farm-label">Jenis tanaman<input className="farm-input mt-2" required maxLength={100} value={crop} onChange={e=>setCrop(e.target.value)}/></label><label className="farm-label">Luas lahan (tumbak)<input className="farm-input mt-2" required type="number" min="0.01" step="any" inputMode="decimal" value={area} onChange={e=>setArea(e.target.value)}/></label><button disabled={busy} aria-busy={busy} className="farm-button farm-button-primary w-full">{busy?<span className="farm-spinner" aria-hidden="true"/>:<FarmIcon name="check" size={18}/>} {busy?'Menyimpan...':'Simpan perubahan'}</button></form>:null}
 {message&&<p role={failed?'alert':'status'} className={'farm-notice mt-4 '+(failed?'farm-notice-error':'')}>{message}</p>}</main>;
}