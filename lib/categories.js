/**
 * Central SEO category configuration for the marketplace.
 * 
 * Architecture:
 * - Dedicated pages and filters for each marketplace category
 * - Mapping from legacy DB category keys to current SEO slugs
 */

export const SEO_CATEGORIES = {
  'roboty-ziemne': {
    slug: 'roboty-ziemne',
    dbKey: 'earthmoving',
    name: 'Roboty ziemne',
    title: 'Roboty ziemne – wynajem sprzętu | WypożyczSprzęt',
    description:
      'Wynajem koparek, minikoparek, koparko-ładowarek, zagęszczarek i ciężkiego sprzętu budowlanego. Porównaj oferty wypożyczalni w swojej okolicy, bez pośredników.',
    icon: '🏗️',
    color: 'from-amber-500 to-orange-600',
    dbCategories: ['heavy_equipment', 'construction_equipment'],
    filters: [
      { value: 'excavators', label: 'koparki' },
      { value: 'miniexcavators', label: 'minikoparki' },
      { value: 'backhoe_loaders', label: 'koparko-ładowarki' },
      { value: 'dumpers', label: 'wozidła' },
      { value: 'compactors', label: 'zagęszczarki' },
      { value: 'rollers', label: 'walce' },
      { value: 'paving_equipment', label: 'sprzęt brukarski' },
    ],
  },
  'sprzet-ogrodowy': {
    slug: 'sprzet-ogrodowy',
    dbKey: 'garden',
    name: 'Sprzęt ogrodowy',
    title: 'Sprzęt ogrodowy – wynajem maszyn ogrodowych | WypożyczSprzęt',
    description:
      'Wypożycz kosiarki, traktorki, wertykulatory, glebogryzarki i myjki ciśnieniowe. Znajdź najlepsze oferty wynajmu sprzętu ogrodowego w Twojej okolicy.',
    icon: '🌿',
    color: 'from-green-500 to-emerald-600',
    dbCategories: ['garden_equipment', 'cleaning_equipment'],
    filters: [
      { value: 'mowers', label: 'kosiarki' },
      { value: 'tractors', label: 'traktorki' },
      { value: 'scarifiers', label: 'wertykulatory' },
      { value: 'tillers', label: 'glebogryzarki' },
      { value: 'pressure_washers', label: 'myjki ciśnieniowe' },
      { value: 'saws', label: 'pilarki' },
      { value: 'shredders', label: 'rozdrabniacze' },
    ],
  },
  'agregaty-i-zasilanie': {
    slug: 'agregaty-i-zasilanie',
    dbKey: 'power-generators',
    name: 'Agregaty i zasilanie',
    title: 'Agregaty i zasilanie – wynajem generatorów | WypożyczSprzęt',
    description:
      'Wynajem agregatów prądotwórczych, kompresorów, nagrzewnic, osuszaczy i spawarek. Profesjonalne zasilanie na każdą budowę.',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-600',
    dbCategories: ['generators_and_power'],
    filters: [
      { value: 'generators', label: 'agregaty' },
      { value: 'compressors', label: 'kompresory' },
      { value: 'heaters', label: 'nagrzewnice' },
      { value: 'dehumidifiers', label: 'osuszacze' },
      { value: 'welders', label: 'spawarki' },
    ],
  },
  'prace-na-wysokosci': {
    slug: 'prace-na-wysokosci',
    dbKey: 'access-platforms',
    name: 'Prace na wysokości',
    title: 'Prace na wysokości – wynajem rusztowań i podnośników | WypożyczSprzęt',
    description:
      'Wypożycz rusztowania, podnośniki koszowe, drabiny i podesty ruchome. Bezpieczna praca na wysokości z profesjonalnym sprzętem.',
    icon: '🏢',
    color: 'from-blue-500 to-indigo-600',
    dbCategories: ['lifts_and_platforms', 'scaffolding'],
    filters: [
      { value: 'scaffolding', label: 'rusztowania' },
      { value: 'lifts', label: 'podnośniki' },
      { value: 'ladders', label: 'drabiny' },
      { value: 'platforms', label: 'podesty ruchome' },
    ],
  },
  'narzedzia': {
    slug: 'narzedzia',
    dbKey: 'tools',
    name: 'Narzędzia',
    title: 'Narzędzia – wynajem elektronarzędzi i sprzętu | WypożyczSprzęt',
    description:
      'Wynajem młotów wyburzeniowych, przecinarek, szlifierek, odkurzaczy przemysłowych i bruzdownic. Profesjonalne narzędzia bez kupowania.',
    icon: '🔧',
    color: 'from-slate-500 to-slate-700',
    dbCategories: [],
    filters: [
      { value: 'demolition_hammers', label: 'młoty wyburzeniowe' },
      { value: 'cutters', label: 'przecinarki' },
      { value: 'grinders', label: 'szlifierki' },
      { value: 'vacuum_cleaners', label: 'odkurzacze przemysłowe' },
      { value: 'wall_chasers', label: 'bruzdownice' },
    ],
  },
  'przyczepy-i-lawety': {
    slug: 'przyczepy-i-lawety',
    dbKey: 'trailers',
    name: 'Przyczepy i lawety',
    title: 'Przyczepy i lawety – wynajem | WypożyczSprzęt',
    description: 'Przyczepy towarowe, lawety i przyczepy do przewozu maszyn na wynajem.',
    dbCategories: ['trailers_and_transport'],
    minListingsForIndexing: true,
    filters: [
      { value: 'cargo_trailers', label: 'przyczepy towarowe' },
      { value: 'car_transporters', label: 'lawety samochodowe' },
      { value: 'machinery_trailers', label: 'przyczepy do maszyn' },
    ],
  },
  'sprzet-betoniarski': {
    slug: 'sprzet-betoniarski',
    dbKey: 'concrete',
    name: 'Sprzęt betoniarski',
    title: 'Sprzęt betoniarski – wynajem | WypożyczSprzęt',
    description: 'Sprzęt do przygotowania, układania i obróbki betonu oraz prac zbrojarskich.',
    dbCategories: [],
    minListingsForIndexing: true,
    filters: [
      { value: 'concrete_mixers', label: 'betoniarki i mieszarki' },
      { value: 'concrete_vibrators', label: 'wibratory i listwy wibracyjne' },
      { value: 'concrete_grinders', label: 'szlifierki do betonu' },
      { value: 'concrete_trowels', label: 'zacieraczki do betonu' },
      { value: 'rebar_tools', label: 'sprzęt zbrojarski' },
    ],
  },
  'inny-sprzet-budowlany': {
    slug: 'inny-sprzet-budowlany',
    dbKey: 'other-equipment',
    name: 'Inny sprzęt budowlany',
    title: 'Inny sprzęt budowlany – wynajem | WypożyczSprzęt',
    description: 'Kruszarki, zsypy do gruzu, kontenery i pozostałe wyposażenie placu budowy.',
    dbCategories: ['others', 'container'],
    minListingsForIndexing: true,
    filters: [
      { value: 'crushers', label: 'kruszarki' },
      { value: 'rubble_chutes', label: 'zsypy do gruzu' },
      { value: 'site_containers', label: 'kontenery budowlane' },
    ],
  },
};

// ─── Derived lookups ─────────────────────────────────────────────────────────

export const DB_TO_SEO_SLUG = {};
Object.values(SEO_CATEGORIES).forEach((cat) => {
  DB_TO_SEO_SLUG[cat.dbKey] = cat.slug;
  cat.dbCategories.forEach((oldKey) => {
    DB_TO_SEO_SLUG[oldKey] = cat.slug;
  });
});

export const CATEGORY_DISPLAY_MAP = {
  // New English keys
  earthmoving: 'Roboty ziemne',
  garden: 'Sprzęt ogrodowy',
  'power-generators': 'Agregaty i zasilanie',
  'access-platforms': 'Prace na wysokości',
  tools: 'Narzędzia',
  trailers: 'Przyczepy i lawety',
  concrete: 'Sprzęt betoniarski',
  'other-equipment': 'Inny sprzęt budowlany',
  
  // Legacy keys
  construction_equipment: 'Sprzęt budowlany',
  heavy_equipment: 'Sprzęt ciężki',
  garden_equipment: 'Maszyny ogrodowe',
  lifts_and_platforms: 'Podnośniki i platformy',
  scaffolding: 'Rusztowania',
  generators_and_power: 'Agregaty i zasilanie',
  trailers_and_transport: 'Lawety i transport',
  cleaning_equipment: 'Myjki i sprzęt sprzątający',
  others: 'Inne',
};

export const SEO_CATEGORY_SLUGS = Object.keys(SEO_CATEGORIES);

export const FORM_CATEGORIES = Object.values(SEO_CATEGORIES).map(({ dbKey, name, slug }) => (
  { value: dbKey, label: name, seoSlug: slug }
));

// This order also matches the equipment illustrations on the home page.
export const MARKET_CATEGORIES = [
  ['earthmoving', 'Maszyny budowlane'],
  ['tools', 'Narzędzia i elektronarzędzia'],
  ['trailers'],
  ['power-generators'],
  ['concrete'],
  ['garden', 'Urządzenia ogrodowe'],
  ['access-platforms', 'Podnośniki i zwyżki'],
  ['other-equipment'],
].map(([value, label]) => {
  const hub = DB_TO_SEO_SLUG[value];
  return { value, label: label || SEO_CATEGORIES[hub].name, hub };
});

export function matchesMarketCategory(listing, value) {
  return Object.hasOwn(DB_TO_SEO_SLUG, value) && listing.seoCategory === DB_TO_SEO_SLUG[value];
}

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Get the SEO category config for a given DB category key.
 */
export function getSeoCategoryByDbKey(dbKey) {
  const slug = DB_TO_SEO_SLUG[dbKey];
  return slug ? SEO_CATEGORIES[slug] : SEO_CATEGORIES['narzedzia']; // fallback
}

/**
 * Get the SEO slug for a given DB category key.
 */
export function getSeoSlugByDbKey(dbKey) {
  return DB_TO_SEO_SLUG[dbKey] || 'narzedzia';
}

/**
 * Convert a city name into a URL-friendly slug.
 * e.g. "Wrocław" → "wroclaw", "Zielona Góra" → "zielona-gora"
 */
export function getCitySlug(cityName) {
  if (!cityName) return '';
  return cityName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0144/g, 'n')
    .replace(/\u015b/g, 's')
    .replace(/[\u017a\u017c]/g, 'z')
    .replace(/\u0107/g, 'c')
    .replace(/\u0119/g, 'e')
    .replace(/\u00f3/g, 'o')
    .replace(/\u0105/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a clean equipment slug with "wynajem" prefix (no city).
 * e.g. "Koparko-ładowarka JCB 3CX" → "wynajem-koparko-ladowarka-jcb-3cx"
 */
export function generateCleanSlug(name) {
  if (!name) return '';
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0144/g, 'n')
    .replace(/\u015b/g, 's')
    .replace(/[\u017a\u017c]/g, 'z')
    .replace(/\u0107/g, 'c')
    .replace(/\u0119/g, 'e')
    .replace(/\u00f3/g, 'o')
    .replace(/\u0105/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Prepend "wynajem" if not already present in the name
  const slug = base.startsWith('wynajem') ? base : `wynajem-${base}`;
  return slug.slice(0, 80);
}

/**
 * Build the full new-format URL path for a listing.
 * Returns: /{seo-category}/{city-slug}/{equipment-slug}
 */
export function buildListingUrl(listing) {
  const seoSlug = getSeoSlugByDbKey(listing._rawCategory || listing.Kategoria);
  const citySlug = getCitySlug(listing.Miasto);
  const equipSlug = listing.slug;
  return `/${seoSlug}/${citySlug}/${equipSlug}`;
}

/**
 * Get all category objects for search filters.
 */
export function getAllCategories() {
  return FORM_CATEGORIES;
}

/**
 * Get filters (subcategories) for a given DB category key.
 */
export function getFiltersByDbKey(dbKey) {
  const cat = getSeoCategoryByDbKey(dbKey);
  return cat ? cat.filters : [];
}


