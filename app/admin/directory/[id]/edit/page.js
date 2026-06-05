import { createClient } from '@/utils/supabase/server'
import DirectoryEditForm from './DirectoryEditForm'
import { notFound } from 'next/navigation'

export default async function AdminEditDirectoryCompanyPage({ params }) {
  const { id } = params
  const supabase = createClient()

  // Fetch the company and all associated branches
  const [
    { data: company, error: companyError },
    { data: branches, error: branchesError },
    { data: marketplaceCompanies }
  ] = await Promise.all([
    supabase.from('company_directory').select('*').eq('id', id).single(),
    supabase.from('company_directory_branches').select('*').eq('company_id', id).order('city'),
    supabase.from('companies').select('id, name').order('name')
  ])

  if (companyError || !company) {
    notFound()
  }

  return (
    <div className="py-6">
      <DirectoryEditForm 
        company={company} 
        initialBranches={branches || []} 
        marketplaceCompanies={marketplaceCompanies || []} 
      />
    </div>
  )
}
