"use client";

import { useEffect, useMemo, useState } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import FiltersSidebar from './FiltersSidebar';
import ListingGrid from './ListingGrid';
import CTASection from './CTASection';
import StatsSection from './StatsSection';
import { trackEvent } from '../lib/gtag';

export default function Marketplace({ initialData }) {
  const { listings, filters } = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCity, selectedCategory]);

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

      return matchSearch && matchCity && matchCategory;
    });
  }, [listings, searchTerm, selectedCity, selectedCategory]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
              />
              
              {/* CTA for adding listing inside sidebar on desktop */}
              <div className="hidden lg:block">
                <CTASection />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            {/* CTA for mobile (shown before listings) */}
            <div className="block lg:hidden mb-8">
               <CTASection />
            </div>

            {/* Listings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Najnowsze ogłoszenia
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Sortuj</span>
                <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none pr-8 relative cursor-pointer">
                  <option>Najnowsze</option>
                  <option>Od najtańszych</option>
                  <option>Od najdroższych</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-medium text-gray-600">Trwa wyszukiwanie...</h3>
              </div>
            ) : filteredListings.length > 0 ? (
              <ListingGrid listings={filteredListings} />
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
                  }}
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
            
            {/* Stats Section */}
            <StatsSection />

          </main>
        </div>
      </div>
    </div>
  );
}
