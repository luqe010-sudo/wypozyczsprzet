'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Building2, Check, Clock, Handshake, Mail, MessageSquare, Phone, X } from 'lucide-react'
import { getPendingClaims, handleClaimAction } from '@/app/actions/claimActions'
import { AdminPageHeader, dateTime, secondaryButtonClass } from '@/components/admin/adminUi'

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPendingClaims().then((result) => {
      if (cancelled) return
      if (result.error) setError(result.error)
      else setClaims(result.data || [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  async function onAction(claim, action) {
    const question = action === 'approve'
      ? `Przypisać firmę „${claim.companies?.name}” do konta ${claim.email}? Firma zostanie oznaczona jako zweryfikowana, a inne zgłoszenia do niej odrzucone.`
      : `Odrzucić zgłoszenie od ${claim.email}?`
    if (!confirm(question)) return

    setProcessingId(claim.id)
    try {
      const result = await handleClaimAction(claim.id, action, claim.company_id, claim.user_id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setClaims((items) => items.filter((item) => (action === 'approve' ? item.company_id !== claim.company_id : item.id !== claim.id)))
      toast.success(action === 'approve' ? 'Firma przypisana do konta' : 'Zgłoszenie odrzucone')
    } catch {
      toast.error('Nie udało się zapisać decyzji. Spróbuj ponownie.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Przejęcia firm" description="Prośby właścicieli o przypisanie istniejącego profilu firmy do ich konta. Przed akceptacją zadzwoń pod numer firmy i potwierdź, że zgłasza się jej przedstawiciel." />

      {error && <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">{error}</p>}

      {loading ? (
        <p className="listing-panel text-center text-sm text-muted" aria-live="polite">Wczytywanie zgłoszeń…</p>
      ) : claims.length === 0 && !error ? (
        <div className="listing-panel text-center">
          <Handshake size={28} className="mx-auto text-muted" aria-hidden="true" />
          <p className="mt-2 font-bold">Brak oczekujących zgłoszeń</p>
          <p className="mt-1 text-sm text-muted">Nowe prośby o przejęcie profilu firmy pojawią się tutaj.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {claims.map((claim) => {
            const busy = processingId === claim.id
            return (
              <li key={claim.id} className={`listing-panel ${busy ? 'opacity-60' : ''}`} aria-busy={busy}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200"><Building2 size={20} aria-hidden="true" /></span>
                      <div className="min-w-0">
                        <h2 className="break-words font-bold text-foreground">
                          <Link href={`/admin/companies/${claim.company_id}/edit`} className="hover:underline">{claim.companies?.name || 'Firma usunięta'}</Link>
                        </h2>
                        {claim.companies?.city && <p className="text-sm text-muted">{claim.companies.city}</p>}
                      </div>
                    </div>

                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2"><dt><Mail size={16} className="text-muted" aria-hidden="true" /><span className="sr-only">E-mail</span></dt><dd className="break-all"><a href={`mailto:${claim.email}`} className="font-semibold hover:underline">{claim.email}</a></dd></div>
                      <div className="flex items-center gap-2"><dt><Phone size={16} className="text-muted" aria-hidden="true" /><span className="sr-only">Telefon</span></dt><dd>{claim.phone ? <a href={`tel:${claim.phone.replace(/[^+\d]/g, '')}`} className="font-semibold hover:underline">{claim.phone}</a> : 'brak'}</dd></div>
                      <div className="flex items-center gap-2"><dt><Clock size={16} className="text-muted" aria-hidden="true" /><span className="sr-only">Zgłoszono</span></dt><dd><time dateTime={claim.created_at}>{dateTime.format(new Date(claim.created_at))}</time></dd></div>
                    </dl>

                    {claim.message && (
                      <p className="flex gap-2 rounded-lg bg-background p-3 text-sm">
                        <MessageSquare size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                        <span className="whitespace-pre-line break-words">{claim.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2 lg:flex-col">
                    <button type="button" disabled={busy} onClick={() => onAction(claim, 'approve')} className="market-action flex-1">
                      <Check size={16} aria-hidden="true" /> Akceptuj
                    </button>
                    <button type="button" disabled={busy} onClick={() => onAction(claim, 'reject')} className={`${secondaryButtonClass} flex-1 text-red-700 dark:text-red-300`}>
                      <X size={16} aria-hidden="true" /> Odrzuć
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
