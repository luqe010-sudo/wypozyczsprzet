"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function AddressAutocomplete({ onSelect, defaultValue = '', placeholder = 'Zacznij wpisywać adres...' }) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3 || !showDropdown) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${maptilerKey}&language=pl&limit=5&types=address,postal_code,place`;
        const response = await fetch(url);
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showDropdown]);

  const handleSelect = (feature) => {
    const address = feature.place_name;
    setQuery(address);
    setShowDropdown(false);
    
    // Parse result
    const context = feature.context || [];
    const city = feature.text || '';
    const postalCode = context.find(c => c.id.startsWith('postal_code'))?.text || '';
    const street = feature.properties?.address || feature.text || '';
    
    onSelect({
      fullAddress: address,
      city: feature.place_type.includes('place') ? feature.text : context.find(c => c.id.startsWith('place'))?.text || city,
      postalCode,
      street: feature.place_type.includes('address') ? feature.text : '',
      lat: feature.center[1],
      lng: feature.center[0]
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-[100] mt-1 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-200 dark:border-slate-700 max-h-60 overflow-auto animate-fadeIn">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b last:border-0 border-gray-100 dark:border-slate-700"
            >
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {suggestion.text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {suggestion.place_name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
