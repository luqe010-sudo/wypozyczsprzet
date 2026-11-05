import Link from 'next/link';
import { SEO_CATEGORIES } from '../lib/categories';
import { offersLabel } from '../lib/format';

export default function CategoryHubs({ categoryCounts = {} }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Kategorie sprzętu</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Object.values(SEO_CATEGORIES).map((category) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white">{category.name}</h3>
            {categoryCounts[category.slug] !== undefined && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{offersLabel(categoryCounts[category.slug])}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
