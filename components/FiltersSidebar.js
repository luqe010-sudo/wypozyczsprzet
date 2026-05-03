import React from 'react';

export default function FiltersSidebar({
  availableCities,
  availableCategories,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  radius,
  setRadius,
  hasSearchCenter,
}) {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 md:p-4 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight">Filtry</h3>
          <button 
            onClick={() => {
              setSelectedCity('');
              setSelectedCategory('');
              setMaxPrice(2000);
            }}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold uppercase"
          >
            Wyczyść
          </button>
        </div>

        <div className="space-y-3">
          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lokalizacja</label>
            <div className="relative">
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium transition-colors"
              >
                <option value="">Wszystkie miasta</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategoria</label>
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium transition-colors"
              >
                <option value="">Wszystkie kategorie</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Price Slider & Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max. cena</label>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  min="0" 
                  max="10000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-14 px-1 py-0.5 text-right text-[10px] border border-gray-300 dark:border-slate-600 rounded-md outline-none focus:border-blue-500 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                />
                <span className="text-[9px] font-bold text-gray-500">zł</span>
              </div>
            </div>
            <div className="mt-0.5">
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={maxPrice > 2000 ? 2000 : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-medium">
                <span>0 zł</span>
                <span>2000+ zł</span>
              </div>
            </div>
          </div>

          {/* Search Radius */}
          {hasSearchCenter && (
            <div className="flex flex-col gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 transition-colors">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase">Promień</label>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{radius} km</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="200" 
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-1 bg-blue-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
