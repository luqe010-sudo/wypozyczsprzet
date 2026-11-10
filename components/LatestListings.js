'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, List, Map as MapIcon } from 'lucide-react';
import ListingCard from './ListingCard';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <MapMessage>Ładowanie mapy…</MapMessage>,
});

const PAGE_SIZE = 12;
const buttonClass = 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

// One download per visit: switching back to the map reuses the pins already fetched.
let mapPins = null;

function MapMessage({ children }) {
  return <p role="status" className="grid h-full place-items-center bg-slate-100 p-4 text-center text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{children}</p>;
}

/** The map and its pins load only when someone opens it; the pins come from a file the CDN rebuilds daily. */
function OffersMap() {
  const [pins, setPins] = useState(mapPins);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (mapPins) return undefined;
    const controller = new AbortController();
    fetch('/api/map-listings', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        mapPins = data.listings;
        setPins(mapPins);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div data-no-tab-swipe className="relative h-[60dvh] min-h-[20rem] overflow-hidden rounded-xl border border-border bg-card lg:h-[34rem]">
      {failed ? <MapMessage>Nie udało się wczytać mapy. Oferty znajdziesz na liście.</MapMessage>
        : pins ? <MapComponent listings={pins} selectedId={selectedId} onSelect={setSelectedId} />
          : <MapMessage>Ładowanie mapy…</MapMessage>}
    </div>
  );
}

/** Newest offers on the home page, with an optional map; "Pokaż więcej" reveals more in place, then hands over to the full search. */
export default function LatestListings({ listings }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [view, setView] = useState('list');

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 id="home-offers" className="market-heading">{view === 'map' ? 'Ogłoszenia na mapie' : 'Najnowsze ogłoszenia'}</h2>
        <div className="flex items-center gap-4">
          <Link href="/szukaj" className="hidden min-h-11 items-center gap-2 text-sm font-semibold hover:underline sm:inline-flex">
            Zobacz wszystkie oferty <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800" aria-label="Widok ogłoszeń" role="group">
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className="market-view-button">
              <List size={16} aria-hidden="true" /><span>Lista</span>
            </button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')} className="market-view-button">
              <MapIcon size={16} aria-hidden="true" /><span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? <OffersMap /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.slice(0, visible).map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} />)}
          </div>
          <div className="mt-6 text-center">
            {visible < listings.length ? (
              <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className={buttonClass}>Pokaż więcej</button>
            ) : (
              <Link href="/szukaj" className={buttonClass}>Zobacz wszystkie oferty <ArrowRight size={16} aria-hidden="true" /></Link>
            )}
          </div>
        </>
      )}
    </>
  );
}
