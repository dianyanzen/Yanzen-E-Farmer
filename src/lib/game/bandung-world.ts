/** YZ Farm Life — Bandung administrative world registry.
 * Names and parent mapping are factual reference data; geographic shapes and
 * playable routes are NOT inferred from the labels.
 * New locations must not be presented as traversable before authored maps exist.
 */
import registry from "./data/bandung-master-registry.json";

export type PlayStatus="playable"|"partial"|"planned";
export type GeoStatus="not_imported"|"draft"|"verified";
export type VillageRecord={
  id:string;name:string;slug:string;play_state:PlayStatus;
  atlas_label:string;name_variants:string[];boundary_state:GeoStatus;
};
export type DistrictRecord={
  id:string;name:string;slug:string;play_state:PlayStatus;
  boundary_state:GeoStatus;villages:VillageRecord[];
};
export type WorldZoneType="residential"|"farming"|"livestock"|"fishing"|"commerce"|
  "education"|"civic"|"industry"|"nature"|"culture"|"secret";
export type WorldZoneState="playable"|"planned"|"locked";
export type WorldLocationRecord={
  id:string;villageId:string;name:string;type:WorldZoneType;
  status:WorldZoneState;sceneId:string|null;description:string;
};

export const BANDUNG_WORLD={
  id:registry.city_id,name:registry.city_name,province:registry.province,country:registry.country,
  schemaVersion:registry.schema_version,
  geometryStatus:registry.geometry_status as GeoStatus,
  districtCount:registry.administrative_counts.districts,
  villageCount:registry.administrative_counts.villages,
} as const;

export const WORLD_DISTRICTS:readonly DistrictRecord[]=registry.districts as DistrictRecord[];
export const WORLD_VILLAGES:readonly (VillageRecord & {districtId:string;districtName:string})[]=
  WORLD_DISTRICTS.flatMap(d=>d.villages.map(v=>({...v,districtId:d.id,districtName:d.name})));
const districtsByName=new Map(WORLD_DISTRICTS.map(d=>[d.name.toLocaleLowerCase("id-ID"),d]));
const villagesById=new Map(WORLD_VILLAGES.map(v=>[v.id,v]));

export function getWorldDistrict(name:string):DistrictRecord|null{
  return districtsByName.get(name.toLocaleLowerCase("id-ID").trim())??null;
}
export function getWorldVillages(districtName:string):readonly VillageRecord[]{
  return getWorldDistrict(districtName)?.villages??[];
}
export function getWorldVillageById(id:string){
  return villagesById.get(id)??null;
}
export function isVillagePlayable(district:string,village:string):boolean{
  return getWorldVillages(district).some(v=>v.name===village&&v.play_state==="playable");
}
export function searchWorldVillages(query:string,limit=20){
  const needle=query.normalize("NFKD").trim().toLocaleLowerCase("id-ID");
  if(!needle)return [];
  return WORLD_VILLAGES.filter(v=>
    v.name.toLocaleLowerCase("id-ID").includes(needle)||
    v.districtName.toLocaleLowerCase("id-ID").includes(needle)||
    v.name_variants.some(alias=>alias.toLocaleLowerCase("id-ID").includes(needle))
  ).slice(0,Math.max(0,Math.min(limit,151)));
}
export const WORLD_ZONE_CATEGORIES:ReadonlyArray<{id:WorldZoneType;label:string}>= [
  {id:"residential",label:"Permukiman"},{id:"farming",label:"Pertanian"},
  {id:"livestock",label:"Peternakan"},{id:"fishing",label:"Perikanan"},
  {id:"commerce",label:"Perdagangan"},{id:"education",label:"Pendidikan"},
  {id:"civic",label:"Fasilitas Publik"},{id:"industry",label:"Pekerjaan dan Industri"},
  {id:"nature",label:"Alam dan Rekreasi"},{id:"culture",label:"Budaya dan Sosial"},
  {id:"secret",label:"Lokasi Rahasia"}
];

/** Only these four OUTDOOR scenes physically exist in the current prototype.
 * All other 150 kelurahan remain future destinations. */
export const PASIRLUYU_LOCATIONS:ReadonlyArray<WorldLocationRecord>=[
  {id:"bdg/regol/pasirluyu/farming/kebun-yanzen",villageId:"bdg/regol/pasirluyu",name:"Kebun Yanzen",
   type:"farming",status:"playable",sceneId:"field",description:"Rumah, kebun timun, dan gudang alat"},
  {id:"bdg/regol/pasirluyu/residential/gang-pasirluyu",villageId:"bdg/regol/pasirluyu",name:"Gang Pasirluyu",
   type:"residential",status:"playable",sceneId:"gang",description:"Permukiman warga dan rumah tetangga"},
  {id:"bdg/regol/pasirluyu/commerce/pasar-warga",villageId:"bdg/regol/pasirluyu",name:"Pasar Warga",
   type:"commerce",status:"playable",sceneId:"pasar",description:"Lapak, warung dan aktivitas dagang"},
  {id:"bdg/regol/pasirluyu/nature/bantaran-sungai",villageId:"bdg/regol/pasirluyu",name:"Bantaran Sungai",
   type:"nature",status:"playable",sceneId:"sungai",description:"Bantaran air dan pintu irigasi"}
];
export const PASIRLUYU_CONNECTIONS=[
  {from:"field",to:"gang",status:"playable"},
  {from:"gang",to:"pasar",status:"playable"},
  {from:"gang",to:"sungai",status:"playable"}
] as const;

/** An intentionally empty list: do not invent district/village adjacency
 * until licensed geographic polygons or verified road connections are available. */
export const VERIFIED_CITY_ROUTES:ReadonlyArray<{from:string;to:string;routeId:string}> = [];
