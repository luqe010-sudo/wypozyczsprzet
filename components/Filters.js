"use client";

export default function Filters({ 
  availableCities, 
  availableCategories, 
  selectedCity, 
  setSelectedCity, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <div className="filter-card">
      <div className="filter-group">
        <label htmlFor="city">{'Lokalizacja'}</label>
        <select 
          id="city" 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">{'Wszystkie miasta'}</option>
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="category">{'Kategoria sprz\u0119tu'}</label>
        <select 
          id="category" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">{'Wszystkie kategorie'}</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
