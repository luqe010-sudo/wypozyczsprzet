import { createClient } from '@/utils/supabase/server'
import AdminEditCompanyForm from './AdminEditCompanyForm'
import { notFound } from 'next/navigation'

export default async function AdminEditCompanyPage({ params }) {
  const { id } = params
  const supabase = createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (!company) {
    notFound()
  }

  return (
    <div className="py-6">
      <AdminEditCompanyForm company={company} />
    </div>
  )
}
