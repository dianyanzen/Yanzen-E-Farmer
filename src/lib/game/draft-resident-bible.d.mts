export interface DraftResident {
 id:string;name:string;occupation:string;portrait:string;
}
export interface DraftBible {
 id:string;
 approval:string;
 sections:{
 "01_core_identity":{name:string;ageYears:null};
 "02_physical_appearance":{general:string};
 "03_fashion_aesthetic":{signatureClothing:string};
 "04_social_profile":{occupation:string;communityActivity:string};
 "05_personality":{traits:string[];observableHabit:string};
 "06_psychological_profile":{innerConflict:string};
 "07_background_history":{formativeMemory:string};
 "08_relationship_dynamics":{connections:Array<{characterId:string;description:string}>};
 "09_dialogue_behavior":{speechPattern:string;sampleLine:string};
 "10_narrative_development":{establishedPremise:string;threeActBeats:string[]};
 "11_visual_references":{conceptPortrait:string};
 "12_continuity_current_state":{availability:string};
 };
}
export function draftResidentBible(row:DraftResident,revision?:boolean):DraftBible;
export function makePublishedResidentBibles(roster:DraftResident[],known:Map<string,{name:string;occupation:string}>):Record<string,DraftBible>;
