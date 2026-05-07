import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Building2, Plus, MapPin, Package } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's companies with equipment count
  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      *,
      equipment(count)
    `)
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching companies:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moje Firmy</h1>
        <Link 
          href="/dashboard/company/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Dodaj Firmę
        </Link>
      </div>

      {companies && companies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {company.name || company.nazwa || 'Nienazwana firma'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <span className="truncate">{company.miasto || company.city || 'Brak miasta'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Package className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span>
                      {company.equipment?.[0]?.count || 0} ofert sprzętu
                    </span>
                  </div>
                  <Link 
                    href={`/dashboard/company/${company.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Zarządzaj &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Brak firm</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Rozpocznij tworząc profil swojej pierwszej firmy.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/company/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nowa Firma
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
