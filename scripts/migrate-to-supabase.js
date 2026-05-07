const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load .env first, then .env.local
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const COMPANIES_CSV = path.join(__dirname, '..', 'baza_wynajem_ulepszona - companies.csv');
const EQUIPMENT_CSV = path.join(__dirname, '..', 'baza_wynajem_ulepszona - equipment.csv');

async function migrate() {
  console.log('🚀 Starting migration to Supabase...');

  // 1. Load Companies
  if (!fs.existsSync(COMPANIES_CSV)) {
    console.error('Companies CSV not found at:', COMPANIES_CSV);
    return;
  }
  const companiesData = Papa.parse(fs.readFileSync(COMPANIES_CSV, 'utf8'), { header: true, skipEmptyLines: true }).data;
  console.log(`Loaded ${companiesData.length} companies from CSV.`);

  // 2. Load Equipment
  if (!fs.existsSync(EQUIPMENT_CSV)) {
    console.error('Equipment CSV not found at:', EQUIPMENT_CSV);
    return;
  }
  const equipmentData = Papa.parse(fs.readFileSync(EQUIPMENT_CSV, 'utf8'), { header: true, skipEmptyLines: true }).data;
  console.log(`Loaded ${equipmentData.length} equipment items from CSV.`);

  const companyMap = new Map(); // Old CSV ID -> New UUID

  // 3. Migrate Companies
  console.log('Migrating companies...');
  const { randomUUID } = require('crypto');

  for (const company of companiesData) {
    const oldId = String(company.id || company.ID_firmy || '').trim();
    const newId = randomUUID();
    
    const { data, error } = await supabase
      .from('companies')
      .upsert({
        id: newId,
        name: company.name || company.Nazwa,
        phone: company.phone || company.Telefon,
        email: company.email || company.WWW,
        website: company.website || company.WWW,
        zip_code: company.zip_code || company.Kod_pocztowy,
        city: company.city || company.Miasto,
        address: company.address || company.Lokalizacja || company.Adres,
        lat: parseFloat(company.lat) || null,
        lng: parseFloat(company.lng) || null,
        status: company.status || 'active',
        description: company.description || company.Notatka || '',
      }, { onConflict: 'name, phone' }) // Use name/phone for conflict now since we generate new IDs
      .select('id, name')
      .single();

    if (error) {
      console.error(`Error migrating company ${company.name || company.Nazwa}:`, error.message);
    } else {
      console.log(`Migrated company: ${data.name} (New UUID: ${data.id})`);
      companyMap.set(oldId, data.id);
    }
  }

  // 4. Migrate Equipment
  console.log('Migrating equipment...');
  const equipmentToInsert = equipmentData.map(item => {
    const oldCompanyId = String(item.company_id || item.ID_firmy || '').trim();
    const newCompanyId = companyMap.get(oldCompanyId);

    if (!newCompanyId) {
      // If we can't find the company, we'll log it later
      return null;
    }

    return {
      id: randomUUID(),
      company_id: newCompanyId,
      category: item.category || item.Kategoria,
      name: item.name || item.Sprzęt || item.Sprzet,
      price_from: item.price_from || item.Cena_od || item.Cena,
      rental_period: item.rental_period || item.Czas || 'doba',
      availability: item.availability || item['Dostępność'] || item.Dostepnosc,
      priority: parseInt(item.priority || item.Priorytet) || 1,
      description: item.description || item.Opis || item.opis || '',
      image_url: item.image_url || item.Zdjecie || item.zdjecie || '',
      status: item.status || 'active',
      promotion: item.promotion || item.Promowanie,
      external_olx_url: item.external_olx_url || item.OLX || item.Link_OLX,
    };
  }).filter(item => item !== null);

  const { error: equipError } = await supabase
    .from('equipment')
    .insert(equipmentToInsert);

  if (equipError) {
    console.error('Error migrating equipment:', equipError.message);
  } else {
    console.log(`Successfully migrated ${equipmentToInsert.length} equipment items with UUIDs.`);
  }

  console.log('✅ Migration finished.');
}

migrate();
