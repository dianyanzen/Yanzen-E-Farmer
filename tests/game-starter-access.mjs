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
for(const [name,x,y] of [['house',3,4],['shed',9,4],['warung',19,4]]){
 assert.ok(area.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1),`${name} entrance reachable`);
}
for(let y=8;y<=13;y++)for(let x=3;x<=10;x++){
 assert.ok(area.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1),`farm plot ${x},${y} reachable`);
}
assert.ok(area.some(p=>p.x===31&&(p.y===10||p.y===11)),'east exit reachable');
for(let minutes=6*60;minutes<=21*60;minutes+=15){
 const npcs=m.npcSchedule({...field,minutes});
 for(const npc of npcs) if(!npc.indoors) assert.equal(m.areaBlocked(npc.location,npc.x,npc.y),false,`${npc.id} blocked at ${minutes}`);
}
for(const [location,kind] of [['home','sleep'],['shed','storage']]){
 const room={...field,location,player:{x:12,y:12,dir:'up'}};
 const choices=reachable(room).flatMap(p=>directions.map(([dir])=>({...room,player:{...p,dir}})));
 assert.ok(choices.some(s=>m.getActionContext(s).kind===kind),`${location} ${kind} reachable`);
}
for (const room of ['home','shed']) {
 for (const [x,y] of [[8,7],[8,10],[12,8],[15,8],[16,13]]) assert.equal(m.homeBlocked(x,y,room),false,`${room} visible floor ${x},${y}`);
 for (const [x,y] of [[9,7],[10,7],[15,7],[16,7],[7,8],[17,8]]) assert.equal(m.homeBlocked(x,y,room),true,`${room} furniture or wall ${x},${y}`);
}
assert.equal(m.homeBlocked(8,11,'home'),true,'plant blocks its tile');
assert.equal(m.homeBlocked(15,11,'shed'),true,'basket blocks its tile');
const oldRoom={...field,location:'home',player:{x:12,y:6,dir:'down'},day:13};
const migrated=m.safeLoad(oldRoom);
assert.ok(migrated && !m.homeBlocked(migrated.player.x,migrated.player.y,'home'),'old room save moved out of new obstruction');
assert.equal(migrated.day,13,'migration preserves progress');
console.log('PASS: starter plot approaches, doors, exit, room interactions and NPC schedule tiles');
