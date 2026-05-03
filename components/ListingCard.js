"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DynamicPlaceholder from './DynamicPlaceholder';
import { trackEvent } from '../lib/gtag';

export default function ListingCard({ listing }) {
  const router = useRouter();
  const company = listing.companyDetails || {};

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/oferta/${listing.slug}`);
  };

  const hasImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http');
  
  const isAvailable = listing['Dostępność'] && listing['Dostępność'].toLowerCase().includes('tak');
  const isNew = listing.Status && listing.Status.toLowerCase() === 'nowy';
  const isIncomplete = listing.Status && listing.Status.toLowerCase().includes('niekompletne');

  return (
    <article 
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-slate-700 overflow-hidden">
        <Link href={`/oferta/${listing.slug}`} tabIndex="-1" className="block w-full h-full">
          {hasImage ? (
            <img 
              src={listing.Zdjecie} 
              alt={listing['Sprzęt']} 
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
               <DynamicPlaceholder title={listing['Sprzęt']} category={listing.Kategoria} />
            </div>
          )}
        </Link>
        
        {/* Badges (Top Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {isAvailable && (
            <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide">
              DOSTĘPNE
            </span>
          )}
           {isNew && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide">
              NOWE
            </span>
          )}
          {listing.isUserSubmitted && (
            <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Prywatne
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {listing['Sprzęt']}
        </h3>
        
        {/* Company Name */}
        <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
          {company.Nazwa}
        </div>
        
        {/* Full Address: Street, Number, City */}
        <div className="flex items-start text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-tight">
          <svg className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <div className="flex flex-col">
            {listing.Lokalizacja && (
              <span className="font-medium">{listing.Lokalizacja}</span>
            )}
            <span>{listing.Miasto}</span>
          </div>
        </div>
        
        {/* Rental type badge */}
        <div className="mb-3">
          <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
            Na {listing.Czas || 'dzień'}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-1 mb-3">
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">
            {listing.Cena_od} <span className="text-[10px] font-bold text-gray-400">zł / {listing.Czas || 'dzień'}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/oferta/${listing.slug}`}
          className="w-full flex items-center justify-center gap-1.5 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-bold py-1.5 px-3 rounded-lg transition-all text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          Szczegóły
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </Link>

        {isIncomplete && (
          <Link 
            href={`/oferta/${listing.slug}`}
            className="mt-2 text-[9px] text-center text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            Uzupełnij dane
          </Link>
        )}
      </div>
    </article>
  );
}
