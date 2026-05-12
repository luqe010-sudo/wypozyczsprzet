import CustomSelect from './CustomSelect';
import { SEO_CATEGORIES } from '../lib/categories';

export default function FiltersSidebar({
  availableCities,
  availableCategories,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  maxPrice,
  setMaxPrice,
  radius,
  setRadius,
  hasSearchCenter,
}) {
  const activeCategory = availableCategories.find(c => c.value === selectedCategory);
  const subcategories = activeCategory ? SEO_CATEGORIES[activeCategory.seoSlug]?.filters : [];
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 md:p-4 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight">Filtry</h3>
          <button 
            onClick={() => {
              setSelectedCity('');
              setSelectedCategory('');
              setSelectedSubcategory('');
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
            <CustomSelect
              options={availableCities}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Wszystkie miasta"
              variant="field"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategoria</label>
            <CustomSelect
              options={availableCategories}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setSelectedSubcategory('');
              }}
              placeholder="Wszystkie kategorie"
              variant="field"
            />
          </div>

          {/* Subcategory */}
          {selectedCategory && (
            <div className="flex flex-col gap-1 animate-fadeIn">
              <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Typ sprzętu</label>
              <CustomSelect
                options={subcategories || []}
                value={selectedSubcategory}
                onChange={setSelectedSubcategory}
                placeholder="Dowolny typ"
                variant="field"
              />
            </div>
          )}

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
