#!/usr/bin/env node
/** Editor CLI: inspect public canonical data separately from user presentation.
 * This tool reads published fictional dossiers only. It never accesses save,
 * private Docker files, environment variables or server-side editor notes.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {build} from "esbuild";

const id=process.argv[2];
const view=process.argv.find(arg=>arg.startsWith("--view="))?.slice(7)??"developer";
const full=process.argv.includes("--full");
if(!id||!/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/.test(id)||!["player","developer"].includes(view)){
 console.error("Usage: npm run chars:inspect -- <canonical-id> --view=player|developer [--full]");
 process.exit(2);
}
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const index=read("public/game/data/npc/index.json");
const entry=index.characters.find(row=>row.id===id);
assert.ok(entry,"ID tidak ada dalam roster canonical");
const doc=read("public/game/data/npc/"+id+".json");
assert.equal(doc.id,entry.id);assert.equal(doc.name,entry.name);
assert.equal(doc.occupation,entry.occupation);assert.equal(doc.portrait,entry.portrait);
if(view==="player"){
 const result=await build({entryPoints:["src/lib/game/public-wargapedia.ts"],bundle:true,format:"esm",platform:"node",write:false,logLevel:"silent"});
 const moduleUrl="data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].text).toString("base64");
 const {wargaPlayerView}=await import(moduleUrl);
 const data=wargaPlayerView(doc);
 console.log(data.displayName+" — "+doc.occupation);
 for(const section of data.sections){
  console.log("\n"+section.title);
  for(const line of section.lines)console.log("  "+line);
 }
 if(data.sources.length){
  console.log("\nSumber profil");
  for(const source of data.sources)console.log("  "+source.title+"\n  "+source.url);
 }
}else{
 console.log("DEVELOPER / CHARACTER BIBLE");
 console.log("Canonical ID: "+doc.id+" | "+doc.name+" | "+doc.occupation);
 console.log("Portrait: "+doc.portrait+" | Status: "+doc.approval);
 for(const [section,fields] of Object.entries(doc.sections)){
  const vals=Object.values(fields);
  console.log("\n"+section+" — "+vals.length+" atribut, "+vals.filter(v=>v===null).length+" null");
  if(full){
   for(const [key,value] of Object.entries(fields)){
    console.log("  "+key+": "+JSON.stringify(value));
    const evidence=doc.fieldProvenance?.[section+"."+key];
    if(evidence)console.log("    provenance: "+JSON.stringify(evidence));
   }
  }
 }
 if(full){
  console.log("\nVisual evidence: "+JSON.stringify(doc.visualEvidence));
  if(doc.publicBiography)console.log("Public biography: "+JSON.stringify(doc.publicBiography));
 }
}
