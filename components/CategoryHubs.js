import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MARKET_CATEGORIES, matchesMarketCategory } from '../lib/categories';
import { offersLabel } from '../lib/format';

export default function CategoryHubs({ listings }) {
  return (
    <section id="kategorie" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-6 sm:px-6 lg:pt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4">
        <h2 className="market-heading">Popularne kategorie</h2>
        <Link href="/szukaj" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground hover:underline">
          Zobacz wszystkie oferty <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
        {MARKET_CATEGORIES.map(({ value, label, hub }, index) => (
          <Link key={value} href={`/${hub}`} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-center shadow-sm transition hover:border-brand-500 hover:shadow-md">
            <div className="grid place-items-center overflow-hidden bg-[#ebf0f5]">
              <span aria-hidden="true" className="market-category-art h-[76px] w-[66px] sm:h-[96px] sm:w-[86px]" style={{ backgroundPosition: `${index % 4 / 3 * 100}% ${index < 4 ? '0%' : '100%'}` }} />
            </div>
            <div className="flex flex-1 flex-col px-1.5 py-2 sm:px-2">
              <h3 className="flex-1 text-xs font-bold leading-tight text-foreground sm:text-sm">{label}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{offersLabel(listings.filter((item) => matchesMarketCategory(item, value)).length)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
