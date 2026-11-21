import type { GameState } from "./model";

type Player = GameState["player"];
export const STEP_MS = 150;
export const RUN_STEP_MS = 95;

// The model keeps integer tiles for collision, interaction and saves.
// This path tracks the feet between committed tiles, including corners.
export class WalkPath {
  x: number;
  y: number;
  dir: Player["dir"];
  distance = 0;
  private route: Player[] = [];
  private destination: Player;

  constructor(player: Player) {
    this.x = player.x;
    this.y = player.y;
    this.dir = player.dir;
    this.destination = player;
  }

  aim(player: Player) {
    const delta = Math.abs(player.x-this.destination.x) + Math.abs(player.y-this.destination.y);
    if (delta === 1) this.route.push(player);
    else if (delta > 1) {
      this.route = [];
      this.x = player.x;
      this.y = player.y;
      this.distance = 0;
    }
    this.destination = player;
    if (!this.route.length) this.dir = player.dir;
  }

  get moving() { return this.route.length > 0; }

  advance(elapsed: number, reduced: boolean, stepMs = STEP_MS, nextStep?: () => Player | undefined) {
    // Bound a late frame. Quick discrete taps may briefly queue several tiles.
    // Movement speed must not depend on how many queued waypoints remain.
    // Bound long background-tab stalls without turning a long click route into a sprint.
    let budget = reduced ? Infinity : Math.min(80, Math.max(0, elapsed)) / stepMs;
    // A continuous route can spend the rest of this frame on its next tile.
    while (budget > 0) {
      if (!this.route.length) {
        const next = nextStep?.();
        if (!next) break;
        this.aim(next);
        if (!this.route.length) break;
      }
      const next = this.route[0];
      const dx = next.x-this.x, dy = next.y-this.y;
      const remaining = Math.abs(dx) + Math.abs(dy);
      const travel = Math.min(remaining, budget);
      this.dir = next.dir;
      this.distance += travel;
      if (remaining <= budget) {
        this.x = next.x; this.y = next.y;
        this.route.shift();
      } else {
        this.x += Math.sign(dx)*travel;
        this.y += Math.sign(dy)*travel;
      }
      budget -= travel;
    }
    if (!this.moving) this.dir = this.destination.dir;
  }
}
