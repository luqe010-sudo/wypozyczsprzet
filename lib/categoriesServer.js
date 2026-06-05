import { unstable_cache } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * Fetch active categories and subcategories from DB using Next.js cache
 */
export const fetchCategoriesFromDB = unstable_cache(
  async () => {
    const supabase = createClient()
    const [catRes, subRes] = await Promise.all([
      supabase.from('equipment_categories').select('*').eq('status', 'active').order('sort_order'),
      supabase.from('equipment_subcategories').select('*').eq('status', 'active').order('sort_order')
    ])

    if (catRes.error) throw catRes.error
    if (subRes.error) throw subRes.error

    return {
      categories: catRes.data || [],
      subcategories: subRes.data || []
    }
  },
  ['equipment-categories-db'],
  { revalidate: 3600, tags: ['equipment-categories'] }
)
