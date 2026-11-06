'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ListingCard from './ListingCard';

const PAGE_SIZE = 12;
const buttonClass = 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

/** Newest offers on the home page; the button reveals more in place, then hands over to the full search. */
export default function LatestListings({ listings }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
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
  );
}
