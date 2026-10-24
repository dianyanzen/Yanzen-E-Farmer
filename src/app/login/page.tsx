'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
export default function Login(){
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');
    const {error}=await createClient().auth.signInWithPassword({email,password});
    setBusy(false);if(error){setMessage('Login gagal. Periksa kredensial Anda.');return}window.location.assign('/');
  }
  return <main className="mx-auto mt-20 max-w-sm rounded-2xl bg-white p-8 shadow"><h1 className="mb-2 text-2xl font-bold">Yanzen E-Farmer</h1><p className="mb-6 text-sm text-slate-600">Masuk untuk mengelola data pertanian.</p><form onSubmit={submit} className="grid gap-3"><label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border p-2"/></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded border p-2"/></label><button disabled={busy} className="rounded bg-emerald-800 p-3 text-white disabled:opacity-50">{busy?'Memproses...':'Masuk'}</button></form>{message&&<p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}</main>;
}
