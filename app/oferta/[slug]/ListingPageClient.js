"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DynamicPlaceholder from '../../../components/DynamicPlaceholder';
import { trackEvent } from '../../../lib/gtag';

export default function ListingPageClient({ listing, seoDescription, faqItems, related }) {
  const [showPhone, setShowPhone] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const name = listing['Sprzęt'] || 'Sprzęt';
  const company = listing.companyDetails || {};
  const phoneNumber = String(company.Telefon || '').trim();

  const hasHeroImage = listing.Zdjecie && String(listing.Zdjecie).startsWith('http');
  const isIncomplete = listing.Status && listing.Status.toLowerCase().includes('niekompletne');

  useEffect(() => {
    trackEvent('view_listing', {
      listing_name: name,
      listing_category: listing.Kategoria,
      listing_city: listing.Miasto,
    });
  }, [name, listing.Kategoria, listing.Miasto]);

  return (
    <>
      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden mb-12 relative aspect-video md:aspect-[21/9] bg-blue-50 dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700">
        {hasHeroImage ? (
          <img
            src={listing.Zdjecie}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <DynamicPlaceholder title={name} category={listing.Kategoria} />
          </div>
        )}
      </div>


      {/* Title + Price + Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {listing.Kategoria}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">{name}</h1>
          
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 text-sm md:text-base">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <span>📍</span> {listing.Miasto}
            </div>
            {listing.Lokalizacja && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
                <span>🗺️</span> {listing.Lokalizacja}
              </div>
            )}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <span>🏢</span> {company.Nazwa || 'Brak firmy'}
            </div>
            {listing['Dostępność'] && listing['Dostępność'] !== 'brak danych' && (
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/30 font-bold">
                <span>🟢</span> {listing['Dostępność']}
              </div>
            )}
            {isIncomplete && (
              <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-tighter animate-pulse">
                PROFIL NIEKOMPLETNY (40%)
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between h-full">
          <div className="mb-6">
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
              {listing.Cena_od} <span className="text-lg font-medium text-gray-500 dark:text-gray-400">PLN / {listing.Czas || 'doba'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {phoneNumber && (
              showPhone ? (
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} 
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-lg"
                   onClick={() => trackEvent('click_phone', { listing_name: name, phone: phoneNumber })}>
                  📞 {phoneNumber}
                </a>
              ) : (
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 text-lg active:scale-[0.98]" 
                  onClick={() => { setShowPhone(true); trackEvent('show_phone', { listing_name: name }); }}
                >
                  Pokaż numer
                </button>
              )
            )}
            
            {isIncomplete && (
              <Link 
                href={`/dodaj-ogloszenie?edit=${listing.ID_sprzetu}`}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all text-center block text-sm"
              >
                Jesteś właścicielem? Uzupełnij dane.
              </Link>
            )}
            {listing.olxUrl && (
              <a href={listing.olxUrl} target="_blank" rel="noopener noreferrer" 
                 className="w-full bg-[#002f34] text-[#23e5db] font-black py-4 px-6 rounded-2xl transition-all text-center block text-lg"
                 onClick={() => trackEvent('click_olx', { listing_name: name, olx_url: listing.olxUrl })}>
                Załatw przez OLX
              </a>
            )}
            {company.WWW && (
              <a href={company.WWW.startsWith('http') ? company.WWW : `https://${company.WWW}`} 
                target="_blank" rel="noopener noreferrer" 
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold py-4 px-6 rounded-2xl transition-all text-center flex items-center justify-center gap-2"
                onClick={() => trackEvent('click_www', { listing_name: name, www: company.WWW })}>
                🌐 Przejdź do strony
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mb-12 bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 border-b-4 border-blue-600 pb-2 inline-block">
          O sprzęcie
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          {seoDescription.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-6">{paragraph}</p>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12 bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 border-b-4 border-blue-600 pb-2 inline-block">
          Najczęściej zadawane pytania
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left bg-transparent border-none py-6 cursor-pointer flex justify-between items-center group transition-colors"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.question}
                </span>
                <span className={`text-xl transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}>
                  ▼
                </span>
              </button>
              {openFaq === i && (
                <div className="pb-6 animate-fadeIn">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 border-b-4 border-blue-600 pb-2 inline-block">
            Inne oferty w tej kategorii
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((item) => (
              <Link key={item.slug} href={`/oferta/${item.slug}`} className="group no-underline">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    {item.Zdjecie && String(item.Zdjecie).startsWith('http') ? (
                      <img src={item.Zdjecie} alt={item['Sprzęt']} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <DynamicPlaceholder title={item['Sprzęt']} category={item.Kategoria} />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {item.Kategoria}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{item['Sprzęt']}</h3>
                    <div className="text-blue-600 dark:text-blue-400 font-black text-xl mb-4">
                      {item.Cena_od} <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tighter">/ {item.Czas || 'doba'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>📍</span> {item.Miasto}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="text-center mt-12 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Powrót do wszystkich ofert
        </Link>
      </div>
    </>
  );
}
