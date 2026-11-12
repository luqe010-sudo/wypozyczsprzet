'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { createCompany } from '../actions'
import { AddressFields, CompanyFields } from '@/components/dashboard/CompanyFields'

export default function NewCompanyPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData) {
    setSaving(true)
    setError('')
    const result = await createCompany(formData)
    // On success the action redirects to the company page.
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-amber-300">
        <ArrowLeft size={16} aria-hidden="true" /> Wróć do pulpitu
      </Link>

      <header>
        <h1 className="market-heading flex items-center gap-2"><Building2 size={22} aria-hidden="true" className="text-brand-600 dark:text-market-yellow" /> Dodaj firmę</h1>
        <p className="mt-1 text-sm text-muted">Profil firmy jest potrzebny do publikowania ogłoszeń. Jeśli Twoja firma jest już w <Link href="/katalog" className="font-semibold underline">katalogu</Link>, możesz przejąć jej wizytówkę zamiast tworzyć nową.</p>
      </header>

      <form action={handleSubmit} className="listing-panel space-y-6">
        <fieldset disabled={saving} className="space-y-4">
          <legend className="mb-3 text-lg font-bold">Dane firmy</legend>
          <CompanyFields />
        </fieldset>
        <fieldset disabled={saving} className="space-y-4 border-t border-border pt-4">
          <legend className="pr-3 text-lg font-bold">Siedziba</legend>
          <p className="text-sm text-muted">Na podstawie adresu pokazujemy ogłoszenia na mapie i w wynikach dla okolicy.</p>
          <AddressFields />
        </fieldset>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}

        <div className="flex justify-end border-t border-border pt-4">
          <button type="submit" disabled={saving} className="market-action">{saving ? 'Zapisywanie…' : 'Utwórz firmę'}</button>
        </div>
      </form>
    </div>
  )
}
