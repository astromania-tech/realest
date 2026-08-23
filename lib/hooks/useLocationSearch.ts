'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Location {
  id: string;
  name: string;
  state: string;
  type: 'city' | 'state';
  population?: number;
}

interface UseLocationSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  includeStates?: boolean;
  includePopularCities?: boolean;
}

interface UseLocationSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Location[];
  defaultSuggestions: Location[];
  isLoading: boolean;
  popularLocations: Location[];
  clearQuery: () => void;
  selectLocation: (location: Location) => void;
  selectedLocation: Location | null;
}

const PRIORITY_LOCATION_IDS = [
  'port-harcourt',
  'lagos-state',
  'abuja',
  'bayelsa-state',
  'enugu-state',
];

/* ------------------------------------------------------------------
   🇳🇬 NIGERIA COMPLETE STATES AND MAJOR CITIES LIST
-------------------------------------------------------------------*/
const NIGERIA_LOCATIONS: Location[] = [
  // === States ===
  { id: 'abia-state', name: 'Abia State', state: 'Abia', type: 'state' },
  { id: 'adamawa-state', name: 'Adamawa State', state: 'Adamawa', type: 'state' },
  { id: 'akwa-ibom-state', name: 'Akwa Ibom State', state: 'Akwa Ibom', type: 'state' },
  { id: 'anambra-state', name: 'Anambra State', state: 'Anambra', type: 'state' },
  { id: 'bauchi-state', name: 'Bauchi State', state: 'Bauchi', type: 'state' },
  { id: 'bayelsa-state', name: 'Bayelsa State', state: 'Bayelsa', type: 'state' },
  { id: 'benue-state', name: 'Benue State', state: 'Benue', type: 'state' },
  { id: 'borno-state', name: 'Borno State', state: 'Borno', type: 'state' },
  { id: 'cross-river-state', name: 'Cross River State', state: 'Cross River', type: 'state' },
  { id: 'delta-state', name: 'Delta State', state: 'Delta', type: 'state' },
  { id: 'ebonyi-state', name: 'Ebonyi State', state: 'Ebonyi', type: 'state' },
  { id: 'edo-state', name: 'Edo State', state: 'Edo', type: 'state' },
  { id: 'ekiti-state', name: 'Ekiti State', state: 'Ekiti', type: 'state' },
  { id: 'enugu-state', name: 'Enugu State', state: 'Enugu', type: 'state' },
  { id: 'gombe-state', name: 'Gombe State', state: 'Gombe', type: 'state' },
  { id: 'imo-state', name: 'Imo State', state: 'Imo', type: 'state' },
  { id: 'jigawa-state', name: 'Jigawa State', state: 'Jigawa', type: 'state' },
  { id: 'kaduna-state', name: 'Kaduna State', state: 'Kaduna', type: 'state' },
  { id: 'kano-state', name: 'Kano State', state: 'Kano', type: 'state' },
  { id: 'katsina-state', name: 'Katsina State', state: 'Katsina', type: 'state' },
  { id: 'kebbi-state', name: 'Kebbi State', state: 'Kebbi', type: 'state' },
  { id: 'kogi-state', name: 'Kogi State', state: 'Kogi', type: 'state' },
  { id: 'kwara-state', name: 'Kwara State', state: 'Kwara', type: 'state' },
  { id: 'lagos-state', name: 'Lagos State', state: 'Lagos', type: 'state' },
  { id: 'nasarawa-state', name: 'Nasarawa State', state: 'Nasarawa', type: 'state' },
  { id: 'niger-state', name: 'Niger State', state: 'Niger', type: 'state' },
  { id: 'ogun-state', name: 'Ogun State', state: 'Ogun', type: 'state' },
  { id: 'ondo-state', name: 'Ondo State', state: 'Ondo', type: 'state' },
  { id: 'osun-state', name: 'Osun State', state: 'Osun', type: 'state' },
  { id: 'oyo-state', name: 'Oyo State', state: 'Oyo', type: 'state' },
  { id: 'plateau-state', name: 'Plateau State', state: 'Plateau', type: 'state' },
  { id: 'rivers-state', name: 'Rivers State', state: 'Rivers', type: 'state' },
  { id: 'sokoto-state', name: 'Sokoto State', state: 'Sokoto', type: 'state' },
  { id: 'taraba-state', name: 'Taraba State', state: 'Taraba', type: 'state' },
  { id: 'yobe-state', name: 'Yobe State', state: 'Yobe', type: 'state' },
  { id: 'zamfara-state', name: 'Zamfara State', state: 'Zamfara', type: 'state' },
  { id: 'fct', name: 'Federal Capital Territory', state: 'FCT', type: 'state' },

  // === Key Cities/Towns by State ===
  // Lagos
  { id: 'lagos-island', name: 'Lagos Island', state: 'Lagos', type: 'city', population: 1200000 },
  { id: 'ikeja', name: 'Ikeja', state: 'Lagos', type: 'city', population: 900000 },
  { id: 'lekki', name: 'Lekki', state: 'Lagos', type: 'city', population: 800000 },
  { id: 'surulere', name: 'Surulere', state: 'Lagos', type: 'city', population: 700000 },
  { id: 'ikoyi', name: 'Ikoyi', state: 'Lagos', type: 'city', population: 400000 },
  { id: 'alimosho', name: 'Alimosho', state: 'Lagos', type: 'city', population: 1200000 },
  { id: 'oshodi', name: 'Oshodi', state: 'Lagos', type: 'city', population: 500000 },
  { id: 'ikorodu', name: 'Ikorodu', state: 'Lagos', type: 'city', population: 600000 },
  { id: 'epe', name: 'Epe', state: 'Lagos', type: 'city', population: 200000 },
  { id: 'ajah', name: 'Ajah', state: 'Lagos', type: 'city', population: 300000 },

  // FCT
  { id: 'abuja', name: 'Abuja', state: 'FCT', type: 'city', population: 3000000 },
  { id: 'gwarinpa', name: 'Gwarinpa', state: 'FCT', type: 'city', population: 500000 },
  { id: 'asokoro', name: 'Asokoro', state: 'FCT', type: 'city', population: 200000 },
  { id: 'maitama', name: 'Maitama', state: 'FCT', type: 'city', population: 150000 },
  { id: 'wuse', name: 'Wuse', state: 'FCT', type: 'city', population: 300000 },
  { id: 'kubwa', name: 'Kubwa', state: 'FCT', type: 'city', population: 600000 },

  // Oyo
  { id: 'ibadan', name: 'Ibadan', state: 'Oyo', type: 'city', population: 3500000 },
  { id: 'ogbomoso', name: 'Ogbomoso', state: 'Oyo', type: 'city', population: 600000 },
  { id: 'oyo-town', name: 'Oyo', state: 'Oyo', type: 'city', population: 300000 },

  // Rivers
  { id: 'port-harcourt', name: 'Port Harcourt', state: 'Rivers', type: 'city', population: 1500000 },
  { id: 'obio-akpor', name: 'Obio-Akpor', state: 'Rivers', type: 'city', population: 800000 },
  { id: 'bonny', name: 'Bonny', state: 'Rivers', type: 'city', population: 120000 },
  { id: 'onelga', name: 'Omoku', state: 'Rivers', type: 'city', population: 250000 },
  { id: 'ogba', name: 'Ogba', state: 'Rivers', type: 'city', population: 200000 },
  { id: 'eleme', name: 'Eleme', state: 'Rivers', type: 'city', population: 220000 },
  { id: 'etche', name: 'Etche', state: 'Rivers', type: 'city', population: 150000 },
  { id: 'ahiazu', name: 'Ahoada', state: 'Rivers', type: 'city', population: 180000 },
  { id: 'oyigbo', name: 'Oyigbo', state: 'Rivers', type: 'city', population: 250000 },
  { id: 'okirika', name: 'Okrika', state: 'Rivers', type: 'city', population: 180000 },
  { id: 'degema', name: 'Degema', state: 'Rivers', type: 'city', population: 150000 },
  { id: 'bodo', name: 'Bodo', state: 'Rivers', type: 'city', population: 100000 },
  { id: 'buguma', name: 'Buguma', state: 'Rivers', type: 'city', population: 120000 },
  { id: 'abonnema', name: 'Abonnema', state: 'Rivers', type: 'city', population: 110000 },
  { id: 'asari-toru', name: 'Asari-Toru', state: 'Rivers', type: 'city', population: 130000 },
  { id: 'akor', name: 'Akor', state: 'Rivers', type: 'city', population: 90000 },
  { id: 'emuohua', name: 'Emohua', state: 'Rivers', type: 'city', population: 150000 },
  { id: 'abua', name: 'Abua', state: 'Rivers', type: 'city', population: 95000 },
  { id: 'andoni', name: 'Andoni', state: 'Rivers', type: 'city', population: 120000 },
  { id: 'opobo', name: 'Opobo', state: 'Rivers', type: 'city', population: 80000 },
  { id: 'nkpolu', name: 'Nkpolu', state: 'Rivers', type: 'city', population: 75000 },
  { id: 'elelenwo', name: 'Elelenwo', state: 'Rivers', type: 'city', population: 70000 },
  { id: 'rumuokoro', name: 'Rumuokoro', state: 'Rivers', type: 'city', population: 85000 },
  { id: 'rumuola', name: 'Rumuola', state: 'Rivers', type: 'city', population: 80000 },
  { id: 'trans-amadi', name: 'Trans-Amadi', state: 'Rivers', type: 'city', population: 90000 },
  { id: 'woji', name: 'Woji', state: 'Rivers', type: 'city', population: 75000 },
  { id: 'oduaha', name: 'Oduaha', state: 'Rivers', type: 'city', population: 60000 },
  { id: 'okporowo', name: 'Okporowo', state: 'Rivers', type: 'city', population: 50000 },
  { id: 'onyeama', name: 'Onyeama', state: 'Rivers', type: 'city', population: 45000 },
  { id: 'otamiri', name: 'Otamiri', state: 'Rivers', type: 'city', population: 40000 },
  { id: 'akoroma-rivers', name: 'Akoroma', state: 'Rivers', type: 'city', population: 38000 },
  { id: 'bonny-island', name: 'Bonny Island', state: 'Rivers', type: 'city', population: 150000 },
  { id: 'kalaibiama', name: 'Kalaibiama', state: 'Rivers', type: 'city', population: 60000 },
  { id: 'borokiri', name: 'Borokiri', state: 'Rivers', type: 'city', population: 70000 },
  { id: 'diobu', name: 'Diobu', state: 'Rivers', type: 'city', population: 80000 },
  { id: 'iruanya', name: 'Iruanya', state: 'Rivers', type: 'city', population: 45000 },
  { id: 'ke', name: 'Ke', state: 'Rivers', type: 'city', population: 42000 },
  { id: 'bille', name: 'Bille', state: 'Rivers', type: 'city', population: 40000 },
  { id: 'kalabari', name: 'Kalabari', state: 'Rivers', type: 'city', population: 90000 },
  { id: 'finima', name: 'Finima', state: 'Rivers', type: 'city', population: 70000 },

  // Bayelsa
  { id: 'yenagoa', name: 'Yenagoa', state: 'Bayelsa', type: 'city', population: 400000 },
  { id: 'sagbama', name: 'Sagbama', state: 'Bayelsa', type: 'city', population: 150000 },
  { id: 'ekeremor', name: 'Ekeremor', state: 'Bayelsa', type: 'city', population: 120000 },
  { id: 'ogbia', name: 'Ogbia', state: 'Bayelsa', type: 'city', population: 100000 },
  { id: 'amassoma', name: 'Amassoma', state: 'Bayelsa', type: 'city', population: 95000 },
  { id: 'otuoke', name: 'Otuoke', state: 'Bayelsa', type: 'city', population: 90000 },
  { id: 'toru-orua', name: 'Toru Orua', state: 'Bayelsa', type: 'city', population: 85000 },
  { id: 'kaiama', name: 'Kaiama', state: 'Bayelsa', type: 'city', population: 95000 },
  { id: 'nembe', name: 'Nembe', state: 'Bayelsa', type: 'city', population: 120000 },
  { id: 'brass', name: 'Brass', state: 'Bayelsa', type: 'city', population: 110000 },
  { id: 'okpoama', name: 'Okpoama', state: 'Bayelsa', type: 'city', population: 80000 },
  { id: 'twon-brass', name: 'Twon Brass', state: 'Bayelsa', type: 'city', population: 75000 },
  { id: 'opume', name: 'Opume', state: 'Bayelsa', type: 'city', population: 70000 },
  { id: 'peremabiri', name: 'Peremabiri', state: 'Bayelsa', type: 'city', population: 60000 },
  { id: 'otuan', name: 'Otuan', state: 'Bayelsa', type: 'city', population: 65000 },
  { id: 'sampou', name: 'Sampou', state: 'Bayelsa', type: 'city', population: 50000 },
  { id: 'ikibiri', name: 'Ikibiri', state: 'Bayelsa', type: 'city', population: 55000 },
  { id: 'swali', name: 'Swali', state: 'Bayelsa', type: 'city', population: 90000 },
  { id: 'agudama-epie', name: 'Agudama-Epie', state: 'Bayelsa', type: 'city', population: 85000 },
  { id: 'amassoma-town', name: 'Amassoma Town', state: 'Bayelsa', type: 'city', population: 95000 },
  { id: 'ikoroma', name: 'Ikoroma', state: 'Bayelsa', type: 'city', population: 60000 },
  { id: 'akoroma', name: 'Akoroma', state: 'Bayelsa', type: 'city', population: 65000 },
  { id: 'ogboloma', name: 'Ogboloma', state: 'Bayelsa', type: 'city', population: 70000 },
  { id: 'okodi', name: 'Okodi', state: 'Bayelsa', type: 'city', population: 60000 },
  { id: 'bomo', name: 'Bomo', state: 'Bayelsa', type: 'city', population: 55000 },
  { id: 'agbura', name: 'Agbura', state: 'Bayelsa', type: 'city', population: 70000 },
  { id: 'ayakoro', name: 'Ayakoro', state: 'Bayelsa', type: 'city', population: 65000 },
  { id: 'olobiri', name: 'Olobiri', state: 'Bayelsa', type: 'city', population: 60000 },
  { id: 'peretoru', name: 'Peretoru', state: 'Bayelsa', type: 'city', population: 55000 },
  { id: 'egbemo', name: 'Egbemo', state: 'Bayelsa', type: 'city', population: 50000 },
  { id: 'akorogbene', name: 'Akorogbene', state: 'Bayelsa', type: 'city', population: 48000 },
  { id: 'angalabiri', name: 'Angalabiri', state: 'Bayelsa', type: 'city', population: 46000 },
  { id: 'ogobiri', name: 'Ogobiri', state: 'Bayelsa', type: 'city', population: 44000 },
  { id: 'bolou-orua', name: 'Bolou-Orua', state: 'Bayelsa', type: 'city', population: 42000 },
  { id: 'okumbiri', name: 'Okumbiri', state: 'Bayelsa', type: 'city', population: 40000 },
  { id: 'ozuobiri', name: 'Ozuobiri', state: 'Bayelsa', type: 'city', population: 39000 },
  { id: 'ekowe', name: 'Ekowe', state: 'Bayelsa', type: 'city', population: 38000 },
  { id: 'koroama', name: 'Koroama', state: 'Bayelsa', type: 'city', population: 37000 },
  { id: 'akalome', name: 'Akalome', state: 'Bayelsa', type: 'city', population: 35000 },
  { id: 'ogbolomabiri', name: 'Ogbolomabiri', state: 'Bayelsa', type: 'city', population: 34000 },
  { id: 'bassambiri', name: 'Bassambiri', state: 'Bayelsa', type: 'city', population: 33000 },
  { id: 'okpoama-brass', name: 'Okpoama Brass', state: 'Bayelsa', type: 'city', population: 32000 },

  // Delta
  { id: 'asaba', name: 'Asaba', state: 'Delta', type: 'city', population: 500000 },
  { id: 'warri', name: 'Warri', state: 'Delta', type: 'city', population: 700000 },
  { id: 'sapele', name: 'Sapele', state: 'Delta', type: 'city', population: 300000 },
  { id: 'agbor', name: 'Agbor', state: 'Delta', type: 'city', population: 250000 },
  { id: 'ughelli', name: 'Ughelli', state: 'Delta', type: 'city', population: 280000 },
  { id: 'okwudor', name: 'Okwudor', state: 'Delta', type: 'city', population: 200000 },
  { id: 'ole', name: 'Oleh', state: 'Delta', type: 'city', population: 180000 },
  { id: 'ozoro', name: 'Ozoro', state: 'Delta', type: 'city', population: 160000 },
  { id: 'patani', name: 'Patani', state: 'Delta', type: 'city', population: 120000 },
  { id: 'okwokoko', name: 'Okwe', state: 'Delta', type: 'city', population: 100000 },
  { id: 'kwale', name: 'Kwale', state: 'Delta', type: 'city', population: 140000 },
  { id: 'obiaruku', name: 'Obiaruku', state: 'Delta', type: 'city', population: 130000 },
  { id: 'abraka', name: 'Abraka', state: 'Delta', type: 'city', population: 150000 },
  { id: 'okpe', name: 'Okpe', state: 'Delta', type: 'city', population: 120000 },
  { id: 'ogwashi-uku', name: 'Ogwashi-Uku', state: 'Delta', type: 'city', population: 140000 },
  { id: 'ibusa', name: 'Ibusa', state: 'Delta', type: 'city', population: 130000 },
  { id: 'isoko', name: 'Isoko', state: 'Delta', type: 'city', population: 110000 },
  { id: 'burutu', name: 'Burutu', state: 'Delta', type: 'city', population: 100000 },
  { id: 'bomadi', name: 'Bomadi', state: 'Delta', type: 'city', population: 95000 },
  { id: 'koko', name: 'Koko', state: 'Delta', type: 'city', population: 90000 },
  { id: 'efurun', name: 'Effurun', state: 'Delta', type: 'city', population: 200000 },
  { id: 'uvwie', name: 'Uvwie', state: 'Delta', type: 'city', population: 160000 },
  { id: 'uzere', name: 'Uzere', state: 'Delta', type: 'city', population: 80000 },
  { id: 'aboh', name: 'Aboh', state: 'Delta', type: 'city', population: 70000 },
  { id: 'ogulagha', name: 'Ogulagha', state: 'Delta', type: 'city', population: 60000 },
  { id: 'gbaramatu', name: 'Gbaramatu', state: 'Delta', type: 'city', population: 55000 },
  { id: 'ekpan', name: 'Ekpan', state: 'Delta', type: 'city', population: 150000 },
  { id: 'ugbokodo', name: 'Ugbokodo', state: 'Delta', type: 'city', population: 65000 },
  { id: 'egini', name: 'Egini', state: 'Delta', type: 'city', population: 60000 },
  { id: 'onyeama', name: 'Onyeama', state: 'Delta', type: 'city', population: 50000 },
  { id: 'ebedei', name: 'Ebedei', state: 'Delta', type: 'city', population: 48000 },
  { id: 'umutu', name: 'Umutu', state: 'Delta', type: 'city', population: 46000 },
  { id: 'okpanam', name: 'Okpanam', state: 'Delta', type: 'city', population: 90000 },
  { id: 'araya', name: 'Araya', state: 'Delta', type: 'city', population: 40000 },
  { id: 'ugbokodo', name: 'Ugbokodo', state: 'Delta', type: 'city', population: 55000 },
  { id: 'okerenkoko', name: 'Okerenkoko', state: 'Delta', type: 'city', population: 60000 },
  { id: 'okpai', name: 'Okpai', state: 'Delta', type: 'city', population: 50000 },
  { id: 'ofagbe', name: 'Ofagbe', state: 'Delta', type: 'city', population: 42000 },
  { id: 'obi', name: 'Obi', state: 'Delta', type: 'city', population: 38000 },
  { id: 'etua', name: 'Etua', state: 'Delta', type: 'city', population: 35000 },
  { id: 'ughelli-south', name: 'Ughelli South', state: 'Delta', type: 'city', population: 250000 },

  // Kano
  { id: 'kano-city', name: 'Kano', state: 'Kano', type: 'city', population: 4000000 },
  { id: 'wudil', name: 'Wudil', state: 'Kano', type: 'city', population: 150000 },
  { id: 'gwale', name: 'Gwale', state: 'Kano', type: 'city', population: 120000 },

  // Enugu
  { id: 'enugu-city', name: 'Enugu', state: 'Enugu', type: 'city', population: 800000 },
  { id: 'nsukka', name: 'Nsukka', state: 'Enugu', type: 'city', population: 350000 },

  // Ogun
  { id: 'abeokuta', name: 'Abeokuta', state: 'Ogun', type: 'city', population: 600000 },
  { id: 'ijebu-ode', name: 'Ijebu Ode', state: 'Ogun', type: 'city', population: 350000 },

  // Edo
  { id: 'benin-city', name: 'Benin City', state: 'Edo', type: 'city', population: 1200000 },
  { id: 'auch', name: 'Auchi', state: 'Edo', type: 'city', population: 200000 },

  // Imo
  { id: 'owerri', name: 'Owerri', state: 'Imo', type: 'city', population: 400000 },
  { id: 'orlu', name: 'Orlu', state: 'Imo', type: 'city', population: 250000 },

  // Others
  { id: 'jos', name: 'Jos', state: 'Plateau', type: 'city', population: 900000 },
  { id: 'calabar', name: 'Calabar', state: 'Cross River', type: 'city', population: 400000 },
  { id: 'maiduguri', name: 'Maiduguri', state: 'Borno', type: 'city', population: 1200000 },
  { id: 'ilorin', name: 'Ilorin', state: 'Kwara', type: 'city', population: 800000 },
  { id: 'osogbo', name: 'Osogbo', state: 'Osun', type: 'city', population: 400000 },
  { id: 'bauchi', name: 'Bauchi', state: 'Bauchi', type: 'city', population: 600000 },
  { id: 'sokoto', name: 'Sokoto', state: 'Sokoto', type: 'city', population: 700000 },
  { id: 'yola', name: 'Yola', state: 'Adamawa', type: 'city', population: 400000 },
  { id: 'uyo', name: 'Uyo', state: 'Akwa Ibom', type: 'city', population: 500000 },
  { id: 'awka', name: 'Awka', state: 'Anambra', type: 'city', population: 400000 },
  { id: 'onitsha', name: 'Onitsha', state: 'Anambra', type: 'city', population: 600000 },
  { id: 'ado-ekiti', name: 'Ado Ekiti', state: 'Ekiti', type: 'city', population: 300000 },
  { id: 'lafia', name: 'Lafia', state: 'Nasarawa', type: 'city', population: 250000 },
  { id: 'minna', name: 'Minna', state: 'Niger', type: 'city', population: 400000 },
  { id: 'lokoja', name: 'Lokoja', state: 'Kogi', type: 'city', population: 350000 },
  { id: 'damaturu', name: 'Damaturu', state: 'Yobe', type: 'city', population: 200000 },
  { id: 'gusau', name: 'Gusau', state: 'Zamfara', type: 'city', population: 300000 },
  { id: 'jalingo', name: 'Jalingo', state: 'Taraba', type: 'city', population: 250000 },
  { id: 'birnin-kebbi', name: 'Birnin Kebbi', state: 'Kebbi', type: 'city', population: 250000 },
];

/* ------------------------------------------------------------------
   🔍 Hook Definition
-------------------------------------------------------------------*/
export function useLocationSearch(options: UseLocationSearchOptions = {}): UseLocationSearchResult {
  const { debounceMs = 300, maxResults = 10, includeStates = true, includePopularCities = true } = options;

  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const popularLocations = useMemo(() => {
    if (!includePopularCities) return [];
    return NIGERIA_LOCATIONS
      .filter((l) => l.type === 'city' && (l.population || 0) > 700000)
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 8);
  }, [includePopularCities]);

  const defaultSuggestions = useMemo(() => {
    const allowed = NIGERIA_LOCATIONS.filter((loc) => (includeStates ? true : loc.type === 'city'));
    const byId = new Map(allowed.map((loc) => [loc.id, loc]));

    const prioritized = PRIORITY_LOCATION_IDS
      .map((id) => byId.get(id))
      .filter((loc): loc is Location => !!loc);

    const remaining = allowed
      .filter((loc) => !PRIORITY_LOCATION_IDS.includes(loc.id))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'city' ? -1 : 1;
        return (b.population || 0) - (a.population || 0);
      });

    return [...prioritized, ...remaining].slice(0, maxResults);
  }, [includeStates, maxResults]);

  const searchLocations = useCallback(
    (searchQuery: string): Location[] => {
      if (!searchQuery.trim()) return [];
      const q = searchQuery.toLowerCase().trim();

      const results = NIGERIA_LOCATIONS.filter((loc) =>
        [loc.name.toLowerCase(), loc.state.toLowerCase()].some((t) => t.includes(q))
      );

      return results
        .filter((loc) => (includeStates ? true : loc.type === 'city'))
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'city' ? -1 : 1;
          return (b.population || 0) - (a.population || 0);
        })
        .slice(0, maxResults);
    },
    [includeStates, maxResults]
  );

  const [results, setResults] = useState<Location[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const id = setTimeout(() => {
      setResults(searchLocations(query));
      setIsLoading(false);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [query, searchLocations, debounceMs]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedLocation(null);
  }, []);

  const selectLocation = useCallback((loc: Location) => {
    setSelectedLocation(loc);
    setQuery(loc.name);
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    defaultSuggestions,
    isLoading,
    popularLocations,
    clearQuery,
    selectLocation,
    selectedLocation,
  };
}

/* ------------------------------------------------------------------
   🧭 Utilities
-------------------------------------------------------------------*/
export function formatLocationName(location: Location): string {
  return location.type === 'state' ? location.name : `${location.name}, ${location.state}`;
}

export function getLocationIcon(location: Location): string {
  if (location.type === 'state') return 'map-pin';
  const pop = location.population || 0;
  if (pop > 1000000) return 'building-2';
  if (pop > 500000) return 'building';
  return 'map-pin';
}
