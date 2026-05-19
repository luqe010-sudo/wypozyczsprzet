"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { VOIVODESHIPS, getVoivodeshipSlugForCity } from '../lib/regions';

export default function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Wybierz...",
  icon,
  className = "",
  showSearch, // undefined by default, we'll determine it below
  variant = "minimal", // "minimal" or "field"
  isLocation = false
}) {
  // If showSearch is not explicitly provided, only show it for lists with more than 15 items
  const actualShowSearch = showSearch !== undefined ? showSearch : (options && options.length > 15);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoivodeship, setSelectedVoivodeship] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Compute active voivodeships where there are listings/cities in options
  const activeVoivodeshipSlugs = useMemo(() => {
    if (!isLocation) return new Set();
    const slugs = new Set();
    options.forEach(opt => {
      const cityName = typeof opt === 'string' ? opt : opt.value;
      const vSlug = getVoivodeshipSlugForCity(cityName);
      if (vSlug) {
        slugs.add(vSlug);
      }
    });
    return slugs;
  }, [options, isLocation]);

  // Sync selected voivodeship when dropdown opens/closes or value changes
  useEffect(() => {
    if (isOpen && isLocation && value) {
      if (value.startsWith('region:')) {
        setSelectedVoivodeship(value.replace('region:', ''));
      } else {
        const vSlug = getVoivodeshipSlugForCity(value);
        if (vSlug) {
          setSelectedVoivodeship(vSlug);
        }
      }
    } else if (!isOpen) {
      setSelectedVoivodeship(null);
    }
  }, [isOpen, isLocation, value]);

  // Display value formatting
  let displayValue = placeholder;
  if (value) {
    if (value.startsWith('region:')) {
      const vSlug = value.replace('region:', '');
      const region = VOIVODESHIPS[vSlug];
      displayValue = region ? `Woj. ${region.name}` : value;
    } else {
      const selectedOption = options.find(opt => 
        typeof opt === 'string' ? opt === value : opt.value === value
      );
      displayValue = typeof selectedOption === 'string' 
        ? selectedOption 
        : selectedOption?.label || value;
    }
  }

  const filteredOptions = options.filter(opt => {
    const labelText = typeof opt === 'string' ? opt : opt.label;
    return labelText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current && actualShowSearch) {
      // Only auto-focus on desktop (>= 1024px) to prevent mobile keyboard from opening
      if (window.innerWidth >= 1024) {
        inputRef.current.focus();
      }
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, actualShowSearch]);

  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option.value;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative flex flex-col flex-1 text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:block mb-0.5">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer group transition-all duration-200 ${
          variant === 'field' 
            ? 'h-11 px-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20' 
            : 'h-full min-h-[20px]'
        }`}
      >
        <span className={`text-sm font-medium transition-colors ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {displayValue}
        </span>
        <svg 
          className={`ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-full min-w-[280px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[100] overflow-hidden opacity-100 visible transition-all duration-200 shadow-blue-500/10">
          
          {/* Search Input inside dropdown (Only show search if not on regional phase or list is large) */}
          {actualShowSearch && (!isLocation || selectedVoivodeship) && (
            <div className="p-3 border-b border-gray-50 dark:border-slate-700">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Szukaj..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-xl text-sm outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Location two-step selector */}
          {isLocation ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {!selectedVoivodeship ? (
                // --- PHASE 1: Voivodeship Selection ---
                <>
                  {/* All Poland option */}
                  <li 
                    onClick={() => handleSelect('')}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors flex flex-col border-b border-gray-100 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 ${!value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                  >
                    <span className="font-bold text-gray-800 dark:text-white">Cała Polska</span>
                    <span className="text-[10px] text-gray-400 font-medium">Wszystkie w całym kraju</span>
                  </li>

                  {/* Voivodeship header */}
                  <li className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/40">
                    Wybierz województwo
                  </li>

                  {Object.values(VOIVODESHIPS)
                    .filter(v => activeVoivodeshipSlugs.has(v.slug))
                    .map(v => {
                      const isCurrentRegion = value === `region:${v.slug}`;
                      return (
                        <li
                          key={v.slug}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVoivodeship(v.slug);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-gray-50 dark:border-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 group ${
                            isCurrentRegion ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span>{v.name}</span>
                          <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </li>
                      );
                    })}
                </>
              ) : (
                // --- PHASE 2: City Selection within Voivodeship ---
                <>
                  {/* Back button */}
                  <li 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVoivodeship(null);
                    }}
                    className="px-4 py-2.5 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Wróć do województw
                  </li>

                  {/* Całe województwo option */}
                  <li 
                    onClick={() => handleSelect(`region:${selectedVoivodeship}`)}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 ${
                      value === `region:${selectedVoivodeship}` ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 dark:text-white">{VOIVODESHIPS[selectedVoivodeship]?.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Całe województwo</span>
                    </div>
                    {value === `region:${selectedVoivodeship}` && (
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>

                  {/* Wybierz miasto header */}
                  <li className="px-4 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-900/40">
                    Wybierz miasto
                  </li>

                  {/* Cities list */}
                  {(() => {
                    const citiesInVoivodeship = options
                      .filter(city => getVoivodeshipSlugForCity(typeof city === 'string' ? city : city.value) === selectedVoivodeship)
                      .filter(city => {
                        const labelText = typeof city === 'string' ? city : city.label;
                        return labelText.toLowerCase().includes(searchTerm.toLowerCase());
                      });

                    if (citiesInVoivodeship.length > 0) {
                      return citiesInVoivodeship.map((city, idx) => {
                        const optValue = typeof city === 'string' ? city : city.value;
                        const optLabel = typeof city === 'string' ? city : city.label;
                        const isSelected = optValue === value;
                        return (
                          <li
                            key={idx}
                            onClick={() => handleSelect(city)}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between border-b border-gray-50 dark:border-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>{optLabel}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </li>
                        );
                      });
                    } else {
                      return (
                        <li className="px-4 py-8 text-center text-gray-400 text-xs italic">
                          Brak miast pasujących do wyszukiwania...
                        </li>
                      );
                    }
                  })()}
                </>
              )}
            </ul>
          ) : (
            // --- Standard Dropdown List ---
            <ul className="max-h-60 overflow-y-auto py-2">
              <li 
                onClick={() => handleSelect('')}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 ${!value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`}
              >
                Wszystkie
              </li>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, idx) => {
                  const optValue = typeof option === 'string' ? option : option.value;
                  const optLabel = typeof option === 'string' ? option : option.label;
                  const isSelected = optValue === value;

                  return (
                    <li 
                      key={idx}
                      onClick={() => handleSelect(option)}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group/item hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      <span>{optLabel}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-8 text-center text-gray-400 text-xs italic">
                  Brak wyników...
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
