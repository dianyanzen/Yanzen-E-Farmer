#!/usr/bin/env node
/** Safe server-side gate. Prints counts only, never private names or the roster itself. */
import {mkdtempSync,rmSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";
const cwd=process.cwd();
const dir=mkdtempSync(resolve(cwd,"node_modules/.npc-check-"));
try {
 const target=join(dir,"roster-reader.mjs");
 await build({entryPoints:["src/lib/game/private-residents.ts"],outfile:target,
  bundle:true,platform:"node",format:"esm",packages:"external",logLevel:"silent"});
 const {readPrivateResidents}=await import(pathToFileURL(target).href);
 const rows=await readPrivateResidents();
 if(rows.length!==248){
  console.error("FAIL: expected 248 validated private NPCs. Check GAME_RESIDENT_ROSTER, asset paths, duplicates, approved associations.");
  process.exitCode=1;
 }else{
  console.log("PASS: 248 private NPCs validated; "+rows.filter(x=>x.legacyApproved).length+" legacy associations individually approved.");
 }
}finally{rmSync(dir,{recursive:true,force:true});}
