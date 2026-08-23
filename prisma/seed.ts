/**
 * Prisma Seed File — Bayelsa State Hotels & Event Centers
 * Targets the current RealEST Connect agent account.
 *
 * Run with:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *   or via package.json prisma.seed script
 *
 * Agent account used:
 *   email       : agent@connect.realest.ng
 */

import { prisma } from "../lib/prisma";

// const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// EXISTING AGENT — RealEST Connect
// ---------------------------------------------------------------------------
const AGENT_EMAIL = "agent@connect.realest.ng";

let AGENT_ID = "";

// ---------------------------------------------------------------------------
// RAW DATA — Hotels & Event Centers in Bayelsa State
// ---------------------------------------------------------------------------

interface VenueData {
  title: string;
  description: string;
  property_type: "hotel" | "event_center";
  listing_type: "location";
  price: number;
  price_frequency: "nightly" | "daily";
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  amenities: Record<string, boolean | string | number>;
  features: Record<string, string | boolean>;
  details: {
    has_pool?: boolean;
    has_garden?: boolean;
    has_garage?: boolean;
    parking_spaces?: number;
    heating_type?: string;
    cooling_type?: string;
    flooring_type?: string;
  };
  media: { label: string; is_featured: boolean }[];
}

const venues: VenueData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // HOTELS
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Best Western Plus Yenagoa (Oxbow Lake)",
    description:
      "International-standard luxury hotel positioned at the scenic Oxbow Lake in the heart of Yenagoa. Offers elegantly furnished rooms, suites, fully serviced apartments, a Chinese restaurant, spa, fitness center, and conference halls. The first globally branded hotel in Bayelsa State.",
    property_type: "hotel",
    listing_type: "location",
    price: 85000,
    price_frequency: "nightly",
    address: "Oxbow Lake Road, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9247,
    longitude: 6.2676,
    bedrooms: 80,
    bathrooms: 80,
    square_feet: 45000,
    amenities: {
      free_wifi: true,
      swimming_pool: true,
      spa: true,
      gym: true,
      restaurant: true,
      conference_hall: true,
      bar: true,
      room_service: true,
      flat_screen_tv: true,
      mini_bar: true,
      valet_parking: true,
      airport_shuttle: true,
    },
    features: {
      star_rating: "4",
      view: "Oxbow Lake view",
      brand: "Best Western Plus",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      has_garden: true,
      has_parking: true,
      parking_spaces: 60,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble & Hardwood",
    } as any,
    media: [
      { label: "Hotel facade — Oxbow Lake view", is_featured: true },
      { label: "Deluxe room interior", is_featured: false },
      { label: "Outdoor swimming pool", is_featured: false },
      { label: "Conference hall", is_featured: false },
    ],
  },
  {
    title: "Aridolf Resort Wellness & Spa",
    description:
      "A luxury resort on Isaac Boro Expressway in Okaka Estate, offering fully furnished soundproof suites, a banqueting center, fitness center, and comprehensive wellness facilities. Popular for corporate retreats and high-end leisure stays.",
    property_type: "hotel",
    listing_type: "location",
    price: 65000,
    price_frequency: "nightly",
    address: "Okaka Estate, Along Isaac Boro Expressway, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9310,
    longitude: 6.2580,
    bedrooms: 50,
    bathrooms: 50,
    square_feet: 35000,
    amenities: {
      free_wifi: true,
      swimming_pool: true,
      spa: true,
      gym: true,
      restaurant: true,
      banquet_hall: true,
      bar: true,
      room_service: true,
      soundproof_rooms: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "4",
      specialty: "Wellness & Spa",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      has_garden: true,
      parking_spaces: 40,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble",
    },
    media: [
      { label: "Resort main entrance", is_featured: true },
      { label: "Spa treatment room", is_featured: false },
      { label: "Banqueting hall", is_featured: false },
    ],
  },
  {
    title: "Royal Tulip Castle Hotel",
    description:
      "Prestigious hotel situated within the Government House premises in Yenagoa. Features luxurious rooms with balconies, a fitness center, swimming pool, and a dedicated event center — the preferred choice for government dignitaries and senior executives.",
    property_type: "hotel",
    listing_type: "location",
    price: 70000,
    price_frequency: "nightly",
    address: "Government House Premises, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9267,
    longitude: 6.2720,
    bedrooms: 60,
    bathrooms: 60,
    square_feet: 40000,
    amenities: {
      free_wifi: true,
      swimming_pool: true,
      gym: true,
      restaurant: true,
      event_center: true,
      bar: true,
      room_service: true,
      balcony: true,
      air_conditioning: true,
      security: true,
    },
    features: {
      star_rating: "4",
      brand: "Royal Tulip",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      parking_spaces: 50,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble",
    },
    media: [
      { label: "Castle hotel exterior", is_featured: true },
      { label: "Presidential suite", is_featured: false },
      { label: "Swimming pool deck", is_featured: false },
    ],
  },
  {
    title: "Ayalla Hotels Limited",
    description:
      "Well-established hotel on Isaac Boro Expressway in Kpansia, offering modern amenities including a gym, restaurant, swimming pool, and internet access. A popular choice for business travelers visiting Yenagoa.",
    property_type: "hotel",
    listing_type: "location",
    price: 45000,
    price_frequency: "nightly",
    address: "Isaac Boro Express Way, Kpansia, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9150,
    longitude: 6.2550,
    bedrooms: 45,
    bathrooms: 45,
    square_feet: 22000,
    amenities: {
      free_wifi: true,
      swimming_pool: true,
      gym: true,
      restaurant: true,
      bar: true,
      room_service: true,
      air_conditioning: true,
      parking: true,
    },
    features: {
      star_rating: "3",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      parking_spaces: 30,
      cooling_type: "Split Air Conditioning",
    },
    media: [
      { label: "Hotel main entrance", is_featured: true },
      { label: "Standard room", is_featured: false },
      { label: "Restaurant area", is_featured: false },
    ],
  },
  {
    title: "Matho Crystal Hotel",
    description:
      "Boutique hotel on Imiringi Road offering luxuriously furnished rooms and suites, a swimming pool, VIP lounge, sports and fitness center. Known for its elegant interior design and attentive service.",
    property_type: "hotel",
    listing_type: "location",
    price: 40000,
    price_frequency: "nightly",
    address: "Plot 45 Imiringi Road, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9200,
    longitude: 6.2650,
    bedrooms: 35,
    bathrooms: 35,
    square_feet: 18000,
    amenities: {
      free_wifi: true,
      swimming_pool: true,
      gym: true,
      vip_lounge: true,
      restaurant: true,
      bar: true,
      room_service: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "3",
      specialty: "Boutique",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      parking_spaces: 25,
      cooling_type: "Split Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [
      { label: "Crystal hotel exterior", is_featured: true },
      { label: "VIP lounge", is_featured: false },
      { label: "Pool area", is_featured: false },
    ],
  },
  {
    title: "144 Suites Luxury Hotel",
    description:
      "Modern business hotel on Asueifa Hospital Street offering a bar, conferencing facilities, sauna, garden terrace, and complimentary continental breakfast. Highly rated by corporate guests for its professional environment.",
    property_type: "hotel",
    listing_type: "location",
    price: 35000,
    price_frequency: "nightly",
    address: "Asueifa Hospital Street, Off Baybridge Road, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9280,
    longitude: 6.2700,
    bedrooms: 40,
    bathrooms: 40,
    square_feet: 20000,
    amenities: {
      free_wifi: true,
      conference_facility: true,
      sauna: true,
      restaurant: true,
      bar: true,
      room_service: true,
      complimentary_breakfast: true,
      garden: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "3.5",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
      breakfast: "07:00 AM – 12:00 PM",
    },
    details: {
      has_garden: true,
      parking_spaces: 30,
      cooling_type: "Split Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [
      { label: "Hotel lobby", is_featured: true },
      { label: "Conference room", is_featured: false },
      { label: "Garden terrace", is_featured: false },
    ],
  },
  {
    title: "De Brass Suites Hotel",
    description:
      "Charming 3.5-star hotel on Azikoro Road in Ekeki district. Known for its clean comfortable rooms, business center, restaurant, bar, and consistent room service. A reliable mid-range option in central Yenagoa.",
    property_type: "hotel",
    listing_type: "location",
    price: 30000,
    price_frequency: "nightly",
    address: "47 Azikoro Road, Ekeki, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9220,
    longitude: 6.2730,
    bedrooms: 30,
    bathrooms: 30,
    square_feet: 15000,
    amenities: {
      free_wifi: true,
      business_center: true,
      restaurant: true,
      bar: true,
      room_service: true,
      air_conditioning: true,
      parking: true,
    },
    features: {
      star_rating: "3.5",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      parking_spaces: 20,
      cooling_type: "Split Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [
      { label: "Hotel exterior Azikoro Road", is_featured: true },
      { label: "Standard room interior", is_featured: false },
    ],
  },
  {
    title: "Celebrity Hotels Yenagoa",
    description:
      "Modern 60-room hotel offering private balconies, complimentary breakfast, dry cleaning services, and free valet parking. A stylish and social atmosphere makes it popular with local and domestic travelers.",
    property_type: "hotel",
    listing_type: "location",
    price: 28000,
    price_frequency: "nightly",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9190,
    longitude: 6.2690,
    bedrooms: 60,
    bathrooms: 60,
    square_feet: 25000,
    amenities: {
      free_wifi: true,
      restaurant: true,
      bar: true,
      room_service: true,
      complimentary_breakfast: true,
      valet_parking: true,
      dry_cleaning: true,
      balcony: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "3",
      check_in: "2:00 PM",
      check_out: "11:00 AM",
      breakfast: "07:00 AM – 11:00 AM",
    },
    details: {
      parking_spaces: 40,
      cooling_type: "Split Air Conditioning",
    },
    media: [{ label: "Celebrity Hotels facade", is_featured: true }],
  },
  {
    title: "Marcliff Apartments Yenagoa",
    description:
      "Premium apartment-style hotel with 50 guestrooms each featuring a private pool, private hot tub, and private balcony. Fully equipped kitchens with refrigerators, ovens, and stovetops. Ideal for extended stays with a residential feel.",
    property_type: "hotel",
    listing_type: "location",
    price: 55000,
    price_frequency: "nightly",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9235,
    longitude: 6.2660,
    bedrooms: 50,
    bathrooms: 50,
    square_feet: 30000,
    amenities: {
      free_wifi: true,
      private_pool: true,
      private_hot_tub: true,
      full_kitchen: true,
      balcony: true,
      valet_parking: true,
      dry_cleaning: true,
      air_conditioning: true,
      front_desk_24h: true,
    },
    features: {
      star_rating: "4",
      type: "Serviced Apartments",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      has_pool: true,
      has_garden: true,
      parking_spaces: 50,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Hardwood",
    },
    media: [
      { label: "Apartment exterior", is_featured: true },
      { label: "Private pool suite", is_featured: false },
      { label: "Full kitchen", is_featured: false },
    ],
  },
  {
    title: "EBIIS Hotel Yenagoa",
    description:
      "Well-appointed 60-room hotel offering complimentary continental breakfast, free valet parking, and a warm hospitable atmosphere. A solid choice for both business and leisure visitors to Bayelsa.",
    property_type: "hotel",
    listing_type: "location",
    price: 25000,
    price_frequency: "nightly",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9160,
    longitude: 6.2610,
    bedrooms: 60,
    bathrooms: 60,
    square_feet: 22000,
    amenities: {
      free_wifi: true,
      restaurant: true,
      bar: true,
      complimentary_breakfast: true,
      valet_parking: true,
      room_service: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "3",
      check_in: "2:00 PM",
      check_out: "11:00 AM",
      breakfast: "07:00 AM – 11:00 AM",
    },
    details: {
      parking_spaces: 35,
      cooling_type: "Split Air Conditioning",
    },
    media: [{ label: "EBIIS Hotel main entrance", is_featured: true }],
  },
  {
    title: "Tap Talle Hotels and Suites",
    description:
      "Comfortable hotel in Yenagoa with 60 rooms featuring private balconies, complimentary breakfast, and free valet parking. Offers a relaxed environment for both short and extended stays.",
    property_type: "hotel",
    listing_type: "location",
    price: 22000,
    price_frequency: "nightly",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9175,
    longitude: 6.2625,
    bedrooms: 60,
    bathrooms: 60,
    square_feet: 20000,
    amenities: {
      free_wifi: true,
      restaurant: true,
      bar: true,
      complimentary_breakfast: true,
      valet_parking: true,
      balcony: true,
      air_conditioning: true,
    },
    features: {
      star_rating: "3",
      check_in: "2:00 PM",
      check_out: "11:00 AM",
    },
    details: {
      parking_spaces: 30,
      cooling_type: "Split Air Conditioning",
    },
    media: [{ label: "Tap Talle hotel exterior", is_featured: true }],
  },
  {
    title: "Southern Atlantic Hotel",
    description:
      "Long-standing hotel in Yenagoa known for its welcoming Ijaw hospitality, restaurant serving local and continental cuisine, and proximity to the waterways. A dependable option for visitors exploring Niger Delta culture.",
    property_type: "hotel",
    listing_type: "location",
    price: 20000,
    price_frequency: "nightly",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9130,
    longitude: 6.2590,
    bedrooms: 35,
    bathrooms: 35,
    square_feet: 16000,
    amenities: {
      free_wifi: true,
      restaurant: true,
      bar: true,
      room_service: true,
      air_conditioning: true,
      parking: true,
    },
    features: {
      star_rating: "2.5",
      specialty: "Local cuisine & Niger Delta hospitality",
      check_in: "2:00 PM",
      check_out: "12:00 PM",
    },
    details: {
      parking_spaces: 20,
      cooling_type: "Split Air Conditioning",
    },
    media: [{ label: "Southern Atlantic Hotel entrance", is_featured: true }],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT CENTERS
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Trendy Event Center",
    description:
      "A modern, purpose-built conference and event center on Mbiama-Yenagoa Road. Versatile hall layouts accommodate conferences, corporate training, weddings, and social events. Equipped with state-of-the-art AV systems and air conditioning.",
    property_type: "event_center",
    listing_type: "location",
    price: 350000,
    price_frequency: "daily",
    address: "08 Mbiama-Yenagoa Road, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9050,
    longitude: 6.2420,
    square_feet: 8000,
    amenities: {
      air_conditioning: true,
      av_equipment: true,
      stage: true,
      changing_room: true,
      parking: true,
      catering_kitchen: true,
      generator: true,
      security: true,
      wifi: true,
    },
    features: {
      capacity: "500",
      event_types: "Weddings, Conferences, Corporate Training, Social Events",
      layout: "Flexible hall layout",
    },
    details: {
      has_garden: true,
      parking_spaces: 100,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [
      { label: "Main hall interior", is_featured: true },
      { label: "Conference setup", is_featured: false },
      { label: "Outdoor parking area", is_featured: false },
    ],
  },
  {
    title: "Jerry Century Event Centre",
    description:
      "World-class event venue in Yenagoa offering modern facilities for all event types including weddings, corporate functions, concerts, and exhibitions. Known for its exceptional finishes and full event support services.",
    property_type: "event_center",
    listing_type: "location",
    price: 500000,
    price_frequency: "daily",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9290,
    longitude: 6.2760,
    square_feet: 12000,
    amenities: {
      air_conditioning: true,
      av_equipment: true,
      stage: true,
      dressing_room: true,
      vip_lounge: true,
      parking: true,
      catering_kitchen: true,
      generator: true,
      security: true,
      wifi: true,
    },
    features: {
      capacity: "1000",
      event_types: "Weddings, Concerts, Corporate Events, Exhibitions, Graduations",
      layout: "Multi-hall complex",
    },
    details: {
      has_garden: true,
      parking_spaces: 200,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble",
    },
    media: [
      { label: "Grand hall decorated for wedding", is_featured: true },
      { label: "VIP lounge area", is_featured: false },
      { label: "Stage and AV setup", is_featured: false },
    ],
  },
  {
    title: "Samphino Hotels Hall",
    description:
      "Dedicated event hall within Samphino Hotels, offering a fully air-conditioned space for weddings, birthday parties, corporate meetings, and social gatherings. Backed by the hotel's catering and hospitality team.",
    property_type: "event_center",
    listing_type: "location",
    price: 250000,
    price_frequency: "daily",
    address: "Samphino Hotels, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9215,
    longitude: 6.2680,
    square_feet: 5000,
    amenities: {
      air_conditioning: true,
      catering_service: true,
      stage: true,
      parking: true,
      generator: true,
      security: true,
      wifi: true,
      hotel_support: true,
    },
    features: {
      capacity: "300",
      event_types: "Weddings, Birthday Parties, Corporate Meetings, Social Gatherings",
    },
    details: {
      parking_spaces: 60,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [
      { label: "Banquet hall main view", is_featured: true },
      { label: "Catering setup", is_featured: false },
    ],
  },
  {
    title: "Aridolf Resort Banqueting Center",
    description:
      "Premium banqueting and events facility within Aridolf Resort, set in the serene Okaka Estate. Ideal for gala dinners, high-profile receptions, and corporate award ceremonies. Combines luxury resort amenities with world-class event hosting.",
    property_type: "event_center",
    listing_type: "location",
    price: 600000,
    price_frequency: "daily",
    address: "Okaka Estate, Isaac Boro Expressway, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9312,
    longitude: 6.2582,
    square_feet: 10000,
    amenities: {
      air_conditioning: true,
      av_equipment: true,
      stage: true,
      vip_lounge: true,
      spa_access: true,
      pool_access: true,
      catering_service: true,
      parking: true,
      generator: true,
      security: true,
      wifi: true,
    },
    features: {
      capacity: "700",
      event_types: "Gala Dinners, Receptions, Corporate Award Ceremonies, Weddings",
      backdrop: "Resort garden & pool view",
    },
    details: {
      has_pool: true,
      has_garden: true,
      parking_spaces: 150,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble",
    },
    media: [
      { label: "Banquet hall gala setup", is_featured: true },
      { label: "Garden reception area", is_featured: false },
      { label: "VIP entrance", is_featured: false },
    ],
  },
  {
    title: "Royal Tulip Castle Event Center",
    description:
      "Elegant event center within the Royal Tulip Castle Hotel at Government House. Preferred by government bodies, international organizations, and premium clients. Features top-tier AV, catering, and on-site security.",
    property_type: "event_center",
    listing_type: "location",
    price: 550000,
    price_frequency: "daily",
    address: "Government House Premises, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9268,
    longitude: 6.2722,
    square_feet: 9000,
    amenities: {
      air_conditioning: true,
      av_equipment: true,
      stage: true,
      vip_lounge: true,
      catering_service: true,
      parking: true,
      generator: true,
      security: true,
      wifi: true,
    },
    features: {
      capacity: "600",
      event_types: "State Functions, Conferences, Weddings, Corporate Events",
      prestige: "Government House location",
    },
    details: {
      has_garden: true,
      parking_spaces: 120,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble",
    },
    media: [
      { label: "Event center grand hall", is_featured: true },
      { label: "Conference boardroom", is_featured: false },
    ],
  },
  {
    title: "Best Western Plus Conference Halls",
    description:
      "State-of-the-art conference and meeting facilities at Best Western Plus Yenagoa on Oxbow Lake. Designed for international conferences, government delegations, and corporate retreats. Multiple breakout rooms and full AV support.",
    property_type: "event_center",
    listing_type: "location",
    price: 750000,
    price_frequency: "daily",
    address: "Oxbow Lake Road, Yenagoa",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9248,
    longitude: 6.2677,
    square_feet: 15000,
    amenities: {
      air_conditioning: true,
      av_equipment: true,
      projector: true,
      live_streaming: true,
      simultaneous_translation: true,
      breakout_rooms: true,
      catering_service: true,
      parking: true,
      generator: true,
      security: true,
      wifi: true,
    },
    features: {
      capacity: "800",
      event_types: "International Conferences, Corporate Summits, Government Events, Award Ceremonies",
      brand: "Best Western Plus",
      view: "Oxbow Lake",
    },
    details: {
      has_pool: true,
      has_garden: true,
      parking_spaces: 200,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Marble & Carpet",
    },
    media: [
      { label: "Main conference hall plenary setup", is_featured: true },
      { label: "Breakout rooms", is_featured: false },
      { label: "Oxbow Lake view from venue", is_featured: false },
    ],
  },
  {
    title: "Bayelsa Cultural Center",
    description:
      "State-owned multipurpose cultural and events venue in Yenagoa, regularly hosting cultural festivals, government events, concerts, graduation ceremonies, and large community gatherings. Celebrates the rich Ijaw heritage of Bayelsa State.",
    property_type: "event_center",
    listing_type: "location",
    price: 200000,
    price_frequency: "daily",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9260,
    longitude: 6.2740,
    square_feet: 20000,
    amenities: {
      air_conditioning: true,
      stage: true,
      exhibition_space: true,
      parking: true,
      generator: true,
      security: true,
      outdoor_grounds: true,
    },
    features: {
      capacity: "2000",
      event_types: "Cultural Festivals, Concerts, Graduations, Government Events, Trade Fairs",
      ownership: "State Government",
    },
    details: {
      has_garden: true,
      parking_spaces: 300,
      cooling_type: "Central Air Conditioning",
      flooring_type: "Terrazzo",
    },
    media: [
      { label: "Cultural center main auditorium", is_featured: true },
      { label: "Exhibition hall", is_featured: false },
      { label: "Outdoor festival grounds", is_featured: false },
    ],
  },
  {
    title: "Kalee Guest House Hall",
    description:
      "Intimate event hall at Kalee Guest House — a popular, affordable venue for birthday parties, small weddings, naming ceremonies, and community gatherings in Yenagoa. Good value with basic amenities and a friendly team.",
    property_type: "event_center",
    listing_type: "location",
    price: 100000,
    price_frequency: "daily",
    address: "Yenagoa, Bayelsa State",
    city: "Yenagoa",
    state: "Bayelsa",
    latitude: 4.9170,
    longitude: 6.2640,
    square_feet: 3000,
    amenities: {
      air_conditioning: true,
      parking: true,
      generator: true,
      security: true,
      basic_kitchen: true,
    },
    features: {
      capacity: "150",
      event_types: "Birthday Parties, Small Weddings, Naming Ceremonies, Community Events",
      budget: "Budget-friendly",
    },
    details: {
      parking_spaces: 30,
      cooling_type: "Split Air Conditioning",
      flooring_type: "Tiles",
    },
    media: [{ label: "Kalee Guest House Hall interior", is_featured: true }],
  },
];

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting Bayelsa venues seed...");
  console.log(`   Agent Email: ${AGENT_EMAIL} (RealEST Connect)\n`);

  const existingAgent = await prisma.agents.findFirst({
    where: { profiles: { email: AGENT_EMAIL } },
    include: { profiles: { select: { full_name: true, email: true } } },
  });

  if (!existingAgent) {
    throw new Error(
      `Agent with email ${AGENT_EMAIL} not found. Run the app and complete onboarding for ${AGENT_EMAIL} first.`
    );
  }

  AGENT_ID = existingAgent.id;

  console.log(`✅ Found agent: ${existingAgent.profiles?.full_name} <${existingAgent.profiles?.email}>`);
  console.log(`   Agent ID: ${AGENT_ID}\n`);

  // Clean up previously seeded properties (idempotent re-runs)
  const deletedCount = await prisma.properties.deleteMany({
    where: { agent_id: AGENT_ID },
  });
  if (deletedCount.count > 0) {
    console.log(`   ♻️  Removed ${deletedCount.count} existing properties for clean re-seed.\n`);
  }

  console.log(`   Agency: ${existingAgent.agency_name}\n`);

  // Seed each venue
  let propertyCount = 0;
  let hotelCount = 0;
  let eventCount = 0;

  for (const venue of venues) {
    // Create the property
    const property = await prisma.properties.create({
      data: {
        agent_id: AGENT_ID,
        owner_id: null,
        title: venue.title,
        description: venue.description,
        price: venue.price,
        property_type: venue.property_type,
        listing_type: venue.listing_type,
        listing_source: "agent",
        price_frequency: venue.price_frequency,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: "NG",
        latitude: venue.latitude,
        longitude: venue.longitude,
        bedrooms: venue.bedrooms ?? null,
        bathrooms: venue.bathrooms ?? null,
        square_feet: venue.square_feet ?? null,
        status: "live",
        verification_status: "verified",
      },
    });

    // Create property_details (schema fields only — gym stays in amenities JSON)
    await prisma.property_details.create({
      data: {
        property_id: property.id,
        has_pool: venue.details.has_pool ?? false,
        has_garden: venue.details.has_garden ?? false,
        has_garage: venue.details.has_garage ?? false,
        parking_spaces: venue.details.parking_spaces ?? null,
        heating_type: venue.details.heating_type ?? null,
        cooling_type: venue.details.cooling_type ?? null,
        flooring_type: venue.details.flooring_type ?? null,
        amenities: venue.amenities,
        features: venue.features,
        metadata: {
          seeded: true,
          seed_version: "1.0",
          venue_category: venue.property_type,
          agent_id: AGENT_ID,
        },
      },
    });

    // Create property_media placeholder records
    for (let i = 0; i < venue.media.length; i++) {
      await prisma.property_media.create({
        data: {
          property_id: property.id,
          media_type: "image",
          media_url: `https://assets.realest.ng/venues/${property.id}/image-${i + 1}.jpg`,
          file_name: `image-${i + 1}.jpg`,
          display_order: i,
          is_featured: venue.media[i].is_featured,
        },
      });
    }

    propertyCount++;
    if (venue.property_type === "hotel") hotelCount++;
    else eventCount++;

    console.log(`  ✅ [${venue.property_type === "hotel" ? "HOTEL" : "EVENT "}] ${venue.title} — ₦${venue.price.toLocaleString()}/${venue.price_frequency}`);
  }

  // Mark agent as verified now that they have listings
  await prisma.agents.update({
    where: { id: AGENT_ID },
    data: {
      verified: true,
      verification_date: new Date(),
      total_listings: propertyCount,
      bio: "Official hospitality directory for Bayelsa State — premium hotels and event centers across Yenagoa.",
    },
  });

  console.log(`\n🎉 Seed complete! ${propertyCount} venues listed under RealEST Connect.`);
  console.log(`   ├─ Hotels:        ${hotelCount}`);
  console.log(`   └─ Event Centers: ${eventCount}`);
  console.log(`\n   Agent verified ✅`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
