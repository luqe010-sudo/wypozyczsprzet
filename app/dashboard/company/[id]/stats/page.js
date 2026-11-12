import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import StatsDashboard from '@/components/dashboard/StatsDashboard'

export default async function CompanyStatsPage({ params: routeParams }) {
  const params = await routeParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .maybeSingle()
  if (!company) redirect('/dashboard')

  const [{ data: listings, error: statsError }, { data: inquiries }] = await Promise.all([
    supabase.from('equipment')
      .select('id, name, status, equipment_stats (views_count, phone_clicks, website_clicks, olx_clicks)')
      .eq('company_id', company.id),
    supabase.from('inquiries').select('equipment_id').eq('company_id', company.id).neq('status', 'spam'),
  ])

  const inquiriesByListing = new Map()
  for (const { equipment_id: id } of inquiries || []) {
    if (id) inquiriesByListing.set(id, (inquiriesByListing.get(id) || 0) + 1)
  }

  const stats = (listings || []).map((item) => {
    const itemStats = (Array.isArray(item.equipment_stats) ? item.equipment_stats[0] : item.equipment_stats) || {}
    return {
      equipment_id: item.id,
      equipment_name: item.name,
      status: item.status,
      inquiries: inquiriesByListing.get(item.id) || 0,
      views_count: itemStats.views_count || 0,
      phone_clicks: itemStats.phone_clicks || 0,
      website_clicks: itemStats.website_clicks || 0,
      olx_clicks: itemStats.olx_clicks || 0,
    }
  })

  return (
    <div className="space-y-4">
      <Link href={`/dashboard/company/${company.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-amber-300">
        <ArrowLeft size={16} aria-hidden="true" /> Wróć do firmy
      </Link>
      <header>
        <h1 className="market-heading">Statystyki: {company.name}</h1>
        <p className="mt-1 text-sm text-muted">Łączne liczby od początku publikacji. Zapytania liczymy bez oznaczonych jako spam.</p>
      </header>
      {statsError
        ? <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać statystyk. Odśwież stronę.</p>
        : <StatsDashboard stats={stats} />}
    </div>
  )
}
