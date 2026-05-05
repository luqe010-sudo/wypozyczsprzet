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
const LOCAL_WORKBOOK_PATH = path.join(process.cwd(), 'baza_wynajem_ulepszona.xlsx');

const fetchCSV = async (url) => {
  if (!url) return [];

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${url} (${response.status})`);
    }

    const csvText = await response.text();

    return await new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
      });
    });
  } catch (error) {
    console.error('CSV fetch failed:', error);
    return [];
  }
};

const readSheet = (workbook, sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const x = getXLSX();
  return x.utils.sheet_to_json(sheet, { defval: '' });
};

const readLocalWorkbookData = () => {
  if (!fs.existsSync(LOCAL_WORKBOOK_PATH)) {
    return { companies: [], equipment: [] };
  }

  try {
    const x = getXLSX();
    const workbook = x.readFile(LOCAL_WORKBOOK_PATH);
    return {
      companies: readSheet(workbook, 'FIRMY'),
      equipment: readSheet(workbook, 'SPRZET'),
    };
  } catch (error) {
    console.error('Local workbook fallback failed:', error);
    return { companies: [], equipment: [] };
  }
};

const getField = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

const normalizeMainListings = (equipmentRows, companyRows) => {
  return equipmentRows.map((item) => {
    const company = companyRows.find(
      (entry) => String(getField(entry, ['ID_firmy'])) === String(getField(item, ['ID_firmy']))
    ) || {};

    return {
      ID_sprzetu:
        getField(item, ['ID_sprzetu']) || Math.random().toString(36).slice(2, 11),
      Kategoria: getField(item, ['Kategoria']),
      ['Sprzęt']: getField(item, ['Sprzęt', 'Sprzet', 'Sprztt']),
      Cena_od: getField(item, ['Cena_od', 'Cena']),
      Miasto: getField(item, ['Miasto']) || getField(company, ['Miasto']),
      Lokalizacja: getField(item, ['Lokalizacja', 'Adres', 'Location']) || getField(company, ['Lokalizacja', 'Adres', 'Location']),
      ['Dostępność']: getField(item, [
        'Dostępność',
        'Dostepnosc',
        'Dosttpno>',
      ]) || 'brak danych',
      Czas: getField(item, ['Czas']) || 'doba',
      Status: getField(item, ['Status', 'Status_firmy']) || 'aktywne',
      isUserSubmitted: false,
      companyDetails: {
        Nazwa: getField(item, ['Firma']) || getField(company, ['Nazwa']) || 'Brak firmy',
        Telefon:
          getField(item, ['Telefon_firmy', 'Telefon firmy']) ||
          getField(company, ['Telefon']) ||
          '',
        WWW: getField(item, ['WWW_firmy']) || getField(company, ['WWW']) || '',
        email: getField(company, ['email', 'e-mail']) || getField(item, ['email']) || '',
      },
      olxUrl: getField(item, ['OLX', 'Link_OLX', 'olx']),
      Opis: getField(item, ['Opis', 'opis', 'Opis sprzętu', 'Description', 'description']),
      Zdjecie: getField(item, ['Zdjecie', 'zdjecie', 'Zdjęcie', 'zdjęcie', 'ZDJECIE', 'ZDJE\u0106IE', 'Zdjecia', 'zdjecia', 'Zdjęcia', 'zdjęcia', 'Link do zdjęcia', 'Photo', 'image']),
      Promowanie: getField(item, ['Promowanie']),
      priority: Number(getField(item, ['Priorytet', 'Priority'])) || Number(getField(company, ['Priorytet', 'Priority', 'Pozycja'])) || 1,
    };
  });
};

const normalizeFormListings = (formRows) => {
  return formRows.map((item) => ({
    ID_sprzetu: Math.random().toString(36).slice(2, 11),
    Kategoria: getField(item, ['Kategoria', 'Kategoria sprzętu']) || 'Inne',
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
      return status === 'aktywne' || status === 'aktywny' || status === 'niekompletne';
    })
    .map((item, idx) => ({ ...item, _origIdx: idx }))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0) || b._origIdx - a._origIdx);
};

const fetchAllData = async () => {
  const [companiesRaw, equipmentRaw, formDataRaw] = await Promise.all([
    fetchCSV(MAIN_COMPANIES_CSV_URL),
    fetchCSV(MAIN_EQUIPMENT_CSV_URL),
    fetchCSV(FORM_CSV_URL),
  ]);

  const localData = readLocalWorkbookData();

  const mainCompanies = companiesRaw.length > 0 ? companiesRaw : localData.companies;
  const mainEquipment = equipmentRaw.length > 0 ? equipmentRaw : localData.equipment;
  const formListings = formDataRaw.length > 0 ? formDataRaw : [];

  const normalizedMain = normalizeMainListings(mainEquipment, mainCompanies);
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
