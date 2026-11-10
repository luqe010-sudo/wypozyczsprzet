import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { MIN_COMPANIES_FOR_INDEXING, fetchAllCompanies, getCatalogCities } from '../../lib/supabaseDirectory';
import { plural } from '../../lib/format';
import { SITE_NAME, SITE_URL } from '../../lib/site';
import CatalogClient from './CatalogClient';
import DirectoryBreadcrumbs from '../../components/directory/DirectoryBreadcrumbs';

export const revalidate = 3600;

export const metadata = {
  title: `Wypożyczalnie sprzętu budowlanego – katalog firm według miast | ${SITE_NAME}`,
  description:
    'Katalog wypożyczalni sprzętu budowlanego: adresy, telefony i oddziały firm. Wybierz miejscowość albo wyszukaj firmę po nazwie.',
  alternates: { canonical: '/katalog' },
  openGraph: {
    title: 'Katalog wypożyczalni sprzętu budowlanego',
    description: 'Wypożyczalnie sprzętu budowlanego według miejscowości.',
    images: [{ url: '/header.png', width: 1200, height: 630, alt: `Katalog firm – ${SITE_NAME}` }],
    type: 'website',
  },
};

const companiesLabel = (count) => `${count} ${plural(count, 'firma', 'firmy', 'firm')}`;

// The search box needs only these fields; the full list lives on the city pages.
const toSearchCard = (company) => ({
  id: company.id,
  name: company.name,
  slug: company.slug,
  category: company.category,
  logo_url: company.logo_url,
  rating: company.rating,
  review_count: company.review_count,
  branches: company.branches.map((branch) => ({ city: branch.city })),
});

const chip = 'inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

export default async function CatalogPage() {
  const [companies, cities] = await Promise.all([fetchAllCompanies(), getCatalogCities()]);
  const mainCities = cities.filter((city) => city.count >= MIN_COMPANIES_FOR_INDEXING);
  const smallCities = cities
    .filter((city) => city.count < MIN_COMPANIES_FOR_INDEXING)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Wypożyczalnie sprzętu budowlanego według miejscowości',
    numberOfItems: mainCities.length,
    itemListElement: mainCities.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `Wypożyczalnie sprzętu budowlanego – ${city.name}`,
      url: `${SITE_URL}/katalog/${city.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-10">
        <DirectoryBreadcrumbs items={[]} />

        <header className="mb-8 mt-2 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Building2 size={14} aria-hidden="true" />
            Katalog firm
          </div>
          <h1 className="mb-4 text-3xl font-black leading-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            Wypożyczalnie <span className="text-market-yellow">sprzętu budowlanego</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400 md:text-lg">
            {companiesLabel(companies.length)} z danymi kontaktowymi z publicznych rejestrów i wizytówek.
            Wybierz miejscowość albo wyszukaj firmę po nazwie.
          </p>
        </header>

        <CatalogClient companies={companies.map(toSearchCard)} />

        <section aria-labelledby="catalog-cities" className="mb-10">
          <h2 id="catalog-cities" className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Miejscowości z największą liczbą wypożyczalni</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mainCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/katalog/${city.slug}`}
                  className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{city.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{companiesLabel(city.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {smallCities.length > 0 && (
          <section aria-labelledby="catalog-small-cities">
            <h2 id="catalog-small-cities" className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Pozostałe miejscowości</h2>
            <ul className="flex flex-wrap gap-2">
              {smallCities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/katalog/${city.slug}`} className={chip}>{city.name} ({city.count})</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
