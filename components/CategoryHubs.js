import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { MARKET_CATEGORIES, capitalize, subcategoryHref } from '../lib/categories';
import { offersLabel } from '../lib/format';
import { CategoryIcon } from './icons/CategoryIcons';

// Enough to show what a category holds; the category page lists the rest.
const SUBCATEGORY_LIMIT = 4;

function CategoryArt({ category }) {
  if (category.art == null) {
    return (
      <span className="flex h-[50px] w-[38px] items-center justify-center text-market-navy dark:text-slate-200">
        <CategoryIcon category={category.value} size={30} />
      </span>
    );
  }
  const { art } = category;
  return <span aria-hidden="true" className="market-category-art block h-[50px] w-[38px]" style={{ backgroundPosition: `${art % 4 / 3 * 100}% ${art < 4 ? '0%' : '100%'}` }} />;
}

/** A category with its busiest subcategories and their offer counts. */
function CategoryCard({ category, listings }) {
  const items = listings.filter((listing) => listing.seoCategory === category.hub);
  const subcategories = category.filters
    .map((filter) => ({ ...filter, count: items.filter((listing) => listing.subcategory === filter.value).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-3 shadow-sm">
      <Link href={`/${category.hub}`} className="group flex items-center gap-3 rounded-lg">
        <span className="shrink-0 overflow-hidden rounded-md bg-[#ebf0f5] dark:bg-slate-700">
          <CategoryArt category={category} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight text-foreground group-hover:underline">{category.label}</span>
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">{offersLabel(items.length)}</span>
        </span>
      </Link>
      {subcategories.length > 0 && (
        <ul className="mt-2 grow text-sm">
          {subcategories.slice(0, SUBCATEGORY_LIMIT).map(({ value, label, count }) => (
            <li key={value}>
              <Link href={subcategoryHref(category.hub, value)} className="flex min-h-9 items-center justify-between gap-2 rounded px-1 text-brand-600 hover:bg-brand-50 hover:underline dark:text-brand-400 dark:hover:bg-slate-800">
                <span className="truncate">{capitalize(label)}</span>
                <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href={`/${category.hub}`} className="mt-1 inline-flex min-h-9 items-center gap-1 px-1 text-xs font-semibold text-foreground hover:underline">
        {subcategories.length > SUBCATEGORY_LIMIT ? `Pokaż wszystkie (${subcategories.length} rodzajów)` : 'Zobacz kategorię'} <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </article>
  );
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
      <div data-no-tab-swipe className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3">
        {MARKET_CATEGORIES.map((category) => <CategoryCard key={category.value} category={category} listings={listings} />)}
      </div>
    </section>
  );
}
