#!/usr/bin/env node
/** Local-only 248-person Bible scaffold. No personal roster data is committed. */
import {existsSync,readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve,isAbsolute} from "node:path";
const root=process.cwd(),input=process.env.GAME_RESIDENT_ROSTER||"deploy/private/residents.json";
const output=process.env.GAME_RESIDENT_BIBLES||"deploy/private/character-bibles.json";
const file=p=>isAbsolute(p)?p:resolve(root,p);
if(existsSync(file(output))){
 console.error("Character Bible sudah ada. Tidak ditimpa; pertahankan catatan editorial.");
 process.exit(1);
}
let raw;
try{raw=JSON.parse(readFileSync(file(input),"utf8"));}
catch{console.error("Roster privat tidak ditemukan atau JSON tidak valid.");process.exit(1);}
const people=Array.isArray(raw)?raw:raw?.currentRoster;
if(!Array.isArray(people)||people.length!==248){
 console.error("Roster harus berisi tepat 248 NPC sebelum menyiapkan Character Bible.");process.exit(1);
}
const keys=people.map(p=>p?.id),names=people.map(p=>p?.name);
if(keys.some(x=>typeof x!=="string")||names.some(x=>typeof x!=="string")||
  new Set(keys).size!==248||new Set(names.map(s=>s.toLocaleLowerCase("id"))).size!==248){
 console.error("ID atau nama kosong/duplikat; perbaiki roster privat terlebih dahulu.");process.exit(1);
}
const profile=p=>({
 id:p.id,approval:"draft",characterClass:"canonical-private",
 notes:"Tokoh fiksi yang menggunakan daftar identitas katalog; karakterisasi bukan keterangan faktual tentang individu sungguhan.",
 sections:{
 "01_core_identity":{name:p.name,ageYears:null,origin:"Belum ditulis",language:"Belum ditulis",identity:"Identitas karakter dalam game"},
 "02_physical_appearance":{general:"Belum ditulis",physicalTraits:"Tinjau referensi potret sebelum menulis"},
 "03_fashion_aesthetic":{signatureClothing:"Belum ditulis",styleReason:"Belum ditulis"},
 "04_social_profile":{occupation:p.occupation,communityActivity:"Belum ditulis",hobbies:[]},
 "05_personality":{traits:[],observableHabit:"Belum ditulis",values:"Belum ditulis",weakness:"Belum ditulis"},
 "06_psychological_profile":{primaryMotivation:"Belum ditulis",innerConflict:"Belum ditulis",fear:"Belum ditulis"},
 "07_background_history":{familyContext:"Belum ditulis",formativeMemory:"Belum ditulis"},
 "08_relationship_dynamics":{connections:[],personalBoundary:"Belum ditulis"},
 "09_dialogue_behavior":{speechSignature:"Belum ditulis",sampleLine:"Belum ditulis",habitualGesture:"Belum ditulis"},
 "10_narrative_development":{storyArc:"Belum ditulis",threeActBeats:[],implementation:"Belum aktif di game"},
 "11_visual_references":{conceptPortrait:p.portrait,visualContinuity:"Verifikasi kecocokan kunci potret dan art style"},
 "12_continuity_current_state":{availability:"Katalog pribadi",playerDependentState:"Belum ditetapkan"}
 }
});
mkdirSync(dirname(file(output)),{recursive:true});
writeFileSync(file(output),JSON.stringify({schemaVersion:1,count:248,profiles:
 Object.fromEntries(people.map(p=>[p.id,profile(p)]))},null,2)+"\n",{flag:"wx",mode:0o600});
console.log("PASS: 248 rancangan Character Bible privat, masing-masing 12 kategori. Semua masih DRAFT; tanpa identitas yang ditebak.");
