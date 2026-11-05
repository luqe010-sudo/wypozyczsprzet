import Link from 'next/link';
import { MapPin, ShieldCheck, Truck, UserRound } from 'lucide-react';
import ListingImage from './listing/ListingImage';
import { priceText } from '../lib/format';

export default function ListingCard({ listing }) {
  const href = `/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`;
  const name = listing['Sprzęt'];
  const hasFixedPrice = listing.priceType === 'fixed';

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500">
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-700">
        <ListingImage
          src={listing.Zdjecie}
          alt={`${name} na wynajem, ${listing.Miasto}`}
          title={name}
          category={listing.Kategoria}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {listing._distance != null && (
          <span className="absolute right-2 top-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
            ok. {listing._distance} km
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
          <Link href={href} className="after:absolute after:inset-0 hover:underline">
            {name}
          </Link>
        </h3>

        <p className={hasFixedPrice
          ? 'text-base font-bold text-slate-900 dark:text-white'
          : 'text-sm font-medium text-slate-600 dark:text-slate-300'}
        >
          {priceText(listing)}
        </p>

        <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{listing.Miasto}</span>
        </p>

        {(listing.deliveryAvailable || listing.withOperator || listing.isVerified) && (
          <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-slate-600 dark:text-slate-400">
            {listing.deliveryAvailable && (
              <li className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" aria-hidden="true" />Dostawa</li>
            )}
            {listing.withOperator && (
              <li className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" aria-hidden="true" />Operator</li>
            )}
            {listing.isVerified && (
              <li className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Zweryfikowana</li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
