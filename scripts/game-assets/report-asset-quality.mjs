#!/usr/bin/env node
/** Read-only asset QA by file header and Git catalog; no network, no image rewriting. */
import {openSync,readSync,closeSync,statSync,readFileSync} from "node:fs";
const db=JSON.parse(readFileSync(new URL("../../game-assets/catalog/asset-database.json",import.meta.url),"utf8"));
const portraitSet=new Set([...Array(16)].flatMap((_,i)=>["A","C"].map(p=>p+String(i+1).padStart(2,"0"))));
const bad=[],widths=new Map(),colorModes={},families={},unreviewed=[];
let png=0,palette=0,wide=0,bytes=0,concept=0;
for(const row of db.rows){
 const [path,sha,size,kind,stage,purpose,style,license,duplicate,flag]=row;
 bytes+=size;
 families[style]=(families[style]||0)+1;
 if(license==="origin-needs-record")unreviewed.push(path);
 if(!path.endsWith(".png"))continue;
 const fd=openSync(path,"r"),head=Buffer.alloc(32);
 const read=readSync(fd,head,0,32,0);closeSync(fd);
 if(read<29||head.subarray(0,8).toString("hex")!=="89504e470d0a1a0a"){
   bad.push({path,problem:"invalid-png-header"});continue;
 }
 const w=head.readUInt32BE(16),h=head.readUInt32BE(20),mode=head[25];
 png++;if(mode===3)palette++;colorModes[mode]=(colorModes[mode]||0)+1;
 if(w>2048||h>2048)wide++;
 const bucket=w+"x"+h;widths.set(bucket,(widths.get(bucket)||0)+1);
 const primary=/^public\/game\/assets\/portraits\/([AC]\d{2})\.png$/.exec(path);
 if(primary&&portraitSet.has(primary[1])&&(w!==1536||h!==256))bad.push({path,problem:"portrait-expression-geometry-mismatch",width:w,height:h});
 if(style==="bandung-concept-illustration-v1")concept++;
}
const result={source:"asset-database.json",files:db.rows.length,png,uniqueContents:db.stats.uniqueBlobs,duplicateCopies:db.stats.duplicateCopies,
 colorModes,topDimensions:[...widths].sort((a,b)=>b[1]-a[1]).slice(0,18),
 portraitConcepts:concept,oversizedImages:wide,sourceNeedsReview:unreviewed.length,
 exampleLicenseReview:unreviewed.slice(0,12),styleFamilies:families,issues:bad};
// Canonical generated motion sheets: metadata-only review flags (not a visual defect verdict).
const motionFamilies=["gba-v2","gba-v2-c"];
const motionCharacters=motionFamilies.flatMap(family=>{
 const file=new URL("../../game-assets/characters/"+family+"/manifest.json",import.meta.url);
 const manifest=JSON.parse(readFileSync(file,"utf8"));
 return manifest.characters.map(c=>({id:c.id,family,alphaAudit:c.alphaAudit||{}}));
});
const highSemi=motionCharacters.filter(c=>{
 const opaque=c.alphaAudit.opaquePixels||0,semi=c.alphaAudit.semiTransparentPixels||0;
 return semi/(semi+opaque||1)>0.99;
});
const uncertainCorners=motionCharacters.filter(c=>c.alphaAudit.cornersTransparent===false);
result.characterMotionAlphaReview={characters:motionCharacters.length,partialAlphaShareAbove99Percent:highSemi.length,nontransparentCornerSheets:uncertainCorners.map(c=>c.id),status:"review-required-not-confirmed-defect",triage:"game-assets/catalog/asset-visual-qa-20261121.json"};
console.log(JSON.stringify(result,null,2));
if(bad.length){console.error("FAIL: found "+bad.length+" invalid/mismatched image headers");process.exitCode=1}
