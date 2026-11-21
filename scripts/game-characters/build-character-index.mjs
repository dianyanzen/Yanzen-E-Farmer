#!/usr/bin/env node
/** Deterministic named character index. Does not modify runtime saves or game UI. */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const cast=read("game-assets/catalog/cast.json").characters;
const expanded=read("src/lib/game/data/bandung-character-previews.json");
const categories=[["01_core_identity","Core Identity","Nama, usia, asal, bahasa, identitas"],["02_physical_appearance","Physical Appearance","Penampilan dan ciri fisik umum"],["03_fashion_aesthetic","Fashion & Aesthetic","Pakaian, aksesori, gaya personal"],["04_social_profile","Social Profile","Pekerjaan, pendidikan, kehidupan sosial"],["05_personality","Personality","Sifat, kebiasaan, nilai, kelemahan"],["06_psychological_profile","Psychological Profile","Motivasi, kebutuhan, konflik batin"],["07_background_history","Background & History","Keluarga, masa lalu, pengalaman"],["08_relationship_dynamics","Relationship Dynamics","Relasi, kepercayaan, batas pribadi"],["09_dialogue_behavior","Dialogue & Behavior","Cara berbicara, respons, bahasa tubuh"],["10_narrative_development","Narrative Development","Peran, konflik, perkembangan karakter"],["11_visual_references","Visual References","Referensi ilustrasi dan konsistensi visual"],["12_continuity_current_state","Continuity & Current State","Kondisi karakter sepanjang cerita"]];
const characters=[
 ...cast.map(c=>({id:c.id,name:c.name,role:c.role==="main-character"?"player-character":"npc",tier:"canonical-core",file:`game-assets/characters/profiles/core/${c.id}.json`,review:"proposed-details-require-approval"})),
 ...expanded.map(c=>({id:c.id,name:c.name,role:c.id.startsWith("P")?"public-figure-fictional-cameo":"expansion-concept",tier:"expansion",file:`game-assets/characters/profiles/expansion/${c.id}.json`,review:c.id.startsWith("P")?"limited-cameo-privacy-guard":"planned-not-spawned"}))
].sort((a,b)=>a.id.localeCompare(b.id,"en"));
const index={schemaVersion:1,project:"YZ Farm Life",description:"Full 12-dimension character bible for named characters, not runtime NPC state. Proposed fields require narrative approval.",categories:categories.map(([key,label,scope])=>({key,label,scope})),coverage:{canonicalCore:cast.length,fictionalExpansion:expanded.filter(x=>!x.id.startsWith("P")).length,publicFigureCameos:expanded.filter(x=>x.id.startsWith("P")).length,unassignedResidentArt:179},characters};
const path=resolve(root,"game-assets/characters/profiles/index.json"),content=JSON.stringify(index,null,2)+"\n";
if(process.argv.includes("--check")){
 if(readFileSync(path,"utf8")!==content){console.error("FAIL: character bible index out of date");process.exitCode=1;}
 else console.log("PASS: "+characters.length+" indexed named character bibles");
}else{writeFileSync(path,content);console.log("WROTE: "+characters.length+" named character bibles");}
