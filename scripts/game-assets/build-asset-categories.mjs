#!/usr/bin/env node
/** Deterministic category indices for the complete source media catalog. */
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {ASSET_CATEGORIES,categorizeMedia} from "./asset-category-rules.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const source="game-assets/catalog/asset-database.json";
const catalog=JSON.parse(readFileSync(resolve(root,source),"utf8"));
const collected=new Map(ASSET_CATEGORIES.map(c=>[c.id,new Map()]));
const bytes=new Map(ASSET_CATEGORIES.map(c=>[c.id,0]));
for(const row of catalog.rows){
 const {category,section}=categorizeMedia(row[0]);
 const sections=collected.get(category);
 if(!sections)throw new Error("Category missing for "+row[0]);
 if(!sections.has(section))sections.set(section,[]);
 sections.get(section).push(row[0]);
 bytes.set(category,bytes.get(category)+row[2]);
}
const byCategory=ASSET_CATEGORIES.map(c=>{
 const sections=[...collected.get(c.id)].sort(([a],[b])=>a.localeCompare(b,"en")).map(([id,files])=>
   ({id,files:files.sort((a,b)=>a.localeCompare(b,"en"))}));
 return {...c,mediaCount:sections.reduce((n,s)=>n+s.files.length,0),bytes:bytes.get(c.id),
   sections:sections.map(s=>({id:s.id,count:s.files.length}))};
});
const pending=[];
for(const category of byCategory){
 const folder=resolve(root,"game-assets/library",category.id);
 const sections=[...collected.get(category.id)].sort(([a],[b])=>a.localeCompare(b,"en")).map(([id,files])=>
  ({id,files:files.sort((a,b)=>a.localeCompare(b,"en"))}));
 const document={schemaVersion:1,category:category.id,label:category.label,description:category.description,
   mediaCount:category.mediaCount,bytes:category.bytes,source,sections};
 pending.push({path:resolve(folder,"index.json"),content:JSON.stringify(document,null,2)+"\n"});
}
const summary={schemaVersion:1,source,totalMedia:catalog.stats.fileCount,uniqueContents:catalog.stats.uniqueBlobs,
 totalBytes:catalog.stats.totalBytes,categories:byCategory};
pending.push({path:resolve(root,"game-assets/library/index.json"),content:JSON.stringify(summary,null,2)+"\n"});
const check=process.argv.includes("--check");
for(const item of pending){
 if(check){
  if(!existsSync(item.path)||readFileSync(item.path,"utf8").replace(/\r\n/g,"\n")!==item.content){
   console.error("FAIL: stale category index "+item.path);process.exitCode=1;
  }
 }else{mkdirSync(dirname(item.path),{recursive:true});writeFileSync(item.path,item.content);}
}
if(!process.exitCode)console.log("PASS: "+catalog.rows.length+" media organized into "+ASSET_CATEGORIES.length+" category indexes");
