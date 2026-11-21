/** YZ Phone's personal chronicle is reconstructed from the existing v1 save.
 * Never invent completion dates, visited places, NPC memories or choices.
 * No state migration and no network call is required.
 */
import {chapterJournal,NPCS,bondLevel,type GameState,type NpcId} from "./model";
import {questObjective,tales} from "./personal-quests";

export type ChronicleStatus="done"|"now"|"later";
export type ChronicleBeat={id:string;title:string;description:string;status:ChronicleStatus};
const marker:ReadonlyArray<{id:string;title:string;done:(s:GameState)=>boolean;description:(s:GameState)=>string}>=[
 {id:"order",title:"Pesan dari Inggit",done:s=>s.story.orderAccepted,
  description:()=> "Kamu menerima pesanan empat timun untuk warung Inggit."},
 {id:"harvest",title:"Empat timun diantarkan",done:s=>s.story.orderDone,
  description:()=> "Empat timun sampai ke tangan Inggit. Warung membayar hasil kerjamu."},
 {id:"canal",title:"Dua tanda di pintu air",done:s=>s.story.canalClue,
  description:()=> "Ryan menunjukkan dua garis pada batu di dekat saluran air lama."},
 {id:"photo",title:"Foto lama Nani",done:s=>s.story.photoSeen,
  description:()=> "Nani menunjukkan foto pintu air yang menyimpan cerita keluarga."},
 {id:"choice",title:"Menentukan tempat foto",done:s=>s.story.photoChoice!==null,
  description:s=>s.story.photoChoice==="nani"
   ? "Foto asli tetap bersama Nani. Ia sendiri yang memutuskan kapan kisah keluarganya dibagikan."
   : "Foto asli tetap bersama Nani. Salinannya dititipkan di warung agar warga dapat menambahkan nama."}
];
export function phoneChronicle(s:GameState){
 const journal=chapterJournal(s);
 const completed=marker.filter(m=>m.done(s)).length;
 const timeline:ChronicleBeat[]=marker.map((m,i)=>({
  id:m.id,
  title: i>completed ? "Catatan berikutnya" : m.title,
  description:m.done(s)?m.description(s):i===completed?journal.objective:"Belum sampai ke bagian ini.",
  status:m.done(s)?"done":i===completed?"now":"later"
 }));
 const missions=NPCS.map(npc=>{
  const q=s.personalQuests?.[npc.id];
  const status=q?.phase===4?"done":q?"active":"available";
  const step=q?.phase===1?"Mencari kabar":q?.phase===2?"Mengerjakan permintaan":q?.phase===3?"Menunggu kabar":q?.phase===4?"Selesai":"Belum dimulai";
  return {id:npc.id as NpcId,npc:npc.name,title:tales[npc.id].title,status,step,objective:questObjective(s,npc.id)};
 });
 const finishedMissions=missions.filter(q=>q.status==="done").length;
 const activeMissions=missions.filter(q=>q.status==="active").length;
 const connected=NPCS.filter(n=>s.bonds[n.id]?.talks>0);
 const mostRecent=[...connected].sort((a,b)=>s.bonds[b.id].lastTalkDay-s.bonds[a.id].lastTalkDay)[0];
 const passage=[
   "Kamu mulai mengurus kebun kecil di Pasirluyu.",
   ...marker.filter(m=>m.done(s)).map(m=>m.description(s))
 ];
 const recap=passage.join(" ");
 const choice=s.story.photoChoice===null?null:{
  day:s.story.completedDay,
  text:marker[4].description(s)
 };
 return {chapter:"Empat Timun dan Satu Nama",day:s.day,completed,total:marker.length,
  percentage:Math.round(completed/marker.length*100),stage:journal.stage,
  next:journal.objective,timeline,recap,choice,missions,finishedMissions,activeMissions,
  contacts:connected.length,totalContacts:NPCS.length,
  lastContact:mostRecent?{name:mostRecent.name,day:s.bonds[mostRecent.id].lastTalkDay}:null,
  harvests:s.stats.harvests,conversations:s.stats.conversations,nights:s.stats.nights,
  relationshipSummary:connected.map(n=>({id:n.id,name:n.name,level:bondLevel(s.bonds[n.id].points),talks:s.bonds[n.id].talks}))
 };
}
export function chronicleExport(s:GameState){
 const c=phoneChronicle(s);
 const lines=[
  "Catatan YZ Farm Life",`Hari ${c.day} · ${c.chapter}`,
  `Bab 1: ${c.completed}/${c.total} bagian (${c.percentage}%)`,
  "Kisah sejauh ini:",c.recap,
  "Berikutnya: "+c.next,
  "Jejak cerita:",...c.timeline.map(m=>`- ${m.status==="done"?"Selesai":m.status==="now"?"Sekarang":"Belum"}: ${m.title} — ${m.description}`),
  "Misi warga:",...c.missions.map(m=>`- ${m.npc}: ${m.title} (${m.step}) — ${m.objective}`),
  "Catatan kegiatan:",`${c.harvests} kali panen, ${c.conversations} percakapan, ${c.nights} malam beristirahat.`,
  c.choice?"Keputusan foto: "+c.choice.text:"",
 ].filter(Boolean);
 return lines.join("\n");
}
