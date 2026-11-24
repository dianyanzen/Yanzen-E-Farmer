export type InteriorObject = { key: string; x: number; y: number; width: number; height: number; depth: number };

// The new furniture files failed image decoding and the room layout has not yet
// been aligned with walkable tiles. Keep the existing interiors active until
// replacement images and their collision/interaction layout have been verified.
export const YANZEN_MODULAR_INTERIORS_ENABLED = false;

/** Unique assets for Yanzen's house and tool shed; no sprite atlas or shared prop image. */
export const yanzenInteriorAssets: Record<string, string> = {
  homeFloor: "locations/yanzen/home/floor.svg",
  homeWall: "locations/yanzen/home/backwall.svg",
  homeBed: "locations/yanzen/home/bed-01.png",
  homeTable: "locations/yanzen/home/worktable-01.png",
  homeCabinet: "locations/yanzen/home/woven-cabinet-01.png",
  shedFloor: "locations/yanzen/shed/floor.svg",
  shedWall: "locations/yanzen/shed/backwall.svg",
  shedRack: "locations/yanzen/shed/tool-rack-01.png",
  shedWorkbench: "locations/yanzen/shed/workbench-01.png",
};

export const yanzenInteriorLayout: Record<"home" | "shed", InteriorObject[]> = {
  home: [
    { key: "homeWall", x: 0, y: 0, width: 480, height: 320, depth: 10 },
    { key: "homeTable", x: 28, y: 117, width: 70, height: 54, depth: 240 },
    { key: "homeCabinet", x: 370, y: 120, width: 58, height: 58, depth: 246 },
    { key: "homeBed", x: 143, y: 104, width: 106, height: 74, depth: 251 },
  ],
  shed: [
    { key: "shedWall", x: 0, y: 0, width: 480, height: 320, depth: 10 },
    { key: "shedRack", x: 148, y: 91, width: 60, height: 67, depth: 225 },
    { key: "shedWorkbench", x: 342, y: 121, width: 90, height: 65, depth: 253 },
  ],
};
