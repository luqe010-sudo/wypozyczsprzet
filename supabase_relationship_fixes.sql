-- SQL Fix for relationship errors in Admin Panel
-- Run this in your Supabase SQL Editor

-- 1. Fix relationship for companies table
-- This enables joins like .select('*, profiles(role)') using owner_user_id
ALTER TABLE public.companies 
DROP CONSTRAINT IF EXISTS companies_owner_user_id_fkey,
ADD CONSTRAINT companies_owner_user_id_fkey 
FOREIGN KEY (owner_user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- 2. Fix relationship for company_claims table
-- This enables joins like .select('*, profiles:user_id(id)')
ALTER TABLE public.company_claims 
DROP CONSTRAINT IF EXISTS company_claims_user_id_fkey,
ADD CONSTRAINT company_claims_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
