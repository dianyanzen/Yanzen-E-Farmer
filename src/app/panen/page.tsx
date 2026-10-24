import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import FarmIcon from '@/components/farm-icon';
import Image from 'next/image';
export const dynamic='force-dynamic';
export default async function Panen(){
 const db=await createClient();const {data:auth,error}=await db.auth.getClaims();if(error||!auth?.claims?.sub)redirect('/login');
 return <main className="farm-page"><Link href="/home" className="text-sm font-bold text-[#225844]">← Beranda</Link><header className="mt-6"><p className="text-sm font-semibold text-[#718177]">Hasil usaha pertanian</p><h1 className="farm-section-title mt-1">Panen</h1><p className="mt-2 text-sm text-[#718177]">Tempat pencatatan hasil panen dan penimbangan.</p></header><section className="farm-card mt-6 p-6 sm:p-10"><Image src="/brand/empty-harvest.svg" alt="Ilustrasi keranjang panen" width={360} height={250} className="mx-auto h-auto w-full max-w-[265px]"/><h2 className="mt-5 text-center text-xl font-extrabold">Pencatatan panen sedang disiapkan</h2><p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-[#718177]">Belum ada modul penyimpanan panen pada database aplikasi ini. Kami tidak menampilkan angka panen contoh sebagai hasil panen Anda.</p><div className="mt-6 flex justify-center"><Link href="/pertanian" className="farm-button farm-button-primary"><FarmIcon name="sprout" size={18}/> Lihat proyek pertanian</Link></div></section></main>;
}