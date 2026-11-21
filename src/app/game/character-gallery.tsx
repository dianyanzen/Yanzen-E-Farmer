"use client";

import {useEffect,useMemo,useState,type ReactNode} from "react";
import {loadCharacterBible,type CharacterBible} from "@/lib/game/phone-profiles";
import {NPCS,NPC_SOULS,bondLabel,bondLevel,npcWhere,areaTitle,type GameState} from "@/lib/game/model";
import {tales,questObjective} from "@/lib/game/personal-quests";
import type {ResidentProfile} from "@/lib/game/resident-profile";
import {ResidentPortrait} from "./dialogue-panel";

type Citizen={id:string;name:string;occupation:string;portrait:string;legacyId?:string;legacyApproved?:boolean};
const PAGE_SIZE=12;
function CitizenPhoto({person}:{person:Citizen}){
 return <ResidentPortrait resident={{id:person.id,name:person.name,occupation:person.occupation,portrait:person.portrait}}/>;
}
function Section({label,open,children}:{label:string;open:boolean;children:ReactNode}){
 return <details className="yzg-citizen-section">
  <summary><span>{label}</span>{!open&&<small>Belum terbuka</small>}</summary>
  <div>{open?children:<p>Kenali orangnya lebih dekat dulu. Catatan ini akan terisi lewat pertemuan kalian.</p>}</div>
 </details>;
}
function WargaDetail({person,game,profile,onBack,loading}:{person:Citizen;game:GameState;profile:CharacterBible|null;onBack:()=>void;loading:boolean}){
 const npc=person.legacyApproved?NPCS.find(n=>n.id===(person.legacyId??person.id)):undefined;
 const bond=npc?game.bonds[npc.id]:undefined;
 const self=false; // A01 is the player, not a member of the canonical 248-NPC roster.
 const met=Boolean(bond?.talks)||self,level=bond?bondLevel(bond.points):0;
 const face=profile?.sections;
 const look=face?.["02_physical_appearance"],clothes=face?.["03_fashion_aesthetic"];
 const social=face?.["04_social_profile"],personality=face?.["05_personality"],mind=face?.["06_psychological_profile"];
 const voice=face?.["09_dialogue_behavior"];
 const coreBio=face?.["01_core_identity"],history=face?.["07_background_history"];
 const relationships=face?.["08_relationship_dynamics"],arc=face?.["10_narrative_development"];
 const visual=face?.["11_visual_references"],current=face?.["12_continuity_current_state"];
 const backgroundText=history?.familyContext??history?.narrativeBackground??history?.formativeMemory??history?.personalFamily;
 const connectionText=relationships?.connections?.map(c=>c.description??c.relationship).filter(Boolean).join("; ");
 const soul=npc?NPC_SOULS[npc.id]:null;
 const quest=npc?game.personalQuests?.[npc.id]:null;
 const rememberedPast=npc?.id==="C01"&&game.story.photoSeen?
   "Nani menunjukkan foto pintu air lama dan bercerita sedikit tentang keluarganya.":
   npc?.id==="A03"&&game.story.canalClue?
   "Ryan pernah mencatat garis tinggi air di dekat pintu saluran.":
   null;
 const knowsMore=met&&(self||level>=2),knowsPrivate=met&&(self||level>=3);
 const currentPlace=npc?npcWhere(game,npc.id):null;
 const outline=!met?"Kalian belum mengobrol. Ada hal-hal yang hanya bisa diketahui dengan bertemu langsung.":"Catatan tentang orang yang kamu kenal.";
 return <article data-character-detail={person.id} aria-label={`Profil ${person.name}`}>
  <button type="button" className="yzg-citizen-return" onClick={onBack}>‹ Daftar warga</button>
  <div className="yzg-phone-card yzg-citizen-hero">
   <CitizenPhoto person={person}/>
   <div><h3>{person.name}</h3><p>{person.occupation}</p>
    <small>{npc&&met?`Sudah ${bond?.talks??0} kali berbincang`:self?"Kisahmu sendiri":"Belum berkenalan"}</small></div>
  </div>
  {npc&&<div className="yzg-phone-card">
    <b>Kedekatan · Lv. {level}</b><p>{bondLabel(bond!.points)}</p>
    <meter min={0} max={1000} value={bond!.points} aria-label={`Kedekatan dengan ${person.name}`}/>
    {met&&currentPlace&&<small>Biasanya sekarang: {areaTitle(currentPlace.location)} · {currentPlace.activity}</small>}
    <small>{level<1?"Berbincanglah agar makin mengenal kebiasaannya.":level<2?"Semakin akrab, semakin banyak cerita yang ia bagikan.":level<3?"Ia mulai lebih terbuka tentang apa yang diharapkan.":"Kalian sudah saling percaya lebih jauh."}</small>
  </div>}
  <div className="yzg-phone-card"><p className="yzg-citizen-lead">{outline}</p>
   {loading&&<p role="status">Membuka catatan warga…</p>}
   {!loading&&<div className="yzg-citizen-sections">
    <Section label="01 · Siapa dia" open><p>{person.name} · {person.occupation}. {met&&soul?.home?`Tempat tinggal: ${soul.home}.`:""}</p>
      {coreBio?.origin&&met&&<p>Asal: {coreBio.origin}.</p>}
      {coreBio?.language&&met&&<p>Bahasa: {coreBio.language}.</p>}
      {coreBio?.ageYears!=null&&met&&<p>Usia karakter: {coreBio.ageYears} tahun.</p>}
    </Section>
    <Section label="02 · Penampilan" open>{<p>{look?.general??look?.visualDirection??look?.physicalTraits??"Potretnya tersimpan di daftar warga."}</p>}</Section>
    <Section label="03 · Gaya dan pakaian" open>{<p>{clothes?.signatureClothing??clothes?.clothing??"Lihat potret untuk mengenali gaya berpakaiannya."}</p>}</Section>
    <Section label="04 · Kegiatan sehari-hari" open>{<><p>{person.occupation}.</p>{met&&Boolean(social?.hobbies?.length)&&<p>Di waktu luang: {social!.hobbies!.join(", ")}.</p>}</>}</Section>
    <Section label="05 · Sifat dan kebiasaan" open={met&&(self||level>=1)}>
      <p>{personality?.traits?.join(", ")??"Kalian masih saling mengenal."}.</p>
      <p>{personality?.observableHabit??personality?.habit??soul?.habit}</p>
    </Section>
    <Section label="06 · Yang sedang dipikirkan" open={knowsMore}>
      <p>{mind?.primaryMotivation??mind?.motivation??soul?.desire??"Masih belum diceritakan."}</p>
      {knowsPrivate&&<p>{mind?.fear??soul?.fear}</p>}
    </Section>
    <Section label="07 · Cerita masa lalu" open={knowsPrivate&&Boolean(rememberedPast||backgroundText)}>
      <p>{backgroundText??rememberedPast??"Belum ada kenangan yang dibagikan."}</p>
    </Section>
    <Section label="08 · Orang terdekat" open={knowsMore&&Boolean(connectionText||soul?.connection)}>
      <p>{connectionText||soul?.connection||"Kamu belum mendengar cerita tentang hubungannya dengan warga lain."}</p>
    </Section>
    <Section label="09 · Cara berbicara" open={met}>
      <p>{voice?.speechSignature??voice?.speechPattern??voice?.scriptedSpeakingStyle??"Kamu baru mulai mengenali caranya berbicara."}</p>
      {voice?.sampleLine&&<p>“{voice.sampleLine}”</p>}
    </Section>
    <Section label="10 · Cerita kalian" open={met}>
      {arc?.storyArc&&<p>{arc.storyArc}</p>}
      {npc?<><p>{quest?`${tales[npc.id].title} · ${quest.phase===4?"Sudah selesai":quest.phase===3?"Menunggu kabar":"Sedang berjalan"}`:"Belum ada permintaan pribadi yang kalian kerjakan."}</p>
        {quest&&<p>{questObjective(game,npc.id)}</p>}
        {npc.id==="C08"&&game.story.orderAccepted&&<p>{game.story.orderDone?"Pesanan empat timun dari Inggit sudah diantar.":"Inggit menunggu empat timun untuk warungnya."}</p>}
        {npc.id==="A03"&&game.story.canalClue&&<p>Kalian sudah melihat tanda air di batu dekat saluran.</p>}
        {npc.id==="C01"&&game.story.photoSeen&&<p>Nani sudah menunjukkan foto pintu air. Keputusan tentang fotonya ada di Kronik.</p>}
      </>:<p>Bagian cerita ini belum kalian jalani bersama.</p>}
    </Section>
    <Section label="11 · Potret" open><p>{visual?.visualContinuity??"Potret ini membantu kamu mengenal wajahnya. Ciri dan pakaiannya akan tetap sama saat kalian bertemu lagi."}</p></Section>
    <Section label="12 · Catatan terakhir" open>
      {current?.availability&&<p>{current.availability}</p>}
      {current?.playerDependentState&&<p>{current.playerDependentState}</p>}
      {npc&&bond?.talks?<p>Terakhir berbincang pada hari {bond.lastTalkDay}. Kalian telah bertemu {bond.talks} kali.</p>:
       self?<p>Hari {game.day}. Kamu sedang berada di {areaTitle(game.location)}.</p>:
       <p>Belum ada pertemuan yang tercatat.</p>}
    </Section>
   </div>}
  </div>
 </article>;
}

export default function CharacterGallery({game,residents,selectedId,onSelect}:{
 game:GameState;residents:readonly ResidentProfile[];selectedId:string|null;onSelect:(id:string|null)=>void;
}){
 const [search,setSearch]=useState(""),[page,setPage]=useState(0);
 const [loaded,setLoaded]=useState<{id:string;profile:CharacterBible|null;error?:boolean}|null>(null);
 const roster=useMemo<Citizen[]>(()=>residents.map(r=>({
  id:r.id,name:r.name,occupation:r.occupation,portrait:r.portrait,
  legacyId:r.legacyId,legacyApproved:r.legacyApproved===true
 })),[residents]);
 const query=search.trim().toLocaleLowerCase("id");
 const matches=roster.filter(c=>(c.name+" "+c.occupation).toLocaleLowerCase("id").includes(query));
 const pages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE)),activePage=Math.min(page,pages-1);
 const selected=roster.find(c=>c.id===selectedId);
 useEffect(()=>{
  const scroller=document.querySelector<HTMLElement>(".yzg-phone-content");
  if(scroller)scroller.scrollTop=0;
  if(!selectedId){return;}
  let alive=true;
  const load=async()=>{
   // Private Canon profiles take precedence and are requested only when viewing a citizen.
   if(residents.length){
    try{
     const response=await fetch("/api/game/resident-bible/"+encodeURIComponent(selectedId),{cache:"no-store"});
     if(response.ok){
      const data=await response.json() as {profile?:CharacterBible};
      if(alive)setLoaded({id:selectedId,profile:data.profile?.id===selectedId?data.profile:null});
      return;
     }
    }catch{ /* no private bio yet; do not infer legacy identity */ }
   }
   if(selected?.legacyApproved){
    try{
     const profile=await loadCharacterBible(selected.legacyId??selectedId);
     if(alive)setLoaded({id:selectedId,profile});
    }catch{if(alive)setLoaded({id:selectedId,profile:null,error:true});}
   }else if(alive)setLoaded({id:selectedId,profile:null});
  };
  void load();
  return()=>{alive=false;};
 },[selectedId,selected?.legacyApproved,selected?.legacyId,residents.length]);
 if(selected&&selectedId)return <WargaDetail key={selected.id} person={selected} game={game}
   profile={loaded?.id===selectedId?loaded.profile:null} loading={loaded?.id!==selectedId}
   onBack={()=>onSelect(null)}/>;
 return <section aria-label="Daftar warga">
  <div className="yzg-phone-card">
   <b>Warga</b><p>Cari orang yang ingin kamu kenal. Cerita pribadi mereka akan terbuka lewat pertemuan.</p>
   <label htmlFor="yzg-character-search">Cari nama atau pekerjaan</label>
   <input id="yzg-character-search" type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
     placeholder="Nama atau pekerjaan"/>
   <small role="status">{matches.length} warga dalam daftar ini</small>
   {!residents.length&&<p role="alert">Daftar 248 warga belum tersambung ke data resmi. Tidak ada identitas lama yang ditampilkan sebagai pengganti.</p>}
  </div>
  <div className="yzg-citizen-list">
   {matches.slice(activePage*PAGE_SIZE,(activePage+1)*PAGE_SIZE).map(person=><button
    type="button" className="yzg-phone-card yzg-character-card yzg-citizen-choice"
    data-character-card={person.id} aria-label={`Lihat profil ${person.name}`} key={person.id}
    onClick={()=>onSelect(person.id)}>
    <CitizenPhoto person={person}/><span><b>{person.name}</b><small>{person.occupation}</small>
     <small>{person.legacyApproved&&NPCS.some(n=>n.id===(person.legacyId??person.id))?
      game.bonds[(person.legacyId??person.id) as keyof typeof game.bonds]?.talks?"Sudah kenal":"Bisa ditemui di Pasirluyu":
      "Belum bertemu"}</small></span><span aria-hidden="true" className="yzg-citizen-chevron">›</span>
   </button>)}
  </div>
  {pages>1&&<nav className="yzg-citizen-pages" aria-label="Halaman warga">
   <button type="button" disabled={activePage===0} onClick={()=>setPage(activePage-1)}>Sebelumnya</button>
   <span>{activePage+1}/{pages}</span>
   <button type="button" disabled={activePage+1>=pages} onClick={()=>setPage(activePage+1)}>Berikutnya</button>
  </nav>}
  {!matches.length&&<p role="status">Belum ada warga dengan nama atau pekerjaan itu.</p>}
 </section>;
}
