import layout from "./yanzen-room-layout.json";
export type InteriorObject = { key: string; x:number; y:number; width:number; height:number; depth:number; layer:"architecture"|"floor"|"furniture"|"foreground"; tiles:number[][] };
export const YANZEN_MODULAR_INTERIORS_ENABLED = true;
export const yanzenInteriorAssets: Record<string,string> = {
  "homePlant": "locations/yanzen/v3/home-plant.png",
  "shedBasket": "locations/yanzen/v3/shed-basket.png",
  "homeLamp": "locations/yanzen/v3/home-lamp.png",
  "shedWallShelf": "locations/yanzen/v3/shed-wall-shelf.png",
  "homeFloor": "locations/yanzen/v5/floor.svg",
  "homeWall": "locations/yanzen/v5/back-wall.svg",
  "homeBed": "locations/yanzen/v2/home-bed.png",
  "homeWindow": "locations/yanzen/v2/home-window.png",
  "homeMat": "locations/yanzen/v5/woven-rug.svg",
  "homeTable": "locations/yanzen/v2/home-table.png",
  "homeCabinet": "locations/yanzen/v2/home-cabinet.png",
  "shedFloor": "locations/yanzen/v2/shed-floor.svg",
  "shedWall": "locations/yanzen/v2/shed-wall.svg",
  "shedRack": "locations/yanzen/v2/shed-rack.png",
  "shedWorkbench": "locations/yanzen/v2/shed-workbench.png",
  "homeLeftWall": "locations/yanzen/v5/left-wall.svg",
  "homeRightWall": "locations/yanzen/v5/right-wall.svg",
  "homeFrontWall": "locations/yanzen/v5/front-wall.svg",
  "homeDoormat": "locations/yanzen/v5/door-mat.svg",
  "homeShelf": "locations/yanzen/v5/storage-shelf.svg",
  "homeBench": "locations/yanzen/v5/bench.svg",
  "shedHoe": "locations/yanzen/v6/hoe.svg",
  "shedSickle": "locations/yanzen/v6/sickle.svg",
  "shedShovel": "locations/yanzen/v6/shovel.svg",
  "shedToolbox": "locations/yanzen/v6/toolbox.svg",
  "shedWateringCan": "locations/yanzen/v6/watering-can.svg",
  "shedSeedSack": "locations/yanzen/v6/seed-sack.svg",
  "shedHarvestCrate": "locations/yanzen/v6/harvest-crate.svg",
  "shedFertilizerSack": "locations/yanzen/v6/fertilizer-sack.svg",
  "shedBucket": "locations/yanzen/v6/bucket.svg",
  "shedRope": "locations/yanzen/v6/rope-coil.svg",
  "shedShelfJar": "locations/yanzen/v6/shelf-jar.svg",
  "shedLantern": "locations/yanzen/v6/wall-lantern.svg"
};
/** Shared room blueprint; the model reads the same JSON for collision. */
export const yanzenInteriorLayout = {home:layout.home,shed:layout.shed} as Record<"home"|"shed",InteriorObject[]>;
export function interiorDepth(item:InteriorObject):number {
  return item.layer==="foreground"?3000:item.layer==="furniture"?1000+item.depth-20:20+item.depth;
}
