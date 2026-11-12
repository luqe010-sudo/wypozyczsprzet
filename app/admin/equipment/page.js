import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EquipmentTable from './EquipmentTable'
import { AdminPageHeader } from '@/components/admin/adminUi'

export default async function AdminEquipmentPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('id, name, slug, status, priority, image_url, category, price_type, price_amount, rental_period, created_at, last_confirmed_at, company_id, companies(name, verified_at), company_branches(city), equipment_categories(name)')
    .order('created_at', { ascending: false })

  const one = (value) => (typeof value === 'string' ? value : '')

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Ogłoszenia" description="Zatwierdzaj nowe ogłoszenia, wybieraj polecane i ukrywaj te, które łamią regulamin.">
        <Link href="/admin/equipment/new" className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj ogłoszenie</Link>
      </AdminPageHeader>

      {error
        ? <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać ogłoszeń: {error.message}</p>
        : (
          <EquipmentTable
            initialEquipment={equipment || []}
            initialStatus={one(params.status)}
            initialQuery={one(params.q)}
            companyFilter={one(params.company)}
          />
        )}
    </div>
  )
}
