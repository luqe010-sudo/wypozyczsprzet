import SavedListings from '../../components/browse/SavedListings';
import { fetchMarketplaceData, toCard } from '../../lib/listings';

export const metadata = {
  title: 'Ulubione oferty | wypozycz.online',
  robots: { index: false, follow: true },
};

export default async function FavoritesPage() {
  const { listings } = await fetchMarketplaceData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="market-heading">Ulubione</h1>
      <p className="mb-5 mt-2 text-sm text-muted">Oferty zapisane w tej przeglądarce.</p>
      <SavedListings listings={listings.map(toCard)} />
    </div>
  );
}
