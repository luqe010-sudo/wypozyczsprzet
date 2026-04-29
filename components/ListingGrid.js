import ListingCard from './ListingCard';

export default function ListingGrid({ listings }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
      {listings.map(listing => (
        <ListingCard key={listing.ID_sprzetu} listing={listing} />
      ))}
    </div>
  );
}
