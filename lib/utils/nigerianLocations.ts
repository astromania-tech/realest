// Nigerian location data for map integration
// Includes state boundaries, LGAs, and popular neighborhoods

export interface NigerianState {
  code: string;
  name: string;
  capital: string;
  zone:
    | "North Central"
    | "North East"
    | "North West"
    | "South East"
    | "South South"
    | "South West";
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface NigerianLGA {
  name: string;
  state: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface NigerianNeighborhood {
  name: string;
  lga: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Complete list of Nigerian states with approximate bounds
export const NIGERIAN_STATES: NigerianState[] = [
  {
    code: "AB",
    name: "Abia",
    capital: "Umuahia",
    zone: "South East",
    bounds: { north: 6.0, south: 4.8, east: 8.0, west: 7.0 },
  },
  {
    code: "AD",
    name: "Adamawa",
    capital: "Yola",
    zone: "North East",
    bounds: { north: 11.0, south: 7.0, east: 14.0, west: 11.0 },
  },
  {
    code: "AK",
    name: "Akwa Ibom",
    capital: "Uyo",
    zone: "South South",
    bounds: { north: 5.5, south: 4.3, east: 8.5, west: 7.5 },
  },
  {
    code: "AN",
    name: "Anambra",
    capital: "Awka",
    zone: "South East",
    bounds: { north: 6.5, south: 5.5, east: 7.5, west: 6.5 },
  },
  {
    code: "BA",
    name: "Bauchi",
    capital: "Bauchi",
    zone: "North East",
    bounds: { north: 12.5, south: 9.5, east: 11.0, west: 8.5 },
  },
  {
    code: "BY",
    name: "Bayelsa",
    capital: "Yenagoa",
    zone: "South South",
    bounds: { north: 5.5, south: 4.5, east: 6.5, west: 5.5 },
  },
  {
    code: "BE",
    name: "Benue",
    capital: "Makurdi",
    zone: "North Central",
    bounds: { north: 8.5, south: 6.5, east: 10.0, west: 7.5 },
  },
  {
    code: "BO",
    name: "Borno",
    capital: "Maiduguri",
    zone: "North East",
    bounds: { north: 14.0, south: 10.0, east: 15.0, west: 11.5 },
  },
  {
    code: "CR",
    name: "Cross River",
    capital: "Calabar",
    zone: "South South",
    bounds: { north: 7.0, south: 4.5, east: 9.5, west: 7.5 },
  },
  {
    code: "DE",
    name: "Delta",
    capital: "Asaba",
    zone: "South South",
    bounds: { north: 6.5, south: 5.0, east: 7.0, west: 5.0 },
  },
  {
    code: "EB",
    name: "Ebonyi",
    capital: "Abakaliki",
    zone: "South East",
    bounds: { north: 7.0, south: 5.5, east: 8.5, west: 7.0 },
  },
  {
    code: "ED",
    name: "Edo",
    capital: "Benin City",
    zone: "South South",
    bounds: { north: 7.5, south: 5.5, east: 6.5, west: 5.0 },
  },
  {
    code: "EK",
    name: "Ekiti",
    capital: "Ado-Ekiti",
    zone: "South West",
    bounds: { north: 8.5, south: 7.0, east: 6.0, west: 4.5 },
  },
  {
    code: "EN",
    name: "Enugu",
    capital: "Enugu",
    zone: "South East",
    bounds: { north: 7.5, south: 6.0, east: 8.0, west: 6.5 },
  },
  {
    code: "FC",
    name: "Federal Capital Territory",
    capital: "Abuja",
    zone: "North Central",
    bounds: { north: 9.5, south: 8.5, east: 7.5, west: 6.5 },
  },
  {
    code: "GO",
    name: "Gombe",
    capital: "Gombe",
    zone: "North East",
    bounds: { north: 11.5, south: 9.5, east: 12.0, west: 10.5 },
  },
  {
    code: "IM",
    name: "Imo",
    capital: "Owerri",
    zone: "South East",
    bounds: { north: 6.5, south: 5.0, east: 7.5, west: 6.5 },
  },
  {
    code: "JI",
    name: "Jigawa",
    capital: "Dutse",
    zone: "North West",
    bounds: { north: 13.5, south: 11.0, east: 10.5, west: 8.5 },
  },
  {
    code: "KD",
    name: "Kaduna",
    capital: "Kaduna",
    zone: "North West",
    bounds: { north: 11.5, south: 8.5, east: 9.0, west: 6.5 },
  },
  {
    code: "KN",
    name: "Kano",
    capital: "Kano",
    zone: "North West",
    bounds: { north: 13.0, south: 10.5, east: 9.5, west: 7.5 },
  },
  {
    code: "KT",
    name: "Katsina",
    capital: "Katsina",
    zone: "North West",
    bounds: { north: 13.5, south: 11.0, east: 8.5, west: 6.0 },
  },
  {
    code: "KE",
    name: "Kebbi",
    capital: "Birnin Kebbi",
    zone: "North West",
    bounds: { north: 13.5, south: 10.0, east: 6.5, west: 3.5 },
  },
  {
    code: "KO",
    name: "Kogi",
    capital: "Lokoja",
    zone: "North Central",
    bounds: { north: 9.0, south: 6.5, east: 7.5, west: 5.5 },
  },
  {
    code: "KW",
    name: "Kwara",
    capital: "Ilorin",
    zone: "North Central",
    bounds: { north: 10.0, south: 7.5, east: 6.0, west: 4.0 },
  },
  {
    code: "LA",
    name: "Lagos",
    capital: "Ikeja",
    zone: "South West",
    bounds: { north: 6.8, south: 6.2, east: 4.0, west: 2.7 },
  },
  {
    code: "NA",
    name: "Nasarawa",
    capital: "Lafia",
    zone: "North Central",
    bounds: { north: 9.5, south: 7.5, east: 9.5, west: 7.0 },
  },
  {
    code: "NI",
    name: "Niger",
    capital: "Minna",
    zone: "North Central",
    bounds: { north: 11.5, south: 8.5, east: 7.5, west: 5.0 },
  },
  {
    code: "OG",
    name: "Ogun",
    capital: "Abeokuta",
    zone: "South West",
    bounds: { north: 7.5, south: 6.2, east: 4.5, west: 2.7 },
  },
  {
    code: "ON",
    name: "Ondo",
    capital: "Akure",
    zone: "South West",
    bounds: { north: 8.5, south: 5.5, east: 6.5, west: 4.0 },
  },
  {
    code: "OS",
    name: "Osun",
    capital: "Osogbo",
    zone: "South West",
    bounds: { north: 8.5, south: 7.0, east: 5.5, west: 4.0 },
  },
  {
    code: "OY",
    name: "Oyo",
    capital: "Ibadan",
    zone: "South West",
    bounds: { north: 9.5, south: 6.5, east: 4.5, west: 2.7 },
  },
  {
    code: "PL",
    name: "Plateau",
    capital: "Jos",
    zone: "North Central",
    bounds: { north: 10.5, south: 8.0, east: 10.5, west: 8.0 },
  },
  {
    code: "RI",
    name: "Rivers",
    capital: "Port Harcourt",
    zone: "South South",
    bounds: { north: 5.5, south: 4.0, east: 7.5, west: 6.0 },
  },
  {
    code: "SO",
    name: "Sokoto",
    capital: "Sokoto",
    zone: "North West",
    bounds: { north: 14.0, south: 11.5, east: 7.0, west: 4.0 },
  },
  {
    code: "TA",
    name: "Taraba",
    capital: "Jalingo",
    zone: "North East",
    bounds: { north: 9.5, south: 6.5, east: 11.5, west: 9.0 },
  },
  {
    code: "YO",
    name: "Yobe",
    capital: "Damaturu",
    zone: "North East",
    bounds: { north: 14.0, south: 10.5, east: 12.5, west: 9.5 },
  },
  {
    code: "ZA",
    name: "Zamfara",
    capital: "Gusau",
    zone: "North West",
    bounds: { north: 13.5, south: 11.0, east: 7.5, west: 5.5 },
  },
];

// Lagos LGAs with approximate bounds
export const LAGOS_LGAS: NigerianLGA[] = [
  {
    name: "Agege",
    state: "LA",
    bounds: { north: 6.65, south: 6.55, east: 3.35, west: 3.25 },
  },
  {
    name: "Ajeromi-Ifelodun",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.4, west: 3.3 },
  },
  {
    name: "Alimosho",
    state: "LA",
    bounds: { north: 6.65, south: 6.45, east: 3.35, west: 3.15 },
  },
  {
    name: "Amuwo-Odofin",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.3, west: 3.2 },
  },
  {
    name: "Apapa",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.4, west: 3.3 },
  },
  {
    name: "Badagry",
    state: "LA",
    bounds: { north: 6.5, south: 6.35, east: 3.0, west: 2.7 },
  },
  {
    name: "Epe",
    state: "LA",
    bounds: { north: 6.6, south: 6.4, east: 4.0, west: 3.8 },
  },
  {
    name: "Eti-Osa",
    state: "LA",
    bounds: { north: 6.5, south: 6.35, east: 3.7, west: 3.4 },
  },
  {
    name: "Ibeju-Lekki",
    state: "LA",
    bounds: { north: 6.6, south: 6.3, east: 3.9, west: 3.6 },
  },
  {
    name: "Ifako-Ijaiye",
    state: "LA",
    bounds: { north: 6.7, south: 6.6, east: 3.35, west: 3.25 },
  },
  {
    name: "Ikeja",
    state: "LA",
    bounds: { north: 6.65, south: 6.55, east: 3.4, west: 3.3 },
  },
  {
    name: "Ikorodu",
    state: "LA",
    bounds: { north: 6.7, south: 6.5, east: 3.6, west: 3.4 },
  },
  {
    name: "Kosofe",
    state: "LA",
    bounds: { north: 6.65, south: 6.55, east: 3.45, west: 3.35 },
  },
  {
    name: "Lagos Island",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.45, west: 3.35 },
  },
  {
    name: "Lagos Mainland",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.4, west: 3.3 },
  },
  {
    name: "Mushin",
    state: "LA",
    bounds: { north: 6.55, south: 6.5, east: 3.4, west: 3.3 },
  },
  {
    name: "Ojo",
    state: "LA",
    bounds: { north: 6.5, south: 6.4, east: 3.25, west: 3.15 },
  },
  {
    name: "Oshodi-Isolo",
    state: "LA",
    bounds: { north: 6.55, south: 6.5, east: 3.4, west: 3.3 },
  },
  {
    name: "Shomolu",
    state: "LA",
    bounds: { north: 6.55, south: 6.5, east: 3.4, west: 3.35 },
  },
  {
    name: "Surulere",
    state: "LA",
    bounds: { north: 6.55, south: 6.45, east: 3.4, west: 3.3 },
  },
];

// LGA data for key states
export const STATE_LGAS: Record<string, NigerianLGA[]> = {
  LA: LAGOS_LGAS,
  FC: [
    { name: "Abaji", state: "FC" },
    { name: "Abuja Municipal", state: "FC" },
    { name: "Bwari", state: "FC" },
    { name: "Gwagwalada", state: "FC" },
    { name: "Kuje", state: "FC" },
    { name: "Kwali", state: "FC" },
  ],
  KN: [
    { name: "Ajingi", state: "KN" },
    { name: "Albasu", state: "KN" },
    { name: "Bagwai", state: "KN" },
    { name: "Bebeji", state: "KN" },
    { name: "Bichi", state: "KN" },
    { name: "Bunkure", state: "KN" },
    { name: "Dala", state: "KN" },
    { name: "Dambatta", state: "KN" },
    { name: "Dawakin Kudu", state: "KN" },
    { name: "Dawakin Tofa", state: "KN" },
    { name: "Doguwa", state: "KN" },
    { name: "Fagge", state: "KN" },
    { name: "Gabasawa", state: "KN" },
    { name: "Garko", state: "KN" },
    { name: "Garun Mallam", state: "KN" },
    { name: "Gaya", state: "KN" },
    { name: "Gezawa", state: "KN" },
    { name: "Gwale", state: "KN" },
    { name: "Gwarzo", state: "KN" },
    { name: "Kabo", state: "KN" },
    { name: "Kano Municipal", state: "KN" },
    { name: "Karaye", state: "KN" },
    { name: "Kibiya", state: "KN" },
    { name: "Kiru", state: "KN" },
    { name: "Kumbotso", state: "KN" },
    { name: "Kunchi", state: "KN" },
    { name: "Kura", state: "KN" },
    { name: "Madobi", state: "KN" },
    { name: "Makoda", state: "KN" },
    { name: "Minjibir", state: "KN" },
    { name: "Nasarawa", state: "KN" },
    { name: "Rano", state: "KN" },
    { name: "Rimin Gado", state: "KN" },
    { name: "Rogo", state: "KN" },
    { name: "Shanono", state: "KN" },
    { name: "Sumaila", state: "KN" },
    { name: "Takai", state: "KN" },
    { name: "Tarauni", state: "KN" },
    { name: "Tofa", state: "KN" },
    { name: "Tsanyawa", state: "KN" },
    { name: "Tudun Wada", state: "KN" },
    { name: "Ungogo", state: "KN" },
    { name: "Warawa", state: "KN" },
    { name: "Wudil", state: "KN" },
  ],
  RI: [
    { name: "Abua/Odual", state: "RI" },
    { name: "Ahoada East", state: "RI" },
    { name: "Ahoada West", state: "RI" },
    { name: "Akuku-Toru", state: "RI" },
    { name: "Andoni", state: "RI" },
    { name: "Asari-Toru", state: "RI" },
    { name: "Bonny", state: "RI" },
    { name: "Degema", state: "RI" },
    { name: "Eleme", state: "RI" },
    { name: "Emuoha", state: "RI" },
    { name: "Etche", state: "RI" },
    { name: "Gokana", state: "RI" },
    { name: "Ikwerre", state: "RI" },
    { name: "Khana", state: "RI" },
    { name: "Obio/Akpor", state: "RI" },
    { name: "Ogba/Egbema/Ndoni", state: "RI" },
    { name: "Ogu/Bolo", state: "RI" },
    { name: "Okrika", state: "RI" },
    { name: "Omuma", state: "RI" },
    { name: "Opobo/Nkoro", state: "RI" },
    { name: "Oyigbo", state: "RI" },
    { name: "Port Harcourt", state: "RI" },
    { name: "Tai", state: "RI" },
  ],
};

// Popular Lagos neighborhoods with coordinates
export const LAGOS_NEIGHBORHOODS: NigerianNeighborhood[] = [
  // Lekki
  {
    name: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.4474, lng: 3.4716 },
  },
  {
    name: "Lekki Phase 2",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.45, lng: 3.534 },
  },
  {
    name: "Chevron",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.44, lng: 3.52 },
  },
  {
    name: "VGC",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.43, lng: 3.51 },
  },
  {
    name: "Ajah",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.4683, lng: 3.5965 },
  },

  // Ikoyi/Victoria Island
  {
    name: "Ikoyi",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.455, lng: 3.4372 },
  },
  {
    name: "Banana Island",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.4162, lng: 3.4234 },
  },
  {
    name: "Parkview Estate",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.42, lng: 3.43 },
  },
  {
    name: "Victoria Island",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.4281, lng: 3.424 },
  },
  {
    name: "Oniru",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.43, lng: 3.44 },
  },
  {
    name: "Eko Atlantic",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.42, lng: 3.43 },
  },

  // Mainland
  {
    name: "Yaba",
    lga: "Lagos Mainland",
    state: "LA",
    coordinates: { lat: 6.51, lng: 3.38 },
  },
  {
    name: "Surulere",
    lga: "Surulere",
    state: "LA",
    coordinates: { lat: 6.5, lng: 3.35 },
  },
  {
    name: "Ikeja GRA",
    lga: "Ikeja",
    state: "LA",
    coordinates: { lat: 6.5964, lng: 3.3417 },
  },
  {
    name: "Maryland",
    lga: "Ikeja",
    state: "LA",
    coordinates: { lat: 6.58, lng: 3.36 },
  },
  {
    name: "Gbagada",
    lga: "Kosofe",
    state: "LA",
    coordinates: { lat: 6.55, lng: 3.38 },
  },

  // Other areas
  {
    name: "Sangotedo",
    lga: "Eti-Osa",
    state: "LA",
    coordinates: { lat: 6.48, lng: 3.65 },
  },
  {
    name: "Ogba",
    lga: "Ikeja",
    state: "LA",
    coordinates: { lat: 6.63, lng: 3.33 },
  },
  {
    name: "Magodo",
    lga: "Kosofe",
    state: "LA",
    coordinates: { lat: 6.61, lng: 3.38 },
  },
  {
    name: "Isheri",
    lga: "Alimosho",
    state: "LA",
    coordinates: { lat: 6.62, lng: 3.32 },
  },
];

// Utility functions
export function getStateByCode(code: string): NigerianState | undefined {
  return NIGERIAN_STATES.find((state) => state.code === code);
}

export function getStateByName(name: string): NigerianState | undefined {
  return NIGERIAN_STATES.find((state) => state.name === name);
}

export function getLGAsByState(stateCode: string): NigerianLGA[] {
  return STATE_LGAS[stateCode] || [];
}

export function getNeighborhoodsByLGA(lgaName: string): NigerianNeighborhood[] {
  return LAGOS_NEIGHBORHOODS.filter(
    (neighborhood) => neighborhood.lga === lgaName,
  );
}

export function getDefaultMapCenter(): { lat: number; lng: number } {
  // Center on Lagos
  return { lat: 6.5244, lng: 3.3792 };
}

export function getDefaultMapBounds(): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  // Nigeria-wide bounds — covers all 36 states (lat 4°N–14°N, lng 2.7°E–14.7°E).
  // Using a wider initial viewport ensures properties in any state (Bayelsa, Rivers,
  // Lagos, Abuja, etc.) are included on the first map load. The bounds will tighten
  // progressively as the user pans/zooms via MapEventHandler.
  return { north: 14.0, south: 4.0, east: 14.7, west: 2.7 };
}
