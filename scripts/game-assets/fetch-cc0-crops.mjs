#!/usr/bin/env node
/**
 * Fetches verified CC0 FarmingCrops16x16 pack into gitignored local staging.
 * Downloads only; does not unpack, execute, publish, or modify game code.
 */
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const catalog = JSON.parse(readFileSync(resolve(root, "game-assets/catalog/sources.json"), "utf8"));
const item = catalog.records.find(r => r.id === "oga-farming-crops-16");
if (!item || item.license !== "CC0-1.0" || item.redistribution !== "CC0") throw Error("Catalog license check failed");
const SOURCE = "https://opengameart.org/sites/default/files/FarmingCrops16x16.zip";
const staging = resolve(root, "game-assets/_downloads");
const outfile = resolve(staging, "FarmingCrops16x16.zip");
const metadata = resolve(staging, "FarmingCrops16x16.source.json");
const maxBytes = 8 * 1024 * 1024;

if (process.argv.includes("--help")) {
  console.log("Usage: node scripts/game-assets/fetch-cc0-crops.mjs --accept-cc0 [--replace]");
  process.exit(0);
}
if (!process.argv.includes("--accept-cc0")) {
  console.log("No files changed. Source: " + item.sourceUrl);
  console.log("License: CC0-1.0 by " + item.author + ". Re-verify at source and pass --accept-cc0 to download into a private staging folder.");
  process.exit(0);
}
if (existsSync(outfile) && !process.argv.includes("--replace")) {
  console.error("Source archive exists: " + outfile + "; use --replace only after verifying the upstream license.");
  process.exit(2);
}
mkdirSync(staging, {recursive:true});
const temp = outfile + ".part";
function download(url, n=0) {
  return new Promise((ok,fail)=>{
    if(n>3)return fail(new Error("Too many redirects"));
    const parsed = new URL(url);
    if(parsed.protocol !== "https:" || parsed.hostname !== "opengameart.org") return fail(new Error("Unexpected download host: "+parsed.hostname));
    https.get(parsed, {headers:{"User-Agent":"YZFarmLifeAssetAudit/0.1","Accept":"application/zip,application/octet-stream"}}, res=>{
      if ([301,302,303,307,308].includes(res.statusCode||0)){
        res.resume(); const redirect = res.headers.location;
        if(!redirect)return fail(new Error("Redirect without location"));
        return download(new URL(redirect,url).toString(),n+1).then(ok,fail);
      }
      if(res.statusCode!==200){res.resume(); return fail(new Error("HTTP "+res.statusCode));}
      const hash=createHash("sha256"); let size=0; let first=Buffer.alloc(0);
      const out=createWriteStream(temp, {flags:"wx"});
      res.on("data",chunk=>{
        size+=chunk.length;
        if(first.length<4)first=Buffer.concat([first,chunk]).subarray(0,4);
        if(size>maxBytes)res.destroy(new Error("Asset ZIP exceeded 8 MiB limit"));
        else hash.update(chunk);
      });
      res.on("error",fail);
      out.on("error",fail);
      out.on("finish",()=>{
        if(first.toString("latin1",0,2)!=="PK")return fail(new Error("Payload not ZIP"));
        ok({bytes:size,sha256:hash.digest("hex")});
      });
      res.pipe(out);
    }).on("error",fail);
  });
}
try{
  const result=await download(SOURCE);
  renameSync(temp,outfile);
  writeFileSync(metadata,JSON.stringify({
    id:item.id,author:item.author,sourcePage:item.sourceUrl,sourceArchive:SOURCE,
    license:item.license,checkedOn:item.checkedOn,downloadedAt:new Date().toISOString(),
    ...result,publishedToGame:false
  },null,2)+"\n");
  console.log("CC0 archive saved to private gitignored staging. sha256="+result.sha256+" bytes="+result.bytes);
  console.log("Next: inspect zip contents safely, read included license and choose compatible frames. No game assets integrated yet.");
}catch(e){
  rmSync(temp,{force:true}); console.error("Download aborted: "+String(e));process.exitCode=1;
}
