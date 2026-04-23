import ListingCard from './ListingCard';

export default function ListingGrid({ listings }) {
  return (
    <div className="listings-grid">
      {listings.map(listing => (
        <ListingCard key={listing.ID_sprzetu} listing={listing} />
      ))}
    </div>
  );
}
