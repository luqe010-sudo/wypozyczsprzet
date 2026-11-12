'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Check, Edit2, ExternalLink, PackageOpen, Search, Star, Trash2, X } from 'lucide-react'
import { adminDeleteRecord, setEquipmentFeatured, updateEquipmentStatus } from '../actions'
import ListingImage from '@/components/listing/ListingImage'
import { EQUIPMENT_STATUS, RENTAL_PERIODS, countBadgeClass, dateOnly, filterTabClass, secondaryButtonClass } from '@/components/admin/adminUi'
import { priceText } from '@/lib/format'

const PUBLISHED = new Set(['active', 'incomplete'])
const PAGE_SIZE = 40

const TABS = [
  { key: '', label: 'Wszystkie', match: () => true },
  { key: 'pending', label: 'Do moderacji', match: (item) => item.status === 'pending' },
  { key: 'active', label: 'Opublikowane', match: (item) => PUBLISHED.has(item.status) },
  { key: 'featured', label: 'Polecane', match: (item) => item.priority > 1 && PUBLISHED.has(item.status) },
  { key: 'incomplete', label: 'Niekompletne', match: (item) => item.status === 'incomplete' },
  { key: 'stale', label: 'Niepotwierdzone', match: (item) => item.status === 'stale' },
  { key: 'inactive', label: 'Wstrzymane', match: (item) => item.status === 'inactive' },
  { key: 'hidden', label: 'Ukryte', match: (item) => item.status === 'hidden' },
  { key: 'rejected', label: 'Odrzucone', match: (item) => item.status === 'rejected' },
]

const iconButton = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground disabled:opacity-40'

export default function EquipmentTable({ initialEquipment, initialStatus = '', initialQuery = '', companyFilter = '' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [equipment, setEquipment] = useState(initialEquipment)
  const [tab, setTab] = useState(TABS.some(({ key }) => key === initialStatus) ? initialStatus : '')
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [busyId, setBusyId] = useState(null)
  const tabsRef = useRef(null)

  useEffect(() => {
    tabsRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [tab])

  const scoped = useMemo(
    () => (companyFilter ? equipment.filter((item) => item.company_id === companyFilter) : equipment),
    [equipment, companyFilter],
  )
  const categories = useMemo(
    () => [...new Set(scoped.map((item) => item.equipment_categories?.name || item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl')),
    [scoped],
  )

  const needle = query.trim().toLowerCase()
  const activeTab = TABS.find(({ key }) => key === tab) || TABS[0]
  const filtered = scoped.filter((item) => {
    if (!activeTab.match(item)) return false
    if (category && (item.equipment_categories?.name || item.category) !== category) return false
    if (!needle) return true
    return [item.name, item.companies?.name, item.company_branches?.city, item.slug]
      .some((value) => value?.toLowerCase().includes(needle))
  })

  function syncUrl(nextTab, nextQuery) {
    const params = new URLSearchParams()
    if (nextTab) params.set('status', nextTab)
    if (nextQuery.trim()) params.set('q', nextQuery.trim())
    if (companyFilter) params.set('company', companyFilter)
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false })
  }

  function chooseTab(key) {
    setTab(key)
    setVisible(PAGE_SIZE)
    syncUrl(key, query)
  }

  function patch(id, changes) {
    setEquipment((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  async function run(id, action, onSuccess, message) {
    setBusyId(id)
    try {
      const result = await action()
      if (result?.success) {
        onSuccess()
        toast.success(message)
      } else {
        toast.error(result?.error || 'Nie udało się zapisać zmiany.')
      }
    } catch {
      toast.error('Nie udało się zapisać zmiany. Spróbuj ponownie.')
    } finally {
      setBusyId(null)
    }
  }

  const changeStatus = (item, status) => run(
    item.id,
    () => updateEquipmentStatus(item.id, status),
    () => patch(item.id, { status }),
    `„${item.name}”: ${EQUIPMENT_STATUS[status]?.label.toLowerCase() || status}`,
  )

  const toggleFeatured = (item) => {
    const featured = !(item.priority > 1)
    return run(
      item.id,
      () => setEquipmentFeatured(item.id, featured),
      () => patch(item.id, { priority: featured ? 2 : 1 }),
      featured ? 'Dodano do polecanych' : 'Usunięto z polecanych',
    )
  }

  const remove = (item) => {
    if (!confirm(`Usunąć ogłoszenie „${item.name}”? Tej operacji nie można cofnąć. Jeśli chcesz tylko zdjąć je ze strony, wybierz status „Ukryte przez administratora”.`)) return
    return run(
      item.id,
      () => adminDeleteRecord('equipment', item.id),
      () => setEquipment((items) => items.filter((entry) => entry.id !== item.id)),
      'Ogłoszenie usunięte',
    )
  }

  return (
    <div className="space-y-4">
      {companyFilter && (
        <p className="listing-panel flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>Pokazujesz ogłoszenia firmy <strong>{scoped[0]?.companies?.name || 'wybranej firmy'}</strong>.</span>
          <Link href="/admin/equipment" className="font-semibold text-brand-700 hover:underline dark:text-amber-300">Pokaż wszystkie</Link>
        </p>
      )}

      <nav ref={tabsRef} aria-label="Filtruj ogłoszenia według statusu" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map(({ key, label, match }) => {
          const count = scoped.filter(match).length
          if (!count && key && key !== tab && key !== 'pending') return null
          const active = key === tab
          return (
            <button key={key || 'all'} type="button" onClick={() => chooseTab(key)} aria-pressed={active} className={filterTabClass(active)}>
              {label} <span className={countBadgeClass(active)}>{count}</span>
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Szukaj ogłoszenia</span>
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE) }}
            onBlur={() => syncUrl(tab, query)}
            placeholder="Nazwa, firma, miejscowość…"
            className="min-h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Kategoria</span>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setVisible(PAGE_SIZE) }} className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground">
            <option value="">Wszystkie kategorie</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </div>

      <p className="text-sm text-muted" aria-live="polite">Wyników: <strong className="text-foreground">{filtered.length}</strong></p>

      {filtered.length === 0 ? (
        <div className="listing-panel text-center">
          <PackageOpen size={28} className="mx-auto text-muted" aria-hidden="true" />
          <p className="mt-2 font-bold">{tab === 'pending' && !needle && !category ? 'Nic nie czeka na moderację' : 'Brak ogłoszeń dla tych filtrów'}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {filtered.slice(0, visible).map((item) => {
            const status = EQUIPMENT_STATUS[item.status] || { label: item.status, style: 'bg-background text-foreground' }
            const published = PUBLISHED.has(item.status)
            const featured = item.priority > 1
            const busy = busyId === item.id
            const categoryName = item.equipment_categories?.name || item.category
            return (
              <li key={item.id} className={`flex items-start gap-3 p-3 sm:gap-4 sm:p-4 ${busy ? 'opacity-60' : ''}`} aria-busy={busy}>
                <div className="relative h-[4.5rem] w-16 shrink-0 overflow-hidden rounded-lg bg-background sm:h-20 sm:w-28">
                  <ListingImage src={item.image_url} alt="" title={item.name} category={categoryName} sizes="112px" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <Link href={`/admin/equipment/${item.id}/edit`} className="break-words font-bold text-foreground hover:underline">{item.name}</Link>
                    <span className="text-sm font-semibold text-foreground">
                      {priceText({ priceType: item.price_type, priceAmount: item.price_amount, Czas: RENTAL_PERIODS[item.rental_period] })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {item.companies?.name || 'Bez firmy'}
                    {item.company_branches?.city ? ` · ${item.company_branches.city}` : ''}
                    {categoryName ? ` · ${categoryName}` : ''}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className={`rounded px-2 py-1 font-semibold ${status.style}`}>{status.label}</span>
                    {featured && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200"><Star size={12} className="fill-current" aria-hidden="true" /> Polecane</span>}
                    {item.companies && !item.companies.verified_at && <span className="rounded border border-border px-2 py-1">Firma niezweryfikowana</span>}
                    <span>Dodano {dateOnly.format(new Date(item.created_at))}</span>
                    {item.last_confirmed_at && <span>· potwierdzono {dateOnly.format(new Date(item.last_confirmed_at))}</span>}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {item.status === 'pending' && (
                      <>
                        <button type="button" disabled={busy} onClick={() => changeStatus(item, 'active')} className="market-action min-h-11 px-3">
                          <Check size={16} aria-hidden="true" /> Zatwierdź
                        </button>
                        <button type="button" disabled={busy} onClick={() => changeStatus(item, 'rejected')} className={`${secondaryButtonClass} text-red-700 dark:text-red-300`}>
                          <X size={16} aria-hidden="true" /> Odrzuć
                        </button>
                      </>
                    )}
                    <label className="sr-only" htmlFor={`status-${item.id}`}>Status ogłoszenia {item.name}</label>
                    <select
                      id={`status-${item.id}`}
                      value={item.status}
                      disabled={busy}
                      onChange={(event) => changeStatus(item, event.target.value)}
                      className="min-h-11 max-w-[14rem] rounded-lg border border-border bg-background px-2 text-sm font-semibold text-foreground"
                    >
                      {Object.entries(EQUIPMENT_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button
                      type="button"
                      disabled={busy || (!published && !featured)}
                      onClick={() => toggleFeatured(item)}
                      aria-pressed={featured}
                      title={featured ? 'Usuń z polecanych' : published ? 'Dodaj do polecanych' : 'Polecać można tylko opublikowane ogłoszenia'}
                      className={`${iconButton} ${featured ? 'text-amber-600 dark:text-amber-300' : ''}`}
                    >
                      <Star size={18} className={featured ? 'fill-current' : ''} aria-hidden="true" />
                      <span className="sr-only">{featured ? 'Usuń z polecanych' : 'Dodaj do polecanych'}</span>
                    </button>
                    <Link href={`/admin/equipment/${item.id}/edit`} className={iconButton} title="Edytuj">
                      <Edit2 size={18} aria-hidden="true" /><span className="sr-only">Edytuj {item.name}</span>
                    </Link>
                    {published && item.slug && (
                      <a href={`/oferta/${item.slug}`} target="_blank" rel="noopener" className={iconButton} title="Zobacz na stronie">
                        <ExternalLink size={18} aria-hidden="true" /><span className="sr-only">Zobacz {item.name} na stronie</span>
                      </a>
                    )}
                    <button type="button" disabled={busy} onClick={() => remove(item)} className={`${iconButton} hover:text-red-700 dark:hover:text-red-300`} title="Usuń">
                      <Trash2 size={18} aria-hidden="true" /><span className="sr-only">Usuń {item.name}</span>
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {filtered.length > visible && (
        <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className={`${secondaryButtonClass} w-full`}>
          Pokaż kolejne ({filtered.length - visible})
        </button>
      )}
    </div>
  )
}
