/** On-demand Character Bible. A citizen's private notes load only when their detail is opened.
 * No HTTP AI service, prompt injection, or runtime editing of narrative is involved.
 */
export type CharacterBible = {
  id:string; approval:string; characterClass:string;
  sections: {
    "01_core_identity": {name:string; ageYears:number|null; origin?:string;language?:string;identity?:string};
    "02_physical_appearance": {general?:string;visualDirection?:string;physicalTraits?:string};
    "03_fashion_aesthetic": {signatureClothing?:string;clothing?:string};
    "04_social_profile": {occupation?:string;storyRole?:string;hobbies?:string[];communityActivity?:string;communityParticipation?:string};
    "05_personality": {traits?:string[];habit?:string;observableHabit?:string;values?:string;weakness?:string;flaw?:string};
    "06_psychological_profile": {primaryMotivation?:string;motivation?:string;fear?:string;innerConflict?:string;privateMotivation?:string};
    "07_background_history": {familyContext?:string;formativeMemory?:string;personalFamily?:string;narrativeBackground?:string};
    "08_relationship_dynamics": {connections?:Array<{characterId:string;relationship?:string;description?:string}>;scriptedConnection?:Array<{characterId:string;description:string}>;personalBoundary?:string;boundary?:string};
    "09_dialogue_behavior": {speechSignature?:string;speechPattern?:string;scriptedSpeakingStyle?:string;sampleLine?:string;habitualGesture?:string;physicalCue?:string};
    "10_narrative_development": {storyArc?:string;arcTitle?:string;threeActBeats?:string[];implementation?:string};
    "11_visual_references": {portraitExpressionSheet?:string;conceptPortrait?:string;professionConcept?:string;visualContinuity?:string};
    "12_continuity_current_state": {availability?:string;prototypePresence?:string;playerDependentState?:string};
  };
};
const loaders: Record<string,()=>Promise<{default:unknown}>> = {
  A01: () => import("../../../game-assets/characters/profiles/core/A01.json"),
  A02: () => import("../../../game-assets/characters/profiles/core/A02.json"),
  A03: () => import("../../../game-assets/characters/profiles/core/A03.json"),
  A04: () => import("../../../game-assets/characters/profiles/core/A04.json"),
  A05: () => import("../../../game-assets/characters/profiles/core/A05.json"),
  A06: () => import("../../../game-assets/characters/profiles/core/A06.json"),
  A07: () => import("../../../game-assets/characters/profiles/core/A07.json"),
  A08: () => import("../../../game-assets/characters/profiles/core/A08.json"),
  A09: () => import("../../../game-assets/characters/profiles/core/A09.json"),
  A10: () => import("../../../game-assets/characters/profiles/core/A10.json"),
  A11: () => import("../../../game-assets/characters/profiles/core/A11.json"),
  A12: () => import("../../../game-assets/characters/profiles/core/A12.json"),
  A13: () => import("../../../game-assets/characters/profiles/core/A13.json"),
  A14: () => import("../../../game-assets/characters/profiles/core/A14.json"),
  A15: () => import("../../../game-assets/characters/profiles/core/A15.json"),
  A16: () => import("../../../game-assets/characters/profiles/core/A16.json"),
  C01: () => import("../../../game-assets/characters/profiles/core/C01.json"),
  C02: () => import("../../../game-assets/characters/profiles/core/C02.json"),
  C03: () => import("../../../game-assets/characters/profiles/core/C03.json"),
  C04: () => import("../../../game-assets/characters/profiles/core/C04.json"),
  C05: () => import("../../../game-assets/characters/profiles/core/C05.json"),
  C06: () => import("../../../game-assets/characters/profiles/core/C06.json"),
  C07: () => import("../../../game-assets/characters/profiles/core/C07.json"),
  C08: () => import("../../../game-assets/characters/profiles/core/C08.json"),
  C09: () => import("../../../game-assets/characters/profiles/core/C09.json"),
  C10: () => import("../../../game-assets/characters/profiles/core/C10.json"),
  C11: () => import("../../../game-assets/characters/profiles/core/C11.json"),
  C12: () => import("../../../game-assets/characters/profiles/core/C12.json"),
  C13: () => import("../../../game-assets/characters/profiles/core/C13.json"),
  C14: () => import("../../../game-assets/characters/profiles/core/C14.json"),
  C15: () => import("../../../game-assets/characters/profiles/core/C15.json"),
  C16: () => import("../../../game-assets/characters/profiles/core/C16.json"),
  K01: () => import("../../../game-assets/characters/profiles/expansion/K01.json"),
  K02: () => import("../../../game-assets/characters/profiles/expansion/K02.json"),
  K03: () => import("../../../game-assets/characters/profiles/expansion/K03.json"),
  K04: () => import("../../../game-assets/characters/profiles/expansion/K04.json"),
  K05: () => import("../../../game-assets/characters/profiles/expansion/K05.json"),
  K06: () => import("../../../game-assets/characters/profiles/expansion/K06.json"),
  K07: () => import("../../../game-assets/characters/profiles/expansion/K07.json"),
  K08: () => import("../../../game-assets/characters/profiles/expansion/K08.json"),
  K09: () => import("../../../game-assets/characters/profiles/expansion/K09.json"),
  K10: () => import("../../../game-assets/characters/profiles/expansion/K10.json"),
  K11: () => import("../../../game-assets/characters/profiles/expansion/K11.json"),
  K12: () => import("../../../game-assets/characters/profiles/expansion/K12.json"),
  K13: () => import("../../../game-assets/characters/profiles/expansion/K13.json"),
  K14: () => import("../../../game-assets/characters/profiles/expansion/K14.json"),
  K15: () => import("../../../game-assets/characters/profiles/expansion/K15.json"),
  K16: () => import("../../../game-assets/characters/profiles/expansion/K16.json"),
  K17: () => import("../../../game-assets/characters/profiles/expansion/K17.json"),
  K18: () => import("../../../game-assets/characters/profiles/expansion/K18.json"),
  K19: () => import("../../../game-assets/characters/profiles/expansion/K19.json"),
  K20: () => import("../../../game-assets/characters/profiles/expansion/K20.json"),
  K21: () => import("../../../game-assets/characters/profiles/expansion/K21.json"),
  K22: () => import("../../../game-assets/characters/profiles/expansion/K22.json"),
  K23: () => import("../../../game-assets/characters/profiles/expansion/K23.json"),
  K24: () => import("../../../game-assets/characters/profiles/expansion/K24.json"),
  K25: () => import("../../../game-assets/characters/profiles/expansion/K25.json"),
  K26: () => import("../../../game-assets/characters/profiles/expansion/K26.json"),
  K27: () => import("../../../game-assets/characters/profiles/expansion/K27.json"),
  K28: () => import("../../../game-assets/characters/profiles/expansion/K28.json"),
  K29: () => import("../../../game-assets/characters/profiles/expansion/K29.json"),
  K30: () => import("../../../game-assets/characters/profiles/expansion/K30.json"),
  N01: () => import("../../../game-assets/characters/profiles/expansion/N01.json"),
  N02: () => import("../../../game-assets/characters/profiles/expansion/N02.json"),
  N03: () => import("../../../game-assets/characters/profiles/expansion/N03.json"),
  N04: () => import("../../../game-assets/characters/profiles/expansion/N04.json"),
  N05: () => import("../../../game-assets/characters/profiles/expansion/N05.json"),
  N06: () => import("../../../game-assets/characters/profiles/expansion/N06.json"),
  P01: () => import("../../../game-assets/characters/profiles/expansion/P01.json"),
  P02: () => import("../../../game-assets/characters/profiles/expansion/P02.json"),
};
export const CHARACTER_BIBLE_IDS=Object.keys(loaders);
export async function loadCharacterBible(id:string):Promise<CharacterBible|null>{
 const load=loaders[id];
 if(!load)return null;
 const loadedModule=await load();
 const profile=loadedModule.default as CharacterBible;
 if(profile?.id!==id)throw new Error("Character profile mismatch for "+id);
 return profile;
}
