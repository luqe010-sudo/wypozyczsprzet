import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MIN_COMPANIES_FOR_INDEXING, getCatalogCities, getCompaniesInCity } from '../../../lib/supabaseDirectory';
import { fetchMarketplaceData } from '../../../lib/listings';
import { categoryLinks } from '../../../lib/hubs';
import { offersLabel, plural } from '../../../lib/format';
import { SITE_NAME, SITE_URL } from '../../../lib/site';
import CompanyListCard from '../../../components/directory/CompanyListCard';
import DirectoryBreadcrumbs from '../../../components/directory/DirectoryBreadcrumbs';

export const revalidate = 3600;

// Rendered on first request, then cached until revalidated.
export function generateStaticParams() {
  return [];
}

const companiesLabel = (count) => `${count} ${plural(count, 'firma', 'firmy', 'firm')}`;

/** Only what the cards read is sent to the client component. */
const toCard = (company) => ({
  id: company.id,
  name: company.name,
  slug: company.slug,
  category: company.category,
  description: company.description ? company.description.slice(0, 220) : '',
  logo_url: company.logo_url,
  rating: company.rating,
  review_count: company.review_count,
  branches: company.branches.map((branch) => ({ city: branch.city })),
});

async function loadCity(slug) {
  const cities = await getCatalogCities();
  const city = cities.find((c) => c.slug === slug);
  if (!city) return null;
  return { city, cities, companies: await getCompaniesInCity(slug) };
}

export async function generateMetadata({ params }) {
  const { city: slug } = await params;
  const data = await loadCity(slug);
  if (!data) return {};
  const { city } = data;
  const title = `Wypożyczalnie sprzętu budowlanego ${city.name} – ${companiesLabel(city.count)} | ${SITE_NAME}`;
  const description = `${companiesLabel(city.count)} z oddziałem w miejscowości ${city.name}: adresy, telefony i strony wypożyczalni sprzętu budowlanego. Kontakt bezpośrednio z firmą.`;
  const url = `${SITE_URL}/katalog/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: city.count < MIN_COMPANIES_FOR_INDEXING ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: 'website' },
  };
}

export default async function CatalogCityPage({ params }) {
  const { city: slug } = await params;
  const data = await loadCity(slug);
  if (!data) notFound();
  const { city, cities, companies } = data;

  const { listings } = await fetchMarketplaceData();
  const localListings = listings.filter((listing) => listing.citySlug === slug);
  const offerLinks = localListings.length > 0 ? categoryLinks(localListings, { locationSlug: slug }) : [];
  const otherCities = cities.filter((c) => c.slug !== slug && c.count >= MIN_COMPANIES_FOR_INDEXING);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Wypożyczalnie sprzętu budowlanego – ${city.name}`,
    numberOfItems: companies.length,
    itemListElement: companies.slice(0, 50).map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: company.name,
      url: `${SITE_URL}/katalog/${slug}/${encodeURIComponent(company.slug)}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-10">
        <DirectoryBreadcrumbs items={[{ label: city.name }]} />

        <header className="mb-8">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">
            Wypożyczalnie sprzętu budowlanego – {city.name}
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
            {companiesLabel(city.count)} z oddziałem w tej miejscowości. Dane kontaktowe pochodzą z publicznych rejestrów i wizytówek firm.
            {localListings.length > 0 && ` W serwisie jest też ${offersLabel(localListings.length)} wynajmu z tej miejscowości.`}
          </p>
          {localListings.length > 0 && (
            <Link href={`/${slug}`} className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
              Zobacz oferty wynajmu: {city.name}
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => <CompanyListCard key={company.id} company={toCard(company)} />)}
        </div>

        {offerLinks.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Oferty wynajmu w tej miejscowości</h2>
            <ul className="flex flex-wrap gap-2">
              {offerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherCities.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Wypożyczalnie w innych miejscowościach</h2>
            <ul className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/katalog/${c.slug}`} className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {c.name} ({c.count})
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
