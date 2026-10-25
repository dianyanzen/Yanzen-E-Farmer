import Link from 'next/link';
import Image from 'next/image';
import FarmIcon from '@/components/farm-icon';

export default function Landing(){
 return <main className="min-h-dvh bg-[#f7f8f1]">
  <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
   <Link href="/" className="flex items-center gap-3"><Image src="/brand/yanzen-mark.svg" alt="Logo Yanzen E-Farmer" width={45} height={45}/><span className="text-lg font-black tracking-tight text-[#103e32]">Yanzen E-Farmer</span></Link>
   <Link href="/login" className="farm-button farm-button-secondary text-sm">Masuk <FarmIcon name="arrow-right" size={17}/></Link>
  </header>
  <section className="mx-auto grid max-w-6xl items-center gap-9 px-5 pb-16 pt-7 sm:px-8 md:grid-cols-[1.08fr_.92fr] md:gap-12 md:pb-24 md:pt-20">
   <div className="relative z-10">
    <span className="inline-flex items-center gap-2 rounded-full border border-[#cbdcc2] bg-white px-4 py-2 text-xs font-extrabold text-[#225844]"><FarmIcon name="sprout" size={18}/> Smart Farming · Simple & Personal</span>
    <h1 className="mt-7 max-w-xl text-[clamp(2.65rem,6vw,4.9rem)] font-black leading-[1.05] tracking-[-.045em] text-[#103e32]">Pertanian lebih <span className="text-[#387c55]">terencana.</span> Usaha lebih tertata.</h1>
    <p className="mt-6 max-w-xl text-base leading-relaxed text-[#587166] sm:text-lg">Kelola proyek lahan, rencanakan anggaran, catat pengeluaran, dan buat bon yang bisa dicetak. Semuanya dalam satu aplikasi sederhana dan nyaman digunakan di HP.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="farm-button farm-button-primary min-h-12 px-7">Mulai Kelola Kebun <FarmIcon name="arrow-right" size={18}/></Link><Link href="#fitur" className="farm-button farm-button-secondary min-h-12 px-6">Lihat Fitur</Link></div>
    <p className="mt-5 text-xs font-medium text-[#718177]">Akun pribadi · Penyimpanan cloud · Data pengeluaran terpisah dari anggaran</p>
   </div>
   <div className="farm-hero relative isolate overflow-hidden rounded-[32px] p-5 text-white shadow-[0_25px_65px_rgba(16,62,50,.16)] sm:p-8">
    <div className="relative z-10"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold"><FarmIcon name="sprout" size={16}/> Yanzen E-Farmer</span><span className="text-xs text-[#d8ecbb]">Ekosistem Tani</span></div>
     <h2 className="mt-12 max-w-xs text-3xl font-black leading-tight tracking-tight sm:mt-20">Setiap pengeluaran tercatat. Setiap rencana terukur.</h2>
     <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#dce9db]">Satu ruang kerja untuk anggaran, bon pengeluaran, dan perjalanan usaha tani.</p>
     <div className="mt-9 grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-white/15 bg-white/15 p-4 backdrop-blur-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8ecbb] text-[#153f32]"><FarmIcon name="calculator"/></span><strong className="mt-4 block">Anggaran</strong><span className="mt-1 block text-xs text-[#dce9db]">Rencana biaya otomatis</span></div>
      <div className="rounded-2xl border border-white/15 bg-white/15 p-4 backdrop-blur-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8ecbb] text-[#153f32]"><FarmIcon name="receipt"/></span><strong className="mt-4 block">Bon & Struk</strong><span className="mt-1 block text-xs text-[#dce9db]">Simpan, cetak, dan arsipkan</span></div>
     </div>
    </div>
    <Image src="/brand/farm-sunrise-premium.svg" alt="" width={460} height={325} className="pointer-events-none absolute -right-24 -top-6 w-[430px] opacity-20" aria-hidden="true"/><div aria-hidden="true" className="farm-hero-hill"/><div aria-hidden="true" className="farm-hero-hill farm-hero-hill-back"/>
   </div>
  </section>
  <section id="bon-unggulan" className="border-y border-[#dce8d7] bg-[#edf4e7] px-5 py-14 sm:px-8 sm:py-20">
   <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[.96fr_1.04fr] lg:gap-14">
    <div className="order-2 lg:order-1">
     <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wide text-[#245b40] shadow-sm"><FarmIcon name="receipt" size={17}/> FITUR UTAMA · BON PENGELUARAN</div>
     <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight tracking-tight text-[#103e32] sm:text-5xl">Setiap belanja kebun, <span className="text-[#387c55]">ada buktinya.</span></h2>
     <p className="mt-5 max-w-xl text-base leading-relaxed text-[#526d5b]">Buat bon pengeluaran dari HP, masukkan beberapa barang sekaligus, hitung total otomatis, dan simpan sebagai arsip digital. Bon dapat dicetak atau dijadikan PDF melalui browser.</p>
     <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[#245b40]"><span className="rounded-full border border-[#bad6b2] bg-white px-3 py-2">Banyak item dalam satu bon</span><span className="rounded-full border border-[#bad6b2] bg-white px-3 py-2">Terhubung ke proyek</span><span className="rounded-full border border-[#bad6b2] bg-white px-3 py-2">Cetak dan arsip</span></div>
     <Link href="/keuangan/bon/baru" className="farm-button farm-button-primary mt-7 min-h-12 px-6">Buat Bon Pengeluaran <FarmIcon name="arrow-right" size={18}/></Link>
     <p className="mt-3 text-xs text-[#718177]">Memerlukan login · Bon internal, bukan nota resmi pemasok</p>
    </div>
    <div className="order-1 overflow-hidden rounded-[28px] border border-[#d7e3d2] bg-[#f8fbf6] shadow-[0_20px_50px_rgba(25,75,46,.10)] lg:order-2">
      <Image src="/brand/bon-pengeluaran-premium.svg" alt="Ilustrasi bon pengeluaran, perincian biaya, dan tanaman timun" width={960} height={660} className="h-auto w-full" priority={false}/>
    </div>
   </div>
  </section>
  <section id="fitur" className="border-t border-[#dfe6d8] bg-white px-5 py-16 sm:px-8">
   <div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[.12em] text-[#387c55]">Untuk pekerjaan sehari-hari</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Fokus pada hal yang benar-benar penting.</h2><p className="mt-3 leading-relaxed text-[#718177]">Tampilan ringan, navigasi jelas, dan angka yang mudah dibaca—baik di ponsel maupun desktop.</p></div>
    <div className="mt-9 grid gap-4 sm:grid-cols-3">
     <article className="farm-card p-6"><span className="farm-icon"><FarmIcon name="calculator"/></span><h3 className="mt-5 text-lg font-extrabold">Anggaran pertanian</h3><p className="mt-2 text-sm leading-relaxed text-[#718177]">Rencanakan kebutuhan, ubah kuantitas dan harga, lalu pantau total biaya per proyek.</p></article>
     <article className="farm-card p-6"><span className="farm-icon"><FarmIcon name="receipt"/></span><h3 className="mt-5 text-lg font-extrabold">Bon / Struk pengeluaran</h3><p className="mt-2 text-sm leading-relaxed text-[#718177]">Catat beberapa barang dalam satu bon, simpan pengeluaran aktual, dan cetak dokumennya.</p></article>
     <article className="farm-card p-6"><span className="farm-icon"><FarmIcon name="chart"/></span><h3 className="mt-5 text-lg font-extrabold">Wawasan biaya</h3><p className="mt-2 text-sm leading-relaxed text-[#718177]">Bandingkan anggaran rencana dengan pengeluaran yang sudah dicatat secara transparan.</p></article>
    </div>
   </div>
  </section>
  <footer className="border-t border-[#dfe6d8] px-5 py-7 text-center text-xs text-[#718177]">© 2026 Yanzen E-Farmer · Catat · Kelola · Tumbuh</footer>
 </main>;
}
