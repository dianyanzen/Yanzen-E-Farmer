"use client";

/**
 * Native Phaser 4 renderer for the existing YZ Farm Life model.
 *
 * The React/Supabase game model remains authoritative: this scene never writes
 * saves, runs collision rules, or advances the calendar. Only Phaser owns the
 * visible canvas, sprite layers, native camera and scene graphics.
 */
import * as Phaser from "phaser";
import { RESIDENT_HOMES, isResidentHome, WORLD, facing, isOutdoorLocation, npcHere, weatherForDay, type GameLocation } from "./model";
import type { FieldFrame, WorldPick } from "./field-engine";
import { waterRipples } from "./pasirluyu-areas";
import { drawModularGround, outdoorObjects, outdoorSources, plotTextureFrame } from "./modular-outdoor";

const WIDTH = WORLD.width * WORLD.tile;
const HEIGHT = WORLD.height * WORLD.tile;
const TILE = WORLD.tile;
const RENDER_SCALE = 3;
const VIEW_WIDTH = 300 * RENDER_SCALE;
const VIEW_HEIGHT = 200 * RENDER_SCALE;
const dirs = { down: 0, left: 1, right: 2, up: 3 } as const;
// Sort people by their feet. Every actor is above ground and texture overlays.
const characterDepth = (tileY: number) => 1000 + tileY * TILE;
const npcRows: Record<string, number> = { A01: 0, A03: 1, C01: 2, C08: 3, A04: 4, C07: 5 };

export interface PhaserFieldAdapter {
  draw(frame: FieldFrame): void;
  pickTile(clientX: number, clientY: number): WorldPick | null;
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

class YZWorldScene extends Phaser.Scene {
  private ready = false;

  private background!: Phaser.GameObjects.Image;
  private soil: Phaser.GameObjects.Sprite[] = [];
  private mapProps: Phaser.GameObjects.Image[] = [];
  private farm!: Phaser.GameObjects.Graphics;
  private highlight!: Phaser.GameObjects.Graphics;
  private dust!: Phaser.GameObjects.Graphics;
  private readonly npcTargets = new Map<string, {
    row:number; idle:number; path:{x:number;y:number}[]; leaving:boolean;
  }>();
  private npcClock?: {day:number;minutes:number;location:GameLocation};
  private propState = "";
  private pathGuide!: Phaser.GameObjects.Graphics;
  private pathKey = "";
  private water!: Phaser.GameObjects.Graphics;
  private waterKey = "";
  private weather!: Phaser.GameObjects.Graphics;
  private dusk!: Phaser.GameObjects.Image;
  private actor!: Phaser.GameObjects.Sprite;
  private actorShadow!: Phaser.GameObjects.Ellipse;
  private effect!: Phaser.GameObjects.Sprite;
  private npcSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private crops: Phaser.GameObjects.Sprite[] = [];
  private lastLocation = "";
  private lastFarmSignature = "";
  private lastRainFrame: number | null = null;
  private frame?: FieldFrame;

  constructor(private readonly booted: () => void, private readonly failed: (error: Error) => void) {
    super({ key: "YZFarmLifeWorld" });
  }

  preload() {
    this.load.on("loaderror", () => this.failed(new Error("Gagal memuat aset Phaser.")));
    for (const [id,path] of Object.entries(outdoorSources)) if (id!=="petak") {
      if (path.endsWith(".svg")) this.load.svg("yz-map-"+id,"/game/assets/"+path,{width:24,height:28});
      else this.load.image("yz-map-"+id,"/game/assets/"+path);
    }
    this.load.spritesheet("yz-petak", "/game/assets/"+outdoorSources.petak, { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet("yz-people", "/game/assets/characters/stage1.png", { frameWidth: 24, frameHeight: 32 });
    this.load.spritesheet("yz-gaits", "/game/assets/characters/yanzen-gaits.png", { frameWidth: 32, frameHeight: 40 });
    this.load.spritesheet("yz-turns", "/game/assets/characters/yanzen-turns.png", { frameWidth: 32, frameHeight: 40 });
    this.load.spritesheet("yz-actions", "/game/assets/tiles/actions.png", { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet("yz-effects", "/game/assets/tiles/field-effects.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("yz-cucumber", "/game/assets/tiles/cucumber.png", { frameWidth: 16, frameHeight: 16 });
    for(const home of RESIDENT_HOMES)this.load.image(home.location,"/game/assets/residences/"+home.location+".png");
    this.load.svg("yz-home-day", "/game/assets/pasirluyu/rumah-yanzen-interior-day.svg", { width: 480, height: HEIGHT });
    this.load.svg("yz-home-evening", "/game/assets/pasirluyu/rumah-yanzen-interior-evening.svg", { width: 480, height: HEIGHT });
    this.load.svg("yz-warung", "/game/assets/pasirluyu/warung-interior.svg", { width: 480, height: HEIGHT });
    this.load.svg("yz-shed", "/game/assets/pasirluyu/gudang-interior.svg", { width: 480, height: HEIGHT });
  }

  create() {
    try {
      this.background = this.add.image(0, 0, "yz-map-ground").setOrigin(0).setDepth(0);
      this.farm = this.add.graphics().setDepth(10);
      this.highlight = this.add.graphics().setDepth(11);
      this.effect = this.add.sprite(0, 0, "yz-effects", 0).setOrigin(0).setDepth(1700).setVisible(false);
      this.dust = this.add.graphics().setDepth(999);
      this.pathGuide = this.add.graphics().setDepth(13);
      this.water = this.add.graphics().setDepth(9);
      this.weather = this.add.graphics().setDepth(4000);
      this.dusk = this.add.image(0,0,"yz-map-night-field").setOrigin(0).setDepth(5000).setAlpha(0);
      this.actorShadow=this.add.ellipse(0,0,12,4,0x3b3725,.25);
      this.actor = this.add.sprite(0, 0, "yz-people", 1).setOrigin(0).setDepth(1000);
      this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
      this.ready = true;
      this.booted();
      if (this.frame) this.draw(this.frame);
    } catch (error) {
      this.failed(error instanceof Error ? error : new Error(String(error)));
    }
  }

  update(time: number, delta: number) {
    for (const [id, target] of this.npcTargets) {
      const sprite = this.npcSprites.get(id);
      if (!sprite?.visible) continue;
      const next = target.path[0];
      if (!next) {
        if (target.leaving) {
          sprite.setVisible(false);
          this.npcTargets.delete(id);
        } else sprite.setFrame(target.idle);
        continue;
      }
      const dx = next.x-sprite.x, dy = next.y-sprite.y;
      const distance=Math.hypot(dx,dy);
      const speed=.13*Math.min(3,Math.max(1,target.path.length/2));
      const travel=Math.min(distance,Math.min(delta,60)*speed);
      if (travel >= distance) {
        sprite.setPosition(next.x,next.y);
        target.path.shift();
      } else {
        sprite.setPosition(sprite.x+dx*travel/distance,sprite.y+dy*travel/distance);
      }
      const direction=Math.abs(dx)>Math.abs(dy) ? (dx>0?"right":"left") : (dy>0?"down":"up");
      sprite.setDepth(characterDepth((sprite.y+12)/TILE))
        .setFrame((target.row*4+dirs[direction])*3+Math.floor(time/90)%3);
    }
    if (!this.frame) return;
    const camera = this.cameras.main;
    if (!isOutdoorLocation(this.frame.state.location)) {
      const zoom = Math.min(camera.width / 236, camera.height / 212);
      if (camera.zoom !== zoom) camera.setZoom(zoom);
      camera.centerOn(250, 200);
      return;
    }
    // Keep the viewport inside the authored map even on ultrawide windows.
    const zoom = Math.max(RENDER_SCALE, camera.width / WIDTH, camera.height / HEIGHT);
    if (camera.zoom !== zoom) camera.setZoom(zoom);
    const halfView = camera.width / (2 * zoom);
    const playerX = (this.frame.position.x + .5) * TILE;
    const followingX = (this.frame.camera.x + .5) * TILE;
    const centerX = playerX <= halfView ? halfView : playerX >= WIDTH-halfView ? WIDTH-halfView : followingX;
    camera.centerOn(
      Phaser.Math.Clamp(centerX, halfView, WIDTH-halfView),
      (this.frame.camera.y + 0.5) * TILE,
    );
  }

  pickTile(clientX: number, clientY: number) {
    const bounds = this.game.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    const u = (clientX - bounds.left) / bounds.width;
    const v = (clientY - bounds.top) / bounds.height;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return null;

    const camera = this.cameras.main;
    const point = camera.getWorldPoint(u * camera.width, v * camera.height);
    const x = Math.floor(point.x / TILE);
    const y = Math.floor(point.y / TILE);
    return x >= 0 && x < WORLD.width && y >= 0 && y < WORLD.height ? { x, y, world: { x: point.x, y: point.y } } : null;
  }

  private changeLocation(location: GameLocation, minutes: number) {
    this.lastLocation = location;
    this.propState = "";
    this.npcClock = undefined;
    this.npcTargets.clear();
    for (const sprite of this.npcSprites.values()) sprite.setVisible(false);
    this.lastFarmSignature = "";
    const field = location === "field";
    const camera = this.cameras.main;
    if (!isOutdoorLocation(location)) {
      camera.removeBounds().setBackgroundColor("#24282a");
    } else {
      camera.setBounds(0, 0, WIDTH, HEIGHT).setBackgroundColor("#86b07a");
    }
    if(isOutdoorLocation(location))this.dusk.setTexture("yz-map-night-"+location);
    this.farm.setVisible(field);
    this.highlight.setVisible(field);
    this.crops.forEach(crop => crop.setVisible(false));
    this.soil.forEach(tile => tile.setVisible(false));
    for (const prop of this.mapProps) prop.destroy();
    this.mapProps = [];
    if (isOutdoorLocation(location)) {
      const key = "yz-zone-" + location;
      if (!this.textures.exists(key)) {
        const art = Object.fromEntries(Object.keys(outdoorSources).filter(id=>id!=="petak").map(id =>
          [id,this.textures.get("yz-map-"+id).getSourceImage() as HTMLImageElement]));
        this.textures.addCanvas(key,makeCanvas(ctx => drawModularGround(ctx,location,art)));
      }
      this.background.setTexture(key).setDisplaySize(WIDTH, HEIGHT);
      this.mapProps = outdoorObjects(location,minutes).map(prop =>
        this.add.image(prop.x,prop.y,"yz-map-"+prop.asset)
          .setOrigin(.5,1).setScale(prop.scale ?? 1).setDepth(1000 + prop.y - TILE));
    } else {
      const key=isResidentHome(location) ? location : location==="home" ? (minutes>=18*60 ? "yz-home-evening" : "yz-home-day") :
        location==="warung" ? "yz-warung" : "yz-shed";
      this.background.setTexture(key).setDisplaySize(480, HEIGHT);
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
      if (plot) {
        if (!this.soil[i]) this.soil[i] = this.add.sprite(px,py,"yz-petak",0).setOrigin(0).setDepth(9);
        this.soil[i].setFrame(plotTextureFrame(x,y,plot.watered,plot.stage)).setVisible(true);
        if (plot.stage >= 0) {
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
      if (!plot) this.soil[i]?.setVisible(false);
      if (!plot || plot.stage < 0) {
        if (this.crops[i]) this.crops[i].setVisible(false);
      }
      i++;
    }
  }

  private drawNPCs(frame: FieldFrame) {
    const state=frame.state;
    const previous=this.npcClock;
    const continuous=previous && previous.location===state.location && previous.day===state.day &&
      state.minutes>=previous.minutes && state.minutes-previous.minutes<=30;
    if (!continuous) {
      this.npcTargets.clear();
      for(const sprite of this.npcSprites.values())sprite.setVisible(false);
    }
    // Consume every scheduled tile, even when one farm action advances several minutes.
    const first=continuous && !frame.reducedMotion ? Math.min(state.minutes,previous.minutes+1) : state.minutes;
    for(let minute=first;minute<=state.minutes;minute++){
      const seen=new Set<string>();
      for(const npc of npcHere(minute===state.minutes?state:{...state,minutes:minute})){
        seen.add(npc.id);
        const x=npc.x*TILE-2, y=npc.y*TILE-12;
        const row=npcRows[npc.id]??0;
        const dx=frame.position.x-npc.x, dy=frame.position.y-npc.y;
        const dir=Math.abs(dx)+Math.abs(dy)>2 ? "down" : Math.abs(dx)>Math.abs(dy) ?
          (dx<0?"left":"right") : (dy<0?"up":"down");
        const idle=(row*4+dirs[dir])*3+1;
        let sprite=this.npcSprites.get(npc.id);
        if(!sprite){
          sprite=this.add.sprite(x,y,"yz-people",idle).setOrigin(0);
          this.npcSprites.set(npc.id,sprite);
        }
        let target=this.npcTargets.get(npc.id);
        if(!target || target.leaving || frame.reducedMotion){
          sprite.setPosition(x,y).setDepth(characterDepth(npc.y)).setFrame(idle).setVisible(true);
          target={row,idle,path:[],leaving:false};
          this.npcTargets.set(npc.id,target);
        }else{
          const tail=target.path[target.path.length-1]??sprite;
          if(tail.x!==x || tail.y!==y)target.path.push({x,y});
          target.idle=idle;
        }
      }
      for(const [id,target] of this.npcTargets)if(!seen.has(id))target.leaving=true;
    }
    this.npcClock={day:state.day,minutes:state.minutes,location:state.location};
  }

  draw(frame: FieldFrame) {
    this.frame = frame;
    if (!this.ready) return;
    const location = frame.state.location;
    const evening = frame.state.minutes >= 18*60;
    if (this.lastLocation !== location) {
      if (this.lastLocation && !frame.reducedMotion) {
        this.cameras.main.fadeEffect.start(false, 260, 31, 46, 33, true);
      }
      this.changeLocation(location, frame.state.minutes);
    }
    if (location === "home") this.background.setTexture(evening ? "yz-home-evening" : "yz-home-day");
    if (location === "field") {
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
    const propState=location+":"+Number(frame.state.minutes>=720 && frame.state.minutes<1140)+":"+Number(!!frame.state.sluiceOpen);
    if ((location === "pasar" || location === "sungai") && propState!==this.propState) outdoorObjects(location,frame.state.minutes,frame.state.sluiceOpen).forEach((prop,index) => {
      const sprite = this.mapProps[index];

      if (sprite && sprite.texture.key !== "yz-map-"+prop.asset) sprite.setTexture("yz-map-"+prop.asset);
    });
    this.propState=propState;
    const route = frame.route ?? [];
    const pathKey = route.length ? location + ":" + frame.state.player.x + "," + frame.state.player.y +
      ":" + route.join(",") : "";
    if (pathKey !== this.pathKey) {
      this.pathKey = pathKey;
      this.pathGuide.clear().fillStyle(0xffedbc,.75);
      let point = frame.state.player;
      for (const dir of route) {
        point = {...facing({...point,dir}),dir};
        this.pathGuide.fillRect(point.x*TILE+9,point.y*TILE+13,3,2);
      }
      if (route.length) this.pathGuide.lineStyle(1,0xffedbc,.9)
        .strokeRect(point.x*TILE+6,point.y*TILE+9,9,9);
    }
    this.drawNPCs(frame);
    this.dust.clear();
    if (frame.dust && isOutdoorLocation(location)) {
      const { x, y, dir, phase } = frame.dust;
      const trailX = Number(dir === "left") - Number(dir === "right");
      const trailY = Number(dir === "up") - Number(dir === "down");
      this.dust.fillStyle(0xdec387, 0.8 * (1 - phase));
      for (let i = 0; i < 3; i++) {
        const drift = (3 + i * 2) * phase;
        this.dust.fillRect(
          Math.round(x * TILE + 10 + trailX * (2 + drift) + (i - 1) * 2),
          Math.round(y * TILE + 17 + trailY * drift - drift * 0.65),
          i === 1 ? 2 : 1, 1,
        );
      }
    }
    const actorRow = dirs[frame.position.dir];
    let texture="yz-people", spriteFrame=actorRow*3+1, x=frame.position.x*TILE-2, y=frame.position.y*TILE-12;
    if (frame.action && frame.action.use.origin.x === frame.state.player.x &&
        frame.action.use.origin.y === frame.state.player.y) {
      const actionRow = { hoe:0, seed:1, water:2, harvest:3 }[frame.action.use.tool];
      texture="yz-actions";spriteFrame=(actionRow*4 + actorRow)*3+frame.action.frame;
      x=frame.position.x*TILE-14;y=frame.position.y*TILE-23;
    } else if (frame.weight) {
      texture="yz-turns";spriteFrame=frame.weight.row*3+frame.weight.column;
      x=frame.position.x*TILE-6+frame.weight.shiftX;y=frame.position.y*TILE-20+frame.weight.shiftY;
    } else if (frame.pose !== null) {
      texture="yz-gaits";spriteFrame=(actorRow+(frame.running ? 4:0))*6+frame.pose;
      x=frame.position.x*TILE-6;y=frame.position.y*TILE-18;
    }
    const footX=frame.position.x*TILE+TILE/2;
    const footY=(frame.position.y+1)*TILE;
    this.actorShadow.setPosition(footX,footY-2).setDepth(characterDepth(frame.position.y));
    // Fade only tall scenery that would cover the avatar from head to feet.
    for(const prop of this.mapProps){
      if(prop.displayHeight<39)continue;
      const obscured = footY<prop.y && footY>prop.y-prop.displayHeight+10 &&
        Math.abs(footX-prop.x)<prop.displayWidth*.34;
      prop.setAlpha(obscured?.65:1);
    }
    this.actor.setTexture(texture, Math.max(0,spriteFrame))
      .setPosition(x, y)
      .setDepth(characterDepth(frame.position.y) + 1);
    if (frame.action && frame.action.effect >= 0) {
      const effectRow={hoe:0,seed:1,water:2,harvest:3}[frame.action.use.tool];
      this.effect.setPosition(frame.action.use.target.x*TILE+2,frame.action.use.target.y*TILE+1)
        .setFrame(effectRow*4+frame.action.effect).setVisible(true);
    } else this.effect.setVisible(false);
    const waterKey = location + ":" + frame.ambient + ":" + !!frame.state.sluiceOpen;
    if (waterKey !== this.waterKey) {
      this.waterKey = waterKey;
      this.water.clear().fillStyle(0xa2d0bb,.64);
      for (const [x,y,width] of waterRipples(location,frame.ambient,frame.state.sluiceOpen)) this.water.fillRect(x,y,width,1);
    }
    const dusk=Math.max(0,Math.min(1,(frame.state.minutes-960)/120));
    this.dusk.setAlpha(!isOutdoorLocation(location) ? 0 : dusk);
    const rainFrame = isOutdoorLocation(location) &&
      weatherForDay(frame.state.day) === "hujan" ? frame.ambient : null;
    if (this.lastRainFrame !== rainFrame) {
      this.lastRainFrame = rainFrame;
      this.weather.clear();
      if (rainFrame !== null) {
        this.weather.fillStyle(0xbce2f2,.63);
        for (let i=0;i<44;i++) {
          const px=(i*79+rainFrame*7)%WIDTH;
          const py=(i*47+rainFrame*11)%HEIGHT;
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
        pickTile: (x, y) => scene.pickTile(x, y),
        destroy: () => { game?.destroy(true); }
      });
    }, fail);
    try {
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        backgroundColor: "#86b07a",
        render: { smoothPixelArt: true, roundPixels: false },
        audio: { noAudio: true },
        scale: { mode: Phaser.Scale.EXPAND, width: VIEW_WIDTH, height: VIEW_HEIGHT },
        scene: [scene]
      });
    } catch (error) {
      fail(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
