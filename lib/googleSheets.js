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
      Zdjecie: getField(item, ['Zdjecie', 'zdjecie', 'Zdjęcie', 'zdjęcie', 'ZDJECIE', 'ZDJE\u0106IE', 'Zdjecia', 'zdjecia', 'Zdjęcia', 'zdjęcia', 'Link do zdjęcia', 'Photo', 'image']),
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
    ['Dostępność']: getField(item, ['Dostępność', 'Dostepnosc']) || 'Tak',
    Czas: 'doba',
    Status: getField(item, ['Status']) || 'aktywne',
    isUserSubmitted: true,
    companyDetails: {
      Nazwa: getField(item, ['Nazwa_firmy', 'Nazwa firmy', 'Imię i nazwisko']) || 'Ogłoszenie prywatne',
      Telefon: getField(item, ['Telefon', 'Numer kontaktowy', 'Nr telefonu']),
      WWW: '',
      email: '',
    },
    olxUrl: getField(item, ['OLX', 'Link do OLX', 'olx']),
    Zdjecie: getField(item, ['Zdjecie', 'zdjecie', 'Zdjęcie', 'zdjęcie', 'ZDJECIE', 'ZDJE\u0106IE', 'Zdjecia', 'zdjecia', 'Zdjęcia', 'zdjęcia', 'Link do zdjęcia', 'Photo', 'image']),
    priority: parseInt(getField(item, ['Priorytet', 'Priority'])) || 1,
  }));
};

export const fetchMarketplaceData = async () => {
  try {
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

    const activeListings = allListings.filter((item) => {
      if (!item.Status) return true;
      const status = String(item.Status).toLowerCase().trim();
      return status === 'aktywne' || status === 'nowy';
    }).sort((a, b) => (b.priority || 0) - (a.priority || 0));

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
