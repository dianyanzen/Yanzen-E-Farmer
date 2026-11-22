import {Composition} from "remotion";
import {SluiceGateFilm} from "./sluice-gate";
export const SLUICE_FRAMES = 330;
export function Root(){return <Composition id="SluiceGate" component={SluiceGateFilm} durationInFrames={SLUICE_FRAMES} fps={30} width={960} height={540}/>;}
