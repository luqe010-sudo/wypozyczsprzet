import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import StatsDashboard from '@/components/dashboard/StatsDashboard';

export default async function CompanyStatsPage({ params: routeParams }) {
  const params = await routeParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single();

  if (companyError || !company) {
    console.error('Company fetch error:', companyError);
    redirect('/dashboard');
  }

  // Fetch stats for all equipment in this company
  const { data: stats, error: statsError } = await supabase
    .from('equipment')
    .select(`
      id,
      name,
      equipment_stats (
        views_count,
        phone_clicks,
        website_clicks,
        olx_clicks
      )
    `)
    .eq('company_id', company.id);

  if (statsError) {
    console.error('Error fetching stats:', statsError);
  }

  // Flatten the stats data
  const flattenedStats = (stats || []).flatMap((item) => {
    const itemStats = Array.isArray(item.equipment_stats) 
      ? item.equipment_stats[0] 
      : item.equipment_stats;

    return itemStats ? [{
      equipment_id: item.id,
      equipment_name: item.name,
      ...itemStats,
    }] : [];
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/company/${company.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firmy
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="market-heading">Statystyki firmy {company.name || company.nazwa}</h1>
          <p className="text-sm text-muted">Łączne zarejestrowane zdarzenia dla ogłoszeń firmy.</p>
        </div>
      </div>

      {statsError
        ? <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać statystyk. Odśwież stronę.</p>
        : <StatsDashboard stats={flattenedStats} />}
    </div>
  );
}
