import { createClient } from '@/utils/supabase/server'
import CompaniesTable from './CompaniesTable'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCompaniesPage() {
  const supabase = createClient()

  // Fetch all companies with equipment count and users
  const [
    { data: companies },
    { data: users }
  ] = await Promise.all([
    supabase.from('companies').select('*, equipment(count)').order('name'),
    supabase.from('profiles').select('id, role').order('role')
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Zarządzanie Firmami
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Przeglądaj, edytuj i usuwaj wszystkie zarejestrowane firmy.</p>
        </div>
        <Link 
          href="/admin/companies/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Dodaj firmę</span>
        </Link>
      </div>

      <CompaniesTable initialCompanies={companies || []} users={users || []} />
    </div>
  )
}
