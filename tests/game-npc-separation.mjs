import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,rmSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";
const file=p=>readFileSync(p,"utf8");
const manifest=JSON.parse(file("game-assets/catalog/npc-legacy-id-review-manifest.json"));
assert.equal(manifest.count,69);
assert.equal(manifest.legacyStoryCandidateCount,39);
assert.equal(manifest.legacyExpansionConceptCount,30);
assert.equal(new Set(manifest.review.map(x=>x.legacyId)).size,69);
assert.ok(manifest.review.every(x=>x.approved===false&&x.associationStatus==="manual-review-required"));
const temp=mkdtempSync(resolve(process.cwd(),"node_modules/.npc-links-fixture-"));
try{
 const entry=join(temp,"legacy-identity.mjs");
 await build({entryPoints:["src/lib/game/legacy-identity.ts"],outfile:entry,bundle:true,
  platform:"node",format:"esm",packages:"external",logLevel:"silent"});
 const {approvedLegacyId,legacyNpcDisplayName}=await import(pathToFileURL(entry).href);
 const current={id:"A03",name:"TOKOH BARU UJI",occupation:"Uji",portrait:"work-A03",legacyApproved:false};
 assert.equal(approvedLegacyId({...current,legacyId:"A03"}),null,"Colliding IDs do not establish identity");
 assert.equal(legacyNpcDisplayName("A03","Nama lama",[current]),"Nama lama");
 const approved={...current,legacyApproved:true,legacyId:"A03"};
 assert.equal(approvedLegacyId(approved),"A03");
 assert.equal(legacyNpcDisplayName("A03","Nama lama",[approved]),current.name);
 const ui=file("src/app/game/character-gallery.tsx");
 assert.match(ui,/if\(selected\?\.legacyApproved\)/,"Private citizen does not load a legacy bible without approval");
 assert.ok(ui.includes("/api/game/resident-bible/"),"Current citizen loads private Bible only on demand");
 assert.match(ui,/if\(person\.portrait\)return <ResidentPortrait/,"Portrait key overrides old cast ID");
 assert.match(ui,/process\.env\.NODE_ENV==="production"\?\[\]/,"Production never silently displays old public cast in place of private roster");
 for(const route of ["src/app/game/page.tsx","src/app/game/phaser/page.tsx","src/app/game/canvas/page.tsx"]){
  assert.ok(file(route).includes("readPrivateResidents()"),"Missing canonical server hydration: "+route);
 }
 const client=file("src/app/game/game-client.tsx");
 assert.ok(!client.includes("residentById.has(npc.id)"),"Unsafe automatic face replacement remains");
 assert.ok(client.includes("approvedByLegacyId.get(dialogue.npcId)"),"Dialogue must require reviewed association");
 const ignore=file(".gitignore");
 assert.ok(ignore.includes("deploy/private/"));
 console.log("PASS: 69 legacy ID collisions quarantined, 39 story candidates, 30 concepts, route/UI identity guard");
}finally{rmSync(temp,{recursive:true,force:true});}
