-- Create company_claims table
CREATE TABLE IF NOT EXISTS public.company_claims (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    message text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_claims ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own claims
DROP POLICY IF EXISTS "Users can view their own claims" ON public.company_claims;
CREATE POLICY "Users can view their own claims" ON public.company_claims
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own claims
DROP POLICY IF EXISTS "Users can insert their own claims" ON public.company_claims;
CREATE POLICY "Users can insert their own claims" ON public.company_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
DROP POLICY IF EXISTS "Admins can view all claims" ON public.company_claims;
CREATE POLICY "Admins can view all claims" ON public.company_claims
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all claims" ON public.company_claims;
CREATE POLICY "Admins can update all claims" ON public.company_claims
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_company_claims_modtime ON public.company_claims;
CREATE TRIGGER update_company_claims_modtime
    BEFORE UPDATE ON public.company_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
