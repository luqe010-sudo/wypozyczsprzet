"use client";

import { useEffect, useMemo, useState } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import FiltersSidebar from './FiltersSidebar';
import ListingGrid from './ListingGrid';
import CTASection from './CTASection';
import StatsSection from './StatsSection';
import SeoFAQ from './SeoFAQ';
import { trackEvent } from '../lib/gtag';
import MapComponent from './MapComponent';

export default function Marketplace({ initialData }) {
  const { listings, filters } = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [radius, setRadius] = useState(50); // km
  const [searchCenter, setSearchCenter] = useState(null);
  const [geoCache, setGeoCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem('geoCache');
    if (savedCache) {
      try {
        setGeoCache(JSON.parse(savedCache));
      } catch (e) {
        console.error('Failed to parse geoCache from localStorage', e);
      }
    }
  }, []);

  // Save cache to localStorage whenever it updates
  useEffect(() => {
    if (Object.keys(geoCache).length > 0) {
      localStorage.setItem('geoCache', JSON.stringify(geoCache));
    }
  }, [geoCache]);

  const clearGeoCache = () => {
    if (window.confirm('Czy na pewno chcesz odświeżyć wszystkie lokalizacje na mapie? Może to zająć chwilę.')) {
      localStorage.removeItem('geoCache');
      setGeoCache({});
      window.location.reload();
    }
  };
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('20');

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); // Reset page on filter change
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCity, selectedCategory, maxPrice, radius, searchCenter]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const equipmentName = String(item['Sprzęt'] || '');
      const categoryName = String(item.Kategoria || '');
      const searchValue = searchTerm.toLowerCase();

      const matchSearch = searchTerm
        ? equipmentName.toLowerCase().includes(searchValue) ||
          categoryName.toLowerCase().includes(searchValue)
        : true;

      const matchCity = selectedCity ? item.Miasto === selectedCity : true;
      const matchCategory = selectedCategory ? item.Kategoria === selectedCategory : true;
      const rawPrice = String(item.Cena_od || '').replace(/[^\d.,]/g, '').replace(',', '.');
      const priceVal = parseFloat(rawPrice);
      const matchPrice = !isNaN(priceVal) ? priceVal <= maxPrice : true;

      // Distance filter
      let matchDistance = true;
      if (searchCenter && radius > 0) {
        const loc = item.Lokalizacja || '';
        const city = item.Miasto || '';
        const addr = loc && !loc.toLowerCase().includes(city.toLowerCase()) ? `${loc} ${city}`.trim() : (loc || city).trim();
        
        // Try full address first, then fallback to city
        const coords = geoCache[addr] || geoCache[city];
        
        if (coords) {
          const dist = getDistance(searchCenter.lat, searchCenter.lng, coords.lat, coords.lng);
          matchDistance = dist <= radius;
        } else {
          matchDistance = true;
        }
      }

      return matchSearch && matchCity && matchCategory && matchPrice && matchDistance;
    });
  }, [listings, searchTerm, selectedCity, selectedCategory, maxPrice, radius, searchCenter, geoCache]);

  // Geocode all listings (caching results)
  useEffect(() => {
    const geocodeListings = async () => {
      // 1. Always prioritize geocoding unique cities
      const cities = [...new Set(listings.map(l => l.Miasto).filter(Boolean))];
      const uniqueCities = cities.filter(c => !geoCache[c]);

      if (uniqueCities.length > 0) {
        for (const city of uniqueCities) {
          try {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                setGeoCache(prev => ({ ...prev, [city]: coords }));
              }
            }
            await new Promise(r => setTimeout(r, 1200));
          } catch (e) { console.error(e); }
        }
      }

      // 2. Geocode full addresses ONLY for items that are currently filtered/visible
      const filteredAddresses = [...new Set(filteredListings.map(l => {
        const city = l.Miasto || '';
        const loc = l.Lokalizacja || '';
        if (!loc) return null;
        if (loc.toLowerCase().includes(city.toLowerCase())) return loc.trim();
        return `${loc} ${city}`.trim();
      }).filter(Boolean))];
      
      const uniqueFilteredAddresses = filteredAddresses.filter(addr => !geoCache[addr]).slice(0, 5);

      if (uniqueFilteredAddresses.length > 0) {
        for (const addr of uniqueFilteredAddresses) {
          try {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                setGeoCache(prev => ({ ...prev, [addr]: coords }));
              }
            }
            await new Promise(r => setTimeout(r, 1200));
          } catch (e) { console.error(e); }
        }
      }
    };
    geocodeListings();
  }, [listings, filteredListings]);
  
  // Geocode selected city to set search center
  useEffect(() => {
    if (!selectedCity) {
      setSearchCenter(null);
      return;
    }

    const geocodeCity = async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(selectedCity)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setSearchCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (e) { console.error(e); }
    };
    geocodeCity();
  }, [selectedCity]);

  const totalItems = filteredListings.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage, 10));

  const currentListings = useMemo(() => {
    if (itemsPerPage === 'all') return filteredListings;
    const limit = parseInt(itemsPerPage, 10);
    const start = (currentPage - 1) * limit;
    return filteredListings.slice(start, start + limit);
  }, [filteredListings, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen transition-colors">
      {/* Hero Section */}
      <Hero 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        availableCities={filters.cities}
        availableCategories={filters.categories}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Trust & Benefits Bar */}
      <TrustBar />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar: Filters, Map, CTA */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="space-y-6">
              <FiltersSidebar
                availableCities={filters.cities}
                availableCategories={filters.categories}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                radius={radius}
                setRadius={setRadius}
                hasSearchCenter={!!searchCenter}
              />

              <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
                <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.106-1.789L9 1.118l5.447 2.724A2 2 0 0115 5.618v9.764a2 2 0 01-1.106 1.789L9 20z" /></svg>
                  <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Mapa ofert</h3>
                </div>
                <div className="h-[450px] relative">
                  <MapComponent 
                    listings={filteredListings} 
                    geoCache={geoCache} 
                    searchCenter={searchCenter} 
                    radius={radius}
                    onLocationShared={(coords) => setSearchCenter(coords)}
                    isCompact={true}
                  />
                  <button 
                    onClick={clearGeoCache}
                    className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors z-10 group"
                    title="Odśwież lokalizacje"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <CTASection />
              </div>
            </div>
          </aside>

          {/* Main Content: Listings */}
          <main className="flex-1 min-w-0">
            {/* Mobile Map/CTA View */}
            <div className="lg:hidden space-y-6 mb-8">
              <div className="relative">
                <MapComponent 
                  listings={filteredListings} 
                  geoCache={geoCache} 
                  searchCenter={searchCenter} 
                  radius={radius}
                  onLocationShared={(coords) => setSearchCenter(coords)}
                />
                <button 
                  onClick={clearGeoCache}
                  className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors z-10 group"
                  title="Odśwież lokalizacje"
                >
                  <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <CTASection />
            </div>

            {/* Listings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Najnowsze ogłoszenia
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase hidden sm:block">Pokaż</span>
                  <select 
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 transition-colors"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="all">∞</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Trwa wyszukiwanie...</h3>
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <ListingGrid listings={currentListings} />
                
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button 
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: document.querySelector('main')?.offsetTop - 80 || 600, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                    >
                      Poprzednia
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: document.querySelector('main')?.offsetTop - 80 || 600, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: document.querySelector('main')?.offsetTop - 80 || 600, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
                    >
                      Następna
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center shadow-sm transition-colors">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nie znaleziono sprzętu</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">Spróbuj zmienić kryteria wyszukiwania lub lokalizację.</p>
                <button
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-6 rounded-xl transition-colors"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('');
                    setSelectedCategory('');
                    setMaxPrice(2000);
                  }}
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
            
            {/* Stats Section */}
            <StatsSection />

            {/* SEO Content Section */}
            <SeoFAQ />
          </main>


        </div>
      </div>
    </div>
  );
}
