import cast from "../../../game-assets/catalog/cast.json";

export const PORTRAIT_EMOTIONS = ["neutral", "happy", "sad", "worried", "surprised", "annoyed", "shy", "laughing"] as const;
export type PortraitEmotion = (typeof PORTRAIT_EMOTIONS)[number];
export const EMOTION_LABELS: Record<PortraitEmotion, string> = {
  neutral: "Netral", happy: "Senang", sad: "Sedih", worried: "Khawatir",
  surprised: "Terkejut", annoyed: "Kesal", shy: "Malu", laughing: "Tertawa",
};
export const PORTRAIT_CHARACTERS = cast.characters.map(person => ({
  id: person.id, name: person.name, role: person.role, occupation: person.occupation,
  sheet: "/game/assets/portraits/" + person.id + ".png",
  hobby: person.hobby, personality: person.personality,
}));
export function portraitCharacter(id: string) { return PORTRAIT_CHARACTERS.find(person => person.id === id); }
export function portraitColumn(emotion: string) {
  const column = PORTRAIT_EMOTIONS.indexOf(emotion as PortraitEmotion);
  return column < 0 ? 0 : column;
}
