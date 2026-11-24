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
  /** Native = independent transparent image, not an atlas crop. */
  source?:"native"|"atlas";
  /** Final logical-world display rect. Raw alpha crop dimensions are NOT real furniture dimensions. */
  display:{x:number;y:number;width:number;height:number};
};
/** Source coordinates are inside one 320×320 half-atlas cell.
 * Separate opaque furniture clusters so character depth can be sorted by feet.
 */
export const ROOM_FURNITURE:Record<RoomKind,readonly FurnitureCrop[]>={
  home:[
    // Full standalone sprites generated separately; NO atlas cropping.
    // width/height are the dimensions of the entire native runtime image.
    {id:"bed",source:"native",x:0,y:0,width:268,height:320,footY:216,
      display:{x:155,y:160,width:47,height:56}},
    {id:"chest",source:"native",x:0,y:0,width:320,height:232,footY:273,
      display:{x:296,y:244,width:42,height:30}},
    {id:"bookshelf",source:"native",x:0,y:0,width:320,height:238,footY:170,
      display:{x:225,y:136,width:45,height:34}},
    {id:"computer-desk",source:"native",x:0,y:0,width:296,height:320,footY:212,
      display:{x:290,y:139,width:54,height:58}}
  ],
  shed:[
    // Dedicated self-contained sprites, no cutting from the old 2x2 atlas.
    // Full display rectangles preserve the exported image aspect ratios.
    {id:"tools-shelves",source:"native",x:0,y:0,width:320,height:283,footY:211,
      display:{x:150,y:151,width:68,height:60}},
    {id:"workbench",source:"native",x:0,y:0,width:320,height:297,footY:214,
      display:{x:284,y:151,width:68,height:63}},
    {id:"produce-crates",source:"native",x:0,y:0,width:320,height:296,footY:285,
      display:{x:151,y:232,width:57,height:53}},
    {id:"irrigation-rack",source:"native",x:0,y:0,width:320,height:316,footY:287,
      display:{x:288,y:230,width:58,height:57}}
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
 * 10+ contiguous walking tiles on the center and southern edge stay free;
 * no decorative floor bags or redundant sacks block access to the door.
 * Furniture remains an independent depth-sorted active layer.
 */
const ROOM_TILE_SOLIDS=roomSolids;
export function interiorTileBlocked(room:RoomKind,x:number,y:number):boolean{
  // Both native rooms have a drawn back wall above y=8.
  // Walking on that illustrated wall would look like a collision bug.
  if(x<8||x>16||y<8||y>13)return true;
  return ROOM_TILE_SOLIDS[room].some(([l,t,r,b])=>x>=l&&x<=r&&y>=t&&y<=b);
}

/** A one-storey house is a building class, not an arbitrary asset scale.
 * Source dimensions differ; these sizes have measured ~92px alpha silhouettes.
 * Inggit/Ayu include transparency in their 320px HD atlas frames. Do NOT
 * stretch their square source non-uniformly just to match footprint numerals.
 * Nani/Ryan/Widi are legacy native-size PNGs; old random .9 scales are ignored.
 */
export const ONE_STOREY_HOUSE_VISIBLE_HEIGHT=92;
export const RESIDENT_FACADE_SPECS={
  "fasad-nani":{width:109,height:92,visibleWidth:109,visibleHeight:92,footOffset:0},
  "fasad-ryan":{width:112,height:92,visibleWidth:112,visibleHeight:92,footOffset:0},
  "fasad-widi":{width:112,height:92,visibleWidth:112,visibleHeight:92,footOffset:0},
  "fasad-inggit":{width:124,height:124,visibleWidth:102,visibleHeight:92,footOffset:17},
  "fasad-ayu":{width:134,height:134,visibleWidth:110,visibleHeight:92,footOffset:23}
} as const;
export function residentFacadeSpec(asset:string){
  return RESIDENT_FACADE_SPECS[asset as keyof typeof RESIDENT_FACADE_SPECS]??null;
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
