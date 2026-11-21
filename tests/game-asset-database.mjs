import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {execFileSync} from "node:child_process";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const db=load("game-assets/catalog/asset-database.json");
const people=load("game-assets/catalog/npc-portrait-register.json");
const experience=load("game-assets/catalog/asset-experiences.json");
const cast=load("game-assets/catalog/cast.json");
assert.equal(db.schemaVersion,1);
assert.equal(db.columns.length,10);
assert.equal(db.rows.length,db.stats.fileCount);
assert.ok(db.rows.length>=2615);
assert.ok(db.stats.uniqueBlobs<db.rows.length);
const paths=new Map(db.rows.map(r=>[r[0],r]));
assert.equal(paths.size,db.rows.length,"all tracked assets have unique paths");
for(const row of db.rows){
 const [path,sha,bytes,kind,stage,purpose,family,license,duplicate,flag]=row;
 assert.ok(existsSync(path),"stale asset path "+path);
 assert.match(sha,/^[a-f0-9]{40}$/);
 assert.ok(bytes>=0 && ["image","audio","vector"].includes(kind));
 assert.ok(stage&&purpose&&family&&license);
 if(duplicate){assert.ok(paths.has(duplicate),"missing duplicate target "+duplicate);assert.equal(paths.get(duplicate)[1],sha);}
 if(flag==="shared-template-sprite")assert.ok(path.startsWith("game-assets/yz-farm-life/aset/tanaman/"));
}
const crops=db.rows.filter(r=>r[0].startsWith("game-assets/yz-farm-life/aset/tanaman/"));
assert.equal(crops.length,196);
assert.equal(new Set(crops.map(r=>r[1])).size,25,"shared plant sprites must be flagged, not falsely declared species-specific");
assert.equal(people.characters.length,32);
assert.equal(people.characters.filter(p=>p.active).length,5);
assert.deepEqual(new Set(people.characters.map(p=>p.id)),new Set(cast.characters.map(p=>p.id)));
for(const p of people.characters){
 assert.equal(p.frames,8);
 assert.ok(paths.has("public"+p.expressionSheet));
 assert.ok(paths.has("public"+p.variant.workConcept));
 assert.equal(paths.get("public"+p.expressionSheet)[6],"dialogue-expression-pixel-v1");
 assert.equal(paths.get("public"+p.variant.workConcept)[6],"bandung-concept-illustration-v1");
}
assert.ok(experience.events.length>=24);
assert.equal(new Set(experience.events.map(e=>e.id)).size,experience.events.length);
for(const e of experience.events){
 assert.ok(paths.has(e.assetPath),"missing experience art "+e.id);
 assert.equal(e.placement,"prepared-not-placed");
 assert.ok(e.lines.length>=2&&e.lines.every(x=>x.length>=10));
 assert.ok(e.timeWindow[0]<e.timeWindow[1]&&e.timeWindow[1]<=1320);
}
const ui=readFileSync("src/app/game/character-gallery.tsx","utf8");
assert.ok(ui.includes("<details")&&ui.includes("Arsip ilustrasi konsep"),"Concept artwork must be separated in the UI");
if(existsSync(".git")){
 const git=execFileSync(process.execPath,["scripts/game-assets/build-asset-database.mjs","--check"],{encoding:"utf8"});
 assert.match(git,/PASS: asset database/);
}else{
 console.log("SKIP: git-index freshness check needs .git; file/manifest integrity still verified");
}
console.log("PASS: asset catalog coverage, hashes, 196/25 crop art, 32 portrait styles, prepared prop experiences, gallery separation");
