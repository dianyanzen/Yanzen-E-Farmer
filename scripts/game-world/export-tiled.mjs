#!/usr/bin/env node
/**
 * Export the existing Pasirluyu model topology to a Tiled editable blueprint.
 * No new gameplay, no invented GIS roads, no binary asset imports.
 *
 * Usage: node scripts/game-world/export-tiled.mjs [--check]
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root=resolve(fileURLToPath(new URL("../../",import.meta.url)));
const modelPath=resolve(root,"src/lib/game/model.ts");
const src=readFileSync(modelPath,"utf8");
const js=ts.transpileModule(src,{compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true
}}).outputText;
const m={exports:{}};
vm.runInNewContext(js,{exports:m.exports,module:m,require:(id)=>{
  if(id==="../../../game-assets/catalog/cast.json")
    return JSON.parse(readFileSync(resolve(root,"game-assets/catalog/cast.json"),"utf8"));
  throw Error("Unexpected dependency in world map data: "+id+"; audit before export");
}},{timeout:3000});
const model=m.exports;
const {PASIRLUYU_MASTER, PASIRLUYU_CHUNKS, ROUTE_PORTALS, ROUTE_BARRIERS,areaTitle}=model;
const {width,height,chunkWidth,chunkHeight,tileSize:T}=PASIRLUYU_MASTER;
if(width!==chunkWidth*2||height!==chunkHeight*3||chunkWidth!==model.WORLD.width||chunkHeight!==model.WORLD.height||T!==model.WORLD.tile)
  throw Error("Master map contract changed; update the blueprint exporter and tests");
const props=(values)=>Object.entries(values).map(([name,value])=>({
 name,type:typeof value==="boolean"?"bool":typeof value==="number"?"int":"string",value
}));
const objects=[];
let nextObjectId=1;
const makeObject=(name,x,y,w,h,properties,extra={})=>({
 id:nextObjectId++,name,rotation:0,visible:true,x,y,
 width:w,height:h,properties:props(properties),...extra
});
const sections=[];
for(let row=0;row<height/chunkHeight;row++)for(let col=0;col<width/chunkWidth;col++){
 const zone=Object.entries(PASIRLUYU_CHUNKS).find(([,v])=>v.col===col&&v.row===row)?.[0];
 const active=Boolean(zone);
 sections.push(makeObject(zone?areaTitle(zone):"Zona pengembangan",col*chunkWidth*T,row*chunkHeight*T,
 chunkWidth*T,chunkHeight*T,{scene:zone??"unbuilt",status:active?"playable":"planned",chunk_col:col,chunk_row:row,
 note:"Editor reference only: no geographic polygon or authored tileset",district:"Regol",village:"Pasirluyu"}));
}
const portals=[];
const roadBlocks=[];
function edgeRect(loc,side,start,end){
 const c=PASIRLUYU_CHUNKS[loc];
 const baseX=c.originX*T,baseY=c.originY*T,len=(end-start+1)*T;
 if(side==="right")return [baseX+(chunkWidth-1)*T,baseY+start*T,T,len];
 if(side==="left")return [baseX,baseY+start*T,T,len];
 if(side==="up")return [baseX+start*T,baseY,len,T];
 if(side==="down")return [baseX+start*T,baseY+(chunkHeight-1)*T,len,T];
 throw Error("Unknown map boundary direction: "+side);
}
for(const p of ROUTE_PORTALS){
 const box=edgeRect(p.from,p.direction,p.start,p.end);
 portals.push(makeObject(p.from+" to "+p.to,...box,{from:p.from,to:p.to,
  direction:p.direction,passable:true,kind:"portal",start_tile:p.start,end_tile:p.end}));
 // validate the opposite portal exists before declaring an editable seam
 const matching=ROUTE_PORTALS.some(q=>q.from===p.to&&q.to===p.from);
 if(!matching)throw Error("One-way atlas seam without matching opposite side: "+p.from+" → "+p.to);
}
for(const b of ROUTE_BARRIERS){
 const box=edgeRect(b.location,b.side,b.start,b.end);
 roadBlocks.push(makeObject(b.label,...box,{location:b.location,kind:"route_blocker",artwork:b.artwork,
  message:b.message,future:b.future,passable:false,side:b.side}));
}
const objectLayer=(id,name,items)=>({id,name,type:"objectgroup",draworder:"topdown",
 objects:items,opacity:1,visible:true,x:0,y:0});
const map={
 compressionlevel:-1,height,infinite:false,orientation:"orthogonal",
 renderorder:"right-down",tiledversion:"1.11.2",tileheight:T,tilewidth:T,
 type:"map",version:"1.10",width,
 layers:[
  objectLayer(1,"01 | Chunk wilayah (referensi)",sections),
  objectLayer(2,"02 | Portal jalan tersambung",portals),
  objectLayer(3,"03 | Penutup jalan dan interaksi",roadBlocks)
 ],
 nextlayerid:4,nextobjectid:nextObjectId,
 properties:props({game:"YZ Farm Life",world:"Pasirluyu",city:"Bandung",
  authoritative_runtime:false,road_geometry_complete:false,
  info:"Blueprint objek untuk Tiled. Artwork dan collision runtime tetap di game."}),
 tilesets:[]
};
const mapPath=resolve(root,"game-assets/tiled/pasirluyu-master.tmj");
const worldPath=resolve(root,"game-assets/tiled/pasirluyu.world");
const world={maps:[{fileName:"pasirluyu-master.tmj",x:0,y:0,width:width*T,height:height*T}],
 type:"world",onlyShowAdjacentMaps:false};
const outputs=[[mapPath,JSON.stringify(map,null,2)+"\n"],[worldPath,JSON.stringify(world,null,2)+"\n"]];
if(process.argv.includes("--check")){
 for(const [path,content] of outputs){
  if(!existsSync(path)||readFileSync(path,"utf8").replace(/\r\n/g,"\n")!==content)
    throw Error("Tiled blueprint is out of date: "+path+" — run npm run tools:tiled:export");
 }
 console.log("Tiled blueprint consistency: PASS — "+sections.length+" chunks, "+portals.length+" directed portals, "+roadBlocks.length+" barriers");
}else{
 for(const [path,content] of outputs){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);}
 console.log("Tiled blueprint generated: "+mapPath+" and "+worldPath);
}
