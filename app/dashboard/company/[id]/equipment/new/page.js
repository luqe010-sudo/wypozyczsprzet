import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import NewEquipmentForm from './NewEquipmentForm'

export default async function NewEquipmentPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies')
    .select('id, name').eq('id', id).eq('owner_user_id', user.id).single()
  if (!company) redirect('/dashboard')

  const [categories, subcategories, branches] = await Promise.all([
    supabase.from('equipment_categories').select('id, name, db_key').eq('status', 'active').order('sort_order'),
    supabase.from('equipment_subcategories').select('id, name, slug, category_id').eq('status', 'active').order('sort_order'),
    supabase.from('company_branches').select('id, name, city, address, is_main')
      .eq('company_id', id).order('is_main', { ascending: false }).order('created_at'),
  ])

  if (categories.error || subcategories.error || branches.error || !categories.data?.length) {
    return (
      <section className="listing-panel">
        <h1 className="market-heading">Dodaj ogłoszenie</h1>
        <p role="alert" className="mt-2 text-sm text-red-800 dark:text-red-200">Nie udało się wczytać danych formularza. Odśwież stronę.</p>
      </section>
    )
  }

  if (!branches.data?.length) {
    return (
      <section className="listing-panel">
        <h1 className="market-heading">Dodaj ogłoszenie</h1>
        <p className="mb-4 mt-2 text-sm text-muted">Najpierw dodaj oddział firmy. Z jego adresu ustalimy lokalizację sprzętu.</p>
        <Link href={`/dashboard/company/${id}/edit`} className="market-action">Uzupełnij dane firmy</Link>
      </section>
    )
  }

  return (
    <NewEquipmentForm
      companyId={id}
      companyName={company.name}
      categories={categories.data}
      subcategories={subcategories.data || []}
      branches={branches.data}
    />
  )
}
