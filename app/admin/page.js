import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Handshake,
  Inbox,
  MailWarning,
  Plus,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { AdminPageHeader, EQUIPMENT_STATUS, INQUIRY_STATUS, dateTime, secondaryButtonClass } from '@/components/admin/adminUi'
import { plural } from '@/lib/format'

export const dynamic = 'force-dynamic'

const DAY = 24 * 60 * 60 * 1000
const currentTime = () => Date.now()

/** Which integrations are configured. Only presence is checked; values never leave the server. */
function configurationChecks() {
  const has = (...names) => names.every((name) => Boolean(process.env[name]))
  return [
    { label: 'Powiadomienia e-mail (Resend)', ok: has('RESEND_API_KEY'), hint: 'Bez RESEND_API_KEY firmy nie dostają maili o zapytaniach. Przekazuj je ręcznie.' },
    { label: 'Przypomnienia o aktualności (cron)', ok: has('CRON_SECRET'), hint: 'Bez CRON_SECRET zadanie /api/cron/freshness odrzuca wywołania.' },
    { label: 'Klucz serwisowy Supabase', ok: has('SUPABASE_SERVICE_ROLE_KEY'), hint: 'Potrzebny do zapisu zapytań i edycji katalogu firm.' },
    { label: 'Wysyłka zdjęć (Cloudinary)', ok: has('CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET') && (has('CLOUDINARY_CLOUD_NAME') || has('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')), hint: 'Bez kluczy Cloudinary nie da się dodać zdjęć do ogłoszeń.' },
    { label: 'Mapy i geokodowanie (MapTiler)', ok: has('NEXT_PUBLIC_MAPTILER_KEY'), hint: 'Bez klucza mapy używają zapasowych kafelków, a nowe adresy nie dostają współrzędnych.' },
  ]
}

function TaskCard({ href, icon: Icon, count, title, description, tone = 'amber' }) {
  const urgent = count > 0
  const tones = {
    amber: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  }
  return (
    <Link href={href} className={`listing-panel group flex items-start gap-3 transition-colors hover:border-amber-400 ${urgent ? '' : 'opacity-80'}`}>
      <span className={`rounded-lg p-2 ${urgent ? tones[tone] : 'bg-background text-muted'}`}>
        {urgent ? <Icon size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-bold text-foreground">{title}</span>
          <span className={`text-2xl font-extrabold tabular-nums ${urgent ? 'text-foreground' : 'text-muted'}`}>{count}</span>
        </span>
        <span className="mt-0.5 block text-sm text-muted">{urgent ? description : 'Nic nie czeka.'}</span>
      </span>
    </Link>
  )
}

function Metric({ label, value, detail }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{value}</dd>
      {detail && <dd className="mt-0.5 text-xs text-muted">{detail}</dd>}
    </div>
  )
}

function SectionHeader({ title, href, linkLabel }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-bold text-foreground">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-amber-300">
          {linkLabel} <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const now = currentTime()
  const since60 = new Date(now - 60 * DAY).toISOString()

  const [
    listingsResult,
    inquiriesResult,
    { count: unnotifiedCount },
    { count: claimCount },
    companiesResult,
    { count: userCount },
    { count: directoryCount },
    { data: recentInquiries },
    { data: recentListings },
    { data: topListings },
  ] = await Promise.all([
    supabase.from('equipment').select('status, priority'),
    supabase.from('inquiries').select('created_at, status').gte('created_at', since60),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new').is('firm_notified_at', null),
    supabase.from('company_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('companies').select('verified_at, owner_user_id'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('company_directory').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id, equipment_name, customer_name, status, created_at, firm_notified_at, companies (name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('equipment').select('id, name, status, created_at, companies (name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('equipment_stats').select('views_count, phone_clicks, website_clicks, equipment (id, name, status)').order('views_count', { ascending: false }).limit(5),
  ])

  const listings = listingsResult.data || []
  const statusCount = (status) => listings.filter((item) => item.status === status).length
  const published = listings.filter((item) => item.status === 'active' || item.status === 'incomplete').length
  const featured = listings.filter((item) => item.priority > 1 && (item.status === 'active' || item.status === 'incomplete')).length

  const inquiries = (inquiriesResult.data || []).filter((item) => item.status !== 'spam')
  const inLast = (days, offset = 0) => inquiries.filter((item) => {
    const age = now - new Date(item.created_at).getTime()
    return age >= offset * DAY && age < (offset + days) * DAY
  }).length
  const week = inLast(7)
  const previousWeek = inLast(7, 7)
  const month = inLast(30)
  const newInquiries = inquiries.filter((item) => item.status === 'new').length

  const companies = companiesResult.data || []
  const verifiedCompanies = companies.filter((item) => item.verified_at).length
  const ownedCompanies = companies.filter((item) => item.owner_user_id).length

  const checks = configurationChecks()
  const missing = checks.filter((item) => !item.ok)
  const loadError = listingsResult.error || inquiriesResult.error || companiesResult.error

  const weekTrend = week === previousWeek ? 'tyle samo co tydzień wcześniej'
    : week > previousWeek ? `o ${week - previousWeek} więcej niż tydzień wcześniej`
      : `o ${previousWeek - week} mniej niż tydzień wcześniej`

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Pulpit" description="Co czeka na decyzję i jak działa serwis w ostatnich tygodniach.">
        <Link href="/admin/equipment/new" className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj ogłoszenie</Link>
        <Link href="/admin/companies/new" className={secondaryButtonClass}><Plus size={16} aria-hidden="true" /> Dodaj firmę</Link>
      </AdminPageHeader>

      {loadError && (
        <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Część danych nie wczytała się: {loadError.message}</p>
      )}

      <section aria-labelledby="todo-heading">
        <h2 id="todo-heading" className="sr-only">Do zrobienia</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <TaskCard href="/admin/equipment?status=pending" icon={ShieldAlert} count={statusCount('pending')} title="Ogłoszenia do moderacji" description="Pierwsze ogłoszenia niezweryfikowanych firm czekają na zatwierdzenie." />
          <TaskCard href="/admin/inquiries?status=new" icon={Inbox} count={newInquiries} title="Nowe zapytania" description="Zapytania klientów, których status nie został jeszcze zmieniony." />
          <TaskCard href="/admin/inquiries?status=unnotified" icon={MailWarning} count={unnotifiedCount || 0} tone="red" title="Firma bez powiadomienia" description="Nowe zapytania, o których firma nie dostała maila. Przekaż je telefonicznie." />
          <TaskCard href="/admin/claims" icon={Handshake} count={claimCount || 0} title="Przejęcia firm" description="Prośby o przypisanie profilu firmy do konta." />
          <TaskCard href="/admin/equipment?status=stale" icon={Clock} count={statusCount('stale')} tone="red" title="Niepotwierdzone ogłoszenia" description="Ukryte, bo właściciel nie potwierdził aktualności." />
          <TaskCard href="/admin/equipment?status=incomplete" icon={AlertTriangle} count={statusCount('incomplete')} title="Niekompletne ogłoszenia" description="Opublikowane, ale z brakami w opisie lub zdjęciach." />
        </div>
      </section>

      <section aria-labelledby="numbers-heading" className="listing-panel">
        <h2 id="numbers-heading" className="mb-4 flex items-center gap-2 font-bold text-foreground">
          <BarChart3 size={18} aria-hidden="true" className="text-brand-600 dark:text-amber-300" /> Serwis w liczbach
        </h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Zapytania (7 dni)" value={week} detail={weekTrend} />
          <Metric label="Zapytania (30 dni)" value={month} detail="bez spamu" />
          <Metric label="Opublikowane ogłoszenia" value={published} detail={`${featured} ${plural(featured, 'polecane', 'polecane', 'polecanych')}`} />
          <Metric label="Firmy" value={companies.length} detail={`${verifiedCompanies} zweryfikowanych, ${ownedCompanies} z właścicielem`} />
          <Metric label="Wpisy w katalogu" value={directoryCount || 0} />
          <Metric label="Konta użytkowników" value={userCount || 0} />
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="listing-panel">
          <SectionHeader title="Ostatnie zapytania" href="/admin/inquiries" linkLabel="Wszystkie" />
          {recentInquiries?.length ? (
            <ul className="divide-y divide-border">
              {recentInquiries.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{item.equipment_name || 'Ogłoszenie usunięte'}</p>
                    <p className="truncate text-xs text-muted">
                      {item.customer_name}{item.companies?.name ? ` → ${item.companies.name}` : ''} · <time dateTime={item.created_at}>{dateTime.format(new Date(item.created_at))}</time>
                    </p>
                  </div>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
                    <span className="rounded bg-background px-2 py-1 font-semibold text-foreground">{INQUIRY_STATUS[item.status] || item.status}</span>
                    {item.status === 'new' && !item.firm_notified_at && <span className="font-semibold text-red-700 dark:text-red-300">bez maila do firmy</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">Nie ma jeszcze zapytań.</p>}
        </section>

        <section className="listing-panel">
          <SectionHeader title="Ostatnio dodane ogłoszenia" href="/admin/equipment" linkLabel="Wszystkie" />
          {recentListings?.length ? (
            <ul className="divide-y divide-border">
              {recentListings.map((item) => {
                const status = EQUIPMENT_STATUS[item.status]
                return (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link href={`/admin/equipment/${item.id}/edit`} className="block truncate font-semibold text-foreground hover:underline">{item.name}</Link>
                      <p className="truncate text-xs text-muted">{item.companies?.name || 'Bez firmy'} · <time dateTime={item.created_at}>{dateTime.format(new Date(item.created_at))}</time></p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${status?.style || 'bg-background text-foreground'}`}>{status?.label || item.status}</span>
                  </li>
                )
              })}
            </ul>
          ) : <p className="text-sm text-muted">Brak ogłoszeń.</p>}
        </section>

        <section className="listing-panel">
          <SectionHeader title="Najczęściej oglądane" />
          {topListings?.some((item) => item.equipment) ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th scope="col" className="pb-2 font-medium">Ogłoszenie</th>
                  <th scope="col" className="pb-2 text-right font-medium">Wyświetlenia</th>
                  <th scope="col" className="pb-2 text-right font-medium">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topListings.filter((item) => item.equipment).map((item) => (
                  <tr key={item.equipment.id}>
                    <td className="max-w-0 py-2 pr-3">
                      <Link href={`/admin/equipment/${item.equipment.id}/edit`} className="block truncate font-semibold text-foreground hover:underline">{item.equipment.name}</Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">{item.views_count || 0}</td>
                    <td className="py-2 text-right tabular-nums">{item.phone_clicks || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted">Brak zapisanych wyświetleń.</p>}
        </section>

        <section className="listing-panel">
          <SectionHeader title="Konfiguracja" />
          <p className="mb-3 text-sm text-muted">
            {missing.length ? `Brakuje ${missing.length} ${plural(missing.length, 'ustawienia', 'ustawień', 'ustawień')} w zmiennych środowiska.` : 'Wszystkie integracje mają ustawione klucze.'}
          </p>
          <ul className="space-y-2">
            {checks.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-sm">
                {item.ok
                  ? <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-green-700 dark:text-green-400" />
                  : <XCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-red-700 dark:text-red-400" />}
                <span className="min-w-0">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="sr-only">{item.ok ? ': ustawione' : ': brak'}</span>
                  {!item.ok && <span className="block text-xs text-muted">{item.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Sprawdzamy tylko, czy klucze są ustawione na tym serwerze, nie czy działają.</p>
        </section>
      </div>
    </div>
  )
}
