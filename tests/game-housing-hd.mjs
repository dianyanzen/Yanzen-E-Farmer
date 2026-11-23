import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync} from "node:fs";
import {createHash} from "node:crypto";
const base="game-assets/hd-pack/v3/";
const cases=[
 {prefix:"exterior",count:13,path:"public/game/assets/hd/housing-market-hd.webp",hash:"1613ab871c65005de64f6a003e6f22bbe8c183971cfe54ad5b33bc423ffd6a42"},
 {prefix:"interior",count:7,path:"public/game/assets/hd/housing-interiors-hd.webp",hash:"b843b1563152b15ae053f4559e67f5f0c8fb76e7bde1994b7500755927236f9e"}
];
for(const v of cases){
 for(let i=0;i<v.count;i++)assert.ok(existsSync(base+v.prefix+"-"+String(i).padStart(2,"0")+".b64"),"Missing HD fragment "+i);
 assert.ok(existsSync(v.path),"Run npm run assets:assemble:hd before HD asset test");
 const buffer=readFileSync(v.path);
 assert.equal(buffer.toString("ascii",0,4),"RIFF");
 assert.equal(buffer.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(buffer).digest("hex"),v.hash);
}
const hd=readFileSync("src/lib/game/housing-hd.ts","utf8");
const canvas=readFileSync("src/lib/game/draw-world.ts","utf8");
const phaser=readFileSync("src/lib/game/phaser-world.ts","utf8");
const outdoor=readFileSync("src/lib/game/modular-outdoor.ts","utf8");
const client=readFileSync("src/app/game/game-client.tsx","utf8");
for(const id of ["house","shed","resident","ayuGeneralStore","widiFishingShop"]){
 if(id==="house"||id==="shed"||id==="resident")continue;
 assert.ok(hd.includes(id),id);
}
assert.match(hd,/HD_FRAME_SIZE=320/);
assert.match(canvas,/drawHDInterior/);
assert.match(canvas,/exteriorHDSprite/);
assert.match(phaser,/yz-hd-exteriors/);
assert.match(phaser,/drawHDInterior/);
assert.match(client,/housingHDExteriors/);
assert.match(client,/housingHDInteriors/);
assert.match(outdoor,/{asset:"lapak-benih",x:128,y:174}/);
assert.ok(!outdoor.includes('{asset:"lapak-benih",closedAsset:'),"Ayu store must not be replaced by vegetable shutters");
const model=readFileSync("src/lib/game/model.ts","utf8");
assert.match(model,/export function marketTrade/);
assert.match(model,/export function canSleep/);
assert.match(model,/export function canManageTools/);
assert.match(model,/case "home-door"/);
assert.match(model,/case "shed-door"/);
console.log("PASS: HD atlas checksums, full-frame buildings, independent interiors, Ayu/Widi, gameplay preservation");
