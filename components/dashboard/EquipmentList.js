import Link from 'next/link'
import { Edit, PackageOpen } from 'lucide-react'
import EquipmentRowActions from './EquipmentRowActions'
import ListingImage from '../listing/ListingImage'
import { formatDate, priceText } from '@/lib/format'

const statuses = {
  active: ['Opublikowane', 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'],
  incomplete: ['Opublikowane, niekompletne', 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'],
  pending: ['Czeka na moderację', 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'],
  inactive: ['Wstrzymane', 'bg-background text-foreground'],
  stale: ['Ukryte: potwierdź aktualność', 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'],
  hidden: ['Ukryte przez administratora', 'bg-background text-foreground'],
  rejected: ['Odrzucone', 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'],
}
const periods = { hour: 'godzina', day: 'doba', week: 'tydzień', month: 'miesiąc' }

export default function EquipmentList({ equipment = [], error = null, filtered = false }) {
  if (error) return <p role="alert" className="listing-panel text-sm text-red-800 dark:text-red-200">Nie udało się wczytać ogłoszeń. Spróbuj odświeżyć stronę.</p>

  if (!equipment.length) {
    return (
      <div className="listing-panel text-center">
        <PackageOpen size={28} className="mx-auto text-muted" aria-hidden="true" />
        <p className="mt-2 font-bold">Brak ogłoszeń</p>
        <p className="mt-1 text-sm text-muted">{filtered ? 'Brak ogłoszeń o wybranym statusie.' : 'Dodaj sprzęt, aby zacząć odbierać zapytania.'}</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {equipment.map((item) => {
        const [status, statusStyle] = statuses[item.status] || ['Status nieznany', 'bg-background text-foreground']
        return (
          <li key={item.id} className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
            <div className="relative h-[4.5rem] w-16 shrink-0 overflow-hidden rounded-lg bg-background sm:w-24">
              <ListingImage src={item.image_url} alt="" title={item.name} category={item.category} sizes="96px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words font-bold text-foreground">{item.name}</p>
              {item.companyName && <p className="mt-1 text-xs text-muted">{item.companyName}</p>}
              <p className="mt-1 text-sm font-semibold text-foreground">{priceText({ priceType: item.price_type, priceAmount: item.price_amount, Czas: periods[item.rental_period] })}</p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className={`rounded px-2 py-1 font-semibold ${statusStyle}`}>{status}</span>
                {item.last_confirmed_at && <span>Potwierdzono: {formatDate(item.last_confirmed_at)}</span>}
              </p>
              <div className="mt-2"><EquipmentRowActions id={item.id} companyId={item.company_id} status={item.status} /></div>
            </div>
            <Link href={`/dashboard/equipment/${item.id}/edit`} aria-label={`Edytuj ogłoszenie ${item.name}`} className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-muted hover:bg-background sm:px-3">
              <Edit size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Edytuj</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
