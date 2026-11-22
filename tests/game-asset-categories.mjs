import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {ASSET_CATEGORIES,categorizeMedia} from "../scripts/game-assets/asset-category-rules.mjs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const source=read("game-assets/catalog/asset-database.json");
const index=read("game-assets/library/index.json");
assert.equal(index.totalMedia,source.rows.length);
assert.equal(index.uniqueContents,source.stats.uniqueBlobs);
assert.equal(index.categories.length,ASSET_CATEGORIES.length);
const sourcePaths=new Set(source.rows.map(r=>r[0])),seen=new Set();
for(const category of index.categories){
 const folder="game-assets/library/"+category.id+"/index.json";
 const info=read(folder);
 assert.equal(info.mediaCount,category.mediaCount);
 let count=0;
 for(const group of info.sections){
  for(const path of group.files){
   assert.ok(sourcePaths.has(path),"Library path not in database: "+path);
   assert.equal(categorizeMedia(path).category,category.id);
   assert.ok(existsSync(path),"Missing indexed media: "+path);
   assert.ok(!seen.has(path),"Media present in two category folders: "+path);
   seen.add(path);count++;
  }
 }
 assert.equal(count,info.mediaCount,category.id+" count mismatch");
}
assert.equal(seen.size,source.rows.length);
const publicConcepts=source.rows.filter(r=>r[0].startsWith("public/game/assets/portraits/bandung/"));
assert.equal(publicConcepts.length,268);
const expected={neighborhood:30,specialists:6,civic:2,residents:179,professions:32,phone:19};
for(const [name,n] of Object.entries(expected))
 assert.equal(publicConcepts.filter(r=>r[0].startsWith("public/game/assets/portraits/bandung/"+name+"/")).length,n);
const moves=read("game-assets/catalog/asset-folder-migration-20261121.json");
assert.equal(moves.totalMoved,268);
for(const {from,to,sha} of moves.renames){
 assert.ok(!existsSync(from),"Flat concept asset still exists: "+from);
 assert.ok(existsSync(to),"Concept moved target missing: "+to);
 const currentSha=source.rows.find(r=>r[0]===to)?.[1];
 // 2026-11-21 migration SHA is historical and must remain unchanged even after
 // owner-authorized portrait replacement. The current asset must match the new QA ledger.
 if(to==="public/game/assets/portraits/bandung/professions/work-C07.png"){
  assert.equal(sha,"e5523827c9ae815516883e6805cf582c42218232","Preserve original Widi migration SHA");
  const ledger=read("docs/game-dev/characters/PORTRAIT_ASSET_AUDIT.json");
  assert.equal(currentSha,ledger.portraits.find(p=>p.id==="C07")?.gitBlobSha,"Widi replacement must match current portrait audit");
 }else assert.equal(currentSha,sha);
}
const code=readFileSync("src/lib/game/bandung-concept-portrait.ts","utf8");
assert.ok(code.includes("bandungConceptPortraitPath"));
assert.ok(readFileSync("src/app/game/dialogue-panel.tsx","utf8").includes("bandungConceptPortraitPath"),
 "ResidentPortrait must map the canonical portrait key through category-aware paths");
const gallery=readFileSync("src/app/game/character-gallery.tsx","utf8");
const warga=readFileSync("src/app/game/phone-wargapedia.tsx","utf8");
assert.ok(gallery.includes("<PhoneWargapedia")&&warga.includes("src={known.portraitUrl}")&&
 warga.includes("/game/data/npc/index.json")&&warga.includes("approvedLegacyId(currentResident)"),
 "Warga must use canonical indexed portrait URL; legacy ResidentPortrait is reserved for approved dialogue");
const registry=read("game-assets/catalog/npc-portrait-register.json");
for(const person of registry.characters)assert.ok(existsSync("public"+person.variant.workConcept));
if(existsSync(".git")){
 const report=execFileSync(process.execPath,["scripts/game-assets/build-asset-categories.mjs","--check"],{encoding:"utf8"});
 assert.match(report,/PASS:/);
}
console.log("PASS: "+source.rows.length+" media categorized once, concept portrait paths migrated, no missing targets.");
