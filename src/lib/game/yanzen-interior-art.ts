export type InteriorObject = { key: string; x: number; y: number; width: number; height: number; depth: number };

/** Each furnishing is a standalone file. Dimensions preserve its source aspect ratio. */
export const YANZEN_MODULAR_INTERIORS_ENABLED = true;
export const yanzenInteriorAssets: Record<string, string> = {
  homePlant: "locations/yanzen/v3/home-plant.png",
  shedBasket: "locations/yanzen/v3/shed-basket.png",
  homeLamp: "locations/yanzen/v3/home-lamp.png",
  shedWallShelf: "locations/yanzen/v3/shed-wall-shelf.png",
  homeFloor: "locations/yanzen/v2/home-floor.svg",
  homeWall: "locations/yanzen/v2/home-wall.svg",
  homeBed: "locations/yanzen/v2/home-bed.png",
  homeWindow: "locations/yanzen/v2/home-window.png",
  homeMat: "locations/yanzen/v2/home-mat.png",
  homeTable: "locations/yanzen/v2/home-table.png",
  homeCabinet: "locations/yanzen/v2/home-cabinet.png",
  shedFloor: "locations/yanzen/v2/shed-floor.svg",
  shedWall: "locations/yanzen/v2/shed-wall.svg",
  shedRack: "locations/yanzen/v2/shed-rack.png",
  shedWorkbench: "locations/yanzen/v2/shed-workbench.png",
};

// Alpha bounds fit the existing blocked tiles and bed/rack interaction targets.
// See tests/game-starter-access.mjs for reachable approach positions.
export const yanzenInteriorLayout: Record<"home" | "shed", InteriorObject[]> = {
  home: [
    { key: "homeWall", x: 0, y: 0, width: 480, height: 320, depth: 10 },
    { key: "homeLamp", x: 181, y: 101, width: 24, height: 22, depth: 11 },
    { key: "homeWindow", x: 226, y: 98, width: 36, height: 24, depth: 11 },
    { key: "homeMat", x: 210, y: 185, width: 80, height: 53.33, depth: 12 },
    { key: "homePlant", x: 160, y: 215, width: 20, height: 18.28, depth: 233 },
    { key: "homeBed", x: 176, y: 107, width: 36, height: 72, depth: 160 },
    { key: "homeTable", x: 228, y: 112, width: 52, height: 34.67, depth: 140 },
    { key: "homeCabinet", x: 300, y: 112, width: 40, height: 60, depth: 165 },
  ],
  shed: [
    { key: "shedWall", x: 0, y: 0, width: 480, height: 320, depth: 10 },
    { key: "shedWallShelf", x: 253, y: 105, width: 40, height: 13.33, depth: 11 },
    { key: "shedBasket", x: 300, y: 217, width: 20, height: 13.33, depth: 230 },
    { key: "shedRack", x: 165, y: 104, width: 64, height: 58.49, depth: 160 },
    { key: "shedWorkbench", x: 292, y: 119, width: 48, height: 32, depth: 151 },
  ],
};
