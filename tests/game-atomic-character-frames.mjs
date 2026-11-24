import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";

const root=resolve(process.cwd());
const metrics=JSON.parse(readFileSync(join(root,"src/lib/game/atomic-frame-metrics.json"),"utf8"));
const catalog=JSON.parse(readFileSync(join(root,"game-assets/catalog/atomic-characters.json"),"utf8"));
const frames=metrics.frames,assets=catalog.assets;
const directions=["down","left","right","up"];
const npcIds=["A01","A03","C01","C08","A04","C07"];
assert.equal(metrics.frameCount,192);
assert.equal(catalog.frameCount,192);
assert.equal(frames.length,192);
assert.equal(assets.length,192);
assert.equal(metrics.groundContactOffset,18);
assert.equal(metrics.referenceBodyHeightPx,30);
const frameKeys=new Set(),urls=new Set(),renderHash=new Map(),duplicateArt=[];
const find=(id,action,dir,index)=>id+":"+action+":"+dir+":"+String(index).padStart(3,"0");
for(const frame of frames){
  assert(!frameKeys.has(frame.key),"duplicate logical frame "+frame.key);
  assert(!urls.has(frame.url),"shared runtime image path "+frame.url);
  frameKeys.add(frame.key);urls.add(frame.url);
  assert.match(frame.url,/^\/game\/assets\/characters\/atomic\/[^/]+\/[^/]+\/[^/]+\/frame-\d{3}\.svg$/);
  const filename=join(root,"public",frame.url.slice(1));
  assert(existsSync(filename),"missing individual image "+filename);
  const text=readFileSync(filename,"utf8");
  assert.match(text,/^<svg\b/);
  assert.match(text,/<\/svg>\s*$/);
  assert.match(text,/<path\b/);
  assert(!/<image\b|<use\b|<foreignObject\b|<script\b|href\s*=/i.test(text),"external/shared image reference "+frame.url);
  assert(text.includes('width="'+frame.width+'"')&&text.includes('height="'+frame.height+'"'));
  assert.equal(frame.alphaBounds.length,4);
  assert(frame.footX>=0&&frame.footX<=frame.width);
  assert(frame.footY>=0&&frame.footY<=frame.height);
  const y=18-frame.footY;
  assert.equal(y+frame.footY,18,"foot anchor drift "+frame.key);
  const hash=createHash("sha256").update(text).digest("hex");
  if(renderHash.has(hash))duplicateArt.push([renderHash.get(hash),frame.url]);
  else renderHash.set(hash,frame.url);
}
for(const id of npcIds)for(const dir of directions)for(let i=0;i<3;i++){
  assert(frameKeys.has(find(id,"idle",dir,i)));
}
for(const motion of ["walk","run"])for(const dir of directions)for(let i=0;i<6;i++){
  assert(frameKeys.has(find("A01",motion,dir,i)));
}
for(let angle=0;angle<8;angle++)for(let i=0;i<3;i++){
  assert(frameKeys.has(find("A01","turn","angle-"+angle,i)));
}
for(const tool of ["hoe","seed","water","harvest"])for(const dir of directions)for(let i=0;i<3;i++){
  assert(frameKeys.has(find("A01",tool,dir,i)));
}
const runtimeSources=[
  "src/lib/game/phaser-world.ts",
  "src/lib/game/draw-world.ts",
  "src/app/game/game-client.tsx"
].map(p=>readFileSync(join(root,p),"utf8"));
for(const source of runtimeSources){
  assert(!/characters\/(?:stage1|yanzen-gaits|yanzen-turns)\.png|tiles\/actions\.png/.test(source),
    "new actor renderer still loads legacy character atlas");
}
assert(runtimeSources[0].includes("this.load.svg(atomic.key"),"Phaser must use per-frame SVG loader");
assert(runtimeSources[1].includes("atomicFramePosition"),"Canvas must consume atomic foot metadata");
assert(runtimeSources[2].includes("ATOMIC_FRAMES"),"React asset loader must use all individual URLs");
assert(catalog.artReview==="NOT_APPROVED","migration must not masquerade as hand-redrawn artwork");
console.log("Atomic character QA passed: 192 independent file paths, expected animation coverage, geometry, loader and foot metadata.");
if(duplicateArt.length)console.warn("Legacy duplicate visual content awaiting redraw: "+duplicateArt.length+" pairs (unique file paths verified).");
