'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { MapPin, Plus, Save, Trash2, X } from 'lucide-react'
import { createBranch, deleteBranch, deleteCompany, updateCompany } from '../../actions'
import { AddressFields, CompanyFields, inputClass, labelClass } from '@/components/dashboard/CompanyFields'

const errorClass = 'rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200'
const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:border-amber-400 disabled:opacity-60'

function formatAddress(branch) {
  return [branch.address, [branch.zip_code, branch.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

export default function EditCompanyForm({ company, branches = [] }) {
  const router = useRouter()
  const mainBranch = branches.find((branch) => branch.is_main)
  const otherBranches = branches.filter((branch) => branch.id !== mainBranch?.id)
  // Address and contact live on the main branch; old company columns are only a fallback.
  const location = {
    address: mainBranch?.address ?? company.address,
    city: mainBranch?.city ?? company.city,
    zip_code: mainBranch?.zip_code ?? company.zip_code,
  }
  const contact = { phone: mainBranch?.phone || company.phone, email: mainBranch?.email || company.email }

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showBranchForm, setShowBranchForm] = useState(false)
  const [branchBusy, setBranchBusy] = useState(false)
  const [branchError, setBranchError] = useState('')

  async function handleSave(formData) {
    setSaving(true)
    setError('')
    const result = await updateCompany(company.id, formData)
    // On success the action redirects to the company page.
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Usunąć firmę „${company.name}” razem z jej oddziałami i ogłoszeniami? Tej operacji nie można cofnąć.`)) return
    setDeleting(true)
    setError('')
    const result = await deleteCompany(company.id)
    if (result?.error) {
      setError(result.error)
      setDeleting(false)
    }
  }

  async function handleAddBranch(event) {
    event.preventDefault()
    const form = event.currentTarget
    setBranchBusy(true)
    setBranchError('')
    try {
      const result = await createBranch(company.id, new FormData(form))
      if (result?.error) {
        setBranchError(result.error)
        return
      }
      toast.success(result.geocoded ? 'Dodano oddział' : 'Dodano oddział. Nie udało się ustalić jego położenia na mapie, sprawdź adres.')
      form.reset()
      setShowBranchForm(false)
      router.refresh()
    } catch {
      setBranchError('Nie udało się dodać oddziału. Spróbuj ponownie.')
    } finally {
      setBranchBusy(false)
    }
  }

  async function handleDeleteBranch(branch) {
    if (!confirm(`Usunąć oddział ${branch.name || formatAddress(branch)}?`)) return
    setBranchBusy(true)
    try {
      const result = await deleteBranch(branch.id, company.id)
      if (result?.error) toast.error(result.error)
      else {
        toast.success('Oddział usunięty')
        router.refresh()
      }
    } catch {
      toast.error('Nie udało się usunąć oddziału. Spróbuj ponownie.')
    } finally {
      setBranchBusy(false)
    }
  }

  const busy = saving || deleting

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form action={handleSave} className="listing-panel space-y-6">
        <fieldset disabled={busy} className="space-y-4">
          <legend className="mb-3 text-lg font-bold">Dane firmy</legend>
          <CompanyFields company={company} contact={contact} />
        </fieldset>
        <fieldset disabled={busy} className="space-y-4 border-t border-border pt-4">
          <legend className="pr-3 text-lg font-bold">Siedziba główna</legend>
          <AddressFields initial={location} />
        </fieldset>

        {error && <p role="alert" className={errorClass}>{error}</p>}

        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
          <button type="button" onClick={handleDelete} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950">
            <Trash2 size={17} aria-hidden="true" /> {deleting ? 'Usuwanie…' : 'Usuń firmę'}
          </button>
          <button type="submit" disabled={busy} className="market-action">
            <Save size={17} aria-hidden="true" /> {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>

      <section aria-labelledby="branches-heading" className="listing-panel space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="branches-heading" className="flex items-center gap-1.5 font-bold"><MapPin size={18} aria-hidden="true" /> Inne oddziały ({otherBranches.length})</h2>
          {!showBranchForm && (
            <button type="button" onClick={() => setShowBranchForm(true)} className={secondaryButton}><Plus size={16} aria-hidden="true" /> Dodaj</button>
          )}
        </div>
        <p className="text-sm text-muted">Oddział to inny punkt odbioru sprzętu. Przy ogłoszeniu wybierasz, z którego oddziału jest wynajmowane.</p>

        {showBranchForm ? (
          <form onSubmit={handleAddBranch} className="space-y-4 border-t border-border pt-3">
            <fieldset disabled={branchBusy} className="space-y-4">
              <legend className="text-sm font-bold">Nowy oddział</legend>
              <div>
                <label htmlFor="branch_name" className={labelClass}>Nazwa <span className="font-normal text-muted">(opcjonalnie)</span></label>
                <input id="branch_name" name="branch_name" maxLength={120} placeholder="np. Magazyn Oława" className={inputClass} />
              </div>
              <AddressFields idPrefix="branch-" />
              <div>
                <label htmlFor="branch-phone" className={labelClass}>Telefon oddziału <span className="font-normal text-muted">(opcjonalnie)</span></label>
                <input id="branch-phone" name="phone" type="tel" maxLength={40} className={inputClass} />
              </div>
              <div>
                <label htmlFor="branch-email" className={labelClass}>E-mail oddziału <span className="font-normal text-muted">(opcjonalnie)</span></label>
                <input id="branch-email" name="email" type="email" maxLength={200} className={inputClass} />
              </div>
            </fieldset>
            {branchError && <p role="alert" className={errorClass}>{branchError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowBranchForm(false); setBranchError('') }} className={secondaryButton}><X size={16} aria-hidden="true" /> Anuluj</button>
              <button type="submit" disabled={branchBusy} className="market-action">{branchBusy ? 'Zapisywanie…' : 'Dodaj oddział'}</button>
            </div>
          </form>
        ) : otherBranches.length === 0 ? (
          <p className="rounded-lg bg-background p-3 text-sm text-muted">Firma ma tylko siedzibę główną.</p>
        ) : (
          <ul className="divide-y divide-border">
            {otherBranches.map((branch) => (
              <li key={branch.id} className="flex items-start justify-between gap-2 py-2.5">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">{branch.name || 'Oddział'}</p>
                  <p className="break-words text-muted">{formatAddress(branch) || 'Brak adresu'}</p>
                  {(branch.phone || branch.email) && <p className="break-words text-xs text-muted">{[branch.phone, branch.email].filter(Boolean).join(' · ')}</p>}
                  {branch.lat == null && <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Brak położenia na mapie</p>}
                </div>
                <button type="button" onClick={() => handleDeleteBranch(branch)} disabled={branchBusy} className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-red-700 disabled:opacity-50" title="Usuń oddział">
                  <Trash2 size={17} aria-hidden="true" /><span className="sr-only">Usuń oddział {branch.name || formatAddress(branch)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
