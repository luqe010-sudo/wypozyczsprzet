'use client'

import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Lock } from 'lucide-react'
import { updatePassword } from '@/app/login/actions'

const MIN_LENGTH = 8
const inputClass = 'block min-h-11 w-full rounded-lg border border-slate-300 bg-card px-3 py-2 text-base text-foreground sm:text-sm dark:border-slate-600'

/** Supabase answers in English; the most common cases get a Polish message. */
function polishError(message = '') {
  const text = message.toLowerCase()
  if (text.includes('different from the old')) return 'Nowe hasło musi być inne niż obecne.'
  if (text.includes('at least')) return `Hasło musi mieć co najmniej ${MIN_LENGTH} znaków.`
  if (text.includes('weak') || text.includes('pwned')) return 'To hasło jest zbyt słabe albo wyciekło w innym serwisie. Wybierz inne.'
  if (text.includes('session') || text.includes('jwt') || text.includes('not authenticated')) return 'Sesja wygasła. Zaloguj się ponownie i spróbuj jeszcze raz.'
  if (text.includes('rate limit')) return 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.'
  return 'Nie udało się zmienić hasła. Spróbuj ponownie.'
}

export default function SettingsPage() {
  const formRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData) {
    setError('')
    const password = String(formData.get('password') || '')
    if (password.length < MIN_LENGTH) return setError(`Hasło musi mieć co najmniej ${MIN_LENGTH} znaków.`)
    if (password !== formData.get('confirmPassword')) return setError('Hasła nie są identyczne.')

    setSaving(true)
    try {
      const result = await updatePassword(formData)
      if (result?.error) setError(polishError(result.error))
      else {
        toast.success('Hasło zostało zmienione.')
        formRef.current?.reset()
      }
    } catch {
      setError('Nie udało się zmienić hasła. Spróbuj ponownie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="market-heading">Ustawienia konta</h1>
        <p className="mt-1 text-sm text-muted">Dane firm i oddziałów zmienisz w edycji firmy na pulpicie.</p>
      </header>

      <form ref={formRef} action={handleSubmit} className="listing-panel max-w-xl space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Lock size={18} aria-hidden="true" /> Zmiana hasła</h2>
        <fieldset disabled={saving} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold">Nowe hasło</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={MIN_LENGTH} aria-describedby="password-hint" className={inputClass} />
            <p id="password-hint" className="mt-1 text-xs text-muted">Co najmniej {MIN_LENGTH} znaków. Najlepiej użyj hasła zaproponowanego przez przeglądarkę.</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold">Powtórz nowe hasło</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={MIN_LENGTH} className={inputClass} />
          </div>
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
        <button type="submit" disabled={saving} className="market-action">{saving ? 'Zapisywanie…' : 'Zmień hasło'}</button>
      </form>
    </div>
  )
}
