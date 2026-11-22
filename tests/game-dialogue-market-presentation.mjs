import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

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
assert.ok(client.includes('className="yzg-market-fish"'),
  "Each sell card must display its corresponding fish sprite");
assert.ok(!client.includes('<NextImage src="/game/assets/tiles/fish-market.png"'),
  "Loose decorative fish strip must not return above conversation");
assert.ok(client.includes('open={dialogue.title==="Lapak pasar"}'),
  "Keep the merchant section open after a purchase or sale");
assert.ok(panel.includes('dialogue.emotions?.[page] ?? dialogue.emotion'),
  "Dialogue needs its eight-expression portrait behavior");
assert.ok(panel.includes('var(--portrait-center-shift, 0px)'),
  "Portrait calibration must not rewrite source pixel art");
assert.ok(panel.includes('className="yzg-sr-only">Bagian'),
  "Page count must remain accessible without cluttering the player UI");
assert.ok(css.includes(".yzg-market-fish") && css.includes("background-size:300% 100%"),
  "Fish atlas frames must be cropped into individually actionable icons");
assert.ok(css.includes("max-height:min(72dvh,620px)"),
  "Mobile dialogue must leave some world visible");
assert.ok(model.includes("Widi · Lapak pancing") && model.includes("FISH_IDS.some(fish=>s.fishing.fish[fish]>0)"),
  "Widi must speak briefly and react to the player's fish inventory");
console.log("PASS: merchant conversation flow, owned-fish artwork, mobile dialogue layout and portrait calibration");
