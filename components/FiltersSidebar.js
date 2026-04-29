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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Filtry</h3>
          <button 
            onClick={() => {
              setSelectedCity('');
              setSelectedCategory('');
              setMaxPrice(2000);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Wyczyść
          </button>
        </div>

        <div className="space-y-6">
          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Lokalizacja</label>
            <div className="relative">
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium"
              >
                <option value="">Wszystkie miasta</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Kategoria</label>
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none font-medium"
              >
                <option value="">Wszystkie kategorie</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Price Slider & Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-900">Max. cena za dzień</label>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  min="0" 
                  max="10000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-right text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-blue-700 bg-blue-50"
                />
                <span className="text-sm font-medium text-gray-500">zł</span>
              </div>
            </div>
            <div className="mt-2">
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={maxPrice > 2000 ? 2000 : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                <span>0 zł</span>
                <span>2000+ zł</span>
              </div>
            </div>
          </div>

          {/* Search Radius */}
          {hasSearchCenter && (
            <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-blue-900">Promień wyszukiwania</label>
                <span className="text-sm font-bold text-blue-600">{radius} km</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="200" 
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
              <p className="text-[10px] text-blue-700 font-medium mt-1">Pokazuje sprzęty w promieniu {radius} km od wybranej lokalizacji.</p>
            </div>
          )}

          {/* Rental Type (Visual Only) */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-900">Typ wynajmu</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" defaultChecked />
                <span className="text-gray-700 group-hover:text-gray-900">Na dzień</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-gray-700 group-hover:text-gray-900">Na tydzień</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600" />
                <span className="text-gray-700 group-hover:text-gray-900">Na miesiąc</span>
              </label>
            </div>
          </div>

          {/* Apply filters button */}
          <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-3 px-4 rounded-xl transition-colors duration-200">
            Pokaż wyniki
          </button>
        </div>
      </div>
    </div>
  );
}
