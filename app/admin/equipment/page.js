import { createClient } from '@/utils/supabase/server'
import EquipmentTable from './EquipmentTable'
import { Package } from 'lucide-react'
import { Suspense } from 'react'

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
      </div>

      <Suspense fallback={<div className="p-8 text-center text-gray-500">Ładowanie tabeli...</div>}>
        <EquipmentTable initialEquipment={equipment || []} />
      </Suspense>
    </div>
  )
}
