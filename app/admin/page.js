import { createClient } from '@/utils/supabase/server'
import { 
  Users, 
  Building2, 
  Package, 
  TrendingUp,
  Activity,
  ShieldAlert
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  const debugError = profileError ? `${profileError.code}: ${profileError.message}` : null

  // Fetch stats in parallel
  const [
    { count: userCount },
    { count: companyCount },
    { count: equipmentCount },
    { data: recentCompanies }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*, profiles(role)').order('created_at', { ascending: false }).limit(5)
  ])

  const stats = [
    { name: 'Użytkownicy', value: userCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Firmy', value: companyCount || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Sprzęt', value: equipmentCount || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Witaj w Centrum Dowodzenia</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Masz pełną kontrolę nad platformą wypozycz.online.</p>
          
          {/* Debug Box */}
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-xs font-mono text-red-800 dark:text-red-300">
            DEBUG: UserID: {user?.id} | Role: {currentProfile?.role || 'null'} | Status: {currentProfile ? 'Profile Found' : 'Profile NOT Found'} | Error: {debugError || 'none'}
          </div>
        </div>
        <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-gray-50 dark:text-slate-700/50" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div key={item.name} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Companies */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Ostatnio dodane firmy
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {recentCompanies?.map((company) => (
              <div key={company.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.city} • {new Date(company.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {company.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security / System Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-200">Tryb Administratora Aktywny</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Wszystkie Twoje działania są rejestrowane i mają natychmiastowy wpływ na bazę produkcyjną.</p>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition-colors">
            Pobierz raport systemowy (WKRÓTCE)
          </button>
        </div>
      </div>
    </div>
  )
}
