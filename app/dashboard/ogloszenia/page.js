import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EquipmentList from '@/components/dashboard/EquipmentList'

const filters = [
  { key: '', label: 'Wszystkie', statuses: [] },
  { key: 'active', label: 'Opublikowane', statuses: ['active', 'incomplete'] },
  { key: 'inactive', label: 'Wstrzymane', statuses: ['inactive'] },
  { key: 'pending', label: 'W moderacji', statuses: ['pending'] },
  { key: 'stale', label: 'Do potwierdzenia', statuses: ['stale'] },
  { key: 'blocked', label: 'Ukryte lub odrzucone', statuses: ['hidden', 'rejected'] },
]

export default async function MyListingsPage({ searchParams }) {
  const { status } = await searchParams
  const filter = filters.find(({ key }) => key === status) || filters[0]
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnTo=/dashboard/ogloszenia')

  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('owner_user_id', user.id)
    .order('name')

  const companiesById = new Map((companies || []).map((company) => [company.id, company.name]))
  let equipment = []
  let error = companyError
  if (companiesById.size) {
    const query = supabase.from('equipment')
      .select('id, company_id, name, slug, image_url, category, price_type, price_amount, rental_period, last_confirmed_at, status')
      .in('company_id', [...companiesById.keys()])
      .order('created_at', { ascending: false })
    if (filter.statuses.length) query.in('status', filter.statuses)
    const result = await query
    error = result.error
    equipment = (result.data || []).map((item) => ({ ...item, companyName: companiesById.get(item.company_id) }))
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="market-heading">Moje ogłoszenia</h1>
        <p className="mt-1 text-sm text-muted">Edytuj sprzęt, wstrzymuj publikację i potwierdzaj aktualność ofert.</p>
      </header>
      {!error && (
        <section id="dodaj" className="listing-panel scroll-mt-24">
          <h2 className="font-bold">Dodaj ogłoszenie</h2>
          <p className="mb-3 mt-1 text-sm text-muted">{companies?.length ? 'Wybierz firmę, do której chcesz dodać sprzęt.' : 'Najpierw utwórz profil firmy lub przejmij istniejący profil w katalogu.'}</p>
          <div className="flex flex-wrap gap-2">
            {companies?.length ? companies.map((company) => (
              <Link key={company.id} href={`/dashboard/company/${company.id}/equipment/new`} className="market-action"><Plus size={16} aria-hidden="true" /> {company.name}</Link>
            )) : (
              <>
                <Link href="/dashboard/company/new" className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj firmę</Link>
                <Link href="/katalog" className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-background">Katalog firm</Link>
              </>
            )}
          </div>
        </section>
      )}
      {!error && (
        <nav aria-label="Filtruj ogłoszenia według statusu" className="flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <Link key={key} href={key ? `/dashboard/ogloszenia?status=${key}` : '/dashboard/ogloszenia'} aria-current={key === filter.key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-semibold ${key === filter.key ? 'border-market-navy bg-market-navy text-white dark:border-market-yellow dark:bg-market-yellow dark:text-market-navy' : 'border-border bg-card hover:border-amber-400'}`}>
              {label}
            </Link>
          ))}
        </nav>
      )}
      <EquipmentList equipment={equipment} error={error} filtered={Boolean(filter.key)} />
    </div>
  )
}
