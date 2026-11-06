import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import EditEquipmentForm from './EditEquipmentForm'

export default async function EditEquipmentPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()
  if (!equipment) redirect('/dashboard')

  const { data: company } = await supabase.from('companies').select('id')
    .eq('id', equipment.company_id).eq('owner_user_id', user.id).maybeSingle()
  if (!company) redirect('/dashboard')

  const categoriesQuery = supabase.from('equipment_categories').select('id, name, db_key').order('sort_order')
  const subcategoriesQuery = supabase.from('equipment_subcategories').select('id, name, slug, category_id').order('sort_order')
  const [categories, subcategories, branches] = await Promise.all([
    equipment.category_id
      ? categoriesQuery.or(`status.eq.active,id.eq.${equipment.category_id}`)
      : categoriesQuery.eq('status', 'active'),
    equipment.subcategory_id
      ? subcategoriesQuery.or(`status.eq.active,id.eq.${equipment.subcategory_id}`)
      : subcategoriesQuery.eq('status', 'active'),
    supabase.from('company_branches').select('id, name, city, address, is_main')
      .eq('company_id', equipment.company_id).order('is_main', { ascending: false }).order('created_at'),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/dashboard/company/${equipment.company_id}`} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        <ArrowLeft size={17} aria-hidden="true" /> Wróć do firmy
      </Link>

      <section className="listing-panel">
        <h1 className="market-heading">Edytuj ogłoszenie</h1>
        <p className="mt-1 break-words text-sm text-muted">{equipment.name}</p>
        {categories.error || subcategories.error || branches.error ? (
          <p role="alert" className="mt-4 text-sm text-red-800 dark:text-red-200">Nie udało się wczytać danych formularza. Odśwież stronę.</p>
        ) : (
          <EditEquipmentForm equipment={equipment} categories={categories.data || []} subcategories={subcategories.data || []} branches={branches.data || []} />
        )}
      </section>
    </div>
  )
}
