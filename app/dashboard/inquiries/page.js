import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InquiryList from '@/components/inquiries/InquiryList'

export const metadata = { title: 'Zapytania od klientów | WypożyczSprzęt' }

const pageSize = 25
const filters = [
  ['', 'Wszystkie'],
  ['new', 'Nowe'],
  ['contacted', 'Po kontakcie'],
  ['closed', 'Zakończone'],
  ['spam', 'Spam'],
]

function inboxHref(status, page = 1) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (page > 1) params.set('page', page)
  return params.size ? `/dashboard/inquiries?${params}` : '/dashboard/inquiries'
}

export default async function OwnerInquiriesPage({ searchParams }) {
  const params = await searchParams
  const status = filters.find(([value]) => value === params.status)?.[0] || ''
  const page = typeof params.page === 'string' && /^[1-9]\d{0,5}$/.test(params.page) ? Number(params.page) : 1
  const start = (page - 1) * pageSize

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Administrators can see all inquiries through RLS. This view is restricted to their own companies too.
  const { data: companies, error: companyError } = await supabase.from('companies')
    .select('id, name').eq('owner_user_id', user.id)
  const companiesById = new Map((companies || []).map((company) => [company.id, company]))
  let inquiries = []
  let error = companyError
  if (companiesById.size) {
    const query = supabase.from('inquiries')
      .select('id, company_id, equipment_name, customer_name, customer_phone, customer_email, message, date_from, date_to, job_location, status, created_at')
      .in('company_id', [...companiesById.keys()])
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(start, start + pageSize)
    if (status) query.eq('status', status)
    const result = await query
    error = result.error
    inquiries = (result.data || []).map((item) => ({ ...item, companies: companiesById.get(item.company_id) }))
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="market-heading">Zapytania od klientów</h1>
        <p className="mt-1 text-sm text-muted">Odezwij się do klienta bezpośrednio, a potem zmień status zapytania.</p>
      </header>

      <nav aria-label="Filtruj zapytania według statusu" className="flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <Link key={value} href={inboxHref(value)} aria-current={value === status ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-semibold ${value === status ? 'border-market-navy bg-market-navy text-white dark:border-market-yellow dark:bg-market-yellow dark:text-market-navy' : 'border-border bg-card hover:border-amber-400'}`}>
            {label}
          </Link>
        ))}
      </nav>

      {error
        ? <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać zapytań. Odśwież stronę.</p>
        : <InquiryList inquiries={inquiries.slice(0, pageSize)} filtered={Boolean(status)} />}

      {(page > 1 || inquiries.length > pageSize) && (
        <nav aria-label="Strony zapytań" className="flex flex-wrap justify-between gap-2 text-sm font-semibold">
          {page > 1 && <Link href={inboxHref(status, page - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 hover:border-amber-400">Poprzednia strona</Link>}
          {inquiries.length > pageSize && <Link href={inboxHref(status, page + 1)} className="ml-auto inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 hover:border-amber-400">Następna strona</Link>}
        </nav>
      )}
    </div>
  )
}
