-- SECURITY FIXES FOR SUPABASE

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Profiles: users can read their own profile and cannot self-promote.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
CREATE POLICY "Users can view own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile basics" ON public.profiles;
CREATE POLICY "Users can update own profile basics" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can do everything on profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin access to marketplace tables.
DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;
CREATE POLICY "Admins have full access to companies" ON public.companies
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to equipment" ON public.equipment;
CREATE POLICY "Admins have full access to equipment" ON public.equipment
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Owner policies should validate both the existing row and the new row.
DROP POLICY IF EXISTS "Users can update their own companies." ON public.companies;
CREATE POLICY "Users can update their own companies." ON public.companies
  FOR UPDATE
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can update their own equipment." ON public.equipment;
CREATE POLICY "Users can update their own equipment." ON public.equipment
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
    )
  );

-- Admin policies for company claims.
DROP POLICY IF EXISTS "Admins can view all claims" ON public.company_claims;
CREATE POLICY "Admins can view all claims" ON public.company_claims
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all claims" ON public.company_claims;
CREATE POLICY "Admins can update all claims" ON public.company_claims
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
