import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarClock, LayoutList, Receipt, Star } from 'lucide-react';
import { FEATURED_DAYS, FEATURED_PRICE_PLN, FEATURED_REMINDER_DAYS, SELLER, featuredSalesOpen } from '@/lib/site';

export const metadata = {
  title: 'Wyróżnienie ogłoszenia | wypozycz.online',
  description: `Wyróżnij ogłoszenie wynajmu sprzętu na ${FEATURED_DAYS} dni za ${FEATURED_PRICE_PLN} zł. Pasek „Polecane” na stronie głównej i w kategorii.`,
  alternates: { canonical: '/wyroznienie' },
};

const benefits = [
  { icon: Star, title: 'Pasek „Polecane”', text: 'Ogłoszenie pokazuje się w pasku polecanych na stronie głównej i nad wynikami w swojej kategorii, także gdy klient szuka w innym mieście.' },
  { icon: BadgeCheck, title: 'Oznaczenie na karcie', text: 'Karta oferty dostaje żółte oznaczenie „Polecane”, które odróżnia ją od pozostałych.' },
  { icon: LayoutList, title: 'Bez zmian w ofercie', text: 'Treść, cena i zapytania działają tak samo. Klienci kontaktują się z Tobą bezpośrednio, bez prowizji.' },
];

const steps = [
  'W panelu przy opublikowanym ogłoszeniu kliknij „Wyróżnij”.',
  'W ciągu 1 dnia roboczego wyślemy fakturę z danymi do przelewu.',
  'Po zaksięgowaniu wpłaty włączymy wyróżnienie i potwierdzimy to mailem.',
  `${FEATURED_REMINDER_DAYS} dni przed końcem przypomnimy o przedłużeniu. Wyróżnienie nie odnawia się samo.`,
];

export default function FeaturedOfferPage() {
  const open = featuredSalesOpen();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="rounded-xl bg-market-navy p-6 text-white sm:p-10">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-market-yellow"><Star size={18} fill="currentColor" aria-hidden="true" /> Dla wynajmujących</p>
        <h1 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">Wyróżnij ogłoszenie i pokaż je nad wynikami</h1>
        <p className="mt-4 text-4xl font-extrabold text-market-yellow">{FEATURED_PRICE_PLN} zł <span className="text-base font-semibold text-slate-200">za {FEATURED_DAYS} dni, za jedno ogłoszenie</span></p>
        <p className="mt-1 text-sm text-slate-300">{SELLER.vatExempt ? 'Cena końcowa: sprzedawca jest zwolniony z VAT, faktura bez VAT.' : 'Cena brutto, z VAT.'}</p>
        {open ? (
          <Link href="/dashboard/ogloszenia" className="market-action mt-5">Wyróżnij w panelu <ArrowRight size={17} aria-hidden="true" /></Link>
        ) : (
          <p className="mt-5 text-sm font-semibold text-slate-200">Wyróżnienia uruchomimy wkrótce.</p>
        )}
      </header>

      <ul className="grid gap-3 md:grid-cols-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <li key={title} className="listing-panel">
            <Icon className="mb-2 text-brand-600 dark:text-brand-400" size={22} aria-hidden="true" />
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>

      <section className="listing-panel">
        <h2 className="flex items-center gap-2 font-bold"><Receipt size={20} className="text-brand-600 dark:text-brand-400" aria-hidden="true" /> Jak to działa</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <CalendarClock size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          Przedłużenie przed końcem okresu dolicza kolejne {FEATURED_DAYS} dni do obecnej daty końca. Zasady opisuje <Link href="/regulamin" className="font-semibold underline">regulamin (§7)</Link>.
        </p>
      </section>
    </div>
  );
}
