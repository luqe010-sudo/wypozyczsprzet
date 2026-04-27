"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DynamicPlaceholder from './DynamicPlaceholder';
import { trackEvent } from '../lib/gtag';

export default function ListingCard({ listing }) {
  const [showPhone, setShowPhone] = useState(false);
  const router = useRouter();
  const company = listing.companyDetails || {};
  const phoneNumber = String(company.Telefon || '').trim();

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/oferta/${listing.slug}`);
  };

  const hasImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http');
  
  // Determine badges
  const isAvailable = listing['Dostępność'] && listing['Dostępność'].toLowerCase().includes('tak');
  const isNew = listing.Status && listing.Status.toLowerCase() === 'nowy';
  const isIncomplete = listing.Status && listing.Status.toLowerCase().includes('niekompletne');

  return (
    <article 
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <Link href={`/oferta/${listing.slug}`} tabIndex="-1" className="block w-full h-full">
          {hasImage ? (
            <img 
              src={listing.Zdjecie} 
              alt={listing['Sprzęt']} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
               <DynamicPlaceholder title={listing['Sprzęt']} category={listing.Kategoria} />
            </div>
          )}
        </Link>
        
        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          {isAvailable && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm tracking-wide">
              DOSTĘPNE
            </span>
          )}
           {isNew && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm tracking-wide">
              NOWE
            </span>
          )}
          {isIncomplete && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm tracking-wide">
              PROFIL NIEKOMPLETNY (40%)
            </span>
          )}
          {listing.isUserSubmitted && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Prywatne
            </span>
          )}
        </div>
        
        {/* Favorite icon (Top Right) - UI only */}
        <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/70 backdrop-blur hover:bg-white text-gray-500 hover:text-red-500 transition-colors z-10 shadow-sm" aria-label="Dodaj do ulubionych" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {listing['Sprzęt']}
        </h3>
        
        {/* Company Name */}
        <div className="text-xs font-medium text-gray-400 mb-2">
          {company.Nazwa}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {listing.Miasto}
        </div>
        
        {/* Rental type badge */}
        <div className="mb-4">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded">
            Na {listing.Czas || 'dzień'}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 mb-5">
          <div className="text-2xl font-black text-blue-600 leading-none">
            {listing.Cena_od} <span className="text-sm font-semibold">zł / {listing.Czas || 'dzień'}</span>
          </div>
        </div>

        {/* Action Button */}
        {isIncomplete ? (
          <Link 
            href={`/oferta/${listing.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            Jesteś właścicielem? - Uzupełnij dane.
          </Link>
        ) : (
          <Link 
            href={`/oferta/${listing.slug}`}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-4 rounded-xl transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            Zobacz szczegóły
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        )}
      </div>
    </article>
  );
}
