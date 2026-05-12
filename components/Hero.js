import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEO_CATEGORIES, FORM_CATEGORIES, getCitySlug } from '../lib/categories';
import CustomSelect from './CustomSelect';

export default function Hero({ 
  searchTerm, setSearchTerm,
  availableCities = [],
  availableCategories = [],
  selectedCity, setSelectedCity,
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory
}) {
  const router = useRouter();
  const activeCategory = availableCategories.find(c => c.value === selectedCategory);

  const handleSearch = () => {
    if (selectedCategory) {
      // Find the SEO slug for the selected category key
      const catConfig = FORM_CATEGORIES.find(c => c.value === selectedCategory);
      if (catConfig) {
        let url = `/${catConfig.seoSlug}`;
        
        if (selectedCity) {
          const citySlug = getCitySlug(selectedCity);
          url = `${url}/${citySlug}`;
        }

        const params = new URLSearchParams();
        if (searchTerm) params.set('s', searchTerm);
        
        const queryString = params.toString();
        router.push(queryString ? `${url}?${queryString}` : url);
        return;
      }
    }

    // Fallback: if no category, just scroll to marketplace on homepage
    window.scrollTo({
      top: document.querySelector('main')?.offsetTop - 80 || 600,
      behavior: 'smooth'
    });
  };
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

        <div className="hidden md:block text-[10px] md:text-xs text-gray-300 mb-8 max-w-3xl font-medium tracking-wide">
          Skorzystaj z darmowych wzorów umów wynajmu sprzętu i zabezpiecz interesy obu stron. Pliki dostępne w zakładce <Link href="/umowy" className="text-blue-400 hover:text-blue-300 hover:underline">UMOWY</Link>
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

          {/* Location Select */}
          <div className="flex-1 w-full flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <CustomSelect
              label="Lokalizacja"
              options={availableCities}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Wszystkie miasta"
            />
          </div>

          {/* Category Select */}
          <div className="flex-1 w-full flex items-center px-4 py-2 border-gray-200 dark:border-slate-700 transition-all duration-300">
            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <CustomSelect
              label="Kategoria"
              options={availableCategories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Wszystkie kategorie"
            />
          </div>

          {/* CTA Button */}
          <button 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl md:rounded-full transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-md"
            onClick={handleSearch}
          >
            Znajdź <span className="ml-2">→</span>
          </button>
        </div>

        {/* Category Quick Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Object.values(SEO_CATEGORIES).map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-all duration-200"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
