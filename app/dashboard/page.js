import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Building2, Inbox, MapPin, Package, Pause, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { offersLabel } from '@/lib/format'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: companies, error } = await supabase.from('companies')
    .select('id, name, city, company_branches(city, is_main), equipment(count)')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })

  const companyIds = (companies || []).map((company) => company.id)
  const addHref = companyIds.length === 1
    ? `/dashboard/company/${companyIds[0]}/equipment/new`
    : '/dashboard/ogloszenia#dodaj'
  const metrics = []

  if (companyIds.length) {
    const [published, paused, inquiries] = await Promise.all([
      supabase.from('equipment').select('id', { count: 'exact', head: true })
        .in('company_id', companyIds).in('status', ['active', 'incomplete']),
      supabase.from('equipment').select('id', { count: 'exact', head: true })
        .in('company_id', companyIds).eq('status', 'inactive'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true })
        .in('company_id', companyIds).eq('status', 'new'),
    ])
    metrics.push(
      { label: 'Opublikowane oferty', result: published, href: '/dashboard/ogloszenia?status=active', icon: Package },
      { label: 'Wstrzymane oferty', result: paused, href: '/dashboard/ogloszenia?status=inactive', icon: Pause },
      { label: 'Nowe zapytania', result: inquiries, href: '/dashboard/inquiries?status=new', icon: Inbox },
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="market-heading">Pulpit wynajmującego</h1>
          <p className="mt-1 text-sm text-muted">Zarządzaj sprzętem i odpowiadaj na zapytania klientów.</p>
        </div>
        {companyIds.length > 0 && (
          <Link href={addHref} className="market-action"><Plus size={18} aria-hidden="true" /> Dodaj ogłoszenie</Link>
        )}
      </header>

      {metrics.length > 0 && (
        <section aria-label="Podsumowanie" className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          {metrics.map(({ label, result, href, icon: Icon }) => (
            <Link key={href} href={href} className="listing-panel flex items-center gap-3 hover:border-amber-400">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-market-navy dark:bg-amber-400/15 dark:text-market-yellow">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold text-muted">{label}</span>
                {result.error || result.count === null
                  ? <span className="block text-sm font-medium">Brak danych</span>
                  : <span className="block text-2xl font-extrabold">{result.count}</span>}
              </span>
              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-muted" />
            </Link>
          ))}
        </section>
      )}

      <section aria-labelledby="dashboard-companies" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="dashboard-companies" className="text-lg font-bold">Moje firmy</h2>
          {companyIds.length > 0 && (
            <Link href="/dashboard/company/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:border-amber-400">
              <Plus size={17} aria-hidden="true" /> Dodaj firmę
            </Link>
          )}
        </div>

        {error ? (
          <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać firm. Odśwież stronę.</p>
        ) : companyIds.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {companies.map((company) => {
              const mainBranch = company.company_branches?.find((branch) => branch.is_main) || company.company_branches?.[0]
              return (
                <li key={company.id} className="listing-panel flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="break-words text-lg font-bold">{company.name || 'Nienazwana firma'}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <MapPin size={16} aria-hidden="true" />
                      {mainBranch?.city || company.city || 'Brak lokalizacji'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 border-t border-border pt-1">
                    <p className="text-sm text-muted">{offersLabel(company.equipment?.[0]?.count || 0)}</p>
                    <Link href={`/dashboard/company/${company.id}`} aria-label={`Zarządzaj firmą ${company.name || ''}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                      Zarządzaj <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="listing-panel text-center">
            <Building2 size={30} className="mx-auto text-muted" aria-hidden="true" />
            <h3 className="mt-2 font-bold">Dodaj swoją pierwszą firmę</h3>
            <p className="mt-1 text-sm text-muted">Utwórz profil, aby publikować sprzęt i odbierać zapytania.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/dashboard/company/new" className="market-action"><Plus size={17} aria-hidden="true" /> Dodaj firmę</Link>
              <Link href="/katalog" className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-background">Znajdź firmę w katalogu</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
