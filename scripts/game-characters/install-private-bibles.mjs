#!/usr/bin/env node
/** Atomic private Docker Bible installation. Source and backups are never committed. */
import {readFileSync,writeFileSync,existsSync,lstatSync,mkdirSync,copyFileSync,renameSync,chmodSync,rmSync} from "node:fs";
import {resolve,dirname,basename,isAbsolute,join} from "node:path";
import {randomBytes} from "node:crypto";
import {spawnSync} from "node:child_process";

const root=process.cwd();
const absolute=p=>isAbsolute(p)?p:resolve(root,p);
const destination=absolute(process.env.GAME_RESIDENT_BIBLES||"deploy/private/character-bibles.json");
const candidate=process.argv.find(x=>!x.startsWith("--"));
const checkOnly=process.argv.includes("--check");
let staged;
try{
 if(!candidate)throw Error("missing-input");
 const input=absolute(candidate);
 if(input===destination)throw Error("source-is-destination");
 if(existsSync(destination)&&lstatSync(destination).isSymbolicLink())throw Error("unsafe-symlink");
 const raw=readFileSync(input,"utf8");
 const doc=JSON.parse(raw);
 if(doc?.schemaVersion<3||doc?.canonicalFingerprintSha256!=="cd19795344bbb4fefc0022a3f17d25135d79624de4d5d9c6c618699cc1f871a0"||
   !doc.profiles||Object.keys(doc.profiles).length!==248)throw Error("invalid-draft-metadata");
 mkdirSync(dirname(destination),{recursive:true,mode:0o700});
 staged=join(dirname(destination),".character-bibles-"+process.pid+"-"+randomBytes(5).toString("hex")+".tmp");
 writeFileSync(staged,raw,{flag:"wx",mode:0o600});
 // Validate the staged file using the same private canonical roster and asset paths.
 const test=spawnSync(process.execPath,["scripts/game-characters/audit-private-bibles.mjs","--strict"],{
  cwd:root,env:{...process.env,GAME_RESIDENT_BIBLES:staged},encoding:"utf8",maxBuffer:1024*1024
 });
 if(test.status!==0)throw Error("staged-private-audit-failed");
 if(checkOnly){
  console.log("PASS: private 248-profile draft passed dry-run validation. No server file changed.");
 }else{
  if(existsSync(destination)){
   const backup=destination+".backup-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+randomBytes(3).toString("hex");
   copyFileSync(destination,backup);
   chmodSync(backup,0o600);
  }
  renameSync(staged,destination);
  staged=undefined;
  chmodSync(destination,0o600);
  console.log("PASS: private 248-profile draft installed atomically; prior file backed up when present.");
 }
}catch{
 console.error("FAIL: private Bible installation stopped. No identities, paths, or file content are logged.");
 process.exitCode=1;
}finally{
 if(staged)rmSync(staged,{force:true});
}
