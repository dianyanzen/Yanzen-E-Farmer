import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {mkdtempSync,readdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";

const root=process.cwd();
const work=mkdtempSync(join(root,"node_modules/.npc-roster-fixture-"));
const previousRoster=process.env.GAME_RESIDENT_ROSTER;
const previousJson=process.env.GAME_RESIDENT_ROSTER_JSON;
const previousDigest=process.env.GAME_CANONICAL_ROSTER_SHA256;
const previousLinks=process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
const previousBibles=process.env.GAME_RESIDENT_BIBLES;
// Test fixtures must never inherit a real server roster secret from CI/Vercel.
delete process.env.GAME_RESIDENT_ROSTER_JSON;
try{
 const categories=["professions","neighborhood","specialists","civic","residents"];
 const idMatches=/^(?:work-[AC]\d{2}|K\d{2}|N\d{2}|P0[12]|R\d{3})\.png$/;
 const portraits=categories.flatMap(group=>{
  const folder=resolve(root,"public/game/assets/portraits/bandung",group);
  return readdirSync(folder).filter(x=>idMatches.test(x)).sort().map(x=>x.replace(/\.png$/,""));
 });
 assert.ok(portraits.length>=248,"Public image inventory must cover 248 distinct portraits");
 const roster=Array.from({length:248},(_,i)=>({
  id:"W"+String(i).padStart(3,"0"),
  name:"PENGHUNI UJI "+String(i).padStart(3,"0"),
  occupation:"Profesi uji",
  portrait:portraits[i],
 }));
 const rosterPath=join(work,"roster.json");
 const approvalsPath=join(work,"approvals.json");
 const out=join(work,"private-residents.mjs");
 await build({entryPoints:["src/lib/game/private-residents.ts"],bundle:true,platform:"node",format:"esm",
  packages:"external",outfile:out,logLevel:"silent"});
 const {readPrivateResidents}=await import(pathToFileURL(out).href);
 process.env.GAME_RESIDENT_ROSTER=rosterPath;
 delete process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
 const withRoster=async records=>{
  const body=records.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
   .map(r=>[r.id,r.name,r.occupation,r.portrait].join("|")+"\n").join("");
  process.env.GAME_CANONICAL_ROSTER_SHA256=createHash("sha256").update(body).digest("hex");
  writeFileSync(rosterPath,JSON.stringify({schemaVersion:1,currentRoster:records}));
  return await readPrivateResidents();
 };
 // A previously deployed 248-person roster keeps its exact identity checks
 // while the owner's approved W026 occupation is applied.
 const published=JSON.parse(readFileSync(join(root,"game-assets/catalog/npc-public-roster.json"),"utf8")).currentRoster;
 const previousIyan=published.map(r=>r.id==="W026"?{...r,occupation:"Pengrajin peci"}:r);
 const migrated=await withRoster(previousIyan);
 assert.equal(migrated.length,248);
 assert.equal(migrated.find(r=>r.id==="W026").occupation,"Spesialis peternakan dan hewan");
 assert.equal((await withRoster(roster)).length,248,"Valid private roster loads");
 process.env.GAME_RESIDENT_ROSTER_JSON=JSON.stringify({schemaVersion:1,currentRoster:roster});
 assert.equal((await readPrivateResidents()).length,248,"Vercel secret environment value loads 248 NPCs");
 process.env.GAME_RESIDENT_ROSTER_JSON="{invalid-json";
 assert.equal((await readPrivateResidents()).length,0,"Broken secret does not fall back to stale Docker file");
 delete process.env.GAME_RESIDENT_ROSTER_JSON;
 assert.equal((await withRoster(roster.slice(0,247))).length,0,"No partial roster accepted");
 assert.equal((await withRoster([...roster.slice(0,247),roster[0]])).length,0,"Duplicate identity rejected");
 assert.equal((await withRoster([...roster.slice(0,247),{...roster[247],portrait:roster[0].portrait}])).length,0,"Duplicate portrait rejected");
 assert.equal((await withRoster([...roster.slice(0,247),{...roster[247],portrait:"R999"}])).length,0,"Missing portrait rejected");
 const first={...roster[0],name:"MONONIM"}; 
 assert.equal((await withRoster([first,...roster.slice(1)])).length,248,"One-word real names may be legitimate");
 // No overlapping IDs are automatically assigned old stories, even with exact occupations.
 assert.equal((await withRoster(roster))[0].legacyApproved,false);
 // Generate 248 private 12-section scaffolds without publishing personal records or fabricating biography.
 const biblesPath=join(work,"bibles.json");
 process.env.GAME_RESIDENT_BIBLES=biblesPath;
 execFileSync(process.execPath,["scripts/game-characters/seed-private-bibles.mjs"],{
  cwd:root,env:{...process.env,GAME_RESIDENT_ROSTER:rosterPath,GAME_RESIDENT_BIBLES:biblesPath}
 });
 const seed=JSON.parse(readFileSync(biblesPath,"utf8"));
 assert.equal(seed.count,248);
 assert.equal(Object.keys(seed.profiles).length,248);
 assert.ok(Object.values(seed.profiles).every(p=>Object.keys(p.sections).length===12&&p.approval==="draft"));
 assert.throws(()=>execFileSync(process.execPath,["scripts/game-characters/seed-private-bibles.mjs"],{
  cwd:root,stdio:"ignore",env:{...process.env,GAME_RESIDENT_ROSTER:rosterPath,GAME_RESIDENT_BIBLES:biblesPath}
 }),"Seed must never overwrite an edited private Bible");
 const privateLoader=join(work,"bible-reader.mjs");
 await build({entryPoints:["src/lib/game/private-resident-bibles.ts"],bundle:true,
  platform:"node",format:"esm",packages:"external",outfile:privateLoader,logLevel:"silent"});
 const {readPrivateResidentBible}=await import(pathToFileURL(privateLoader).href);
 assert.equal(await readPrivateResidentBible(roster[0]),null,"Unapproved Bible must not be exposed");
 const editorDraft=await readPrivateResidentBible(roster[0],{allowDraft:true});
 assert.equal(editorDraft?.approval,"draft","Explicit internal preview can read a draft without changing approval");
 assert.equal(editorDraft?.sections["01_core_identity"].name,roster[0].name,"Draft preview still uses canonical identity");
 assert.equal(await readPrivateResidentBible(roster[0]),null,"Editor preview must not affect the default approved-only reader");
 seed.profiles[roster[0].id].approval="approved";
 seed.profiles[roster[0].id].sections["01_core_identity"].name="NAMA USANG";
 seed.profiles[roster[0].id].sections["04_social_profile"].occupation="PEKERJAAN USANG";
 writeFileSync(biblesPath,JSON.stringify(seed));
 assert.equal(await readPrivateResidentBible(roster[0]),null,"Approval cannot publish placeholder biographical data");
 const sections=seed.profiles[roster[0].id].sections;
 for(const section of Object.values(sections)){
  for(const [key,value] of Object.entries(section)){
   if(typeof value==="string"&&/(Belum ditulis|Belum ditetapkan|Tinjau referensi potret)/i.test(value)){
    section[key]="Rincian karakter fiktif yang telah disunting";
   }
  }
 }
 sections["05_personality"].traits=["Perhatian","Bersahabat"];
 sections["09_dialogue_behavior"].sampleLine="Saya simpan catatan ini terlebih dahulu, nanti kita periksa bersama.";
 sections["10_narrative_development"].threeActBeats=[
  "Hari pertama menyusun rencana","Hari kedua menghadapi kendala","Hari ketiga mengambil keputusan"
 ];
 writeFileSync(biblesPath,JSON.stringify(seed));
 const approvedBible=await readPrivateResidentBible(roster[0]);
 assert.equal(approvedBible.sections["01_core_identity"].name,roster[0].name,"Use current canonical name");
 assert.equal(approvedBible.sections["04_social_profile"].occupation,roster[0].occupation,"Use current canonical occupation");
 const cast=JSON.parse(readFileSync("game-assets/catalog/cast.json","utf8")).characters;
 const old=cast.find(x=>x.id==="A03");
 assert.ok(old);
 writeFileSync(approvalsPath,JSON.stringify([{rosterId:roster[0].id,rosterName:roster[0].name,
   rosterOccupation:roster[0].occupation,legacyId:old.id,legacyName:old.name,
   legacyOccupation:old.occupation,approvedBy:"Game owner",approvedAt:"2026-11-22"}]));
 process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS=approvalsPath;
 const reviewed=await withRoster(roster);
 assert.equal(reviewed[0].legacyApproved,true);
 assert.equal(reviewed[0].legacyId,"A03");
 assert.equal(reviewed[1].legacyApproved,false);
 writeFileSync(approvalsPath,JSON.stringify([{rosterId:roster[0].id,rosterName:"STALE NAME",
   rosterOccupation:roster[0].occupation,legacyId:old.id,legacyName:old.name,
   legacyOccupation:old.occupation,approvedBy:"Game owner",approvedAt:"2026-11-22"}]));
 assert.equal((await withRoster(roster)).length,0,"Stale approval is fail-closed");
 console.log("PASS: private roster 248, one-word names, unique portraits, missing assets, manual legacy links");
}finally{
 if(previousDigest===undefined)delete process.env.GAME_CANONICAL_ROSTER_SHA256;
 else process.env.GAME_CANONICAL_ROSTER_SHA256=previousDigest;
 if(previousJson===undefined)delete process.env.GAME_RESIDENT_ROSTER_JSON;
 else process.env.GAME_RESIDENT_ROSTER_JSON=previousJson;
 if(previousRoster===undefined)delete process.env.GAME_RESIDENT_ROSTER;
 else process.env.GAME_RESIDENT_ROSTER=previousRoster;
 if(previousLinks===undefined)delete process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
 else process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS=previousLinks;
 if(previousBibles===undefined)delete process.env.GAME_RESIDENT_BIBLES;
 else process.env.GAME_RESIDENT_BIBLES=previousBibles;
 rmSync(work,{recursive:true,force:true});
}
