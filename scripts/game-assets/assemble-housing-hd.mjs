#!/usr/bin/env node
/** Assemble committed HD asset payloads into real, cacheable WebP files.
 * Base64 segments are tracked as UTF-8 for reliable connector transfer;
 * the output is byte-for-byte original WebP with SHA-256 verification.
 * This script must run before tests and before next build.
 */
import {createHash} from "node:crypto";
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const source=join(root,"game-assets/hd-pack/v3");
const destination=join(root,"public/game/assets/hd");
const ASSETS=[
  {prefix:"exterior",count:13,name:"housing-market-hd.webp",width:960,height:640,sha256:"1613ab871c65005de64f6a003e6f22bbe8c183971cfe54ad5b33bc423ffd6a42"},
  {prefix:"interior",count:7,name:"housing-interiors-hd.webp",width:640,height:640,sha256:"b843b1563152b15ae053f4559e67f5f0c8fb76e7bde1994b7500755927236f9e"},
];
mkdirSync(destination,{recursive:true});
for(const item of ASSETS){
 const content=Array.from({length:item.count},(_,i)=>{
   const path=join(source,item.prefix+"-"+String(i).padStart(2,"0")+".b64");
   if(!existsSync(path))throw new Error("Missing HD payload: "+path);
   return readFileSync(path,"utf8").trim();
 }).join("");
 const binary=Buffer.from(content,"base64");
 const actual=createHash("sha256").update(binary).digest("hex");
 if(actual!==item.sha256)throw new Error(item.name+" checksum mismatch: "+actual);
 if(binary.toString("ascii",0,4)!=="RIFF"||binary.toString("ascii",8,12)!=="WEBP")
   throw new Error(item.name+" is not WebP");
 const path=join(destination,item.name);
 writeFileSync(path,binary);
 console.log("PASS: "+item.name+" "+binary.length+" bytes, checksum verified");
}
