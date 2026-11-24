'use client';

import Image from 'next/image';
import {useEffect,useMemo,useState} from 'react';
import {WARGAPEDIA_CATEGORIES,wargaDisplayName,wargaPlayerView,type WargaDossier} from '@/lib/game/public-wargapedia';

type CatalogEntry={id:string;name:string;occupation:string;portraitUrl:string};
type Catalog={characterCount:number;characters:CatalogEntry[]};
type Profile=WargaDossier&{approval:string;characterClass:string};

/** Public reader, not the developer's 12-dimension dossier inspector. */
export default function EncyclopediaClient(){
 const [catalog,setCatalog]=useState<Catalog|null>(null);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/game/data/npc/index.json',{signal:controller.signal})
   .then(r=>{if(!r.ok)throw Error('catalog');return r.json() as Promise<Catalog>})
   .then(data=>{
    if(data.characterCount!==248||data.characters.length!==248)throw Error('catalog count');
    if(!controller.signal.aborted)setCatalog(data);
   })
   .catch(()=>{if(!controller.signal.aborted)setError('Daftar warga belum bisa dibuka. Coba muat ulang halaman.');});
  const initial=new URLSearchParams(window.location.search).get('npc');
  if(initial&&/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(initial))setSelected(initial);
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  if(!selected){setProfile(null);return;}
  const controller=new AbortController();
  setProfile(null);setError('');
  fetch('/game/data/npc/'+encodeURIComponent(selected)+'.json',{signal:controller.signal})
   .then(r=>{if(!r.ok)throw Error('profile');return r.json() as Promise<Profile>})
   .then(data=>{
    if(data.id===selected&&data.approval==='draft'&&data.characterClass==='canonical-public-fictional-draft'&&
       WARGAPEDIA_CATEGORIES.every(([key])=>Boolean(data.sections?.[key]))){
     if(!controller.signal.aborted)setProfile(data);
    }else throw Error('unavailable');
   })
   .catch(()=>{if(!controller.signal.aborted)setError('Catatan warga ini belum bisa dibuka.');});
  return()=>controller.abort();
 },[selected]);
 const results=useMemo(()=>catalog?.characters.filter(x=>{
  const q=query.trim().toLocaleLowerCase('id');
  return !q||(x.name+' '+x.occupation).toLocaleLowerCase('id').includes(q);
 })??[],[catalog,query]);
 const open=(id:string|null)=>{
  setError('');setSelected(id);
  window.history.replaceState(null,'',id?'/game/encyclopedia?npc='+encodeURIComponent(id):'/game/encyclopedia');
 };
 const view=profile&&profile.id===selected?wargaPlayerView(profile):null;
 return <main className="yz-encyclopedia">
  <header className="yz-encyclopedia-header">
   <div className="yz-encyclopedia-brand"><a href="/game" className="yz-back">Kembali ke game</a><span>YZ Farm Life · Bandung</span></div>
   <h1>Warga</h1>
   <p>Kenali orang-orang yang punya cerita di sekitar kampung dan kota.</p>
  </header>
  <div className="yz-encyclopedia-layout">
   <aside className="yz-encyclopedia-sidebar">
    <label htmlFor="npc-search">Cari nama atau pekerjaan</label>
    <input id="npc-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Siapa yang kamu cari?"/>
    <p className="yz-encyclopedia-count">{catalog?`${results.length} nama ditemukan`:'Membuka daftar…'}</p>
    <div className="yz-encyclopedia-people">
     {results.map(x=><button type="button" key={x.id} onClick={()=>open(x.id)} aria-current={selected===x.id?'true':undefined}>
      <Image src={x.portraitUrl} alt="" width={48} height={48} sizes="48px" unoptimized/>
      <span><strong>{wargaDisplayName(x.name)}</strong><small>{x.occupation}</small></span>
     </button>)}
    </div>
   </aside>
   <section className="yz-encyclopedia-main" aria-live="polite">
    {error&&<p role="alert">{error}</p>}
    {!selected&&<div className="yz-encyclopedia-empty">
     <h2>Siapa yang ingin kamu kenal?</h2><p>Pilih nama di samping untuk membaca ceritanya.</p>
    </div>}
    {selected&&!view&&!error&&<p>Membuka catatan…</p>}
    {view&&profile&&<article data-character-detail={selected??undefined}>
     <div className="yz-encyclopedia-person">
      <Image src={profile.portraitUrl} alt={`Potret ${view.displayName}`} width={152} height={152} sizes="152px" unoptimized/>
      <div><h2>{view.displayName}</h2><p>{profile.occupation}</p></div>
     </div>
     <div className="yz-encyclopedia-chapters">
      {view.sections.map((part,i)=><details key={part.title} open={i===0}>
       <summary><span>{part.title}</span></summary>
       {part.lines.map(line=><p key={line}>{line}</p>)}
      </details>)}
     </div>
     {view.sources.length>0&&<details className="yz-encyclopedia-chapters">
      <summary>Sumber profil</summary>
      <p>Riwayat publik berasal dari sumber berikut. Adegan dan percakapan di game adalah rekaan.</p>
      <ul>{view.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul>
     </details>}
    </article>}
   </section>
  </div>
 </main>;
}
