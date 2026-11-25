import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {resolve,dirname} from "node:path";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const db=load("game-assets/catalog/asset-database.json");
const people=load("game-assets/catalog/npc-portrait-register.json");
const experience=load("game-assets/catalog/asset-experiences.json");
const cast=load("game-assets/catalog/cast.json");
const cleanup=load("game-assets/catalog/asset-prune-20261121.json");
assert.equal(cleanup.removedFiles,128);
assert.equal(cleanup.deleted.length,128);
for(const entry of cleanup.deleted){
 assert.ok(!existsSync(entry.removedPath),"Unremoved duplicate "+entry.removedPath);
 assert.ok(existsSync(entry.canonicalPath),"Lost canonical sprite "+entry.canonicalPath);
}
for(const pack of ["aset","atlas-bandung","bandung-151","explore-bandung"]){
 for(const family of ["gba-v2","gba-v2-c"]){
  const file=`game-assets/yz-farm-life/${pack}/sumber-karakter/${family}/manifest.json`;
  const manifest=load(file);
  assert.equal(manifest.characters.length,16);
  for(const ch of manifest.characters){
   assert.ok(ch.sheet.startsWith(`../../../../characters/${family}/sheets/`));
   assert.ok(existsSync(resolve(dirname(file),ch.sheet)),`Broken sheet reference: ${file} => ${ch.sheet}`);
  }
 }
}

assert.equal(db.schemaVersion,1);
assert.equal(db.columns.length,10);
assert.equal(db.rows.length,db.stats.fileCount);
assert.ok(db.rows.length>=2487);
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
const gallery=readFileSync("src/app/game/character-gallery.tsx","utf8");
const warga=readFileSync("src/app/game/phone-wargapedia.tsx","utf8");
assert.ok(gallery.includes("<PhoneWargapedia")&&warga.includes("catalog?.characters.filter")&&
 warga.includes("src={known.portraitUrl}")&&warga.includes("approvedLegacyId(currentResident)")&&
 !gallery.includes("fromExpansion")&&!warga.includes("fromExpansion"),
 "Canonical Warga must use public 248 roster portraits and never silently mix legacy concept artwork");
const yanzen = load("game-assets/catalog/yanzen-activities.json").assets;
const byId = new Map(yanzen.map(asset => [asset.assetId, asset]));
assert.equal(byId.size, yanzen.length);
assert.equal(new Set(yanzen.map(asset => asset.runtimeSHA256)).size, yanzen.length,
  "Each Yanzen pose and handheld prop must have individual artwork");
for (const asset of yanzen) {
  const png = readFileSync(asset.runtimeFile);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], asset.canvasSize);
  assert.equal(createHash("sha256").update(png).digest("hex"), asset.runtimeSHA256);
  if (asset.objectId !== "yanzen") continue;
  assert.deepEqual(asset.canvasSize, [24, 32]);
  assert.deepEqual(asset.footAnchor, [12, 30]);
  assert.deepEqual(asset.drawOffset, [-2, -12]);
  if (asset.action !== "sit" && asset.action !== "sleep") {
    assert.equal(asset.visibleAlphaBounds[3], 30, asset.assetId);
    assert.equal(asset.visibleAlphaBounds[1], asset.direction === "down" ? 0 : 1, asset.assetId);
  }
}
for (const action of ["hoe","seed","water","harvest","fish","faucet","take"]) {
  for (const dir of ["down","left","right","up"]) {
    for (const frame of [1,2,3]) {
      const direction = dir === "down" && ["faucet","take"].includes(action) ? "" : "-"+dir;
      const id = `A01-${action}${direction}-${frame}`;
      assert.ok(byId.has(id), id);
    }
  }
}
if(existsSync(".git")){
 const git=execFileSync(process.execPath,["scripts/game-assets/build-asset-database.mjs","--check"],{encoding:"utf8"});
 assert.match(git,/PASS: asset database/);
}else{
 console.log("SKIP: git-index freshness check needs .git; file/manifest integrity still verified");
}
console.log("PASS: asset catalog coverage, hashes, 196/25 crop art, 32 portrait styles, prepared prop experiences, gallery separation");
