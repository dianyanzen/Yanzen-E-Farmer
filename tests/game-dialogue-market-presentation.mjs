import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import assertPng from "node:assert/strict";

const read=path=>readFileSync(path,"utf8");
const client=read("src/app/game/game-client.tsx");
const panel=read("src/app/game/dialogue-panel.tsx");
const css=read("src/app/game/game.css");
const model=read("src/lib/game/model.ts");

const panelStart=client.indexOf("<DialoguePanel key=");
const marketStart=client.indexOf('<details className="yzg-market"');
assert.ok(panelStart>=0 && marketStart>panelStart,"Shop actions must follow NPC dialogue, not cover the speaker");
assert.ok(client.includes("FISH_IDS.filter(id=>game.fishing.fish[id]>0)"),
  "Only owned fish should create sell cards");
assert.ok(client.includes('className="yzg-market-sprite yzg-market-sprite--widi"'),
  "Each sell card must display its corresponding fish sprite");
assert.ok(!client.includes('<NextImage src="/game/assets/tiles/fish-market.png"'),
  "Loose decorative fish strip must not return above conversation");
assert.ok(client.includes('open={dialogue.title==="Lapak pasar"}'),
  "Keep the merchant section open after a purchase or sale");
assert.ok(panel.includes('dialogue.emotions?.[page] ?? dialogue.emotion'),
  "Dialogue needs its eight-expression portrait behavior");
assert.ok(panel.includes('backgroundPosition: `${(column / 7) * 100}% center`'),
  "Portrait calibration must not rewrite source pixel art");
assert.ok(panel.includes('className="yzg-sr-only">Bagian'),
  "Page count must remain accessible without cluttering the player UI");
assert.ok(css.includes("widi-shop-atlas.png") && css.includes("ayu-shop-atlas.png") && css.includes("background-size:300% 200%"),
  "Fish atlas frames must be cropped into individually actionable icons");
assert.ok(css.includes("max-height:min(72dvh,620px)"),
  "Mobile dialogue must leave some world visible");
assert.ok(model.includes("Widi · Lapak pancing") && model.includes("FISH_IDS.some(fish=>s.fishing.fish[fish]>0)"),
  "Widi must speak briefly and react to the player's fish inventory");

const ayu=readFileSync("public/game/assets/tiles/ayu-shop-atlas.png");
const widi=readFileSync("public/game/assets/tiles/widi-shop-atlas.png");
assertPng.deepEqual([ayu.readUInt32BE(16),ayu.readUInt32BE(20)],[112,112],"Ayu icon atlas needs 2x2 equal 56px cells");
assertPng.deepEqual([widi.readUInt32BE(16),widi.readUInt32BE(20)],[168,112],"Widi icon atlas needs 3x2 equal 56px cells");
assert.ok(read("src/app/game/game-client.tsx").includes('className={dialogue.npcId==="C07"?"yzg-market-sprite yzg-market-sprite--widi"'),
 "Both sellers should render item assets");
assert.ok(client.includes('SluiceCutscene') && client.includes('game.personalQuests?.A03?.phase===2'),
 "Sluice cutscene should happen only as a quest beat");
assert.ok(css.includes("yzg-sluice-gate") && css.includes("yzg-cutscene-skip"),
 "Cutscene animation and skip must exist");
console.log("PASS: merchant conversation flow, owned-fish artwork, mobile dialogue layout and portrait calibration");
