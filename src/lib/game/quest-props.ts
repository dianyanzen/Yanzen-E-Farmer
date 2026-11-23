/** Small, authored, interactable world props. Do not treat unused art as a quest.
 * Coordinates are tile positions; visual anchors are aligned to each tile's feet.
 * Keep runtime ids stable across saves and map expansions.
 */
export const QUEST_PROPS = [
  {id:"water-marks",owner:"A03",location:"sungai",x:8,y:7,asset:"quest-water-marks",label:"Periksa batu ukur air"},
  {id:"nani-pots",owner:"C01",location:"gang",x:10,y:9,asset:"quest-nani-pots",label:"Periksa pot milik Nani"},
  {id:"ayu-seeds",owner:"A04",location:"pasar",x:9,y:9,asset:"quest-ayu-seeds",label:"Periksa wadah semai Ayu"},
  {id:"widi-ledger",owner:"C07",location:"pasar",x:29,y:8,asset:"quest-widi-ledger",label:"Periksa buku tangkapan Widi"},
  {id:"inggit-orders",owner:"C08",location:"pasar",x:15,y:10,asset:"quest-inggit-orders",label:"Periksa keranjang pesanan Inggit"},
] as const;
export type QuestPropId = (typeof QUEST_PROPS)[number]["id"];
export type QuestProp = (typeof QUEST_PROPS)[number];
export const questPropAt = (location:string,x:number,y:number):QuestProp|undefined =>
  QUEST_PROPS.find(p=>p.location===location&&p.x===x&&p.y===y);
export const questPropById = (id:QuestPropId):QuestProp =>
  QUEST_PROPS.find(p=>p.id===id)!;
