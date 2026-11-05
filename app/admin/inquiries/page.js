import { createClient } from '@/utils/supabase/server'
import { Inbox } from 'lucide-react'
import InquiryList from '@/components/inquiries/InquiryList'
import { emailConfigured } from '@/lib/email'

export default async function AdminInquiriesPage() {
  const supabase = await createClient()
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('id, equipment_name, customer_name, customer_phone, customer_email, message, date_from, date_to, job_location, status, created_at, firm_notified_at, companies (name)')
    .order('created_at', { ascending: false })
    .limit(300)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Inbox className="h-7 w-7 text-blue-600" />
          Zapytania
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Wszystkie zapytania klientów z formularza na stronach ogłoszeń.</p>
      </div>
      {!emailConfigured() && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Wysyłka e-maili nie jest skonfigurowana (brak RESEND_API_KEY). Zapytania zapisują się tutaj, ale firmy nie dostają powiadomień: przekazuj je ręcznie.
        </p>
      )}
      {error
        ? <p role="alert" className="text-sm text-red-700 dark:text-red-400">Nie udało się wczytać zapytań: {error.message}</p>
        : <InquiryList inquiries={inquiries} showCompany />}
    </div>
  )
}
