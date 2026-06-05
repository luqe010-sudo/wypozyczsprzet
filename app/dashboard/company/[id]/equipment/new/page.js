import { createClient } from '@/utils/supabase/server'
import NewEquipmentForm from './NewEquipmentForm'
import { redirect } from 'next/navigation'

export default async function NewEquipmentPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify company ownership
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single()

  if (companyError || !company) {
    redirect('/dashboard') // Company not found or not owned by user
  }

  // Fetch categories, subcategories, and branches in parallel
  const [
    { data: categoriesRes },
    { data: subcategoriesRes },
    { data: branchesRes }
  ] = await Promise.all([
    supabase.from('equipment_categories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('equipment_subcategories').select('*').eq('status', 'active').order('sort_order'),
    supabase.from('company_branches').select('*').eq('company_id', params.id).order('is_main', { ascending: false }).order('created_at')
  ])

  return (
    <div className="py-6">
      <NewEquipmentForm 
        companyId={params.id}
        companyName={company.name}
        categories={categoriesRes || []}
        subcategories={subcategoriesRes || []}
        branches={branchesRes || []}
      />
    </div>
  )
}
