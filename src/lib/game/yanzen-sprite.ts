import type { ActivityFrame } from "./character-activities";
import type { FieldFrame } from "./field-engine";
import type { fishingGeometry } from "./fishing-visuals";
import { WORLD } from "./model";

const rows = { down: 0, left: 1, right: 2, up: 3 } as const;

type PlayerMotion = Pick<FieldFrame, "state" | "position" | "pose" | "running" | "weight" | "action">;
type HeldProp = { key: string; x: number; y: number; angle?: number };
type PlayerSprite = { x: number; y: number; prop?: HeldProp } & (
  { source: "asset"; key: string } |
  { source: "people" | "gaits" | "turns"; row: number; column: number; width: number; height: number }
);

const farmHands = {
  hoe: [[18,13],[20,21],[17,19]],
  seed: [[15,17],[19,22],[18,18]],
  water: [[18,16],[19,20],[19,19]],
  harvest: [[15,22],[18,23],[17,17]],
} as const;

/** Both renderers place the same body at the same world-space anchor. */
export function yanzenSprite(
  { state, position, pose, running, weight, action }: PlayerMotion,
  activity?: ActivityFrame,
  fish?: ReturnType<typeof fishingGeometry>,
): PlayerSprite {
  const point = activity?.anchor ?? position;
  const x = Math.round(point.x * WORLD.tile);
  const y = Math.round(point.y * WORLD.tile);
  const atom = { source: "asset", x: x - 2, y: y - 12 } as const;
  if (activity) {
    const prop = activity.propKey ? { key: activity.propKey, x: atom.x, y: atom.y } : undefined;
    return { ...atom, key: activity.key, prop };
  }
  if (fish) return { ...atom, key: `fish-${position.dir}-${fish.spriteFrame + 1}` };
  if (action && action.use.origin.x === state.player.x && action.use.origin.y === state.player.y) {
    const { tool, origin } = action.use;
    const index = action.frame as 0 | 1 | 2;
    const [handX, handY] = farmHands[tool][index];
    const x = origin.dir === "left" ? 24 - handX : handX;
    const y = handY - (origin.dir === "up" ? 2 : 0);
    const angle = (origin.dir === "left" ? -1 : 1) * (index - 1) * (tool === "hoe" ? 0.65 : 0.25);
    return { ...atom, key: `${tool}-${origin.dir}-${index + 1}`,
      prop: tool === "harvest" && index === 0 ? undefined :
        { key: `held-${tool}`, x: atom.x + x, y: atom.y + y, angle } };
  }
  if (weight) {
    return { source: "turns", row: weight.row, column: weight.column, width: 32, height: 40,
      x: x - 6 + weight.shiftX, y: y - 20 + weight.shiftY };
  }
  if (pose !== null) {
    return { source: "gaits", row: rows[position.dir] + (running ? 4 : 0), column: pose,
      width: 32, height: 40, x: x - 6, y: y - 18 };
  }
  return { source: "people", row: rows[position.dir], column: 1, width: 24, height: 32, x: atom.x, y: atom.y };
}
