// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { browserPath } from './browser-path.mjs';

const engine=process.env.FARM_TEST_ENGINE==='phaser'?'phaser':'canvas';
const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || `../starter-room-ui-${engine}`);
await mkdir(output, { recursive: true });
const fixture = `
const id='10000000-0000-0000-0000-000000000001';
export function createClient(){return {
  auth:{getUser:async()=>({data:{user:{id}},error:null})},
  from:(table)=>{
    if(table!=='yz_game_saves') throw new Error('Unexpected table: '+table);
    return {
      select:()=>({eq:()=>({maybeSingle:async()=>({data:JSON.parse(localStorage.getItem('yz-test-save')||'null'),error:null})})}),
      upsert:async(row)=>{
        window.__saveAttempts=(window.__saveAttempts||0)+1;
        if(window.__failSave) return {error:{message:'Simulated offline'}};
        localStorage.setItem('yz-test-save',JSON.stringify(row));return {error:null};
      }
    };
  }
};}`;
await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Game from './src/app/game/game-client';createRoot(document.getElementById('root')).render(<Game engine="${engine}"/>);`, resolveDir: process.cwd(), loader: 'tsx' },
  external: ["/game/*"],
  bundle: true, outfile: path.join(output, 'app.js'), jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'game-test-only-adapters', setup(b) {
    b.onResolve({ filter: /^next\/(link|image|navigation)$/ }, a => ({ path: a.path, namespace: 'test-adapter' }));
    b.onResolve({ filter: /^@\/lib\/supabase\/browser$/ }, () => ({ path: 'cloud', namespace: 'test-adapter' }));
    b.onLoad({ filter: /.*/, namespace: 'test-adapter' }, a => ({
      contents: a.path === 'cloud' ? fixture : a.path === 'next/navigation' ?
        `export function useRouter(){return router} const router={replace:(url)=>{window.__redirect=url}};` :
        `import React from 'react';export default function Adapter({sizes,priority,...p}){return React.createElement('${a.path === 'next/link' ? 'a' : 'img'}',p)}`,
      resolveDir: process.cwd(),
    }));
  } }],
});
const apiFixture=`<script>
const nativeFetch=window.fetch.bind(window);
window.fetch=async (url,options={})=>{
 if(url==='/api/auth/session')return Response.json({user:{id:'10000000-0000-0000-0000-000000000001'}});
 if(url==='/api/game/save'){
   if(options.method==='PUT'){
     if(window.__failSave)return Response.json({error:'offline'},{status:503});
     const body=JSON.parse(options.body);localStorage.setItem('yz-test-save',JSON.stringify({data:body.data}));
     return Response.json({updatedAt:'2026-11-25T00:00:00.000Z'});
   }
   return Response.json(JSON.parse(localStorage.getItem('yz-test-save')||'{"data":null}'));
 }
 return nativeFetch(url,options);
};</script>`;
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

const {default:ts2}=await import('typescript');
const {default:vm2}=await import('node:vm');
const {createRequire}=await import('node:module');
const modelPath=path.resolve('src/lib/game/model.ts');
const module2={exports:{}};
vm2.runInNewContext(ts2.transpileModule(await readFile(modelPath,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts2.ModuleKind.CommonJS,target:ts2.ScriptTarget.ES2022}}).outputText,{exports:module2.exports,module:module2,require:createRequire(modelPath)});
const seed=JSON.parse(JSON.stringify(module2.exports.newGame()));
try {
 for (const width of [1280,393]) for(const room of ['home','shed']) {
  const page=await browser.newPage({viewport:{width,height:width===393?852:900},reducedMotion:'reduce'});
  const state={...seed,location:room,player:{x:9,y:8,dir:'up'}};
  await page.addInitScript(data=>{if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));},state);
  await start(page);
  if(engine==='phaser')await page.waitForFunction(()=>document.querySelector('.yzg-phaser-host')?.style.opacity==='1',null,{timeout:15000});
  const files=room==='home'?['v5/floor.svg','v5/back-wall.svg','v5/left-wall.svg','v5/right-wall.svg','v5/front-wall.svg','v5/woven-rug.svg','v5/door-mat.svg','v5/storage-shelf.svg','v5/bench.svg','v2/home-bed.png','v2/home-cabinet.png','v2/home-table.png','v2/home-window.png','v3/home-lamp.png','v3/home-plant.png']:['v2/shed-floor.svg','v2/shed-wall.svg','v2/shed-rack.png','v2/shed-workbench.png','v3/shed-wall-shelf.png','v3/shed-basket.png','v6/hoe.svg','v6/sickle.svg','v6/shovel.svg','v6/toolbox.svg','v6/watering-can.svg','v6/seed-sack.svg','v6/harvest-crate.svg','v6/fertilizer-sack.svg','v6/bucket.svg','v6/rope-coil.svg','v6/shelf-jar.svg','v6/wall-lantern.svg'];
  const ok=await page.evaluate(async files=>Promise.all(files.map(file=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img.naturalWidth>0);img.onerror=()=>resolve(false);img.src='/game/assets/locations/yanzen/'+file;}))),files);
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
  const state={...seed,location:'field',player:{x:3,y:8,dir:'left'},plots:[{x:4,y:8,stage:0,watered:false}]};
  await page.addInitScript(data=>{if(!localStorage.getItem('yz-test-save'))localStorage.setItem('yz-test-save',JSON.stringify({data}));},state);
  await start(page);
  if(engine==='phaser')await page.waitForFunction(()=>document.querySelector('.yzg-phaser-host')?.style.opacity==='1',null,{timeout:15000});
  await page.getByText('Buka keran',{exact:false}).first().waitFor();
  await go(page,'e');
  await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return s.plots[0].watered===true && s.irrigationOpen===true});
  await page.getByText('Tutup keran',{exact:false}).first().waitFor();
  await page.reload();await start(page);
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('yz-test-save'))).data.irrigationOpen,true);
  await go(page,'e');
  await saved(page,()=>{const s=JSON.parse(localStorage.getItem('yz-test-save')).data;return !s.irrigationOpen && s.plots[0].watered});
  await page.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop/mobile room assets decode, bed sleep, shed tool transfer, save and layout');
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
