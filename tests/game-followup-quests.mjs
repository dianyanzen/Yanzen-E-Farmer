import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {build} from "esbuild";

const directory=mkdtempSync(join(tmpdir(),"yz-quest-props-"));
try{
 const output=join(directory,"quest-test.mjs");
 await build({
  stdin:{contents:`export {newGame,safeLoad,getActionContext,areaBlocked,activeQuestProps,questPropActive,RESIDENT_HOMES,interactDoor} from "./src/lib/game/model.ts";
    export {followUpTales,followUpAvailable,followUpTalk,inspectFollowUpProp} from "./src/lib/game/personal-quests.ts";
    export {QUEST_PROPS,questPropAt} from "./src/lib/game/quest-props.ts";
    export {planTapRoute} from "./src/lib/game/tap-navigation.ts";`,
    resolveDir:process.cwd(),loader:"ts"},
  outfile:output,bundle:true,platform:"node",format:"esm",logLevel:"silent"
 });
 const {newGame,safeLoad,getActionContext,areaBlocked,followUpTales,followUpAvailable,
   followUpTalk,inspectFollowUpProp,QUEST_PROPS,questPropAt,planTapRoute,activeQuestProps,
   questPropActive,RESIDENT_HOMES,interactDoor}=await import(pathToFileURL(output).href);
 assert.equal(QUEST_PROPS.length,5);
 const known=new Set();
 // All mission props are inaccessible and invisible until a request is accepted.
 const homeByOwner=Object.fromEntries(RESIDENT_HOMES.map(h=>[h.owner,h]));
 const expectedLocation={A03:"rumah-ryan",C01:"gang",A04:"rumah-ayu",
   C07:"rumah-widi",C08:"rumah-inggit"};
 for(const p of QUEST_PROPS){
   assert.ok(!known.has(p.location+":"+p.x+":"+p.y),"quest prop positions unique");
   known.add(p.location+":"+p.x+":"+p.y);
   assert.equal(p.location,expectedLocation[p.owner],"prop belongs to NPC's home, except Nani pots");
   assert.equal(questPropAt(p.location,p.x,p.y)?.id,p.id);
   const position=p.owner==="C01"?{x:p.x-1,y:p.y,dir:"right"}:{x:p.x,y:p.y+1,dir:"up"};
   const user={...newGame(),location:p.location,minutes:780,player:position};
   assert.equal(questPropActive(user,p),false,"quest prop is hidden before mission");
   assert.equal(activeQuestProps(user).length,0);
   assert.notEqual(getActionContext(user).kind,"quest-prop","no premature interaction");
   const initialTap=planTapRoute(user,p.x,p.y);
   assert.notEqual(initialTap?.interact,true,"inactive prop must not be treated as interactive by tap");
   if(p.owner==="C01")assert.equal(areaBlocked(p.location,p.x,p.y,user),false,
     "Nani's pots must not leave invisible collision in gang");
   const accepted=followUpTalk({...user,personalQuests:{[p.owner]:{phase:4,day:1,baseline:0}}},p.owner).state;
   assert.equal(questPropActive(accepted,p),true,"active quest reveals target");
   assert.equal(activeQuestProps(accepted).length,1,"only this player's accepted prop shows");
   assert.equal(areaBlocked(p.location,p.x,p.y,accepted),true,"active prop blocks player walking through it");
   assert.equal(getActionContext(accepted).kind,"quest-prop","facing active prop is actionable");
   assert.equal(getActionContext(accepted).propId,p.id);
   const tap=planTapRoute(accepted,p.x,p.y);
   assert.equal(tap?.interact,true,"tap should plan interaction with active prop: "+p.id);
   const asset="public/game/assets/quests/"+p.asset+".svg";
   const svg=readFileSync(asset,"utf8");
   assert.match(svg,/viewBox="0 0 24 28"/);
   assert.match(svg,/shape-rendering="crispEdges"/);
   if(p.owner!=="C01"){
     const home=homeByOwner[p.owner];
     const entrance={...newGame(),location:"gang",minutes:780,
       player:{x:home.x,y:home.y,dir:"up"}};
     assert.notEqual(getActionContext(entrance).kind,"door",
       "low closeness alone does not grant access when owner is outside: "+p.owner);
     const firstQuestVisitor={...entrance,
       personalQuests:{[p.owner]:{phase:1,day:1,baseline:0}}};
     assert.equal(getActionContext(firstQuestVisitor).kind,"door",
       "an accepted first personal quest must also permit visiting");
     assert.notEqual(getActionContext({...firstQuestVisitor,
       personalQuests:{[p.owner]:{phase:4,day:1,baseline:0}}}).kind,"door",
       "finished first quest must not retain a free pass");
     const visitor={...entrance,personalQuests:accepted.personalQuests,
       followUpQuests:accepted.followUpQuests};
     assert.equal(getActionContext(visitor).kind,"door",
       "an accepted mission must allow low-bond entrance: "+p.owner);
     assert.equal(interactDoor(visitor).location,home.location,"mission entry opens correct NPC home");
     assert.equal(getActionContext({...visitor,minutes:22*60}).kind,"inspect",
       "mission entry must still respect visiting hours");
     const afterClose={...visitor,followUpQuests:{[p.owner]:{...accepted.followUpQuests[p.owner],phase:3}}};
     assert.notEqual(getActionContext(afterClose).kind,"door",
       "mission access disappears after completion");
   }
 }
 const owners=["A03","C01","A04","C07","C08"];
 for(const id of owners){
   const prop=QUEST_PROPS.find(p=>p.owner===id);
   const base={...newGame(),location:prop.location,minutes:780,
     player:id==="C01"?{x:prop.x-1,y:prop.y,dir:"right"}:{x:prop.x,y:prop.y+1,dir:"up"}};
   const before=inspectFollowUpProp(base,followUpTales[id].prop);
   assert.equal(before.state,base,"unaccepted prop must not mutate save");
   assert.equal(followUpAvailable(base,id),false,"first quest is prerequisite");
   const unlocked={...base,personalQuests:{[id]:{phase:4,day:1,baseline:0}}};
   assert.equal(followUpAvailable(unlocked,id),true);
   const started=followUpTalk(unlocked,id);
   assert.equal(started.state.followUpQuests[id].phase,1,"accepted follow-up starts pending");
   assert.equal(followUpAvailable(started.state,id),true);
   assert.equal(safeLoad(JSON.parse(JSON.stringify(started.state)))?.followUpQuests?.[id]?.phase,1,
     "new follow-up survives save roundtrip");
   const repeat=followUpTalk(started.state,id);
   assert.equal(repeat.state,started.state,"talking again cannot restart quest");
   let available=started.state;
   if(id==="A04"){
     const tooEarly=inspectFollowUpProp(available,followUpTales[id].prop);
     assert.equal(tooEarly.state,available,"Ayu requires waiting for next in-game day");
     available={...available,day:available.day+1};
   }
   if(id==="C07"){
     const tooEarly=inspectFollowUpProp(available,followUpTales[id].prop);
     assert.equal(tooEarly.state,available,"Widi requires catching fish, not just inspecting");
     available={...available,fishing:{...available.fishing,caught:available.fishing.caught+2}};
   }
   if(id==="C08"){
     const tooEarly=inspectFollowUpProp(available,followUpTales[id].prop);
     assert.equal(tooEarly.state,available,"Inggit requires actual cucumber items");
     available={...available,harvested:2};
   }
   const inspected=inspectFollowUpProp(available,followUpTales[id].prop);
   assert.equal(inspected.state.followUpQuests[id].phase,2,"prop advances the correct quest: "+id);
   const duplicate=inspectFollowUpProp(inspected.state,followUpTales[id].prop);
   assert.equal(duplicate.state,inspected.state,"repeat inspections cannot duplicate progress");
   if(id==="C08")assert.equal(inspected.state.harvested,0,"Inggit collects exactly two cucumbers");
   const reward=followUpTalk(inspected.state,id);
   assert.equal(reward.state.followUpQuests[id].phase,3);
   assert.equal(reward.state.coins,inspected.state.coins+followUpTales[id].fee);
   assert.equal(reward.state.bonds[id].points,inspected.state.bonds[id].points+35);
   assert.equal(followUpTalk(reward.state,id).state,reward.state,"reward may only be claimed once");
   assert.equal(followUpAvailable(reward.state,id),false,"completed mission should not reopen");
   assert.equal(activeQuestProps(reward.state).length,0,"completed quest objects must disappear");
   assert.notEqual(getActionContext(reward.state).kind,"quest-prop","completed props cannot be used");
   assert.ok(safeLoad(JSON.parse(JSON.stringify(reward.state))),"completion save remains valid");
 }
 const blank=safeLoad(JSON.parse(JSON.stringify(newGame())));
 assert.equal(blank.followUpQuests,undefined,"reset removes every follow-up");
 const phone=readFileSync("src/lib/game/phone-story.ts","utf8");
 assert.match(phone,/const followUps=NPCS.filter/,"Kronik should list follow-up only when unlocked");
 assert.match(phone,/followUpObjective/);
 const client=readFileSync("src/app/game/game-client.tsx","utf8");
 assert.match(client,/inspectFollowUpProp\(game,context.propId\)/,"game action must call proper state transition");
 assert.match(client,/followUpTalk\(game,dialogue.npcId!\)/,"NPC dialogue must open next authored quest");
 console.log("PASS: five quest props inside NPC homes except Nani, mission-only access, visiting hours, mobile tap, save and reset");
}finally{rmSync(directory,{recursive:true,force:true});}
