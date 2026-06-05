import { createClient } from '@/utils/supabase/server'
import DirectoryTable from './DirectoryTable'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDirectoryPage() {
  const supabase = createClient()

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Katalog Wizytówek (SEO)
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Zarządzaj firmami w katalogu firm /katalog (wizytówki, oddziały, logotypy, dane do SEO).</p>
        </div>
        <Link 
          href="/admin/directory/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Dodaj firmę</span>
        </Link>
      </div>

      <DirectoryTable initialCompanies={mappedCompanies} />
    </div>
  )
}
