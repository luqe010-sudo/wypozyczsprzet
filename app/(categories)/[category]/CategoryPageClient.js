"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ListingCard from '../../../components/ListingCard';
import MapComponent from '../../../components/MapComponent';
import CustomSelect from '../../../components/CustomSelect';
import { SEO_CATEGORIES } from '../../../lib/categories';
import { geocodeAddress } from '../../../lib/geocoding';
import { sanitizeAddress } from '../../../lib/utils';

export default function CategoryPageClient({ category, listings, cities, otherCategories, cityName, otherCities }) {
  const searchParams = useSearchParams();
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('s') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Map state
  const [geoCache, setGeoCache] = useState({});
  const [searchCenter, setSearchCenter] = useState(null);
  const geocodeQueuedRef = useRef(new Set());

  // Update state if URL params change
  useEffect(() => {
    const city = searchParams.get('city');
    const s = searchParams.get('s');
    if (city) setSelectedCity(city);
    if (s) setSearchTerm(s);
  }, [searchParams]);

  // Handle City geocoding to center the map
  useEffect(() => {
    const targetCity = cityName || selectedCity;
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
  }, [cityName, selectedCity]);

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

    const uniquePending = [...new Set(addressesToGeocode)].slice(0, 5); // Small batches

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
      const matchCity = selectedCity ? item.Miasto === selectedCity : true;
      const matchFilter = selectedFilter
        ? (item.subcategory || '').toLowerCase() === selectedFilter.toLowerCase()
        : true;
      const equipmentName = String(item.name || item['Sprzęt'] || '');
      const matchSearch = searchTerm
        ? equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchCity && matchFilter && matchSearch;
    });
  }, [listings, selectedCity, selectedFilter, searchTerm]);

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
            <div className="sticky top-24 space-y-6">
              {/* City Filter */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Lokalizacja</h3>
                <CustomSelect
                  options={cities}
                  value={selectedCity}
                  onChange={(val) => { setSelectedCity(val); setCurrentPage(1); }}
                  placeholder="Wszystkie miasta"
                  variant="field"
                />
              </div>

              {/* Subcategory Filters (UX only, NOT indexed) */}
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

              {/* Map Section */}
              <div className="h-64 relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700">
                  <MapComponent 
                    listings={filteredListings} 
                    geoCache={geoCache}
                    searchCenter={searchCenter}
                    radius={cityName || selectedCity ? 20 : 0}
                    isCompact={true}
                  />
              </div>

              {/* Internal Cross-links */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Inne kategorie</h3>
                <div className="space-y-2">
                  {otherCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
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
                  onClick={() => { setSelectedCity(''); setSelectedFilter(''); }}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-6 rounded-xl transition-colors"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}

            {/* Local Hubs Section (Internal Linking) */}
            <section className="mt-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {category.name} — inne lokalizacje
              </h2>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 30).map((city) => (
                  <Link
                    key={city}
                    href={`/${category.slug}/${String(city).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0142/g, 'l').replace(/\u0144/g, 'n').replace(/\u015b/g, 's').replace(/[\u017a\u017c]/g, 'z').replace(/\u0107/g, 'c').replace(/\u0119/g, 'e').replace(/\u00f3/g, 'o').replace(/\u0105/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-600 transition-colors"
                  >
                    📍 {city}
                  </Link>
                ))}
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
