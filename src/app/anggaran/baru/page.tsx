'use client';
import {useState,type FormEvent} from 'react';import {useRouter} from 'next/navigation';import { FarmButton, FarmPageTemplate, FarmTextField } from '@/components/farm-template';import {createClient} from '@/lib/supabase/browser';import FarmIcon from '@/components/farm-icon';
export default function NewProject(){
 const router=useRouter();const [name,setName]=useState('');const [crop,setCrop]=useState('');const [area,setArea]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;const n=Number(area);if(!name.trim()||!crop.trim()||!Number.isFinite(n)||n<=0){setMessage('Isi nama, tanaman, dan luas lahan yang valid.');return;}
 setBusy(true);setMessage('');const db=createClient();const {data:auth,error:authError}=await db.auth.getUser();if(authError||!auth.user){setMessage('Sesi berakhir. Silakan login kembali.');setBusy(false);return;}
 const {data,error}=await db.from('farm_projects').insert({user_id:auth.user.id,name:name.trim(),crop:crop.trim(),area_tumbak:n}).select('id').single();
 if(error||!data){setMessage('Proyek gagal dibuat. Periksa koneksi dan coba lagi.');setBusy(false);return;}router.push('/anggaran/'+data.id);router.refresh();}
 return (
  <FarmPageTemplate
    className="farmer-new-project-page"
    title="Buat Proyek Pertanian"
    eyebrow="Anggaran"
    subtitle="Proyek baru dimulai tanpa komponen anggaran."
    backHref="/anggaran"
    backLabel="Daftar proyek"
  >
    <form onSubmit={submit} className="farmer-new-project-form">
      <FarmTextField id="project-name" label="Nama proyek" required maxLength={160}
        value={name} onChange={(e)=>setName(e.target.value)} placeholder="Contoh: Timun Part 4" />
      <FarmTextField id="project-crop" label="Jenis tanaman" required maxLength={100}
        value={crop} onChange={(e)=>setCrop(e.target.value)} placeholder="Contoh: Timun" />
      <FarmTextField id="project-area" label="Luas lahan (tumbak)" required type="number"
        inputMode="decimal" min="0.01" step="any" value={area}
        onChange={(e)=>setArea(e.target.value)} placeholder="Contoh: 1150" />
      {message && <p role="alert" className="farm-notice farm-notice-error">{message}</p>}
      <FarmButton type="submit" disabled={busy} aria-busy={busy} className="farmer-new-project-submit">
        {busy ? <span className="farm-spinner" aria-hidden="true" /> : <FarmIcon name="plus" size={18} />}
        {busy ? "Menyimpan..." : "Buat Proyek"}
      </FarmButton>
    </form>
  </FarmPageTemplate>
 );
}
