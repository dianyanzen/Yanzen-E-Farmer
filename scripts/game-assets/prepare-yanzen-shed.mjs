#!/usr/bin/env node
/**
 * YZ Farm Life: individual shed masters -> individual WebP runtime assets.
 * No furniture atlas slicing; the old images remain available for rollback.
 */
import sharp from "sharp";
import {readFile,mkdir,writeFile,stat} from "node:fs/promises";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const from=path.join(root,"game-assets/masters/yanzen-shed-native-v1");
const to=path.join(root,"public/game/assets/shed-native/v1");
const sources=[
  {id:"room-base",file:"shed-room-base.jpg",limit:416,alpha:false},
  {id:"exterior",file:"shed-exterior.png",limit:448,alpha:true},
  {id:"tools-shelves",file:"tools-shelves.png",limit:320,alpha:true},
  {id:"workbench",file:"workbench.png",limit:320,alpha:true},
  {id:"produce-crates",file:"produce-crates.png",limit:320,alpha:true},
  {id:"irrigation-rack",file:"irrigation-rack.png",limit:320,alpha:true}
];
await mkdir(to,{recursive:true});
const manifest={schemaVersion:1,family:"yz-farmlife-warm-rustic-pixel",tilePx:20,
  generation:"six independently generated master images",files:[]};
for(const spec of sources){
 const master=path.join(from,spec.file),bytes=await readFile(master);
 const meta=await sharp(bytes).metadata();
 if(meta.width!==1254||meta.height!==1254)throw Error("Unexpected master size: "+spec.file);
 let selection={left:0,top:0,width:meta.width,height:meta.height};
 const target=path.join(to,spec.id+".webp");
 if(spec.alpha){
   const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   let left=info.width,top=info.height,right=-1,bottom=-1;
   for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
     const index=(y*info.width+x)*info.channels+3;
     if(data[index]>16){
       left=Math.min(left,x);right=Math.max(right,x);
       top=Math.min(top,y);bottom=Math.max(bottom,y);
     }else data[index]=0;
   }
   if(right<0)throw Error("Empty alpha: "+spec.id);
   selection={left:Math.max(0,left-8),top:Math.max(0,top-8),
     width:Math.min(info.width,right+9)-Math.max(0,left-8),
     height:Math.min(info.height,bottom+9)-Math.max(0,top-8)};
   await sharp(data,{raw:{width:info.width,height:info.height,channels:4}})
     .extract(selection)
     .resize(spec.limit,spec.limit,{fit:"inside",withoutEnlargement:true,
       kernel:sharp.kernel.lanczos3})
     .webp({quality:90,effort:6,alphaQuality:100}).toFile(target);
 }else{
   await sharp(bytes).resize(spec.limit,spec.limit,{fit:"fill",
     kernel:sharp.kernel.lanczos3})
     .webp({quality:91,effort:6}).toFile(target);
 }
 const output=await sharp(target).metadata();
 manifest.files.push({id:spec.id,src:"/game/assets/shed-native/v1/"+spec.id+".webp",
   master:"game-assets/masters/yanzen-shed-native-v1/"+spec.file,
   masterSha256:createHash("sha256").update(bytes).digest("hex"),
   sourceCrop:selection,width:output.width,height:output.height,
   alpha:output.hasAlpha,bytes:(await stat(target)).size});
 console.log("Shed: "+spec.id+" "+output.width+"x"+output.height);
}
await writeFile(path.join(to,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
