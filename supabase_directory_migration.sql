-- Migration: Add slug column to company_directory
-- Run this in your Supabase SQL Editor

-- 1. Add the slug column
ALTER TABLE company_directory
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create a function to generate slugs from Polish text
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(
          input,
          'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ',
          'acelnoszz ACELNOSZZ'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'  -- remove special chars
      ),
      '\s+', '-', 'g'               -- spaces to hyphens
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2b. Drop unique index if it already exists to prevent constraint violations during bulk update
DROP INDEX IF EXISTS idx_company_directory_slug;

-- 3. Populate slug for all existing companies (and overwrite any duplicates from previous failed runs)
UPDATE company_directory
SET slug = generate_slug(name);

-- 3b. Resolve duplicate slugs by appending a numeric suffix (e.g. minikoparka-wroclaw-2)
WITH numbered_duplicates AS (
  SELECT id, slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM company_directory
)
UPDATE company_directory cd
SET slug = nd.slug || '-' || nd.rn
FROM numbered_duplicates nd
WHERE cd.id = nd.id AND nd.rn > 1;

-- 4. Make slug unique and not null
ALTER TABLE company_directory
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_directory_slug
ON company_directory (slug);

-- 5. Enable RLS read access for anonymous users (if not already)
-- This allows the catalog to fetch data without authentication
ALTER TABLE company_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_directory_branches ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'company_directory'
      AND policyname = 'Allow public read access on company_directory'
  ) THEN
    CREATE POLICY "Allow public read access on company_directory"
    ON company_directory FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'company_directory_branches'
      AND policyname = 'Allow public read access on company_directory_branches'
  ) THEN
    CREATE POLICY "Allow public read access on company_directory_branches"
    ON company_directory_branches FOR SELECT
    USING (true);
  END IF;
END $$;
