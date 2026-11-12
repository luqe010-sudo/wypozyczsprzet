// Brings equipment_categories, equipment_subcategories and listing assignments in line with lib/categories.js.
// Preview (exits with code 1 when the database differs): node --env-file=.env.local scripts/sync-categories.mjs
// Apply:                                                    node --env-file=.env.local scripts/sync-categories.mjs --apply
import { createClient } from '@supabase/supabase-js';
import { SEO_CATEGORIES } from '../lib/categories.js';

const mode = process.argv[2];
if (mode && mode !== '--apply') throw new Error(`Unknown option: ${mode}`);
const apply = mode === '--apply';

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!url || !key) throw new Error('Missing Supabase URL or service role key.');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function query(request) {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data;
}

// Listings filed in the wrong place or without a subcategory (2026-11-12 review). Matched by exact name and,
// where given, the current category, so an offer that was edited in the meantime is left alone.
const REASSIGNMENTS = [
  { name: 'Ładowarka kołowa Case 321F', to: 'earthmoving', sub: 'loaders' },
  { name: 'Ładowarka przegubowa Kramer 750, łyżka 1 m³', to: 'earthmoving', sub: 'loaders' },
  { name: 'Miniładowarka Bobcat, udźwig 600–800 kg', to: 'earthmoving', sub: 'loaders' },
  { name: 'Ładowarka', from: 'earthmoving', to: 'earthmoving', sub: 'loaders' },
  { name: 'Ładowarka, Minikoparka', from: 'earthmoving', to: 'earthmoving', sub: 'loaders' },
  { name: 'Koparka kołowa z rototilt', from: 'earthmoving', to: 'earthmoving', sub: 'excavators' },
  { name: 'Minikoparki 2–6 t i 9 t', from: 'earthmoving', to: 'earthmoving', sub: 'miniexcavators' },
  { name: 'Minikoparki JCB 8016 oraz JCB 8014', from: 'earthmoving', to: 'earthmoving', sub: 'miniexcavators' },
  { name: 'Minikoparka, usługi z wiertłami i transport', from: 'earthmoving', to: 'earthmoving', sub: 'miniexcavators' },
  { name: 'Skoczek (stopa wibracyjna) 80 kg', from: 'earthmoving', to: 'earthmoving', sub: 'compactors' },
  { name: 'Zagęszczarka spalinowa z rewersem 130 kg', from: 'earthmoving', to: 'earthmoving', sub: 'compactors' },
  { name: 'Wiertnica glebowa Oleo-Mac WRG2', from: 'earthmoving', to: 'earthmoving', sub: 'earth_augers' },
  { name: 'Wiertnica spalinowa glebowa z wiertłami 10/20/30 cm', from: 'earthmoving', to: 'earthmoving', sub: 'earth_augers' },
  { name: 'Wiertnica glebowa spalinowa, świder 200 mm', from: 'garden', to: 'earthmoving', sub: 'earth_augers' },
  { name: 'Młot wyburzeniowy', from: 'earthmoving', to: 'tools', sub: 'demolition_hammers' },
  { name: 'Podnośnik koszowy 14m', from: 'earthmoving', to: 'access-platforms', sub: 'lifts' },
  { name: 'Rusztowanie elewacyjne Plettac, montaż i transport', from: 'access-platforms', to: 'access-platforms', sub: 'scaffolding' },
  { name: 'Dźwig samojezdny Grove GMK3050 z operatorem', from: 'other-equipment', to: 'access-platforms', sub: 'cranes' },
  { name: 'Kosa spalinowa Stihl FS 240', from: 'garden', to: 'garden', sub: 'trimmers' },
  { name: 'Kosa spalinowa STIHL z żyłką i trójzębem', from: 'garden', to: 'garden', sub: 'trimmers' },
  { name: 'Rębak Cedrus RB04 Pro-E', from: 'garden', to: 'garden', sub: 'shredders' },
  { name: 'Agregat malarski hydrodynamiczny', from: 'power-generators', to: 'tools', sub: 'paint_sprayers' },
  { name: 'Agregat malarski Graco PC 390', from: 'tools', to: 'tools', sub: 'paint_sprayers' },
  { name: 'Dalmierz laserowy LDM100, 100 m', from: 'tools', to: 'tools', sub: 'surveying' },
  { name: 'Niwelator laserowy Topcon RL-H5A', from: 'tools', to: 'tools', sub: 'surveying' },
  { name: 'Niwelator optyczny Bosch GOL 32 D', from: 'tools', to: 'tools', sub: 'surveying' },
  { name: 'Wiertnica diamentowa Hilti do betonu i żelbetu', from: 'tools', to: 'tools', sub: 'core_drills' },
  { name: 'Myjka ciśnieniowa, odkurzacz piorący, inne', from: 'tools', to: 'cleaning', sub: 'pressure_washers' },
  { name: 'Szorowarka do posadzek Lavor Quick 36', from: 'other-equipment', to: 'cleaning', sub: 'floor_scrubbers' },
  { name: 'Ażurowe ogrodzenie budowlane Mobilt', from: 'other-equipment', to: 'other-equipment', sub: 'temporary_fencing' },
  { name: 'Ogrodzenie tymczasowe placu budowy', from: 'other-equipment', to: 'other-equipment', sub: 'temporary_fencing' },
  { name: 'Pełne ogrodzenie budowlane Smart', from: 'other-equipment', to: 'other-equipment', sub: 'temporary_fencing' },
  { name: 'Przenośna kabina sanitarna Standard, 265 l', from: 'other-equipment', to: 'other-equipment', sub: 'portable_toilets' },
  { name: 'Stemple budowlane o nośności 2,5 t', from: 'other-equipment', to: 'other-equipment', sub: 'props_and_formwork' },
];

const codeCategories = Object.values(SEO_CATEGORIES);
const pending = [];
const plan = (description, run) => { pending.push(run); console.log(`  ${description}`); };
const changedFields = (row, wanted) => Object.keys(wanted).filter((field) => row[field] !== wanted[field]);

// ─── Categories ──────────────────────────────────────────────────────────────
console.log('Kategorie:');
const categoryColumns = 'id,db_key,slug,name,seo_title,seo_description,description,status,sort_order';
let categories = await query(db.from('equipment_categories').select(categoryColumns));
codeCategories.forEach((category, index) => {
  const wanted = {
    db_key: category.dbKey, slug: category.slug, name: category.name, seo_title: category.title,
    seo_description: category.description, description: category.description, status: 'active', sort_order: index + 1,
  };
  const row = categories.find((item) => item.db_key === category.dbKey);
  if (!row) {
    plan(`+ ${category.name} (${category.slug})`, () => query(db.from('equipment_categories').insert(wanted)));
    return;
  }
  const fields = changedFields(row, wanted);
  if (fields.length) {
    const update = Object.fromEntries(fields.map((field) => [field, wanted[field]]));
    plan(`~ ${row.name} → ${fields.map((field) => `${field}: ${JSON.stringify(wanted[field]).slice(0, 60)}`).join(', ')}`,
      () => query(db.from('equipment_categories').update(update).eq('id', row.id)));
  }
});
categories.filter((row) => !codeCategories.some((category) => category.dbKey === row.db_key))
  .forEach((row) => console.log(`  ! ${row.db_key} (${row.name}) jest w bazie, ale nie w kodzie`));

if (apply) for (const run of pending.splice(0)) await run();
categories = await query(db.from('equipment_categories').select(categoryColumns));
const categoryIdByKey = new Map(categories.map((row) => [row.db_key, row.id]));
const categoryKeyById = new Map(categories.map((row) => [row.id, row.db_key]));

// ─── Subcategories ───────────────────────────────────────────────────────────
console.log('Podkategorie:');
const subcategoryColumns = 'id,category_id,slug,name,status,sort_order';
let subcategories = await query(db.from('equipment_subcategories').select(subcategoryColumns));
for (const category of codeCategories) {
  const categoryId = categoryIdByKey.get(category.dbKey);
  category.filters.forEach(({ value, label }, index) => {
    const wanted = { category_id: categoryId, slug: value, name: label, status: 'active', sort_order: index + 1 };
    const matches = subcategories.filter((row) => row.slug === value);
    if (matches.length > 1) throw new Error(`Subcategory ${value} exists ${matches.length} times`);
    const [row] = matches;
    if (!row) {
      plan(`+ ${category.name} / ${label}`, () => query(db.from('equipment_subcategories').insert(wanted)));
      return;
    }
    const fields = changedFields(row, wanted);
    if (fields.length) {
      const update = Object.fromEntries(fields.map((field) => [field, wanted[field]]));
      const moved = fields.includes('category_id') ? ` (przeniesiona z ${categoryKeyById.get(row.category_id) || '?'})` : '';
      plan(`~ ${category.name} / ${label}${moved}: ${fields.join(', ')}`,
        () => query(db.from('equipment_subcategories').update(update).eq('id', row.id)));
    }
  });
}
subcategories.filter((row) => !codeCategories.some((category) => category.filters.some(({ value }) => value === row.slug)))
  .forEach((row) => console.log(`  ! ${row.slug} (${row.name}) jest w bazie, ale nie w kodzie`));

if (apply) for (const run of pending.splice(0)) await run();
subcategories = await query(db.from('equipment_subcategories').select(subcategoryColumns));
// Before --apply, new rows do not exist yet; a placeholder id keeps the listing preview readable.
const subcategoryFor = (categoryKey, slug) => {
  const categoryId = categoryIdByKey.get(categoryKey);
  const code = codeCategories.find((category) => category.dbKey === categoryKey);
  if (!code?.filters.some(({ value }) => value === slug)) throw new Error(`Unknown subcategory ${categoryKey}/${slug}`);
  return subcategories.find((row) => row.slug === slug && row.category_id === categoryId)
    || subcategories.find((row) => row.slug === slug)
    || { id: `(nowa: ${slug})`, slug };
};
const categoryOfSubcategory = (slug) => codeCategories.find((category) => category.filters.some(({ value }) => value === slug))?.dbKey;

// ─── Listings ────────────────────────────────────────────────────────────────
console.log('Ogłoszenia:');
const listings = await query(db.from('equipment')
  .select('id,name,status,category,category_id,subcategory,subcategory_id')
  .in('status', ['active', 'incomplete']));
const subcategorySlugById = new Map(subcategories.map((row) => [row.id, row.slug]));

for (const rule of REASSIGNMENTS) {
  const matches = listings.filter((listing) => listing.name === rule.name);
  if (!matches.length) console.log(`  ? brak ogłoszenia „${rule.name}”`);
  for (const listing of matches) listing.target = rule;
}

let unchanged = 0;
for (const listing of listings) {
  const current = categoryKeyById.get(listing.category_id) || listing.category;
  const currentSub = subcategorySlugById.get(listing.subcategory_id) || listing.subcategory || null;
  let to = current;
  let sub = currentSub;
  if (listing.target && (!listing.target.from || listing.target.from === current)) ({ to, sub } = listing.target);
  else if (listing.target) console.log(`  ? „${listing.name}” jest w ${current}, a nie w ${listing.target.from}; pominięte`);
  // A subcategory that moved to another category takes its listings along.
  if (sub && categoryOfSubcategory(sub) && categoryOfSubcategory(sub) !== to) to = categoryOfSubcategory(sub);
  if (sub && !categoryOfSubcategory(sub)) sub = null;

  const subRow = sub ? subcategoryFor(to, sub) : null;
  const wanted = { category: to, category_id: categoryIdByKey.get(to) || `(nowa: ${to})`, subcategory: sub, subcategory_id: subRow?.id ?? null };
  const fields = changedFields(listing, wanted);
  if (!fields.length) { unchanged += 1; continue; }

  plan(`${listing.name.slice(0, 55)}: ${current}/${currentSub || '–'} → ${to}/${sub || '–'}`, async () => {
    let update = db.from('equipment').update(wanted).eq('id', listing.id);
    for (const column of ['category', 'category_id', 'subcategory', 'subcategory_id']) {
      update = listing[column] == null ? update.is(column, null) : update.eq(column, listing[column]);
    }
    const rows = await query(update.select('id'));
    if (rows.length !== 1) console.log(`  ! „${listing.name}” zmieniło się w międzyczasie; pominięte`);
  });
}
console.log(`  bez zmian: ${unchanged}`);

if (apply) {
  for (const run of pending.splice(0)) await run();
  console.log('Zapisano.');
} else if (pending.length) {
  console.log(`\nPodgląd: ${pending.length} zmian łącznie. Zapis: dodaj --apply.`);
  process.exitCode = 1;
} else {
  console.log('\nBaza zgadza się z lib/categories.js.');
}
