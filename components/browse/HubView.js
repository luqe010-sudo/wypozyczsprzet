import Link from 'next/link';
import BrowseListings from './BrowseListings';
import ListingCard from '../ListingCard';
import CompanyListCard from '../directory/CompanyListCard';
import HubSummary from './HubSummary';

/** Shared layout of category, region and city landing pages. Everything but the filters is server-rendered. */
export default function HubView({
  title,
  intro,
  breadcrumbs = [],
  listings,
  allCities,
  lockCategory = false,
  lockCity = false,
  fixedSubcategories = null,
  nearby = [],
  nearbyLabel = '',
  companies = [],
  linkGroups = [],
  resultsHeading,
  emptyHint,
  summary = null,
  summaryRowsHeading,
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-8">
      <nav aria-label="Ścieżka" data-no-tab-swipe className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        <Link href="/" className="hover:underline">Strona główna</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.label} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {crumb.href ? <Link href={crumb.href} className="hover:underline">{crumb.label}</Link> : <span>{crumb.label}</span>}
          </span>
        ))}
      </nav>

      <header className="mb-5">
        <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">{title}</h1>
        {intro && <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">{intro}</p>}
      </header>

      <BrowseListings
        listings={listings}
        allCities={allCities}
        lockCategory={lockCategory}
        lockCity={lockCity}
        fixedSubcategories={fixedSubcategories}
        heading={resultsHeading}
        emptyHint={emptyHint}
      />

      {summary && <HubSummary content={summary} rowsHeading={summaryRowsHeading} />}

      {nearby.length > 0 && (
        <section className="mt-10" aria-labelledby="nearby-heading">
          <h2 id="nearby-heading" className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{nearbyLabel}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {nearby.map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} />)}
          </div>
        </section>
      )}

      {companies.length > 0 && (
        <section className="mt-10" aria-labelledby="companies-heading">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="companies-heading" className="text-lg font-semibold text-slate-900 dark:text-white">Wypożyczalnie w okolicy</h2>
            <Link href="/katalog" className="flex-shrink-0 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Cały katalog</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => <CompanyListCard key={company.id} company={company} />)}
          </div>
        </section>
      )}

      {linkGroups.filter((group) => group.links.length > 0).map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{group.title}</h2>
          <ul className="flex flex-wrap gap-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
