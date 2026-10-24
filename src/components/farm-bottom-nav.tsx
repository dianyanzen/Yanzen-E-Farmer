'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import FarmIcon from './farm-icon';

const tabs=[
 {href:'/home',label:'Beranda',icon:'home',main:false},
 {href:'/anggaran',label:'Anggaran',icon:'calculator',main:false},
 {href:'/keuangan/bon/baru',label:'Bon',icon:'receipt',main:true},
 {href:'/pertanian',label:'Pertanian',icon:'sprout',main:false},
 {href:'/panen',label:'Panen',icon:'harvest',main:false}
] as const;

export default function FarmBottomNav(){
 const pathname=usePathname();
 if(pathname==='/'||pathname.startsWith('/login')||pathname.startsWith('/auth'))return null;
 return <nav aria-label="Navigasi utama" className="farm-nav fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] sm:hidden">
  <div className="mx-auto grid max-w-lg grid-cols-5">
   {tabs.map(t=>{
    const active=t.main?pathname.startsWith('/keuangan'):pathname===t.href||(t.href!=='/home'&&pathname.startsWith(t.href+'/'));
    return <Link key={t.href} href={t.href} aria-current={active?'page':undefined} className={'farm-nav-link'+(active?' farm-nav-active':'')+(t.main?' farm-nav-main-action':'')}>
     {t.main?<span className="farm-nav-main-icon"><FarmIcon name={t.icon}/></span>:<FarmIcon name={t.icon}/>}
     <span>{t.label}</span>
    </Link>;
   })}
  </div>
 </nav>;
}
