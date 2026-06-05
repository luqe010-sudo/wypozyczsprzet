import { createClient } from '@/utils/supabase/server'
import { 
  Users, 
  Building2, 
  Package, 
  TrendingUp,
  Activity,
  ShieldAlert,
  Eye,
  MousePointer2,
  BarChart
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Fetch stats in parallel
  const [
    { count: userCount },
    { count: companyCount },
    { count: equipmentCount },
    { data: recentCompanies },
    { data: topEquipment },
    { data: globalStats }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*, company_branches(*)').order('created_at', { ascending: false }).limit(5),
    supabase.from('equipment_stats').select('*, equipment(name, category)').order('views_count', { ascending: false }).limit(5),
    supabase.from('equipment_stats').select('views_count, phone_clicks, website_clicks, olx_clicks')
  ])

  const totalViews = globalStats?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0;
  const totalClicks = globalStats?.reduce((acc, curr) => acc + (curr.phone_clicks || 0) + (curr.website_clicks || 0) + (curr.olx_clicks || 0), 0) || 0;

  const stats = [
    { name: 'Użytkownicy', value: userCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Firmy', value: companyCount || 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Sprzęt', value: equipmentCount || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Wyświetlenia', value: totalViews, icon: Eye, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Kliknięcia', value: totalClicks, icon: MousePointer2, color: 'text-pink-600', bg: 'bg-pink-100' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Witaj w Centrum Dowodzenia</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Masz pełną kontrolę nad platformą wypozycz.online.</p>
        </div>
        <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-gray-50 dark:text-slate-700/50" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {stats.map((item) => (
          <div key={item.name} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center md:items-start lg:items-center gap-2 md:gap-4 transition-transform hover:scale-[1.02]">
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
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const mainBranch = company.company_branches?.find(b => b.is_main) || company.company_branches?.[0];
                      return mainBranch?.city || company.city || 'Brak lokalizacji';
                    })()} • {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {company.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Equipment Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart className="w-5 h-5 text-green-600" />
              Najpopularniejszy sprzęt
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {topEquipment?.map((stat) => (
              <div key={stat.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{stat.equipment?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{stat.equipment?.category}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.views_count}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Widoki</p>
                  </div>
                  <div className="w-px h-8 bg-gray-100 dark:bg-slate-700"></div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">{stat.phone_clicks}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Tel</p>
                  </div>
                </div>
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
