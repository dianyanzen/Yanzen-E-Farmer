"use client";

import { useState } from "react";
import { PORTRAIT_CHARACTERS, PORTRAIT_EMOTIONS, EMOTION_LABELS } from "@/lib/game/portraits";
import { NPCS, type Emotion } from "@/lib/game/model";
import { Portrait } from "./dialogue-panel";

export default function CharacterGallery() {
  const [search, setSearch] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const people = PORTRAIT_CHARACTERS.filter(p => (p.name + " " + p.occupation).toLocaleLowerCase("id").includes(search.toLocaleLowerCase("id").trim()));
  return <section aria-label="Galeri karakter">
    <div className="yzg-phone-card"><b>Warga & karakter</b>
      <p>Yanzen dan 31 warga dalam dunia YZ Farm Life. Tiga NPC sudah dapat ditemui di Pasirluyu; warga lainnya disiapkan untuk wilayah berikutnya.</p>
      <label htmlFor="yzg-character-search">Cari nama atau pekerjaan</label>
      <input id="yzg-character-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Contoh: Nabila"/>
      <div className="yzg-expression-picker" aria-label="Ekspresi potret">{PORTRAIT_EMOTIONS.map(e => <button key={e} aria-pressed={emotion === e} onClick={() => setEmotion(e)}>{EMOTION_LABELS[e]}</button>)}</div>
      <small>{people.length} dari {PORTRAIT_CHARACTERS.length} karakter</small>
    </div>
    {people.map(person => <article className="yzg-phone-card yzg-character-card" key={person.id} data-character-card={person.id}>
      <Portrait npcId={person.id} emotion={emotion}/>
      <div><b>{person.name}</b><small>{person.occupation}</small><p>{person.personality.join(" · ")}</p>
      <small>Hobi: {person.hobby.join(", ")}</small>
      <small>{person.role === "main-character" ? "Karakter utama" : NPCS.some(n => n.id === person.id) ? "Dapat ditemui di Pasirluyu" : "Wilayah berikutnya"}</small></div>
    </article>)}
    {!people.length && <p role="status">Karakter tidak ditemukan.</p>}
  </section>;
}
