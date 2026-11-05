import { unstable_cache } from 'next/cache';
import { supabase } from './supabaseClient';
import {
  CATEGORY_DISPLAY_MAP,
  FORM_CATEGORIES,
  SEO_CATEGORIES,
  generateCleanSlug,
  getCitySlug,
  getSeoSlugByDbKey,
} from './categories';
import { haversineDistance } from './distance';

const PUBLIC_STATUSES = ['active', 'incomplete'];

const AVAILABILITY_MAP = {
  immediately: 'Dostępny od ręki',
  on_call: 'Na telefon',
  rented: 'Obecnie wynajęty',
  unavailable: 'Niedostępny',
};

const RENTAL_PERIOD_MAP = {
  hour: 'godzina',
  day: 'doba',
  week: 'tydzień',
  month: 'miesiąc',
};

const LISTING_COLUMNS = `
  id, name, slug, source_title, category, subcategory, price_type, price_amount, deposit_amount,
  delivery_available, with_operator, vat_invoice, specs, gallery_urls, rental_period, availability,
  description, image_url, status, external_olx_url, priority, source, created_at, updated_at, last_confirmed_at,
  companies (id, name, phone, website, city, address, zip_code, lat, lng, owner_user_id, verified_at, status),
  company_branches (city, voivodeship, address, zip_code, lat, lng, phone),
  equipment_categories (name, slug, db_key),
  equipment_subcategories (name, slug)
`;

/** Old URL format (/oferta/{name}-wynajem-{city}); kept only to redirect links from before the restructure. */
function legacySlugOf(name, city) {
  return getCitySlug(`${name || ''} wynajem ${city || ''}`).slice(0, 80);
}

function toListing(row) {
  const company = row.companies || {};
  const branch = row.company_branches || {};
  const city = branch.city || company.city || '';
  const rawCategory = row.equipment_categories?.db_key || (row.category || '').trim();
  const availabilityKey = (row.availability || '').trim().toLowerCase();
  const availability = Object.hasOwn(AVAILABILITY_MAP, availabilityKey) ? availabilityKey : null;

  return {
    ID_sprzetu: row.id,
    _rawCategory: rawCategory,
    Kategoria: row.equipment_categories?.name || CATEGORY_DISPLAY_MAP[rawCategory] || rawCategory,
    seoCategory: Object.hasOwn(SEO_CATEGORIES, row.equipment_categories?.slug)
      ? row.equipment_categories.slug
      : getSeoSlugByDbKey(rawCategory),
    subcategory: row.equipment_subcategories?.slug || row.subcategory || '',
    subcategoryLabel: row.equipment_subcategories?.name || '',
    ['Sprzęt']: row.name,
    priceType: row.price_type,
    priceAmount: row.price_amount == null ? null : Number(row.price_amount),
    depositAmount: row.deposit_amount == null ? null : Number(row.deposit_amount),
    deliveryAvailable: row.delivery_available,
    withOperator: row.with_operator,
    vatInvoice: row.vat_invoice,
    specs: row.specs || {},
    gallery: [row.image_url, ...(row.gallery_urls || [])].filter(
      (url, index, all) => url && String(url).startsWith('http') && all.indexOf(url) === index
    ),
    Miasto: city,
    citySlug: getCitySlug(city),
    Lokalizacja: branch.address || company.address || '',
    ['Dostępność']: AVAILABILITY_MAP[availability] || row.availability || 'brak danych',
    availability,
    Czas: RENTAL_PERIOD_MAP[row.rental_period] || row.rental_period || 'doba',
    Status: row.status,
    companyDetails: {
      id: company.id,
      Nazwa: company.name || 'Brak firmy',
      Telefon: branch.phone || company.phone || '',
      WWW: company.website || '',
      postal_code: branch.zip_code || company.zip_code || '',
      city,
      address: branch.address || company.address || '',
    },
    isClaimed: Boolean(company.owner_user_id),
    isVerified: Boolean(company.verified_at),
    isImported: row.source === 'imported',
    companyStatus: company.status,
    olxUrl: row.external_olx_url,
    Opis: row.description || '',
    Zdjecie: row.image_url,
    priority: row.priority || 1,
    lat: branch.lat ?? company.lat ?? null,
    lng: branch.lng ?? company.lng ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    lastConfirmedAt: row.last_confirmed_at,
    slug: row.slug || `${generateCleanSlug(row.name).slice(0, 71)}-${row.id.slice(0, 8)}`,
    legacySlug: legacySlugOf(row.source_title || row.name, city),
  };
}

function byPriorityThenNewest(a, b) {
  return (
    b.priority - a.priority ||
    new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
    a.ID_sprzetu.localeCompare(b.ID_sprzetu)
  );
}

async function fetchPublicListings() {
  const pageSize = 500;
  const listings = [];
  let cursor = null;
  for (;;) {
    const page = supabase.from('equipment')
      .select(LISTING_COLUMNS)
      .in('status', PUBLIC_STATUSES)
      .order('id')
      .limit(pageSize);
    const { data, error } = await (cursor ? page.gt('id', cursor) : page);
    if (error) throw new Error(`Could not load listings: ${error.message}`);

    for (const row of data) {
      const listing = toListing(row);
      if (listing.companyStatus !== 'pending') listings.push(listing);
    }
    if (data.length < pageSize) break;
    cursor = data.at(-1).id;
  }

  return listings.sort(byPriorityThenNewest);
}

export const fetchMarketplaceData = unstable_cache(
  async () => {
    const listings = await fetchPublicListings();
    return {
      listings,
      filters: {
        cities: [...new Set(listings.map((l) => l.Miasto).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl')),
        categories: FORM_CATEGORIES,
      },
    };
  },
  ['marketplace-listings-v4'],
  { revalidate: 300, tags: ['listings'] }
);

/** Only what a result card needs; keeps phone numbers and long descriptions out of list pages. */
export function toCard(listing) {
  return {
    ID_sprzetu: listing.ID_sprzetu,
    _rawCategory: listing._rawCategory,
    Kategoria: listing.Kategoria,
    seoCategory: listing.seoCategory,
    subcategory: listing.subcategory,
    subcategoryLabel: listing.subcategoryLabel,
    ['Sprzęt']: listing['Sprzęt'],
    priceType: listing.priceType,
    priceAmount: listing.priceAmount,
    deliveryAvailable: listing.deliveryAvailable,
    withOperator: listing.withOperator,
    Miasto: listing.Miasto,
    citySlug: listing.citySlug,
    Czas: listing.Czas,
    ['Dostępność']: listing['Dostępność'],
    availability: listing.availability,
    specs: listing.specs,
    Zdjecie: listing.Zdjecie,
    isVerified: listing.isVerified,
    companyName: listing.companyDetails.Nazwa,
    lat: listing.lat,
    lng: listing.lng,
    slug: listing.slug,
    created_at: listing.created_at,
    ...(listing._distance != null ? { _distance: listing._distance } : {}),
  };
}

export const listingPath = (listing) => `/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`;

function relatedTo(listing, listings, count = 3) {
  const candidates = listings.filter(
    (item) => item.seoCategory === listing.seoCategory && item.ID_sprzetu !== listing.ID_sprzetu
  );
  const hasCoords = (item) => item.lat != null && item.lng != null;

  if (!hasCoords(listing)) {
    return candidates.filter((item) => item.Miasto === listing.Miasto).concat(
      candidates.filter((item) => item.Miasto !== listing.Miasto)
    ).slice(0, count);
  }

  return candidates
    .map((item) => ({
      item,
      distance: hasCoords(item)
        ? haversineDistance(listing.lat, listing.lng, item.lat, item.lng)
        : Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ item, distance }) => (
      Number.isFinite(distance) ? { ...item, _distance: Math.round(distance) } : item
    ));
}

/**
 * Finds a listing by its stored slug. The slug alone identifies a listing, so links keep
 * working after a city or category correction; the caller redirects to `canonicalPath`.
 */
export async function fetchListingBySlug(slug) {
  const { listings } = await fetchMarketplaceData();
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) return null;
  return { listing, related: relatedTo(listing, listings), canonicalPath: listingPath(listing) };
}

export async function fetchListingByLegacySlug(slug) {
  const { listings } = await fetchMarketplaceData();
  return listings.find((item) => item.slug === slug || item.legacySlug === slug) || null;
}

/** True when the slug belongs to a listing that was published earlier and is now switched off. */
export async function isUnpublishedSlug(slug) {
  const { data, error } = await supabase
    .from('equipment')
    .select('id')
    .eq('slug', slug)
    .in('status', ['inactive', 'stale'])
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function fetchSuggestions(count = 6, categorySlug = null) {
  const { listings } = await fetchMarketplaceData();
  const same = listings.filter((item) => item.seoCategory === categorySlug);
  const rest = listings.filter((item) => item.seoCategory !== categorySlug);
  return [...same, ...rest].slice(0, count).map(toCard);
}

/** Generates a slug that no other listing uses. Called once, when a listing is created. */
export async function generateUniqueSlug(client, name) {
  const base = generateCleanSlug(name) || 'wynajem-sprzetu';
  const { data, error } = await client.from('equipment').select('slug').like('slug', `${base}%`);
  if (error) throw error;

  const taken = new Set((data || []).map((row) => row.slug));
  if (!taken.has(base)) return base;

  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base.slice(0, 75)}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
