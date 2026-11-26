/** Stable organization taxonomy for the YZ Farm Life media catalog.
 * This maps paths to browseable category indexes without moving legacy packages.
 */
export const ASSET_CATEGORIES = [
  {
    "id": "characters",
    "label": "Karakter dan sprite gerak",
    "description": "Aktor, avatar, karakter dan konsep profesi"
  },
  {
    "id": "portraits",
    "label": "Potret dan ekspresi",
    "description": "Ekspresi dialog dan ilustrasi konsep Bandung"
  },
  {
    "id": "plants",
    "label": "Tanaman dan komoditas",
    "description": "Sprite tahap tumbuh tanaman, tanaman prototipe"
  },
  {
    "id": "animals",
    "label": "Hewan dan ternak",
    "description": "Hewan domestik dan aset terkait"
  },
  {
    "id": "world",
    "label": "Peta, tile dan wilayah",
    "description": "Peta Pasirluyu, Kota Bandung, kelurahan, lingkungan"
  },
  {
    "id": "buildings",
    "label": "Bangunan dan interior",
    "description": "Bangunan, rumah dan desain interior"
  },
  {
    "id": "props",
    "label": "Properti lingkungan",
    "description": "Perabot, objek kecil dan dekorasi"
  },
  {
    "id": "tools",
    "label": "Alat dan tindakan",
    "description": "Cangkul, penyiram, alat panen, ikon aksi"
  },
  {
    "id": "interface",
    "label": "Antarmuka dan HUD",
    "description": "Tombol, ikon, sampul dan menu"
  },
  {
    "id": "audio",
    "label": "Audio dan suasana",
    "description": "Musik, suara lingkungan, SFX, atmosfer malam"
  },
  {
    "id": "environment",
    "label": "Cuaca dan efek",
    "description": "Cuaca, partikel dan efek visual"
  },
  {
    "id": "stories",
    "label": "Cerita dan misi",
    "description": "Gambar jurnal dan adegan cerita"
  },
  {
    "id": "commerce",
    "label": "Pasar dan perdagangan",
    "description": "Aset pasar, barang dan ikon toko"
  },
  {
    "id": "vendors",
    "label": "Sumber eksternal",
    "description": "Aset dari vendor dengan catatan lisensi"
  }
];
export const LEGACY_SECTIONS = {
  "tanaman": "plants",
  "hewan": "animals",
  "kelurahan": "world",
  "peta": "world",
  "runtime-asli": "world",
  "karakter": "characters",
  "avatar": "characters",
  "profesi": "characters",
  "potret-profesi": "portraits",
  "potret-baru": "portraits",
  "properti": "props",
  "aksi": "tools",
  "antarmuka": "interface",
  "sampul": "interface",
  "audio": "audio",
  "malam": "audio",
  "cuaca": "environment",
  "efek": "environment",
  "cerita": "stories",
  "pasar": "commerce",
  "vendor": "vendors",
  "sumber-karakter": "characters"
};
export const PUBLIC_SECTIONS = {
  "characters": "characters",
  "market": "commerce",
  "fish": "animals",
  "portraits": "portraits",
  "tiles": "world",
  "pasirluyu": "world",
  "residences": "buildings",
  "locations": "buildings",
  "audio": "audio",
  "story": "stories",
  "cutscenes": "stories",
  "quests": "props"
};
export function categorizeMedia(path){
 const p=path.split("/");
 if(/^public\/game\/assets\/tiles\/(ayu|widi)-shop-atlas\.png$/.test(path))return {category:"commerce",section:"tiles/shop-icons"};
 if(path.startsWith("game-assets/characters/"))return {category:"characters",section:p.slice(2,4).join("/")};
 if(path.startsWith("game-assets/vendor/"))return {category:"vendors",section:p.slice(2,4).join("/")};
 if(path.startsWith("public/game/assets/"))return {category:PUBLIC_SECTIONS[p[3]],section:p.slice(3,Math.min(p.length-1,7)).join("/")||"root"};
 if(path.startsWith("game-assets/imported/"))return {category:LEGACY_SECTIONS[p[3]]||"props",section:p[2]+"/"+p[3]};
 if(path.startsWith("game-assets/yz-farm-life/"))return {category:LEGACY_SECTIONS[p[3]],section:p[2]+"/"+p[3]};
 throw new Error("Unknown media source folder: "+path);
}
