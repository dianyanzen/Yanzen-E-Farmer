#!/usr/bin/env node
/**
 * Canonical farmhouse art pipeline: individual full-res masters -> standalone
 * WebP runtime textures. Never slice furniture from a composite atlas.
 */
import sharp from "sharp";
import {readFile,mkdir,writeFile,stat} from "node:fs/promises";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const masters=path.join(root,"game-assets/masters/yanzen-farmhouse-native-v1");
const output=path.join(root,"public/game/assets/farmhouse-native/v1");
const sources=[
  {id:"room-base",file:"room-base.png",limit:384,alpha:false},
  {id:"house-exterior",file:"house-exterior.png",limit:448,alpha:true},
  {id:"bed",file:"bed-and-nightstand.png",limit:320,alpha:true},
  {id:"chest",file:"chest.png",limit:320,alpha:true},
  {id:"shelf",file:"shelf.png",limit:320,alpha:true},
  {id:"workdesk",file:"workdesk.png",limit:320,alpha:true}
];
await mkdir(output,{recursive:true});
const manifest={schemaVersion:1,source:"six independently generated full-res images",
  artFamily:"yz-farmlife-rustic-hd-pixel",tilePx:20,files:[]};
for(const item of sources){
  const source=path.join(masters,item.file);
  const bytes=await readFile(source);
  const checksum=createHash("sha256").update(bytes).digest("hex");
  const meta=await sharp(bytes).metadata();
  if(meta.width!==1254||meta.height!==1254)
    throw new Error("Master dimensions changed: "+item.file);
  let selection={left:0,top:0,width:meta.width,height:meta.height};
  if(item.alpha){
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let minX=info.width,minY=info.height,maxX=-1,maxY=-1;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
      const i=(y*info.width+x)*info.channels+3;
      if(data[i]>16){
        if(x<minX)minX=x;if(x>maxX)maxX=x;
        if(y<minY)minY=y;if(y>maxY)maxY=y;
      }else data[i]=0;
    }
    if(maxX<0)throw new Error("Fully transparent sprite: "+item.id);
    selection={
      left:Math.max(0,minX-10),top:Math.max(0,minY-10),
      width:Math.min(info.width,maxX+11)-Math.max(0,minX-10),
      height:Math.min(info.height,maxY+11)-Math.max(0,minY-10)
    };
    await sharp(data,{raw:{width:info.width,height:info.height,channels:4}})
      .extract(selection)
      .resize({width:item.limit,height:item.limit,fit:"inside",
        kernel:sharp.kernel.lanczos3,withoutEnlargement:true})
      .webp({quality:92,effort:6,alphaQuality:100})
      .toFile(path.join(output,item.id+".webp"));
  }else{
    await sharp(bytes).resize(item.limit,item.limit,{fit:"fill",
      kernel:sharp.kernel.lanczos3}).webp({quality:92,effort:6})
      .toFile(path.join(output,item.id+".webp"));
  }
  const out=path.join(output,item.id+".webp");
  const dims=await sharp(out).metadata();
  manifest.files.push({
    id:item.id,master:"game-assets/masters/yanzen-farmhouse-native-v1/"+item.file,
    src:"/game/assets/farmhouse-native/v1/"+item.id+".webp",
    sha256:checksum,exportWidth:dims.width,exportHeight:dims.height,
    alpha:item.alpha,sourceCrop:selection,bytes:(await stat(out)).size
  });
  console.log("farmhouse "+item.id+" "+dims.width+"x"+dims.height);
}
await writeFile(path.join(output,"manifest.json"),
 JSON.stringify(manifest,null,2)+"\n","utf8");
