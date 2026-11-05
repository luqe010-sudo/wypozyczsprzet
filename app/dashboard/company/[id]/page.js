import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Edit, Plus, MapPin, Globe, Phone, Mail, PackageOpen, BarChart3 } from 'lucide-react'
import EquipmentList from '@/components/dashboard/EquipmentList'

export default async function CompanyDetailsPage({ params: routeParams }) {
  const params = await routeParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch company and branches
  const [
    companyRes,
    branchesRes
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).eq('owner_user_id', user.id).single(),
    supabase.from('company_branches').select('*').eq('company_id', params.id).order('is_main', { ascending: false }).order('created_at')
  ])

  const company = companyRes.data
  const companyError = companyRes.error
  const branches = branchesRes.data

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firm
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/company/${company.id}/stats`}
            className="inline-flex items-center px-3 py-1.5 border border-blue-600 shadow-sm text-sm font-medium rounded text-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statystyki
          </Link>
          <Link
            href="/dashboard/inquiries"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Zapytania
          </Link>
          <Link
            href={`/dashboard/company/${company.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edytuj firmę
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {company.name || company.nazwa || 'Nienazwana firma'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {(() => {
                const mainBranch = branches?.find(b => b.is_main) || branches?.[0];
                if (mainBranch) {
                  return `${mainBranch.address || ''}, ${mainBranch.zip_code || ''} ${mainBranch.city || ''}`;
                }
                return `${company.address || ''}, ${company.zip_code || company.postal_code || ''} ${company.city || ''}`;
              })()}
            </div>
            {(branches?.find(b => b.is_main)?.phone || company.phone) && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {branches?.find(b => b.is_main)?.phone || company.phone}
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

      {/* Branches List */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-blue-500" />
            Oddziały Firmy ({branches?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches && branches.length > 0 ? (
              branches.map(b => (
                <div key={b.id} className={`p-4 rounded-xl border ${b.is_main ? 'border-emerald-200 bg-emerald-50/10 dark:border-emerald-950/30' : 'border-gray-100 dark:border-slate-700'} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-950 dark:text-white text-sm">
                      {b.name || 'Oddział'}
                    </span>
                    {b.is_main && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">Główny</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{b.zip_code} {b.city}, {b.address}</p>
                  {(b.phone || b.email) && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 pt-1 border-t border-gray-100 dark:border-slate-700/50">
                      {b.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {b.phone}</span>}
                      {b.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {b.email}</span>}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Brak zarejestrowanych oddziałów.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="market-heading flex items-center">
            <PackageOpen className="w-5 h-5 mr-2 text-gray-400" />
            Moje ogłoszenia ({equipment?.length || 0})
          </h3>
          <Link
            href={`/dashboard/company/${company.id}/equipment/new`}
            className="market-action"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj ogłoszenie
          </Link>
        </div>

        <EquipmentList equipment={equipment || []} error={equipmentError} />
      </div>
    </div>
  )
}
