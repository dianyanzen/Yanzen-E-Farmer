/** YZ Farm Life visual-geometry contract (pixel world: 20px/tile).
 * Authored from the actual HD atlas, not an assumed house shape.
 * Pure data is shared by both renderers, route QA and model collision.
 * No game-state or save-format mutation.
 */
import roomSolids from "./world-layout-data.json";
export const TILE_PX=20;
export type RoomKind="home"|"shed";
export type FurnitureCrop={
  id:string;x:number;y:number;width:number;height:number;footY:number;
  /** Final logical-world display rect. Raw alpha crop dimensions are NOT real furniture dimensions. */
  display:{x:number;y:number;width:number;height:number};
};
/** Source coordinates are inside one 320×320 half-atlas cell.
 * Separate opaque furniture clusters so character depth can be sorted by feet.
 */
export const ROOM_FURNITURE:Record<RoomKind,readonly FurnitureCrop[]>={
  home:[
    {id:"bed",x:8,y:25,width:97,height:147,footY:172,
      display:{x:152,y:110,width:50,height:76}},
    {id:"chest",x:8,y:172,width:97,height:55,footY:227,
      display:{x:151,y:201,width:50,height:28}},
    {id:"harvest-bags",x:8,y:227,width:110,height:90,footY:316,
      display:{x:151,y:247,width:55,height:45}},
    {id:"bookshelf",x:106,y:17,width:95,height:94,footY:111,
      display:{x:215,y:81,width:58,height:57}},
    {id:"computer-desk",x:202,y:18,width:118,height:118,footY:136,
      display:{x:283,y:84,width:63,height:63}},
    {id:"storage-cabinet",x:202,y:136,width:118,height:146,footY:282,
      display:{x:289,y:188,width:62,height:77}}
  ],
  shed:[
    {id:"tools-shelves",x:8,y:22,width:155,height:91,footY:113,
      display:{x:147,y:84,width:97,height:57}},
    {id:"workbench",x:163,y:23,width:157,height:95,footY:118,
      display:{x:268,y:86,width:86,height:52}},
    {id:"produce-crates",x:8,y:113,width:108,height:105,footY:218,
      display:{x:151,y:160,width:55,height:53}},
    {id:"irrigation-rack",x:8,y:218,width:110,height:99,footY:317,
      display:{x:151,y:232,width:61,height:55}},
    {id:"stored-sacks",x:210,y:115,width:110,height:99,footY:214,
      display:{x:286,y:162,width:60,height:54}},
    {id:"storage-cabinets",x:210,y:214,width:110,height:104,footY:318,
      display:{x:287,y:231,width:62,height:59}}
  ]
} as const;

/** Same artboard projection as drawHDInteriorBase: no stretch/mismatch. */
/** Uniform projection avoids stretched beds, doors and furniture.
 * 320x320 -> 232x232 means exactly one scale on both axes.
 */
export const ROOM_PROJECTION={x:132,y:69,width:232,height:232,sourceSize:320} as const;
export function furnitureScreenRect(piece:FurnitureCrop){
  const d=piece.display;
  return {...d,footY:d.y+d.height};
}
/** Tile footprints of floor-level furniture, not roof/wall decoration.
 * The middle route x=11..14 connects spawn/exit and bed/tool hotspots.
 * Explicit corridors keep old-save positions reachable.
 */
const ROOM_TILE_SOLIDS=roomSolids;
export function interiorTileBlocked(room:RoomKind,x:number,y:number):boolean{
  if(x<8||x>16||y<6||y>13)return true;
  return ROOM_TILE_SOLIDS[room].some(([l,t,r,b])=>x>=l&&x<=r&&y>=t&&y<=b);
}

/** Accurate entrance anchors — stepping-stone routes must touch THESE points.
 * Road paths and building/merchant visuals are distinct from NPC state.
 */
export const EXTERIOR_THRESHOLDS={
  "rumah-yanzen":{x:72,y:102},
  "gudang-kayu":{x:186,y:95},
  "warung-inggit":{x:387,y:95},
  "fasad-nani":{x:160,y:155},
  "fasad-ryan":{x:403,y:155},
  "fasad-inggit":{x:85,y:277},
  "fasad-ayu":{x:305,y:277},
  "fasad-widi":{x:530,y:155},
  "lapak-benih":{x:128,y:174},
  "lapak-pancing":{x:550,y:159}
} as const;
/** HD merchant envelopes exclude ancillary tents, shadows, and free-floating props. */
export const MARKET_STOREFRONTS=[
  {asset:"lapak-benih",x:128,y:174,width:146,height:146},
  {asset:"warung-inggit",x:374,y:177,width:109,height:96},
  {asset:"lapak-pancing",x:550,y:159,width:132,height:132}
] as const;
export function storefrontEnvelopesOverlap(a:{x:number;y:number;width:number;height:number},
 b:{x:number;y:number;width:number;height:number},padding=0):boolean{
  const xGap=Math.abs(a.x-b.x),centerAy=a.y-a.height/2,centerBy=b.y-b.height/2;
  return xGap<(a.width+b.width)/2+padding &&
    Math.abs(centerAy-centerBy)<(a.height+b.height)/2+padding;
}
