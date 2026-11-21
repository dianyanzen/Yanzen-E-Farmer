import assert from "node:assert/strict";
import {existsSync,mkdirSync,mkdtempSync,readdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";

const root=process.cwd();
const work=mkdtempSync(join(root,"node_modules/.npc-roster-fixture-"));
const previousRoster=process.env.GAME_RESIDENT_ROSTER;
const previousLinks=process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
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
  writeFileSync(rosterPath,JSON.stringify({schemaVersion:1,currentRoster:records}));
  return await readPrivateResidents();
 };
 assert.equal((await withRoster(roster)).length,248,"Valid private roster loads");
 assert.equal((await withRoster(roster.slice(0,247))).length,0,"No partial roster accepted");
 assert.equal((await withRoster([...roster.slice(0,247),roster[0]])).length,0,"Duplicate identity rejected");
 assert.equal((await withRoster([...roster.slice(0,247),{...roster[247],portrait:roster[0].portrait}])).length,0,"Duplicate portrait rejected");
 assert.equal((await withRoster([...roster.slice(0,247),{...roster[247],portrait:"R999"}])).length,0,"Missing portrait rejected");
 const first={...roster[0],name:"MONONIM"}; 
 assert.equal((await withRoster([first,...roster.slice(1)])).length,248,"One-word real names may be legitimate");
 // No overlapping IDs are automatically assigned old stories, even with exact occupations.
 assert.equal((await withRoster(roster))[0].legacyApproved,false);
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
 if(previousRoster===undefined)delete process.env.GAME_RESIDENT_ROSTER;
 else process.env.GAME_RESIDENT_ROSTER=previousRoster;
 if(previousLinks===undefined)delete process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS;
 else process.env.GAME_APPROVED_LEGACY_ASSOCIATIONS=previousLinks;
 rmSync(work,{recursive:true,force:true});
}
