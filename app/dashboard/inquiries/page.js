import { createClient } from '@/utils/supabase/server'
import InquiryList from '@/components/inquiries/InquiryList'

export const metadata = { title: 'Zapytania od klientów | WypożyczSprzęt' }

export default async function OwnerInquiriesPage() {
  const supabase = await createClient()

  // RLS returns only inquiries for companies owned by the logged-in user, but admins see all of them.
  const { data: { user } } = await supabase.auth.getUser()
  const { data: companies } = await supabase.from('companies').select('id').eq('owner_user_id', user.id)
  const companyIds = (companies || []).map((company) => company.id)

  const { data: inquiries, error } = companyIds.length > 0
    ? await supabase
      .from('inquiries')
      .select('id, equipment_name, customer_name, customer_phone, customer_email, message, date_from, date_to, job_location, status, created_at')
      .in('company_id', companyIds)
      .order('created_at', { ascending: false })
      .limit(200)
    : { data: [], error: null }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zapytania od klientów</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Odezwij się do klienta bezpośrednio, a potem zmień status zapytania.</p>
      </div>
      {error
        ? <p role="alert" className="text-sm text-red-700 dark:text-red-400">Nie udało się wczytać zapytań. Odśwież stronę.</p>
        : <InquiryList inquiries={inquiries} />}
    </div>
  )
}
