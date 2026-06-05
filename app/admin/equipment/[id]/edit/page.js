import { createClient } from '@/utils/supabase/server'
import AdminEditEquipmentForm from './AdminEditEquipmentForm'
import { notFound } from 'next/navigation'

export default async function AdminEditEquipmentPage({ params }) {
  const { id } = params
  const supabase = createClient()

  // Fetch equipment, categories, subcategories, and branches in parallel
  const [
    { data: equipment },
    { data: categories },
    { data: subcategories }
  ] = await Promise.all([
    supabase.from('equipment').select('*, companies(id, name, city)').eq('id', id).single(),
    supabase.from('equipment_categories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('equipment_subcategories').select('*').eq('status', 'active').order('sort_order'),
  ])

  if (!equipment) {
    notFound()
  }

  // Fetch branches for this equipment's company
  const { data: branches } = await supabase
    .from('company_branches')
    .select('id, name, city, is_main')
    .eq('company_id', equipment.company_id)
    .order('is_main', { ascending: false })

  return (
    <div className="py-6">
      <AdminEditEquipmentForm 
        equipment={equipment} 
        categories={categories || []}
        subcategories={subcategories || []}
        branches={branches || []}
      />
    </div>
  )
}
