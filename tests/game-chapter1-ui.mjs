// Real game component + browser controls. Only Next routing and cloud transport
// are fixtures; this does not bypass auth or add any route to the shipped app.
import { build, buildSync } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { browserPath } from './browser-path.mjs';
import { apiFixture, loadCheckpoint } from './game-ui-api-fixture.mjs';

const output = path.resolve(process.env.FARM_GAME_UI_OUTPUT || '../game-chapter1-ui');
await mkdir(output, { recursive: true });
await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import Game from './src/app/game/game-client';createRoot(document.getElementById('root')).render(<Game/>);`, resolveDir: process.cwd(), loader: 'tsx' },
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
  await page.waitForFunction(predicate, null, { timeout: 10000 });
}
async function go(page, key, count = 1) {
  for (let n = 0; n < count; n++) { await page.keyboard.press(key); await page.waitForTimeout(170); }
}
async function start(page) {
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  await page.getByRole('button', { name: 'Mengerti' }).click();
  await page.getByRole('button', { name: 'Buka jurnal' }).waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('.yzg-headsup').textContent.includes('Siap') || document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
}
async function advanceDialogue(page) {
  while (await page.getByRole("button",{name:"Lanjut ›",exact:true}).count()) await page.getByRole("button",{name:"Lanjut ›",exact:true}).click();
}
const model = {exports:{}};
runInNewContext(buildSync({entryPoints:['src/lib/game/model.ts'],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text,{module:model,exports:model.exports});
async function approachResident(page, id) {
  const previous = await page.evaluate(() => JSON.parse(localStorage.getItem('yz-test-save')).data);
  const state = {...previous,minutes:13*60};
  const resident = model.exports.npcWhere(state,id);
  const candidates = [
    {x:resident.x,y:resident.y+1,dir:'up'},
    {x:resident.x,y:resident.y-1,dir:'down'},
    {x:resident.x-1,y:resident.y,dir:'right'},
    {x:resident.x+1,y:resident.y,dir:'left'}
  ];
  const player = candidates.find(player => {
    const target={...state,player,location:resident.location};
    return !model.exports.areaBlocked(target.location,player.x,player.y,target)
      && model.exports.getActionContext(target).npcId===id;
  });
  assert.ok(player,'No interaction approach available for '+id);
  await loadCheckpoint(page,{minutes:state.minutes,location:resident.location,player});
}
async function moveToNextPlot(page) {
  await go(page,'ArrowUp');
  await go(page,'ArrowRight');
  await go(page,'ArrowDown');
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion:"reduce" });
  await start(page);
  await page.getByRole('button', { name: /YZ Phone · Pesan baru/ }).click();
  await page.getByRole('button', { name: 'Terima pesanan 4 timun' }).click();
  await page.getByRole('button', { name: 'Tutup ponsel' }).click();
  await saved(page, () => JSON.parse(localStorage.getItem('yz-test-save')).data.story.orderAccepted);
  const farm = {location:'field',player:{x:4,y:8,dir:'down'}};
  await loadCheckpoint(page,{...farm,irrigationOpen:true});
  for (let x=4; x<=7; x++) {
    await go(page,'e'); // Cangkul.
    await saved(page, () => JSON.parse(localStorage.getItem('yz-test-save')).data.plots.some(p=>p.stage===-1));
    await go(page,'e'); // Tanam dengan tangan.
    await saved(page, () => JSON.parse(localStorage.getItem('yz-test-save')).data.plots.every(p=>p.stage===0&&p.watered));
    if (x<7) await moveToNextPlot(page);
  }
  for (const morning of [2,3,4]) {
    await loadCheckpoint(page,{location:'home',player:{x:9,y:8,dir:'up'}});
    await go(page,'e');
    await page.getByRole('button',{name:'Tidur sampai pagi',exact:true}).click();
    await page.waitForFunction(day=>JSON.parse(localStorage.getItem('yz-test-save')).data.day===day,morning);
  }
  await loadCheckpoint(page,farm);
  for(let x=4; x<=7; x++) {
    await go(page,'e');
    await page.waitForFunction(total=>JSON.parse(localStorage.getItem('yz-test-save')).data.harvested===total,x-3);
    if(x<7)await moveToNextPlot(page);
  }
  await loadCheckpoint(page,{location:'field',minutes:13*60,player:{x:19,y:6,dir:'up'}});
  await go(page,'e');
  await page.getByRole('dialog', { name: /Empat Timun untuk Satu Meja/ }).waitFor();
  await advanceDialogue(page); await page.getByRole("button",{name:"Akhiri percakapan"}).click();
  await approachResident(page,'A03'); await go(page,'e');
  await page.getByRole('dialog', { name: /Dua Garis/ }).waitFor();
  await advanceDialogue(page); await page.getByRole("button",{name:"Akhiri percakapan"}).click();
  await approachResident(page,'C01'); await go(page,'e');
  await page.getByRole('dialog', { name: /Foto yang Dilipat/ }).waitFor();
  await advanceDialogue(page); await page.getByRole("button",{name:"Putuskan nanti"}).click();
  await saved(page, () => JSON.parse(localStorage.getItem('yz-test-save')).data.story.photoSeen);
  await page.reload(); await page.waitForFunction(() => document.querySelector('.yzg-headsup').textContent.includes('Siap') || document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
  await page.getByRole('button', { name: 'Mengerti' }).click();
  await go(page, 'e');
  await advanceDialogue(page);
  const decision = page.getByRole('button', { name: /Titip salinan di warung/ });
  await decision.focus(); await page.keyboard.press('Enter');
  await saved(page, () => JSON.parse(localStorage.getItem('yz-test-save')).data.story.photoChoice === 'warung');
  await page.getByRole('dialog', { name: /Bab 1 selesai/ }).waitFor();
  await page.screenshot({ path: path.join(output, 'chapter1-desktop.png') });
  await advanceDialogue(page); await page.getByRole("button",{name:"Akhiri percakapan"}).click();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('yz-test-save')));
  assert.equal(save.data.coins, 440); assert.equal(save.data.harvested, 0);
  await page.reload(); await page.getByRole('button', { name: 'Mengerti' }).click();
  await page.getByText('Bab 1 selesai', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Buka jurnal' }).click();
  await page.getByRole('dialog', {name:'YZ Phone'}).getByText('Kebunku',{exact:true}).waitFor();
  await page.getByRole('button', { name: 'Tutup ponsel' }).click();
  await page.evaluate(() => { window.__failSave = true; });
  await page.getByRole('button', { name: '☁ Simpan' }).click();
  await page.getByRole('button', { name: 'Coba simpan kembali' }).waitFor();
  await page.evaluate(() => { window.__failSave = false; });
  await page.getByRole('button', { name: 'Coba simpan kembali' }).click();
  await page.getByRole('button', { name: 'Coba simpan kembali' }).waitFor({state:'hidden'});

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion:"reduce" });
  await mobile.goto(url);
  // Resume a deferred choice on mobile. It came from actual desktop gameplay.
  await mobile.evaluate(row => { row.data.story.photoChoice = null; row.data.story.completedDay = null; localStorage.setItem('yz-test-save', JSON.stringify(row)); }, save);
  await mobile.reload(); await mobile.getByRole('button', { name: 'Mengerti' }).click();
  await mobile.waitForFunction(() => document.querySelector('.yzg-headsup').textContent.includes('Siap') || document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
  await mobile.getByRole('button', { name: 'Aksi' }).click();
  await advanceDialogue(mobile);
  await mobile.getByRole('button', { name: /Percayakan foto asli kepada Nani/ }).waitFor();
  await mobile.screenshot({ path: path.join(output, 'chapter1-mobile.png') });
  const box = await mobile.getByRole('dialog').boundingBox();
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 391 && box.y + box.height <= 845, 'mobile dialog stays in viewport');
  await mobile.getByRole('button', { name: /Percayakan foto asli kepada Nani/ }).click();
  await saved(mobile, () => JSON.parse(localStorage.getItem('yz-test-save')).data.story.photoChoice === 'nani');
  // A single keydown must continue walking without OS key-repeat. Losing
  // focus must stop movement even if the browser never sends a keyup.
  const walk = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await start(walk);
  await walk.keyboard.down('ArrowLeft');
  await walk.waitForTimeout(510);
  await walk.evaluate(() => window.dispatchEvent(new Event('blur')));
  await walk.keyboard.up('ArrowLeft');
  const playerX = () => walk.evaluate(() => JSON.parse(localStorage.getItem('yz-test-save')).data.player.x);
  await saved(walk, () => JSON.parse(localStorage.getItem('yz-test-save') || 'null')?.data.player.x <= 10);
  const stopped = await playerX();
  await walk.waitForTimeout(350);
  const right = walk.getByRole('button', { name: 'Kanan', exact: true });
  const rect = await right.boundingBox();
  await walk.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await walk.mouse.down();
  await walk.waitForTimeout(380);
  await walk.mouse.up();
  await saved(walk, () => document.querySelector('.yzg-headsup').textContent.includes('Tersimpan'));
  await walk.waitForTimeout(1500);
  const afterPad = await playerX();
  assert.ok(afterPad >= stopped+2 && afterPad <= stopped+4, 'held pad travels and stops on release');
  // Observe the actual sprites submitted to the canvas, including the idle
  // transition. Catch accidentally rendering the standing atlas during travel.
  await walk.evaluate(() => {
    const proto = CanvasRenderingContext2D.prototype, original = proto.drawImage;
    window.__gaitFrames = [];
    proto.drawImage = function(image, ...args) {
      if (image.src?.endsWith('/yanzen-gaits.png')) window.__gaitFrames.push([args[0]/32,args[1]/40]);
      if (image.src?.endsWith('/stage1.png') && args[1]<128 && args[0]===24)
        window.__gaitFrames.push(['idle']);
      return original.call(this,image,...args);
    };
  });
  async function observe(chord, expectedRow) {
    await walk.evaluate(() => { window.__gaitFrames=[]; });
    await walk.keyboard.down(chord);
    await walk.waitForTimeout(520);
    await walk.keyboard.up(chord);
    await walk.waitForTimeout(240);
    const frames=await walk.evaluate(()=>window.__gaitFrames);
    assert.ok(new Set(frames.filter(f=>f[1]===expectedRow).map(f=>f[0])).size >= 4,
      'different moving poses drawn from row '+expectedRow);
    assert.equal(frames.at(-1)[0],'idle');
  }
  await observe('ArrowDown',0);
  await walk.keyboard.down('Shift');
  await observe('ArrowUp',7);
  await walk.keyboard.up('Shift');
  await walk.getByRole('button',{name:'Lari',exact:true}).click();
  await observe('ArrowLeft',5);
  await walk.getByRole('button',{name:'Lari',exact:true}).click();
  const steering=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
  await start(steering);
  await steering.evaluate(()=>{
    window.__turns=[];
    const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(im,...args){
      if(im.src?.endsWith('/yanzen-turns.png'))window.__turns.push([args[0]/32,args[1]/40]);
      return original.call(this,im,...args);
    };
  });
  const center=async name=>{
    const b=await steering.getByRole('button',{name,exact:true}).boundingBox();
    return [b.x+b.width/2,b.y+b.height/2];
  };
  await steering.mouse.move(...await center('Kiri'));await steering.mouse.down();
  await steering.waitForTimeout(240);
  await steering.mouse.move(...await center('Atas'));await steering.waitForTimeout(240);
  await steering.mouse.move(...await center('Bawah'));await steering.waitForTimeout(320);
  await steering.mouse.up();await steering.waitForTimeout(250);
  const turns=await steering.evaluate(()=>window.__turns);
  assert.ok(turns.some(([col])=>col===0),'initial push-off');
  assert.ok(turns.some(([col,row])=>col===1 && row%2===1),'diagonal pivot while dragging');
  assert.ok(turns.some(([col,row])=>col===2 && row===0),'settles facing final drag direction');
  await steering.close();
  const field = await browser.newPage();
  await field.addInitScript(() => {
    window.__fieldTrace = [];
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (im,...args) {
      if (im.src?.endsWith('/field-effects.png') || im.src?.includes('/activities/hoe-left-'))
        window.__fieldTrace.push([im.src.split('/').pop(),args[0],performance.now()]);
      return draw.call(this,im,...args);
    };
  });
  await start(field);
  await go(field,'ArrowLeft'); // (11,10) faces the first plot.
  await field.waitForTimeout(300);
  await go(field,'e');
  await field.waitForFunction(()=>window.__fieldTrace.some(e=>e[0]==='field-effects.png'));
  const trace=await field.evaluate(()=>window.__fieldTrace);
  assert.ok(trace.find(e=>e[0]==='field-effects.png')[2] > trace.find(e=>e[0]==='hoe-left-1.png')[2],
    'tool wind-up precedes contact at the target');
  const mute=field.getByRole('button',{name:'Suara aktif'});
  await mute.click();
  await field.getByRole('button',{name:'Suara mati'}).click();
  await mute.waitFor();
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('Chapter 1 desktop/mobile story, reload, keyboard choice and save recovery: PASS');
  console.log('Screenshots:', output);
} catch (error) {
  for (const [i, page] of browser.contexts().flatMap(c => c.pages()).entries()) {
    await page.screenshot({ path: path.join(output, `failure-${i}.png`) });
    console.error(await page.locator('body').innerText());
  }
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
