#!/usr/bin/env node
/** Deterministic index of ALL tracked media in the asset vault and public game bundle. No network. */
import {execFileSync} from "node:child_process";
import {statSync,readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
function kindOf(path){const x=path.split(".").at(-1).toLowerCase();return ["wav","mp3","ogg"].includes(x)?"audio":x==="svg"?"vector":x==="mp4"?"video":"image"}
function stageOf(path){if(path.startsWith("public/game/assets/"))return"public-candidate";if(path.startsWith("game-assets/vendor/")||path.includes("/vendor/"))return"licensed-source";if(path.startsWith("game-assets/characters/"))return"character-source";if(path.startsWith("game-assets/yz-farm-life/aset/"))return"vault-core";return"vault-expansion"}
function familyOf(path){
 if(path==="public/game/assets/cutscenes/sluice-gate.mp4")return"cinematic-remotion-h264-v1";
 if(path==="public/game/assets/cutscenes/sluice-poster.png")return"cinematic-remotion-story-poster-v1";
 if(/^public\/game\/assets\/tiles\/(ayu|widi)-shop-atlas\.png$/.test(path))return"market-ui-pixel-runtime";
 if(/^public\/game\/assets\/portraits\/[AC]\d\d\.png$/.test(path))return"dialogue-expression-pixel-v1";
 if(path.startsWith("public/game/assets/portraits/bandung/"))return"bandung-concept-illustration-v1";
 if(path.startsWith("game-assets/characters/gba-"))return"character-motion-pixel-source";
 if(path.startsWith("public/game/assets/tiles/farm-kit/"))return"farm-kit-pixel-runtime";
 if(path.includes("/tanaman/"))return"crop-prototype-family";
 if(path.includes("/vendor/"))return"external-pixel-source";
 return"unclassified-needs-art-review";
}
function useOf(path){if(path.startsWith("public/game/assets/cutscenes/"))return"story";if(/^public\/game\/assets\/tiles\/(ayu|widi)-shop-atlas\.png$/.test(path))return"commerce";if(path.startsWith("public/game/assets/portraits/"))return"portrait";if(path.includes("/tanaman/"))return"plant";if(path.includes("/pasar/")||path.includes("/market/"))return"commerce";if(path.includes("/audio/"))return"ambience-or-sfx";if(path.includes("/karakter/")||path.includes("/characters/"))return"character";if(path.includes("/peta/")||path.includes("/tiles/"))return"world";if(path.includes("/properti/")||path.includes("/objek/"))return"prop";if(path.includes("/antarmuka/")||path.includes("/ui/"))return"interface";return"unclassified"}
function licenseOf(path){if(path.startsWith("public/game/assets/cutscenes/sluice-"))return"project-remotion-authored";if(/^public\/game\/assets\/tiles\/(ayu|widi)-shop-atlas\.png$/.test(path))return"project-imagegen-production";if(path.includes("/kenney-"))return"CC0-1.0-verified-source";if(/^public\/game\/assets\/portraits\/[AC]\d\d\.png$/.test(path))return"project-imagegen-production";if(path.startsWith("game-assets/characters/gba-"))return"project-generated-character";return"origin-needs-record"}
function buildAssetIndex(e){
 const arr=e.filter(x=>x.path&&x.sha&&x.size!==undefined).sort((a,b)=>a.path.localeCompare(b.path,"en"));
 const bySha=new Map();for(const x of arr){let a=bySha.get(x.sha)||[];a.push(x);bySha.set(x.sha,a)}
 const canonical=new Map();for(const [sha,list] of bySha){const sorted=[...list].sort((a,b)=>{const ranks={ "public-candidate":0,"character-source":1,"licensed-source":2,"vault-core":3,"vault-expansion":4 };return ranks[stageOf(a.path)]-ranks[stageOf(b.path)]||a.path.localeCompare(b.path,"en")});canonical.set(sha,sorted[0].path)}
 const plants=new Map();for(const x of arr.filter(x=>x.path.startsWith("game-assets/yz-farm-life/aset/tanaman/"))){plants.set(x.sha,(plants.get(x.sha)||0)+1)}
 const rows=arr.map(x=>{const family=familyOf(x.path),duplicateOf=canonical.get(x.sha)===x.path?null:canonical.get(x.sha),sharedPlant=x.path.startsWith("game-assets/yz-farm-life/aset/tanaman/")&&(plants.get(x.sha)||0)>1;return[
 x.path,x.sha,x.size,kindOf(x.path),stageOf(x.path),useOf(x.path),family,licenseOf(x.path),duplicateOf,
 sharedPlant?"shared-template-sprite":family==="bandung-concept-illustration-v1"?"concept-art-not-dialogue":family==="unclassified-needs-art-review"?"visual-review-required":null
 ]});
 const formats={};let bytes=0;for(const x of rows){formats[x[3]]=(formats[x[3]]||0)+1;bytes+=x[2]}
 const duplicates=rows.filter(x=>x[8]).length,sharedPlant=rows.filter(x=>x[9]==="shared-template-sprite").length;
 return{schemaVersion:1,project:"YZ Farm Life",source:"tracked-Git-media-assets",baseCommit:"3330580b90a75f194f7f96b5e48326b7e1945c4e",columns:["path","gitBlobSha","bytes","mediaKind","storageStage","purpose","styleFamily","sourceLicense","duplicateOfPath","qualityFlag"],stats:{fileCount:rows.length,uniqueBlobs:bySha.size,duplicateCopies:duplicates,sharedTemplatePlants:sharedPlant,totalBytes:bytes,formats},rows}
}
const tracked=execFileSync("git",["ls-files","--stage","-z"],{cwd:root,maxBuffer:15*1024*1024}).toString("utf8").split("\0").filter(Boolean);
const files=[];
for(const line of tracked){
 const match=/^\d{6} ([a-f0-9]{40}) \d+\t(.+)$/.exec(line);
 if(!match)continue;
 const path=match[2];
 if(!/^(game-assets\/|public\/game\/assets\/)/.test(path)||!/\.(png|jpg|jpeg|webp|svg|gif|wav|mp3|ogg|mp4)$/i.test(path))continue;
 files.push({path,sha:match[1],size:statSync(resolve(root,path)).size});
}
const generated=JSON.stringify(buildAssetIndex(files))+"\n";
const filename=resolve(root,"game-assets/catalog/asset-database.json");
if(process.argv.includes("--check")){
 if(readFileSync(filename,"utf8")!==generated){
   console.error("FAIL: asset-database.json is stale. Run: node scripts/game-assets/build-asset-database.mjs");
   process.exitCode=1;
 }else console.log("PASS: asset database matches "+files.length+" tracked media files");
}else{
 writeFileSync(filename,generated);
 console.log("Wrote "+files.length+" asset records to "+filename);
}
