"use client";

import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Wybierz...",
  icon,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const displayValue = typeof selectedOption === 'string' 
    ? selectedOption 
    : selectedOption?.label || placeholder;

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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

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
        className="flex items-center cursor-pointer group"
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
        <div className="absolute top-full left-0 mt-3 w-full min-w-[240px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[100] overflow-hidden opacity-100 visible transition-all duration-200 shadow-blue-500/10">
          {/* Search Input inside dropdown */}
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
        </div>
      )}
    </div>
  );
}
