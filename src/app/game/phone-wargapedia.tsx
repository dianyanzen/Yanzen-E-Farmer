"use client";

import Image from "next/image";
import {useEffect,useMemo,useState,type ReactNode} from "react";
import {WARGAPEDIA_CATEGORIES,WARGAPEDIA_FIELD_LABELS,WARGAPEDIA_HIDDEN_FIELDS} from "@/lib/game/public-wargapedia";

type Entry={
 id:string;name:string;occupation:string;portraitUrl:string;status:string;
};
type Catalog={characterCount:number;characters:Entry[]};
type Dossier={
 id:string;name:string;occupation:string;portraitUrl:string;
 approval:string;characterClass:string;fictionNotice:string;
 sections:Record<string,Record<string,unknown>>;
};
const PAGE_SIZE=10;

function Value({data}:{data:unknown}):ReactNode{
 if(data===null||data===undefined)return <span>Belum ditetapkan</span>;
 if(Array.isArray(data))return data.length?
  <ul>{data.map((part,i)=><li key={i}><Value data={part}/></li>)}</ul>:<span>Belum ada catatan</span>;
 if(typeof data==="object")return <dl className="yzg-wargapedia-nested">
  {Object.entries(data as Record<string,unknown>).map(([key,value])=><div key={key}>
   <dt>{WARGAPEDIA_FIELD_LABELS[key]??key.replaceAll(/([A-Z])/g," $1").replaceAll("_"," ")}</dt>
   <dd><Value data={value}/></dd>
  </div>)}
 </dl>;
 if(typeof data==="boolean")return <span>{data?"Ya":"Belum"}</span>;
 return <span>{String(data)}</span>;
}

export default function PhoneWargapedia({selectedId,onSelect}:{
 selectedId:string|null;onSelect:(id:string|null)=>void;
}){
 const [catalog,setCatalog]=useState<Catalog|null>(null);
 const [query,setQuery]=useState("");
 const [page,setPage]=useState(0);
 const [profile,setProfile]=useState<Dossier|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);

 useEffect(()=>{
  const controller=new AbortController();
  fetch("/game/data/npc/index.json",{signal:controller.signal,cache:"force-cache"})
   .then(response=>{if(!response.ok)throw new Error("catalog");return response.json() as Promise<Catalog>;})
   .then(data=>{
    if(data.characterCount!==248||!Array.isArray(data.characters)||data.characters.length!==248)
     throw new Error("catalog count");
    setCatalog(data);
   })
   .catch(()=>{if(!controller.signal.aborted)setError("Wargapedia belum bisa dibuka. Coba lagi saat koneksi membaik.");});
  return()=>controller.abort();
 },[]);

 const safeSelected=Boolean(selectedId&&catalog?.characters.some(person=>person.id===selectedId));
 useEffect(()=>{
  if(!selectedId||!safeSelected){setProfile(null);return;}
  const controller=new AbortController();
  setError("");setProfile(null);setLoading(true);
  fetch("/game/data/npc/"+encodeURIComponent(selectedId)+".json",{signal:controller.signal,cache:"force-cache"})
   .then(response=>{if(!response.ok)throw new Error("dossier");return response.json() as Promise<Dossier>;})
   .then(data=>{
    if(data.id!==selectedId||data.characterClass!=="canonical-public-fictional-draft"||data.approval!=="draft"||
       WARGAPEDIA_CATEGORIES.some(([key])=>!data.sections||!data.sections[key]))
     throw new Error("invalid public dossier");
    if(!controller.signal.aborted){setProfile(data);setLoading(false);}
   })
   .catch(()=>{if(!controller.signal.aborted){
    setError("Catatan karakter ini belum dapat dibuka.");setLoading(false);
   }});
  return()=>controller.abort();
 },[selectedId,safeSelected]);
 useEffect(()=>{
  const scroller=document.querySelector<HTMLElement>(".yzg-phone-content");
  if(scroller)scroller.scrollTop=0;
 },[selectedId]);

 const results=useMemo(()=>{
  const q=query.trim().toLocaleLowerCase("id");
  return catalog?.characters.filter(person=>
   !q||(person.name+" "+person.occupation+" "+person.id).toLocaleLowerCase("id").includes(q))??[];
 },[catalog,query]);
 const pages=Math.max(1,Math.ceil(results.length/PAGE_SIZE));
 const currentPage=Math.min(page,pages-1);
 const backToList=()=>{setError("");onSelect(null);};
 if(selectedId){
  const known=catalog?.characters.find(person=>person.id===selectedId);
  return <section className="yzg-wargapedia" aria-label="Wargapedia · detail karakter">
   <button type="button" className="yzg-wargapedia-back" onClick={backToList}>‹ Kembali ke Wargapedia</button>
   {!catalog&&!error&&<p role="status">Membuka katalog karakter…</p>}
   {catalog&&!known&&<p role="alert">Karakter ini tidak tercantum dalam katalog resmi.</p>}
   {known&&<div className="yzg-phone-card yzg-wargapedia-profile">
    <Image src={known.portraitUrl} alt={`Potret konsep ${known.name}`} width={82} height={82} sizes="82px" unoptimized/>
    <div><small>{known.id} · Tokoh fiksi</small><h3>{known.name}</h3><p>{known.occupation}</p></div>
   </div>}
   {error&&<p role="alert">{error}</p>}
   {loading&&<p role="status">Membuka catatan karakter…</p>}
   {profile?.id===selectedId&&<div>
    <p className="yzg-wargapedia-notice">Profil ini bisa dibaca kapan saja tanpa level kedekatan. Cerita dan misi yang belum dimainkan tetap berstatus rancangan.</p>
    <p className="yzg-wargapedia-caption">12 bagian · Ketuk judul untuk membaca</p>
    <div className="yzg-wargapedia-chapters">
     {WARGAPEDIA_CATEGORIES.map(([key,title],index)=><details key={profile.id+key} open={index===0}>
      <summary>{String(index+1).padStart(2,"0")} · {title}</summary>
      <dl>{Object.entries(profile.sections[key]??{}).filter(([field])=>!WARGAPEDIA_HIDDEN_FIELDS.has(field))
       .map(([field,value])=><div key={field}>
        <dt>{WARGAPEDIA_FIELD_LABELS[field]??field.replaceAll(/([A-Z])/g," $1").replaceAll("_"," ")}</dt>
        <dd><Value data={value}/></dd>
       </div>)}</dl>
     </details>)}
    </div>
    <p className="yzg-wargapedia-caption">Ini ensiklopedia dunia YZ Farm Life, bukan daftar peristiwa yang sudah terjadi pada save-mu. Untuk cerita yang telah dimainkan, buka Kronik.</p>
   </div>}
  </section>;
 }
 return <section className="yzg-wargapedia" aria-label="Wargapedia · katalog publik">
  <div className="yzg-phone-card">
   <b>Wargapedia</b>
   <p>Kenali 248 karakter dalam dunia YZ Farm Life. Tidak perlu berkenalan atau naik level untuk membaca kisah mereka.</p>
   <label htmlFor="yzg-wargapedia-search">Cari karakter</label>
   <input id="yzg-wargapedia-search" type="search" value={query}
    onChange={event=>{setQuery(event.target.value);setPage(0);}}
    placeholder="Nama, pekerjaan, atau ID"/>
   <small role="status">{catalog?`${results.length} dari ${catalog.characterCount} warga`:"Membuka katalog…"}</small>
  </div>
  {error&&<p role="alert">{error}</p>}
  <div className="yzg-wargapedia-list">
   {results.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE).map(person=><button
    key={person.id} type="button" onClick={()=>onSelect(person.id)} aria-label={`Baca Wargapedia ${person.name}`}>
    <Image src={person.portraitUrl} width={49} height={49} alt="" sizes="49px" unoptimized/>
    <span><strong>{person.name}</strong><small>{person.occupation}</small></span>
    <span aria-hidden="true">›</span>
   </button>)}
  </div>
  {catalog&&!results.length&&<p role="status">Belum ada karakter dengan nama atau pekerjaan tersebut.</p>}
  {pages>1&&<nav aria-label="Halaman Wargapedia" className="yzg-citizen-pages">
   <button type="button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Sebelumnya</button>
   <span>{currentPage+1}/{pages}</span>
   <button type="button" disabled={currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>Berikutnya</button>
  </nav>}
 </section>;
}
