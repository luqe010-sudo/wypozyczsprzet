import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { slugify, citySlug, voivodeshipSlug } from './slugify';

// Re-export slug utilities for convenience
export { slugify, citySlug, voivodeshipSlug };

/**
 * Creates a Supabase admin client for server-side data fetching.
 * Uses service role key for unrestricted access during build/SSR.
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Directory] Supabase credentials missing');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}


// ─── Data fetching ───────────────────────────────────────────────────────────

/**
 * Fetches all companies with their branches joined.
 * Returns enriched company objects with a `branches` array.
 */
export async function fetchAllCompanies() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: companies, error: compError } = await supabase
    .from('company_directory')
    .select('*')
    .order('name', { ascending: true });

  if (compError) {
    console.error('[Directory] Error fetching companies:', compError);
    return [];
  }

  const { data: branches, error: branchError } = await supabase
    .from('company_directory_branches')
    .select('*');

  if (branchError) {
    console.error('[Directory] Error fetching branches:', branchError);
    return companies.map((c) => ({ ...c, branches: [] }));
  }

  // Group branches by company_id
  const branchMap = {};
  for (const branch of branches) {
    const cid = branch.company_id;
    if (!branchMap[cid]) branchMap[cid] = [];
    branchMap[cid].push(branch);
  }

  return companies.map((company) => ({
    ...company,
    slug: company.slug || slugify(company.name),
    branches: branchMap[company.id] || [],
  }));
}

/**
 * Fetches a single company by its slug, with all branches.
 */
export async function fetchCompanyBySlug(companySlug) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // First try exact slug match
  let { data: company, error } = await supabase
    .from('company_directory')
    .select('*')
    .eq('slug', companySlug)
    .single();

  if (error || !company) {
    // Fallback: fetch all and match by generated slug
    const all = await fetchAllCompanies();
    company = all.find((c) => slugify(c.name) === companySlug || c.slug === companySlug);
    if (company) return company; // already has branches from fetchAllCompanies
    return null;
  }

  // Fetch branches for this company
  const { data: branches } = await supabase
    .from('company_directory_branches')
    .select('*')
    .eq('company_id', company.id);

  return {
    ...company,
    slug: company.slug || slugify(company.name),
    branches: branches || [],
  };
}

/**
 * Returns all unique city slugs from branches.
 */
export async function getAllCities() {
  const companies = await fetchAllCompanies();
  const cityMap = new Map();

  for (const company of companies) {
    for (const branch of company.branches) {
      if (branch.city) {
        const slug = citySlug(branch.city);
        if (!cityMap.has(slug)) {
          cityMap.set(slug, {
            slug,
            name: branch.city,
            voivodeship: branch.voivodeship || '',
          });
        }
      }
    }
  }

  return Array.from(cityMap.values());
}

/**
 * Returns all unique voivodeship slugs from branches.
 */
export async function getAllVoivodeships() {
  const companies = await fetchAllCompanies();
  const voivMap = new Map();

  for (const company of companies) {
    for (const branch of company.branches) {
      if (branch.voivodeship) {
        const slug = voivodeshipSlug(branch.voivodeship);
        if (!voivMap.has(slug)) {
          voivMap.set(slug, {
            slug,
            name: branch.voivodeship,
          });
        }
      }
    }
  }

  return Array.from(voivMap.values());
}

/**
 * Generates all static params for /katalog/[city]/[companySlug].
 * Each company appears under every city where it has a branch.
 */
export async function generateCityCompanyParams() {
  const companies = await fetchAllCompanies();
  const params = [];

  for (const company of companies) {
    const compSlug = company.slug || slugify(company.name);
    const seenCities = new Set();

    for (const branch of company.branches) {
      if (branch.city) {
        const cSlug = citySlug(branch.city);
        if (!seenCities.has(cSlug)) {
          seenCities.add(cSlug);
          params.push({
            city: cSlug,
            companySlug: compSlug,
          });
        }
      }
    }
  }

  return params;
}

/**
 * Generates all static params for /katalog/woj/[voivodeship]/[companySlug].
 * Each company appears under every voivodeship where it has a branch.
 */
export async function generateVoivodeshipCompanyParams() {
  const companies = await fetchAllCompanies();
  const params = [];

  for (const company of companies) {
    const compSlug = company.slug || slugify(company.name);
    const seenVoivodeships = new Set();

    for (const branch of company.branches) {
      if (branch.voivodeship) {
        const vSlug = voivodeshipSlug(branch.voivodeship);
        if (!seenVoivodeships.has(vSlug)) {
          seenVoivodeships.add(vSlug);
          params.push({
            voivodeship: vSlug,
            companySlug: compSlug,
          });
        }
      }
    }
  }

  return params;
}

/**
 * Finds the "primary" city slug for a company (first branch city).
 * Used for canonical URL generation.
 */
export function getPrimaryCitySlug(company) {
  if (company.branches && company.branches.length > 0 && company.branches[0].city) {
    return citySlug(company.branches[0].city);
  }
  return '';
}
