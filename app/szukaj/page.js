import BrowseListings from '../../components/browse/BrowseListings';
import { fetchMarketplaceData, toCard } from '../../lib/listings';

export const revalidate = 3600;
export const metadata = {
  title: 'Szukaj sprzętu na wynajem | wypozycz.online',
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const { listings, filters } = await fetchMarketplaceData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="market-heading mb-4">Szukaj sprzętu</h1>
      <BrowseListings listings={listings.map(toCard)} allCities={filters.cities} splitMap />
    </div>
  );
}
