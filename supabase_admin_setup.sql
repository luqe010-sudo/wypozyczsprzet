-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can do everything on profiles." ON public.profiles;
CREATE POLICY "Admins can do everything on profiles." ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Sync auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. UPDATE COMPANIES RLS FOR ADMINS
DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;
CREATE POLICY "Admins have full access to companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 6. UPDATE EQUIPMENT RLS FOR ADMINS
DROP POLICY IF EXISTS "Admins have full access to equipment" ON public.equipment;
CREATE POLICY "Admins have full access to equipment" ON public.equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 7. INITIAL ADMIN (Manual step instruction)
-- Aby ustawić siebie jako admina, znajdź swój ID w auth.users i wykonaj:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'TWOJ-ID-UUID';
