import { drawWorld, type WorldArt } from "./draw-world";
import { Footwork } from "./footwork";
import { FieldAudio } from "./field-audio";
import { type Direction, type FarmTool, type GameState } from "./model";
import { WalkPath, STEP_MS, RUN_STEP_MS } from "./walking";

export type ToolUse = {
  tool: FarmTool; started: number; before: GameState["plots"];
  origin: GameState["player"]; target: { x: number; y: number };
};
type Scene = { game: GameState; art: WorldArt; swing: ToolUse | null; runMode: boolean; step: (dir: Direction) => void };
const timings = {
  hoe: [135, 275, 420], seed: [90, 170, 290],
  water: [130, 350, 500], harvest: [115, 225, 365],
} as const;

// React supplies accepted commands and save snapshots. The field clock stages
// their visual contact, camera, sound and effects together on the next paint.
export class FieldEngine {
  readonly audio = new FieldAudio();
  readonly held = new Map<string, Direction>();
  shift = false;
  nextStep = 0;
  private walk?: WalkPath;
  private feet?: Footwork;
  private scuff?: { x: number; y: number; at: number; dir: Direction };
  private lastScene?: Scene;
  private lastTime = 0;
  private lastAmbient = -1;
  private lastHit?: ToolUse;
  private active = false;
  private camera?: {x:number;y:number};

  setShift(value: boolean) { this.shift = value; }
  delayStep(time: number) { this.nextStep = time; }
  reset(player: GameState["player"]) { this.walk = new WalkPath(player); this.camera=undefined; this.feet=new Footwork(player.dir); this.scuff=undefined; }
  aim(player: GameState["player"]) { this.feet ??= new Footwork(player.dir); this.walk ??= new WalkPath(player); this.walk.aim(player); }
  clear() { this.held.clear(); this.shift=false; this.lastTime=0; }

  paint(canvas: HTMLCanvasElement, scene: Scene, now: number, reduced: boolean) {
    const walk=this.walk;
    if (!walk) return;
    const running=scene.runMode || this.shift, stepMs=running?RUN_STEP_MS:STEP_MS;
    if (this.held.size && now>=this.nextStep) {
      const dirs=Array.from(this.held.values());
      scene.step(dirs[dirs.length-1]);
      this.nextStep=(now-this.nextStep>=stepMs?now:this.nextStep)+stepMs;
    }
    const dt=this.lastTime?Math.max(0,Math.min(60,now-this.lastTime)):0;
    this.lastTime=now;
    const wasMoving=walk.moving, stride=running?1.8:1.35;
    const previousBeat=Math.floor(walk.distance*2/stride);
    const before = walk.distance;
    walk.advance(dt,reduced,stepMs);
    const travelled = walk.distance-before;
    const weight = this.feet?.update(now, walk.dir, travelled, running, this.held.size>0 && wasMoving, reduced);
    if (wasMoving && previousBeat!==Math.floor(walk.distance*2/stride)) {
      this.audio.hit(walk.y>=5 && walk.y<7?"langkah-batu":"langkah-tanah",running?.35:.23);
      if (running && walk.y>=7 && !reduced) this.scuff={ x:walk.x, y:walk.y, at:now, dir:walk.dir };
    }
    const dust = this.scuff && now-this.scuff.at < 140 && !reduced
      ? { ...this.scuff, phase:(now-this.scuff.at)/140 } : undefined;
    const phase=walk.distance/stride;
    const pose=!reduced && (walk.moving || (wasMoving && this.held.size)) ? Math.floor(phase*6)%6 : null;
    const swing=scene.swing, age=swing?now-swing.started:Infinity;
    const [impact,recovery,end]=timings[swing?.tool??"hoe"];
    if (swing && age>=impact && this.lastHit!==swing) {
      this.lastHit=swing;
      if (age<end) this.audio.hit(swing.tool,.56);
    }
    const visible=swing && age<end && !reduced;
    const action=visible ? { use:swing, frame:age<impact?0:age<recovery?1:2,
      effect:age<impact?-1:Math.min(3,Math.floor((age-impact)*4/(end-impact))) } : undefined;
    const camera=this.camera??={x:walk.x,y:walk.y};
    const previousX=camera.x,previousY=camera.y;
    // Small dead zone keeps the scenery still during a short step or reversal.
    const follow=(c:number,p:number,zone:number)=> c+Math.sign(p-c)*Math.max(0,Math.abs(p-c)-zone)*(reduced?1:1-Math.exp(-dt/48));
    camera.x=follow(camera.x,walk.x,.65);camera.y=follow(camera.y,walk.y,.45);
    const pan=Math.abs(camera.x-previousX)+Math.abs(camera.y-previousY)>.001;
    const ambient=reduced?0:Math.floor(now/170);
    const active=wasMoving || !!action || !!weight || !!dust || pan;
    if (active || this.active || scene!==this.lastScene || ambient!==this.lastAmbient) {
      drawWorld(canvas,scene.game,scene.art,walk,pose,running,action,camera,ambient,
        swing && age<impact && !reduced?swing.before:scene.game.plots,weight,dust);
      if (ambient!==this.lastAmbient || scene!==this.lastScene) this.audio.mix(walk.x,walk.y,scene.game.minutes);
    }
    this.lastScene=scene;this.lastAmbient=ambient;this.active=active;
  }
}
