import { createClient } from '@/utils/supabase/server'
import AdminEditEquipmentForm from './AdminEditEquipmentForm'
import { notFound } from 'next/navigation'

export default async function AdminEditEquipmentPage({ params }) {
  const { id } = params
  const supabase = createClient()

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (!equipment) {
    notFound()
  }

  return (
    <div className="py-6">
      <AdminEditEquipmentForm equipment={equipment} />
    </div>
  )
}
