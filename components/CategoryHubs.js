import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { MARKET_CATEGORIES, matchesMarketCategory } from '../lib/categories';
import { offersLabel } from '../lib/format';

/** Category links with offer counts; `skip` leaves out categories the surrounding UI already offers. */
export function CategoryTiles({ listings, skip = [] }) {
  return MARKET_CATEGORIES.map(({ value, label, hub }, index) => !skip.includes(value) && (
    <Link key={value} href={`/${hub}`} className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm transition hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800">
      <div className="shrink-0 overflow-hidden rounded-md bg-[#ebf0f5]">
        <span aria-hidden="true" className="market-category-art block h-[50px] w-[38px]" style={{ backgroundPosition: `${index % 4 / 3 * 100}% ${index < 4 ? '0%' : '100%'}` }} />
      </div>
      <div>
        <p className="text-xs font-bold leading-tight text-foreground">{label}</p>
        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">{offersLabel(listings.filter((item) => matchesMarketCategory(item, value)).length)}</p>
      </div>
    </Link>
  ));
}

export default function CategoryHubs({ listings }) {
  return (
    <section id="kategorie" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-4 sm:px-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4">
        <h2 className="market-heading">Wszystkie kategorie</h2>
        <Link href="/szukaj" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground hover:underline">
          <LayoutGrid size={15} aria-hidden="true" /> Wszystkie oferty <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div data-no-tab-swipe className="grid auto-cols-[minmax(9rem,1fr)] grid-flow-col gap-2 overflow-x-auto px-1 pb-2 pt-1 sm:grid-flow-row sm:grid-cols-4 xl:grid-cols-8">
        <CategoryTiles listings={listings} />
      </div>
    </section>
  );
}
