import React from 'react';

export default function Hero({ 
  searchTerm, setSearchTerm,
  availableCities = [],
  availableCategories = [],
  selectedCity, setSelectedCity,
  selectedCategory, setSelectedCategory
}) {
  return (
    <section className="relative w-full bg-gray-900 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/header.png')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Największa baza sprzętu w Twojej okolicy
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-4xl drop-shadow-md">
          Wynajmij sprzęt w swojej okolicy
        </h1>

        <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl drop-shadow">
          Szybko znajdź koparki, narzędzia i sprzęt budowlany blisko Ciebie. Bez pośredników, bez prowizji.
        </p>

        <div className="text-xs md:text-sm text-gray-400 mb-10 max-w-2xl font-medium tracking-wide">
          Wynajem koparki Wrocław cena • Minikoparka z operatorem Legnica • Usługi koparką Wałbrzych • Wynajem maszyn budowlanych Lubin
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-4xl bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 md:gap-0">

          {/* Search Input */}
          <div className="flex-1 w-full flex items-center px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">Czego szukasz?</label>
              <input
                type="text"
                placeholder="np. koparka, wiertarka..."
                className="w-full text-gray-900 placeholder-gray-400 outline-none bg-transparent font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Location Select placeholder */}
          <div className="flex-1 w-full flex items-center px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">Lokalizacja</label>
              <select 
                className="w-full text-gray-900 outline-none bg-transparent font-medium cursor-pointer appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Wszystkie miasta</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Category Select placeholder */}
          <div className="flex-1 w-full flex items-center px-4 py-3 md:py-2">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">Kategoria</label>
              <select 
                className="w-full text-gray-900 outline-none bg-transparent font-medium cursor-pointer appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Wszystkie kategorie</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* CTA Button */}
          <button 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 px-8 rounded-xl md:rounded-full transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-md mt-2 md:mt-0"
            onClick={() => {
              window.scrollTo({
                top: document.querySelector('main')?.offsetTop - 80 || 600,
                behavior: 'smooth'
              });
            }}
          >
            Znajdź sprzęt <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
