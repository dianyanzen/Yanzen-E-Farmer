import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(p,"utf8");
const path="public/game/assets/locations/yanzen/housing-atlas-v2.png";
assert.ok(existsSync(path),"Modular housing atlas is missing");
const data=readFileSync(path);
assert.equal(data.toString("ascii",1,4),"PNG","Housing atlas must be PNG");
assert.equal(data.readUInt32BE(16),192,"Four sprite columns must remain 48px each");
assert.equal(data.readUInt32BE(20),96,"Two sprite rows must remain 48px each");
assert.equal(data.length,5071,"Approved initial pixel-art preview bytes must not change silently");
const sha=createHash("sha1").update(`blob ${data.length}\0`).update(data).digest("hex");
assert.equal(sha,"b9f67d4de8eeb794164e2ac2d38660c8bfb92c5d");
const housing=read("src/lib/game/housing-v2.ts");
for(const required of ["houseExterior:0","houseBase:1","houseFurniture:2","shedExterior:3",
 "shedBase:4","shedFurniture:5","residentA:6","residentB:7","drawHousingInterior",
 "drawHousingFrame","exteriorHousingSprite"])assert.ok(housing.includes(required),required);
const canvas=read("src/lib/game/draw-world.ts");
const phaser=read("src/lib/game/phaser-world.ts");
const client=read("src/app/game/game-client.tsx");
assert.ok(canvas.includes('drawHousingInterior(ctx,art.housingAtlas,"home"') &&
 canvas.includes('drawHousingInterior(ctx,art.housingAtlas,"shed"'));
assert.ok(phaser.includes('this.load.spritesheet("yz-housing-v2"')&&
 phaser.includes('drawHousingInterior(brush,atlas,room,evening)'));
assert.ok(client.includes('housingAtlas: "locations/yanzen/housing-atlas-v2.png"'));
assert.ok(canvas.includes("exteriorHousingSprite(prop.asset)")&&
 phaser.includes("exteriorHousingSprite(prop.asset)"));
const model=read("src/lib/game/model.ts");
for(const contract of ['case "home-door":','case "shed-door":','case "home-exit":',
 'case "shed-exit":','export function canSleep','export function canManageTools']){
 assert.ok(model.includes(contract),"Gameplay contract missing: "+contract);
}
for(const original of ["public/game/assets/pasirluyu/rumah-yanzen-interior-day.svg",
 "public/game/assets/pasirluyu/gudang-interior.svg",
 "public/game/assets/tiles/farm-kit/objek/rumah-yanzen.png"]){
 assert.ok(existsSync(original),"Never delete fallback art: "+original);
}
const catalog=JSON.parse(read("game-assets/catalog/asset-database.json"));
const item=catalog.rows.find(row=>row[0]===path);
assert.equal(item?.[1],sha);
assert.equal(item?.[6],"housing-owner-generated-modular-preview-v2");
assert.equal(catalog.rows.length,2500);
console.log("PASS: 8 housing frames, dual-renderer assets, unchanged gameplay contracts, tracked atlas and fallbacks");
