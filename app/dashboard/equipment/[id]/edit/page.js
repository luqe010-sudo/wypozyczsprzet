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
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*, companies!inner(owner_user_id)')
    .eq('id', params.id)
    .eq('companies.owner_user_id', user.id)
    .single()

  if (error || !equipment) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href={`/dashboard/company/${equipment.company_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firmy
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-5">
            Edytuj dane sprzętu
          </h3>
          <EditEquipmentForm equipment={equipment} />
        </div>
      </div>
    </div>
  )
}
