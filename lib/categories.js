/**
 * The marketplace category tree: the single source of truth for names, URLs and subcategories.
 *
 * Every kind of equipment belongs to exactly one subcategory, and every subcategory to exactly one
 * category. The `equipment_categories` and `equipment_subcategories` tables mirror this file;
 * `node --env-file=.env.local scripts/sync-categories.mjs` shows and applies the differences.
 *
 * - `name` is the one label used everywhere: headings, menus, tiles, pills and forms.
 * - `slug` is the public URL; changing it needs a redirect in next.config.js.
 * - `dbKey` is the internal key stored in `equipment.category`; `dbCategories` are legacy keys.
 * - `art` is the tile's position in /category-equipment.webp (categories without one get an icon).
 * - `filters` are the subcategories; `value` is stored in `equipment.subcategory` and used in `?sub=`.
 */
export const SEO_CATEGORIES = {
  'roboty-ziemne': {
    slug: 'roboty-ziemne',
    dbKey: 'earthmoving',
    name: 'Roboty ziemne',
    title: 'Wynajem koparek, minikoparek i zagęszczarek | wypozycz.online',
    description:
      'Wynajem koparek, minikoparek, koparko-ładowarek, ładowarek, zagęszczarek i walców. Porównaj oferty wypożyczalni w swojej okolicy, bez pośredników.',
    art: 0,
    dbCategories: ['heavy_equipment', 'construction_equipment'],
    filters: [
      { value: 'excavators', label: 'koparki' },
      { value: 'miniexcavators', label: 'minikoparki' },
      { value: 'backhoe_loaders', label: 'koparko-ładowarki' },
      { value: 'loaders', label: 'ładowarki i miniładowarki' },
      { value: 'dumpers', label: 'wozidła' },
      { value: 'compactors', label: 'zagęszczarki i skoczki' },
      { value: 'rollers', label: 'walce' },
      { value: 'earth_augers', label: 'wiertnice glebowe' },
      { value: 'crushers', label: 'kruszarki' },
      { value: 'paving_equipment', label: 'sprzęt brukarski' },
    ],
  },
  'prace-na-wysokosci': {
    slug: 'prace-na-wysokosci',
    dbKey: 'access-platforms',
    name: 'Prace na wysokości',
    title: 'Wynajem podnośników koszowych i rusztowań | wypozycz.online',
    description:
      'Wypożycz podnośniki koszowe i nożycowe, rusztowania, wieże aluminiowe, drabiny i dźwigi. Bezpieczna praca na wysokości z profesjonalnym sprzętem.',
    art: 6,
    dbCategories: ['lifts_and_platforms', 'scaffolding'],
    filters: [
      { value: 'lifts', label: 'podnośniki' },
      { value: 'scaffolding', label: 'rusztowania' },
      { value: 'ladders', label: 'drabiny' },
      { value: 'platforms', label: 'podesty ruchome' },
      { value: 'cranes', label: 'dźwigi i żurawie' },
    ],
  },
  'narzedzia': {
    slug: 'narzedzia',
    dbKey: 'tools',
    name: 'Narzędzia',
    title: 'Wynajem elektronarzędzi: młoty, przecinarki, szlifierki | wypozycz.online',
    description:
      'Wynajem młotów wyburzeniowych, przecinarek, szlifierek, bruzdownic, wiertnic diamentowych i niwelatorów. Profesjonalne narzędzia bez kupowania.',
    art: 1,
    dbCategories: [],
    filters: [
      { value: 'demolition_hammers', label: 'młoty wyburzeniowe' },
      { value: 'cutters', label: 'przecinarki i piły' },
      { value: 'grinders', label: 'szlifierki' },
      { value: 'wall_chasers', label: 'bruzdownice' },
      { value: 'core_drills', label: 'wiertnice diamentowe' },
      { value: 'surveying', label: 'niwelatory i sprzęt pomiarowy' },
      { value: 'paint_sprayers', label: 'agregaty malarskie' },
    ],
  },
  'agregaty-i-zasilanie': {
    slug: 'agregaty-i-zasilanie',
    dbKey: 'power-generators',
    name: 'Agregaty i zasilanie',
    title: 'Wynajem agregatów prądotwórczych, nagrzewnic i osuszaczy | wypozycz.online',
    description:
      'Wynajem agregatów prądotwórczych, kompresorów, nagrzewnic, osuszaczy i spawarek. Profesjonalne zasilanie na każdą budowę.',
    art: 3,
    dbCategories: ['generators_and_power'],
    filters: [
      { value: 'generators', label: 'agregaty prądotwórcze' },
      { value: 'compressors', label: 'kompresory' },
      { value: 'heaters', label: 'nagrzewnice' },
      { value: 'dehumidifiers', label: 'osuszacze' },
      { value: 'welders', label: 'spawarki' },
    ],
  },
  'sprzet-betoniarski': {
    slug: 'sprzet-betoniarski',
    dbKey: 'concrete',
    name: 'Sprzęt betoniarski',
    title: 'Wynajem betoniarek i sprzętu do betonu | wypozycz.online',
    description: 'Betoniarki, wibratory, zacieraczki i szlifierki do betonu oraz sprzęt zbrojarski na wynajem.',
    art: 4,
    dbCategories: [],
    minListingsForIndexing: true,
    filters: [
      { value: 'concrete_mixers', label: 'betoniarki i mieszarki' },
      { value: 'concrete_vibrators', label: 'wibratory i listwy wibracyjne' },
      { value: 'concrete_trowels', label: 'zacieraczki do betonu' },
      { value: 'concrete_grinders', label: 'szlifierki do betonu' },
      { value: 'rebar_tools', label: 'sprzęt zbrojarski' },
    ],
  },
  'sprzet-ogrodowy': {
    slug: 'sprzet-ogrodowy',
    dbKey: 'garden',
    name: 'Sprzęt ogrodowy',
    title: 'Wynajem glebogryzarek, kosiarek i sprzętu ogrodowego | wypozycz.online',
    description:
      'Wypożycz glebogryzarki, kosiarki, wertykulatory, kosy spalinowe, pilarki i rębaki. Znajdź najlepsze oferty wynajmu sprzętu ogrodowego w Twojej okolicy.',
    art: 5,
    dbCategories: ['garden_equipment'],
    filters: [
      { value: 'tillers', label: 'glebogryzarki' },
      { value: 'mowers', label: 'kosiarki' },
      { value: 'tractors', label: 'traktorki' },
      { value: 'scarifiers', label: 'wertykulatory' },
      { value: 'trimmers', label: 'kosy i podkaszarki' },
      { value: 'saws', label: 'pilarki' },
      { value: 'shredders', label: 'rębaki i rozdrabniacze' },
    ],
  },
  'sprzet-czyszczacy': {
    slug: 'sprzet-czyszczacy',
    dbKey: 'cleaning',
    name: 'Sprzęt czyszczący',
    title: 'Wynajem myjek ciśnieniowych, odkurzaczy piorących i szorowarek | wypozycz.online',
    description:
      'Myjki ciśnieniowe, odkurzacze przemysłowe i piorące oraz szorowarki do posadzek. Sprzęt do sprzątania po remoncie i czyszczenia na wynajem.',
    dbCategories: ['cleaning_equipment'],
    minListingsForIndexing: true,
    filters: [
      { value: 'pressure_washers', label: 'myjki ciśnieniowe' },
      { value: 'vacuum_cleaners', label: 'odkurzacze przemysłowe' },
      { value: 'carpet_cleaners', label: 'odkurzacze piorące' },
      { value: 'floor_scrubbers', label: 'szorowarki' },
    ],
  },
  'przyczepy-i-lawety': {
    slug: 'przyczepy-i-lawety',
    dbKey: 'trailers',
    name: 'Przyczepy i lawety',
    title: 'Wynajem przyczep i lawet samochodowych | wypozycz.online',
    description: 'Przyczepy towarowe, lawety samochodowe i przyczepy do przewozu maszyn na wynajem.',
    art: 2,
    dbCategories: ['trailers_and_transport'],
    minListingsForIndexing: true,
    filters: [
      { value: 'cargo_trailers', label: 'przyczepy towarowe' },
      { value: 'car_transporters', label: 'lawety samochodowe' },
      { value: 'machinery_trailers', label: 'przyczepy do maszyn' },
    ],
  },
  'zaplecze-budowy': {
    slug: 'zaplecze-budowy',
    dbKey: 'other-equipment',
    name: 'Zaplecze budowy',
    title: 'Wynajem kontenerów, ogrodzeń budowlanych i toalet przenośnych | wypozycz.online',
    description:
      'Kontenery budowlane, ogrodzenia tymczasowe, toalety przenośne, zsypy do gruzu i stemple. Wszystko, czego potrzeba do urządzenia placu budowy.',
    dbCategories: ['others', 'container'],
    minListingsForIndexing: true,
    filters: [
      { value: 'site_containers', label: 'kontenery budowlane' },
      { value: 'temporary_fencing', label: 'ogrodzenia tymczasowe' },
      { value: 'portable_toilets', label: 'toalety przenośne' },
      { value: 'rubble_chutes', label: 'zsypy do gruzu' },
      { value: 'props_and_formwork', label: 'stemple i szalunki' },
    ],
  },
};

/** Old category URLs that redirect permanently to the current ones (see next.config.js). */
export const RENAMED_CATEGORY_SLUGS = { 'inny-sprzet-budowlany': 'zaplecze-budowy' };

// ─── Derived lookups ─────────────────────────────────────────────────────────

export const DB_TO_SEO_SLUG = {};
Object.values(SEO_CATEGORIES).forEach((cat) => {
  DB_TO_SEO_SLUG[cat.dbKey] = cat.slug;
  cat.dbCategories.forEach((oldKey) => {
    DB_TO_SEO_SLUG[oldKey] = cat.slug;
  });
});

/** Display name for any category key stored in the database, current or legacy. */
export const CATEGORY_DISPLAY_MAP = Object.fromEntries(
  Object.entries(DB_TO_SEO_SLUG).map(([key, slug]) => [key, SEO_CATEGORIES[slug].name])
);

export const SEO_CATEGORY_SLUGS = Object.keys(SEO_CATEGORIES);

export const FORM_CATEGORIES = Object.values(SEO_CATEGORIES).map(({ dbKey, name, slug }) => (
  { value: dbKey, label: name, seoSlug: slug }
));

/** Categories in display order for menus, tiles and the search filter. */
export const MARKET_CATEGORIES = Object.values(SEO_CATEGORIES).map(({ dbKey, name, slug, art, filters }) => (
  { value: dbKey, label: name, hub: slug, art, filters }
));

export function matchesMarketCategory(listing, value) {
  return Object.hasOwn(DB_TO_SEO_SLUG, value) && listing.seoCategory === DB_TO_SEO_SLUG[value];
}

/** Link to a category page filtered to one subcategory. */
export const subcategoryHref = (categorySlug, subcategory) => `/${categorySlug}?sub=${encodeURIComponent(subcategory)}`;

/** "minikoparki" → "Minikoparki": subcategory labels are lower case so they also work inside sentences. */
export const capitalize = (text) => (text ? text.charAt(0).toLocaleUpperCase('pl') + text.slice(1) : '');

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Get the SEO category config for a given DB category key.
 */
export function getSeoCategoryByDbKey(dbKey) {
  return SEO_CATEGORIES[getSeoSlugByDbKey(dbKey)];
}

/**
 * Get the SEO slug for a given DB category key.
 */
export function getSeoSlugByDbKey(dbKey) {
  return Object.hasOwn(DB_TO_SEO_SLUG, dbKey) ? DB_TO_SEO_SLUG[dbKey] : 'narzedzia';
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


