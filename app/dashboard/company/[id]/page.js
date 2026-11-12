import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ArrowLeft, BadgeCheck, BarChart3, Edit, Globe, Inbox, Mail, MapPin, Phone, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EquipmentList from '@/components/dashboard/EquipmentList'

const secondaryLink = 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:border-amber-400'

function formatAddress(branch) {
  return [branch?.address, [branch?.zip_code, branch?.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

export default async function CompanyDetailsPage({ params: routeParams }) {
  const params = await routeParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: company, error: companyError }, { data: branches }, { data: equipment, error: equipmentError }, { count: newInquiries }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).eq('owner_user_id', user.id).single(),
    supabase.from('company_branches').select('*').eq('company_id', params.id).order('is_main', { ascending: false }).order('created_at'),
    supabase.from('equipment')
      .select('id, company_id, name, slug, image_url, category, price_type, price_amount, rental_period, last_confirmed_at, status')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('company_id', params.id).eq('status', 'new'),
  ])
  if (companyError || !company) redirect('/dashboard')

  const mainBranch = branches?.find((branch) => branch.is_main) || branches?.[0]
  const phone = mainBranch?.phone || company.phone
  const email = mainBranch?.email || company.email
  const address = formatAddress(mainBranch) || formatAddress(company)
  const unmapped = (branches || []).filter((branch) => branch.lat == null)
  const warnings = [
    !email && 'Firma nie ma adresu e-mail, więc nie dostaniesz powiadomień o zapytaniach. Zapytania i tak zobaczysz w panelu.',
    unmapped.length > 0 && `${unmapped.length === 1 ? 'Jeden oddział nie ma' : `${unmapped.length} oddziały nie mają`} położenia na mapie. Popraw adres w edycji firmy, aby ogłoszenia pojawiały się w wynikach dla okolicy.`,
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-amber-300">
        <ArrowLeft size={16} aria-hidden="true" /> Wróć do pulpitu
      </Link>

      <section className="listing-panel space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="market-heading break-words">{company.name || 'Nienazwana firma'}</h1>
            <p className="mt-1 text-sm">
              {company.verified_at
                ? <span className="inline-flex items-center gap-1 font-semibold text-green-800 dark:text-green-300"><BadgeCheck size={16} aria-hidden="true" /> Zweryfikowana firma</span>
                : <span className="text-muted">Niezweryfikowana. Pierwsze ogłoszenie sprawdzi administrator przed publikacją.</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/company/${company.id}/edit`} className={secondaryLink}><Edit size={16} aria-hidden="true" /> Edytuj firmę</Link>
            <Link href={`/dashboard/company/${company.id}/stats`} className={secondaryLink}><BarChart3 size={16} aria-hidden="true" /> Statystyki</Link>
            <Link href="/dashboard/inquiries" className={secondaryLink}>
              <Inbox size={16} aria-hidden="true" /> Zapytania
              {newInquiries > 0 && <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold leading-none text-market-navy">{newInquiries}<span className="sr-only"> nowych</span></span>}
            </Link>
          </div>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2"><dt><MapPin size={16} className="mt-0.5 text-muted" aria-hidden="true" /><span className="sr-only">Adres</span></dt><dd className="break-words">{address || 'Brak adresu'}</dd></div>
          <div className="flex items-start gap-2"><dt><Phone size={16} className="mt-0.5 text-muted" aria-hidden="true" /><span className="sr-only">Telefon</span></dt><dd>{phone || 'Brak telefonu'}</dd></div>
          <div className="flex items-start gap-2"><dt><Mail size={16} className="mt-0.5 text-muted" aria-hidden="true" /><span className="sr-only">E-mail</span></dt><dd className="break-all">{email || 'Brak e-maila'}</dd></div>
          {company.website && (
            <div className="flex items-start gap-2"><dt><Globe size={16} className="mt-0.5 text-muted" aria-hidden="true" /><span className="sr-only">Strona WWW</span></dt><dd className="break-all"><a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline dark:text-amber-300">{company.website}</a></dd></div>
          )}
        </dl>

        {warnings.map((warning) => (
          <p key={warning} className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> {warning}
          </p>
        ))}
      </section>

      {branches?.length > 1 && (
        <section aria-labelledby="branches-heading" className="listing-panel">
          <h2 id="branches-heading" className="mb-2 font-bold">Oddziały ({branches.length})</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {branches.map((branch) => (
              <li key={branch.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="flex items-center justify-between gap-2 font-semibold">
                  {branch.name || 'Oddział'}
                  {branch.id === mainBranch?.id && <span className="rounded bg-background px-1.5 py-0.5 text-xs text-muted">Siedziba</span>}
                </p>
                <p className="mt-0.5 break-words text-muted">{formatAddress(branch) || 'Brak adresu'}</p>
                {(branch.phone || branch.email) && <p className="mt-0.5 break-words text-xs text-muted">{[branch.phone, branch.email].filter(Boolean).join(' · ')}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="listings-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="listings-heading" className="text-lg font-bold">Ogłoszenia firmy ({equipment?.length || 0})</h2>
          <Link href={`/dashboard/company/${company.id}/equipment/new`} className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj ogłoszenie</Link>
        </div>
        <EquipmentList equipment={equipment || []} error={equipmentError} />
      </section>
    </div>
  )
}
