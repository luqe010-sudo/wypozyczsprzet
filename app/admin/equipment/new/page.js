import { createClient } from '@/utils/supabase/server'
import AdminNewEquipmentForm from './AdminNewEquipmentForm'

export default async function AdminNewEquipmentPage() {
  const supabase = createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, city')
    .order('name')

  return (
    <div className="py-6">
      <AdminNewEquipmentForm companies={companies || []} />
    </div>
  )
}
