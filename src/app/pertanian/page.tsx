import { FarmPageTemplate, FarmActionLink } from "@/components/farm-template";
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import FarmIcon from '@/components/farm-icon';
import Image from 'next/image';
export const dynamic='force-dynamic';
export default async function Pertanian(){
 const db=await createClient();const {data:auth,error}=await db.auth.getClaims();if(error||!auth?.claims?.sub)redirect('/login');
 const {data:projects,error:projectError}=await db.from('farm_projects').select('id,name,crop,area_tumbak').order('created_at',{ascending:false});
 if(projectError)throw new Error('Tidak dapat memuat proyek pertanian');
 return <FarmPageTemplate title="Pertanian" eyebrow="Kelola usaha tani" subtitle="Daftar proyek dan tanaman yang benar-benar tercatat." backHref="/home" backLabel="Beranda" actions={<FarmActionLink href="/anggaran/baru">+ Tambah proyek</FarmActionLink>}>
 <section className="mt-6 grid gap-3 sm:grid-cols-2">{projects?.length?projects.map(p=><Link href={`/anggaran/${p.id}`} key={p.id} className="farm-card flex items-start gap-3 p-5"><span className="farm-icon"><FarmIcon name="sprout"/></span><span className="min-w-0 flex-1"><strong className="block text-lg">{p.name}</strong><span className="mt-1 block text-sm farm-muted">{p.crop||'Komoditas belum diisi'} · {Number(p.area_tumbak||0).toLocaleString('id-ID')} tumbak</span><span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#225844]">Lihat anggaran <FarmIcon name="arrow-right" size={16}/></span></span></Link>):<div className="farm-empty sm:col-span-2"><Image src="/brand/empty-project-photo.jpg" alt="Ilustrasi bibit timun yang baru tumbuh" width={360} height={270} className="mx-auto h-auto w-full max-w-[235px] rounded-2xl"/><h2 className="mt-4 text-lg font-bold">Belum ada proyek pertanian</h2><p className="mt-2 text-sm farm-muted">Buat proyek pertama untuk mulai mencatat tanaman dan luas lahan.</p><Link href="/anggaran/baru" className="farm-button farm-button-primary mt-5"><FarmIcon name="plus" size={18}/> Buat proyek</Link></div>}</section>
 <aside className="farm-notice mt-6 text-sm">Pencatatan lahan/petak dan musim tanam terperinci sedang dikembangkan. Halaman ini hanya menampilkan data proyek yang sudah tersimpan.</aside></FarmPageTemplate>;
}