import fs from 'fs';
import path from 'path';
const Papa = require('papaparse');
import { supabase } from './supabaseClient';
import { unstable_cache } from 'next/cache';

const LOCAL_COMPANIES_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - companies.csv');
const LOCAL_EQUIPMENT_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - equipment.csv');

const CATEGORY_MAP = {
  tools: 'Narzędzia i elektronarzędzia',
  construction_equipment: 'Zagęszczarki i sprzęt budowlany',
  heavy_equipment: 'Koparki i sprzęt ciężki',
  garden_equipment: 'Maszyny ogrodowe',
  lifts_and_platforms: 'Podnośniki i platformy',
  scaffolding: 'Rusztowania',
  generators_and_power: 'Agregaty i zasilanie',
  trailers_and_transport: 'Lawety i transport',
  cleaning_equipment: 'Myjki i sprzęt sprzątający',
  others: 'Inne',
};

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

const generateSlug = (name, city) => {
  const text = `${name || ''} wynajem ${city || ''}`.trim();
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0144/g, 'n')
    .replace(/\u015b/g, 's')
    .replace(/\u017a|\u017c/g, 'z')
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
      if (!item.Status) return true;
      const status = String(item.Status).toLowerCase().trim();
      return status === 'aktywne' || status === 'aktywny' || status === 'niekompletne' || status === 'active' || status === 'incomplete';
    })
    .map((item, idx) => ({ ...item, _origIdx: idx }))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0) || b._origIdx - a._origIdx);
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
        
        // Clean up category
        const rawCategory = (item.category || '').trim();
        const Kategoria = CATEGORY_MAP[rawCategory] || rawCategory;

        // Clean up availability
        const rawAvailability = (item.availability || '').trim().toLowerCase();
        const Dostepnosc = AVAILABILITY_MAP[rawAvailability] || item.availability || 'brak danych';

        return {
          ID_sprzetu: item.id,
          Kategoria,
          ['Sprzęt']: item.name,
          Cena_od: item.price_from,
          Miasto: company.city,
          Lokalizacja: company.address,
          ['Dostępność']: Dostepnosc,
          Czas: RENTAL_PERIOD_MAP[item.rental_period] || item.rental_period || 'doba',
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
          priority: item.priority || 1,
          lat: company.lat,
          lng: company.lng,
        };
      });

      const active = getActiveListings(normalized);
      
      // Add slugs
      const slugCount = {};
      active.forEach((item) => {
        let slug = generateSlug(item['Sprzęt'], item.Miasto);
        if (slugCount[slug]) {
          slugCount[slug]++;
          slug = `${slug}-${slugCount[slug]}`;
        } else {
          slugCount[slug] = 1;
        }
        item.slug = slug;
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
    const Kategoria = CATEGORY_MAP[rawCategory] || rawCategory;

    return {
      ID_sprzetu: item.id,
      Kategoria,
      ['Sprzęt']: item.name,
      Cena_od: item.price_from,
      Miasto: company.city,
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
    };
  });

  const active = getActiveListings(normalized);
  const slugCount = {};
  active.forEach((item) => {
    let slug = generateSlug(item['Sprzęt'], item.Miasto);
    if (slugCount[slug]) {
      slugCount[slug]++;
      slug = `${slug}-${slugCount[slug]}`;
    } else {
      slugCount[slug] = 1;
    }
    item.slug = slug;
  });

  return active;
};

// EXPORTS
export const fetchMarketplaceData = unstable_cache(
  async () => {
    const activeListings = await fetchAllData();
    const uniqueCities = [...new Set(activeListings.map((item) => item.Miasto).filter(Boolean))].sort();
    const uniqueCategories = [...new Set(activeListings.map((item) => item.Kategoria).filter(Boolean))].sort();

    return {
      listings: activeListings,
      filters: {
        cities: uniqueCities,
        categories: uniqueCategories,
      },
    };
  },
  ['marketplace-listings'],
  { revalidate: 60, tags: ['listings'] }
);

export const fetchListingBySlug = async (slug) => {
  const { listings } = await fetchMarketplaceData();
  const listing = listings.find((item) => item.slug === slug);
  
  if (!listing) return null;

  // Get related listings (same category, different item)
  const related = listings
    .filter((item) => item.Kategoria === listing.Kategoria && item.slug !== slug)
    .slice(0, 3);

  return { listing, related };
};

export const fetchRandomListings = async (count = 6, preferredCategory = null) => {
  const { listings } = await fetchMarketplaceData();
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
  let sameCat = preferredCategory
    ? listings.filter((item) => item.Kategoria === preferredCategory)
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
