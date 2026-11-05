-- SECURITY HOTFIX
-- Closes holes found in the live policies: every policy below was permissive and
-- applied to role "public", so it was OR-ed with the stricter ones.

BEGIN;

-- 1. Any logged-in user could promote themselves to admin; roles were world-readable.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile basics" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
-- Remaining: "Users can view own profile." and "Admins can manage all profiles".

-- 2. The company catalog was writable by anyone, including anonymous visitors.
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.company_directory;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.company_directory_branches;
-- Remaining: public read + "Admins have full access ...".

-- 3. Listing statistics are for owners and admins only.
DROP POLICY IF EXISTS "Public can view equipment stats" ON public.equipment_stats;

-- 4. SECURITY DEFINER functions must pin search_path.
ALTER FUNCTION public.handle_new_user() SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_equipment_stat(eq_id uuid, stat_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF stat_type NOT IN ('view', 'phone', 'website', 'olx') THEN
    RETURN;
  END IF;

  INSERT INTO public.equipment_stats (equipment_id, views_count, phone_clicks, website_clicks, olx_clicks)
  VALUES (
    eq_id,
    CASE WHEN stat_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN stat_type = 'phone' THEN 1 ELSE 0 END,
    CASE WHEN stat_type = 'website' THEN 1 ELSE 0 END,
    CASE WHEN stat_type = 'olx' THEN 1 ELSE 0 END
  )
  ON CONFLICT (equipment_id) DO UPDATE
  SET
    views_count = equipment_stats.views_count + CASE WHEN stat_type = 'view' THEN 1 ELSE 0 END,
    phone_clicks = equipment_stats.phone_clicks + CASE WHEN stat_type = 'phone' THEN 1 ELSE 0 END,
    website_clicks = equipment_stats.website_clicks + CASE WHEN stat_type = 'website' THEN 1 ELSE 0 END,
    olx_clicks = equipment_stats.olx_clicks + CASE WHEN stat_type = 'olx' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$function$;

COMMIT;
