import { FarmPageTemplate } from "@/components/farm-template";
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import FarmIcon from '@/components/farm-icon';
import Image from 'next/image';
export const dynamic='force-dynamic';
export default async function Panen(){
 const db=await createClient();const {data:auth,error}=await db.auth.getClaims();if(error||!auth?.claims?.sub)redirect('/login');
 return <FarmPageTemplate title="Panen" eyebrow="Hasil usaha pertanian" subtitle="Tempat pencatatan hasil panen dan penimbangan." backHref="/home" backLabel="Beranda"><section className="farm-card mt-6 p-6 sm:p-10"><Image src="/brand/empty-harvest-photo.jpg" alt="Ilustrasi keranjang panen timun" width={360} height={270} className="mx-auto h-auto w-full max-w-[265px]"/><h2 className="mt-5 text-center text-xl font-extrabold">Pencatatan panen sedang disiapkan</h2><p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed farm-muted">Belum ada modul penyimpanan panen pada database aplikasi ini. Kami tidak menampilkan angka panen contoh sebagai hasil panen Anda.</p><div className="mt-6 flex justify-center"><Link href="/pertanian" className="farm-button farm-button-primary"><FarmIcon name="sprout" size={18}/> Lihat proyek pertanian</Link></div></section></FarmPageTemplate>;
}