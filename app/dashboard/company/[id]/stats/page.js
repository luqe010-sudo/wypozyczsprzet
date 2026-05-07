import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import StatsDashboard from '@/components/dashboard/StatsDashboard';

export default async function CompanyStatsPage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, nazwa')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single();

  if (companyError || !company) {
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
        olx_clicks,
        favorites_count
      )
    `)
    .eq('company_id', company.id);

  if (statsError) {
    console.error('Error fetching stats:', statsError);
  }

  // Flatten the stats data
  const flattenedStats = stats?.map(item => ({
    equipment_id: item.id,
    equipment_name: item.name,
    ...(item.equipment_stats || {
      views_count: 0,
      phone_clicks: 0,
      website_clicks: 0,
      olx_clicks: 0,
      favorites_count: 0
    })
  })) || [];

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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Statystyki: {company.name || company.nazwa}</h1>
          <p className="text-gray-500 dark:text-gray-400">Analizuj wydajność swoich ogłoszeń w czasie rzeczywistym.</p>
        </div>
      </div>

      <StatsDashboard stats={flattenedStats} />
    </div>
  );
}
