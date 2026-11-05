'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavorites } from '../FavoriteButton';
import ListingCard from '../ListingCard';

export default function SavedListings({ listings }) {
  const saved = useFavorites();

  if (saved === null) return <p role="status" className="text-sm text-muted">Wczytywanie zapisanych ofert…</p>;
  const active = listings.filter((listing) => saved.has(listing.ID_sprzetu));

  return active.length ? (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {active.map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} />)}
    </div>
  ) : (
    <section className="listing-panel text-center">
      <Heart size={24} className="mx-auto mb-3 text-muted" aria-hidden="true" />
      <h2 className="font-bold">{saved.size ? 'Zapisane ogłoszenia wygasły' : 'Nie masz jeszcze ulubionych ofert'}</h2>
      <p className="my-2 text-sm text-muted">Użyj serca przy ogłoszeniu, żeby zapisać je na później.</p>
      <Link href="/szukaj" className="market-action mt-2">Przeglądaj ogłoszenia</Link>
    </section>
  );
}
