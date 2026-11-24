/** Read quest prop ids from the authoritative model; no second registry. */
import { QUEST_PROPS } from "./model";
export { QUEST_PROPS, questPropAt } from "./model";
export type { QuestPropId } from "./model";
export type QuestProp = (typeof QUEST_PROPS)[number];
export const questPropById = (id: QuestProp["id"]): QuestProp =>
  QUEST_PROPS.find(p=>p.id===id)!;
