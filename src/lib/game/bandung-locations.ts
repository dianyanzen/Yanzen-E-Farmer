/** Kota Bandung administrative locations. Source: Disdukcapil Kota Bandung 2025
 * https://disdukcapil.bandung.go.id/api/public/uploads/buku-profil/PROFIL_PERKEMBANGAN_KEPENDUDUKAN_KOTA_BANDUNG_2025.pdf
 * Real district names are used only for worldbuilding; game maps, characters and farms are fictional.
 */
export const START_LOCATION = {
  city: "Kota Bandung",
  district: "Regol",
  village: "Pasirluyu",
  area: "Kebun Pasirluyu",
} as const;

export const BANDUNG_DISTRICTS = [
  "Andir",
  "Antapani",
  "Arcamanik",
  "Astanaanyar",
  "Babakan Ciparay",
  "Bandung Kidul",
  "Bandung Kulon",
  "Bandung Wetan",
  "Batununggal",
  "Bojongloa Kaler",
  "Bojongloa Kidul",
  "Buahbatu",
  "Cibeunying Kaler",
  "Cibeunying Kidul",
  "Cibiru",
  "Cicendo",
  "Cidadap",
  "Cinambo",
  "Coblong",
  "Gedebage",
  "Kiaracondong",
  "Lengkong",
  "Mandalajati",
  "Panyileukan",
  "Rancasari",
  "Regol",
  "Sukajadi",
  "Sukasari",
  "Sumur Bandung",
  "Ujungberung",
] as const;

export type BandungDistrict = (typeof BANDUNG_DISTRICTS)[number];
export const REGOL_VILLAGES = [
  "Ancol", "Balonggede", "Ciateul", "Cigereleng",
  "Ciseureuh", "Pasirluyu", "Pungkur",
] as const;

/** Available locations must not be presented as traversable before corresponding maps exist. */
export const AVAILABLE_DISTRICTS: readonly BandungDistrict[] = ["Regol"];
export function isDistrictPlayable(district: BandungDistrict): boolean {
  return AVAILABLE_DISTRICTS.includes(district);
}
