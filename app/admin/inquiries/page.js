import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import InquiryList from '@/components/inquiries/InquiryList'
import { emailConfigured } from '@/lib/email'
import { AdminPageHeader, countBadgeClass, filterTabClass } from '@/components/admin/adminUi'

const PAGE_SIZE = 50

const FILTERS = [
  { key: '', label: 'Wszystkie', apply: (query) => query },
  { key: 'new', label: 'Nowe', apply: (query) => query.eq('status', 'new') },
  { key: 'unnotified', label: 'Bez maila do firmy', apply: (query) => query.eq('status', 'new').is('firm_notified_at', null) },
  { key: 'contacted', label: 'Po kontakcie', apply: (query) => query.eq('status', 'contacted') },
  { key: 'closed', label: 'Zakończone', apply: (query) => query.eq('status', 'closed') },
  { key: 'spam', label: 'Spam', apply: (query) => query.eq('status', 'spam') },
]

function inboxHref(status, page = 1) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (page > 1) params.set('page', String(page))
  return params.size ? `/admin/inquiries?${params}` : '/admin/inquiries'
}

export default async function AdminInquiriesPage({ searchParams }) {
  const params = await searchParams
  const filter = FILTERS.find(({ key }) => key === params.status) || FILTERS[0]
  const page = typeof params.page === 'string' && /^[1-9]\d{0,5}$/.test(params.page) ? Number(params.page) : 1
  const start = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const listQuery = filter.apply(
    supabase
      .from('inquiries')
      .select('id, equipment_name, customer_name, customer_phone, customer_email, message, date_from, date_to, job_location, status, created_at, firm_notified_at, companies (id, name, company_branches (phone, email, is_main))')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(start, start + PAGE_SIZE),
  )

  const [{ data, error }, ...countResults] = await Promise.all([
    listQuery,
    ...FILTERS.map(({ apply }) => apply(supabase.from('inquiries').select('id', { count: 'exact', head: true }))),
  ])
  const counts = Object.fromEntries(FILTERS.map(({ key }, index) => [key, countResults[index].count || 0]))
  const inquiries = (data || []).slice(0, PAGE_SIZE)
  const hasNext = (data || []).length > PAGE_SIZE

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Zapytania" description="Zapytania klientów z formularzy na stronach ogłoszeń. Firma odpowiada klientowi bezpośrednio." />

      {!emailConfigured() && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Wysyłka e-maili nie jest skonfigurowana (brak RESEND_API_KEY). Zapytania zapisują się tutaj, ale firmy nie dostają powiadomień. Przekazuj je ręcznie.
        </p>
      )}

      <nav aria-label="Filtruj zapytania" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map(({ key, label }) => {
          const active = key === filter.key
          return (
            <Link key={key || 'all'} href={inboxHref(key)} aria-current={active ? 'page' : undefined} className={filterTabClass(active)}>
              {label} <span className={countBadgeClass(active)}>{counts[key]}</span>
            </Link>
          )
        })}
      </nav>

      {filter.key === 'unnotified' && counts.unnotified > 0 && (
        <p className="text-sm text-muted">Te firmy nie dostały maila o zapytaniu. Zadzwoń do firmy albo przekaż jej dane klienta, a potem zmień status na „Po kontakcie”.</p>
      )}

      {error
        ? <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać zapytań: {error.message}</p>
        : <InquiryList inquiries={inquiries} showCompany filtered={Boolean(filter.key)} />}

      {(page > 1 || hasNext) && (
        <nav aria-label="Strony zapytań" className="flex items-center justify-between gap-3">
          {page > 1 ? <Link href={inboxHref(filter.key, page - 1)} className={filterTabClass(false)}>← Nowsze</Link> : <span />}
          <span className="text-sm text-muted">Strona {page}</span>
          {hasNext ? <Link href={inboxHref(filter.key, page + 1)} className={filterTabClass(false)}>Starsze →</Link> : <span />}
        </nav>
      )}
    </div>
  )
}
