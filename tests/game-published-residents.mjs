import assert from "node:assert/strict";
import {existsSync,readFileSync,mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";

const rosterPath="src/lib/game/data/published-residents.json";
const script="scripts/game-characters/prepare-public-resident-roster.mjs";
const original=readFileSync(rosterPath,"utf8");
const roster=JSON.parse(original);
assert.ok(Array.isArray(roster)&&roster.length<=500);
assert.equal(new Set(roster.map(x=>x.id)).size,roster.length);
assert.equal(new Set(roster.map(x=>x.name.toLocaleLowerCase("id"))).size,roster.length);
assert.ok(existsSync(script));
const dir=mkdtempSync(join(tmpdir(),"yz-npc-roster-"));
try{
 const input=join(dir,"residents.json");
 const sample=[{id:"W001",name:"Contoh Warga",occupation:"Penjual bibit",portrait:"K01"}];
 writeFileSync(input,JSON.stringify(sample));
 const dry=spawnSync(process.execPath,[script,"--input",input],{encoding:"utf8"});
 assert.equal(dry.status,0,dry.stderr);
 assert.match(dry.stdout,/VALIDASI LULUS/);
 assert.equal(readFileSync(rosterPath,"utf8"),original,"dry-run must not alter published data");
 writeFileSync(input,JSON.stringify([{...sample[0],email:"private@example.invalid"}]));
 const unsafe=spawnSync(process.execPath,[script,"--input",input],{encoding:"utf8"});
 assert.notEqual(unsafe.status,0,"additional sensitive fields must be rejected");
 assert.equal(readFileSync(rosterPath,"utf8"),original);
}finally{rmSync(dir,{recursive:true,force:true});}
console.log("PASS: published NPC roster, dry-run safety and strict private-field rejection");
