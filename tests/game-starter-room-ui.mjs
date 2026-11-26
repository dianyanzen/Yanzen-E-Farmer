// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browserPath } from './browser-path.mjs';
import { apiFixture, loadCheckpoint } from './game-ui-api-fixture.mjs';

const engine=process.env.FARM_TEST_ENGINE==='phaser'?'phaser':'canvas';
const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || `../starter-room-ui-${engine}`);
await mkdir(output, { recursive: true });
await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Game from './src/app/game/game-client';createRoot(document.getElementById('root')).render(<Game engine="${engine}"/>);`, resolveDir: process.cwd(), loader: 'tsx' },
  external: ["/game/*"],
  bundle: true, outfile: path.join(output, 'app.js'), jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'game-test-only-adapters', setup(b) {
    b.onResolve({ filter: /^next\/(link|image|navigation)$/ }, a => ({ path: a.path, namespace: 'test-adapter' }));
    b.onLoad({ filter: /.*/, namespace: 'test-adapter' }, a => ({
      contents: a.path === 'next/navigation' ?
        `export function useRouter(){return router} const router={replace:(url)=>{window.__redirect=url}};` :
        `import React from 'react';export default function Adapter({sizes,priority,...p}){return React.createElement('${a.path === 'next/link' ? 'a' : 'img'}',p)}`,
      resolveDir: process.cwd(),
    }));
  } }],
});
await writeFile(path.join(output, 'index.html'), '<!doctype html><html lang="id"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{margin:0}button{cursor:pointer;font:inherit}*{box-sizing:border-box}</style><div id="root"></div>'+apiFixture+'<script src="/app.js"></script></html>');
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const target = url.pathname.startsWith('/game/assets/') ? path.join(process.cwd(), 'public', url.pathname) :
    path.join(output, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const data = await readFile(target);
    res.setHeader('Content-Type', target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'text/javascript' : target.endsWith('.png') ? 'image/png' : target.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
    res.end(data);
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: await browserPath(), headless: true });
const errors = [];
async function saved(page, predicate) {
  await page.waitForFunction(`() => { try { return (${predicate.toString()})(); } catch { return false; } }`, null, { timeout: 10000 });
}
async function go(page, key, count = 1) {
  for (let n = 0; n < count; n++) { await page.keyboard.press(key); await page.waitForTimeout(170); }
}
async function start(page) {
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  const help=page.getByRole('button', { name: 'Mengerti' });
  if(await help.isVisible())await help.click();
  await page.waitForFunction(() => document.querySelector('.yzg-headsup').textContent.includes('Siap') || document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
}

// The exterior fixture starts at tile (8,6), the center of the path between
// both buildings. Project the actual door pixels into each renderer's viewport.
async function tapExteriorDoor(page, x, y, touch, center = { x: 170, y: 130 }) {
  const canvas = page.locator(engine === 'phaser' ? '.yzg-phaser-host canvas' : '.yzg-viewport > canvas');
  const point = await canvas.evaluate((element, { engine, x, y, center }) => {
    const { width, height } = element.getBoundingClientRect();
    const world = { width: 640, height: 320 };
    if (engine === 'phaser') {
      const zoom = Math.max(3, element.width / world.width, element.height / world.height);
      const view = { width: element.width / zoom, height: element.height / zoom };
      const left = Math.max(0, center.x - view.width / 2);
      const top = Math.max(0, center.y - view.height / 2);
      return { x: (x - left) * width / view.width, y: (y - top) * height / view.height };
    }
    const scale = Math.min(width / element.width, height / element.height);
    const left = Math.max(0, center.x - element.width / 2);
    const top = Math.max(0, center.y - element.height / 2);
    return {
      x: (width - element.width * scale) / 2 + (x - left) * scale,
      y: (height - element.height * scale) / 2 + (y - top) * scale,
    };
  }, { engine, x, y, center });
  if (touch) await canvas.tap({ position: point });
  else await canvas.click({ position: point });
}

const {default:ts2}=await import('typescript');
const {default:vm2}=await import('node:vm');
const {createRequire}=await import('node:module');
const modelPath=path.resolve('src/lib/game/model.ts');
const module2={exports:{}};
vm2.runInNewContext(ts2.transpileModule(await readFile(modelPath,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts2.ModuleKind.CommonJS,target:ts2.ScriptTarget.ES2022}}).outputText,{exports:module2.exports,module:module2,require:createRequire(modelPath)});
const model=module2.exports;
const seed=JSON.parse(JSON.stringify(model.newGame()));
const roomAssetPaths=(await readFile('src/lib/game/yanzen-interior-art.ts','utf8'))
  .match(/locations\/yanzen\/[^"]+\.(?:png|svg)/g);
try {
 for (const width of [1280,393]) for(const room of ['home','shed']) {
  const page=await browser.newPage({viewport:{width,height:width===393?852:900},reducedMotion:'reduce'});
  const state={...seed,location:room,player:room==='shed'?{...model.SHED.spawn,dir:'up'}:{x:9,y:8,dir:'up'}};
  await page.addInitScript(data=>{if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));},state);
  await start(page);
  if(engine==='phaser')await page.waitForFunction(()=>document.querySelector('.yzg-phaser-host')?.style.opacity==='1',null,{timeout:15000});
  const ok=await page.evaluate(async files=>Promise.all(files.map(file=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img.naturalWidth>0);img.onerror=()=>resolve(false);img.src='/game/assets/'+file;}))),roomAssetPaths);
  assert.ok(ok.every(Boolean),'room images decode in browser');
  await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(output,room+'-'+width+'.png'),fullPage:true});
  if(room==='home'){
   await go(page,'ArrowRight');
   await go(page,'ArrowUp',2);
   await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return s.player.x===10&&s.player.y===6;});
   await go(page,'ArrowDown',2);
   await go(page,'ArrowLeft');
   await go(page,'ArrowUp');
   await go(page,'e');
   await page.getByRole('button',{name:'Tidur sampai pagi',exact:true}).click();
   await saved(page,()=>JSON.parse(localStorage.getItem('yz-test-save')).data.day===2);
  }else{
   await go(page,'ArrowUp',4);
   await go(page,'ArrowLeft',3);
   await go(page,'ArrowUp');
   await saved(page,()=>{const p=JSON.parse(localStorage.getItem('yz-test-save')).data.player;return p.x===9&&p.y===8&&p.dir==='up';});
   await go(page,'e');
   const dialog=page.getByRole('dialog',{name:'Gudang peralatan'});await dialog.waitFor();
   await dialog.locator('.yzg-storage-item').filter({hasText:'Gembor Penyiram'}).getByRole('button',{name:'Simpan'}).click();
   await saved(page,()=>!JSON.parse(localStorage.getItem('yz-test-save')).data.carriedTools.includes('water'));
   await dialog.locator('.yzg-storage-item').filter({hasText:'Gembor Penyiram'}).getByRole('button',{name:'Ambil'}).click();
   await saved(page,()=>JSON.parse(localStorage.getItem('yz-test-save')).data.carriedTools.includes('water'));
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await page.close();
 }
 for(const width of [1280,393]){
  const page=await browser.newPage({viewport:{width,height:width===393?852:900},reducedMotion:'reduce'});
  const state={...seed,location:'field',player:{x:3,y:8,dir:'left'},plots:[{x:4,y:8,stage:3,watered:false},{x:5,y:8,stage:1,watered:false,harvests:1}]};
  await page.addInitScript(data=>{if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));},state);
  await start(page);
  if(engine==='phaser')await page.waitForFunction(()=>document.querySelector('.yzg-phaser-host')?.style.opacity==='1',null,{timeout:15000});
  await page.getByText('Buka keran',{exact:false}).first().waitFor();
  await go(page,'e');
  await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return s.plots.every(plot=>plot.watered) && s.irrigationOpen===true});
  await page.getByText('Tutup keran',{exact:false}).first().waitFor();
  await page.screenshot({path:path.join(output,'cucumber-ripe-'+width+'.png')});
  await page.reload();await start(page);
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('yz-test-save'))).data.irrigationOpen,true);
  await go(page,'e');
  await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return !s.irrigationOpen && s.plots.every(plot=>plot.watered)});
  // Approach from the west. A brief directional tap changes facing and
  // its movement is allowed, so stand one row south and look north from there.
  await go(page,'ArrowDown',2);
  await go(page,'ArrowRight');
  await go(page,'ArrowUp');
  await go(page,'e');
  await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return s.harvested===1 && s.plots[0].stage===1 && s.plots[0].watered});
  await page.close();
 }
 for (const width of [1280, 393]) {
  for (const [room, building] of [['home', model.HOME], ['shed', model.SHED]]) {
   const touch = width === 393;
   const page = await browser.newPage({viewport:{width,height:touch?852:900},hasTouch:touch,reducedMotion:'reduce'});
   const state = {...seed, location:'field', player:{x:8,y:6,dir:'left'}, phoneRead:true};
   await page.addInitScript(data => {
    if (!localStorage.getItem('yz-test-save')) localStorage.setItem('yz-test-save', JSON.stringify({data}));
   }, state);
   await start(page);
   if (engine === 'phaser') await page.waitForFunction(() => document.querySelector('.yzg-phaser-host')?.style.opacity === '1');
   if (room === 'home') await page.screenshot({path:path.join(output,'exterior-'+width+'.png'),fullPage:true});
   const exitX = building.door.x;
   await tapExteriorDoor(page, (exitX+.5)*model.WORLD.tile, 83, touch);
   await page.waitForFunction(expectedRoom => {
    const { location, player } = JSON.parse(localStorage.getItem('yz-test-save')).data;
    return location === expectedRoom && player.x === 12 && player.y === 12;
   }, room);
   await go(page, 'ArrowDown');
   await saved(page, () => {
    const { player } = JSON.parse(localStorage.getItem('yz-test-save')).data;
    return player.x === 12 && player.y === 13 && player.dir === 'down';
   });
   await go(page, 'e');
   await page.waitForFunction(expectedX => {
    const { location, player } = JSON.parse(localStorage.getItem('yz-test-save')).data;
    return location === 'field' && player.x === expectedX && player.y === 5 && player.dir === 'down';
   }, exitX);
   await page.close();
  }
 }
 for (const width of [1280,393]) {
  const touch=width===393;
  const page=await browser.newPage({viewport:{width,height:touch?852:900},hasTouch:touch,reducedMotion:'reduce'});
  const {x,y}=model.INGGIT_WARUNG;
  const state={...seed,minutes:14*60,location:'field',player:{x,y:y+1,dir:'up'},phoneRead:true};
  await page.addInitScript(data=>{if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));},state);
  await start(page);
  if(engine==='phaser')await page.waitForFunction(()=>document.querySelector('.yzg-phaser-host')?.style.opacity==='1');
  await page.getByText('Bicara dengan Inggit',{exact:true}).first().waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({path:path.join(output,'warkop-'+width+'.png')});
  if(touch) await tapExteriorDoor(page,(x+.5)*model.WORLD.tile,111,true,{x:390,y:130});
  else await go(page,'e');
  const warung=page.getByRole('dialog',{name:/Inggit/});
  await warung.waitFor();
  await warung.getByText(/Mampir dulu/).first().waitFor();
  for(let line=0;line<5;line++){
   const next=warung.getByRole('button',{name:'Lanjut ›',exact:true});
   if(!await next.isVisible())break;
   await next.click();
  }
  await warung.getByText('Menu Warung Inggit',{exact:true}).click();
  await warung.getByRole('button',{name:/Kopi hitam/}).click();
  await saved(page,()=>{
   const state=JSON.parse(localStorage.getItem('yz-test-save')).data;
   return state.location==='field'&&state.coins===268&&state.player.dir==='down';
  });
  await page.getByText('Yanzen menikmati kopi hitam.',{exact:true}).first().waitFor();
  await page.waitForTimeout(1500);
  await go(page,'ArrowUp');
  await go(page,'e');
  await warung.waitFor();
  for(let line=0;line<5;line++){
   const next=warung.getByRole('button',{name:'Lanjut ›',exact:true});
   if(!await next.isVisible())break;
   await next.click();
  }
  await warung.getByText('Menu Warung Inggit',{exact:true}).click();
  await warung.getByRole('button',{name:/Bala-bala/}).click();
  await saved(page,()=>JSON.parse(localStorage.getItem('yz-test-save')).data.coins===253);
  await page.close();
 }
 const poultry=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,reducedMotion:'reduce'});
 const { IYAN_MARKET, POULTRY, INGGIT_WARUNG }=model;
 const atShop={...seed,location:'pasar',minutes:10*60,player:{x:IYAN_MARKET.x,y:IYAN_MARKET.y+1,dir:'up'}};
 await poultry.addInitScript(data=>{
  if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));
 },atShop);
 await start(poultry);
 await poultry.waitForFunction(()=>!document.querySelector('.yzg-loading'));
 await poultry.getByRole('button',{name:'Aksi',exact:true}).click();
 const shop=poultry.getByRole('dialog',{name:/Iyan Rustiana/});
 await shop.getByRole('img',{name:'Iyan Rustiana',exact:true}).waitFor();
 await shop.getByRole('button',{name:/Beli 5 porsi pakan/}).click();
 await poultry.waitForFunction(()=>JSON.parse(localStorage.getItem('yz-test-save'))?.data?.poultry?.feed===5);
 await loadCheckpoint(poultry,{location:'field',player:{x:POULTRY.feeder.x,y:POULTRY.feeder.y-1,dir:'down'}});
 await poultry.getByRole('button',{name:'Aksi',exact:true}).click();
 await poultry.waitForFunction(()=>JSON.parse(localStorage.getItem('yz-test-save'))?.data?.poultry?.feed===4);
 await loadCheckpoint(poultry,{location:'home',player:{x:9,y:8,dir:'up'}});
 await poultry.getByRole('button',{name:'Aksi',exact:true}).click();
 await poultry.getByRole('button',{name:'Tidur sampai pagi',exact:true}).click();
 await poultry.waitForFunction(()=>JSON.parse(localStorage.getItem('yz-test-save'))?.data?.poultry?.nest===1);
 await loadCheckpoint(poultry,{location:'field',player:{x:POULTRY.nest.x,y:POULTRY.nest.y-1,dir:'down'}});
 await poultry.getByRole('button',{name:'Aksi',exact:true}).click();
 await poultry.waitForFunction(()=>JSON.parse(localStorage.getItem('yz-test-save'))?.data?.poultry?.eggs===1);
 await loadCheckpoint(poultry,{location:'field',player:{x:INGGIT_WARUNG.x,y:INGGIT_WARUNG.y+1,dir:'up'}});
 await poultry.getByRole('button',{name:'Aksi',exact:true}).click();
 const inggitEggs=poultry.getByRole('dialog',{name:/Inggit/});
 await inggitEggs.waitFor();
 const nextEggLine=inggitEggs.getByRole('button',{name:'Lanjut ›',exact:true});
 const sellEggs=inggitEggs.getByRole('button',{name:/Jual 1 telur/});
 for(let i=0;i<8;i++){
  await nextEggLine.or(sellEggs).first().waitFor();
  if(await sellEggs.isVisible())break;
  await nextEggLine.click();
 }
 await sellEggs.click();
 await poultry.waitForFunction(()=>{
  const {poultry,coins}=JSON.parse(localStorage.getItem('yz-test-save')).data;
  return poultry.eggs===0&&coins===268;
 });
 await poultry.close();
 const conflict=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 await conflict.addInitScript(data=>{
  if(!localStorage.getItem('yz-test-save')) {
   localStorage.setItem('yz-test-save',JSON.stringify({data,updatedAt:'2026-11-25T00:00:00.000Z'}));
  }
 },seed);
 await start(conflict);
 await conflict.waitForFunction(()=>window.__saveAttempts>0);
 // Emulate a second writer advancing both the data and revision after this tab loaded.
 const attempts=await conflict.evaluate(()=>{
  const row=JSON.parse(localStorage.getItem('yz-test-save'));
  row.data.coins=555;
  row.updatedAt=new Date(Date.parse(row.updatedAt)+1000).toISOString();
  localStorage.setItem('yz-test-save',JSON.stringify(row));
  return window.__saveAttempts;
 });
 await conflict.getByRole('button',{name:'☁ Simpan'}).click();
 const recovery=conflict.getByRole('button',{name:'Muat progres terbaru'});
 await recovery.waitFor();
 assert.equal(await conflict.getByRole('button',{name:'Coba simpan kembali'}).count(),0);
 assert.equal(await conflict.evaluate(()=>window.__saveAttempts),attempts+1);
 await recovery.click();
 await conflict.waitForFunction(()=>!document.querySelector(".yzg-loading"));
 await conflict.locator('.yzg-headsup').getByText(/55[.\s]?500/).waitFor();
 assert.equal(await recovery.count(),0);
 await conflict.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop/mobile room assets decode, bed sleep, shed tool transfer, exterior doors, save and layout');
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
