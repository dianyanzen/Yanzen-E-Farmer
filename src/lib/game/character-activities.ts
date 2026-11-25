import type { WarungItem } from "./model";

export type CharacterActivityId = WarungItem | "sit" | "faucet" | "sleep" | "take";
export type ActivityAnchor = { x:number; y:number };
export type CharacterActivity = { id:CharacterActivityId; started:number; origin?:ActivityAnchor; anchor?:ActivityAnchor };
export type ActivityFrame = { key:string; propKey?:string; anchor?:ActivityAnchor };

const timeline: Record<CharacterActivityId,readonly number[]> = {
  "kopi-hitam": [280,470,820,1160,1440],
  "teh-hangat": [280,500,890,1230,1500],
  "bala-bala": [280,470,790,1120,1420],
  "nasi-tutug": [280,520,900,1300,1680],
  sit: [160,420,2100,2380],
  faucet: [180,370,660],
  sleep: [160,370,780],
  take: [165,355,640],
};

const mealIds = new Set<string>(["kopi-hitam","teh-hangat","bala-bala","nasi-tutug"]);
const hasProp=(id:string,index:number)=>mealIds.has(id) && index>=2 && index<=4;
export const activityAssets = Object.fromEntries(Object.entries(timeline).flatMap(([id,frames])=>
  frames.flatMap((_,index)=>{
    const key=`${id}-${index+1}`;
    const keys=hasProp(id,index+1)?[key,key+"-prop"]:[key];
    return keys.map(name=>[name,`characters/activities/${name}.png`]);
  })));

export function activityDuration(id:CharacterActivityId) {
  return timeline[id].at(-1)!;
}

export function activityFrame(activity:CharacterActivity, now:number, reduced:boolean): ActivityFrame|undefined {
  const index=timeline[activity.id].findIndex(end=>now-activity.started<end);
  if(index<0)return;
  const frame=reduced ? Math.min(2,timeline[activity.id].length) : index+1;
  const key=`${activity.id}-${frame}`;
  let anchor=activity.anchor;
  if(anchor && activity.origin && !reduced){
    const travel=Math.min(1,Math.max(0,(now-activity.started)/timeline[activity.id][1]));
    anchor={x:activity.origin.x+(anchor.x-activity.origin.x)*travel,
      y:activity.origin.y+(anchor.y-activity.origin.y)*travel};
  }
  return {key,propKey:hasProp(activity.id,frame)?key+"-prop":undefined,anchor};
}
