import { createClient } from '@/utils/supabase/server'
import DirectoryTable from './DirectoryTable'
import { Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/adminUi'
import Link from 'next/link'

export default async function AdminDirectoryPage() {
  const supabase = await createClient()

  // Fetch all company directory items with their branches
  const { data: companies, error } = await supabase
    .from('company_directory')
    .select('*, company_directory_branches(*), companies(name)')
    .order('name')

  if (error) {
    console.error('[AdminDirectory] Error fetching directory:', error)
  }

  // Map company_directory_branches to standard branches property
  const mappedCompanies = (companies || []).map(comp => ({
    ...comp,
    branches: comp.company_directory_branches || []
  }))

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Katalog firm" description="Wizytówki firm w katalogu /katalog: oddziały, logotypy i dane do wyszukiwarek. Firma z katalogu nie musi mieć ogłoszeń.">
        <Link href="/admin/directory/new" className="market-action"><Plus size={16} aria-hidden="true" /> Dodaj wizytówkę</Link>
      </AdminPageHeader>

      <DirectoryTable initialCompanies={mappedCompanies} />
    </div>
  )
}
