'use client';
import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/browser';

export default function Login(){
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setMessage('');
  const supabase=createClient();
  try{
   if(mode==='signup'){
    const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/login'}});
    if(error)throw error;
    if(!data.session){setMessage('Pendaftaran diterima. Periksa email untuk konfirmasi akun, lalu masuk.');return;}
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)throw error;
   }
   const {error:importError}=await supabase.rpc('import_timun_part3');
   if(importError){setMessage('Berhasil masuk, tetapi impor anggaran belum selesai. Coba masuk kembali.');return;}
   window.location.assign('/dashboard');
  }catch{setMessage(mode==='signup'?'Pendaftaran gagal. Periksa email, kekuatan kata sandi, atau coba masuk jika sudah terdaftar.':'Login gagal. Periksa email, kata sandi, dan konfirmasi email.');}
  finally{setBusy(false);}
 }
 return <main className="mx-auto mt-12 max-w-md rounded-2xl bg-white p-8 shadow-sm">
 <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-700">Yanzen E-Farmer</p>
 <h1 className="text-3xl font-bold">{mode==='login'?'Masuk ke akun':'Buat akun pemilik'}</h1>
 <p className="mb-6 mt-2 text-sm text-slate-600">Kelola anggaran Timun Part 3 dengan aman di cloud. Setelah login, anggaran awal 24 item akan disiapkan otomatis untuk akunmu.</p>
 <form onSubmit={submit} className="grid gap-4">
 <label className="text-sm font-medium">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3"/></label>
 <label className="text-sm font-medium">Kata sandi<input required type="password" minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3"/></label>
 <button disabled={busy} className="rounded-lg bg-emerald-800 p-3 font-semibold text-white disabled:opacity-50">{busy?'Memproses...':mode==='login'?'Masuk & siapkan anggaran':'Daftar akun'}</button>
 </form>
 {message&&<p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
 <button type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}} className="mt-6 text-sm font-semibold text-emerald-800 underline">{mode==='login'?'Belum punya akun? Daftar':'Sudah punya akun? Masuk'}</button>
 </main>;
}
