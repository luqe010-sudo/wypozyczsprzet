import Link from 'next/link';
import DynamicPlaceholder from '../../../components/DynamicPlaceholder';

function SuggestionCard({ listing }) {
  const hasImage =
    listing.Zdjecie && String(listing.Zdjecie).startsWith('http');

  return (
    <Link
      href={`/oferta/${listing.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-slate-700 overflow-hidden">
        {hasImage ? (
          <img
            src={listing.Zdjecie}
            alt={listing['Sprzęt']}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
            <DynamicPlaceholder
              title={listing['Sprzęt']}
              category={listing.Kategoria}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {listing['Sprzęt']}
        </h3>
        <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
          {listing.companyDetails?.Nazwa}
        </div>
        <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 mb-2">
          <svg className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.Miasto}
        </div>
        <div className="mt-auto pt-1">
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">
            {listing.Cena_od}{' '}
            <span className="text-[10px] font-bold text-gray-400">
              zł / {listing.Czas || 'dzień'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function InactiveListingPage({ suggestions = [] }) {
  return (
    <div className="max-w-[960px] mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0">
          Strona główna
        </Link>
        <span>/</span>
        <span>Ogłoszenia</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Ogłoszenie nieaktywne</span>
      </nav>

      {/* Main banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-700 p-8 md:p-12 mb-12 text-center shadow-xl">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl"
        />

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          To ogłoszenie jest już nieaktywne
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-8 text-base leading-relaxed">
          Ogłoszenie, którego szukasz, zostało usunięte lub wygasło. Sprawdź
          inne dostępne oferty — mamy setki aktualnych ogłoszeń wynajmu
          sprzętu budowlanego!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Wróć na stronę główną
          </Link>
          <Link
            href="/#ogloszenia"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Przeglądaj oferty
          </Link>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
              Podobne ogłoszenia, które mogą Cię zainteresować
            </h2>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {suggestions.map((listing) => (
              <SuggestionCard key={listing.ID_sprzetu || listing.slug} listing={listing} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold text-sm"
            >
              Zobacz wszystkie ogłoszenia
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
