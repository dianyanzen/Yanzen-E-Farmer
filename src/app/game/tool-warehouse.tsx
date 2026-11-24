"use client";
import GameDialog from "./game-dialog";
import { BAG_UNLOCK_LEVELS,BAG_UPGRADE_COSTS,TOOL_CATALOG,
  bagCapacity,playerLevel,toolName, type GameState, type ToolId } from "@/lib/game/model";
export default function ToolWarehouse({game,disabled,onClose,onTransfer,onUpgrade}:{
  game:GameState;disabled:boolean;onClose:()=>void;
  onTransfer:(id:ToolId,action:"store"|"take")=>void;onUpgrade:()=>void;
}){
  const next=game.bagTier===4?null:game.bagTier+1;
  return <GameDialog className="yzg-storage-dialog" aria-label="Gudang peralatan" onBack={onClose}>
    <div className="yzg-storage-head"><div><b>Gudang Peralatan</b><small>Alat hanya dapat dipindahkan saat menghadap rak.</small></div>
      <button onClick={onClose}>Tutup</button></div>
    <div className="yzg-storage-meta"><span>Tas Lv. {game.bagTier}</span>
      <strong>{game.carriedTools.length}/{bagCapacity(game.bagTier)} slot</strong>
      <span>Saldo {game.coins} G · Pemain Lv. {playerLevel(game)}</span></div>
    <div className="yzg-storage-upgrade"><div><b>Upgrade tas</b><small>
      {next===null?"Kapasitas maksimal.":"Lv. "+next+" · "+BAG_UPGRADE_COSTS[next]+" G · "+BAG_UNLOCK_LEVELS[next]+" level pemain"}
      </small></div><button onClick={onUpgrade} disabled={disabled||next===null}>Upgrade</button></div>
    <div className="yzg-storage-columns">
      <section><h3>Alat dibawa</h3>
        {!game.carriedTools.length&&<p>Tas kosong.</p>}
        {game.carriedTools.map(id=><div className="yzg-storage-item" key={id}>
          <div><b>{toolName(id)}</b><small>{TOOL_CATALOG[id].function}</small>
            <small>{TOOL_CATALOG[id].status==="active"?"Dapat digunakan":"Belum bisa digunakan"}</small></div>
          <button onClick={()=>onTransfer(id,"store")} disabled={disabled}>Simpan</button></div>)}
      </section>
      <section><h3>Rak gudang</h3>
        {!game.storedTools.length&&<p>Gudang kosong.</p>}
        {game.storedTools.map(id=><div className="yzg-storage-item" key={id}>
          <div><b>{toolName(id)}</b><small>{TOOL_CATALOG[id].function}</small>
            <small>{TOOL_CATALOG[id].status==="active"?"Dapat digunakan":"Belum bisa digunakan"}</small></div>
          <button onClick={()=>onTransfer(id,"take")} disabled={disabled||game.carriedTools.length>=bagCapacity(game.bagTier)}>Ambil</button></div>)}
      </section>
    </div>

  </GameDialog>;
}
