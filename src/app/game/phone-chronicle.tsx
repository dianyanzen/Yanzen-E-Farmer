"use client";

import Image from "next/image";
import {useState} from "react";
import type {GameState} from "@/lib/game/model";
import type {ResidentProfile} from "@/lib/game/resident-profile";
import {approvedLegacyId} from "@/lib/game/legacy-identity";
import {chronicleExport,phoneChronicle} from "@/lib/game/phone-story";

type Pane="kisah"|"misi"|"jejak";
export default function PhoneChronicle({game,residents,onOpenWarga}:{game:GameState;residents:readonly ResidentProfile[];onOpenWarga:(id:string)=>void}){
 const currentCitizenForLegacy=(legacyId:string)=>residents.length?
   residents.find(r=>approvedLegacyId(r)===legacyId)?.id:null;
 const canLink=(legacyId:string)=>!residents.length||Boolean(currentCitizenForLegacy(legacyId));
 const link=(legacyId:string)=>onOpenWarga(currentCitizenForLegacy(legacyId)??legacyId);
 const [pane,setPane]=useState<Pane>("kisah");
 const [exportStatus,setExportStatus]=useState("");
 const [showExport,setShowExport]=useState(false);
 const record=phoneChronicle(game);
 const ready=record.missions.filter(q=>q.status!=="available");
 const available=record.missions.filter(q=>q.status==="available");
 const copy=async()=>{
  const content=chronicleExport(game);
  try{
   if(!navigator.clipboard?.writeText)throw new Error("clipboard-unavailable");
   await navigator.clipboard.writeText(content);
   setExportStatus("Catatan perjalananmu sudah disalin.");
  }catch{
   setExportStatus("Salin catatan dari kotak di bawah.");
   setShowExport(true);
  }
 };
 return <section aria-label="Kronik perjalanan" className="yzg-chronicle">
  <div className="yzg-phone-card yzg-chronicle-heading">
   <small>CATATAN PERJALANAN · HARI {game.day}</small>
   <h3>{record.chapter}</h3>
   <p>{record.recap}</p>
   <div className="yzg-chronicle-progress"><strong>Bab 1 · {record.percentage}%</strong>
    <span>{record.completed} dari {record.total} bagian</span></div>
   <progress value={record.completed} max={record.total} aria-label="Kemajuan cerita utama"/>
  </div>
  {residents.length>0&&<div className="yzg-phone-card"><p>Kronik ini menyimpan perjalanan dari versi cerita awal. Nama dan misi lama belum tentu milik warga baru; hanya tautan yang sudah diperiksa yang dibuka.</p></div>}
  <nav className="yzg-chronicle-tabs" aria-label="Isi kronik">
   {(["kisah","misi","jejak"] as const).map(id=><button type="button" key={id} aria-pressed={pane===id}
    onClick={()=>setPane(id)}>{id==="kisah"?"Kisah":id==="misi"?"Misi":"Jejak hari"}</button>)}
  </nav>
  {pane==="kisah"&&<>
   <div className="yzg-phone-card"><b>Setelah ini</b><p>{record.next}</p></div>
   <div className="yzg-phone-card"><b>Yang sudah terjadi</b>
    <ol className="yzg-chronicle-timeline">{record.timeline.map((item,i)=><li
     className={`yzg-chronicle-${item.status}`} key={item.id}>
     <span className="yzg-chronicle-marker">{item.status==="done"?"✓":item.status==="now"?"●":"○"}</span>
     <div><b>{item.status==="later"?"Belum terbuka":item.title}</b>
      <p>{item.status==="later"?"Catatan ini masih menunggu perjalananmu.":item.description}</p></div>
    </li>)}</ol>
   </div>
   {game.story.photoSeen&&<figure className="yzg-phone-card yzg-story-photo">
    <Image src="/game/assets/story/foto-saluran.png" alt="Ilustrasi foto lama saluran air milik Nani" width={400} height={267} sizes="240px"/>
    <figcaption>Foto saluran yang Nani tunjukkan kepadamu.</figcaption>
   </figure>}
   {record.choice&&<div className="yzg-phone-card">
    <b>Keputusan yang kamu ambil</b><p>{record.choice.text}</p>
    {record.choice.day!==null&&<small>Dicatat pada hari {record.choice.day}</small>}
   </div>}
   {record.completed===record.total&&<div className="yzg-phone-card"><b>Bab 1 selesai</b>
    <p>Kebun masih harus dirawat. Kamu juga masih bisa kembali berbincang dengan warga. Jalan ke kawasan berikutnya belum terbuka.</p>
   </div>}
  </>}
  {pane==="misi"&&<>
   <div className="yzg-phone-card"><b>Urusan warga</b><p>{record.activeMissions} sedang berjalan · {record.finishedMissions} sudah selesai.</p></div>
   {ready.length?ready.map(m=><article className="yzg-phone-card yzg-chronicle-quest" key={m.id}>
    <small>{m.status==="done"?"Selesai":m.step}</small><b>{m.title}</b><p>{m.objective}</p>
    {canLink(m.id)&&<button type="button" onClick={()=>link(m.id)}>Catatan {m.npc}</button>}
   </article>):<div className="yzg-phone-card"><p>Belum ada permintaan pribadi yang kamu ambil. Cobalah berbincang dengan warga saat mereka tidak sibuk.</p></div>}
   <details className="yzg-phone-card yzg-chronicle-unstarted">
    <summary>Permintaan yang belum kamu ambil ({available.length})</summary>
    {available.map(m=><div key={m.id}><b>{m.npc}</b><p>Bicaralah dengannya untuk mengetahui apakah ada yang perlu dibantu.</p>
      {canLink(m.id)&&<button type="button" onClick={()=>link(m.id)}>Lihat warga</button>}</div>)}
   </details>
  </>}
  {pane==="jejak"&&<>
   <div className="yzg-phone-card"><b>Sejak hari pertama</b>
    <div className="yzg-phone-stats">
     <span>Hari di kebun<strong>{record.day}</strong></span>
     <span>Panen<strong>{record.harvests}</strong></span>
     <span>Percakapan<strong>{record.conversations}</strong></span>
     <span>Malam berlalu<strong>{record.nights}</strong></span>
     <span>Warga dikenal<strong>{record.contacts}/{record.totalContacts}</strong></span>
     <span>Misi selesai<strong>{record.finishedMissions}</strong></span>
    </div>
    {record.lastContact&&<p>Terakhir mengobrol dengan {record.lastContact.name} pada hari {record.lastContact.day}.</p>}
   </div>
   <div className="yzg-phone-card"><b>Orang yang sudah kamu kenal</b>
    {record.relationshipSummary.length?
      record.relationshipSummary.map(person=><button type="button" className="yzg-chronicle-person"
       key={person.id} disabled={!canLink(person.id)} onClick={()=>link(person.id)}>
       <span>{person.name} · Kedekatan Lv. {person.level}</span><small>{person.talks} percakapan</small>
      </button>):
      <p>Belum ada percakapan yang tercatat. Mulailah dengan tetangga dekat kebun.</p>}
   </div>
   <div className="yzg-phone-card"><b>Catatan yang tersimpan</b>
    <p>Catatan ini mengikuti perjalananmu. Beberapa kejadian lama belum punya tanggal yang pasti.</p>
    <button type="button" onClick={()=>void copy()}>Salin ringkasan cerita</button>
    {exportStatus&&<p role="status">{exportStatus}</p>}
    {showExport&&<textarea className="yzg-chronicle-export" aria-label="Catatan cerita untuk disalin"
      readOnly rows={8} value={chronicleExport(game)} onFocus={e=>e.currentTarget.select()}/>}
   </div>
  </>}
 </section>;
}
