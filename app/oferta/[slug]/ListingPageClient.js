"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DynamicPlaceholder from '../../../components/DynamicPlaceholder';
import ClaimCompanyModal from '../../../components/ClaimCompanyModal';
import { trackEvent } from '../../../lib/gtag';
import { createClient } from '@/utils/supabase/client';
import { trackView, trackClick } from '../../../lib/tracking';
import { getExternalLinkProps, isBrokenLink } from '../../../lib/seo-utils';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';

const ListingMap = dynamic(() => import('../../../components/ListingMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 bg-slate-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-gray-300">Ładowanie mapy...</span>
      </div>
    </div>
  )
});

export default function ListingPageClient({ listing, seoDescription, faqItems, related }) {
  const [showPhone, setShowPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const name = listing['Sprzęt'] || 'Sprzęt';
  const company = listing.companyDetails || {};
  const phoneNumber = String(company.Telefon || '').trim();

  const hasHeroImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http');
  const isIncomplete = listing.Status && listing.Status.toLowerCase().includes('niekompletne');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        trackView(listing.ID_sprzetu, profile?.role === 'admin');
      } else {
        trackView(listing.ID_sprzetu, false);
      }
    };
    getUser();
  }, [listing.ID_sprzetu, supabase]);

  useEffect(() => {
    trackEvent('view_listing', {
      listing_name: name,
      listing_category: listing.Kategoria,
      listing_city: listing.Miasto,
    });
  }, [name, listing.Kategoria, listing.Miasto]);

  const handleClaimClick = () => {
    if (!user) {
      router.push(`/login?returnTo=/oferta/${listing.slug}`);
      return;
    }
    setShowClaimModal(true);
  };

  return (
    <>
      {/* Main Grid Layout: 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        
        {/* Left Column (8 Columns width on desktop) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Exactly 1 Photo (No gallery thumbnails or counters) */}
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 bg-slate-900">
            {hasHeroImage ? (
              listing.Zdjecie.includes('cloudinary.com') ? (
                <CldImage
                  src={listing.Zdjecie}
                  alt={name}
                  fill
                  priority={true}
                  loading="eager"
                  className="object-cover"
                  format="auto"
                  quality="auto"
                />
              ) : (
                <Image
                  src={listing.Zdjecie}
                  alt={name}
                  fill
                  priority={true}
                  loading="eager"
                  className="object-cover"
                />
              )
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <DynamicPlaceholder title={name} category={listing.Kategoria} />
              </div>
            )}

            {/* Category Badge overlay */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/55 backdrop-blur-md text-white text-[10px] font-black uppercase px-3.5 py-2 rounded-full tracking-wider border border-white/10 shadow-sm">
                {listing.Kategoria}
              </span>
            </div>

            {/* Favorite (Heart) button */}
            <div className="absolute top-4 right-4 z-10">
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95 group/heart">
                <svg className="w-5 h-5 fill-none stroke-current group-hover/heart:fill-red-500 group-hover/heart:stroke-red-500 transition-colors duration-300" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 2. Description Section ("O sprzęcie" with mockup styled vertical blue bar) */}
          <section className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 mb-6 border-b border-gray-50 dark:border-slate-800/60 pb-5">
              <span className="w-[3px] h-[1.1em] bg-blue-600 rounded-full inline-block mr-2.5" />
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                O sprzęcie
              </h2>
            </div>
            
            <div className="prose dark:prose-invert max-w-none text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 space-y-4">
              {seoDescription.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {paragraph.split('\n').map((line, j, arr) => (
                    <span key={j} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </section>

          {/* 3. Specification Checklist ("Specyfikacja" with mockup styled vertical blue bar) */}
          <section className="bg-[#f2f5f9] dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 p-6 md:p-7 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 mb-5 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <span className="w-[3px] h-[1.1em] bg-blue-600 rounded-full inline-block mr-2.5" />
              <h2 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Specyfikacja
              </h2>
            </div>
            
            <ul className="space-y-3.5 p-0 list-none">
              <li className="flex items-start gap-3 text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Maszyna:</strong> Wysokiej klasy wydajny sprzęt w doskonałym stanie technicznym.</span>
              </li>
              <li className="flex items-start gap-3 text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Dodatki:</strong> Możliwość wynajmu wraz z dodatkowym osprzętem i akcesoriami.</span>
              </li>
              <li className="flex items-start gap-3 text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Transport:</strong> Bezpieczna dostawa na miejsce pracy lub szybki odbiór osobisty.</span>
              </li>
              <li className="flex items-start gap-3 text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span><strong>Elastyczność:</strong> Wynajem dopasowany do potrzeb – krótko- i długoterminowy.</span>
              </li>
            </ul>
          </section>

          {/* 4. Map block */}
          {(listing.Lokalizacja || listing.Miasto) && (
            <ListingMap listing={listing} compact={false} />
          )}

        </div>

        {/* Right Column (Sticky CTA Widgets - 4 Columns width on desktop) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Card 1: Main CTA Offer Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            {/* Header: Title & Location */}
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2.5">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-gray-400 dark:text-gray-500 font-bold">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {listing.Miasto}
                </span>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Aktywne ogłoszenie
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Cena wynajmu</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{listing.Cena_od}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">PLN / {listing.Czas || 'doba'}</span>
                </div>
              </div>
              <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg">
                Cena od
              </div>
            </div>

            {/* 3 Feature Badges (Mockup Styling) */}
            <div className="grid grid-cols-3 gap-3">
              {/* Badge 1 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800/60 text-center flex flex-col items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white leading-tight">Faktura VAT</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">wystawiamy</span>
              </div>

              {/* Badge 2 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800/60 text-center flex flex-col items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white leading-tight">Elastycznie</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">krótko i długo</span>
              </div>

              {/* Badge 3 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800/60 text-center flex flex-col items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-black text-gray-900 dark:text-white leading-tight">Ubezpieczony</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">pełne OC</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3">
              {phoneNumber && (
                showPhone ? (
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} 
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-base no-underline transition-all shadow-md hover:shadow-lg active:scale-98"
                     onClick={() => {
                       trackEvent('click_phone', { listing_name: name, phone: phoneNumber });
                       trackClick(listing.ID_sprzetu, 'phone');
                     }}>
                    📞 {phoneNumber}
                  </a>
                ) : (
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl text-base cursor-pointer border-none transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2" 
                    onClick={() => { setShowPhone(true); trackEvent('show_phone', { listing_name: name }); }}
                  >
                    📞 Pokaż numer telefonu
                  </button>
                )
              )}

              {listing.olxUrl && !isBrokenLink(listing.olxUrl) && (
                <a href={listing.olxUrl} 
                   {...getExternalLinkProps(listing.olxUrl)}
                   className="w-full bg-[#002f34] text-white font-black py-3.5 px-6 rounded-2xl transition-all text-center block text-sm no-underline hover:bg-[#003840] active:scale-98 flex items-center justify-center gap-2 shadow-sm"
                   onClick={() => {
                     trackEvent('click_olx', { listing_name: name, olx_url: listing.olxUrl });
                     trackClick(listing.ID_sprzetu, 'olx');
                   }}>
                  💬 Zapytaj przez OLX
                </a>
              )}

              {company.WWW && (
                <a href={company.WWW.startsWith('http') ? company.WWW : `https://${company.WWW}`} 
                   {...getExternalLinkProps(company.WWW)}
                   className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-black py-3.5 px-6 rounded-2xl transition-all text-center flex items-center justify-center gap-2 no-underline text-sm shadow-sm ${isBrokenLink(company.WWW) ? 'opacity-55 grayscale cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-98'}`}
                   onClick={(e) => {
                     if (isBrokenLink(company.WWW)) {
                       e.preventDefault();
                       return;
                     }
                     trackEvent('click_www', { listing_name: name, www: company.WWW });
                     trackClick(listing.ID_sprzetu, 'website');
                   }}>
                  🌐 {isBrokenLink(company.WWW) ? 'Strona niedostępna' : 'Przejdź do strony firmy'}
                </a>
              )}

              {isIncomplete && (
                <Link 
                  href="/dashboard"
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 font-bold py-3 px-4 rounded-xl transition-all text-center block text-xs no-underline border border-red-200/50 dark:border-red-900/50"
                >
                  Jesteś właścicielem? Uzupełnij dane.
                </Link>
              )}
            </div>
          </div>

          {/* Card 2: Wynajmujący (Company details card) */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-md space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
              Wynajmujący
            </h3>
            
            <div className="flex items-center gap-4">
              {/* Avatar / Logo */}
              <div className="relative w-14 h-14 rounded-full border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-gray-500 font-black text-xl flex-shrink-0 shadow-sm overflow-hidden">
                {String(company.Nazwa || 'F').charAt(0).toUpperCase()}
              </div>
              
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
                  {company.Nazwa || 'Nazwa firmy'}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Zweryfikowana firma
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <span>★</span>
                  <span>★</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1 font-semibold">5.0 (12 opinii)</span>
                </div>
              </div>
            </div>

            {/* Company Details Card - Mockup Grid Styling */}
            <div className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-4 shadow-sm">
              {/* Full Location */}
              <div className="flex items-start gap-3.5 py-1">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="w-20 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">Lokalizacja</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white leading-normal flex-1">
                  {company.address ? `${company.address}, ` : ''}{company.postal_code ? `${company.postal_code} ` : ''}{company.city || listing.Miasto}
                </span>
              </div>

              {/* E-mail */}
              {company.email && (
                <div className="flex items-start gap-3.5 py-1 border-t border-gray-50 dark:border-slate-800/50 pt-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="w-20 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">E-mail</span>
                  <a href={`mailto:${company.email}`} className="text-xs font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 break-all no-underline">
                    {company.email}
                  </a>
                </div>
              )}

              {/* Strona WWW */}
              {company.WWW && (
                <div className="flex items-start gap-3.5 py-1 border-t border-gray-50 dark:border-slate-800/50 pt-3">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="w-20 text-xs font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">Strona WWW</span>
                  <a href={company.WWW.startsWith('http') ? company.WWW : `https://${company.WWW}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex-1 break-all no-underline">
                    {company.WWW}
                  </a>
                </div>
              )}
            </div>
            
            {/* Claim Company Button */}
            {!company.owner_user_id && (
              <button 
                onClick={handleClaimClick}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-center text-xs shadow-sm active:scale-98 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                📄 To moja firma (Zgłoś profil)
              </button>
            )}
          </div>

          {/* Card 3: Trust Assurances (Mockup Styling - exactly like attached image) */}
          <div className="bg-[#f2f5f9] dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <circle cx="12" cy="13" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l2.5 1.5M12 5V3m-3 0h6" />
              </svg>
              <div>
                <h4 className="text-[13.5px] md:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Szybka odpowiedź</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-normal">Zazwyczaj odpowiadamy w kilka minut</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 018 0v4M12 15v2" />
              </svg>
              <div>
                <h4 className="text-[13.5px] md:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Bezpieczne płatności</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-normal">Płatność zgodnie z ustaleniami</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h4 className="text-[13.5px] md:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">Sprzęt sprawny i serwisowany</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-normal">Regularnie serwisowany i gotowy do pracy</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FAQ – Smooth Accordion */}
      <section className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 md:p-12 rounded-2xl mb-12 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
          Najczęściej zadawane pytania
        </h2>
        <div>
          {faqItems.map((item, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'faq-item-active' : ''} rounded-2xl px-4`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left bg-transparent border-none py-5 cursor-pointer flex justify-between items-center group transition-colors"
              >
                <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">
                  {item.question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openFaq === i 
                    ? 'bg-blue-600 text-white rotate-180' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div className={`faq-answer ${openFaq === i ? 'faq-answer-open' : 'faq-answer-closed'}`}>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base pl-0">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Listings */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Inne oferty w tej kategorii
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link key={item.slug} href={`/oferta/${item.slug}`} className="group no-underline">
                <div className="related-card">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {item.Zdjecie && String(item.Zdjecie).startsWith('http') ? (
                      item.Zdjecie.includes('cloudinary.com') ? (
                        <CldImage 
                          src={item.Zdjecie} 
                          alt={item['Sprzęt']} 
                          fill
                          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          format="auto"
                          quality="auto"
                        />
                      ) : (
                        <Image 
                          src={item.Zdjecie} 
                          alt={item['Sprzęt']} 
                          fill
                          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      )
                    ) : (
                      <DynamicPlaceholder title={item['Sprzęt']} category={item.Kategoria} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        {item.Kategoria}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{item['Sprzęt']}</h3>
                    <div className="price-gradient font-black text-xl mb-3">
                      {item.Cena_od} <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tighter" style={{ WebkitTextFillColor: 'inherit', background: 'none' }}>/ {item.Czas || 'doba'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {item.Miasto}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to all */}
      <div className="text-center mt-12 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all hover:gap-3 no-underline group text-sm md:text-base">
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Powrót do wszystkich ofert
        </Link>
      </div>

      <ClaimCompanyModal 
        isOpen={showClaimModal} 
        onClose={() => setShowClaimModal(false)} 
        company={company} 
        user={user} 
      />
    </>
  );
}
