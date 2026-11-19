import type { Direction } from "./model";

const headings: Record<Direction, number> = { down: 0, left: 2, up: 4, right: 6 };
export type WeightPose = { row: number; column: number; shiftX: number; shiftY: number };

// Body heading is visual. Collision and the tool target retain their cardinal direction.
export class Footwork {
  private angle: number;
  private target: number;
  private startAngle: number;
  private turnAt = -Infinity;
  private turnDuration = 0;
  private lastTravel = -Infinity;
  private launchAt = -Infinity;
  private ran = false;

  constructor(dir: Direction) {
    this.angle = this.target = this.startAngle = headings[dir];
  }

  update(now: number, dir: Direction, travelled: number, run: boolean, held: boolean, reduced: boolean): WeightPose | undefined {
    const heading = headings[dir];
    if (reduced) {
      this.angle = this.target = heading;
      this.lastTravel = this.launchAt = this.turnAt = -Infinity;
      return;
    }
    if (heading !== this.target) {
      let arc = (heading - this.angle + 12) % 8 - 4;
      // A half turn passes through one side profile. Keep the same arc if
      // the player redirects input before a previous turn has finished.
      if (arc === -4 && this.target >= this.startAngle) arc = 4;
      this.startAngle = this.angle;
      this.target = heading;
      this.turnDuration = Math.max(55, Math.abs(arc) * (run ? 31 : 28));
      this.angle = heading - arc;
      this.startAngle = this.angle;
      this.turnAt = now;
    }
    const turn = (now-this.turnAt) / (this.turnDuration || 1);
    this.angle = turn < 1 ? this.startAngle+(this.target-this.startAngle)*turn : this.target;
    const row = (Math.round(this.angle)%8+8)%8;
    if (travelled > 0) {
      if (now-this.lastTravel > 110) this.launchAt = now;
      this.lastTravel = now;
      this.ran = run;
    }
    const stop = now-this.lastTravel;
    let column: number, weight: number;
    if (turn < 1) {
      column = 1;
      weight = Math.sin(Math.PI*turn)*1.5;
    } else if (now-this.launchAt < 54 && travelled > 0) {
      column = 0;
      weight = -(1-(now-this.launchAt)/54)*1.5;
    } else if (travelled === 0 && !held && stop < (this.ran ? 112 : 58)) {
      column = 2;
      weight = (this.ran ? 2 : 1)*(1-stop/(this.ran ? 112 : 58));
    } else return;
    return { row, column, shiftX: Math.round(-Math.sin(this.angle*Math.PI/4)*weight),
      shiftY: Math.round(Math.cos(this.angle*Math.PI/4)*weight) };
  }
}
