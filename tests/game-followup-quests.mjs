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
  stdin:{contents:`export {newGame,safeLoad,getActionContext,areaBlocked} from "./src/lib/game/model.ts";
    export {followUpTales,followUpAvailable,followUpTalk,inspectFollowUpProp} from "./src/lib/game/personal-quests.ts";
    export {QUEST_PROPS,questPropAt} from "./src/lib/game/quest-props.ts";
    export {planTapRoute} from "./src/lib/game/tap-navigation.ts";`,
    resolveDir:process.cwd(),loader:"ts"},
  outfile:output,bundle:true,platform:"node",format:"esm",logLevel:"silent"
 });
 const {newGame,safeLoad,getActionContext,areaBlocked,followUpTales,followUpAvailable,
   followUpTalk,inspectFollowUpProp,QUEST_PROPS,questPropAt,planTapRoute}=await import(pathToFileURL(output).href);
 assert.equal(QUEST_PROPS.length,5);
 const known=new Set();
 for(const p of QUEST_PROPS){
   assert.ok(!known.has(p.location+":"+p.x+":"+p.y),"quest prop positions unique");
   known.add(p.location+":"+p.x+":"+p.y);
   assert.equal(questPropAt(p.location,p.x,p.y)?.id,p.id);
   assert.equal(areaBlocked(p.location,p.x,p.y),true,"world props should have physical collision");
   const user={...newGame(),location:p.location,player:{x:p.x-1,y:p.y,dir:"right"}};
   assert.equal(areaBlocked(p.location,p.x-1,p.y),false,"prop must be approachable from the left: "+p.id);
   const interaction=getActionContext(user);
   assert.equal(interaction.kind,"quest-prop","approaching prop triggers action: "+p.id);
   assert.equal(interaction.propId,p.id);
   const tap=planTapRoute(user,p.x,p.y);
   assert.equal(tap?.interact,true,"mobile tap should target an interactive quest prop: "+p.id);
   const asset="public/game/assets/quests/"+p.asset+".svg";
   const svg=readFileSync(asset,"utf8");
   assert.match(svg,/viewBox="0 0 24 28"/);
   assert.match(svg,/shape-rendering="crispEdges"/);
 }
 const owners=["A03","C01","A04","C07","C08"];
 for(const id of owners){
   const base=newGame();
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
 console.log("PASS: five interactive quest props, approachability, gating, saved progress, all rewards once and reset");
}finally{rmSync(directory,{recursive:true,force:true});}
