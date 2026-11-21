#!/usr/bin/env node
/** Offline validation of third-party source provenance, license review and editable master-map artifacts. */
import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";

const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const read=(path)=>readFileSync(resolve(root,path),"utf8");
const catalog=JSON.parse(read("game-assets/toolkit/github-tools.json"));
assert.equal(catalog.schemaVersion,1);
assert.equal(catalog.checkedOn,"2026-11-19");
assert.ok(catalog.records.length>=8);
const uniqueIds=new Set();
for(const tool of catalog.records){
 assert.match(tool.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/,"invalid tool id");
 assert.ok(!uniqueIds.has(tool.id),"duplicate tool entry "+tool.id);
 uniqueIds.add(tool.id);
 assert.ok(tool.name&&tool.repository&&tool.license&&tool.adoption&&tool.purpose);
 assert.equal(new URL(tool.repository).hostname,"github.com");
 assert.ok(Array.isArray(tool.integrationPaths));
 for(const relative of tool.integrationPaths){
  if(relative.endsWith("/")){
   assert.ok(existsSync(resolve(root,relative)),"missing vendor directory "+relative);
  }else{
   assert.ok(existsSync(resolve(root,relative)),"missing toolkit integration "+relative);
  }
 }
}
assert.equal(catalog.records.find(t=>t.id==="tiled").adoption,"integrated-format");
for(const id of ["tweenjs","howler","easystar"]){
 assert.equal(catalog.records.find(t=>t.id===id).adoption,"evaluated-not-installed",
  "avoid unneeded runtime dependencies until benchmarked");
}
const vendor="game-assets/vendor/kenney-ui-pixel-adventure/";
const m=JSON.parse(read(vendor+"manifest.json"));
assert.equal(m.license,"CC0-1.0");
assert.equal(m.status,"reviewed-vendor-only");
assert.equal(m.runtimePresent,false);
assert.equal(m.mirrorCommit,"3694c6879e487c108f55677be7dd2ca75b07cc3b");
assert.equal(m.files.length,16);
for(const file of m.files){
 assert.match(file,/^tile_\d{4}\.png$/);
 const path=resolve(root,vendor,file);
 assert.ok(existsSync(path),"missing reviewed vendor image "+file);
 const bytes=readFileSync(path);
 assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a","invalid PNG header "+file);
 assert.equal(bytes.readUInt32BE(16),16,"image width must be 16");
 assert.equal(bytes.readUInt32BE(20),16,"image height must be 16");
}
assert.match(read(vendor+"LICENSE.txt"),/CC0|Creative Commons Zero/);
const gameCatalog=JSON.parse(read("game-assets/catalog/sources.json"));
const ledger=gameCatalog.records.find(x=>x.id==="kenney-ui-pixel-adventure");
assert.ok(ledger&&ledger.rawPresent&&!ledger.runtimePresent);
assert.equal(ledger.checkedOn,"2026-11-19");
assert.equal(ledger.license,"CC0-1.0");
const proc=spawnSync(process.execPath,["scripts/game-world/export-tiled.mjs","--check"],{
 cwd:root,encoding:"utf8"
});
if(proc.status!==0)throw Error("Tiled topology export mismatch: "+proc.stderr+" "+proc.stdout);
console.log("GitHub toolkit sources, CC0 UI assets and Tiled world file: PASS");
