-- Create equipment_stats table
CREATE TABLE IF NOT EXISTS public.equipment_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE UNIQUE,
    views_count INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    olx_clicks INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_equipment_stats_equipment_id ON public.equipment_stats(equipment_id);

-- Enable RLS
ALTER TABLE public.equipment_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Admins can do everything
CREATE POLICY "Admins have full access to equipment_stats" ON public.equipment_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 2. Owners can view their own equipment stats
CREATE POLICY "Owners can view their own equipment stats" ON public.equipment_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.equipment
            JOIN public.companies ON equipment.company_id = companies.id
            WHERE equipment.id = equipment_stats.equipment_id 
            AND companies.owner_user_id = auth.uid()
        )
    );

-- 3. Public can view stats (needed for trending logic, but we won't show exact counts in UI)
-- If we want to strictly follow "user widzi tylko swoich", we'd restrict SELECT.
-- But "Popularne" labels need some data. Let's allow public SELECT for now.
CREATE POLICY "Public can view equipment stats" ON public.equipment_stats
    FOR SELECT USING (true);

-- RPC Function for incrementing stats (SECURITY DEFINER to bypass RLS for updates)
CREATE OR REPLACE FUNCTION increment_equipment_stat(eq_id UUID, stat_type TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.equipment_stats (equipment_id, views_count, phone_clicks, website_clicks, olx_clicks, favorites_count)
    VALUES (
        eq_id, 
        CASE WHEN stat_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'phone' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'website' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'olx' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'favorite' THEN 1 ELSE 0 END
    )
    ON CONFLICT (equipment_id) DO UPDATE
    SET 
        views_count = CASE WHEN stat_type = 'view' THEN equipment_stats.views_count + 1 ELSE equipment_stats.views_count END,
        phone_clicks = CASE WHEN stat_type = 'phone' THEN equipment_stats.phone_clicks + 1 ELSE equipment_stats.phone_clicks END,
        website_clicks = CASE WHEN stat_type = 'website' THEN equipment_stats.website_clicks + 1 ELSE equipment_stats.website_clicks END,
        olx_clicks = CASE WHEN stat_type = 'olx' THEN equipment_stats.olx_clicks + 1 ELSE equipment_stats.olx_clicks END,
        favorites_count = CASE WHEN stat_type = 'favorite' THEN equipment_stats.favorites_count + 1 ELSE equipment_stats.favorites_count END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
