'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import CompanyListCard from '../../components/directory/CompanyListCard';
import { plural } from '../../lib/format';

const RESULT_LIMIT = 24;

/** Company search over the whole catalog. Results appear only while searching; city pages list the rest. */
export default function CatalogClient({ companies = [] }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return companies.filter((company) => (
      company.name?.toLowerCase().includes(query)
      || company.category?.toLowerCase().includes(query)
      || company.branches?.some((branch) => branch.city?.toLowerCase().includes(query))
    ));
  }, [companies, query]);

  return (
    <section aria-label="Szukaj w katalogu" className="mb-10">
      <div className="relative mx-auto max-w-2xl">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id="catalog-search"
          type="search"
          placeholder="Szukaj firmy, miejscowości lub kategorii…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {query.length >= 2 && (
        <div className="mt-6">
          <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
            {results.length === 0
              ? 'Nie znaleziono firm. Spróbuj innej nazwy lub wybierz miejscowość poniżej.'
              : `${results.length} ${plural(results.length, 'firma', 'firmy', 'firm')}`
                + (results.length > RESULT_LIMIT ? `, pokazujemy pierwsze ${RESULT_LIMIT}. Zawęź wyszukiwanie.` : '')}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, RESULT_LIMIT).map((company) => <CompanyListCard key={company.id} company={company} />)}
          </div>
        </div>
      )}
    </section>
  );
}
