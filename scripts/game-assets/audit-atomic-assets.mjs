#!/usr/bin/env node
/** Atomic Asset Extreme audit for YZ Farm Life.
 * Default report mode is non-blocking while legacy content is migrated.
 * --strict is a future hard gate and intentionally fails until all legacy
 * sheets, multi-object composition, and shared-file references are removed.
 * See docs/game-dev/ATOMIC_ASSET_AND_YANZEN_SCALE_STANDARD.md.
 */
import {existsSync,readdirSync,readFileSync} from "node:fs";
import {join,relative,resolve,sep} from "node:path";

const root=resolve(process.cwd());
const strict=process.argv.includes("--strict");
const patterns=[
  ["spritesheet-loader",/\b(?:this\.)?load\.spritesheet\s*\(/g],
  ["atlas-loader",/\b(?:this\.)?load\.(?:atlas|multiatlas)\s*\(/g],
  ["legacy-frame-selector",/\b(?:HOUSING_ATLAS_PATH|HD_INTERIOR_PATH|HD_EXTERIOR_PATH|HOUSING_FRAMES|HD_EXTERIOR_FRAMES|housingFrameSource|drawHousingFrame|drawHDSprite)\b/g],
  ["css-sheet-cropping",/\b(?:backgroundPosition\s*:|background-position\s*:|backgroundSize\s*:\s*["']800%)/g],
  ["source-rectangle-crop",/\b(?:drawHDInteriorPiece|drawHDInteriorProps|drawHousingInterior)\s*\(/g]
];
const legacyPaths=[
  "public/game/assets/characters/stage1.png",
  "public/game/assets/characters/yanzen-gaits.png",
  "public/game/assets/characters/yanzen-turns.png",
  "public/game/assets/tiles/actions.png",
  "public/game/assets/tiles/field-effects.png",
  "public/game/assets/tiles/cucumber.png",
  "public/game/assets/tiles/fish-market.png",
  "public/game/assets/hd/housing-market-hd.webp",
  "public/game/assets/hd/housing-interiors-hd.webp",
  "public/game/assets/locations/yanzen/housing-atlas-v2.png"
];
function walk(dir,all=[]){
  if(!existsSync(dir))return all;
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith(".") || entry.name==="node_modules")continue;
    const file=join(dir,entry.name);
    if(entry.isDirectory())walk(file,all);
    else if(/\.(?:js|jsx|mjs|cjs|ts|tsx|css|html)$/.test(entry.name))all.push(file);
  }
  return all;
}
const textFiles=[...walk(join(root,"src","lib","game")),...walk(join(root,"src","app","game")),...walk(join(root,"public","game"))];
const findings=[];
for(const absolute of textFiles){
  const path=relative(root,absolute).split(sep).join("/");
  const content=readFileSync(absolute,"utf8");
  for(const [rule,regex] of patterns){
    regex.lastIndex=0;
    let match;
    while((match=regex.exec(content))!==null){
      const line=content.slice(0,match.index).split("\n").length;
      findings.push({rule,path,line,excerpt:content.split("\n")[line-1].trim().slice(0,160)});
      if(match.index===regex.lastIndex)regex.lastIndex++;
    }
  }
}
const ledgerPath=join(root,"game-assets","catalog","asset-database.json");
let existingInventory=null;
if(existsSync(ledgerPath)){
  const j=JSON.parse(readFileSync(ledgerPath,"utf8"));
  existingInventory={mediaFiles:j.stats?.fileCount??null,duplicateBlobs:j.stats?.duplicateCopies??null,
    caveat:"Historical inventory: duplicate blob counts are NOT identical to shared runtime objects."};
}
const manifestPath=join(root,"game-assets","catalog","atomic-assets.json");
const manifestErrors=[];
let registered=0;
if(existsSync(manifestPath)){
  const manifest=JSON.parse(readFileSync(manifestPath,"utf8"));
  const rows=Array.isArray(manifest.assets)?manifest.assets:[];
  registered=rows.length;
  const ids=new Set(),files=new Set(),owners=new Set();
  for(const [i,a] of rows.entries()){
    const id=String(a.assetId||""),url=String(a.runtimeFile||"");
    const owner=[a.ownerId,a.objectId,a.variant,a.action,a.direction,a.frameIndex].map(x=>x??"").join("|");
    if(!id||!url||!a.ownerId)manifestErrors.push({row:i,reason:"missing assetId, ownerId or runtimeFile"});
    if(ids.has(id))manifestErrors.push({row:i,reason:"duplicate assetId "+id});else ids.add(id);
    if(files.has(url))manifestErrors.push({row:i,reason:"shared runtimeFile "+url});else files.add(url);
    if(owners.has(owner))manifestErrors.push({row:i,reason:"duplicate owner/variant/frame "+owner});else owners.add(owner);
    if(a.cropSource||a.sheetRect||a.frameOffsetInAtlas||a.sharedTextureOwner)
      manifestErrors.push({row:i,reason:"composite/sheet reference prohibited"});
    const local=url.startsWith("/game/")?"public"+url:url.startsWith("/")?url.slice(1):url;
    if(!existsSync(join(root,local)))manifestErrors.push({row:i,reason:"file not found: "+url});
  }
}
const presentPackedFiles=legacyPaths.filter(p=>existsSync(join(root,p)));
const report={policy:"100% atomic files; no shared or packed assets",strict,
  scannedGameSourceFiles:textFiles.length,detectedLegacyUsage:findings.length,
  findings,knownPackedMediaPresent:presentPackedFiles,registeredAtomicAssets:registered,
  atomicManifestExists:existsSync(manifestPath),manifestErrors,existingInventory,
  compliance:"NOT_CONFIRMED — legacy usage or missing individual-asset manifest"};
if(!findings.length&&!presentPackedFiles.length&&!manifestErrors.length&&existsSync(manifestPath)){
  report.compliance="SOURCE_AND_MANIFEST_GATES_PASSED (visual QA still required)";
}
console.log(JSON.stringify(report,null,2));
if(strict&&(report.compliance!=="SOURCE_AND_MANIFEST_GATES_PASSED (visual QA still required)"))process.exitCode=1;
