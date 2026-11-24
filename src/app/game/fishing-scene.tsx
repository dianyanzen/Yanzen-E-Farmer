"use client";

/** Only text and the cancellation control are HTML. Actor, pole, line,
 * bobber, ripples and fish notifications render in WORLD coordinates.
 * DOM sprites in the viewport's center would detach from Yanzen's hands.
 */
import {fishingPhaseLabel,type FishingPhase} from "@/lib/game/fishing-session";

export function FishingScene({phase,onCancel}:{phase:FishingPhase;onCancel:()=>void}){
  const label=fishingPhaseLabel(phase);
  return <div className={"yzg-fishing-scene yzg-fishing-"+phase}
    aria-label="Memancing di sungai" role="status" aria-live="polite">
    <button className="yzg-fishing-cancel" type="button" onClick={onCancel}>Angkat joran</button>
    <div className="yzg-fishing-message">
      <strong>{label.main}</strong>
      <small>{label.hint}</small>
    </div>
  </div>;
}
