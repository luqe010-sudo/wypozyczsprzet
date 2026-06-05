import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditCompanyForm from './EditCompanyForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditCompanyPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    companyRes,
    branchesRes
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).eq('owner_user_id', user.id).single(),
    supabase.from('company_branches').select('*').eq('company_id', params.id).order('is_main', { ascending: false }).order('created_at')
  ])

  const company = companyRes.data
  const error = companyRes.error
  const branches = branchesRes.data

  if (error || !company) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href={`/dashboard/company/${company.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firmy
        </Link>
      </div>
      
      <EditCompanyForm company={company} branches={branches || []} />
    </div>
  )
}
