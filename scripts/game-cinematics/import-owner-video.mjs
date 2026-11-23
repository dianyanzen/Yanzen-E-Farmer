#!/usr/bin/env node
/**
 * Integrates the exact owner-approved Pasirluyu video.
 *
 * Permanent import on an authenticated clone:
 *   node scripts/game-cinematics/import-owner-video.mjs --file /path/to/owner.mp4
 *   npm run assets:index && npm run assets:categories
 *   git add ... && git commit && git push
 *
 * Temporary immutable Vercel preview:
 *   YZ_SLUICE_VIDEO_SOURCE_URL=<approved presigned URL> node ... --preview
 *
 * NEVER transcoding or treating a different MP4 as this video. The original
 * SHA256 is a hard gate. This script does not alter save/progress.
 */
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,renameSync,mkdirSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const manifest=JSON.parse(readFileSync(resolve(root,"game-assets/cinematics/pasirluyu-sluice/manifest.json"),"utf8"));
const dst=resolve(root,manifest.playbackPath);
const isPreview=process.argv.includes("--preview");
const arg=process.argv.indexOf("--file");
const local=arg>=0?process.argv[arg+1]:null;
const digest=buf=>createHash("sha256").update(buf).digest("hex");
const verify=buf=>{
 if(buf.length!==manifest.sourceBytes || digest(buf)!==manifest.sourceSha256)
  throw new Error("Cutscene rejected: uploaded video differs from the approved original");
 if(buf.toString("ascii",4,8)!=="ftyp")throw new Error("Cutscene rejected: invalid MP4");
};
let bytes;
if(local){bytes=readFileSync(resolve(local));}
else if(process.env.YZ_SLUICE_VIDEO_SOURCE_URL){
 const response=await fetch(process.env.YZ_SLUICE_VIDEO_SOURCE_URL,{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw new Error("Approved video source unavailable: HTTP "+response.status);
 bytes=Buffer.from(await response.arrayBuffer());
}else if(existsSync(dst)){
 bytes=readFileSync(dst);
}else throw new Error("Missing original cutscene; use --file /path/video.mp4 or set YZ_SLUICE_VIDEO_SOURCE_URL");
verify(bytes);
mkdirSync(dirname(dst),{recursive:true});
const temp=dst+".owner-video-tmp";
writeFileSync(temp,bytes);
renameSync(temp,dst);
console.log("PASS: owner video SHA256, "+bytes.length+" bytes, native H.264/AAC source preserved");
if(isPreview){
 // Vercel builds run with a temporary checkout. Update the *temporary git
 // index* so the media catalog verifies the original binary, not the old stub.
 if(!existsSync(resolve(root,".git")))throw new Error("Cannot refresh staging catalog without a git index");
 execFileSync("git",["add",manifest.playbackPath],{cwd:root});
 execFileSync(process.execPath,["scripts/game-assets/build-asset-database.mjs"],{cwd:root,stdio:"inherit"});
 execFileSync(process.execPath,["scripts/game-assets/build-asset-categories.mjs"],{cwd:root,stdio:"inherit"});
 console.log("PASS: preview catalog now reflects the approved owner video");
}
