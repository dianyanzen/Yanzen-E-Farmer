'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import FarmIcon from './farm-icon';
const tabs=[{href:'/home',label:'Beranda',icon:'home'},{href:'/anggaran',label:'Anggaran',icon:'calculator'},{href:'/keuangan',label:'Keuangan',icon:'wallet'},{href:'/pertanian',label:'Pertanian',icon:'sprout'},{href:'/panen',label:'Panen',icon:'harvest'}] as const;
export default function FarmBottomNav(){
 const pathname=usePathname();
 if(pathname==='/'||pathname.startsWith('/login')||pathname.startsWith('/auth'))return null;
 return <nav aria-label="Navigasi utama" className="farm-nav fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] sm:hidden"><div className="mx-auto grid max-w-lg grid-cols-5">{tabs.map(t=>{const active=pathname===t.href||(t.href!=='/home'&&pathname.startsWith(t.href+'/'));return <Link key={t.href} href={t.href} aria-current={active?'page':undefined} className={'farm-nav-link'+(active?' farm-nav-active':'')}><FarmIcon name={t.icon}/><span>{t.label}</span></Link>})}</div></nav>;
}