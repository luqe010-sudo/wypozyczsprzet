'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ListingCard from './ListingCard';

const arrowClass = 'grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm hover:bg-background disabled:cursor-default disabled:opacity-40';

/** Horizontally scrolled strip of featured offers, shown above the regular list. */
export default function FeaturedListings({ listings, rentalQuery = '', className = '' }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const syncEdges = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    setEdges({
      start: element.scrollLeft <= 8,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8,
    });
  }, []);

  const count = listings.length;
  useEffect(() => {
    const element = scroller.current;
    if (!element) return undefined;
    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(element);
    return () => observer.disconnect();
  }, [syncEdges, count]);

  if (count === 0) return null;

  const move = (direction) => {
    const element = scroller.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section aria-labelledby="featured-heading" className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="featured-heading" className="market-heading flex items-center gap-2">
          <Star size={20} fill="currentColor" className="shrink-0 text-amber-500" aria-hidden="true" /> Polecane ogłoszenia
        </h2>
        {!(edges.start && edges.end) && (
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => move(-1)} disabled={edges.start} aria-label="Poprzednie polecane ogłoszenia" className={arrowClass}>
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} disabled={edges.end} aria-label="Następne polecane ogłoszenia" className={arrowClass}>
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ul ref={scroller} onScroll={syncEdges} data-no-tab-swipe className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:gap-4">
        {listings.map((listing) => (
          <li key={listing.ID_sprzetu} className="w-[82%] max-w-[20rem] shrink-0 snap-start sm:w-72 lg:w-[19.5rem]">
            <ListingCard listing={listing} rentalQuery={rentalQuery} />
          </li>
        ))}
      </ul>
    </section>
  );
}
