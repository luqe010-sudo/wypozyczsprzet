import BrowseListings from '../../components/browse/BrowseListings';
import { fetchMarketplaceData, toCard } from '../../lib/listings';
import { geocodeSearchCity } from '../../lib/geocoding';
import { listingCityCenter, readSearchFilters, readSearchView } from '../../lib/search';

export const revalidate = 3600;
export const metadata = {
  title: 'Szukaj sprzętu na wynajem',
  description: 'Znajdź sprzęt na wynajem w swojej okolicy. Porównaj stawki, sprawdź dostawę i skontaktuj się z wynajmującym.',
  alternates: { canonical: '/szukaj' },
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }) {
  const [{ listings, filters }, params] = await Promise.all([fetchMarketplaceData(), searchParams]);
  const initialFilters = readSearchFilters(params);
  const city = initialFilters.city;
  const cityCenter = city ? (listingCityCenter(listings, city) || await geocodeSearchCity(city)) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
      <header className="sr-only sm:not-sr-only sm:mb-6">
        <h1 className="market-heading text-2xl sm:text-3xl">Szukaj sprzętu na wynajem</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">Porównaj oferty w okolicy i zapytaj wynajmującego o termin.</p>
      </header>
      <BrowseListings
        listings={listings.map(toCard)}
        allCities={filters.cities}
        initialFilters={initialFilters}
        initialView={readSearchView(params)}
        cityCenter={cityCenter}
        splitMap
      />
    </div>
  );
}
