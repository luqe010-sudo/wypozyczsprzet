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
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Największa baza sprzętu w Twojej okolicy
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 max-w-4xl drop-shadow-md">
          Wynajmij sprzęt w swojej okolicy
        </h1>

        <p className="text-base md:text-lg text-gray-200 mb-6 max-w-2xl drop-shadow">
          Szybko znajdź koparki, narzędzia i sprzęt budowlany blisko Ciebie. Bez pośredników.
        </p>

        <div className="hidden md:block text-[10px] md:text-xs text-gray-400 mb-8 max-w-2xl font-medium tracking-wide">
          Wynajem koparki Wrocław cena • Minikoparka z operatorem Legnica • Usługi koparką Wałbrzych • Wynajem maszyn budowlanych Lubin
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-0 transition-colors">

          {/* Search Input */}
          <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:block">Czego szukasz?</label>
              <input
                type="text"
                placeholder="np. koparka, wiertarka..."
                className="w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none bg-transparent font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Location Select placeholder */}
          <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:block">Lokalizacja</label>
              <select 
                className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent font-medium cursor-pointer appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="" className="dark:bg-slate-800">Wszystkie miasta</option>
                {availableCities.map(city => (
                  <option key={city} value={city} className="dark:bg-slate-800">{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Select placeholder */}
          <div className="flex-1 w-full flex items-center px-4 py-2">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <div className="flex flex-col flex-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:block">Kategoria</label>
              <select 
                className="w-full text-sm text-gray-900 dark:text-white outline-none bg-transparent font-medium cursor-pointer appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="" className="dark:bg-slate-800">Wszystkie kategorie</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat} className="dark:bg-slate-800">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl md:rounded-full transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-md"
            onClick={() => {
              window.scrollTo({
                top: document.querySelector('main')?.offsetTop - 80 || 600,
                behavior: 'smooth'
              });
            }}
          >
            Znajdź <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
