"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ListingCard from '../../../components/ListingCard';
import dynamic from 'next/dynamic';
import { getCitySlug } from '../../../lib/categories';
import { geocodeAddress } from '../../../lib/geocoding';
import { sanitizeAddress } from '../../../lib/utils';
import { VOIVODESHIPS } from '../../../lib/regions';

const MapComponent = dynamic(() => import('../../../components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Ładowanie mapy...</div>
});

export default function CategoryPageClient({ 
  category, 
  listings, 
  cities, 
  otherCategories, 
  cityName, 
  otherCities, 
  nearbyListings = [],
  isVoivodeshipPage = false,
  isCityPage = false,
  voivodeshipSlug = undefined,
  activeVoivodeships = []
}) {
  const searchParams = useSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('s') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Map state
  const [geoCache, setGeoCache] = useState({});
  const [searchCenter, setSearchCenter] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const geocodeQueuedRef = useRef(new Set());
  const mapRef = useRef(null);

  // City pill links: show max 20 on category page, all on city page
  const [showAllCities, setShowAllCities] = useState(false);
  const MAX_VISIBLE_CITIES = 15;
  const visibleCities = showAllCities ? cities : cities.slice(0, MAX_VISIBLE_CITIES);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle City geocoding to center the map
  useEffect(() => {
    const targetCity = cityName;
    if (targetCity) {
      const cleanCity = sanitizeAddress('', targetCity);
      if (geoCache[cleanCity]) {
        setSearchCenter(geoCache[cleanCity]);
      } else {
        geocodeAddress(cleanCity).then(coords => {
          if (coords) {
            setGeoCache(prev => ({ ...prev, [cleanCity]: coords }));
            setSearchCenter(coords);
          }
        });
      }
    } else {
      setSearchCenter(null);
    }
  }, [cityName, geoCache]);

  // Background geocoding for listings
  useEffect(() => {
    const addressesToGeocode = listings
      .map(l => {
        if (l.lat && l.lng) return null;
        const addr = sanitizeAddress(l.Lokalizacja, l.Miasto);
        const cityClean = sanitizeAddress('', l.Miasto);
        if (!geoCache[addr] && !geocodeQueuedRef.current.has(addr)) return addr;
        if (!geoCache[cityClean] && !geocodeQueuedRef.current.has(cityClean)) return cityClean;
        return null;
      })
      .filter(Boolean);

    const uniquePending = [...new Set(addressesToGeocode)].slice(0, 2); // Very small batches for mobile stability

    if (uniquePending.length > 0) {
      uniquePending.forEach(addr => geocodeQueuedRef.current.add(addr));
      
      Promise.all(uniquePending.map(addr => geocodeAddress(addr))).then(results => {
        const newEntries = {};
        results.forEach((res, i) => {
          if (res) newEntries[uniquePending[i]] = res;
        });
        if (Object.keys(newEntries).length > 0) {
          setGeoCache(prev => ({ ...prev, ...newEntries }));
        }
      });
    }
  }, [listings, geoCache]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchFilter = selectedFilter
        ? (item.subcategory || '').toLowerCase() === selectedFilter.toLowerCase()
        : true;
      const equipmentName = String(item.name || item['Sprzęt'] || '');
      const matchSearch = searchTerm
        ? equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchFilter && matchSearch;
    });
  }, [listings, selectedFilter, searchTerm]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const currentListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute inset-0 bg-gradient-to-r ${category.color}`} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline flex-shrink-0 transition-colors">
              Strona główna
            </Link>
            <span className="text-gray-600">/</span>
            {cityName ? (
              <>
                <Link href={`/${category.slug}`} className="text-blue-400 hover:text-blue-300 hover:underline flex-shrink-0 transition-colors">
                  {category.name}
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">{cityName}</span>
              </>
            ) : (
              <span className="text-white font-medium">{category.name}</span>
            )}
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {category.name} — {cityName || 'Cała Polska'}
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mb-8">
            {category.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-white">
              <span className="font-black text-xl">{listings.length}</span> ofert
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-white">
              <span className="font-black text-xl">{cities.length}</span> miast
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="space-y-6">
              {/* City Filter — SEO-friendly pill links */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                <div className="space-y-4">
                  {/* Voivodeships section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Województwo</h4>
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={isVoivodeshipPage || isCityPage ? '/' : `/${category.slug}`}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !voivodeshipSlug
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Wszystkie
                      </Link>
                      {Object.values(VOIVODESHIPS)
                        .filter(v => {
                          const allowedVoivodeships = activeVoivodeships && activeVoivodeships.length > 0
                            ? activeVoivodeships
                            : Object.keys(VOIVODESHIPS);
                          return allowedVoivodeships.includes(v.slug);
                        })
                        .map(v => {
                          const isActive = voivodeshipSlug === v.slug;
                          const targetHref = (isVoivodeshipPage || isCityPage)
                            ? `/${v.slug}`
                            : `/${category.slug}/${v.slug}`;
                          return (
                            <Link
                              key={v.slug}
                              href={targetHref}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-sm font-black'
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {v.name}
                            </Link>
                          );
                        })}
                    </div>
                  </div>

                  {/* Cities section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      {voivodeshipSlug ? `Miasta w woj. ${VOIVODESHIPS[voivodeshipSlug]?.name}` : 'Miasto'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {voivodeshipSlug && (
                        <Link
                          href={(isVoivodeshipPage || isCityPage) ? `/${voivodeshipSlug}` : `/${category.slug}/${voivodeshipSlug}`}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isVoivodeshipPage && !isCityPage
                              ? 'bg-blue-600 text-white shadow-sm font-black'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          Całe województwo
                        </Link>
                      )}
                      {visibleCities.map((city) => {
                        const slug = getCitySlug(city);
                        const isActive = cityName && cityName.toLowerCase().includes(city.toLowerCase()) && !isVoivodeshipPage;
                        const targetHref = (isVoivodeshipPage || isCityPage)
                          ? `/${slug}`
                          : `/${category.slug}/${slug}`;
                        return (
                          <Link
                            key={city}
                            href={targetHref}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-sm font-black'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {city}
                          </Link>
                        );
                      })}
                      {/* Show more cities toggle */}
                      {cities.length > MAX_VISIBLE_CITIES && !showAllCities && (
                        <button
                          onClick={() => setShowAllCities(true)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                        >
                          +{cities.length - MAX_VISIBLE_CITIES} więcej
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategory Filters or Main Categories when on Voivodeship Landing */}
              {(isVoivodeshipPage && category.slug === voivodeshipSlug) || isCityPage ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Kategorie</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/${category.slug}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md transition-all"
                    >
                      Wszystkie
                    </Link>
                    {otherCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}/${category.slug}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Kategorie</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={voivodeshipSlug ? `/${voivodeshipSlug}` : cityName && !isVoivodeshipPage ? `/${getCitySlug(cityName)}` : '/'}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                      >
                        Wszystkie
                      </Link>
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md transition-all">
                        {category.name}
                      </span>
                      {otherCategories.map((cat) => {
                        // Maintain the current location context when switching categories
                        let targetHref = `/${cat.slug}`;
                        if (voivodeshipSlug && isVoivodeshipPage) {
                          targetHref = `/${cat.slug}/${voivodeshipSlug}`;
                        } else if (cityName && !isVoivodeshipPage) {
                          targetHref = `/${cat.slug}/${getCitySlug(cityName)}`;
                        }
                        return (
                          <Link
                            key={cat.slug}
                            href={targetHref}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                          >
                            {cat.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {category.filters && category.filters.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Typ sprzętu</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setSelectedFilter(''); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !selectedFilter
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        Wszystkie
                      </button>
                      {category.filters.map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => { setSelectedFilter(filter.value === selectedFilter ? '' : filter.value); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedFilter === filter.value
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Map Section */}
              <div ref={mapRef} className="h-64 relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {showMap ? (
                  <MapComponent 
                    listings={filteredListings} 
                    geoCache={geoCache}
                    searchCenter={searchCenter}
                    radius={cityName ? 20 : 0}
                    isCompact={true}
                  />
                ) : (
                  <div className="text-gray-400 text-xs font-bold animate-pulse">Ładowanie mapy...</div>
                )}
              </div>

              {/* Internal Cross-links */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Inne kategorie</h3>
                <div className="space-y-2">
                  {otherCategories.map((cat) => {
                    // Generate context-aware URL
                    let targetHref = `/${cat.slug}`;
                    if (cityName && !isVoivodeshipPage) {
                      targetHref = `/${cat.slug}/${getCitySlug(cityName)}`;
                    } else if (voivodeshipSlug) {
                      targetHref = `/${cat.slug}/${voivodeshipSlug}`;
                    }

                    return (
                      <Link
                        key={cat.slug}
                        href={targetHref}
                        className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content: Listings */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {cityName
                  ? `Wynajem ${category.name.toLowerCase()} w ${cityName}`
                  : `Wszystkie ogłoszenia: ${category.name}`}
                {selectedFilter && <span className="text-blue-600"> — {category.filters.find(f => f.value === selectedFilter)?.label || selectedFilter}</span>}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {filteredListings.length} wyników
              </span>
            </div>

            {filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {currentListings.map((listing) => (
                    <ListingCard key={listing.ID_sprzetu || listing.slug} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-2">
                    <button
                      onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                    >
                      ← Poprzednia
                    </button>
                    <span className="text-sm text-gray-500 font-medium px-3">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                    >
                      Następna →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Brak ofert</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
                  Nie znaleziono ofert w tej kategorii dla wybranych filtrów.
                </p>
                <button
                  onClick={() => { setSelectedFilter(''); }}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-6 rounded-xl transition-colors"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}

            {/* ═══ Nearby Listings Section ═══ */}
            {nearbyListings && nearbyListings.length > 0 && (
              <section className="mt-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Podobne oferty w pobliżu
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isVoivodeshipPage 
                          ? `${category.name} dostępne poza tym województwem`
                          : `${category.name} dostępne w promieniu 30 km od ${cityName}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6">
                    {nearbyListings.map((listing) => (
                      <div key={listing.ID_sprzetu || listing.slug} className="relative">
                        <ListingCard listing={listing} />
                        {/* Distance badge */}
                        {listing._distance !== undefined && (
                          <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            ~{listing._distance} km
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Local Hubs Section (Internal Linking) */}
            <section className="mt-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {category.name} — inne lokalizacje
              </h2>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 30).map((city) => {
                  const slug = getCitySlug(city);
                  const targetHref = (isVoivodeshipPage || isCityPage)
                    ? `/${slug}`
                    : `/${category.slug}/${slug}`;
                  return (
                    <Link
                      key={city}
                      href={targetHref}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-600 transition-colors"
                    >
                      📍 {city}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* SEO Description */}
            <section className="mt-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Wynajem {category.name.toLowerCase()} {cityName ? `— ${cityName}` : 'w Twojej okolicy'}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                <p className="leading-relaxed">
                  {cityName 
                    ? `Szukasz profesjonalnego sprzętu z kategorii ${category.name.toLowerCase()} w mieście ${cityName}? Trafiłeś we właściwe miejsce. Nasz marketplace łączy lokalne wypożyczalnie z osobami szukającymi sprzętu do prac budowlanych, ogrodowych i wysokościowych.`
                    : category.description}
                </p>
                <p className="leading-relaxed mt-4">
                  Na WypożyczSprzęt znajdziesz {listings.length} ofert wynajmu {cityName ? `dostępnych bezpośrednio w ${cityName}` : `w kategorii ${category.name.toLowerCase()}`}.
                  Przeglądaj ogłoszenia od lokalnych firm i wypożyczalni{cityName ? '' : ` w ${cities.length} miastach`}.
                  Bez pośredników — kontakt bezpośrednio z właścicielem sprzętu.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
