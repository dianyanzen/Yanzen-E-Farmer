import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {inflateSync} from "node:zlib";
const assets=["public/game/assets/market/iyan/pakan-ayam.png","public/game/assets/market/inggit/telur.png","public/game/assets/market/inggit/kopi-hitam.png","public/game/assets/market/inggit/teh-hangat.png","public/game/assets/market/inggit/bala-bala.png","public/game/assets/market/inggit/nasi-tutug.png","public/game/assets/locations/iyan/bran-sack.png","public/game/assets/locations/iyan/weighing-scale.png"];
const hashes=new Set();
for(const path of assets){const png=readFileSync(path);assert.equal(png.readUInt32BE(16),56);assert.equal(png.readUInt32BE(20),56);assert.equal(png.readUInt8(25),6);const chunks=[];for(let pos=8;pos<png.length;){const size=png.readUInt32BE(pos);if(png.toString("ascii",pos+4,pos+8)==="IDAT")chunks.push(png.subarray(pos+8,pos+8+size));pos+=size+12;}assert.equal(inflateSync(Buffer.concat(chunks)).length,56*(1+56*4));hashes.add(createHash("sha256").update(png).digest("hex"));}
assert.equal(hashes.size,assets.length,"Every merchant asset must be independent");
console.log("PASS: merchant visual PNG dimensions, decoding, alpha format and distinct content");
