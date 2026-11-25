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
console.log('PASS: starter plot approaches, doors, exit, room interactions and NPC schedule tiles');
