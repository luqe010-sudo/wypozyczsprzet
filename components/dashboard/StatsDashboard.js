import { 
  Eye, 
  PhoneCall, 
  Globe, 
  ExternalLink, 
  Star, 
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function StatsDashboard({ stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Brak danych do wyświetlenia</h3>
        <p className="text-gray-500 dark:text-gray-400">Twoje ogłoszenia nie zebrały jeszcze żadnych statystyk.</p>
      </div>
    );
  }

  // Sort by popularity (views) by default
  const sortedStats = [...stats].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  const topListing = sortedStats[0];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Suma wyświetleń" 
          value={stats.reduce((acc, curr) => acc + (curr.views_count || 0), 0)} 
          icon={Eye} 
          color="blue"
        />
        <StatCard 
          title="Kliknięcia telefonu" 
          value={stats.reduce((acc, curr) => acc + (curr.phone_clicks || 0), 0)} 
          icon={PhoneCall} 
          color="green"
        />
        <StatCard 
          title="Kliknięcia WWW" 
          value={stats.reduce((acc, curr) => acc + (curr.website_clicks || 0), 0)} 
          icon={Globe} 
          color="purple"
        />
        <StatCard 
          title="Kliknięcia OLX" 
          value={stats.reduce((acc, curr) => acc + (curr.olx_clicks || 0), 0)} 
          icon={ExternalLink} 
          color="orange"
        />
      </div>

      {/* Top Performing Listing */}
      {topListing && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Najpopularniejsze ogłoszenie
              </span>
              <h3 className="text-3xl font-black mb-2">{topListing.equipment_name}</h3>
              <p className="text-blue-100 text-lg">Zebrało {topListing.views_count} wyświetleń i {topListing.phone_clicks} kliknięć w telefon.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 border border-white/20">
              <TrendingUp className="w-12 h-12 text-blue-200" />
              <div>
                <p className="text-sm font-medium text-blue-100">Trend</p>
                <p className="text-2xl font-bold">Wzrostowy</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Stats Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white">Szczegółowe statystyki</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                <th className="px-6 py-4">Sprzęt</th>
                <th className="px-6 py-4">Wyświetlenia</th>
                <th className="px-6 py-4">Telefon</th>
                <th className="px-6 py-4">WWW</th>
                <th className="px-6 py-4">OLX</th>
                <th className="px-6 py-4 text-right">Trend Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {sortedStats.map((item) => (
                <tr key={item.equipment_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {item.equipment_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-500" />
                      {item.views_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-green-500" />
                      {item.phone_clicks || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-500" />
                      {item.website_clicks || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-orange-500" />
                      {item.olx_clicks || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {calculateScore(item)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function calculateScore(stats) {
  const weights = { views: 1, phone: 10, website: 5, olx: 5, favorites: 15 };
  return (
    (stats.views_count || 0) * weights.views +
    (stats.phone_clicks || 0) * weights.phone +
    (stats.website_clicks || 0) * weights.website +
    (stats.olx_clicks || 0) * weights.olx +
    (stats.favorites_count || 0) * weights.favorites
  );
}
