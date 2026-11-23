'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Check, X } from 'lucide-react'
import { activateFeaturedRequest, cancelFeaturedRequest } from '@/app/admin/actions'
import { secondaryButtonClass } from '@/components/admin/adminUi'
import { FEATURED_DAYS } from '@/lib/site'

export default function FeaturedRequestActions({ id }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(action, question, success) {
    if (busy || !window.confirm(question)) return
    setBusy(true)
    try {
      const result = await action(id)
      if (result?.error) toast.error(result.error)
      else {
        toast.success(success)
        router.refresh()
      }
    } catch {
      toast.error('Nie udało się zapisać. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={busy}
        className={`${secondaryButtonClass} border-green-300 text-green-800 dark:text-green-300`}
        onClick={() => run(activateFeaturedRequest, `Wpłata zaksięgowana? Ogłoszenie zostanie wyróżnione na ${FEATURED_DAYS} dni, a firma dostanie potwierdzenie mailem.`, 'Wyróżnienie włączone')}
      >
        <Check size={16} aria-hidden="true" /> Opłacone
      </button>
      <button
        type="button"
        disabled={busy}
        className={secondaryButtonClass}
        onClick={() => run(cancelFeaturedRequest, 'Anulować zamówienie? Firma nie dostanie powiadomienia.', 'Zamówienie anulowane')}
      >
        <X size={16} aria-hidden="true" /> Anuluj
      </button>
    </div>
  )
}
