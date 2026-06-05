import { createClient } from '@/utils/supabase/server'
import AdminEditCompanyForm from './AdminEditCompanyForm'
import { notFound } from 'next/navigation'

export default async function AdminEditCompanyPage({ params }) {
  const { id } = params
  const supabase = createClient()

  const [
    { data: company },
    { data: branches }
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase.from('company_branches').select('*').eq('company_id', id).order('is_main', { ascending: false }).order('created_at')
  ])

  if (!company) {
    notFound()
  }

  return (
    <div className="py-6">
      <AdminEditCompanyForm company={company} branches={branches || []} />
    </div>
  )
}
