/** Immutable cutscene identity and player-facing asset mapping.
 * Scripted story/game state lives in model.ts; videos never mutate saves.
 */
export const PASIRLUYU_SLUICE_CUTSCENE = {
  id:"pasirluyu-sluice",
  title:"Pintu Air Pasirluyu",
  src:"/game/assets/cutscenes/sluice-poster.mp4",
  poster:"/game/assets/cutscenes/sluice-poster.jpg",
  startFrame:"/game/assets/cutscenes/frames/sluice-start.jpg",
  endFrame:"/game/assets/cutscenes/frames/sluice-end.jpg",
  durationSeconds:10,
} as const;

export function pasirluyuCutsceneCaption(seconds:number):string {
  if(seconds<3) return "Yanzen berusaha memutar roda pintu air.";
  if(seconds<5.8) return "Pintu mulai terangkat. Air menemukan jalannya.";
  if(seconds<8.4) return "Aliran kembali deras menuju hilir.";
  return "Akhirnya, saluran air kembali terbuka.";
}
