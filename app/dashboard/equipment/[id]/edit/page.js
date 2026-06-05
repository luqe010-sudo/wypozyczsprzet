import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditEquipmentForm from './EditEquipmentForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditEquipmentPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch equipment and verify company ownership
  const [
    equipmentRes,
    categoriesRes,
    subcategoriesRes
  ] = await Promise.all([
    supabase.from('equipment').select('*, companies!inner(owner_user_id)').eq('id', params.id).eq('companies.owner_user_id', user.id).single(),
    supabase.from('equipment_categories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('equipment_subcategories').select('*').eq('status', 'active').order('sort_order')
  ])

  const equipment = equipmentRes.data
  const error = equipmentRes.error
  const categories = categoriesRes.data
  const subcategories = subcategoriesRes.data

  if (error || !equipment) {
    redirect('/dashboard')
  }

  // Fetch branches for this company
  const { data: branches } = await supabase
    .from('company_branches')
    .select('*')
    .eq('company_id', equipment.company_id)
    .order('is_main', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href={`/dashboard/company/${equipment.company_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firmy
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-5">
            Edytuj dane sprzętu
          </h3>
          <EditEquipmentForm 
            equipment={equipment} 
            categories={categories || []}
            subcategories={subcategories || []}
            branches={branches || []}
          />
        </div>
      </div>
    </div>
  )
}
