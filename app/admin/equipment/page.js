import { createClient } from '@/utils/supabase/server'
import EquipmentTable from './EquipmentTable'
import { Package, Plus } from 'lucide-react'
import { Suspense } from 'react'
import Link from 'next/link'

export default async function AdminEquipmentPage() {
  const supabase = createClient()

  // Fetch all equipment with company details
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Zarządzanie Ogłoszeniami
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Moderuj wszystkie ogłoszenia sprzętu na platformie.</p>
        </div>
        <Link 
          href="/admin/equipment/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Dodaj ogłoszenie</span>
        </Link>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-gray-500">Ładowanie tabeli...</div>}>
        <EquipmentTable initialEquipment={equipment || []} />
      </Suspense>
    </div>
  )
}
