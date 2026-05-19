import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';
import { unstable_cache } from 'next/cache';
import {
  CATEGORY_DISPLAY_MAP,
  getSeoSlugByDbKey,
  getCitySlug,
  generateCleanSlug,
  SEO_CATEGORIES,
  FORM_CATEGORIES,
} from './categories';
import { isBrokenLink } from './seo-utils';

const LOCAL_COMPANIES_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - companies.csv');
const LOCAL_EQUIPMENT_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - equipment.csv');

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

const readLocalCSV = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return Papa.parse(fileContent, { header: true, skipEmptyLines: true }).data;
  } catch (error) {
    console.error(`Error reading local CSV ${filePath}:`, error);
    return [];
  }
};

/**
 * Legacy slug generator — kept for building the old-to-new redirect map.
 */
const generateLegacySlug = (name, city) => {
  const text = `${name || ''} wynajem ${city || ''}`.trim();
  return text
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
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

const getActiveListings = (allListings) => {
  return allListings
    .filter((item) => {
      // 1. Status check
      if (item.Status) {
        const status = String(item.Status).toLowerCase().trim();
        const isActive = status === 'aktywne' || status === 'aktywny' || status === 'niekompletne' || status === 'active' || status === 'incomplete';
        if (!isActive) return false;
      }

      return true;
    })
    .map((item, idx) => ({ ...item, _origIdx: idx }))
    .sort((a, b) => {
      // 1. Priority (promoted items first)
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      // 2. Date created (newest first)
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      // 3. Fallback to original index
      return b._origIdx - a._origIdx;
    });
};

const fetchAllData = async () => {
  // 1. Try fetching from Supabase first
  try {
    const { data: equipment, error: equipError } = await supabase
      .from('equipment')
      .select(`
        *,
        companies (*)
      `);

    if (!equipError && equipment && equipment.length > 0) {
      const normalized = equipment.map(item => {
        const company = item.companies || {};
        
        // Keep raw DB category for SEO mapping
        const rawCategory = (item.category || '').trim();
        const Kategoria = CATEGORY_DISPLAY_MAP[rawCategory] || rawCategory;

        // Clean up availability
        const rawAvailability = (item.availability || '').trim().toLowerCase();
        const Dostepnosc = AVAILABILITY_MAP[rawAvailability] || item.availability || 'brak danych';

        return {
          ID_sprzetu: item.id,
          _rawCategory: rawCategory,
          Kategoria,
          seoCategory: getSeoSlugByDbKey(rawCategory),
          subcategory: item.subcategory || '',
          ['Sprzęt']: item.name,
          Cena_od: item.price_from,
          Miasto: company.city,
          citySlug: getCitySlug(company.city),
          Lokalizacja: company.address,
          ['Dostępność']: Dostepnosc,
          Czas: RENTAL_PERIOD_MAP[item.rental_period] || item.rental_period || 'doba',
          Status: item.status || 'active',
          isUserSubmitted: false,
          companyDetails: {
            id: company.id,
            Nazwa: company.name || 'Brak firmy',
            Telefon: company.phone,
            WWW: company.website,
            email: company.email,
            owner_user_id: company.owner_user_id,
          },
          olxUrl: item.external_olx_url,
          Opis: item.description,
          Zdjecie: item.image_url,
          Promowanie: item.promotion,
          priority: item.priority || 1,
          lat: company.lat,
          lng: company.lng,
          created_at: item.created_at,
        };
      });

      const active = getActiveListings(normalized);
      
      // Generate new clean slugs (no city, no "wynajem")
      const slugCount = {};
      active.forEach((item) => {
        let slug = generateCleanSlug(item['Sprzęt']);
        if (slugCount[slug]) {
          slugCount[slug]++;
          slug = `${slug}-${slugCount[slug]}`;
        } else {
          slugCount[slug] = 1;
        }
        item.slug = slug;
        // Also store legacy slug for redirect mapping
        item.legacySlug = generateLegacySlug(item['Sprzęt'], item.Miasto);
      });

      // Deduplicate legacy slugs the same way
      const legacySlugCount = {};
      active.forEach((item) => {
        let ls = generateLegacySlug(item['Sprzęt'], item.Miasto);
        if (legacySlugCount[ls]) {
          legacySlugCount[ls]++;
          ls = `${ls}-${legacySlugCount[ls]}`;
        } else {
          legacySlugCount[ls] = 1;
        }
        item.legacySlug = ls;
      });

      return active;
    }
  } catch (err) {
    console.error('Supabase fetch failed, falling back to local CSV:', err);
  }

  // 2. Fallback to local CSVs only
  const companiesRaw = readLocalCSV(LOCAL_COMPANIES_CSV);
  const equipmentRaw = readLocalCSV(LOCAL_EQUIPMENT_CSV);

  const normalized = equipmentRaw.map(item => {
    const company = companiesRaw.find(c => String(c.id) === String(item.company_id)) || {};
    const rawCategory = item.category;
    const Kategoria = CATEGORY_DISPLAY_MAP[rawCategory] || rawCategory;

    return {
      ID_sprzetu: item.id,
      _rawCategory: rawCategory,
      Kategoria,
      seoCategory: getSeoSlugByDbKey(rawCategory),
      subcategory: item.subcategory || '',
      ['Sprzęt']: item.name,
      Cena_od: item.price_from,
      Miasto: company.city,
      citySlug: getCitySlug(company.city),
      Lokalizacja: company.address,
      ['Dostępność']: AVAILABILITY_MAP[item.availability] || item.availability || 'brak danych',
      Czas: item.rental_period || 'doba',
      Status: item.status || 'active',
      isUserSubmitted: false,
      companyDetails: {
        Nazwa: company.name || 'Brak firmy',
        Telefon: company.phone,
        WWW: company.website,
        email: company.email,
      },
      olxUrl: item.external_olx_url,
      Opis: item.description,
      Zdjecie: item.image_url,
      Promowanie: item.promotion,
      priority: parseInt(item.priority) || 1,
      lat: company.lat,
      lng: company.lng,
      created_at: item.created_at,
    };
  });

  const active = getActiveListings(normalized);
  const slugCount = {};
  active.forEach((item) => {
    let slug = generateCleanSlug(item['Sprzęt']);
    if (slugCount[slug]) {
      slugCount[slug]++;
      slug = `${slug}-${slugCount[slug]}`;
    } else {
      slugCount[slug] = 1;
    }
    item.slug = slug;
    item.legacySlug = generateLegacySlug(item['Sprzęt'], item.Miasto);
  });

  const legacySlugCount = {};
  active.forEach((item) => {
    let ls = generateLegacySlug(item['Sprzęt'], item.Miasto);
    if (legacySlugCount[ls]) {
      legacySlugCount[ls]++;
      ls = `${ls}-${legacySlugCount[ls]}`;
    } else {
      legacySlugCount[ls] = 1;
    }
    item.legacySlug = ls;
  });

  return active;
};

// EXPORTS
export const fetchMarketplaceData = unstable_cache(
  async () => {
    const activeListings = await fetchAllData();
    const uniqueCities = [...new Set(activeListings.map((item) => item.Miasto).filter(Boolean))].sort();
    const uniqueSubcategories = [...new Set(activeListings.map((item) => item.subcategory).filter(Boolean))].sort();

    return {
      listings: activeListings,
      filters: {
        cities: uniqueCities,
        categories: FORM_CATEGORIES,
        subcategories: uniqueSubcategories,
      },
    };
  },
  ['marketplace-listings'],
  { revalidate: 60, tags: ['listings'] }
);

/**
 * Find a listing by the NEW URL structure: /{category}/{city}/{slug}
 */
export const fetchListingByNewUrl = async (categorySlug, citySlug, equipSlug) => {
  const { listings } = await fetchMarketplaceData();
  const listing = listings.find(
    (item) =>
      item.seoCategory === categorySlug &&
      item.citySlug === citySlug &&
      item.slug === equipSlug
  );

  if (!listing) return null;

  // Get related listings (same SEO category, different item)
  const related = listings
    .filter((item) => item.seoCategory === listing.seoCategory && item.slug !== equipSlug)
    .slice(0, 3);

  return { listing, related };
};

/**
 * Find a listing by the LEGACY slug (for 301 redirects).
 */
export const fetchListingByLegacySlug = async (legacySlug) => {
  const { listings } = await fetchMarketplaceData();
  return listings.find((item) => item.legacySlug === legacySlug) || null;
};

/**
 * Keep backward-compatible slug lookup (tries new slug first, then legacy)
 */
export const fetchListingBySlug = async (slug) => {
  const { listings } = await fetchMarketplaceData();

  // Try new slug first
  let listing = listings.find((item) => item.slug === slug);

  // Fallback to legacy slug
  if (!listing) {
    listing = listings.find((item) => item.legacySlug === slug);
  }

  if (!listing) return null;

  const related = listings
    .filter((item) => item.seoCategory === listing.seoCategory && item.slug !== listing.slug)
    .slice(0, 3);

  return { listing, related };
};

/**
 * Fetch all listings for a given SEO category slug.
 */
export const fetchListingsByCategory = async (categorySlug) => {
  const { listings } = await fetchMarketplaceData();
  return listings.filter((item) => item.seoCategory === categorySlug);
};

export const fetchRandomListings = async (count = 6, preferredCategory = null) => {
  const { listings } = await fetchMarketplaceData();
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
  let sameCat = preferredCategory
    ? listings.filter((item) => item.seoCategory === preferredCategory || item.Kategoria === preferredCategory)
    : [];

  let result = shuffle(sameCat).slice(0, count);
  if (result.length < count) {
    const remaining = shuffle(
      listings.filter((item) => !result.includes(item))
    ).slice(0, count - result.length);
    result = [...result, ...remaining];
  }
  return result.slice(0, count);
};

export const fetchAllSlugs = async () => {
  const { listings } = await fetchMarketplaceData();
  return listings.map((item) => ({
    slug: item.slug,
    legacySlug: item.legacySlug,
    seoCategory: item.seoCategory,
    citySlug: item.citySlug,
    created_at: item.created_at,
  }));
};

/**
 * Build a redirect map: legacySlug → newUrl
 */
export const buildRedirectMap = async () => {
  const { listings } = await fetchMarketplaceData();
  const map = {};
  listings.forEach((item) => {
    if (item.legacySlug) {
      map[item.legacySlug] = `/${item.seoCategory}/${item.citySlug}/${item.slug}`;
    }
  });
  return map;
};
