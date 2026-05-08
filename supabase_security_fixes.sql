-- SECURITY FIXES FOR SUPABASE
-- 1. Create is_admin function (if not exists)
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

-- 2. Harden profiles table
-- Remove direct update of role by users
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile basics" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent role change

-- Allow admins to update any profile
DROP POLICY IF EXISTS "Admins can do everything on profiles." ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Consistently apply is_admin() to other tables
-- Companies admin access
DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;
CREATE POLICY "Admins have full access to companies" ON public.companies
  FOR ALL USING (public.is_admin());

-- Equipment admin access
DROP POLICY IF EXISTS "Admins have full access to equipment" ON public.equipment;
CREATE POLICY "Admins have full access to equipment" ON public.equipment
  FOR ALL USING (public.is_admin());

-- 4. Add admin policies for company_claims
DROP POLICY IF EXISTS "Admins can view all claims" ON public.company_claims;
CREATE POLICY "Admins can view all claims" ON public.company_claims
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all claims" ON public.company_claims;
CREATE POLICY "Admins can update all claims" ON public.company_claims
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Restrict public profile visibility (Optional but recommended)
-- Only allow viewing own profile or let it stay public if user names are needed.
-- Keeping it public for now as it's often used for display names, but strictly controlled via role.
