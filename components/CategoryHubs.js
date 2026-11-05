import Link from 'next/link';
import { ArrowRight, Cable, Construction, Drill, Sprout, Tractor } from 'lucide-react';
import { SEO_CATEGORIES } from '../lib/categories';
import { offersLabel } from '../lib/format';

const categoryIcons = {
  'roboty-ziemne': Tractor,
  'sprzet-ogrodowy': Sprout,
  'agregaty-i-zasilanie': Cable,
  'prace-na-wysokosci': Construction,
  narzedzia: Drill,
};

export default function CategoryHubs({ categoryCounts = {} }) {
  return (
    <section id="kategorie" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="market-heading">Kategorie sprzętu</h2>
        <a href="#oferty" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:underline dark:text-slate-300">
          Zobacz oferty <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {Object.values(SEO_CATEGORIES).map((category) => {
          const Icon = categoryIcons[category.slug];
          return (
            <Link key={category.slug} href={`/${category.slug}`} className="group flex min-w-0 flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-4 text-center transition hover:border-amber-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-400 sm:px-3">
              <span className="mb-2.5 grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-amber-200 dark:bg-slate-700 dark:text-amber-300 dark:group-hover:bg-amber-400/20">
                <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{category.name}</h3>
              {categoryCounts[category.slug] !== undefined && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{offersLabel(categoryCounts[category.slug])}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
