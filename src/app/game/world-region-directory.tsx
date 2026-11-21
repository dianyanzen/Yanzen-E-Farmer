"use client";

import {useState} from "react";
import {BANDUNG_WORLD,WORLD_DISTRICTS,getWorldDistrict,getWorldVillages,
  searchWorldVillages,PASIRLUYU_LOCATIONS} from "@/lib/game/bandung-world";

export default function WorldRegionDirectory(){
  const [districtName,setDistrictName]=useState("Regol");
  const [query,setQuery]=useState("");
  const selected=getWorldDistrict(districtName);
  const villages=getWorldVillages(districtName);
  const results=query.trim()?searchWorldVillages(query,25):[];
  const limitReached=query.trim()&&results.length>=25;

  return <section className="yzg-phone-card yzg-world-regions" aria-label="Master wilayah Kota Bandung">
    <b>Jelajah 30 Kecamatan · 151 Kelurahan</b>
    <p className="yzg-world-scope">Kota Bandung: {BANDUNG_WORLD.districtCount} kecamatan dan {BANDUNG_WORLD.villageCount} kelurahan.
      Kamu baru bisa berjalan-jalan di Pasirluyu. Kawasan lain masih menunggu untuk dijelajahi.</p>
    <label htmlFor="yzg-kecamatan" className="yzg-map-label">Pilih kecamatan</label>
    <select className="yzg-map-select" id="yzg-kecamatan" value={districtName}
      onChange={e=>{setDistrictName(e.target.value);setQuery("");}}>
      {WORLD_DISTRICTS.map(d=><option value={d.name} key={d.id}>{d.name} ({d.villages.length})</option>)}
    </select>
    <label htmlFor="yzg-world-search" className="yzg-map-label">Cari kelurahan di seluruh Bandung</label>
    <input id="yzg-world-search" className="yzg-map-select" value={query}
      onChange={e=>setQuery(e.target.value)} placeholder="Contoh: Pasirluyu, Braga, Dago..."
      autoComplete="off"/>
    {query.trim()?<div role="region" aria-label="Hasil pencarian kelurahan">
      <small>{results.length===0?"Tidak ada nama kelurahan yang cocok.":
        (limitReached?"25 hasil pertama ditampilkan. Persempit pencarian.":results.length+" kelurahan cocok.")}</small>
      <div className="yzg-world-village-list">{results.map(v=>
        <button type="button" key={v.id} className="yzg-world-village"
          onClick={()=>{setDistrictName(v.districtName);setQuery("");}}>
          <span><strong>{v.name}</strong><small>{v.districtName}</small></span>
          <span className={v.play_state==="playable"?"playable":"planned"}>
            {v.play_state==="playable"?"Bisa dikunjungi":"Belum terbuka"}
          </span>
        </button>)}</div>
    </div>:<>
      <p><strong>{selected?.name??districtName}</strong> · {villages.length} kelurahan
        {selected?.play_state==="partial"?" · Pasirluyu bisa dikunjungi":" · Jalan belum terbuka"}</p>
      <div className="yzg-world-village-list" role="list" aria-label={"Daftar kelurahan "+districtName}>
        {villages.map(v=><div key={v.id} className="yzg-world-village" role="listitem">
          <span><strong>{v.name}</strong>
            {v.name_variants.length>0&&<small>Nama lain: {v.name_variants.join(", ")}</small>}
          </span>
          <span className={v.play_state==="playable"?"playable":"planned"}>
            {v.play_state==="playable"?"Bisa dikunjungi":"Belum terbuka"}
          </span>
        </div>)}
      </div>
    </>}
    <a href={`/game/atlas/index.html?kecamatan=${encodeURIComponent(districtName)}`}>
      Lihat peta kecamatan
    </a>
    <details>
      <summary>Kawasan yang dapat dimainkan sekarang ({PASIRLUYU_LOCATIONS.length})</summary>
      <ul>{PASIRLUYU_LOCATIONS.map(loc=><li key={loc.id}>
        {loc.name} — {loc.description}</li>)}</ul>
    </details>
    <small className="yzg-world-disclaimer">Nama wilayah mengikuti Bandung. Bangunan, warga, dan peristiwa merupakan bagian dari cerita.
      Jalan ke kawasan lain akan terbuka sedikit demi sedikit.</small>
  </section>;
}
