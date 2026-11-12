/** Shared labels and class names for the admin panel. Plain module, safe in server and client components. */

export const EQUIPMENT_STATUS = {
  pending: { label: 'Do moderacji', style: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  active: { label: 'Opublikowane', style: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  incomplete: { label: 'Opublikowane, niekompletne', style: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  stale: { label: 'Niepotwierdzone', style: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  inactive: { label: 'Wstrzymane przez właściciela', style: 'bg-background text-foreground' },
  hidden: { label: 'Ukryte przez administratora', style: 'bg-background text-foreground' },
  rejected: { label: 'Odrzucone', style: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
}

export const INQUIRY_STATUS = {
  new: 'Nowe',
  contacted: 'Po kontakcie',
  closed: 'Zakończone',
  spam: 'Spam',
}

export const RENTAL_PERIODS = { hour: 'godzina', day: 'doba', week: 'tydzień', month: 'miesiąc' }

export const filterTabClass = (active) => `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${active
  ? 'border-market-navy bg-market-navy text-white dark:border-market-yellow dark:bg-market-yellow dark:text-market-navy'
  : 'border-border bg-card text-foreground hover:border-amber-400'}`

export const countBadgeClass = (active) => `rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${active
  ? 'bg-white/20 text-current'
  : 'bg-background text-muted'}`

export const secondaryButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:border-amber-400 disabled:opacity-60'

export const dateTime = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Warsaw' })
export const dateOnly = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeZone: 'Europe/Warsaw' })

export function AdminPageHeader({ title, description, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="market-heading">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  )
}
