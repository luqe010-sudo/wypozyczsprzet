import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Pomocnicza funkcja do obsługi importu XLSX w różnych środowiskach (Next.js/CJS)
const getXLSX = () => {
  if (XLSX.readFile) return XLSX;
  if (typeof XLSX === 'function' && XLSX.readFile) return XLSX;
  return XLSX;
};

const MAIN_COMPANIES_CSV_URL =
  process.env.MAIN_COMPANIES_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Ykx4f8D7nD-vR3Fnf4FqouzGfGde768F0rknirLabpM/export?format=csv';

const MAIN_EQUIPMENT_CSV_URL =
  process.env.MAIN_EQUIPMENT_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Ykx4f8D7nD-vR3Fnf4FqouzGfGde768F0rknirLabpM/export?format=csv&gid=2144126358';

const FORM_CSV_URL = process.env.FORM_CSV_URL || '';

const LOCAL_COMPANIES_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - companies.csv');
const LOCAL_EQUIPMENT_CSV = path.join(process.cwd(), 'baza_wynajem_ulepszona - equipment.csv');

const fetchCSV = async (url) => {
  if (!url) return [];
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    const csvText = await response.text();
    return await new Promise((resolve) => {
      Papa.parse(csvText, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data) });
    });
  } catch (error) {
    console.error('CSV fetch failed:', error);
    return [];
  }
};

const readLocalCSV = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const csvText = fs.readFileSync(filePath, 'utf8');
    return Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
  } catch (error) {
    console.error(`Local CSV read failed: ${filePath}`, error);
    return [];
  }
};

const CATEGORY_MAP = {
  'garden_equipment': 'Sprzęt ogrodowy',
  'heavy_equipment': 'Sprzęt ciężki',
  'construction_equipment': 'Sprzęt budowlany',
  'generators_and_power': 'Agregaty i zasilanie',
  'tools': 'Narzędzia',
  'scaffolding': 'Rusztowania i szalunki',
  'container': 'Kontenery',
  'lifts_and_platforms': 'Podnośniki i platformy',
  'Budowlane': 'Budowlane'
};

const getField = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
};

const normalizeMainListings = (equipmentRows, companyRows) => {
  return equipmentRows.map((item) => {
    // Find company by id (new) or ID_firmy (old)
    const companyId = getField(item, ['company_id', 'ID_firmy']);
    const company = companyRows.find(
      (entry) => String(getField(entry, ['id', 'ID_firmy'])) === String(companyId)
    ) || {};

    const rawCategory = getField(item, ['category', 'Kategoria']);
    const Kategoria = CATEGORY_MAP[rawCategory] || rawCategory;

    return {
      ID_sprzetu: getField(item, ['id', 'ID_sprzetu']) || Math.random().toString(36).slice(2, 11),
      Kategoria,
      ['Sprzęt']: getField(item, ['name', 'Sprzęt', 'Sprzet']),
      Cena_od: getField(item, ['price_from', 'Cena_od', 'Cena']),
      Miasto: getField(company, ['city', 'Miasto']),
      Lokalizacja: getField(company, ['address', 'Lokalizacja', 'Adres']),
      ['Dostępność']: getField(item, ['availability', 'Dostępność', 'Dostepnosc']) || 'brak danych',
      Czas: getField(item, ['rental_period', 'Czas']) || 'doba',
      Status: getField(item, ['status', 'Status', 'Status_firmy']) || 'aktywne',
      isUserSubmitted: false,
      companyDetails: {
        Nazwa: getField(company, ['name', 'Nazwa']) || 'Brak firmy',
        Telefon: getField(company, ['phone', 'Telefon']),
        WWW: getField(company, ['website', 'WWW']),
        email: getField(company, ['email', 'e-mail']),
      },
      olxUrl: getField(item, ['external_olx_url', 'OLX', 'Link_OLX', 'olx']),
      Opis: getField(item, ['description', 'Opis', 'opis']),
      Zdjecie: getField(item, ['image_url', 'Zdjecie', 'zdjecie', 'Zdjęcie']),
      Promowanie: getField(item, ['promotion', 'Promowanie']),
      priority: Number(getField(item, ['priority', 'Priorytet'])) || Number(getField(company, ['priority', 'Priorytet', 'Pozycja'])) || 1,
      lat: getField(company, ['lat']),
      lng: getField(company, ['lng']),
    };
  });
};

const normalizeFormListings = (formRows) => {
  return formRows.map((item) => ({
    ID_sprzetu: Math.random().toString(36).slice(2, 11),
    Kategoria: CATEGORY_MAP[getField(item, ['Kategoria', 'category', 'Kategoria sprzętu'])] || getField(item, ['Kategoria', 'category', 'Kategoria sprzętu']) || 'Inne',
    ['Sprzęt']: getField(item, ['Sprzęt', 'Nazwa sprzętu']),
    Cena_od: getField(item, ['Cena_od', 'Cena za dobę', 'Cena']),
    Miasto: getField(item, ['Miasto']),
    Lokalizacja: getField(item, ['Lokalizacja', 'Adres', 'Location']),
    ['Dostępność']: getField(item, ['Dostępność', 'Dostepnosc']) || 'Tak',
    Czas: 'doba',
    Status: getField(item, ['Status']) || 'aktywne',
    isUserSubmitted: true,
    companyDetails: {
      Nazwa: getField(item, ['Nazwa_firmy', 'Nazwa firmy', 'Imię i nazwisko']) || 'Ogłoszenie prywatne',
      Telefon: getField(item, ['Telefon', 'Numer kontaktowy', 'Nr telefonu']),
      WWW: getField(item, ['WWW', 'WWW_firmy', 'Strona WWW']),
      email: getField(item, ['email', 'e-mail', 'E-mail']),
    },
    olxUrl: getField(item, ['OLX', 'Link do OLX', 'olx']),
    Opis: getField(item, ['Opis', 'opis', 'Opis sprzętu', 'Description', 'description']),
    Zdjecie: getField(item, ['Zdjecie', 'zdjecie', 'Zdjęcie', 'zdjęcie', 'ZDJECIE', 'ZDJE\u0106IE', 'Zdjecia', 'zdjecia', 'Zdjęcia', 'zdjęcia', 'Link do zdjęcia', 'Photo', 'image']),
    Promowanie: getField(item, ['Promowanie']),
    priority: parseInt(getField(item, ['Priorytet', 'Priority'])) || 1,
  }));
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
  // Read local CSVs first
  const mainCompanies = readLocalCSV(LOCAL_COMPANIES_CSV);
  const mainEquipment = readLocalCSV(LOCAL_EQUIPMENT_CSV);
  
  // Also try to fetch from URLs if provided (for remote updates)
  const [companiesRemote, equipmentRemote, formDataRaw] = await Promise.all([
    fetchCSV(MAIN_COMPANIES_CSV_URL),
    fetchCSV(MAIN_EQUIPMENT_CSV_URL),
    fetchCSV(FORM_CSV_URL),
  ]);

  const companies = mainCompanies.length > 0 ? mainCompanies : companiesRemote;
  const equipment = mainEquipment.length > 0 ? mainEquipment : equipmentRemote;
  const formListings = formDataRaw.length > 0 ? formDataRaw : [];

  const normalizedMain = normalizeMainListings(equipment, companies);
  const normalizedForms = normalizeFormListings(formListings);

  const allListings = [...normalizedMain, ...normalizedForms];
  const activeListings = getActiveListings(allListings);

  // Add slugs
  const slugCount = {};
  activeListings.forEach((item) => {
    let slug = generateSlug(item['Sprzęt'], item.Miasto);
    if (slugCount[slug]) {
      slugCount[slug]++;
      slug = `${slug}-${slugCount[slug]}`;
    } else {
      slugCount[slug] = 1;
    }
    item.slug = slug;
  });

  return activeListings;
};

export const fetchMarketplaceData = async () => {
  try {
    const activeListings = await fetchAllData();

    const uniqueCities = [...new Set(activeListings.map((item) => item.Miasto).filter(Boolean))].sort();
    const uniqueCategories = [
      ...new Set(activeListings.map((item) => item.Kategoria).filter(Boolean)),
    ].sort();

    return {
      listings: activeListings,
      filters: {
        cities: uniqueCities,
        categories: uniqueCategories,
      },
    };
  } catch (error) {
    console.error('Data compilation failed:', error);
    return { listings: [], filters: { cities: [], categories: [] } };
  }
};

export const fetchListingBySlug = async (slug) => {
  try {
    const activeListings = await fetchAllData();
    const listing = activeListings.find((item) => item.slug === slug);
    if (!listing) return null;

    // Get related listings (same category, different item)
    const related = activeListings
      .filter((item) => item.Kategoria === listing.Kategoria && item.slug !== slug)
      .slice(0, 3);

    return { listing, related };
  } catch (error) {
    console.error('Listing fetch failed:', error);
    return null;
  }
};

export const fetchAllSlugs = async () => {
  try {
    const activeListings = await fetchAllData();
    return activeListings.map((item) => item.slug).filter(Boolean);
  } catch (error) {
    console.error('Slugs fetch failed:', error);
    return [];
  }
};

export const fetchRandomListings = async (count = 6, preferredCategory = null) => {
  try {
    const activeListings = await fetchAllData();

    // Try to find listings from the same category first
    let sameCat = preferredCategory
      ? activeListings.filter((item) => item.Kategoria === preferredCategory)
      : [];

    // Shuffle helper
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    let result = shuffle(sameCat).slice(0, count);

    // If not enough, fill up with random listings from whole database
    if (result.length < count) {
      const remaining = shuffle(
        activeListings.filter((item) => !result.includes(item))
      ).slice(0, count - result.length);
      result = [...result, ...remaining];
    }

    return result.slice(0, count);
  } catch (error) {
    console.error('Random listings fetch failed:', error);
    return [];
  }
};
