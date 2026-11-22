"use client";

import {fishingPhaseLabel,type FishingPhase} from "@/lib/game/fishing-session";
import {FISH_MARKET,type RiverFishId} from "@/lib/game/model";

export function FishingScene({phase}:{phase:FishingPhase}){
  const label=fishingPhaseLabel(phase);
  return <div className={"yzg-fishing-scene yzg-fishing-"+phase} aria-label="Memancing di sungai" role="status" aria-live="polite">
    <div className="yzg-fishing-effect" aria-hidden="true">
      <div className="yzg-fishing-rod"/>
      <div className="yzg-fishing-line"/>
      <div className="yzg-fishing-ring yzg-fishing-ring--one"/>
      <div className="yzg-fishing-ring yzg-fishing-ring--two"/>
      <div className="yzg-fishing-float"><span/></div>
      <div className="yzg-fishing-splash">
        <i/><i/><i/><i/>
      </div>
    </div>
    <div className="yzg-fishing-message">
      <strong>{label.main}</strong>
      <small>{label.hint}</small>
    </div>
  </div>;
}

export function FishingResult({outcome,species}:{
  outcome:"caught"|"escaped"|"early"|"late"|"no_bite"|"cancelled";
  species?:RiverFishId;
}){
  const messages={
    caught:"Dapat ikan!",
    escaped:"Ikannya lepas!",
    early:"Terlalu cepat menarik.",
    late:"Sambarannya terlewat.",
    no_bite:"Belum ada ikan yang menyambar.",
    cancelled:"Joran diangkat kembali."
  };
  return <div className={"yzg-fishing-result yzg-fishing-result--"+outcome} role="status">
    {outcome==="caught"&&species&&<img src={"/game/assets/fish/"+species+".png"} alt={FISH_MARKET[species].name}/>}
    <span>{outcome==="caught"&&species?FISH_MARKET[species].name:messages[outcome]}</span>
  </div>;
}
