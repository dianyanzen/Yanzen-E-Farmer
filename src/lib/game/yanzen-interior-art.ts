import layout from "./yanzen-room-layout.json";
export type InteriorObject = { key: string; x:number; y:number; width:number; height:number; depth:number; layer:"architecture"|"floor"|"furniture"|"foreground"; tiles:number[][]; phase?:"day"|"night" };
export const YANZEN_MODULAR_INTERIORS_ENABLED = true;
export const yanzenInteriorAssets: Record<string,string> = {
  "homePlant": "locations/yanzen/v8/home-potted-plant.png",
  "shedBasket": "locations/yanzen/v7/shed-woven-basket.png",
  "shedClayJar": "locations/yanzen/v7/shed-clay-jar.png",
  "homeLamp": "locations/yanzen/v3/home-lamp.png",
  "shedWallShelf": "locations/yanzen/v3/shed-wall-shelf.png",
  "homeFloor": "locations/yanzen/v7/home-floor.png",
  "homeWall": "locations/yanzen/v7/home-back-wall.png",
  "homeBed": "locations/yanzen/v2/home-bed.png",
  "homeWindow": "locations/yanzen/v2/home-window.png",
  "homeMat": "locations/yanzen/v7/home-woven-rug.png",
  "homeTable": "locations/yanzen/v2/home-table.png",
  "homeCabinet": "locations/yanzen/v2/home-cabinet.png",
  "shedFloor": "locations/yanzen/v7/shed-floor.png",
  "shedWall": "locations/yanzen/v7/shed-back-wall.png",
  "shedRack": "locations/yanzen/v2/shed-rack.png",
  "shedWorkbench": "locations/yanzen/v2/shed-workbench.png",
  "homeLeftWall": "locations/yanzen/v7/home-left-trim.png",
  "homeRightWall": "locations/yanzen/v7/home-right-trim.png",
  "homeFrontWall": "locations/yanzen/v7/home-front-trim.png",
  "homeDoormat": "locations/yanzen/v8/home-entry-mat.png",
  "homeShelf": "locations/yanzen/v7/home-low-shelf.png",
  "homeBench": "locations/yanzen/v7/home-teak-bench.png",
  "shedHoe": "locations/yanzen/v6/hoe.svg",
  "shedSickle": "locations/yanzen/v6/sickle.svg",
  "shedShovel": "locations/yanzen/v6/shovel.svg",
  "shedToolbox": "locations/yanzen/v6/toolbox.svg",
  "shedWateringCan": "locations/yanzen/v6/watering-can.svg",
  "shedSeedSack": "locations/yanzen/v7/shed-seed-sacks.png",
  "shedHarvestCrate": "locations/yanzen/v7/shed-harvest-crate.png",
  "shedBucket": "locations/yanzen/v7/shed-water-barrel.png",
  "shedRope": "locations/yanzen/v6/rope-coil.svg",
  "shedLantern": "locations/yanzen/v6/wall-lantern.svg",
  "homeHillsideFrame": "locations/yanzen/v7/home-hillside-frame.png",
  "homeJournal": "locations/yanzen/v7/home-farm-journal.png",
  "homeWindowLight": "locations/yanzen/v7/home-window-light.png",
  "homeLampLight": "locations/yanzen/v7/home-lamp-light.png",
  "shedLeftWall": "locations/yanzen/v7/shed-left-trim.png",
  "shedRightWall": "locations/yanzen/v7/shed-right-trim.png",
  "shedFrontWall": "locations/yanzen/v7/shed-front-trim.png",
  "shedVent": "locations/yanzen/v7/shed-vent.png",
  "shedWindowLight": "locations/yanzen/v7/shed-vent-light.png",
  "shedLampLight": "locations/yanzen/v7/shed-lantern-light.png",
  "shedDoormat": "locations/yanzen/v8/shed-entry-mat.png",
  "shedFertilizerBase": "locations/yanzen/v8/shed-fertilizer-base.png",
  "shedFertilizerTop": "locations/yanzen/v8/shed-fertilizer-top.png",
  "shedRake": "locations/yanzen/v8/shed-rake.png",
  "shedTwineBundle": "locations/yanzen/v8/shed-twine-bundle.png",
  "shedSupplyCubby": "locations/yanzen/v7/shed-supply-cubby.png",
};
/** Shared room blueprint; the model reads the same JSON for collision. */
export const yanzenInteriorLayout = {home:layout.home,shed:layout.shed} as Record<"home"|"shed",InteriorObject[]>;
export function interiorDepth(item:InteriorObject):number {
  return item.layer==="foreground"?3000:item.layer==="furniture"?1000+item.depth-20:20+item.depth;
}

export function interiorOpacity(item: InteriorObject, minutes: number): number {
  const dusk = Math.max(0, Math.min(1, (minutes - 17 * 60) / 60));
  if (item.phase === "day") return 1 - dusk;
  if (item.phase === "night") return dusk;
  return 1;
}
