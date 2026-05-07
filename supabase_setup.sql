-- Supabase Setup Script: Auth, Companies, Equipment, RLS

-- 1. Alter companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 2. Alter equipment table
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- 4. Policies for companies
-- Pozwól wszystkim na odczyt firm
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.companies;
CREATE POLICY "Public profiles are viewable by everyone." ON public.companies
  FOR SELECT USING (true);

-- Pozwól zalogowanym dodawać własne firmy
DROP POLICY IF EXISTS "Users can insert their own companies." ON public.companies;
CREATE POLICY "Users can insert their own companies." ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- Pozwól właścicielom aktualizować swoje firmy
DROP POLICY IF EXISTS "Users can update their own companies." ON public.companies;
CREATE POLICY "Users can update their own companies." ON public.companies
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- Pozwól właścicielom usuwać swoje firmy
DROP POLICY IF EXISTS "Users can delete their own companies." ON public.companies;
CREATE POLICY "Users can delete their own companies." ON public.companies
  FOR DELETE USING (auth.uid() = owner_user_id);

-- 5. Policies for equipment
-- Pozwól wszystkim na odczyt sprzętu
DROP POLICY IF EXISTS "Equipment is viewable by everyone." ON public.equipment;
CREATE POLICY "Equipment is viewable by everyone." ON public.equipment
  FOR SELECT USING (true);

-- Pozwól właścicielom firmy dodawać sprzęt
DROP POLICY IF EXISTS "Users can insert equipment to their own companies." ON public.equipment;
CREATE POLICY "Users can insert equipment to their own companies." ON public.equipment
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
    )
  );

-- Pozwól właścicielom firmy edytować sprzęt
DROP POLICY IF EXISTS "Users can update their own equipment." ON public.equipment;
CREATE POLICY "Users can update their own equipment." ON public.equipment
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
    )
  );

-- Pozwól właścicielom firmy usuwać sprzęt
DROP POLICY IF EXISTS "Users can delete their own equipment." ON public.equipment;
CREATE POLICY "Users can delete their own equipment." ON public.equipment
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
    )
  );

-- 6. Automatyczne aktualizowanie updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_companies_modtime ON public.companies;
CREATE TRIGGER update_companies_modtime
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_equipment_modtime ON public.equipment;
CREATE TRIGGER update_equipment_modtime
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
