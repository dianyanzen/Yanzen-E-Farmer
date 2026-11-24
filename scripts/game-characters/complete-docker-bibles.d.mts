import type {CharacterBible} from "../../src/lib/game/phone-profiles";
export function loadLegacyFiction():{
 characters:unknown[];traits:Array<{karakter_id:string;jenis:string;isi:string}>;
 stories:Array<{npc:string;judul:string;premis:string}>;
 routines:Array<{npc:string;kondisi:string;jam:string;kelurahan:string;aktivitas:string}>;
};
export function makeCompleteDockerBibles(
 roster:ReadonlyArray<{id:string;name:string;occupation:string;portrait:string}>,
 known:Map<string,{id:string;name:string;occupation:string}>,
 legacy?:ReturnType<typeof loadLegacyFiction>
):Record<string,CharacterBible>;
