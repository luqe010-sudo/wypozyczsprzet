-- MVP MIGRATION: structured listing data, stable slugs, inquiries, company verification, moderation.
-- Additive: no column or row is removed. Safe to run more than once.

BEGIN;

-- ─── Equipment: structured data ─────────────────────────────────────────────
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS source_title text,
  ADD COLUMN IF NOT EXISTS price_type text NOT NULL DEFAULT 'ask',
  ADD COLUMN IF NOT EXISTS price_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS delivery_available boolean,
  ADD COLUMN IF NOT EXISTS with_operator boolean,
  ADD COLUMN IF NOT EXISTS vat_invoice boolean,
  ADD COLUMN IF NOT EXISTS specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'owner';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'equipment_price_type_check') THEN
    ALTER TABLE public.equipment
      ADD CONSTRAINT equipment_price_type_check CHECK (price_type IN ('fixed', 'ask'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS equipment_slug_unique ON public.equipment (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment (status);
CREATE INDEX IF NOT EXISTS idx_equipment_company_id ON public.equipment (company_id);

-- Backfill price from the legacy text column ('120', '120,50', 'zapytaj', 'zapytaj o cenę').
UPDATE public.equipment
SET
  price_type = CASE WHEN btrim(price_from) ~ '^[0-9]+([.,][0-9]+)?$' THEN 'fixed' ELSE 'ask' END,
  price_amount = CASE
    WHEN btrim(price_from) ~ '^[0-9]+([.,][0-9]+)?$' THEN replace(btrim(price_from), ',', '.')::numeric
    ELSE NULL
  END
WHERE price_amount IS NULL;

-- Normalise availability values that carry a leading space.
UPDATE public.equipment SET availability = btrim(availability)
WHERE availability IS DISTINCT FROM btrim(availability);

-- Listings of companies nobody has claimed were imported, not written by the owner.
UPDATE public.equipment e
SET source = 'imported'
FROM public.companies c
WHERE c.id = e.company_id AND c.owner_user_id IS NULL AND e.source = 'owner';

-- ─── Companies: verification ────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS nip text;

-- ─── Inquiries ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  equipment_name text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  message text,
  date_from date,
  date_to date,
  job_location text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  firm_notified_at timestamptz,
  admin_notified_at timestamptz,
  ip_hash text,
  consent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_company ON public.inquiries (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_recent ON public.inquiries (ip_hash, created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Created only by the server (service role). Owners read theirs and may change the status only.
REVOKE ALL ON public.inquiries FROM anon;
REVOKE ALL ON public.inquiries FROM authenticated;
GRANT SELECT ON public.inquiries TO authenticated;
GRANT UPDATE (status) ON public.inquiries TO authenticated;

DROP POLICY IF EXISTS "Owners read own inquiries" ON public.inquiries;
CREATE POLICY "Owners read own inquiries" ON public.inquiries
  FOR SELECT TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners update own inquiries" ON public.inquiries;
CREATE POLICY "Owners update own inquiries" ON public.inquiries
  FOR UPDATE TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE owner_user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins read inquiries" ON public.inquiries;
CREATE POLICY "Admins read inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update inquiries" ON public.inquiries;
CREATE POLICY "Admins update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Moderation guards ──────────────────────────────────────────────────────
-- Enforced in the database because owners can reach PostgREST directly with their own token.
CREATE OR REPLACE FUNCTION public.guard_equipment_write()
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
    NEW.priority := 1;
    NEW.source := 'owner';
    -- First listing of an unverified company waits for moderation.
    IF EXISTS (SELECT 1 FROM companies WHERE id = NEW.company_id AND verified_at IS NOT NULL)
       OR EXISTS (SELECT 1 FROM equipment WHERE company_id = NEW.company_id AND status = 'active') THEN
      NEW.status := 'active';
    ELSE
      NEW.status := 'pending';
    END IF;
    RETURN NEW;
  END IF;

  NEW.priority := OLD.priority;
  NEW.source := OLD.source;
  NEW.slug := OLD.slug;
  -- Owners may only pause, resume and re-confirm; never approve their own listing.
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
    (OLD.status IN ('active', 'incomplete') AND NEW.status = 'inactive')
    OR (OLD.status IN ('inactive', 'stale') AND NEW.status = 'active')
  ) THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS guard_equipment_write ON public.equipment;
CREATE TRIGGER guard_equipment_write
  BEFORE INSERT OR UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.guard_equipment_write();

CREATE OR REPLACE FUNCTION public.guard_company_write()
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
    NEW.verified_at := NULL;
    RETURN NEW;
  END IF;

  NEW.verified_at := OLD.verified_at;
  NEW.owner_user_id := OLD.owner_user_id;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS guard_company_write ON public.companies;
CREATE TRIGGER guard_company_write
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.guard_company_write();

-- ─── Read access: unapproved listings are visible to their owner and admins only ───
DROP POLICY IF EXISTS "Equipment is viewable by everyone." ON public.equipment;
DROP POLICY IF EXISTS "Public can read published equipment" ON public.equipment;
CREATE POLICY "Public can read published equipment" ON public.equipment
  FOR SELECT
  USING (status IN ('active', 'incomplete', 'inactive', 'stale'));

DROP POLICY IF EXISTS "Owners can read own equipment" ON public.equipment;
CREATE POLICY "Owners can read own equipment" ON public.equipment
  FOR SELECT TO authenticated
  USING (company_id IN (SELECT id FROM public.companies WHERE owner_user_id = auth.uid()));

COMMIT;
