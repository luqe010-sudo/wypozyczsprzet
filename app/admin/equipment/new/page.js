import { createClient } from '@/utils/supabase/server'
import AdminNewEquipmentForm from './AdminNewEquipmentForm'

export default async function AdminNewEquipmentPage() {
  const supabase = createClient()

  const [
    { data: companies },
    { data: categories },
    { data: subcategories },
    { data: branches }
  ] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('equipment_categories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('equipment_subcategories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('company_branches').select('id, company_id, name, city, address, is_main').order('is_main', { ascending: false })
  ])

  return (
    <div className="py-6">
      <AdminNewEquipmentForm 
        companies={companies || []} 
        categories={categories || []} 
        subcategories={subcategories || []} 
        branches={branches || []} 
      />
    </div>
  )
}
