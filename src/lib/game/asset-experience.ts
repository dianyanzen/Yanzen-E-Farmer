/** Optional future prop experiences; no save mutation or automatic map placement. */
import source from "../../../game-assets/catalog/asset-experiences.json";
export type AssetExperienceContext={zone:string;minutes:number;day:number;weather?:string};
export type AssetExperience=typeof source.events[number];
export const ASSET_EXPERIENCES:readonly AssetExperience[]=source.events;
export function inspectAssetExperience(path:string,context:AssetExperienceContext){
 const match=ASSET_EXPERIENCES.find(event=>event.assetPath===path && event.zone===context.zone &&
  context.minutes>=event.timeWindow[0] && context.minutes<event.timeWindow[1]);
 if(!match)return null;
 const index=(Math.max(1,Math.trunc(context.day))-1)%match.lines.length;
 return {id:match.id,text:match.lines[index],verb:match.verb,effectHint:match.effectHint,
   collisionHint:match.collisionHint,placement:match.placement};
}
export function futureAssetExperienceIdeas(zone:string){
 return ASSET_EXPERIENCES.filter(event=>event.zone===zone);
}
