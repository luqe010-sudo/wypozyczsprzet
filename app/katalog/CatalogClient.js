'use client';

import React, { useState, useMemo } from 'react';
import { Search, Building2, MapPin } from 'lucide-react';
import { voivodeshipSlug, citySlug } from '../../lib/slugify';
import CompanyListCard from '../../components/directory/CompanyListCard';
import DirectoryBreadcrumbs from '../../components/directory/DirectoryBreadcrumbs';

function groupByRegion(companies, activeCity, activeVoivodeship) {
  const groups = {};

  for (const company of companies) {
    if (!company.branches?.length) continue;

    const seen = new Set();

    for (const branch of company.branches) {
      if (activeCity) {
        const bCitySlug = citySlug(branch.city);
        if (bCitySlug !== activeCity && branch.city?.toLowerCase() !== activeCity) continue;
      }
      if (activeVoivodeship) {
        const bVoiSlug = voivodeshipSlug(branch.voivodeship);
        if (bVoiSlug !== activeVoivodeship && branch.voivodeship?.toLowerCase() !== activeVoivodeship) continue;
      }

      const vName = branch.voivodeship || 'Inne';
      const cName = branch.city || 'Inne';
      const vKey = voivodeshipSlug(vName);
      const cKey = citySlug(cName);
      const pairKey = `${vKey}:${cKey}`;

      if (seen.has(pairKey)) continue;
      seen.add(pairKey);

      if (!groups[vKey]) {
        groups[vKey] = { voivodeship: vName, cities: {} };
      }
      if (!groups[vKey].cities[cKey]) {
        groups[vKey].cities[cKey] = { city: cName, companies: [] };
      }
      groups[vKey].cities[cKey].companies.push(company);
    }
  }

  return Object.keys(groups)
    .sort((a, b) => groups[a].voivodeship.localeCompare(groups[b].voivodeship, 'pl'))
    .map((vKey) => ({
      ...groups[vKey],
      cities: Object.keys(groups[vKey].cities)
        .sort((a, b) =>
          groups[vKey].cities[a].city.localeCompare(groups[vKey].cities[b].city, 'pl')
        )
        .map((cKey) => groups[vKey].cities[cKey]),
    }));
}

export default function CatalogClient({ companies = [], cities = [], voivodeships = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedVoivodeship, setSelectedVoivodeship] = useState('');

  const filtered = useMemo(() => {
    let result = companies;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.branches?.some(
            (b) =>
              b.city?.toLowerCase().includes(q) ||
              b.voivodeship?.toLowerCase().includes(q)
          )
      );
    }

    if (selectedCity) {
      result = result.filter((c) =>
        c.branches?.some(
          (b) =>
            citySlug(b.city) === selectedCity ||
            b.city?.toLowerCase() === selectedCity
        )
      );
    }

    if (selectedVoivodeship) {
      result = result.filter((c) =>
        c.branches?.some(
          (b) =>
            voivodeshipSlug(b.voivodeship) === selectedVoivodeship ||
            b.voivodeship?.toLowerCase() === selectedVoivodeship
        )
      );
    }

    return result;
  }, [companies, search, selectedCity, selectedVoivodeship]);

  const groupedByRegion = useMemo(
    () => groupByRegion(filtered, selectedCity, selectedVoivodeship),
    [filtered, selectedCity, selectedVoivodeship]
  );

  const clearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setSelectedVoivodeship('');
  };

  const hasActiveFilters = search || selectedCity || selectedVoivodeship;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-10">
      <DirectoryBreadcrumbs items={[]} />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <header className="text-center mb-10 mt-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          <Building2 size={14} />
          Katalog firm
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
          Wypożyczalnie <span className="text-blue-600 dark:text-blue-400">sprzętu budowlanego</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Sprawdzone firmy oferujące wynajem sprzętu budowlanego w całej Polsce.
          Znajdź wypożyczalnię w swoim mieście.
        </p>
      </header>

      {/* ─── Search & Filters ──────────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="catalog-search"
            type="text"
            placeholder="Szukaj firmy, miasta lub kategorii..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Filter selects – always visible */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              id="catalog-city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer"
            >
              <option value="">Wszystkie miasta</option>
              {cities
                .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
                .map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              id="catalog-voivodeship-filter"
              value={selectedVoivodeship}
              onChange={(e) => setSelectedVoivodeship(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer"
            >
              <option value="">Wszystkie województwa</option>
              {voivodeships
                .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
                .map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Active filters & count */}
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span>{' '}
            {filtered.length === 1
              ? 'firma'
              : filtered.length < 5
              ? 'firmy'
              : 'firm'}
            {hasActiveFilters && ' (filtrowane)'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      {/* ─── Grouped company list ──────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="space-y-12">
          {groupedByRegion.map((region) => {
            const regionTotal = region.cities.reduce(
              (sum, c) => sum + c.companies.length,
              0
            );
            return (
              <section key={voivodeshipSlug(region.voivodeship)}>
                {/* Voivodeship header */}
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Województwo {region.voivodeship}
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {regionTotal} {regionTotal === 1 ? 'firma' : regionTotal < 5 ? 'firmy' : 'firm'}
                      {region.cities.length > 1 && ` w ${region.cities.length} ${region.cities.length === 1 ? 'mieście' : 'miastach'}`}
                    </p>
                  </div>
                </div>

                {/* Cities within voivodeship */}
                <div className="space-y-8">
                  {region.cities.map((city) => (
                    <div key={citySlug(city.city)}>
                      {/* City header */}
                      <h3 className="flex items-center gap-2 text-base font-bold text-gray-700 dark:text-gray-300 mb-4">
                        <MapPin size={14} className="text-gray-400" />
                        {city.city}
                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">
                          ({city.companies.length} {city.companies.length === 1 ? 'firma' : city.companies.length < 5 ? 'firmy' : 'firm'})
                        </span>
                      </h3>

                      {/* Company grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {city.companies.map((company) => (
                          <CompanyListCard key={company.id} company={company} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Search size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Nie znaleziono firm
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto">
            Spróbuj zmienić kryteria wyszukiwania lub wyczyścić filtry.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
