// Real SluiceCutscene component + production CSS in a responsive Phaser-style shell.
// No mocks for layout: only the host game world and controls are compact fixtures.
import assert from "node:assert/strict";
import {build} from "esbuild";
import {chromium} from "@playwright/test";
import {createServer} from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {browserPath} from "./browser-path.mjs";

const output=path.resolve(process.env.FARM_CUTSCENE_UI_OUTPUT||"/tmp/yz-cutscene-viewport-ui");
await mkdir(output,{recursive:true});
await build({
  stdin:{
    contents:`import React from 'react';import {createRoot} from 'react-dom/client';
    import SluiceCutscene from './src/app/game/sluice-cutscene';
    createRoot(document.getElementById('cutscene-root')).render(<SluiceCutscene onDone={()=>{window.__cutsceneFinished=(window.__cutsceneFinished||0)+1}}/>);`,
    resolveDir:process.cwd(),loader:"tsx"
  },
  bundle:true,outfile:path.join(output,"app.js"),jsx:"automatic",
  define:{"process.env.NODE_ENV":'"development"'}
});
const html=`<!doctype html><html lang="id"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/app.css">
<style>*{box-sizing:border-box}body{margin:0}.yzg-controls{min-height:90px}
.yzg-touch{min-height:125px}.yzg-viewport{min-height:0}
</style></head><body>
<main class="yzg-page yzg-page--phaser"><section class="yzg-shell">
<div class="yzg-headsup"><span>Hari 9 · 12:49</span><span>2351 G</span></div>
<div class="yzg-viewport" data-game-focus><canvas width="300" height="200"></canvas><div id="cutscene-root"></div></div>
<div class="yzg-controls"><button>YZ Phone</button><button>Alat di tangan</button></div>
<div class="yzg-touch"><button>Bergerak</button><button>Aksi</button></div>
</section></main><script src="/app.js"></script></body></html>`;
await writeFile(path.join(output,"index.html"),html);
await writeFile(path.join(output,"app.css"),await readFile("src/app/game/game.css"));
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 const target=url.pathname.startsWith("/game/assets/")?
   path.join(process.cwd(),"public",url.pathname):
   path.join(output,url.pathname==="/"? "index.html":url.pathname);
 try{
   const data=await readFile(target);
   res.setHeader("Content-Type",target.endsWith(".js")?"text/javascript":
     target.endsWith(".css")?"text/css":target.endsWith(".mp4")?"video/mp4":
     target.endsWith(".jpg")?"image/jpeg":"text/html");
   res.end(data);
 }catch{res.statusCode=404;res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({executablePath:await browserPath(),headless:true});
const problems=[];
try{
 for(const [width,height] of [[393,852],[390,844],[844,390],[1280,800],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:"reduce"});
  page.on("pageerror",err=>problems.push(err.message));
  await page.goto("http://127.0.0.1:"+server.address().port);
  await page.locator(".yzg-cutscene-stage").waitFor();
  await page.waitForFunction(()=>{
   const stage=document.querySelector(".yzg-cutscene-stage");
   return stage&&stage.getBoundingClientRect().width>1&&getComputedStyle(document.querySelector(".yzg-cutscene")).position==="absolute";
  });
  const data=await page.evaluate(()=>{
   const r=s=>{const x=document.querySelector(s).getBoundingClientRect();return{x:x.x,y:x.y,w:x.width,h:x.height,right:x.right,bottom:x.bottom};};
   const video=document.querySelector(".yzg-cutscene-video");
   return {world:r(".yzg-viewport"),overlay:r(".yzg-cutscene"),stage:r(".yzg-cutscene-stage"),
     video:r(".yzg-cutscene-video"),caption:r(".yzg-cutscene-readalong"),
     actions:r(".yzg-cutscene-actions"),controls:r(".yzg-controls"),
     touch:r(".yzg-touch"),screenW:document.documentElement.scrollWidth,
     videoObjectFit:getComputedStyle(video).objectFit,
     videoAspect:getComputedStyle(video).aspectRatio
   };
  });
  const tol=2;
  assert.ok(data.overlay.y>=data.world.y-tol&&data.overlay.bottom<=data.world.bottom+tol,
   `Cutscene overlay escaped world at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.stage.w>=25&&data.stage.h>=12,
   `Video too small to display at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(Math.abs(data.video.w/data.video.h-910/512)<0.05,
   `Original video aspect changed at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.stage.bottom<=data.caption.y+tol,
   `Video collided with subtitle at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.caption.bottom<=data.actions.y+tol,
   `Subtitle collided with cutscene buttons at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.actions.bottom<=data.world.bottom+tol,
   `Cutscene buttons escaped the viewport at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.actions.bottom<=data.controls.y+tol&&data.world.bottom<=data.controls.y+tol,
   `Cutscene collided with toolbelt at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.ok(data.controls.bottom<=data.touch.y+tol,
   `The game control rows overlap at ${width}x${height}: ${JSON.stringify(data)}`);
  assert.equal(data.videoObjectFit,"contain");
  assert.ok(data.screenW<=width+tol,`Horizontal browser overflow at ${width}x${height}`);
  if(width===393||width===1280)
   await page.screenshot({path:path.join(output,`cinematic-${width}x${height}.png`),fullPage:true});
  await page.getByRole("button",{name:"Lewati adegan"}).click();
  assert.equal(await page.evaluate(()=>window.__cutsceneFinished),1,"Skip should complete exactly once");
  console.log("PASS: "+width+"x"+height+"; video "+Math.round(data.video.w)+"x"+Math.round(data.video.h)+
    ", subtitle and buttons inside viewport, game controls untouched");
  await page.close();
 }
 assert.deepEqual(problems,[],"Uncaught browser errors");
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
