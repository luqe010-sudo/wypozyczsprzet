import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Edit, Plus, MapPin, Globe, Phone, Mail, PackageOpen } from 'lucide-react'

export default async function CompanyDetailsPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single()

  if (companyError || !company) {
    redirect('/dashboard') // Company not found or not owned by user
  }

  // Fetch equipment
  const { data: equipment, error: equipmentError } = await supabase
    .from('equipment')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firm
        </Link>
        <Link
          href={`/dashboard/company/${company.id}/edit`}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edytuj firmę
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {company.name || company.nazwa || 'Nienazwana firma'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {company.address}, {company.zip_code || company.postal_code} {company.city}
            </div>
            {company.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {company.phone}
              </div>
            )}
            {company.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {company.email}
              </div>
            )}
            {company.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <PackageOpen className="w-5 h-5 mr-2 text-gray-400" />
            Sprzęt ({equipment?.length || 0})
          </h3>
          <Link
            href={`/dashboard/company/${company.id}/equipment/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj sprzęt
          </Link>
        </div>

        {equipment && equipment.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {equipment.map((item) => (
                <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.name || item.Sprzęt}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kategoria: {item.category || item.Kategoria}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {item.price_from || item.Cena_od} <span className="text-xs text-gray-500">zł / {item.rental_period || item.Czas}</span>
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          Status: {item.availability || item.Dostępność}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/equipment/${item.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Brak sprzętu</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Twoja firma nie ma jeszcze dodanego żadnego sprzętu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
