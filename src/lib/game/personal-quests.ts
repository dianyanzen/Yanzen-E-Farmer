import type { GameState, Dialogue, NpcId } from "./model";
import { sellableCucumbers, questPropActive } from "./model";
import { questPropById, type QuestPropId } from "./quest-props";

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
    title:"Buku tangkapan tepi sungai",contact:"A03",errand:"Tanyakan kepada Ryan bagaimana mengenali arus yang tenang.",work:"Dapatkan dua tangkapan baru di lokasi pancing setelah mendengar penjelasan Ryan.",fee:120,
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


/** Second authored request per active legacy NPC.
 * This additive save field intentionally never changes the existing first quest.
 * A later full quest-book migration can use stable quest IDs, not NPC ids.
 */
export type FollowUpStep = { phase:1|2|3; day:number; baseline:number };
export type FollowUpBook = Partial<Record<NpcId,FollowUpStep>>;
export const followUpTales:Record<NpcId,{title:string;prop:QuestPropId;fee:number;offer:string;found:string;ending:string}> = {
  A03:{
    title:"Jejak Dua Garis",prop:"water-marks",fee:65,
    offer:"Aku membawa contoh batu penanda dari dekat pintu air ke rumah. Ada dua garis yang perlu kucocokkan. Bisa periksa penandanya di meja rumahku?",
    found:"Batu penanda yang disimpan Ryan memiliki dua guratan. Yang atas memudar, sedangkan garis bawah masih berbekas lembap.",
    ending:"Nah, garis bawahnya memang masih basah. Aku catat tanggalnya dulu. Besok kalau berubah, kita punya pembanding."
  },
  C01:{
    title:"Pot yang Terlupa",prop:"nani-pots",fee:55,
    offer:"Ada dua pot di depan gang. Satu daunnya turun, satunya lagi tampak segar. Tolong periksa tanahnya, jangan langsung disiram dua-duanya.",
    found:"Pot kiri terasa kering pada permukaan; pot kanan masih menyimpan lembap di bawah daun.",
    ending:"Yang kanan memang belum perlu air. Bagus kamu memeriksa dulu, bukan asal menyiram. Bunga juga perlu bernapas."
  },
  A04:{
    title:"Menunggu Kecambah",prop:"ayu-seeds",fee:70,
    offer:"Nampan semaiku kusimpan di rumah agar tidak terkena angin pasar. Tunggu sampai besok, lalu mampir dan lihat apakah tunasnya mulai tampak.",
    found:"Beberapa ujung hijau kecil muncul di nampan. Tanahnya masih cukup lembap.",
    ending:"Tunas pertama biasanya kecil sekali. Catatanmu cukup untuk percobaan hari ini. Aku akan menyimpan amplopnya."
  },
  C07:{
    title:"Tiga Tanda di Air",prop:"widi-ledger",fee:85,
    offer:"Buku tangkapanku ada di meja rumah. Dapatkan dua ikan lagi setelah obrolan ini, lalu mampir ke rumah untuk mencatatnya.",
    found:"Dua tangkapan baru dicatat. Widi menyisakan tempat untuk mencatat ikan yang lepas pada kesempatan berikutnya.",
    ending:"Buku ini mulai terisi dari pengalamanmu sendiri. Tidak apa kalau tiap lemparan tidak berhasil; yang penting kamu tahu kapan harus menunggu."
  },
  C08:{
    title:"Pagi yang Sibuk",prop:"inggit-orders",fee:80,
    offer:"Keranjang untuk pesanan tambahan sudah kusiapkan di dapur rumah. Kalau hasil kebunmu cukup, antarkan dua timun ke sana. Jangan ganggu jatah pesanan utama.",
    found:"Dua timun tambahan tersusun di keranjang. Catatan pesanan Inggit kini diberi tanda sudah diterima.",
    ending:"Nah, pas. Aku bisa mulai menyiapkan bahan sebelum pembeli datang. Jangan sampai kamu sendiri lupa makan karena sibuk menolongku."
  }
};
export function followUpAvailable(s:GameState,id:NpcId):boolean{
  return s.personalQuests?.[id]?.phase===4 && s.followUpQuests?.[id]?.phase!==3;
}
export function followUpObjective(s:GameState,id:NpcId):string{
  const q=s.followUpQuests?.[id],t=followUpTales[id];
  if(!q)return "Bicaralah dengan "+(s.bonds[id]?.talks>0?"warga ini":"pemilik permintaan")+" untuk mendengar permintaannya.";
  if(q.phase===2)return "Kembali kepada pemberi permintaan untuk menyampaikan hasilnya.";
  if(q.phase===3)return "Selesai";
  if(id==="A04" && s.day<=q.day)return "Tidur sampai hari berikutnya, lalu periksa nampan semai di rumah Ayu.";
  if(id==="C07" && s.fishing.caught-q.baseline<2)return "Dapatkan dua tangkapan baru, lalu periksa buku di rumah Widi.";
  if(id==="C08" && sellableCucumbers(s)<2)return "Siapkan dua timun tambahan, lalu antarkan ke rumah Inggit.";
  return ({A03:"Periksa contoh batu ukur air di rumah Ryan.",C01:"Periksa pot Nani di gang.",A04:"Periksa nampan semai di rumah Ayu.",
    C07:"Catat hasil tangkapan di buku rumah Widi.",C08:"Antarkan dua timun tambahan ke keranjang dapur rumah Inggit."} as Record<NpcId,string>)[id]??t.title;
}
export function followUpTalk(s:GameState,id:NpcId):Dialogue & {state:GameState}{
  const t=followUpTales[id],q=s.followUpQuests?.[id];
  const base={npcId:id,title:t.title};
  if(!followUpAvailable(s,id))return {...base,state:s,lines:["Belum ada urusan baru untuk sekarang."]};
  if(!q){
    const next:FollowUpStep={phase:1,day:s.day,baseline:id==="C07"?s.fishing.caught:0};
    return {...base,state:{...s,followUpQuests:{...s.followUpQuests,[id]:next}},lines:[t.offer,followUpObjective({...s,followUpQuests:{...s.followUpQuests,[id]:next}},id)]};
  }
  if(q.phase===1)return {...base,state:s,lines:[followUpObjective(s,id)]};
  if(q.phase===2){
    const bond=s.bonds[id];
    const state:GameState={...s,
      followUpQuests:{...s.followUpQuests,[id]:{...q,phase:3}},
      coins:Math.min(99999999,s.coins+t.fee),
      bonds:{...s.bonds,[id]:{...bond,points:Math.min(1000,bond.points+35)}}};
    return {...base,state,lines:[t.ending,"Ini bagianmu, "+t.fee+" G."]};
  }
  return {...base,state:s,lines:["Urusan itu sudah selesai. Terima kasih."]};
}
/** Quest props only become inspectable after the right request is accepted,
 * and only in their real location. Neither proximity to other props nor an old
 * save can complete a mission before it is active.
 */
export function inspectFollowUpProp(s:GameState,propId:QuestPropId):{state:GameState;message:string}{
  const prop=questPropById(propId),id=prop.owner as NpcId,t=followUpTales[id];
  const q=s.followUpQuests?.[id];
  if(s.location!==prop.location || !questPropActive(s,prop))
    return {state:s,message:"Belum ada permintaan yang bisa dikerjakan di sini."};
  if(q.phase!==1)return {state:s,message:q.phase===2?"Catatanmu sudah siap. Sekarang laporkan kepada pemiliknya.":"Permintaan ini sudah selesai."};
  if(id==="A04"&&s.day<=q.day)return {state:s,message:"Tanah nampan masih tenang. Ayu memintamu memeriksanya lagi besok."};
  if(id==="C07"&&s.fishing.caught-q.baseline<2)return {state:s,message:"Belum ada dua tangkapan baru yang bisa dicatat. Coba memancing lagi."};
  if(id==="C08"&&sellableCucumbers(s)<2)return {state:s,message:"Keranjang membutuhkan dua timun tambahan. Simpan dulu jatah pesanan utama."};
  const state:GameState={...s,
    ...(id==="C08"?{harvested:s.harvested-2}:{}),
    followUpQuests:{...s.followUpQuests,[id]:{...q,phase:2}}};
  return {state,message:t.found+" Kembali dan ceritakan kepada "+({A03:"Ryan",C01:"Nani",A04:"Ayu",C07:"Widi",C08:"Inggit"} as Record<NpcId,string>)[id]+"."};
}
