/** Canonical public URLs for concept-only Bandung portraits (not dialogue expression sprites).
 * Keep category mapping synchronized with game-assets/library and its integrity test.
 */
const GROUPS: ReadonlyArray<readonly [RegExp,string]> = [
  [/^R\d{3}$/, "residents"],
  [/^K\d{2}$/, "neighborhood"],
  [/^N\d{2}$/, "specialists"],
  [/^P\d{2}$/, "civic"],
  [/^work-[AC]\d{2}$/, "professions"],
  [/^phone-[AC]\d{2}$/, "phone"],
];
export function bandungConceptPortraitGroup(id: string): string | null {
  return GROUPS.find(([pattern]) => pattern.test(id))?.[1] ?? null;
}
export function bandungConceptPortraitPath(id: string): string {
  const group=bandungConceptPortraitGroup(id);
  if(!group) throw new Error("Unknown Bandung concept portrait ID: "+id);
  return "/game/assets/portraits/bandung/"+group+"/"+id+".png";
}
