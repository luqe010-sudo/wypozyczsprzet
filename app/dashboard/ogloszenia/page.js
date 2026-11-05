import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EquipmentList from '@/components/dashboard/EquipmentList'

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnTo=/dashboard/ogloszenia')

  const { data: companies = [], error } = await supabase
    .from('companies')
    .select('id, name, equipment(id, company_id, name, image_url, category, price_type, price_amount, rental_period, last_confirmed_at, status, created_at)')
    .eq('owner_user_id', user.id)
    .order('name')

  const equipment = (companies || [])
    .flatMap((company) => (company.equipment || []).map((item) => ({ ...item, companyName: company.name })))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="space-y-4">
      <h1 className="market-heading">Moje ogłoszenia{error ? '' : ` (${equipment.length})`}</h1>
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
      <EquipmentList equipment={equipment} error={error} />
    </div>
  )
}
