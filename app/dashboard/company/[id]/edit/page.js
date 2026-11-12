import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EditCompanyForm from './EditCompanyForm'

export default async function EditCompanyPage({ params: routeParams }) {
  const params = await routeParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: company, error }, { data: branches }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).eq('owner_user_id', user.id).single(),
    supabase.from('company_branches').select('*').eq('company_id', params.id).order('is_main', { ascending: false }).order('created_at'),
  ])
  if (error || !company) redirect('/dashboard')

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/company/${company.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-amber-300">
        <ArrowLeft size={16} aria-hidden="true" /> Wróć do firmy
      </Link>
      <header>
        <h1 className="market-heading">Edytuj firmę</h1>
        <p className="mt-1 text-sm text-muted">{company.name}</p>
      </header>
      <EditCompanyForm company={company} branches={branches || []} />
    </div>
  )
}
