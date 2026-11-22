import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {execFileSync} from "node:child_process";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const index=load("game-assets/characters/profiles/index.json");
const cast=load("game-assets/catalog/cast.json").characters;
const expansions=load("src/lib/game/data/bandung-character-previews.json");
const portraits=load("game-assets/catalog/npc-portrait-register.json").characters;
const artwork=load("game-assets/characters/profiles/unassigned-artwork.json");
const assets=load("game-assets/catalog/asset-database.json");
const assetShas=new Map(assets.rows.map(r=>[r[0],r[1]]));
const categories=["01_core_identity","02_physical_appearance","03_fashion_aesthetic","04_social_profile","05_personality","06_psychological_profile","07_background_history","08_relationship_dynamics","09_dialogue_behavior","10_narrative_development","11_visual_references","12_continuity_current_state"];
assert.equal(index.schemaVersion,1);
assert.equal(index.categories.length,12);
assert.deepEqual(index.categories.map(s=>s.key),categories);
assert.equal(index.coverage.canonicalCore,32);
assert.equal(index.coverage.fictionalExpansion,36);
assert.equal(index.coverage.publicFigureCameos,2);
assert.equal(index.coverage.unassignedResidentArt,179);
assert.equal(index.characters.length,70);
const known=new Set([...cast,...expansions].map(c=>c.id));
assert.equal(known.size,70);
const seen=new Set(),samples=new Set();
for(const listing of index.characters){
 assert.ok(!seen.has(listing.id),"Duplicate profile ID "+listing.id);seen.add(listing.id);
 assert.ok(known.has(listing.id),"Profile missing from named source: "+listing.id);
 assert.ok(existsSync(listing.file),"Missing profile file: "+listing.file);
 const p=load(listing.file),data=p.sections;
 assert.equal(p.id,listing.id);assert.equal(typeof p.approval,"string");
 assert.deepEqual(Object.keys(data),categories,"Missing/reordered 12 categories: "+p.id);
 for(const [name,section] of Object.entries(data)){
  assert.ok(section&&typeof section==="object"&&!Array.isArray(section),"Missing section "+p.id+" "+name);
  assert.ok(Object.keys(section).length>=2,"Section too shallow "+p.id+" "+name);
  for(const [field,value] of Object.entries(section)){
   if(value===null) assert.ok(p.characterClass==="public-figure-fictional-cameo"&&field==="ageYears");
   else if(typeof value==="string") assert.ok(value.trim().length>2,"Empty text: "+p.id+" "+name+"."+field);
   else if(typeof value==="number") assert.ok(Number.isFinite(value));
   else if(Array.isArray(value)) assert.ok(value.length>0,"Empty field list "+p.id+" "+field);
  }
 }
 assert.equal(data["01_core_identity"].name,listing.name);
 const scene=data["10_narrative_development"];
 assert.equal(scene.threeActBeats.length,3,"Three distinct story beats required: "+p.id);
 assert.equal(new Set(scene.threeActBeats).size,3,"Duplicate beats "+p.id);
 const ties=data["08_relationship_dynamics"].connections??data["08_relationship_dynamics"].scriptedConnection;
 for(const t of ties) assert.ok(known.has(t.characterId),"Broken relation "+p.id+" -> "+t.characterId);
 const visual=data["11_visual_references"];
 const portrait=visual.portraitExpressionSheet??visual.conceptPortrait;
 assert.ok(existsSync("public"+portrait),"Missing portrait file "+p.id+": "+portrait);
 if(listing.tier==="canonical-core"){
  const source=cast.find(c=>c.id===p.id);
  assert.ok(source);assert.equal(data["04_social_profile"].occupation,source.occupation);
  assert.deepEqual(data["05_personality"].traits,source.personality);
  assert.deepEqual(data["04_social_profile"].hobbies,source.hobby);
  assert.ok(Number.isInteger(data["01_core_identity"].ageYears)&&data["01_core_identity"].ageYears>=15);
  assert.equal(data["11_visual_references"].portraitExpressionSheet,portraits.find(x=>x.id===p.id)?.expressionSheet);
  assert.ok(existsSync(data["11_visual_references"].movementManifest));
 }else if(p.characterClass==="public-figure-fictional-cameo"){
  assert.equal(data["01_core_identity"].ageYears,null);
  assert.ok(data["06_psychological_profile"].privateMotivation.includes("Tidak diatribusikan"));
  assert.ok(data["08_relationship_dynamics"].trustAndRomance.includes("Tidak ada"));
 }else{
  assert.ok(Number.isInteger(data["01_core_identity"].ageYears));
  assert.equal(data["12_continuity_current_state"].availability,"Expansion concept; not spawned");
 }
 const line=data["09_dialogue_behavior"].sampleLine;
 assert.ok(line.length>=22,"Dialogue too short "+p.id);
 assert.ok(!samples.has(line),"Generic repeated dialogue "+p.id);samples.add(line);
}
assert.deepEqual(seen,known,"Every named character must have exactly one profile");
assert.equal(artwork.count,179);assert.equal(artwork.assets.length,179);
const rids=new Set();
for(const r of artwork.assets){
 assert.ok(!rids.has(r.assetId));rids.add(r.assetId);
 assert.equal(r.characterId,null,"R art must not be cast as playable without full biography");
 assert.equal(assetShas.get(r.path),r.contentSha,"R artwork moved/changed without updating inventory");
 assert.ok(existsSync(r.path));
}
const guide=readFileSync("AGENTS.md","utf8");
assert.ok(guide.includes("npc-public-roster.json")&&guide.includes("game-assets/characters/profiles/"),"Canonical 248 and legacy profile roles must be explicit");
const skill=readFileSync(".agents/skills/yz-farm-dialogue/SKILL.md","utf8");
assert.ok(skill.includes("npc-public-roster.json")&&skill.includes("game-assets/characters/profiles/index.json"),"Narrative skill must separate canonical and legacy");
const generator=execFileSync(process.execPath,["scripts/game-characters/build-character-index.mjs","--check"],{encoding:"utf8"});
assert.match(generator,/PASS/);
console.log("PASS: 70 named profiles, 12 sections each, 32 canonical cast matches, 38 expansion concepts, 179 unassigned artworks, relationships and visuals");
