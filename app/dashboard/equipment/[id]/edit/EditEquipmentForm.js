'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2 } from 'lucide-react'
import { ListingBasics, ListingRentalFields } from '@/components/dashboard/ListingDetailsFields'
import { deleteEquipment, updateEquipment } from '../../actions'

export default function EditEquipmentForm({ equipment, categories, subcategories, branches }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const busy = saving || deleting || uploading

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const result = await updateEquipment(equipment.id, equipment.company_id, data)
      if (result?.error) setError(result.error)
      else router.replace(`/dashboard/company/${equipment.company_id}`)
    } catch {
      setError('Nie udało się zapisać zmian. Spróbuj ponownie.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (busy || !confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return

    setDeleting(true)
    setError('')
    try {
      const result = await deleteEquipment(equipment.id, equipment.company_id)
      if (result?.error) setError(result.error)
      else router.replace(`/dashboard/company/${equipment.company_id}`)
    } catch {
      setError('Nie udało się usunąć ogłoszenia. Spróbuj ponownie.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <fieldset className="space-y-4" disabled={saving || deleting}>
        <legend className="mb-4 text-lg font-bold">Sprzęt i lokalizacja</legend>
        <ListingBasics listing={equipment} categories={categories} subcategories={subcategories} branches={branches} />
      </fieldset>
      <fieldset className="space-y-4 border-t border-border" disabled={saving || deleting}>
        <legend className="pr-3 text-lg font-bold">Zdjęcia i warunki wynajmu</legend>
        <ListingRentalFields listing={equipment} onUploadingChange={setUploading} />
        <label className="flex items-center gap-2 text-sm">
          <input name="promotion" type="checkbox" defaultChecked={equipment.promotion} className="size-4 shrink-0 accent-brand-600" />
          Chcę promować to ogłoszenie w przyszłości
        </label>
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}

      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
        <button type="button" onClick={handleDelete} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950">
          <Trash2 size={17} aria-hidden="true" /> {deleting ? 'Usuwanie…' : 'Usuń ogłoszenie'}
        </button>
        <button type="submit" disabled={busy} className="market-action">
          <Save size={17} aria-hidden="true" /> {saving ? 'Zapisywanie…' : uploading ? 'Wysyłanie zdjęć…' : 'Zapisz zmiany'}
        </button>
      </div>
    </form>
  )
}
