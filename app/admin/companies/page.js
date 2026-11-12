import { createClient } from '@/utils/supabase/server'
import CompaniesTable from './CompaniesTable'
import { Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/adminUi'
import Link from 'next/link'

export default async function AdminCompaniesPage() {
  const supabase = await createClient()

  // Fetch all companies with equipment count and users
  const [
    { data: companies },
    { data: users }
  ] = await Promise.all([
    supabase.from('companies').select('*, company_branches(*), equipment(count)').order('name'),
    supabase.from('profiles').select('id, role').order('role')
  ])

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Firmy" description="Firmy publikujące ogłoszenia: właściciel konta, weryfikacja i oddziały. Plakietka „Zweryfikowana firma” wynika tylko z weryfikacji ustawionej tutaj.">
        <Link href="/admin/companies/new" className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj firmę</Link>
      </AdminPageHeader>

      <CompaniesTable initialCompanies={companies || []} users={users || []} />
    </div>
  )
}
