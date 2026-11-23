import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

const read=path=>readFileSync(path,"utf8");
const modelText=read("src/lib/game/model.ts");
const client=read("src/app/game/game-client.tsx");
const fallbackMap=read("src/lib/game/pasirluyu-areas.ts");
const compiled=ts.transpileModule(modelText,{
  compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
const mod={exports:{}};
vm.runInNewContext(compiled,{exports:mod.exports,module:mod,
  require:createRequire(new URL("../src/lib/game/model.ts",import.meta.url))},{timeout:2000});
const {newGame,npcWhere,isMarketMerchant,marketTrade,applyFarmTool,chapterJournal,farmOverview}=mod.exports;

// Source of truth: Ayu handles seeds and surplus cucumber; Widi handles bait/fish.
// Inggit's first order is a DIFFERENT narrative transaction and must not be redirected.
assert.equal(isMarketMerchant("A04"),true);
assert.equal(isMarketMerchant("C07"),true);
assert.equal(isMarketMerchant("C08"),false);
const start=newGame();
const market={...start,location:"pasar",minutes:700};
const ayu=npcWhere(market,"A04");
const atAyu={...market,player:{x:ayu.x-1,y:ayu.y,dir:"right"}};
const buy=marketTrade(atAyu,"A04","seeds");
assert.notEqual(buy.state,atAyu,"Ayu must sell seeds at her actual market counter");
assert.equal(buy.state.seeds,atAyu.seeds+5);
assert.equal(buy.state.coins,atAyu.coins-40);
assert.match(buy.message,/bibit/i);
assert.equal(buy.state.fishing.seedPacks,atAyu.fishing.seedPacks+1);
const reserved={...atAyu,harvested:7,story:{...atAyu.story,orderAccepted:true,orderDone:false}};
const sale=marketTrade(reserved,"A04","cucumber");
assert.equal(sale.state.harvested,4,"Inggit's four reserved cucumbers must remain untouched");
assert.equal(sale.state.coins,reserved.coins+75,"Ayu pays 25 G for each of three spare cucumbers");
assert.match(sale.message,/terjual/);
const noSpare=marketTrade({...reserved,harvested:4},"A04","cucumber");
assert.match(noSpare.message,/jual/i);
assert.equal(noSpare.state.harvested,4);
const widi=npcWhere(market,"C07");
const atWidi={...market,player:{x:widi.x-1,y:widi.y,dir:"right"}};
const bait=marketTrade(atWidi,"C07","bait");
assert.equal(bait.state.fishing.bait,5);
assert.equal(bait.state.coins,market.coins-15);

// Empty seed stock should guide the player to Ayu, not Inggit or a phone purchase.
const field={...start,seeds:0,location:"field",player:{x:4,y:9,dir:"right"},
  plots:[{x:5,y:9,stage:-1,watered:false}]};
assert.match(applyFarmTool(field,"seed").message,/Ayu/);
assert.doesNotMatch(applyFarmTool(field,"seed").message,/Inggit/);
assert.match(farmOverview(field).next,/Ayu/);
assert.doesNotMatch(farmOverview(field).next,/→ Pesan/);
const complete={...start,story:{...start.story,orderAccepted:true,orderDone:true,
  canalClue:true,photoSeen:true,photoChoice:"nani"}};
assert.match(chapterJournal(complete).objective,/Ayu/);
assert.doesNotMatch(chapterJournal(complete).objective,/jual panen di warung/);
assert.match(chapterJournal(start).objective,/Inggit/);

// A separate Ayu phone card and contextual zero-seed alert must not hijack Inggit's story.
assert.match(client,/✉ Ayu · Penjual benih/);
assert.match(client,/✉ Inggit · Pedagang pasar/);
assert.match(client,/seedStockEmpty = game.seeds === 0/);
assert.match(client,/Ayu: Bibitmu habis/);
assert.match(client,/Inggit: Ada pesanan timun untuk warungku/);
assert.match(client,/saveStatus === "saved" \? "Tersimpan"/);
assert.equal((client.match(/\{dialogue\.photo && <figure/g)||[]).length,1,
  "Merge must not duplicate story photograph");
assert.equal((client.match(/\{dialogue\.choosePhoto && <div/g)||[]).length,1,
  "Merge must not duplicate photo decision buttons");
assert.match(fallbackMap,/LAPAK BENIH/);
assert.doesNotMatch(modelText,/Temui Inggit untuk membeli bibit/);
assert.doesNotMatch(modelText,/Tidak ada timun lepas yang dapat dibeli/);
assert.doesNotMatch(modelText,/Melayani nelayan di lapak ikan/);
console.log("PASS: Ayu owns seed and surplus crop trade; Inggit owns food order; Widi owns fishing; guide and chat match; one story photo/decision; cloud save label accurate");
