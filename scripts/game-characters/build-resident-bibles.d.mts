import type {CharacterBible} from "../../src/lib/game/phone-profiles";
export function draftResidentBible(
 row:{id:string;name:string;occupation:string;portrait:string},
 revision?:boolean
):CharacterBible;
export function makePublishedResidentBibles(
 roster:ReadonlyArray<{id:string;name:string;occupation:string;portrait:string}>,
 known:Map<string,{id:string;name:string;occupation:string}>
):Record<string,CharacterBible>;
