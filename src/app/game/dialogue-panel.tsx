"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { bandungConceptPortraitPath } from "@/lib/game/bandung-concept-portrait";
import type { ResidentProfile } from "@/lib/game/resident-profile";
import NextImage from "next/image";
import { portraitCharacter, portraitColumn, EMOTION_LABELS, PORTRAIT_EMOTIONS } from "@/lib/game/portraits";
import { NPCS, bondLabel, bondLevel, type Dialogue, type Emotion, type GameState } from "@/lib/game/model";

export function Portrait({ npcId, emotion = "neutral", name }: { npcId: string; emotion?: Emotion; name?: string }) {
  const person = portraitCharacter(npcId);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const column = portraitColumn(emotion);
  const label = (name || person?.name || "Karakter belum dikenal") + " · " + EMOTION_LABELS[PORTRAIT_EMOTIONS[column]];
  return <span role="img" aria-label={label} className="yzg-portrait" data-character={npcId} data-emotion={PORTRAIT_EMOTIONS[column]}>
    {person && failedFor !== person.id ? <NextImage key={person.id} src={person.sheet} alt="" aria-hidden="true" width={1536} height={256} unoptimized
      loading="lazy" onError={() => setFailedFor(person.id)} style={{ left: (-column * 100) + "%" }}/>
      : <span className="yzg-portrait-fallback" aria-hidden="true">{(name || person?.name)?.slice(0, 1) || "?"}</span>}
  </span>;
}

export function ResidentPortrait({ resident }: { resident: ResidentProfile }) {
  const [failed,setFailed]=useState<string|null>(null);
  if(failed===resident.portrait)return <span role="img" aria-label={`Potret ${resident.name} belum tersedia`}
    className="yzg-character-preview yzg-portrait-fallback">{resident.name.slice(0,1)}</span>;
  return <NextImage key={resident.portrait} className="yzg-character-preview"
    src={bandungConceptPortraitPath(resident.portrait)}
    alt={`Potret karakter ${resident.name}`} width={80} height={80} unoptimized onError={()=>setFailed(resident.portrait)}/>;
}

function DialogueLine({ line, onNext, last }: { line: string; onNext: () => void; last: boolean }) {
  const lineRef = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(0);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setVisible(count => Math.min(line.length, count + 2)), 28);
    return () => window.clearInterval(timer);
  }, [line]);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const complete = skip || reduced || visible >= line.length;
  useLayoutEffect(() => {
    if (!last || !complete) return;
    const dialog = lineRef.current?.closest("dialog");
    if (!dialog?.open) return;
    const active = document.activeElement;
    if (active === dialog || !dialog.contains(active)) {
      dialog.querySelector<HTMLElement>(".yzg-dialog-options button:enabled")?.focus();
    }
  }, [complete, last]);

  return <>
    <p ref={lineRef} className="yzg-spoken"><span className="yzg-sr-only">{line}</span><span aria-hidden="true">{complete ? line : line.slice(0,visible)}{!complete && <i className="yzg-caret">▌</i>}</span></p>
    {!last && <button autoFocus onClick={() => complete ? onNext() : setSkip(true)}>{complete ? "Lanjut ›" : "Tampilkan teks"}</button>}
    {last && !complete && <button autoFocus onClick={() => setSkip(true)}>Tampilkan teks</button>}
  </>;
}

export default function DialoguePanel({ dialogue, game, resident, children }: { dialogue: Dialogue; game: GameState; resident?: ResidentProfile; children: ReactNode }) {
  const [page, setPage] = useState(0);
  const npc = NPCS.find(n => n.id === dialogue.npcId);
  const bond = npc ? game.bonds[npc.id] : null;
  const last = page >= dialogue.lines.length - 1;
  return <>
    <div className="yzg-dialog-head"><b>{resident?.name ?? (npc?.name || dialogue.title)}</b><span>{page + 1}/{dialogue.lines.length}</span></div>
    <div className="yzg-dialog-scene">
      {npc && (resident?<ResidentPortrait resident={resident}/>:<Portrait npcId={npc.id} emotion={dialogue.emotion}/>)}
      <div className="yzg-dialog-copy">
        {npc && <small>{npc.role} · Lv. {bondLevel(bond!.points)} · {bondLabel(bond!.points)}</small>}
        <DialogueLine key={page} line={dialogue.lines[page] || ""} last={last} onNext={() => setPage(p => p + 1)}/>
      </div>
    </div>
    {last && <div className="yzg-dialog-options">{children}</div>}
  </>;
}
