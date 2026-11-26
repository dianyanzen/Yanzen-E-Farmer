import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const file=new URL('../src/lib/game/model.ts',import.meta.url), mod={exports:{}};
const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{exports:mod.exports,module:mod,require:createRequire(file)},{timeout:1500});
const m=mod.exports, directions=[['up',0,-1],['right',1,0],['down',0,1],['left',-1,0]];
function reachable(state){
 const queue=[{x:state.player.x,y:state.player.y}], seen=new Set([`${state.player.x},${state.player.y}`]);
 for(let i=0;i<queue.length;i++)for(const [,dx,dy] of directions){
  const x=queue[i].x+dx,y=queue[i].y+dy,k=`${x},${y}`;
  if(!seen.has(k)&&!m.areaBlocked(state.location,x,y,state)){seen.add(k);queue.push({x,y});}
 }
 return queue;
}
const field=m.newGame(), area=reachable(field);
for(const [name,x,y] of [['house',m.HOME.door.x,m.HOME.door.y],['shed',m.SHED.door.x,m.SHED.door.y]]){
 assert.ok(area.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1),`${name} entrance reachable`);
}
for (const [room, building] of [['home',m.HOME],['shed',m.SHED]]) {
 const {x,y}=building.door;
 const atDoor={...field,player:{x,y:y+1,dir:'up'}};
 assert.equal(m.areaBlocked('field',x,y+1),false,`${room} steps are clear`);
 assert.equal(m.interactDoor(atDoor).location,room);
 assert.ok(m.interactionHitboxAt('field',(x+.5)*m.WORLD.tile,83),`${room} visual door hotspot`);
}
for(let y=8;y<=13;y++)for(let x=3;x<=10;x++){
 assert.ok(area.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1),`farm plot ${x},${y} reachable`);
}
for (const seat of [m.INGGIT_WARUNG.northBench,m.INGGIT_WARUNG.table,m.INGGIT_WARUNG.southBench])
 assert.ok(area.some(p=>Math.abs(p.x-seat.x)+Math.abs(p.y-seat.y)===1),'seating area remains accessible');
assert.ok(area.some(p=>p.x===m.INGGIT_WARUNG.x&&p.y===m.INGGIT_WARUNG.y+1),'counter reachable from the yard');
assert.ok(area.some(p=>p.x===31&&(p.y===10||p.y===11)),'east exit reachable');
for(let minutes=6*60;minutes<=21*60;minutes+=15){
 const npcs=m.npcSchedule({...field,minutes});
 for(const npc of npcs) if(!npc.indoors && !(npc.id==='C08' && npc.location==='field' && npc.y===m.INGGIT_WARUNG.y &&
   npc.x>=m.INGGIT_WARUNG.x && npc.x<=m.INGGIT_WARUNG.staffExitX)) assert.equal(m.areaBlocked(npc.location,npc.x,npc.y),false,`${npc.id} blocked at ${minutes}`);
}
for(const [location,kind] of [['home','sleep'],['shed','storage']]){
 const room={...field,location,player:{x:12,y:12,dir:'up'}};
 const choices=reachable(room).flatMap(p=>directions.map(([dir])=>({...room,player:{...p,dir}})));
 assert.ok(choices.some(s=>m.getActionContext(s).kind===kind),`${location} ${kind} reachable`);
}
for (const room of ['home','shed']) {
 for (const [x,y] of [[8,7],[12,8],[15,8],[16,13]]) assert.equal(m.homeBlocked(x,y,room),false,`${room} visible floor ${x},${y}`);
 for (const [x,y] of [[9,7],[15,7],[16,7],[7,8],[17,8]]) assert.equal(m.homeBlocked(x,y,room),true,`${room} furniture or wall ${x},${y}`);
}
for(const y of [6,7,8])assert.equal(m.homeBlocked(10,y,'home'),false,'bed-side aisle remains walkable');
assert.equal(m.homeBlocked(10,7,'shed'),true,'rack footprint unchanged');
let byBed={...field,location:'home',player:{x:10,y:8,dir:'up'}};
for(const dir of ['up','up','down','down','left'])byBed=m.movePlayer(byBed,dir);
assert.equal(byBed.player.x,9);assert.equal(byBed.player.y,8);
assert.equal(m.canSleep({...byBed,player:{...byBed.player,dir:'up'}}),true);
assert.equal(m.canSleep({...byBed,player:{x:10,y:8,dir:'up'}}),false,'facing empty aisle must not trigger sleep');
for(const [x,y] of [[8,9],[8,10],[8,12],[16,9],[16,11],[16,12]])assert.equal(m.homeBlocked(x,y,'shed'),true,'new floor prop footprint');
for(let x=11;x<=14;x++)for(let y=8;y<=13;y++)assert.equal(m.homeBlocked(x,y,'shed'),false,'central storage aisle free');
assert.equal(m.homeBlocked(8,11,'home'),true,'shelf blocks its tile');
assert.equal(m.homeBlocked(16,12,'home'),true,'plant blocks its tile');
assert.equal(m.homeBlocked(15,10,'home'),true,'desk blocks its tile');
assert.equal(m.homeBlocked(15,11,'home'),true,'bench blocks its tile');
assert.equal(m.homeBlocked(12,10,'home'),false,'rug is walkable');
for(const room of ['home','shed']) {
 const state={...field,location:room,player:{x:12,y:12,dir:'up'}};
 const reachableTiles=reachable(state);
 for(let y=6;y<=13;y++)for(let x=8;x<=16;x++)if(!m.homeBlocked(x,y,room))assert.ok(reachableTiles.some(p=>p.x===x&&p.y===y),`${room} disconnected floor ${x},${y}`);
}
assert.equal(m.homeBlocked(15,12,'shed'),true,'basket blocks its tile');
for(const [x,y] of [[8,7],[8,8],[8,11],[8,13],[15,10],[15,11],[16,13]])
 assert.equal(m.homeBlocked(x,y,'shed'),false,'single-tile floor gap remains open');
const layout = createRequire(file)('./yanzen-room-layout.json');
for (const room of ['home','shed']) {
 const mat = layout[room].find(item => item.key.endsWith('Doormat'));
 assert.deepEqual([mat.x, mat.x+mat.width, mat.y+mat.height], [233,267,278], 'mat matches visible threshold');
 assert.equal(m.homeBlocked(12,13,room),false,'door threshold stays walkable');
}
const savedShed={...field,location:'shed',player:{x:8,y:10,dir:'right'},day:7,coins:123};
const recoveredShed=m.safeLoad(savedShed);
assert.ok(recoveredShed&&!m.homeBlocked(recoveredShed.player.x,recoveredShed.player.y,'shed'));
assert.equal(recoveredShed.coins,123);
const oldRoom={...field,location:'home',player:{x:15,y:10,dir:'down'},day:13};
const migrated=m.safeLoad(oldRoom);
assert.ok(migrated && !m.homeBlocked(migrated.player.x,migrated.player.y,'home'),'old room save moved out of new obstruction');
assert.equal(migrated.day,13,'migration preserves progress');
console.log('PASS: starter plot approaches, doors, exit, room interactions and NPC schedule tiles');
