import { isOutdoorLocation, type GameState } from "./model";
import clips from "./audio-clips.json";

type Clip = keyof typeof clips;
const layers = ["kebun", "kanal", "warung-sore"] as const;

export class FieldAudio {
  private ctx?: AudioContext;
  private buffer?: AudioBuffer;
  private loading?: Promise<void>;
  private loops: GainNode[] = [];
  private enabled = true;

  // Create/resume the audio context in a user gesture (including iOS Safari).
  unlock() {
    if (!this.enabled || document.hidden || !window.AudioContext) return;
    const ctx = this.ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    if (!this.loading) this.loading = fetch("/game/assets/audio/pasirluyu.mp3")
      .then(response => { if (!response.ok) throw Error("audio"); return response.arrayBuffer(); })
      .then(data => ctx.decodeAudioData(data)).then(buffer => {
        if (this.ctx !== ctx) return;
        this.buffer = buffer;
        for (const clip of layers) {
          const [offset, length] = clips[clip];
          const source = ctx.createBufferSource(), volume = ctx.createGain();
          volume.gain.value = 0; source.buffer = buffer;
          source.loop = true; source.loopStart = offset; source.loopEnd = offset + length;
          source.connect(volume).connect(ctx.destination); source.start(0, offset);
          this.loops.push(volume);
        }
      }).catch(() => { this.loading = undefined; });
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) this.unlock(); else this.pause();
  }

  pause() {
    if (this.ctx?.state === "running") void this.ctx.suspend().catch(() => {});
  }

  mix(x: number, y: number, state: GameState) {
    if (!this.ctx || !this.enabled) return;
    const {location, minutes}=state;
    const outdoors=isOutdoorLocation(location);
    const bank=location==="field"?1:6;
    const canal=location==="sungai" || location==="field" ? Math.max(0,1-Math.max(0,x-bank)/9) : 0;
    const stall=location==="warung" ? .8 : location==="pasar" && minutes>=720 && minutes<1140 ?
      Math.max(0,1-Math.hypot(x-16,y-9)/12) : 0;
    const levels = [(outdoors ? .15 : .02)*(1-.65*canal)*(1-stall), .3*canal, .22*stall];
    this.loops.forEach((gain,i) => gain.gain.setTargetAtTime(levels[i], this.ctx!.currentTime, .25));
  }

  hit(clip: Clip, volume: number) {
    const ctx=this.ctx;
    if (!ctx || !this.buffer || !this.enabled || ctx.state !== "running") return;
    const source=ctx.createBufferSource(), gain=ctx.createGain();
    source.buffer=this.buffer; gain.gain.value=volume;
    source.connect(gain).connect(ctx.destination); source.start(0,clips[clip][0],clips[clip][1]);
    source.onended=() => { source.disconnect(); gain.disconnect(); };
  }

  dispose() {
    if (this.ctx) void this.ctx.close().catch(() => {});
    this.ctx=undefined; this.buffer=undefined; this.loops=[]; this.loading=undefined;
  }
}
