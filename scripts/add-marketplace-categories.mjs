// Preview: node --env-file=.env.local scripts/add-marketplace-categories.mjs
// Seed before deployment: add --seed. Reassign verified offers after deployment: add --apply.
import { createClient } from '@supabase/supabase-js';
import { SEO_CATEGORIES } from '../lib/categories.js';

const mode = process.argv[2];
if (mode && mode !== '--seed' && mode !== '--apply') throw new Error(`Unknown option: ${mode}`);

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!url || !key) throw new Error('Missing Supabase URL or service role key.');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const newCategories = Object.values(SEO_CATEGORIES).filter((category) => category.minListingsForIndexing);
const assignments = [
  { name: 'Akumulatorowa maszyna do wiązania prętów zbrojeniowych', from: 'tools', to: 'concrete', sub: 'rebar_tools' },
  { name: 'Szlifierka do betonu', from: 'tools', to: 'concrete', sub: 'concrete_grinders' },
  { name: 'Kruszarka do gruzu, betonu i cegły', from: 'earthmoving', to: 'other-equipment', sub: 'crushers' },
  { name: 'Zsyp do gruzu, zsyp budowlany MÜBA', from: 'access-platforms', to: 'other-equipment', sub: 'rubble_chutes' },
];

async function query(request) {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data;
}

const categoryColumns = 'id,name,slug,db_key,status,sort_order';
const existing = await query(db.from('equipment_categories').select(categoryColumns));
const categoryRows = newCategories.map(({ dbKey, slug, name, title, description }, index) => {
  const row = existing.find((category) => category.db_key === dbKey || category.slug === slug);
  if (row && (row.db_key !== dbKey || row.slug !== slug || row.status !== 'active')) {
    throw new Error(`Conflicting category: ${slug}`);
  }
  console.log(`${row ? 'Present' : 'Add'}: ${name}`);
  return { db_key: dbKey, slug, name, seo_title: title, seo_description: description, description, status: 'active', sort_order: 6 + index };
});

const listings = await query(db.from('equipment').select('id,name,category,category_id,subcategory,subcategory_id,status')
  .in('status', ['active', 'incomplete']).in('name', assignments.map(({ name }) => name)));
const changes = assignments.flatMap((assignment) => {
  const matches = listings.filter(({ name }) => name === assignment.name);
  if (matches.length !== 1) throw new Error(`Expected one public listing: ${assignment.name}`);
  const [listing] = matches;
  const current = existing.find(({ id }) => id === listing.category_id)?.db_key || listing.category;
  if (current === assignment.to && listing.subcategory === assignment.sub) return [];
  if (current !== assignment.from) throw new Error(`Unexpected category ${current}: ${listing.name}`);
  console.log(`${listing.name} → ${assignment.to} / ${assignment.sub}`);
  return [{ ...assignment, listing }];
});

if (mode) {
  await query(db.from('equipment_categories').upsert(categoryRows, { onConflict: 'db_key', ignoreDuplicates: true }));
  const saved = await query(db.from('equipment_categories').select(categoryColumns).in('db_key', categoryRows.map(({ db_key }) => db_key)));
  const categoryByKey = new Map(saved.map((row) => [row.db_key, row]));
  const subcategoryRows = newCategories.flatMap(({ dbKey, filters }) => filters.map(({ value, label }, index) => ({
    category_id: categoryByKey.get(dbKey).id, slug: value, name: label, sort_order: index + 1, status: 'active',
  })));
  await query(db.from('equipment_subcategories').upsert(subcategoryRows, { onConflict: 'category_id,slug', ignoreDuplicates: true }));
  const subcategories = await query(db.from('equipment_subcategories').select('id,category_id,slug,status')
    .in('category_id', saved.map(({ id }) => id)));

  for (const row of subcategoryRows) {
    if (!subcategories.some((sub) => sub.category_id === row.category_id && sub.slug === row.slug && sub.status === 'active')) {
      throw new Error(`Missing active subcategory: ${row.slug}`);
    }
  }

  if (mode === '--apply') {
    for (const { listing, to, sub } of changes) {
      const categoryId = categoryByKey.get(to).id;
      const subcategory = subcategories.find((row) => row.category_id === categoryId && row.slug === sub);
      let update = db.from('equipment').update({ category: to, category_id: categoryId, subcategory: sub, subcategory_id: subcategory.id })
        .eq('id', listing.id).eq('name', listing.name).eq('status', listing.status);
      for (const column of ['category', 'category_id', 'subcategory', 'subcategory_id']) {
        update = listing[column] == null ? update.is(column, null) : update.eq(column, listing[column]);
      }
      const rows = await query(update.select('id'));
      if (rows.length !== 1) throw new Error(`Listing changed before reassignment: ${listing.name}`);
    }
  }
}

console.log(mode === '--apply' ? `Reassigned ${changes.length} listings.` : mode === '--seed' ? 'Categories and subcategories are ready.' : 'Preview only.');
