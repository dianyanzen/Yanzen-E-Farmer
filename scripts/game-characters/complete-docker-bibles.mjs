#!/usr/bin/env node
/**
 * Docker Character Bible compiler: keeps ALL identity and portrait keys from the
 * local private Docker roster. Legacy fiction is a proposal, NEVER a biography.
 * Output stays under gitignored deploy/private, not in the public web bundle.
 */
import {createHash} from "node:crypto";
import {existsSync,readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {draftResidentBible,makePublishedResidentBibles} from "./build-resident-bibles.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const privateDir=join(root,"deploy","private");
const legacyDir=join(root,"game-assets","imported","YZ_Farm_Life_Bandung_151");
const storyFiles={
 characters:"data/karakter.json",
 traits:"data/ciri_karakter.json",
 stories:"cerita-kota/kisah_npc.json",
 routines:"cerita-kota/rutinitas_cerita.json"
};
function readOptional(path){
 if(!existsSync(path))return null;
 return JSON.parse(readFileSync(path,"utf8").replace(/^\uFEFF/,""));
}
function authoredProfile(id){
 const area=/^[AC]/.test(id)?"core":"expansion";
 if(!/^[ACNKP]\d{2}$/.test(id))return null;
 return readOptional(join(root,"game-assets","characters","profiles",area,id+".json"));
}
const alias=(name)=>name.trim().normalize("NFKC").toLocaleLowerCase("id");
function continuity(row,original){
 if(!original)return "new";
 const sameJob=alias(row.occupation)===alias(original.occupation);
 const oldName=alias(original.name),current=alias(row.name);
 if(sameJob&&current===oldName)return "unchanged";
 if(sameJob&&current.startsWith(oldName+" "))return "expanded";
 return "recast";
}
function pathFor(portrait){
 const category=/^R\d{3}$/.test(portrait)?"residents":
  /^K\d{2}$/.test(portrait)?"neighborhood":
  /^N\d{2}$/.test(portrait)?"specialists":
  /^P\d{2}$/.test(portrait)?"civic":
  /^phone-/.test(portrait)?"phone":"professions";
 return "/game/assets/portraits/bandung/"+category+"/"+portrait+".png";
}
export function loadLegacyFiction(){
 const found={};
 for(const [key,file] of Object.entries(storyFiles))
  found[key]=readOptional(join(legacyDir,file))??[];
 return found;
}
export function makeCompleteDockerBibles(roster,known,legacy=loadLegacyFiction()){
 // Reuse strict four-field, unique-ID, public-figure and name validation.
 const drafts=makePublishedResidentBibles(roster,known),out={};
 for(const row of roster){
  const original=known.get(row.id),status=continuity(row,original);
  // Expanded legal-style names may retain high-quality fictional arcs, not real-life demographics.
  const authored=(status==="unchanged"||status==="expanded")?authoredProfile(row.id):null;
  const bible=structuredClone(authored&&authored.sections?authored:drafts[row.id]??draftResidentBible(row,status==="recast"));
  if(status==="expanded")bible.characterClass="docker-expanded-identity";
  if(status==="recast")bible.characterClass="docker-identity-revision";
  if(status==="unchanged")bible.characterClass=bible.characterClass??"authored-canon";
  if(status==="new")bible.characterClass="resident-expansion-concept";
  if(status!=="unchanged")bible.approval="draft-fictional-needs-human-review";
  bible.id=row.id;
  const sec=bible.sections;
  if(!sec||Object.keys(sec).length!==12)throw new Error("Bible lacks 12 sections: "+row.id);
  if(status==="expanded"){
   // Never silently turn a fictional short-name age or family into a factual dossier
   // about a named individual when Docker only verifies four identity fields.
   sec["01_core_identity"]={...sec["01_core_identity"],ageYears:null,ageStatus:"Belum ditetapkan dalam fiksi"};
   sec["07_background_history"]={...sec["07_background_history"],familyContext:"Belum ditetapkan; riwayat keluarga lama perlu peninjauan sebagai fiksi",sourceStatus:"Usulan lore fiktif, bukan biografi individu"};
  }
  sec["01_core_identity"]={...sec["01_core_identity"],name:row.name};
  sec["04_social_profile"]={...sec["04_social_profile"],occupation:row.occupation};
  sec["11_visual_references"]={...sec["11_visual_references"],
    conceptPortrait:pathFor(row.portrait),dockerPortraitId:row.portrait,
    visualContinuity:"Rujuk portrait Docker sebagai identitas visual utama; sheet ekspresi lama tidak menggantikannya."};
  // Only a matching occupation AND verified short-name alias may inherit old
  // fictional lore. A recast must start its personal history from scratch.
  if(status==="expanded"||status==="unchanged"){
   const traits=legacy.traits.filter(t=>t.karakter_id===row.id);
   const hobbies=traits.filter(t=>t.jenis==="hobi").map(t=>t.isi);
   const personality=traits.filter(t=>t.jenis==="kepribadian").map(t=>t.isi);
   if(hobbies.length)sec["04_social_profile"]={...sec["04_social_profile"],hobbies};
   if(personality.length)sec["05_personality"]={...sec["05_personality"],traits:personality};
   const story=legacy.stories.find(s=>s.npc===row.id);
   if(story){
    sec["07_background_history"]={...sec["07_background_history"],
      narrativeBackground:story.premis,
      sourceStatus:"Cerita fiksi katalog Bandung 151, membutuhkan tinjauan; bukan biografi individu"};
    sec["10_narrative_development"]={...sec["10_narrative_development"],
      storyArc:story.judul,establishedPremise:story.premis,
      implementation:"Usulan kisah; tidak otomatis menjadi misi yang sudah dimainkan"};
   }
   const schedule=legacy.routines.filter(s=>s.npc===row.id).map(s=>({
    condition:s.kondisi,time:s.jam,area:s.kelurahan,activity:s.aktivitas
   }));
   if(schedule.length)sec["12_continuity_current_state"]={...sec["12_continuity_current_state"],
     proposedRoutines:schedule, routineStatus:"Rancangan naratif; bukan jadwal runtime aktif"};
  }
  if(status==="recast"){
   sec["12_continuity_current_state"]={...sec["12_continuity_current_state"],
    legacySaveWarning:"Identitas berubah: jangan memindahkan kedekatan dan quest karakter lama secara otomatis",
    previousLoreStatus:"quarantined"};
  }
  sec["12_continuity_current_state"]={...sec["12_continuity_current_state"],
   identityReconciliation:status,sourceIdentity:row.id+" | "+row.name+" | "+row.occupation,
   portraitSource:"docker:"+row.portrait};
  out[row.id]=bible;
 }
 return out;
}
function run(){
 const args=process.argv.slice(2),inputIndex=args.indexOf("--input");
 const input=inputIndex>=0?args[inputIndex+1]:null;
 const action=args.includes("--write")?"write":args.includes("--check")?"check":"dry-run";
 const valid=new Set(["--input","--write","--check",input]);
 if(args.some(a=>!valid.has(a))||args.includes("--write")&&args.includes("--check"))
  throw new Error("Usage: node scripts/game-characters/complete-docker-bibles.mjs [--input deploy/private/residents.json] [--check|--write]");
 const roster=readOptional(resolve(process.cwd(),input||join(privateDir,"residents.json")));
 if(!roster)throw new Error("Roster Docker tidak ditemukan: gunakan --input ke file privat.");
 const knownRows=[
  ...readOptional(join(root,"game-assets","catalog","cast.json")).characters,
  ...readOptional(join(root,"src","lib","game","data","bandung-character-previews.json"))
 ];
 const known=new Map(knownRows.map(c=>[c.id,c]));
 const bibles=makeCompleteDockerBibles(roster,known);
 const report={total:roster.length,bibles:Object.keys(bibles).length,
  byStatus:{unchanged:0,expanded:0,recast:0,new:0},
  legacyStories:0,draftCount:0,portraitIds:new Set(roster.map(r=>r.portrait)).size};
 for(const row of roster){
  const profile=bibles[row.id],status=profile.sections["12_continuity_current_state"].identityReconciliation;
  report.byStatus[status]++;
  if(profile.sections["07_background_history"].narrativeBackground)report.legacyStories++;
  if(profile.approval?.includes("draft"))report.draftCount++;
 }
 const output=JSON.stringify(bibles,null,2)+"\n";
 const file=join(privateDir,"resident-bibles.json");
 const digest=createHash("sha256").update(output).digest("hex");
 if(action==="check"){
  if(!existsSync(file)||readFileSync(file,"utf8").replace(/\r\n/g,"\n")!==output)
   throw new Error("Bible privat belum sesuai roster Docker. Jalankan --write.");
 }else if(action==="write"){
  mkdirSync(privateDir,{recursive:true});
  writeFileSync(file,output,{encoding:"utf8",mode:0o600});
  writeFileSync(join(privateDir,"character-bible-audit.json"),
   JSON.stringify({...report,sha256:digest},null,2)+"\n",{encoding:"utf8",mode:0o600});
 }
 console.log(JSON.stringify({mode:action,...report,sha256:digest}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{run()}catch(e){console.error(e.message);process.exitCode=1;}
}
