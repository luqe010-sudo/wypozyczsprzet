-- Paid featured listings (2026-11-23).
-- A listing is featured while priority > 1. featured_until is when a paid period ends;
-- NULL means featured without an end date (set by hand in the admin panel).
-- The daily cron (/api/cron/freshness) resets expired listings to priority 1.
-- Run once in the Supabase SQL editor before deploying the code that uses it.

ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Owners may not extend their own featured period: only admins and the service role change it.
CREATE OR REPLACE FUNCTION public.guard_equipment_featured_until()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF coalesce(auth.role(), '') <> 'authenticated' OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.featured_until := NULL;
  ELSE
    NEW.featured_until := OLD.featured_until;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS guard_equipment_featured_until ON public.equipment;
CREATE TRIGGER guard_equipment_featured_until
  BEFORE INSERT OR UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.guard_equipment_featured_until();

-- A company asks to feature one of its listings; the admin turns it on after payment.
CREATE TABLE IF NOT EXISTS public.featured_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'paid', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  featured_until timestamptz
);

-- One open request per listing.
CREATE UNIQUE INDEX IF NOT EXISTS featured_requests_one_open
  ON public.featured_requests (equipment_id) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS featured_requests_company ON public.featured_requests (company_id);

ALTER TABLE public.featured_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners read own featured requests" ON public.featured_requests;
CREATE POLICY "Owners read own featured requests" ON public.featured_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = featured_requests.company_id AND c.owner_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners request featuring of own listings" ON public.featured_requests;
CREATE POLICY "Owners request featuring of own listings" ON public.featured_requests
  FOR INSERT WITH CHECK (
    requested_by = auth.uid()
    AND status = 'new'
    AND handled_at IS NULL
    AND featured_until IS NULL
    AND EXISTS (
      SELECT 1 FROM public.equipment e
      JOIN public.companies c ON c.id = e.company_id
      WHERE e.id = featured_requests.equipment_id AND e.company_id = featured_requests.company_id AND c.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage featured requests" ON public.featured_requests;
CREATE POLICY "Admins manage featured requests" ON public.featured_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- The listings featured for free since 2026-11-06 stay featured until the end of 2026 (Warsaw time).
UPDATE public.equipment
SET featured_until = '2026-12-31 23:59:59+01'
WHERE priority > 1 AND featured_until IS NULL;
