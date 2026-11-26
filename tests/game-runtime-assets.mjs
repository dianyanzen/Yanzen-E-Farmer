import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { buildSync } from "esbuild";

const { outputFiles } = buildSync({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
      export { outdoorSources } from "./src/lib/game/modular-outdoor";
      export { activityAssets } from "./src/lib/game/character-activities";
      export { yanzenInteriorAssets } from "./src/lib/game/yanzen-interior-art";
      export { RESIDENT_HOMES, RIVER_FISH_IDS } from "./src/lib/game/model";
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
});
const runtime = { exports: {} };
runInNewContext(outputFiles[0].text, { module: runtime, exports: runtime.exports });
const {
  outdoorSources, activityAssets, yanzenInteriorAssets, RESIDENT_HOMES, RIVER_FISH_IDS,
} = runtime.exports;
const prefix = "/game/assets/";
const urls = new Set([
  ...Object.values(outdoorSources).map(path => prefix + path),
  ...Object.values(activityAssets).map(path => prefix + path),
  ...Object.values(yanzenInteriorAssets).map(path => prefix + path),
  ...RESIDENT_HOMES.map(home => prefix + "residences/" + home.location + ".png"),
  ...RIVER_FISH_IDS.map(id => prefix + "fish/" + id + ".png"),
]);

const readJson = path => JSON.parse(readFileSync(path, "utf8"));
for (const character of readJson("public/game/data/npc/index.json").characters) {
  urls.add(character.portraitUrl);
}
for (const character of readJson("game-assets/catalog/npc-portrait-register.json").characters) {
  if (character.active) urls.add(character.expressionSheet);
}

function addLiteralUrls(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) addLiteralUrls(path);
    else if (/\.(?:tsx?|css)$/.test(path)) {
      for (const [url] of readFileSync(path, "utf8").matchAll(/\/game\/assets\/[\w./-]+\.(?:png|webp|jpe?g|svg|mp4|mp3|wav|ogg)\b/g)) {
        urls.add(url);
      }
    }
  }
}
addLiteralUrls("src/lib/game");
addLiteralUrls("src/app/game");

for (const url of urls) {
  assert.ok(url.startsWith(prefix), url);
  const file = "public" + url;
  assert.ok(existsSync(file) && statSync(file).size > 0, "Missing or empty runtime asset: " + url);
}
for (const asset of readJson("game-assets/catalog/runtime-raster-exports.json").assets) {
  assert.ok(urls.has(asset.runtimeFile.slice("public".length)), asset.runtimeFile);
  assert.ok(!urls.has(asset.sourceFile.slice("public".length)), asset.sourceFile);
  const source = readFileSync(asset.sourceFile);
  const exported = readFileSync(asset.runtimeFile);
  assert.equal(createHash("sha256").update(source).digest("hex"), asset.sourceSHA256);
  assert.equal(createHash("sha256").update(exported).digest("hex"), asset.runtimeSHA256);
  assert.deepEqual([exported.readUInt32BE(16), exported.readUInt32BE(20)], asset.canvasSize);
  assert.equal(exported.readUInt8(25), 6, "PNG export must carry an alpha channel");
  assert.ok(exported.length < source.length / 2, asset.runtimeFile);
}
console.log(`PASS: ${urls.size} registered game assets and literal URLs resolve to files`);
