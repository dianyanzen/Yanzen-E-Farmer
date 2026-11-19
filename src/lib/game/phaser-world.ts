"use client";

/**
 * Native Phaser 4 renderer for the existing YZ Farm Life model.
 *
 * The React/Supabase game model remains authoritative: this scene never writes
 * saves, runs collision rules, or advances the calendar. Only Phaser owns the
 * visible canvas, sprite layers, native camera and scene graphics.
 */
import * as Phaser from "phaser";
import { HOME, SHED, WORLD, npcHere, weatherForDay, type OutdoorLocation } from "./model";
import type { FieldFrame } from "./field-engine";
import { drawOutdoorArea } from "./pasirluyu-areas";
import { drawFieldRoads, drawRouteClosures } from "./pasirluyu-master-map";

const WIDTH = WORLD.width * WORLD.tile;
const HEIGHT = WORLD.height * WORLD.tile;
const TILE = WORLD.tile;
const dirs = { down: 0, left: 1, right: 2, up: 3 } as const;
const npcRows: Record<string, number> = { A01: 0, A03: 1, C01: 2, C08: 3 };

export interface PhaserFieldAdapter {
  draw(frame: FieldFrame): void;
  destroy(): void;
}

function makeCanvas(painter: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung Canvas 2D untuk aset peta.");
  ctx.font = "bold 8px monospace";
  painter(ctx);
  return canvas;
}

function decorateField(ctx: CanvasRenderingContext2D) {
  const block = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  drawFieldRoads(ctx);
  for (let y = 5; y < 16; y++) {
    if (y === 10 || y === 11) continue;
    block(23*TILE, y*TILE, 20, 20, "#406745");
    block(23*TILE+4, y*TILE+2, 14, 11, "#629059");
    block(23*TILE+8, y*TILE+12, 5, 7, "#6a5137");
  }
  for (let x = 0; x < 23; x++) {
    block(x*TILE, 15*TILE, 20, 20, x%2 ? "#547d4b" : "#466c44");
    block(x*TILE+2, 15*TILE+2, 16, 9, "#75a265");
    block(x*TILE+3, 15*TILE+15, 15, 2, "#6d583f");
  }
  drawRouteClosures(ctx, "field");
}

class YZWorldScene extends Phaser.Scene {
  private ready = false;
  private background!: Phaser.GameObjects.Image;
  private village!: Phaser.GameObjects.Image;
  private overlay!: Phaser.GameObjects.Image;
  private farm!: Phaser.GameObjects.Graphics;
  private highlight!: Phaser.GameObjects.Graphics;
  private weather!: Phaser.GameObjects.Graphics;
  private dusk!: Phaser.GameObjects.Rectangle;
  private actor!: Phaser.GameObjects.Sprite;
  private effect!: Phaser.GameObjects.Sprite;
  private npcSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private crops: Phaser.GameObjects.Sprite[] = [];
  private lastLocation = "";
  private lastFarmSignature = "";
  private lastAmbient = -1;
  private frame?: FieldFrame;

  constructor(private readonly booted: () => void, private readonly failed: (error: Error) => void) {
    super({ key: "YZFarmLifeWorld" });
  }

  preload() {
    this.load.on("loaderror", () => this.failed(new Error("Gagal memuat aset Phaser.")));
    this.load.image("yz-landscape", "/game/assets/tiles/pasirluyu.png");
    this.load.spritesheet("yz-people", "/game/assets/characters/stage1.png", { frameWidth: 24, frameHeight: 32 });
    this.load.spritesheet("yz-gaits", "/game/assets/characters/yanzen-gaits.png", { frameWidth: 32, frameHeight: 40 });
    this.load.spritesheet("yz-turns", "/game/assets/characters/yanzen-turns.png", { frameWidth: 32, frameHeight: 40 });
    this.load.spritesheet("yz-actions", "/game/assets/tiles/actions.png", { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet("yz-effects", "/game/assets/tiles/field-effects.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("yz-cucumber", "/game/assets/tiles/cucumber.png", { frameWidth: 16, frameHeight: 16 });
    this.load.svg("yz-village-day", "/game/assets/pasirluyu/house-neighborhood-day.svg", { width: WIDTH, height: HEIGHT });
    this.load.svg("yz-village-evening", "/game/assets/pasirluyu/house-neighborhood-evening.svg", { width: WIDTH, height: HEIGHT });
    this.load.svg("yz-home-day", "/game/assets/pasirluyu/rumah-yanzen-interior-day.svg", { width: WIDTH, height: HEIGHT });
    this.load.svg("yz-home-evening", "/game/assets/pasirluyu/rumah-yanzen-interior-evening.svg", { width: WIDTH, height: HEIGHT });
    this.load.svg("yz-shed", "/game/assets/pasirluyu/gudang-interior.svg", { width: WIDTH, height: HEIGHT });
  }

  create() {
    try {
      const staticField = makeCanvas(decorateField);
      this.textures.addCanvas("yz-field-decor", staticField);
      this.background = this.add.image(0, 0, "yz-landscape").setOrigin(0).setDepth(0);
      this.village = this.add.image(0, 0, "yz-village-day").setOrigin(0).setDisplaySize(WIDTH, HEIGHT).setDepth(1);
      this.overlay = this.add.image(0, 0, "yz-field-decor").setOrigin(0).setDepth(2);
      this.farm = this.add.graphics().setDepth(10);
      this.highlight = this.add.graphics().setDepth(11);
      this.effect = this.add.sprite(0, 0, "yz-effects", 0).setOrigin(0).setDepth(1700).setVisible(false);
      this.weather = this.add.graphics().setDepth(4000);
      this.dusk = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x3e2d5e, 0)
        .setOrigin(0).setDepth(5000);
      this.actor = this.add.sprite(0, 0, "yz-people", 1).setOrigin(0).setDepth(1000);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      this.ready = true;
      this.booted();
      if (this.frame) this.draw(this.frame);
    } catch (error) {
      this.failed(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private changeLocation(location: string, evening: boolean) {
    this.lastLocation = location;
    this.lastFarmSignature = "";
    const field = location === "field";
    this.village.setVisible(field);
    this.overlay.setVisible(field);
    this.farm.setVisible(field);
    this.highlight.setVisible(field);
    for (const crop of this.crops) crop.setVisible(false);
    if (field) {
      this.background.setTexture("yz-landscape");
      this.background.setDisplaySize(WIDTH, HEIGHT);
    } else if (location === "home") {
      this.background.setTexture(evening ? "yz-home-evening" : "yz-home-day");
      this.background.setDisplaySize(WIDTH, HEIGHT);
    } else if (location === "shed") {
      this.background.setTexture("yz-shed").setDisplaySize(WIDTH, HEIGHT);
    } else {
      const key = "yz-zone-" + location;
      if (!this.textures.exists(key)) {
        const canvas = makeCanvas(ctx => drawOutdoorArea(ctx, location as Exclude<OutdoorLocation, "field">, 0));
        this.textures.addCanvas(key, canvas);
      }
      this.background.setTexture(key).setDisplaySize(WIDTH, HEIGHT);
    }
  }

  private updatePlots(frame: FieldFrame) {
    const signature = frame.plots.map(p =>
      String(p.x) + ":" + p.y + ":" + p.stage + ":" + Number(p.watered)).join("|");
    if (signature === this.lastFarmSignature) return;
    this.lastFarmSignature = signature;
    this.farm.clear();
    const lookup = new Map(frame.plots.map(plot => [plot.x + "," + plot.y, plot]));
    const fill = (x: number, y: number, w: number, h: number, color: number) => {
      this.farm.fillStyle(color, 1);
      this.farm.fillRect(x, y, w, h);
    };
    let i = 0;
    for (let y = 8; y <= 13; y++) for (let x = 3; x <= 10; x++) {
      const px = x*TILE, py = y*TILE;
      const plot = lookup.get(x + "," + y);
      const variant = (x*5+y*3)%4;
      const earth = [0xa47d52, 0xae855a, 0xaa8056, 0xb28b5e][variant];
      fill(px, py, TILE, TILE, 0x684f39);
      fill(px+1, py+1, TILE-2, TILE-2, earth);
      fill(px+2, py+3, TILE-4, 2, 0xc29b67);
      fill(px+4, py+12, TILE-8, 1, 0x96704c);
      fill(px+9, py+7, 2, 1, 0xd0ac73);
      if (plot) {
        fill(px+1, py+2, TILE-2, TILE-4, plot.watered ? 0x58473a : 0x76513c);
        fill(px+3, py+6, TILE-6, 2, plot.watered ? 0x78634b : 0x98704f);
        fill(px+3, py+13, TILE-6, 2, plot.watered ? 0x6e5943 : 0x916446);
        if (plot.stage === -1) {
          fill(px+3, py+8, 14, 1, 0xb88f60);
          fill(px+5, py+11, 10, 1, 0xb88f60);
        } else if (plot.stage >= 0) {
          if (!this.crops[i]) {
            this.crops[i] = this.add.sprite(0, 0, "yz-cucumber", 0).setOrigin(0).setDepth(12);
          }
          this.crops[i].setPosition(px+2,py+2).setFrame(Math.min(3,plot.stage)).setVisible(true);
        }
        if (plot.watered && plot.stage < 3) fill(px+15,py+3,3,4,0x68bacf);
        if (plot.stage === 3) {
          fill(px+2,py+2,5,2,0xffdb81);
          fill(px+2,py+4,2,3,0xffdb81);
        }
      }
      if (!plot || plot.stage < 0) {
        if (this.crops[i]) this.crops[i].setVisible(false);
      }
      i++;
    }
  }

  private drawNPCs(frame: FieldFrame) {
    const players = npcHere(frame.state);
    const seen = new Set<string>();
    for (const npc of players) {
      seen.add(npc.id);
      let sprite = this.npcSprites.get(npc.id);
      if (!sprite) {
        sprite = this.add.sprite(0, 0, "yz-people", 1).setOrigin(0);
        this.npcSprites.set(npc.id, sprite);
      }
      const dx = frame.position.x - npc.x, dy = frame.position.y - npc.y;
      const near = Math.abs(dx) + Math.abs(dy) <= 2;
      const dir = !near ? "down" : Math.abs(dx) > Math.abs(dy) ?
        (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      const actorRow = npcRows[npc.id] ?? 0;
      sprite.setFrame((actorRow*4 + dirs[dir])*3+1)
        .setPosition(npc.x*TILE-2, npc.y*TILE-12)
        .setDepth(1000 + npc.y*TILE)
        .setVisible(frame.state.location !== "home" && frame.state.location !== "shed");
    }
    for (const [id, sprite] of this.npcSprites) if (!seen.has(id)) sprite.setVisible(false);
  }

  draw(frame: FieldFrame) {
    this.frame = frame;
    if (!this.ready) return;
    const location = frame.state.location;
    const evening = frame.state.minutes >= 18*60;
    if (this.lastLocation !== location) this.changeLocation(location, evening);
    if (location === "home") this.background.setTexture(evening ? "yz-home-evening" : "yz-home-day");
    if (location === "field") {
      this.village.setTexture(evening ? "yz-village-evening" : "yz-village-day");
      this.updatePlots(frame);
      const tile = frame.state.player;
      const facing = { up: [0,-1], down:[0,1], left:[-1,0], right:[1,0] }[tile.dir];
      const tx=tile.x+facing[0],ty=tile.y+facing[1];
      this.highlight.clear();
      if (tx>=3 && tx<=10 && ty>=8 && ty<=13) {
        this.highlight.lineStyle(1, 0xf9e5b3, 1);
        this.highlight.strokeRect(tx*TILE+1,ty*TILE+1,TILE-2,TILE-2);
      }
    }
    this.drawNPCs(frame);
    const actorRow = dirs[frame.position.dir];
    let texture="yz-people", spriteFrame=actorRow*3+1, x=frame.position.x*TILE-2, y=frame.position.y*TILE-12;
    if (frame.action && frame.action.use.origin.x === frame.state.player.x &&
        frame.action.use.origin.y === frame.state.player.y) {
      const actionRow = { hoe:0, seed:1, water:2, harvest:3 }[frame.action.use.tool];
      texture="yz-actions";spriteFrame=(actionRow*4 + actorRow)*3+frame.action.frame;
      x=frame.position.x*TILE-14;y=frame.position.y*TILE-23;
    } else if (frame.weight) {
      texture="yz-turns";spriteFrame=frame.weight.row*3+frame.weight.column;
      x=frame.position.x*TILE-6+frame.weight.shiftX;y=frame.position.y*TILE-18+frame.weight.shiftY;
    } else if (frame.pose !== null) {
      texture="yz-gaits";spriteFrame=(actorRow+(frame.running ? 4:0))*6+frame.pose;
      x=frame.position.x*TILE-6;y=frame.position.y*TILE-18;
    }
    this.actor.setTexture(texture, Math.max(0,spriteFrame))
      .setPosition(Math.round(x),Math.round(y))
      .setDepth(1000 + frame.position.y*TILE + 1);
    if (frame.action && frame.action.effect >= 0) {
      const effectRow={hoe:0,seed:1,water:2,harvest:3}[frame.action.use.tool];
      this.effect.setPosition(frame.action.use.target.x*TILE+2,frame.action.use.target.y*TILE+1)
        .setFrame(effectRow*4+frame.action.effect).setVisible(true);
    } else this.effect.setVisible(false);
    const cameraX=Math.min(WIDTH-300,Math.max(0,(frame.camera.x+.5)*TILE-150));
    const cameraY=Math.min(HEIGHT-200,Math.max(0,(frame.camera.y+.5)*TILE-100));
    this.cameras.main.setScroll(Math.round(cameraX),Math.round(cameraY));
    const dusk=Math.max(0,Math.min(1,(frame.state.minutes-960)/240));
    this.dusk.setAlpha(dusk*.32);
    if (this.lastAmbient !== frame.ambient) {
      this.lastAmbient=frame.ambient;
      this.weather.clear();
      if (weatherForDay(frame.state.day) === "hujan") {
        this.weather.fillStyle(0xbce2f2,.63);
        for (let i=0;i<44;i++) {
          const px=(i*79+frame.ambient*7)%WIDTH;
          const py=(i*47+frame.ambient*11)%HEIGHT;
          this.weather.fillRect(px,py,1,5);
        }
      }
    }
  }
}

/** Client-only: mount one Phaser.Game and remove its canvas on unmount. */
export function mountPhaserWorld(parent: HTMLElement): Promise<PhaserFieldAdapter> {
  return new Promise((resolve,reject) => {
    let game: Phaser.Game | null = null;
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      game?.destroy(true);
      reject(error);
    };
    const scene = new YZWorldScene(() => {
      if (settled) return;
      settled = true;
      resolve({
        draw: frame => scene.draw(frame),
        destroy: () => { game?.destroy(true); }
      });
    }, fail);
    try {
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        width: 300,
        height: 200,
        backgroundColor: "#86b07a",
        pixelArt: true,
        audio: { noAudio: true },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 300, height: 200 },
        scene: [scene]
      });
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
