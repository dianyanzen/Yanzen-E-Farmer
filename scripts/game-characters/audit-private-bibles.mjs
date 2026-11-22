#!/usr/bin/env node
/** Offline audit of the private canonical roster and all 248 private Character Bibles.
 * Prints only aggregate counts; never logs names, paths, dialogues or private values.
 */
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,isAbsolute,join} from "node:path";

const EXPECTED="cd19795344bbb4fefc0022a3f17d25135d79624de4d5d9c6c618699cc1f871a0";
const CATEGORIES=[
 "01_core_identity","02_physical_appearance","03_fashion_aesthetic","04_social_profile",
 "05_personality","06_psychological_profile","07_background_history","08_relationship_dynamics",
 "09_dialogue_behavior","10_narrative_development","11_visual_references",
 "12_continuity_current_state"
];
const file=value=>isAbsolute(value)?value:resolve(process.cwd(),value);
const input=process.env.GAME_RESIDENT_ROSTER||"deploy/private/residents.json";
const source=process.env.GAME_RESIDENT_BIBLES||"deploy/private/character-bibles.json";
const strict=process.argv.includes("--strict");
const failures=[];
let result={count:0,draft:0,approved:0,portraitFiles:0,alphaCapable:0,fieldSources:0,proposals:0,missingSections:0,legacyLinked:0};
const fail=reason=>{if(!failures.includes(reason))failures.push(reason);};
const readJson=path=>JSON.parse(readFileSync(file(path),"utf8"));
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
try{
 const injected=process.env.GAME_RESIDENT_ROSTER_JSON;
 const rosterSource=injected?JSON.parse(injected):readJson(input);
 const rows=Array.isArray(rosterSource)?rosterSource:rosterSource.currentRoster;
 const bible=readJson(source);
 if(!Array.isArray(rows)||rows.length!==248)throw Error("roster-count");
 const unique=(field)=>new Set(rows.map(r=>r[field])).size===248;
 if(!unique("id")||!unique("name")||!unique("portrait"))fail("canonical-uniqueness");
 const text=rows.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
  .map(r=>[r.id,r.name,r.occupation,r.portrait].join("|")+"\n").join("");
 const digest=createHash("sha256").update(text).digest("hex");
 if(digest!==(process.env.GAME_CANONICAL_ROSTER_SHA256||EXPECTED))fail("canonical-fingerprint");
 if(!isObject(bible)||!isObject(bible.profiles))throw Error("bible-shape");
 if(Object.keys(bible.profiles).length!==248)fail("bible-profile-count");
 if(strict&&(bible.schemaVersion<3||bible.canonicalFingerprintSha256!==digest))fail("enrichment-version-or-fingerprint");
 for(const resident of rows){
  const p=bible.profiles[resident.id];
  if(!isObject(p)){fail("missing-profile");continue;}
  result.count++;
  if(!["draft","approved"].includes(p.approval))fail("invalid-approval");
  if(p.approval==="draft")result.draft++;
  else result.approved++;
  if(strict&&p.approval!=="draft")fail("migration-approval-must-stay-draft");
  for(const k of ["id","name","occupation","portrait"]){
   if(p[k]!==resident[k])fail("canonical-fields-mismatch");
  }
  if(!isObject(p.sections)||CATEGORIES.some(k=>!isObject(p.sections[k]))||
    Object.keys(p.sections).length!==12){result.missingSections++;fail("missing-section");continue;}
  for(const key of CATEGORIES){
   const section=p.sections[key];
   if(key==="01_core_identity"&&section.name!==resident.name)fail("section-name-mismatch");
   if(key==="04_social_profile"&&section.occupation!==resident.occupation)fail("section-occupation-mismatch");
   if(key==="11_visual_references"&&section.portraitKey!==resident.portrait)fail("section-portrait-mismatch");
   if(strict){
    const ext=section.editorialAdditions;
    if(!isObject(ext)||!isObject(ext.values)||!isObject(ext.fieldSources)){
     fail("missing-editorial-metadata");continue;
    }
    const keys=Object.keys(ext.values);
    if(!keys.length||keys.some(k=>!isObject(ext.fieldSources[k])||
      typeof ext.fieldSources[k].source!=="string"||
      typeof ext.fieldSources[k].status!=="string"||
      ext.fieldSources[k].requiresHumanReview!==true)||
      Object.keys(ext.fieldSources).length!==keys.length)fail("field-source-incomplete");
    result.proposals+=keys.length;
    result.fieldSources+=Object.keys(ext.fieldSources).length;
   }
  }
  const key=resident.portrait;
  const group=key.startsWith("work-")?"professions":key.startsWith("phone-")?"phone":
   key.startsWith("R")?"residents":key.startsWith("K")?"neighborhood":
   key.startsWith("N")?"specialists":"civic";
  const picture=join(process.cwd(),"public/game/assets/portraits/bandung",group,key+".png");
  if(!existsSync(picture)){fail("portrait-file-missing");continue;}
  const header=readFileSync(picture).subarray(0,33);
  if(header.length<26||header.subarray(1,4).toString()!=="PNG"||
    header.subarray(12,16).toString()!=="IHDR"||
    header.readUInt32BE(16)===0||header.readUInt32BE(20)===0){
   fail("png-header-invalid");continue;
  }
  result.portraitFiles++;
  if([4,6].includes(header[25]))result.alphaCapable++;
  if(strict){
   if(p.enrichment?.reviewStatus!=="pending-manual-review")fail("missing-human-review");
   const data=p.sections["12_continuity_current_state"].editorialAdditions?.values;
   if(data?.playableRuntimeConfirmed!==false||
     data?.questIntegrationConfirmed!==false||
     data?.legacyAssociationApproved!==false)fail("unsafe-runtime-claim");
   if(["P01","P02"].includes(resident.id)){
    const psych=p.sections["06_psychological_profile"].editorialAdditions?.values;
    if(psych?.fictionalMotivationProposal!=null||psych?.fictionalInternalTension!=null)
     fail("public-cameo-psychology");
   }
  }
 }
}catch{fail("private-data-unreadable-or-invalid");}
const summary={ok:failures.length===0,strict,...result,issueCategories:failures.sort()};
console.log(JSON.stringify(summary));
if(!summary.ok)process.exitCode=1;
