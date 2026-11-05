import Link from 'next/link';
import { MapPin, ShieldCheck, Truck, UserRound } from 'lucide-react';
import ListingImage from './listing/ListingImage';
import FavoriteButton from './FavoriteButton';
import { priceText } from '../lib/format';

export default function ListingCard({ listing, layout = 'grid', rentalQuery = '' }) {
  const href = `/${listing.seoCategory}/${listing.citySlug}/${listing.slug}${rentalQuery}`;
  const name = listing['Sprzęt'];
  const hasFixedPrice = listing.priceType === 'fixed';
  const isGrid = layout === 'grid';
  const isCompact = layout === 'compact';
  const isRow = layout === 'row';
  const imageClass = isGrid
    ? 'aspect-[16/10] w-full'
    : isCompact ? 'w-24' : 'w-[35%] sm:w-36 lg:w-44';
  const imageSizes = isGrid
    ? '(max-width: 639px) 100vw, (max-width: 1200px) 50vw, 300px'
    : isCompact ? '96px' : '(max-width: 640px) 35vw, 176px';

  return (
    <article className={`group relative flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-amber-500 hover:shadow-md focus-within:ring-2 focus-within:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-400 ${isGrid ? 'h-full flex-col' : ''}`}>
      <div className={`relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700 ${imageClass}`}>
        <ListingImage
          src={listing.Zdjecie}
          alt={`${name} na wynajem, ${listing.Miasto}`}
          title={name}
          category={listing.Kategoria}
          sizes={imageSizes}
        />
        {isGrid && (
          <p className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-slate-950 to-transparent px-3 pb-2 pt-6 text-xs font-medium text-white">
            <MapPin size={13} className="shrink-0 text-amber-400" aria-hidden="true" />
            <span className="truncate">{listing.Miasto}</span>
          </p>
        )}
      </div>

      {!isCompact && (
        <FavoriteButton id={listing.ID_sprzetu} className="absolute right-2 top-2 z-10" />
      )}

      <div className={`flex min-w-0 flex-1 flex-col gap-1.5 p-3 ${isRow ? 'pr-14 sm:py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-5' : ''}`}>
        <h3 className={`text-sm font-bold leading-snug text-slate-900 dark:text-white ${isCompact ? '' : 'sm:text-base'} ${isRow ? 'lg:col-start-1' : ''}`}>
          <Link href={href} className="after:absolute after:inset-0 hover:underline">
            <span className="line-clamp-2">{name}</span>
          </Link>
        </h3>

        {(!isGrid || listing._distance != null) && (
          <p className={`flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-400 ${isRow ? 'lg:col-start-1' : ''}`}>
            {!isGrid && <><MapPin size={13} className="shrink-0" aria-hidden="true" /><span className="truncate">{listing.Miasto}</span></>}
            {listing._distance != null && <span>ok. {listing._distance} km</span>}
          </p>
        )}

        <p className={`${hasFixedPrice
          ? 'text-base font-bold text-slate-900 dark:text-white'
          : 'text-sm font-medium text-slate-600 dark:text-slate-300'} ${isRow ? 'lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center lg:text-right' : ''}`}
        >
          {priceText(listing)}
        </p>

        {!isCompact && listing['Dostępność'] && listing['Dostępność'] !== 'brak danych' && (
          <p className={`flex items-center gap-1.5 text-xs font-medium ${listing.availability === 'immediately' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'} ${isRow ? 'lg:col-start-1' : ''}`}>
            <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
            {listing['Dostępność']}
          </p>
        )}

        {!isCompact && (listing.deliveryAvailable || listing.withOperator || listing.isVerified) && (
          <ul className={`mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-slate-600 dark:text-slate-400 ${isRow ? 'lg:col-start-1' : ''}`}>
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
