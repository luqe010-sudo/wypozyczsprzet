-- Admin RLS policies for company_directory tables
-- Run this in your Supabase SQL Editor AFTER supabase_directory_migration.sql

-- ─── Admin full access to company_directory ─────────────────────────────────
DROP POLICY IF EXISTS "Admins have full access to company_directory" ON public.company_directory;
CREATE POLICY "Admins have full access to company_directory"
ON public.company_directory
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ─── Admin full access to company_directory_branches ────────────────────────
DROP POLICY IF EXISTS "Admins have full access to company_directory_branches" ON public.company_directory_branches;
CREATE POLICY "Admins have full access to company_directory_branches"
ON public.company_directory_branches
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
