// Real FishingScene in the existing world viewport: small HUD, not a full-screen modal.
import assert from "node:assert/strict";
import {build} from "esbuild";
import {chromium} from "@playwright/test";
import {createServer} from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {browserPath} from "./browser-path.mjs";
const output=path.resolve(process.env.FARM_FISHING_UI_OUTPUT||"/tmp/yz-fishing-ui");
await mkdir(output,{recursive:true});
await build({
 stdin:{contents:`import React,{useState,useEffect} from "react";
 import {createRoot} from "react-dom/client";
 import {FishingScene} from "./src/app/game/fishing-scene";
 function FishingTest(){
  const [phase,setPhase]=useState("casting");
  useEffect(()=>{window.__phase=setPhase},[]);
  return <FishingScene phase={phase} onCancel={()=>{window.__cancelled=(window.__cancelled||0)+1;}}/>;
 }
 createRoot(document.getElementById("root")).render(<FishingTest/>);`,
 resolveDir:process.cwd(),loader:"tsx"},bundle:true,outfile:path.join(output,"app.js"),
 jsx:"automatic",define:{"process.env.NODE_ENV":'"development"'}
});
await writeFile(path.join(output,"index.html"),`<!doctype html><html lang="id"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/app.css"><style>*{box-sizing:border-box}body{margin:0}</style>
</head><body><main class="yzg-page yzg-page--phaser">
<section class="yzg-shell"><div class="yzg-headsup">Hari 9 · Siang · Cerah</div>
<div class="yzg-viewport" data-game-focus><div id="root"></div></div>
<div class="yzg-controls"><button>Alat di tangan</button><button>YZ Phone</button></div>
<div class="yzg-touch"><button>A</button><button>Jalan</button></div>
</section></main><script src="/app.js"></script></body></html>`);
await writeFile(path.join(output,"app.css"),await readFile("src/app/game/game.css"));
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 const target=url.pathname.startsWith("/game/assets/")?path.join(process.cwd(),"public",url.pathname):
   path.join(output,url.pathname==="/"?"index.html":url.pathname);
 try {const data=await readFile(target);res.setHeader("Content-Type",
   target.endsWith(".css")?"text/css":target.endsWith(".js")?"text/javascript":
   target.endsWith(".png")?"image/png":"text/html");res.end(data);}
 catch {res.statusCode=404;res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({executablePath:await browserPath(),headless:true});
const errors=[];
try{
 for(const [width,height] of [[393,852],[844,390],[1280,800]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:"no-preference"});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port);
  await page.locator(".yzg-fishing-scene").waitFor();
  for(const phase of ["casting","waiting","bite","reeling"]){
   await page.evaluate(v=>window.__phase(v),phase);
   await page.locator(".yzg-fishing-"+phase).waitFor();
   const data=await page.evaluate(()=>{
    const box=s=>{const n=document.querySelector(s),r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    return {world:box(".yzg-viewport"),overlay:box(".yzg-fishing-scene"),
      message:box(".yzg-fishing-message"),cancel:box(".yzg-fishing-cancel"),
      controls:box(".yzg-controls"),detached:!!document.querySelector(".yzg-fishing-effect, .yzg-fishing-float"),
      text:document.querySelector(".yzg-fishing-message").textContent};
   });
   const tol=2;
   assert.ok(data.overlay.y>=data.world.y-tol&&data.overlay.bottom<=data.world.bottom+tol);
   assert.ok(data.message.bottom<=data.world.bottom+tol&&data.message.y>=data.world.y-tol,
     "Instructions must remain inside world, "+width+"x"+height);
   assert.ok(data.cancel.right<=data.world.right+tol&&data.cancel.bottom<=data.world.bottom+tol);
   assert.ok(data.world.bottom<=data.controls.y+tol,"Fishing must not cover toolbelt");
   assert.equal(data.detached,false,"Fishing gear may not be a fixed centered DOM effect");
   assert.ok(data.text.length>5,"Phase guidance remains readable");
  }
  if(width===393)await page.screenshot({path:path.join(output,"fishing-waiting-393x852.png")});
  await page.getByRole("button",{name:"Angkat joran"}).click();
  assert.equal(await page.evaluate(()=>window.__cancelled),1);
  console.log("PASS compact world-scoped fishing HUD: "+width+"x"+height);
  await page.close();
 }
 assert.deepEqual(errors,[],"No unhandled browser failures");
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
