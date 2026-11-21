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
