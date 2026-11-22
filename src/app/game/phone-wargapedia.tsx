"use client";

import Image from "next/image";
import {useEffect,useMemo,useState} from "react";
import {WARGAPEDIA_CATEGORIES,wargaDisplayName,wargaPlayerView,type WargaDossier} from "@/lib/game/public-wargapedia";
import {NPCS,bondLabel,bondLevel,npcWhere,areaTitle,type GameState} from "@/lib/game/model";
import {questObjective,tales} from "@/lib/game/personal-quests";
import {approvedLegacyId} from "@/lib/game/legacy-identity";
import type {ResidentProfile} from "@/lib/game/resident-profile";

type Entry={id:string;name:string;occupation:string;portraitUrl:string};
type Catalog={characterCount:number;characters:Entry[]};
type Dossier=WargaDossier&{approval:string;characterClass:string};
const PAGE_SIZE=10;

/**
 * Warga is a player's address book, never a raw Character Bible inspector.
 * Editorial/approval/provenance belongs to the private server review endpoint,
 * not to a query-parameter switch inside the player's YZ Phone.
 */
export default function PhoneWargapedia({selectedId,onSelect,game,residents}:{
 selectedId:string|null;onSelect:(id:string|null)=>void;
 game:GameState;residents:readonly ResidentProfile[];
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
    if(!controller.signal.aborted)setCatalog(data);
   })
   .catch(()=>{if(!controller.signal.aborted)setError("Daftar warga belum bisa dibuka. Periksa koneksi, lalu coba lagi.");});
  return()=>controller.abort();
 },[]);

 const safeSelected=Boolean(selectedId&&catalog?.characters.some(person=>person.id===selectedId));
 useEffect(()=>{
  if(!selectedId||!safeSelected){setProfile(null);setLoading(false);return;}
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
    setError("Catatan warga ini belum bisa dibuka. Coba lagi sebentar.");setLoading(false);
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
   !q||(person.name+" "+person.occupation).toLocaleLowerCase("id").includes(q))??[];
 },[catalog,query]);
 const pages=Math.max(1,Math.ceil(results.length/PAGE_SIZE));
 const currentPage=Math.min(page,pages-1);
 const backToList=()=>{setError("");onSelect(null);};

 // Save data may only be joined to a citizen with an explicitly approved legacy link.
 const currentResident=residents.find(person=>person.id===selectedId);
 const approvedOldId=currentResident?approvedLegacyId(currentResident):null;
 const activeNpc=approvedOldId?NPCS.find(npc=>npc.id===approvedOldId):undefined;
 const bond=activeNpc?game.bonds[activeNpc.id]:undefined;
 const quest=activeNpc?game.personalQuests?.[activeNpc.id]:undefined;
 const level=bond?bondLevel(bond.points):0;
 const place=activeNpc&&bond?.talks?npcWhere(game,activeNpc.id):null;

 if(selectedId){
  const known=catalog?.characters.find(person=>person.id===selectedId);
  const view=profile?.id===selectedId?wargaPlayerView(profile):null;
  return <section className="yzg-wargapedia" aria-label="Warga · tentang seseorang" data-character-detail={selectedId}>
   <button type="button" className="yzg-wargapedia-back" onClick={backToList}>‹ Daftar warga</button>
   {!catalog&&!error&&<p role="status">Membuka daftar warga…</p>}
   {catalog&&!known&&<p role="alert">Nama ini belum ada di daftar warga.</p>}
   {known&&<div className="yzg-phone-card yzg-wargapedia-profile">
    <Image src={known.portraitUrl} alt={`Potret ${wargaDisplayName(known.name)}`} width={82} height={82} sizes="82px" unoptimized/>
    <div><h3>{wargaDisplayName(known.name)}</h3><p>{known.occupation}</p></div>
   </div>}
   {activeNpc&&(Boolean(bond?.talks)||Boolean(quest&&quest.phase>1))&&<div className="yzg-phone-card yzg-warga-relationship" aria-label="Pertemuan dan kedekatan">
    <b>Perjalanan kalian</b>
    {bond?.talks?<>
     <p>Kalian sudah berbincang {bond.talks} kali. {bondLabel(bond.points)}.</p>
     <meter min={0} max={1000} value={bond.points} aria-label={`Kedekatan dengan ${known?.name??"warga"}`}/>
     {place&&<small>Terakhir terlihat di {areaTitle(place.location)} · {place.activity}</small>}
    </>:null}
    {quest&&quest.phase>1&&<p><b>{tales[activeNpc.id].title}</b> · {quest.phase===4?"Sudah selesai":quest.phase===3?"Menunggu kabar":"Masih berjalan"}<small>{questObjective(game,activeNpc.id)}</small></p>}
    <span className="sr-only">Tingkat kedekatan saat ini: {level}</span>
   </div>}
   {error&&<p role="alert">{error}</p>}
   {loading&&<p role="status">Membuka catatan…</p>}
   {view&&<div>
    <div className="yzg-wargapedia-chapters">
     {view.sections.map((section,index)=><details key={section.title} open={index===0}>
      <summary>{section.title}</summary>
      {section.lines.map(line=><p key={line}>{line}</p>)}
     </details>)}
    </div>
    {view.sources.length>0&&<details className="yzg-citizen-section">
     <summary>Sumber profil</summary>
     <p>Riwayat jabatan dan pendidikan merujuk sumber publik. Pertemuan serta dialog dalam permainan ini adalah rekaan.</p>
     <ul>{view.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
    </details>}
   </div>}
  </section>;
 }
 return <section className="yzg-wargapedia" aria-label="Warga">
  <div className="yzg-phone-card">
   <b>Warga</b>
   <p>Orang-orang yang menghidupkan kampung dan sudut-sudut kota.</p>
   <label htmlFor="yzg-wargapedia-search">Cari nama atau pekerjaan</label>
   <input id="yzg-wargapedia-search" type="search" value={query}
    onChange={value=>{setQuery(value.target.value);setPage(0);}}
    placeholder="Siapa yang kamu cari?"/>
   <small role="status">{catalog?`${results.length} nama ditemukan`:"Membuka daftar…"}
   </small>
  </div>
  {error&&<p role="alert">{error}</p>}
  <div className="yzg-wargapedia-list">
   {results.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE).map(person=><button
    key={person.id} type="button" data-character-card={person.id} onClick={()=>onSelect(person.id)} aria-label={`Baca tentang ${wargaDisplayName(person.name)}`}>
    <Image src={person.portraitUrl} width={49} height={49} alt="" sizes="49px" unoptimized/>
    <span><strong>{wargaDisplayName(person.name)}</strong><small>{person.occupation}</small></span>
    <span aria-hidden="true">›</span>
   </button>)}
  </div>
  {catalog&&!results.length&&<p role="status">Belum ada nama yang cocok. Coba kata lain.</p>}
  {pages>1&&<nav aria-label="Halaman warga" className="yzg-citizen-pages">
   <button type="button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Sebelumnya</button>
   <span>{currentPage+1}/{pages}</span>
   <button type="button" disabled={currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>Berikutnya</button>
  </nav>}
 </section>;
}
