import Link from 'next/link'
import { Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminPageHeader, dateOnly, dateTime } from '@/components/admin/adminUi'
import { FEATURED_DAYS, FEATURED_PRICE_PLN, featuredSalesOpen } from '@/lib/site'
import FeaturedRequestActions from './FeaturedRequestActions'

export const metadata = { title: 'Wyróżnienia | Panel administratora' }

export default async function AdminFeaturedPage() {
  const supabase = await createClient()
  const [requestsResult, featuredResult] = await Promise.all([
    supabase
      .from('featured_requests')
      .select('id, status, created_at, handled_at, featured_until, equipment (id, name, slug), companies (id, name, email, phone)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('equipment')
      .select('id, name, slug, featured_until, companies (name)')
      .gt('priority', 1)
      .order('featured_until', { ascending: true, nullsFirst: false }),
  ])
  const requests = requestsResult.data || []
  const open = requests.filter((request) => request.status === 'new')
  const handled = requests.filter((request) => request.status !== 'new')
  const featured = featuredResult.data || []
  const error = requestsResult.error || featuredResult.error

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Wyróżnienia"
        description={`Zamówienia wyróżnień (${FEATURED_PRICE_PLN} zł / ${FEATURED_DAYS} dni). Wyślij fakturę, a po zaksięgowaniu wpłaty kliknij „Opłacone”. Wyróżnienie wygasa samo, a firma dostaje przypomnienie kilka dni wcześniej.`}
      />

      {!featuredSalesOpen() && (
        <p role="status" className="listing-panel text-sm text-amber-900 dark:text-amber-200">
          Sprzedaż jest wyłączona: uzupełnij dane sprzedawcy (<code>SELLER</code> w <code>lib/site.js</code>). Do tego czasu firmy nie widzą przycisku „Wyróżnij”.
        </p>
      )}
      {error && <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać danych: {error.message}</p>}

      <section className="space-y-3">
        <h2 className="market-heading">Do obsłużenia ({open.length})</h2>
        {open.length === 0 ? (
          <p className="listing-panel text-sm text-muted">Brak nowych zamówień.</p>
        ) : (
          <ul className="space-y-3">
            {open.map((request) => (
              <li key={request.id} className="listing-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="break-words font-bold text-foreground">
                    {request.equipment?.slug
                      ? <a href={`/oferta/${request.equipment.slug}`} target="_blank" rel="noopener" className="hover:underline">{request.equipment.name}</a>
                      : request.equipment?.name || 'Ogłoszenie usunięte'}
                  </p>
                  <p className="text-muted">
                    {request.companies ? <Link href={`/admin/companies/${request.companies.id}/edit`} className="hover:underline">{request.companies.name}</Link> : 'Firma usunięta'}
                    {request.companies?.email && <> · <a href={`mailto:${request.companies.email}`} className="hover:underline">{request.companies.email}</a></>}
                    {request.companies?.phone && <> · {request.companies.phone}</>}
                  </p>
                  <p className="text-xs text-muted">Zamówiono <time dateTime={request.created_at}>{dateTime.format(new Date(request.created_at))}</time></p>
                </div>
                <FeaturedRequestActions id={request.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="market-heading">Wyróżnione teraz ({featured.length})</h2>
        {featured.length === 0 ? (
          <p className="listing-panel text-sm text-muted">Żadne ogłoszenie nie jest wyróżnione.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card text-sm shadow-sm">
            {featured.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span className="min-w-0">
                  <Star size={14} className="mr-1.5 inline fill-current text-amber-500" aria-hidden="true" />
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted"> · {item.companies?.name}</span>
                </span>
                <span className="text-muted">{item.featured_until ? `do ${dateOnly.format(new Date(item.featured_until))}` : 'bezterminowo'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {handled.length > 0 && (
        <section className="space-y-3">
          <h2 className="market-heading">Historia</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card text-sm shadow-sm">
            {handled.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span className="min-w-0"><span className="font-semibold">{request.equipment?.name || 'Ogłoszenie usunięte'}</span><span className="text-muted"> · {request.companies?.name}</span></span>
                <span className="text-muted">
                  {request.status === 'paid'
                    ? `opłacone ${dateOnly.format(new Date(request.handled_at))}, do ${dateOnly.format(new Date(request.featured_until))}`
                    : `anulowane ${dateOnly.format(new Date(request.handled_at))}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
