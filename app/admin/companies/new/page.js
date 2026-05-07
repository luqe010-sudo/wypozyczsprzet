import { createClient } from '@/utils/supabase/server'
import AdminNewCompanyForm from './AdminNewCompanyForm'

export default async function AdminNewCompanyPage() {
  const supabase = createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, role')
    .order('role')

  return (
    <div className="py-6">
      <AdminNewCompanyForm users={users || []} />
    </div>
  )
}
