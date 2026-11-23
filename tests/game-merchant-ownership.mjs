/**
 * Guard player-facing ownership after the staging feature merge:
 * Ayu sells seeds and buys surplus cucumbers, Inggit commissions four
 * cucumbers for her warung, and Widi handles fishing.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";

const source=readFileSync("src/lib/game/model.ts","utf8");
const compiled=ts.transpileModule(source,{
  compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
const mod={exports:{}};
vm.runInNewContext(compiled,{exports:mod.exports,module:mod,
  require:createRequire(new URL("../src/lib/game/model.ts",import.meta.url))});
const {newGame,marketTrade,isMarketMerchant,applyFarmTool,farmOverview,acceptOrder,
  sellableCucumbers,chapterJournal,npcWhere}=mod.exports;
const base=newGame();
const atAyu={...base,location:"pasar",minutes:780,player:{x:6,y:10,dir:"up"}};
assert.deepEqual([npcWhere(atAyu,"A04").x,npcWhere(atAyu,"A04").y],[6,9]);
assert.equal(isMarketMerchant("A04"),true,"Ayu owns the seed and crop stall");
assert.equal(isMarketMerchant("C07"),true,"Widi owns the fish and bait stall");
assert.equal(isMarketMerchant("C08"),false,"Inggit is not a seed/crop counter merchant");

// Buy five seeds for 40 G; seller name and prices must agree with the ledger.
const seedPurchase=marketTrade(atAyu,"A04","seeds");
assert.match(seedPurchase.message,/Ayu/);
assert.match(seedPurchase.message,/40 G/);
assert.equal(seedPurchase.state.seeds,base.seeds+5);
assert.equal(seedPurchase.state.coins,base.coins-40);
assert.equal(seedPurchase.state.fishing.seedPacks,base.fishing.seedPacks+1);
const shortage=marketTrade({...atAyu,coins:20},"A04","seeds");
assert.equal(shortage.state.coins,20);
assert.match(shortage.message,/Ayu/);
assert.doesNotMatch(shortage.message,/Inggit/);

// The first four cucumbers belong to Inggit's story order and cannot be sold.
const reserved=acceptOrder({...atAyu,harvested:4});
const declined=marketTrade(reserved,"A04","cucumber");
assert.equal(declined.state,reserved);
assert.match(declined.message,/Inggit/);
assert.match(declined.message,/Ayu/);
assert.equal(sellableCucumbers(reserved),0);
const excess={...reserved,harvested:7};
const sold=marketTrade(excess,"A04","cucumber");
assert.equal(sold.state.harvested,4);
assert.equal(sold.state.coins,reserved.coins+75);
assert.equal(sold.state.fishing.cropsSold,3);
assert.match(sold.message,/Ayu membeli 3 timun/);
assert.equal(marketTrade(sold.state,"A04","cucumber").state,sold.state,"No double sale");

// Out of seed in farm actions and guidance must direct players to Ayu, not Inggit.
const readyPlot={...base,seeds:0,player:{x:3,y:7,dir:"down"},
  plots:[{x:3,y:8,stage:-1,watered:false}]};
const empty=applyFarmTool(readyPlot,"seed");
assert.equal(empty.state,readyPlot);
assert.match(empty.message,/Ayu/);
assert.doesNotMatch(empty.message,/Inggit/);
assert.match(farmOverview(readyPlot).next,/Ayu/);
assert.doesNotMatch(farmOverview(readyPlot).next,/Pesan/);
const completed={...base,story:{...base.story,orderAccepted:true,orderDone:true,
  canalClue:true,photoSeen:true,photoChoice:"nani",completedDay:base.day}};
assert.match(chapterJournal(completed).objective,/Ayu/);
assert.doesNotMatch(chapterJournal(completed).objective,/jual panen di warung/);

// Widi alone sells bait and buys fish, never seed. Inggit remains the warung quest.
const atWidi={...base,location:"pasar",minutes:780,player:{x:27,y:9,dir:"up"}};
const bait=marketTrade(atWidi,"C07","bait");
assert.match(bait.message,/Widi/);
assert.equal(bait.state.fishing.bait,base.fishing.bait+5);
assert.equal(marketTrade(atWidi,"C07","seeds").state,atWidi);
assert.equal(marketTrade(atAyu,"A04","bait").state,atAyu);

const client=readFileSync("src/app/game/game-client.tsx","utf8");
const areas=readFileSync("src/lib/game/pasirluyu-areas.ts","utf8");
assert.equal((client.match(/dialogue\.photo && <figure/g)||[]).length,1,
  "Nani photo must be drawn once even after feature merges");
assert.equal((client.match(/dialogue\.choosePhoto &&/g)||[]).length,1,
  "Nani's two story-choice buttons must not be duplicated");
assert.ok(client.includes("✉ Ayu · Lapak benih"),"Ayu's YZ Phone commerce message is required");
assert.ok(client.includes('unread || game.seeds===0') &&
  client.includes('Ayu: Bibit habis? Mampir ke lapak benihku'),
  "Empty-seed floating notification must come from Ayu");
assert.ok(client.includes('{game.seeds<=2 && <p>') &&
  client.includes('{sellableCucumbers(game)>0 && <p>'),
  "Ayu must show both buying and selling advice when both conditions apply");
assert.ok(client.includes("Pembelian bibit dan penjualan timun dilakukan langsung di lapak Ayu."));
assert.ok(client.includes("✉ Inggit · Pemilik warung"),"Original four-cucumber quest remains Inggit");
assert.ok(client.includes('if(unread)setGame(g=>({...g,phoneRead:true}))'),
  "Tapping Inggit's notification must clear the unread flag without accepting the order");
assert.ok(client.includes("Inggit: Ada pesanan timun untuk warungku!"));
assert.ok(areas.includes('"KIOS BENIH"') && !areas.includes('"KIOS SAYUR"'),
  "Public seed kiosk sign must match its actual owner");
assert.ok(!source.includes("Temui Inggit untuk membeli bibit."));
assert.ok(!source.includes("jual panen di warung"));
console.log("PASS: merchant roles, Ayu notifications, Widi fish shop, Inggit order reservation, and unique Nani scene");
