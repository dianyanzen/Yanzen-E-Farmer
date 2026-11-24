"use client";

/**
 * Warga is the only YZ Phone entry for the 248 canonical fictional citizens.
 * The public Character Bible is always readable; relationship history comes
 * only from the current save and owner-approved legacy associations.
 *
 * Keeping this component name preserves the existing game-client contract.
 */
import PhoneWargapedia from "./phone-wargapedia";
import type {GameState} from "@/lib/game/model";
import type {ResidentProfile} from "@/lib/game/resident-profile";

export default function CharacterGallery({game,residents,selectedId,onSelect}:{
 game:GameState;
 residents:readonly ResidentProfile[];
 selectedId:string|null;
 onSelect:(id:string|null)=>void;
}){
 return <PhoneWargapedia
  game={game} residents={residents} selectedId={selectedId} onSelect={onSelect}/>;
}
