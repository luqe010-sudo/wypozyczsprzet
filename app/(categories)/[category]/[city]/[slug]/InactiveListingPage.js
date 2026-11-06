import Link from 'next/link';
import ListingCard from '../../../../../components/ListingCard';
import { SEO_CATEGORIES } from '../../../../../lib/categories';

export default function InactiveListingPage({ suggestions = [], category }) {
  const categoryInfo = SEO_CATEGORIES[category];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">To ogłoszenie jest już nieaktywne</h1>
        <p className="mx-auto mb-6 max-w-lg text-slate-600 dark:text-slate-400">
          Wynajmujący wyłączył je albo sprzęt nie jest już dostępny. Sprawdź podobne oferty poniżej.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {categoryInfo && (
            <Link href={`/${category}`} className="flex h-11 items-center rounded-lg bg-market-yellow px-5 text-sm font-semibold text-market-navy hover:bg-amber-300">
              {categoryInfo.name}: wszystkie oferty
            </Link>
          )}
          <Link href="/" className="flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-800 dark:border-slate-600 dark:text-slate-200">
            Strona główna
          </Link>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section aria-labelledby="suggestions-heading">
          <h2 id="suggestions-heading" className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Podobne oferty</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {suggestions.map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} />)}
          </div>
        </section>
      )}
    </div>
  );
}
