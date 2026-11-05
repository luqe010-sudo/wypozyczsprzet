'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LayoutGrid, LocateFixed, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react';
import ListingCard from '../ListingCard';
import { SEO_CATEGORIES, FORM_CATEGORIES } from '../../lib/categories';
import { getVoivodeshipSlugForCity, VOIVODESHIPS } from '../../lib/regions';
import { haversineDistance } from '../../lib/distance';
import { offersLabel } from '../../lib/format';

const MapComponent = dynamic(() => import('../MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      Ładowanie mapy…
    </div>
  ),
});

const PAGE_SIZE = 24;
const RADIUS_OPTIONS = [10, 25, 50, 100];
const SORT_OPTIONS = [
  { value: '', label: 'Najnowsze' },
  { value: 'price', label: 'Najniższa cena' },
  { value: 'distance', label: 'Najbliżej' },
];
const DEFAULTS = { q: '', category: '', sub: '', city: '', radius: '25', maxPrice: '', delivery: '', operator: '', sort: '' };

const selectClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

function readUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const next = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach((key) => {
    const value = params.get(key);
    if (value !== null) next[key] = value;
  });
  // Links from before the search moved here used ?s=
  if (params.get('s') && !next.q) next.q = params.get('s');
  return next;
}

function writeUrlFilters(filters, view) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== DEFAULTS[key]) params.set(key, value);
  });
  if (view === 'map') params.set('view', 'map');
  const query = params.toString();
  window.history.replaceState(window.history.state, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
}

function cityCenter(listings, city) {
  const points = listings.filter((l) => l.Miasto === city && l.lat != null && l.lng != null);
  if (points.length === 0) return null;
  return {
    lat: points.reduce((sum, l) => sum + Number(l.lat), 0) / points.length,
    lng: points.reduce((sum, l) => sum + Number(l.lng), 0) / points.length,
  };
}

function matchesText(listing, text) {
  const haystack = `${listing['Sprzęt']} ${listing.Kategoria} ${listing.subcategoryLabel} ${listing.companyName} ${listing.Miasto}`.toLowerCase();
  return text.toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}

/**
 * Search and filtering over listings already sent by the server. The first render
 * uses default filters, so the server HTML always contains the list; filters from
 * the URL are applied after mount, which is why useSearchParams is not used here.
 */
export default function BrowseListings({
  listings,
  allCities = [],
  lockCategory = false,
  lockCity = false,
  fixedSubcategories = null,
  heading = null,
  emptyHint = null,
}) {
  const [filters, setFilters] = useState(DEFAULTS);
  const [view, setView] = useState('list');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setFilters(readUrlFilters());
    if (new URLSearchParams(window.location.search).get('view') === 'map') setView('map');
  }, []);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const close = (event) => { if (event.key === 'Escape') setSheetOpen(false); };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  const update = useCallback((patch) => {
    setFilters((current) => {
      const next = { ...current, ...patch };
      writeUrlFilters(next, view);
      return next;
    });
    setVisible(PAGE_SIZE);
  }, [view]);

  const changeView = (nextView) => {
    setView(nextView);
    writeUrlFilters(filters, nextView);
  };

  const reset = () => {
    setUserLocation(null);
    setLocationError('');
    update(DEFAULTS);
  };

  const cityOptions = useMemo(() => {
    const groups = {};
    allCities.forEach((city) => {
      const slug = getVoivodeshipSlugForCity(city);
      const group = slug ? VOIVODESHIPS[slug]?.name : 'Pozostałe';
      (groups[group] = groups[group] || []).push(city);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Dolnośląskie') return -1;
      if (b === 'Dolnośląskie') return 1;
      return a.localeCompare(b, 'pl');
    });
  }, [allCities]);

  const subcategories = useMemo(() => {
    if (fixedSubcategories) return fixedSubcategories;
    const category = FORM_CATEGORIES.find((c) => c.value === filters.category);
    return category ? SEO_CATEGORIES[category.seoSlug]?.filters || [] : [];
  }, [filters.category, fixedSubcategories]);

  const center = useMemo(() => {
    if (userLocation) return userLocation;
    if (filters.city) return cityCenter(listings, filters.city);
    return null;
  }, [userLocation, filters.city, listings]);

  const results = useMemo(() => {
    const maxPrice = Number(filters.maxPrice);
    const radius = Number(filters.radius);

    const matched = listings
      .map((listing) => {
        if (!center || listing.lat == null || listing.lng == null) return listing;
        return { ...listing, _distance: Math.round(haversineDistance(center.lat, center.lng, Number(listing.lat), Number(listing.lng))) };
      })
      .filter((listing) => {
        if (filters.q && !matchesText(listing, filters.q)) return false;
        if (filters.category && listing._rawCategory !== filters.category) return false;
        if (filters.sub && listing.subcategory !== filters.sub) return false;
        if (filters.delivery && listing.deliveryAvailable !== true) return false;
        if (filters.operator && listing.withOperator !== true) return false;
        if (filters.maxPrice && listing.priceType === 'fixed' && listing.priceAmount > maxPrice) return false;
        if (center) {
          if (radius > 0) {
            if (listing._distance == null) return listing.Miasto === filters.city;
            return listing._distance <= radius;
          }
          return listing.Miasto === filters.city;
        }
        if (filters.city && listing.Miasto !== filters.city) return false;
        return true;
      });

    if (filters.sort === 'price') {
      return [...matched].sort((a, b) => (a.priceAmount ?? Infinity) - (b.priceAmount ?? Infinity));
    }
    if (filters.sort === 'distance' || (center && !filters.sort)) {
      return [...matched].sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));
    }
    return matched;
  }, [listings, filters, center]);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationError('Twoja przeglądarka nie udostępnia lokalizacji.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        update({ city: '', sort: 'distance' });
      },
      () => {
        setLocating(false);
        setLocationError('Nie udało się pobrać lokalizacji. Wybierz miejscowość z listy.');
      },
      { timeout: 10000 }
    );
  };

  const activeCount = ['category', 'sub', 'city', 'maxPrice', 'delivery', 'operator'].filter((key) => filters[key]).length
    + (userLocation ? 1 : 0);

  const filterControls = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {!lockCategory && (
        <div>
          <label htmlFor="filter-category" className={labelClass}>Kategoria</label>
          <select id="filter-category" className={selectClass} value={filters.category} onChange={(e) => update({ category: e.target.value, sub: '' })}>
            <option value="">Wszystkie kategorie</option>
            {FORM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}

      {subcategories.length > 0 && (
        <div>
          <label htmlFor="filter-sub" className={labelClass}>Typ sprzętu</label>
          <select id="filter-sub" className={selectClass} value={filters.sub} onChange={(e) => update({ sub: e.target.value })}>
            <option value="">Dowolny typ</option>
            {subcategories.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {!lockCity && (
        <div>
          <label htmlFor="filter-city" className={labelClass}>Miejscowość</label>
          <select
            id="filter-city"
            className={selectClass}
            value={filters.city}
            onChange={(e) => { setUserLocation(null); update({ city: e.target.value }); }}
          >
            <option value="">Wszystkie miejscowości</option>
            {cityOptions.map(([group, cities]) => (
              <optgroup key={group} label={group}>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {center && (
        <div>
          <label htmlFor="filter-radius" className={labelClass}>Odległość</label>
          <select id="filter-radius" className={selectClass} value={filters.radius} onChange={(e) => update({ radius: e.target.value })}>
            {filters.city && <option value="0">Tylko ta miejscowość</option>}
            {RADIUS_OPTIONS.map((km) => <option key={km} value={km}>Do {km} km</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="filter-price" className={labelClass}>Cena do (zł)</label>
        <input
          id="filter-price"
          type="number"
          min="0"
          step="10"
          inputMode="numeric"
          placeholder="Dowolna"
          className={selectClass}
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="filter-sort" className={labelClass}>Sortowanie</label>
        <select id="filter-sort" className={selectClass} value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
          {SORT_OPTIONS.filter((o) => o.value !== 'distance' || center).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2 lg:col-span-4">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={Boolean(filters.delivery)} onChange={(e) => update({ delivery: e.target.checked ? '1' : '' })} />
          Z dostawą
        </label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={Boolean(filters.operator)} onChange={(e) => update({ operator: e.target.checked ? '1' : '' })} />
          Z operatorem
        </label>
        {!lockCity && (
          <button type="button" onClick={locate} disabled={locating} className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-600 hover:underline disabled:opacity-60 dark:text-brand-400">
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {locating ? 'Sprawdzam lokalizację…' : 'Blisko mnie'}
          </button>
        )}
        {activeCount > 0 && (
          <button type="button" onClick={reset} className="min-h-[44px] text-sm font-medium text-slate-600 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            Wyczyść filtry
          </button>
        )}
      </div>
      {locationError && <p role="alert" className="text-sm text-red-700 dark:text-red-400 sm:col-span-2 lg:col-span-4">{locationError}</p>}
    </div>
  );

  return (
    <section aria-label="Wyszukiwarka ofert">
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <label htmlFor="filter-q" className="sr-only">Czego szukasz?</label>
            <input
              id="filter-q"
              type="search"
              placeholder="Czego szukasz? np. minikoparka, zagęszczarka"
              className={`${selectClass} pl-9`}
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-11 flex-shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 dark:border-slate-600 dark:text-slate-200 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtry{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
        <div className="mt-4 hidden lg:block">{filterControls}</div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtry">
          <button type="button" aria-label="Zamknij filtry" className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Filtry</h2>
              <button type="button" aria-label="Zamknij" className="flex h-11 w-11 items-center justify-center text-slate-600 dark:text-slate-300" onClick={() => setSheetOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {filterControls}
            <button type="button" onClick={() => setSheetOpen(false)} className="mt-5 h-12 w-full rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700">
              Pokaż {offersLabel(results.length)}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 mt-6 flex items-center justify-between gap-3">
        {heading || (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Oferty wynajmu</h2>
        )}
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">{offersLabel(results.length)}</span>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
            <button type="button" aria-pressed={view === 'list'} onClick={() => changeView('list')} className={`flex h-10 items-center gap-1.5 px-3 text-sm ${view === 'list' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'}`}>
              <LayoutGrid className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Lista</span>
            </button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => changeView('map')} className={`flex h-10 items-center gap-1.5 px-3 text-sm ${view === 'map' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'}`}>
              <MapIcon className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <MapComponent listings={results} searchCenter={center} radius={center ? Number(filters.radius) : 0} isCompact />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {results.slice(0, visible).map((listing) => (
              <ListingCard key={listing.ID_sprzetu} listing={listing} />
            ))}
          </div>
          {results.length > visible && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="h-11 rounded-lg border border-slate-300 px-6 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                Pokaż więcej ({results.length - visible})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">Brak ofert dla wybranych filtrów</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {emptyHint || 'Zmień kryteria lub sprawdź wypożyczalnie w katalogu firm. Często mają więcej sprzętu niż w ogłoszeniach.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">Wyczyść filtry</button>
            <Link href="/katalog" className="flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-800 dark:border-slate-600 dark:text-slate-200">Katalog firm</Link>
          </div>
        </div>
      )}
    </section>
  );
}
