/** Pure, testable fishing timing and probabilities. No timers/DOM/save writes here. */
export const FISHING_CAST_MS=560;
export const FISHING_BITE_WINDOW_MS=1700;
export const FISHING_REEL_MS=1750;
export const FISHING_WAIT_MIN_MS=4800;
export const FISHING_WAIT_SPAN_MS=4400;
export const FISHING_BITE_CHANCE=.8;
export const FISHING_LAND_CHANCE=.7;
export type FishingPhase="casting"|"waiting"|"bite"|"reeling";
export type FishingSpecies="lele"|"nila";
export type FishingPlan={waitMs:number;willBite:boolean;species:FishingSpecies};
function probability(n:number):boolean{
  return Number.isFinite(n)&&n>=0&&n<1;
}
export function planFishingSession(waitRoll:number,biteRoll:number,speciesRoll:number):FishingPlan{
  if(![waitRoll,biteRoll,speciesRoll].every(probability))throw new Error("Invalid fishing randomness");
  return {waitMs:FISHING_WAIT_MIN_MS+Math.floor(waitRoll*FISHING_WAIT_SPAN_MS),
    willBite:biteRoll<FISHING_BITE_CHANCE,
    species:speciesRoll<.55?"lele":"nila"};
}
export function fishingCatchSucceeds(roll:number):boolean{
  if(!probability(roll))throw new Error("Invalid catch randomness");
  return roll<FISHING_LAND_CHANCE;
}
export function fishingPhaseLabel(phase:FishingPhase):{main:string;hint:string}{
  switch(phase){
    case "casting":return {main:"Kail meluncur ke sungai…",hint:"Yanzen sedang melempar joran."};
    case "waiting":return {main:"Pelampung mengapung tenang.",hint:"Tunggu sampai ada sambaran. Jangan buru-buru menarik."};
    case "bite":return {main:"Pelampung tenggelam!",hint:"Cepat! Tekan A atau E sekarang."};
    case "reeling":return {main:"Senar menegang…",hint:"Yanzen sedang menarik ikan. Semoga tidak lepas."};
  }
}
