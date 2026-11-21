/** Legacy lore is *not* owned by a new citizen just because the numeric ID overlaps. */
import type {ResidentProfile} from "./resident-profile";
export function approvedLegacyId(person:Pick<ResidentProfile,"id"|"legacyId"|"legacyApproved">):string|null{
 return person.legacyApproved===true&&typeof person.legacyId==="string"&&person.legacyId.length>0
 ?person.legacyId:null;
}
export function legacyNpcDisplayName(oldId:string,oldName:string,residents:readonly ResidentProfile[]):string{
 const linked=residents.find(r=>approvedLegacyId(r)===oldId);
 return linked?.name??oldName;
}

/** Nameplate/image only, NOT approval to migrate bonds, family ties or quest history.
 * Safe for the small live prototype cast when BOTH name stem and job match the
 * owner-supplied current roster. Any mismatch must remain quarantined.
 */
export function conservativeDisplayMatch(
 oldNpc:{id:string;name:string;role:string},
 residents:readonly ResidentProfile[]
):ResidentProfile|null{
 const citizen=residents.find(r=>r.id===oldNpc.id);
 if(!citizen||citizen.occupation!==oldNpc.role)return null;
 const first=citizen.name.trim().split(/\s+/)[0].toLocaleLowerCase("id");
 return oldNpc.name.trim().toLocaleLowerCase("id")===first?citizen:null;
}
