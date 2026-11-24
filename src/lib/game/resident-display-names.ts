import type {ResidentProfile} from "./resident-profile";
/** Keep displayed NPC names synchronized by stable ID, without rewriting saves. */
export function applyResidentNames(
 text:string,
 npcs:readonly {id:string;name:string}[],
 residents:readonly ResidentProfile[]
):string{
 const published=new Map(residents.map(row=>[row.id,row.name]));
 const substitutions=new Map<string,string>(npcs.map(npc=>
  [npc.name,published.get(npc.id)??npc.name] as const
 ).filter(([oldName,newName])=>oldName!==newName));
 if(!substitutions.size)return text;
 const quote=(s:string)=>s.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&");
 const names=[...substitutions.keys()].sort((a,b)=>b.length-a.length).map(quote).join("|");
 const pattern=new RegExp("(?<![\\p{L}\\p{N}])("+names+")(?![\\p{L}\\p{N}])","gu");
 return text.replace(pattern,found=>substitutions.get(found)??found);
}
