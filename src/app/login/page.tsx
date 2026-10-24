'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FarmIcon from '@/components/farm-icon';
import { createClient } from '@/lib/supabase/browser';
export default function Login(){
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [visible,setVisible]=useState(false);
 const [message,setMessage]=useState('');
 const [failed,setFailed]=useState(false);
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setMessage('');setFailed(false);
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
   window.location.assign('/home');
  }catch{setFailed(true);setMessage(mode==='signup'?'Pendaftaran gagal. Periksa email dan kata sandi, atau coba masuk jika sudah terdaftar.':'Gagal masuk. Periksa email, kata sandi, dan konfirmasi akun.');}
  finally{setBusy(false);}
 }
 return <main className="min-h-dvh grid lg:grid-cols-2">
 <section className="farm-hero relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
 <div className="flex items-center gap-3"><Image src="/brand/yanzen-mark.svg" alt="" width={44} height={44}/><strong className="text-xl">Yanzen E-Farmer</strong></div>
 <div><p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-[#c9e3a2]">Bertani lebih terencana</p><h2 className="max-w-lg text-5xl font-extrabold leading-tight">Lebih mudah mengelola usaha pertanian.</h2><p className="mt-6 max-w-md text-lg text-[#dce9db]">Rencanakan biaya, pantau kebutuhan, dan kelola setiap proyek dari satu tempat.</p></div>
 <div className="relative z-10"><span className="farm-icon mb-4"><FarmIcon name="sprout"/></span><p className="text-sm text-[#c9e3a2]">Yanzen E-Farmer · Dibuat untuk penggunaan sehari-hari</p></div><div aria-hidden="true" className="farm-hero-hill"/><div aria-hidden="true" className="farm-hero-hill farm-hero-hill-back"/>
 </section>
 <section className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-10">
 <div className="mx-auto w-full max-w-md">
 <Link href="/" className="mb-10 inline-flex items-center gap-3"><Image src="/brand/yanzen-mark.svg" alt="Logo Yanzen E-Farmer" width={48} height={48}/><span className="text-lg font-extrabold">Yanzen E-Farmer</span></Link>
 <p className="text-sm font-bold uppercase tracking-widest text-[#51745e]">{mode==='login'?'Selamat datang kembali':'Mulai dari sini'}</p>
 <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{mode==='login'?'Masuk ke akun':'Buat akun baru'}</h1>
 <p className="mt-3 mb-8 text-[#718177]">{mode==='login'?'Lanjutkan pengelolaan pertanian dengan mudah.':'Setiap akun memiliki proyek dan anggarannya sendiri. Akun baru dimulai kosong.'}</p>
 <form onSubmit={submit} className="grid gap-5">
 <div><label htmlFor="email" className="farm-label">Alamat email</label><input id="email" required type="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)} className="farm-input"/></div>
 <div><label htmlFor="password" className="farm-label">Kata sandi</label><div className="relative"><input id="password" required type={visible?'text':'password'} minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder="Minimal 8 karakter" value={password} onChange={e=>setPassword(e.target.value)} className="farm-input pr-20"/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Sembunyikan kata sandi':'Tampilkan kata sandi'} className="absolute inset-y-0 right-2 flex min-w-11 items-center justify-center gap-1 px-3 text-sm font-semibold text-[#51745e]"><FarmIcon name={visible?'eye-off':'eye'} size={18}/><span className="sr-only">{visible?'Sembunyi':'Lihat'}</span></button></div></div>
 <button disabled={busy} aria-busy={busy} className="farm-button farm-button-primary w-full">{busy&&<span className="farm-spinner" aria-hidden="true"/>}{busy?'Memproses...':mode==='login'?'Masuk ke Beranda':'Buat akun'}</button>
 </form>
 {message&&<p role="status" aria-live="polite" className={"farm-notice mt-5 text-sm "+(failed?"farm-notice-error":"")}>{message}</p>}
 <div className="mt-7 text-center text-sm"><span className="text-[#718177]">{mode==='login'?'Belum punya akun? ':'Sudah punya akun? '}</span><button type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('');setFailed(false)}} className="font-bold text-[#153f32] underline underline-offset-4">{mode==='login'?'Daftar sekarang':'Masuk'}</button></div>
 <p className="mt-12 text-center text-xs text-[#718177]">Data proyek setiap pengguna tersimpan terpisah.</p>
 </div></section></main>;
}