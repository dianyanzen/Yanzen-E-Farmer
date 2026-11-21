#!/usr/bin/env node
/**
 * Export only explicitly approved, public-facing fictional NPC fields.
 * Do not export Docker PostgreSQL, private player saves or auth/session data.
 * Usage: node scripts/game-characters/prepare-public-resident-roster.mjs --input deploy/private/residents.json
 * Add --write only after inspecting the input and reviewing the names.
 */
import {createHash} from "node:crypto";
import {existsSync,readFileSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const target=resolve(root,"src/lib/game/data/published-residents.json");
const args=process.argv.slice(2);
const sourceAt=args.indexOf("--input");
const sourceArg=sourceAt>=0?args[sourceAt+1]:null;
const write=args.includes("--write");
const legal=new Set(["--input","--write",sourceArg]);
if (!sourceArg || args.some(arg=>!legal.has(arg))) {
 console.error("Usage: node scripts/game-characters/prepare-public-resident-roster.mjs --input <private-roster.json> [--write]");
 process.exit(2);
}
const idPattern=/^(?:[ACNK]\d{2}|P0[12]|W\d{3})$/;
const portraitPattern=/^(?:P0[12]|N0[1-6]|K(?:0[1-9]|[12]\d|30)|R\d{3}|phone-(?:A(?:0[1-9]|1[0-6])|C0[158])|work-[AC](?:0[1-9]|1[0-6]))$/;
function portraitFile(id) {
 const group=id.startsWith("R")?"residents":id.startsWith("K")?"neighborhood":
  id.startsWith("N")?"specialists":id.startsWith("P")?"civic":
  id.startsWith("phone-")?"phone":"professions";
 return resolve(root,"public/game/assets/portraits/bandung",group,id+".png");
}
function fail(message) {throw new Error("Roster tidak dapat dipublikasi: "+message);}
function checkPublicRoster(input) {
 if(!Array.isArray(input)||input.length>500)fail("harus berupa array maksimal 500 warga");
 const seenIds=new Set(),seenNames=new Set();
 return input.map((row,index)=>{
  if(!row||typeof row!=="object"||Array.isArray(row))fail("baris "+index+" bukan objek");
  const keys=Object.keys(row);
  if(keys.length!==4||keys.some(key=>!["id","name","occupation","portrait"].includes(key)))
   fail("baris "+index+" mengandung field privat/tidak dikenal (hanya id, name, occupation, portrait diizinkan)");
  const {id,name,occupation,portrait}=row;
  if(typeof id!=="string"||!idPattern.test(id))fail("ID tidak valid pada baris "+index);
  for(const [label,value] of [["name",name],["occupation",occupation]]) {
   if(typeof value!=="string"||value!==value.trim()||!value||value.length>120||/[\r\n\u0000-\u001f<>]/u.test(value))
    fail(label+" tidak valid pada "+id);
  }
  if(typeof portrait!=="string"||!portraitPattern.test(portrait))fail("portrait tidak dikenal pada "+id);
  if(!existsSync(portraitFile(portrait)))fail("aset portrait untuk "+id+" belum tersedia di GitHub: "+portrait);
  if(seenIds.has(id)||seenNames.has(name.toLocaleLowerCase("id")))fail("ID/nama ganda: "+id);
  seenIds.add(id);seenNames.add(name.toLocaleLowerCase("id"));
  return {id,name,occupation,portrait};
 });
}
try{
 const absolute=resolve(process.cwd(),sourceArg);
 if(!existsSync(absolute))fail("file sumber tidak ditemukan");
 const content=JSON.parse(readFileSync(absolute,"utf8"));
 const data=checkPublicRoster(content);
 const output=JSON.stringify(data,null,2)+"\n";
 const sha=createHash("sha256").update(output).digest("hex");
 const current=existsSync(target)?readFileSync(target,"utf8"):"";
 if(write){
  if(current===output)console.log("TIDAK ADA PERUBAHAN: "+data.length+" warga, SHA256 "+sha);
  else{writeFileSync(target,output);console.log("DIPERBARUI: "+data.length+" warga di src/lib/game/data/published-residents.json; SHA256 "+sha);}
 }else{
  console.log("VALIDASI LULUS: "+data.length+" warga, SHA256 "+sha);
  console.log("Dry-run: tidak menulis file. Tinjau identitas/potret dahulu; tambahkan --write jika aman untuk repo publik.");
 }
}catch(error){console.error(error instanceof Error?error.message:"Gagal membaca roster.");process.exitCode=1;}
