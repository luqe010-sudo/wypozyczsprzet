import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Star, Truck, UserRound } from 'lucide-react';
import ListingImage from './listing/ListingImage';
import FavoriteButton from './FavoriteButton';
import { priceText } from '../lib/format';

/** Imported offers have no declaration from the company, so only an owner's own statement earns "Dostępny". */
function availabilityBadge(listing) {
  if (listing.isClaimed && listing.availability === 'immediately') return { label: 'Dostępny', dot: 'bg-emerald-600' };
  if (listing.availability === 'on_call') return { label: 'Na telefon', dot: 'bg-amber-500' };
  return null;
}

const badgeClass = 'inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-market-navy shadow-sm';

function Location({ listing }) {
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300">
      <MapPin size={14} className="shrink-0" aria-hidden="true" />
      <span>{listing.Miasto}</span>
      {listing._distance > 0 && <span>· {listing._distance} km</span>}
    </p>
  );
}

function Price({ listing }) {
  const hasFixedPrice = listing.priceType === 'fixed' && listing.priceAmount != null;
  return (
    <p className={`shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-sm ${hasFixedPrice
      ? 'bg-brand-100 font-extrabold text-market-navy dark:bg-market-yellow'
      : 'bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
      {priceText(listing)}
    </p>
  );
}

export default function ListingCard({ listing, layout = 'grid', rentalQuery = '' }) {
  const href = `/${listing.seoCategory}/${listing.citySlug}/${listing.slug}${rentalQuery}`;
  const name = listing['Sprzęt'];
  const isCompact = layout === 'compact';
  const badge = availabilityBadge(listing);

  if (isCompact) {
    return (
      <article className="group relative flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500">
        <div className="relative w-24 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700">
          <ListingImage src={listing.Zdjecie} alt={`${name} na wynajem, ${listing.Miasto}`} title={name} category={listing.Kategoria} sizes="96px" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
          <h3 className="text-sm font-bold leading-snug text-foreground">
            <Link href={href} className="after:absolute after:inset-0 hover:underline"><span className="line-clamp-2">{name}</span></Link>
          </h3>
          <Location listing={listing} />
          <div className="flex"><Price listing={listing} /></div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-amber-500 hover:shadow-md focus-within:ring-2 focus-within:ring-amber-500 dark:hover:border-amber-400">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700">
        <ListingImage
          src={listing.Zdjecie}
          alt={`${name} na wynajem, ${listing.Miasto}`}
          title={name}
          category={listing.Kategoria}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
        />
        {(listing.isFeatured || badge) && (
          <div className="absolute left-2 right-14 top-2 flex flex-wrap gap-1.5">
            {listing.isFeatured && (
              <span className={`${badgeClass} !bg-market-yellow`}><Star size={12} fill="currentColor" aria-hidden="true" />Polecane</span>
            )}
            {badge && (
              <span className={badgeClass}><span className={`size-2 rounded-full ${badge.dot}`} aria-hidden="true" />{badge.label}</span>
            )}
          </div>
        )}
      </div>

      <FavoriteButton id={listing.ID_sprzetu} className="absolute right-2 top-2 z-10" />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5">
        <h3 className="text-[15px] font-bold leading-snug text-foreground sm:text-base">
          <Link href={href} className="after:absolute after:inset-0 hover:underline">
            <span className="line-clamp-2">{name}</span>
          </Link>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <Location listing={listing} />
          <Price listing={listing} />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-2 text-xs">
          <Link href={`${href}#zapytanie`} className="relative z-[1] flex min-h-8 items-center gap-1.5 font-semibold text-emerald-800 hover:underline dark:text-emerald-400">
            <CalendarDays size={15} aria-hidden="true" />Zapytaj o dostępność
          </Link>
          {(listing.deliveryAvailable || listing.withOperator || listing.isVerified) && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
              {listing.deliveryAvailable && (
                <li className="flex items-center gap-1"><Truck size={15} aria-hidden="true" />Dostawa</li>
              )}
              {listing.withOperator && (
                <li className="flex items-center gap-1"><UserRound size={15} aria-hidden="true" />Operator</li>
              )}
              {listing.isVerified && (
                <li className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><ShieldCheck size={15} aria-hidden="true" />Zweryfikowana</li>
              )}
            </ul>
          )}
        </div>

        <p aria-hidden="true" className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-market-yellow px-3 text-sm font-bold text-market-navy group-hover:bg-amber-300 lg:hidden">
          Zobacz ofertę <ArrowRight size={15} />
        </p>
      </div>
    </article>
  );
}
