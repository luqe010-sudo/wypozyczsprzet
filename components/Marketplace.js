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
    <div className="bg-gray-50 min-h-screen">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
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
              
              {/* CTA for adding listing inside sidebar on desktop */}
              <div className="hidden lg:block">
                <CTASection />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            <div className="block lg:hidden mb-8">
               <CTASection />
            </div>

            {/* Map Section */}
            <MapComponent 
              listings={filteredListings} 
              geoCache={geoCache} 
              searchCenter={searchCenter} 
              radius={radius}
              onLocationShared={(coords) => setSearchCenter(coords)}
            />

            {/* Listings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Najnowsze ogłoszenia
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 hidden sm:block">Pokaż</span>
                  <select 
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none pr-8 relative cursor-pointer"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="all">Wszystkie</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Sortuj</span>
                  <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none pr-8 relative cursor-pointer">
                    <option>Najnowsze</option>
                    <option>Od najtańszych</option>
                    <option>Od najdroższych</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-medium text-gray-600">Trwa wyszukiwanie...</h3>
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
                      className="px-5 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Poprzednia
                    </button>
                    
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: document.querySelector('main')?.offsetTop - 80 || 600, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${currentPage === page ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'}`}
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
                      className="px-5 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Następna
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nie znaleziono sprzętu</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Spróbuj zmienić kryteria wyszukiwania, lokalizację lub kategorię, aby znaleźć inne oferty.</p>
                <button
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-2.5 px-6 rounded-xl transition-colors duration-200"
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
