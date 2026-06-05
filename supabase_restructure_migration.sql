-- ============================================================================
-- MIGRACJA STRUKTURY BAZY DANYCH — WypożyczSprzęt
-- ============================================================================
-- Ten skrypt jest ADDYTYWNY — NIE usuwa istniejących danych ani kolumn.
-- Uruchom go w Supabase SQL Editor.
--
-- Co robi:
-- 1. Tworzy tabelę company_branches (oddziały firm marketplace)
-- 2. Migruje city/address/lat/lng z companies → company_branches
-- 3. Tworzy equipment_categories + equipment_subcategories (seed z JS config)
-- 4. Dodaje category_id, subcategory_id, branch_id do equipment
-- 5. Mapuje istniejące dane tekstowe → FK
-- 6. Dodaje linked_company_id do company_directory
-- 7. Konfiguruje RLS na nowych tabelach
-- ============================================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. COMPANY_BRANCHES — oddziały firm z marketplace
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.company_branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text,
  city text,
  voivodeship text,
  zip_code text,
  address text,
  lat double precision,
  lng double precision,
  phone text,
  email text,
  is_main boolean NOT NULL DEFAULT true,
  source text DEFAULT 'migrated'::text,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pk_company_branches PRIMARY KEY (id),
  CONSTRAINT company_branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_company_branches_company_id ON public.company_branches(company_id);
CREATE INDEX IF NOT EXISTS idx_company_branches_city ON public.company_branches(city);
CREATE INDEX IF NOT EXISTS idx_company_branches_is_main ON public.company_branches(company_id, is_main) WHERE is_main = true;

-- Trigger for updated_at
CREATE TRIGGER set_company_branches_updated_at
  BEFORE UPDATE ON public.company_branches
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. MIGRATE DATA: companies → company_branches
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO public.company_branches (company_id, name, city, zip_code, address, lat, lng, phone, email, is_main, source)
SELECT
  c.id,
  'Siedziba główna',
  c.city,
  c.zip_code,
  c.address,
  c.lat,
  c.lng,
  c.phone,
  c.email,
  true,
  'migrated'
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_branches cb WHERE cb.company_id = c.id
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. EQUIPMENT_CATEGORIES — kontrolowane kategorie SEO
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.equipment_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  db_key text NOT NULL UNIQUE,
  icon text,
  description text,
  seo_title text,
  seo_description text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT equipment_categories_pkey PRIMARY KEY (id)
);

-- Seed 5 main SEO categories
INSERT INTO public.equipment_categories (name, slug, db_key, icon, seo_title, seo_description, color, sort_order) VALUES
  ('Roboty ziemne', 'roboty-ziemne', 'earthmoving', '🏗️',
   'Roboty ziemne – wynajem sprzętu | WypożyczSprzęt',
   'Wynajem koparek, minikoparek, koparko-ładowarek, zagęszczarek i ciężkiego sprzętu budowlanego. Porównaj oferty wypożyczalni w Twojej okolicy bez pośredników.',
   'from-amber-500 to-orange-600', 1),
  ('Sprzęt ogrodowy', 'sprzet-ogrodowy', 'garden', '🌿',
   'Sprzęt ogrodowy – wynajem maszyn ogrodowych | WypożyczSprzęt',
   'Wypożycz kosiarki, traktorki, wertykulatory, glebogryzarki i myjki ciśnieniowe. Znajdź najlepsze oferty wynajmu sprzętu ogrodowego w Twojej okolicy.',
   'from-green-500 to-emerald-600', 2),
  ('Agregaty i zasilanie', 'agregaty-i-zasilanie', 'power-generators', '⚡',
   'Agregaty i zasilanie – wynajem generatorów | WypożyczSprzęt',
   'Wynajem agregatów prądotwórczych, kompresorów, nagrzewnic, osuszaczy i spawarek. Profesjonalne zasilanie na każdą budowę.',
   'from-yellow-500 to-amber-600', 3),
  ('Prace na wysokości', 'prace-na-wysokosci', 'access-platforms', '🏢',
   'Prace na wysokości – wynajem rusztowań i podnośników | WypożyczSprzęt',
   'Wypożycz rusztowania, podnośniki koszowe, drabiny i podesty ruchome. Bezpieczna praca na wysokości z profesjonalnym sprzętem.',
   'from-blue-500 to-indigo-600', 4),
  ('Narzędzia', 'narzedzia', 'tools', '🔧',
   'Narzędzia – wynajem elektronarzędzi i sprzętu | WypożyczSprzęt',
   'Wynajem młotów wyburzeniowych, przecinarek, szlifierek, odkurzaczy przemysłowych i bruzdownic. Profesjonalne narzędzia bez kupowania.',
   'from-slate-500 to-slate-700', 5)
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. EQUIPMENT_SUBCATEGORIES
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.equipment_subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  seo_title text,
  seo_description text,
  sort_order integer NOT NULL DEFAULT 0,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT equipment_subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT equipment_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.equipment_categories(id) ON DELETE CASCADE,
  CONSTRAINT equipment_subcategories_slug_category_unique UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_equipment_subcategories_category_id ON public.equipment_subcategories(category_id);

-- Seed subcategories — Roboty ziemne
INSERT INTO public.equipment_subcategories (category_id, name, slug, sort_order)
SELECT ec.id, sub.name, sub.slug, sub.sort_order
FROM public.equipment_categories ec,
  (VALUES
    ('koparki', 'excavators', 1),
    ('minikoparki', 'miniexcavators', 2),
    ('koparko-ładowarki', 'backhoe_loaders', 3),
    ('wozidła', 'dumpers', 4),
    ('zagęszczarki', 'compactors', 5),
    ('walce', 'rollers', 6),
    ('sprzęt brukarski', 'paving_equipment', 7)
  ) AS sub(name, slug, sort_order)
WHERE ec.db_key = 'earthmoving'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories — Sprzęt ogrodowy
INSERT INTO public.equipment_subcategories (category_id, name, slug, sort_order)
SELECT ec.id, sub.name, sub.slug, sub.sort_order
FROM public.equipment_categories ec,
  (VALUES
    ('kosiarki', 'mowers', 1),
    ('traktorki', 'tractors', 2),
    ('wertykulatory', 'scarifiers', 3),
    ('glebogryzarki', 'tillers', 4),
    ('myjki ciśnieniowe', 'pressure_washers', 5),
    ('pilarki', 'saws', 6),
    ('rozdrabniacze', 'shredders', 7)
  ) AS sub(name, slug, sort_order)
WHERE ec.db_key = 'garden'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories — Agregaty i zasilanie
INSERT INTO public.equipment_subcategories (category_id, name, slug, sort_order)
SELECT ec.id, sub.name, sub.slug, sub.sort_order
FROM public.equipment_categories ec,
  (VALUES
    ('agregaty', 'generators', 1),
    ('kompresory', 'compressors', 2),
    ('nagrzewnice', 'heaters', 3),
    ('osuszacze', 'dehumidifiers', 4),
    ('spawarki', 'welders', 5)
  ) AS sub(name, slug, sort_order)
WHERE ec.db_key = 'power-generators'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories — Prace na wysokości
INSERT INTO public.equipment_subcategories (category_id, name, slug, sort_order)
SELECT ec.id, sub.name, sub.slug, sub.sort_order
FROM public.equipment_categories ec,
  (VALUES
    ('rusztowania', 'scaffolding', 1),
    ('podnośniki', 'lifts', 2),
    ('drabiny', 'ladders', 3),
    ('podesty ruchome', 'platforms', 4)
  ) AS sub(name, slug, sort_order)
WHERE ec.db_key = 'access-platforms'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories — Narzędzia
INSERT INTO public.equipment_subcategories (category_id, name, slug, sort_order)
SELECT ec.id, sub.name, sub.slug, sub.sort_order
FROM public.equipment_categories ec,
  (VALUES
    ('młoty wyburzeniowe', 'demolition_hammers', 1),
    ('przecinarki', 'cutters', 2),
    ('szlifierki', 'grinders', 3),
    ('odkurzacze przemysłowe', 'vacuum_cleaners', 4),
    ('bruzdownice', 'wall_chasers', 5)
  ) AS sub(name, slug, sort_order)
WHERE ec.db_key = 'tools'
ON CONFLICT (category_id, slug) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. ADD NEW FK COLUMNS TO EQUIPMENT
-- ──────────────────────────────────────────────────────────────────────────────

-- category_id FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'category_id') THEN
    ALTER TABLE public.equipment ADD COLUMN category_id uuid REFERENCES public.equipment_categories(id);
  END IF;
END $$;

-- subcategory_id FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'subcategory_id') THEN
    ALTER TABLE public.equipment ADD COLUMN subcategory_id uuid REFERENCES public.equipment_subcategories(id);
  END IF;
END $$;

-- branch_id FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'branch_id') THEN
    ALTER TABLE public.equipment ADD COLUMN branch_id uuid REFERENCES public.company_branches(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_equipment_category_id ON public.equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_subcategory_id ON public.equipment(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_equipment_branch_id ON public.equipment(branch_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. MIGRATE: Map existing text category → category_id
-- ──────────────────────────────────────────────────────────────────────────────

-- Direct match: equipment.category = equipment_categories.db_key
UPDATE public.equipment e
SET category_id = ec.id
FROM public.equipment_categories ec
WHERE e.category = ec.db_key
  AND e.category_id IS NULL;

-- Legacy mapping: old DB keys → new categories
-- heavy_equipment, construction_equipment → earthmoving
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'earthmoving')
WHERE category IN ('heavy_equipment', 'construction_equipment') AND category_id IS NULL;

-- garden_equipment, cleaning_equipment → garden
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'garden')
WHERE category IN ('garden_equipment', 'cleaning_equipment') AND category_id IS NULL;

-- generators_and_power → power-generators
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'power-generators')
WHERE category IN ('generators_and_power') AND category_id IS NULL;

-- lifts_and_platforms, scaffolding → access-platforms
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'access-platforms')
WHERE category IN ('lifts_and_platforms', 'scaffolding') AND category_id IS NULL;

-- tools, trailers_and_transport, others, container → tools (fallback)
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'tools')
WHERE category IN ('tools', 'trailers_and_transport', 'others', 'container') AND category_id IS NULL;

-- Anything still unmapped → tools (fallback)
UPDATE public.equipment SET category_id = (SELECT id FROM public.equipment_categories WHERE db_key = 'tools')
WHERE category_id IS NULL AND category IS NOT NULL;

-- Map subcategory text → subcategory_id
UPDATE public.equipment e
SET subcategory_id = es.id
FROM public.equipment_subcategories es
WHERE e.subcategory = es.slug
  AND e.subcategory_id IS NULL
  AND e.subcategory IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. MIGRATE: Set branch_id on equipment (main branch of the company)
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE public.equipment e
SET branch_id = cb.id
FROM public.company_branches cb
WHERE cb.company_id = e.company_id
  AND cb.is_main = true
  AND e.branch_id IS NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. LINKED_COMPANY_ID on company_directory
-- ──────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_directory' AND column_name = 'linked_company_id') THEN
    ALTER TABLE public.company_directory ADD COLUMN linked_company_id uuid REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_directory_branches' AND column_name = 'linked_branch_id') THEN
    ALTER TABLE public.company_directory_branches ADD COLUMN linked_branch_id uuid REFERENCES public.company_branches(id);
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. RLS POLICIES
-- ──────────────────────────────────────────────────────────────────────────────

-- company_branches
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read company_branches" ON public.company_branches
  FOR SELECT USING (true);

CREATE POLICY "Owner can manage own company branches" ON public.company_branches
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Admin full access company_branches" ON public.company_branches
  FOR ALL USING (public.is_admin());

-- equipment_categories (read-only for all, admin can manage)
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read equipment_categories" ON public.equipment_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin full access equipment_categories" ON public.equipment_categories
  FOR ALL USING (public.is_admin());

-- equipment_subcategories (read-only for all, admin can manage)
ALTER TABLE public.equipment_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read equipment_subcategories" ON public.equipment_subcategories
  FOR SELECT USING (true);

CREATE POLICY "Admin full access equipment_subcategories" ON public.equipment_subcategories
  FOR ALL USING (public.is_admin());

-- ──────────────────────────────────────────────────────────────────────────────
-- 10. GRANT PERMISSIONS
-- ──────────────────────────────────────────────────────────────────────────────

GRANT SELECT ON public.company_branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.company_branches TO authenticated;

GRANT SELECT ON public.equipment_categories TO anon, authenticated;
GRANT SELECT ON public.equipment_subcategories TO anon, authenticated;

-- Admin can modify categories (via service role, not needed here but just in case)
GRANT INSERT, UPDATE, DELETE ON public.equipment_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.equipment_subcategories TO authenticated;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run after migration to check data)
-- ============================================================================
-- SELECT count(*) FROM public.company_branches;
-- SELECT count(*) FROM public.equipment_categories;
-- SELECT count(*) FROM public.equipment_subcategories;
-- SELECT count(*) FROM public.equipment WHERE category_id IS NOT NULL;
-- SELECT count(*) FROM public.equipment WHERE branch_id IS NOT NULL;
-- SELECT e.name, ec.name as category, es.name as subcategory, cb.city as branch_city
--   FROM public.equipment e
--   LEFT JOIN public.equipment_categories ec ON ec.id = e.category_id
--   LEFT JOIN public.equipment_subcategories es ON es.id = e.subcategory_id
--   LEFT JOIN public.company_branches cb ON cb.id = e.branch_id
--   LIMIT 10;
