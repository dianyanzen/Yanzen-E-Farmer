'use client';
import Image from 'next/image';
import {useEffect,useMemo,useState} from 'react';
import {WARGAPEDIA_CATEGORIES,WARGAPEDIA_FIELD_LABELS,WARGAPEDIA_HIDDEN_FIELDS} from '@/lib/game/public-wargapedia';

type CatalogEntry={id:string;name:string;occupation:string;portrait:string;portraitUrl:string;detailPath:string;teaser:string;status:string};
type Catalog={characterCount:number;characters:CatalogEntry[]};
type Profile={id:string;name:string;occupation:string;portraitUrl:string;approval:string;fictionNotice:string;publicationStatus:string;sections:Record<string,Record<string,unknown>>};
function readable(value:unknown):string{
 if(value===null||value===undefined)return 'Belum ditetapkan';
 if(typeof value==='string')return value;
 if(typeof value==='boolean')return value?'Ya':'Belum';
 if(typeof value==='number')return String(value);
 return '';
}
function DetailValue({value}:{value:unknown}){
 if(Array.isArray(value))return value.length?<ul>{value.map((x,i)=><li key={i}><DetailValue value={x}/></li>)}</ul>:<span>Belum ada catatan</span>;
 if(value!==null&&typeof value==='object')return <dl>{Object.entries(value as Record<string,unknown>).map(([k,v])=><div key={k}><dt>{WARGAPEDIA_FIELD_LABELS[k]??k.replaceAll('_',' ')}</dt><dd><DetailValue value={v}/></dd></div>)}</dl>;
 return <span>{readable(value)}</span>;
}
export default function EncyclopediaClient(){
 const [catalog,setCatalog]=useState<Catalog|null>(null);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/game/data/npc/index.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('catalog');return r.json() as Promise<Catalog>})
   .then(setCatalog).catch(()=>{if(!controller.signal.aborted)setError('Katalog belum dapat dibuka. Coba muat ulang halaman.');});
  const initial=new URLSearchParams(window.location.search).get('npc');
  if(initial&&/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(initial))setSelected(initial);
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  if(!selected)return;
  const controller=new AbortController();
  setProfile(null);
  fetch('/game/data/npc/'+encodeURIComponent(selected)+'.json',{signal:controller.signal})
   .then(r=>{if(!r.ok)throw Error('profile');return r.json() as Promise<Profile>})
   .then(data=>{if(data.id===selected&&data.approval==='draft')setProfile(data);else setError('Profil belum tersedia.');})
   .catch(()=>{if(!controller.signal.aborted)setError('Profil tidak dapat dibuka.');});
  return()=>controller.abort();
 },[selected]);
 const results=useMemo(()=>catalog?.characters.filter(x=>{
  const q=query.trim().toLocaleLowerCase('id');return !q||(x.name+' '+x.occupation+' '+x.id).toLocaleLowerCase('id').includes(q);
 })??[],[catalog,query]);
 const open=(id:string|null)=>{setError('');setSelected(id);window.history.replaceState(null,'',id?'/game/encyclopedia?npc='+encodeURIComponent(id):'/game/encyclopedia');};
 return <main className="yz-encyclopedia">
  <header className="yz-encyclopedia-header"><div className="yz-encyclopedia-brand"><a href="/game" className="yz-back">Kembali ke game</a><span>YZ FARM LIFE · BANDUNG</span></div>
   <h1>Ensiklopedia Warga</h1><p>Kenali orang-orang yang membentuk kisah di Bandung. Ada 248 karakter dalam katalog fiksi ini, dari kebun kecil hingga pelosok kota.</p>
   <p className="yz-encyclopedia-notice">Catatan ini adalah rancangan cerita fiksi. Belum semua tokoh muncul atau mempunyai misi di permainan. Dialog kameo bukan kutipan kehidupan nyata.</p>
  </header>
  <div className="yz-encyclopedia-layout">
   <aside className="yz-encyclopedia-sidebar"><label htmlFor="npc-search">Cari warga atau pekerjaan</label><input id="npc-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nama, profesi, atau ID"/>
    <p className="yz-encyclopedia-count">{catalog?`${results.length} dari ${catalog.characterCount} karakter`:'Membuka katalog…'}</p>
    <div className="yz-encyclopedia-people">{results.map(x=><button type="button" key={x.id} onClick={()=>open(x.id)} aria-current={selected===x.id?'true':undefined}>
     <Image src={x.portraitUrl} alt="" width={48} height={48} sizes="48px"/><span><strong>{x.name}</strong><small>{x.occupation}</small></span></button>)}</div>
   </aside>
   <section className="yz-encyclopedia-main" aria-live="polite">
    {error&&<p role="alert">{error}</p>}
    {!selected&&<div className="yz-encyclopedia-empty"><h2>Setiap warga punya cerita.</h2><p>Pilih tokoh dari daftar untuk membaca potret, pekerjaan, kebiasaan, dan rancangan perjalanan karakternya.</p></div>}
    {selected&&!profile&&!error&&<p>Membuka catatan karakter…</p>}
    {profile&&profile.id===selected&&<article>
      <div className="yz-encyclopedia-person"><Image src={profile.portraitUrl} alt={'Potret konsep '+profile.name} width={152} height={152} sizes="152px"/>
       <div><small>{profile.id} · Draf fiksi publik</small><h2>{profile.name}</h2><p>{profile.occupation}</p></div></div>
      <p className="yz-encyclopedia-notice">{profile.fictionNotice}</p>
      <div className="yz-encyclopedia-chapters">{WARGAPEDIA_CATEGORIES.map(([key,title],i)=><details key={key} open={i<4}>
        <summary><span>{String(i+1).padStart(2,'0')} · {title}</span></summary>
        <dl>{Object.entries(profile.sections[key]??{}).filter(([field])=>!WARGAPEDIA_HIDDEN_FIELDS.has(field)).map(([field,value])=><div key={field}><dt>{WARGAPEDIA_FIELD_LABELS[field]??field.replaceAll(/([A-Z])/g,' $1')}</dt><dd><DetailValue value={value}/></dd></div>)}</dl>
       </details>)}</div>
      <p className="yz-encyclopedia-footer">Cerita bisa berkembang, tetapi perubahan identitas canonical tetap melewati validasi. Hubungan dan progres pemain disimpan terpisah.</p>
    </article>}
   </section>
  </div>
 </main>;
}
