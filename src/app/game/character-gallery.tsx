"use client";

import Image from "next/image";
import previews from "@/lib/game/data/bandung-character-previews.json";
import { useState } from "react";
import { PORTRAIT_CHARACTERS, PORTRAIT_EMOTIONS, EMOTION_LABELS } from "@/lib/game/portraits";
import { NPCS, type Emotion } from "@/lib/game/model";
import type { ResidentProfile } from "@/lib/game/resident-profile";
import { Portrait, ResidentPortrait } from "./dialogue-panel";

function OriginalGallery() {
  const [search, setSearch] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const query = search.toLocaleLowerCase("id").trim();
  const matches = (person: { name: string; occupation: string }) =>
    (person.name + " " + person.occupation).toLocaleLowerCase("id").includes(query);
  const people = PORTRAIT_CHARACTERS.filter(matches);
  const upcoming = previews.filter(matches);
  return <section aria-label="Galeri karakter">
    <div className="yzg-phone-card"><b>Warga & karakter</b>
      <p>Tiga warga dapat ditemui di Pasirluyu. Galeri juga memuat potret dan kisah karakter yang disiapkan untuk perluasan Bandung.</p>
      <label htmlFor="yzg-character-search">Cari nama atau pekerjaan</label>
      <input id="yzg-character-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Contoh: Nabila"/>
      <div className="yzg-expression-picker" aria-label="Ekspresi potret">{PORTRAIT_EMOTIONS.map(e => <button key={e} aria-pressed={emotion === e} onClick={() => setEmotion(e)}>{EMOTION_LABELS[e]}</button>)}</div>
      <small>{people.length + upcoming.length} dari {PORTRAIT_CHARACTERS.length + previews.length} karakter</small>
    </div>
    {people.map(person => <article className="yzg-phone-card yzg-character-card" key={person.id} data-character-card={person.id}>
      <Portrait npcId={person.id} emotion={emotion}/>
      <div><b>{person.name}</b><small>{person.occupation}</small><p>{person.personality.join(" · ")}</p>
      <small>Hobi: {person.hobby.join(", ")}</small>
      <small>{person.role === "main-character" ? "Karakter utama" : NPCS.some(n => n.id === person.id) ? "Dapat ditemui di Pasirluyu" : "Wilayah berikutnya"}</small></div>
    </article>)}
    {upcoming.length > 0 && <section aria-label="Karakter perluasan Bandung">
      <h3>Karakter perluasan Bandung</h3>
      {upcoming.map(person => <article className="yzg-phone-card yzg-character-card" key={person.id} data-character-card={person.id}>
        <Image className="yzg-character-preview" src={'/game/assets/portraits/bandung/' + person.id + '.png'}
          alt={'Potret konsep ' + person.name} width={80} height={80} unoptimized />
        <div>
          <b>{person.name}</b><small>{person.occupation}</small>
          <p><strong>{person.story}</strong></p><p>{person.premise}</p>
          <small>Potret konsep | Pertemuan direncanakan</small>
        </div>
      </article>)}
    </section>}
    {!people.length && !upcoming.length && <p role="status">Karakter tidak ditemukan.</p>}
  </section>;
}


export default function CharacterGallery({ residents }: { residents: readonly ResidentProfile[] }) {
  return residents.length ? <ResidentGallery residents={residents}/> : <OriginalGallery/>;
}

function ResidentGallery({ residents }: { residents: readonly ResidentProfile[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = search.toLocaleLowerCase("id").trim();
  const matches = residents.filter(resident =>
    `${resident.name} ${resident.occupation}`.toLocaleLowerCase("id").includes(query));
  const pageSize = 18;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const activePage = Math.min(page, pages - 1);
  return <section aria-label="Galeri karakter">
    <div className="yzg-phone-card">
      <b>Warga Bandung</b>
      <p>Karakter dalam cerita game. Peran dan potret bersifat fiktif.</p>
      <label htmlFor="yzg-character-search">Cari nama atau peran</label>
      <input id="yzg-character-search" type="search" value={search} onChange={event => {
        setSearch(event.target.value);
        setPage(0);
      }}/>
      <small role="status">{matches.length} dari {residents.length} warga</small>
      {pages > 1 && <nav className="yzg-expression-picker" aria-label="Halaman warga">
        <button type="button" disabled={activePage === 0} onClick={() => setPage(activePage - 1)}>Sebelumnya</button>
        <span>{activePage + 1}/{pages}</span>
        <button type="button" disabled={activePage + 1 >= pages} onClick={() => setPage(activePage + 1)}>Berikutnya</button>
      </nav>}
    </div>
    {matches.slice(activePage * pageSize, (activePage + 1) * pageSize).map(resident =>
      <article className="yzg-phone-card yzg-character-card" key={resident.id} data-character-card={resident.id}>
        <ResidentPortrait resident={resident}/>
        <div><b>{resident.name}</b><small>{resident.occupation}</small>
          <small>{NPCS.some(npc => npc.id === resident.id) ? "Dapat ditemui di game" : "Terdaftar di katalog warga"}</small>
        </div>
      </article>)}
    {!matches.length && <p>Warga tidak ditemukan.</p>}
  </section>;
}
