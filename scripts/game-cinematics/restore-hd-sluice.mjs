#!/usr/bin/env node
/** Restore the HD film rendered with Remotion from lossless base64 transport chunks.
 * The fallback 320x180 MP4 stays in Git for compatibility. Vercel game builds
 * replace it with the 960x540/30fps cinematic immediately before next build.
 */
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync,renameSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const folder=resolve(root,"game-assets/cinematics/sluice-gate-hd");
const manifest=JSON.parse(readFileSync(resolve(folder,"manifest.json"),"utf8"));
const src=manifest.parts.map(name=>readFileSync(resolve(folder,name),"utf8").trim()).join("");
const bytes=Buffer.from(src,"base64");
const sha256=createHash("sha256").update(bytes).digest("hex");
if(bytes.length!==manifest.bytes||sha256!==manifest.sha256)throw new Error("HD Remotion film integrity check failed");
if(bytes.toString("ascii",4,8)!=="ftyp")throw new Error("Expected an MP4 container");
if(manifest.width!==960||manifest.height!==540||manifest.fps!==30)throw new Error("Unexpected HD render contract");
if(process.argv.includes("--check")){
 console.log("PASS: HD Remotion 960x540, 30fps, "+bytes.length+" bytes, SHA256 verified");
}else{
 const dest=resolve(root,"public/game/assets/cutscenes/sluice-gate.mp4");
 mkdirSync(dirname(dest),{recursive:true});
 const tmp=dest+".tmp";
 writeFileSync(tmp,bytes);
 renameSync(tmp,dest);
 console.log("Restored HD Remotion cinematic: "+bytes.length+" bytes");
}
