import type { GameState, Dialogue, NpcId } from "./model";
import { sellableCucumbers } from "./model";

export type QuestStep = { phase:1|2|3|4; day:number; baseline:number };
export type QuestBook = Partial<Record<NpcId,QuestStep>>;
type Tale = {
  title:string; contact:NpcId; errand:string; work:string; fee:number;
  offer:string[]; reply:string[]; handover:string[]; ending:string[];
};

export const tales:Record<NpcId,Tale> = {
  A03:{
    title:"Air sampai ke hilir",contact:"C01",errand:"Tanyakan kepada Nani kapan air tiba di kebunnya.",work:"Buka pintu air, lalu laporkan kepada Ryan saat aliran masih terbuka.",fee:90,
    offer:["Coba dengarkan sebentar dari atas jembatan. Bunyi air di kiri lebih berat daripada yang di kanan. Kemarin dua bedeng di hilir masih kering waktu aku pulang.",
      "Aku bisa membaca garis pada batu, tapi Nani yang tahu kapan air benar-benar sampai. Tanyakan kepadanya apa yang ia lihat sore kemarin. Bawa jawabannya sebelum kita menyalahkan pintu air."],
    reply:["Sore kemarin aku sedang mencuci pot. Dua helai daun lewat dulu, baru lumpur halusnya tiba. Kusangka hujan turun di hulu, padahal langit terang.",
      "Minta Ryan mencatat jedanya. Buka pintu air dari tangga di tepi timur, lalu cari dia selagi air mengalir."],
    handover:["Dengar? Gemericiknya sudah sampai ke batu kedua. Kutandai tinggi airnya di lembar ini. Besok kita bisa membandingkannya dengan bekas basah setelah semalam.",
      "Terima kasih sudah berjalan bolak-balik. Mampir besok. Aku ingin menunjukkan apa yang dapat dibaca dari dua garis kecil ini."],
    ending:["Garis bawahnya masih gelap pagi ini. Berarti air sempat meresap, persis seperti pengamatan Nani.",
      "Untuk pertama kalinya buku ini punya dua kolom: tinggi pintu di hulu dan kabar kebun di hilir. Namamu kutulis di sebelah pengamatan pertama."]
  },
  C01:{
    title:"Halaman yang kembali tumbuh",contact:"A04",errand:"Minta saran Ayu tentang bibit untuk halaman.",work:"Rawat setidaknya satu petak tanaman hidup sampai tersiram, periksa meja semai di samping rumah Yanzen, lalu temui Nani.",fee:75,
    offer:["Dulu kalau ada tetangga baru, kami membawa satu pot ke rumahnya. Lama-lama semua orang tahu siapa menanam apa hanya dari melihat teras.",
      "Potku tinggal dua. Aku ingin memulainya lagi dari bedeng kecil. Ayu pernah menyelamatkan semaian yang layu di pasar. Tanyakan bagaimana ia mengatur airnya."],
    reply:["Di lapak, aku menyentuh tanah sebelum menyiram. Kalau jari masih membawa tanah basah, kubiarkan akarnya bernapas.",
      "Coba pada tanamanmu sendiri. Tanam benih di petak yang sudah dicangkul, siram, lalu ceritakan pada Nani saat tanahnya masih lembap."],
    handover:["Tanah yang kamu gambarkan itu pas. Coba angkat pot yang ini. Ringan sekali, ya? Sekarang aku tahu pot mana yang harus mendapat air lebih dulu.",
      "Aku akan menyiapkan tempat di teras malam ini. Besok mampir sebentar, sebelum kamu sibuk dengan kebun."],
    ending:["Pagi tadi seorang anak berhenti di teras, bertanya apa daun kecil itu akan menjadi bunga. Sudah lama tak ada yang berhenti untuk bertanya begitu.",
      "Ini untuk mengganti waktumu mengurus bedeng. Suatu hari aku ingin bertukar tanaman lagi dengan seluruh gang."]
  },
  C08:{
    title:"Dua toples di meja pasar",contact:"C07",errand:"Cari Widi dan tanyakan kapan kiriman ikan tiba.",work:"Bawa dua timun tambahan kepada Inggit. Cadangan pesanan utama tetap disisihkan.",fee:110,
    offer:["Kalau pasar mulai sepi, aku biasanya membalik toples acar supaya timunnya tetap terendam. Minggu ini ada dua toples kosong menungguku.",
      "Widi menjanjikan kiriman untuk makan siang para pedagang. Tanyakan jamnya. Aku perlu tahu apakah timun harus dipotong sekarang atau setelah pasar tutup."],
    reply:["Tadi petinya sudah sampai. Aku akan membersihkan ikan selepas lapak buka. Yang paling lama ternyata membagi es agar pedagang terakhir masih kebagian.",
      "Sampaikan pada Inggit bahwa lauknya beres. Dia memerlukan dua timun segar selain pesanan empat timun yang pernah ia pesan."],
    handover:["Yang kecil masuk toples pertama, yang besar kupotong tipis untuk toples kedua. Dua timun ini cukup kalau irisan terakhirnya ikut dipakai.",
      "Biar cuka bekerja semalam. Datang lagi besok dan kita lihat toples mana yang lebih dulu habis."],
    ending:["Toples yang irisannya tipis habis bahkan sebelum nasi kedua matang. Resepnya sekarang kutulis di belakang daftar belanja.",
      "Ini bagianmu. Nanti kalau melihat dua toples di meja, kamu tahu siapa yang ikut mengisinya."]
  },
  A04:{
    title:"Benih untuk musim berikutnya",contact:"C08",errand:"Tanyakan jenis panen yang dicari Inggit.",work:"Panen dua timun setelah berbicara dengan Inggit, lalu laporkan kepada Ayu.",fee:95,
    offer:["Orang membeli benih dengan bertanya berapa hari sampai panen. Jarang ada yang bertanya siapa yang akan membeli hasilnya.",
      "Aku ingin menulis catatan kecil di bungkus benih. Tanyakan kepada Inggit hasil seperti apa yang masuk ke dapurnya."],
    reply:["Timun yang masih padat paling mudah kuiris. Kalau keburu besar sekali, bijinya perlu kukeruk dan satu piring hanya dapat sedikit.",
      "Petik dua hasil dari kebunmu setelah percakapan ini. Catat kapan kamu memetiknya; Ayu perlu mendengar pengalaman orang yang memanen sendiri."],
    handover:["Dua kali memetik cukup untuk catatan pertama. Nah, tulisan di bungkus ini mulai terasa seperti nasihat tetangga.",
      "Aku mau mencoba membacakannya kepada pembeli besok. Mampirlah lagi, aku penasaran bagian mana yang mereka tanyakan."],
    ending:["Pembeli pertamaku tadi bertanya kapan harus memeriksa buah yang kedua. Ia rupanya sudah memikirkan panen berikutnya!",
      "Kuberi tanda kecil di bungkus pertama untuk mengingat kebun asal catatan ini. Ini upahmu membantu percobaan."]
  },
  C07:{
    title:"Buku tangkapan dermaga",contact:"A03",errand:"Tanyakan kepada Ryan bagaimana mengenali arus yang tenang.",work:"Dapatkan dua tangkapan baru di lokasi pancing setelah mendengar penjelasan Ryan.",fee:120,
    offer:["Hargaku tertulis rapi di papan, tapi asal ikan masih sering hilang ketika orang pulang dari pasar. Aku mulai mencatatnya di buku kecil ini.",
      "Sebelum melempar kail, tanya Ryan bagaimana ia melihat arus dari tepi. Bawa pelet dan simpan ikanmu di keranjang."],
    reply:["Lihat permukaan di balik batu, bukan hanya buih putih dekat pintu air. Pelampung jauh lebih mudah terlihat di air yang tenang.",
      "Periksa lokasi pancing yang ditandai. Pakai joran dan sisakan pelet untuk lemparan kedua. Widi ingin mendengar tentang dua tangkapan baru."],
    handover:["Dua tangkapan dari satu pemancing memberi catatan yang lebih rapi. Ikannya tetap milikmu, boleh dibawa pulang atau dijual di lapakku.",
      "Aku akan menyalin catatannya sebelum es berikutnya datang. Besok lihat halaman pertama buku ini."],
    ending:["Sekarang aku bisa menjawab saat pembeli bertanya dari mana ikan ini datang. Mereka bahkan mulai mengenali bentuk ekornya.",
      "Kubayar waktumu dari kas lapak. Terus isi keranjangmu, dan bawalah hasil yang ingin kamu jual langsung kepadaku."]
  }
};
function tally(s:GameState,id:NpcId){
  if(id==="A04")return s.stats.harvests;
  if(id==="C07")return s.fishing?.caught??0;
  return 0;
}
function ready(s:GameState,id:NpcId,q:QuestStep){
  if(id==="A03")return !!s.sluiceOpen;
  if(id==="C01")return !!s.nurseryChecked;
  if(id==="C08")return sellableCucumbers(s)>=2;
  return tally(s,id)-q.baseline>=2;
}
export function questObjective(s:GameState,id:NpcId) {
  const q=s.personalQuests?.[id], t=tales[id];
  if(!q)return "Bicarakan permintaan ini dengan pemiliknya.";
  if(q.phase===1)return t.errand;
  if(q.phase===2)return t.work;
  if(q.phase===3)return "Kembali kepada pemberi misi mulai hari "+(q.day+1)+".";
  return "Selesai";
}
export function questTalks(s:GameState,person:NpcId){
  return (Object.keys(tales) as NpcId[]).filter(id=>{
    const q=s.personalQuests?.[id];
    return q?.phase!==4 && (person===id || (q?.phase===1 && tales[id].contact===person));
  });
}
export function questTalk(s:GameState,person:NpcId,id:NpcId):Dialogue & {state:GameState}{
  const t=tales[id],q=s.personalQuests?.[id];
  const base={title:t.title,npcId:person};
  if(!questTalks(s,person).includes(id))return {...base,state:s,lines:["Urusan itu sudah tercatat di jurnal."]};
  let phase:QuestStep["phase"];
  let lines:string[];
  let state=s;
  if(!q){phase=1;lines=t.offer;}
  else if(q.phase===1 && person===t.contact){phase=2;lines=t.reply;}
  else if(q.phase===2 && person===id && ready(s,id,q)){
    phase=3;lines=t.handover;
    if(id==="C08")state={...s,harvested:s.harvested-2};
  }else if(q.phase===3 && person===id && s.day>q.day){
    phase=4;lines=[...t.ending,"Imbalan "+t.fee+" G dan 45 poin kedekatan."];
    const bond=s.bonds[id];
    state={...s,coins:Math.min(99999999,s.coins+t.fee),bonds:{...s.bonds,[id]:{...bond,points:Math.min(1000,bond.points+45)}}};
  }else{return {...base,state:s,lines:[questObjective(s,id)]};}
  state={...state,personalQuests:{...s.personalQuests,[id]:{phase,day:s.day,baseline:tally(s,id)}}};
  return {...base,state,lines};
}
