'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LayoutGrid, LocateFixed, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
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

const selectClass = 'h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 disabled:opacity-55 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
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
  searchIntro = null,
  beforeResults = null,
}) {
  const [filters, setFilters] = useState(DEFAULTS);
  const [view, setView] = useState('list');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const filterDialog = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const syncUrl = () => {
      setFilters(readUrlFilters());
      setView(new URLSearchParams(window.location.search).get('view') === 'map' ? 'map' : 'list');
      setVisible(PAGE_SIZE);
    };
    syncUrl();
    window.addEventListener('popstate', syncUrl);
    return () => window.removeEventListener('popstate', syncUrl);
  }, []);

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

  const citySelect = (id, className = selectClass) => (
    <select id={id} className={className} value={filters.city} onChange={(event) => { setUserLocation(null); update({ city: event.target.value }); }}>
      <option value="">Wszystkie miejscowości</option>
      {cityOptions.map(([group, cities]) => (
        <optgroup key={group} label={group}>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const radiusSelect = (id, className = selectClass) => (
    <select id={id} className={className} value={filters.radius} disabled={!center} onChange={(event) => update({ radius: event.target.value })}>
      {filters.city && <option value="0">Tylko ta miejscowość</option>}
      {RADIUS_OPTIONS.map((km) => <option key={km} value={km}>Do {km} km</option>)}
    </select>
  );

  const filterControls = (idPrefix) => (
    <div className="grid gap-4">
      {!lockCategory && (
        <div>
          <label htmlFor={idPrefix + '-category'} className={labelClass}>Kategoria</label>
          <select id={idPrefix + '-category'} className={selectClass} value={filters.category} onChange={(e) => update({ category: e.target.value, sub: '' })}>
            <option value="">Wszystkie kategorie</option>
            {FORM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}

      {subcategories.length > 0 && (
        <div>
          <label htmlFor={idPrefix + '-sub'} className={labelClass}>Typ sprzętu</label>
          <select id={idPrefix + '-sub'} className={selectClass} value={filters.sub} onChange={(e) => update({ sub: e.target.value })}>
            <option value="">Dowolny typ</option>
            {subcategories.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {!lockCity && !searchIntro && (
        <div>
          <label htmlFor={idPrefix + '-city'} className={labelClass}>Miejscowość</label>
          {citySelect(idPrefix + '-city')}
        </div>
      )}

      {center && !searchIntro && (
        <div>
          <label htmlFor={idPrefix + '-radius'} className={labelClass}>Odległość</label>
          {radiusSelect(idPrefix + '-radius')}
        </div>
      )}

      <div>
        <label htmlFor={idPrefix + '-price'} className={labelClass}>Cena do (zł)</label>
        <input
          id={idPrefix + '-price'}
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
        <label htmlFor={idPrefix + '-sort'} className={labelClass}>Sortowanie</label>
        <select id={idPrefix + '-sort'} className={selectClass} value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
          {SORT_OPTIONS.filter((o) => o.value !== 'distance' || center).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col items-start">
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
      {locationError && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{locationError}</p>}
    </div>
  );

  const searchField = (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <label htmlFor="filter-q" className="sr-only">Czego szukasz?</label>
      <input
        id="filter-q"
        type="search"
        placeholder="Czego szukasz? Np. minikoparka"
        className={`${selectClass} pl-10`}
        value={filters.q}
        onChange={(event) => update({ q: event.target.value })}
      />
    </div>
  );

  const filtersButton = (
    <button type="button" onClick={() => filterDialog.current?.showModal()} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${searchIntro ? '' : 'lg:hidden'}`}>
      <SlidersHorizontal size={17} aria-hidden="true" />
      Filtry{activeCount > 0 ? ` (${activeCount})` : ''}
    </button>
  );

  const resultsContent = (
    <div id="oferty" ref={resultsRef} tabIndex={-1} className="min-w-0 scroll-mt-20 focus:outline-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {heading || <h2 className="market-heading">Oferty wynajmu</h2>}
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">{offersLabel(results.length)}</p>
        </div>
        <div className="flex items-center gap-2">
          {searchIntro && filtersButton}
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800" aria-label="Widok wyników" role="group">
            <button type="button" aria-label="Lista" aria-pressed={view === 'list'} onClick={() => changeView('list')} className="market-view-button">
              <LayoutGrid size={16} aria-hidden="true" /><span className="hidden sm:inline">Lista</span>
            </button>
            <button type="button" aria-label="Mapa" aria-pressed={view === 'map'} onClick={() => changeView('map')} className="market-view-button">
              <MapIcon size={16} aria-hidden="true" /><span className="hidden sm:inline">Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className={`grid overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${searchIntro && results.length > 0 ? 'lg:grid-cols-[20rem_minmax(0,1fr)]' : ''}`}>
          {searchIntro && results.length > 0 && (
            <div className="hidden h-[34rem] space-y-2 overflow-y-auto border-r border-slate-200 p-3 dark:border-slate-700 lg:block">
              {results.slice(0, visible).map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} layout="compact" />)}
              {results.length > visible && (
                <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">
                  Pokaż więcej ({results.length - visible})
                </button>
              )}
            </div>
          )}
          <div className="relative h-[65vh] min-h-[22rem] lg:h-[34rem]">
            <MapComponent listings={results} searchCenter={center} radius={center ? Number(filters.radius) : 0} isCompact />
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className={searchIntro ? 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1'}>
            {results.slice(0, visible).map((listing) => (
              <ListingCard key={listing.ID_sprzetu} listing={listing} layout={searchIntro ? 'grid' : 'row'} />
            ))}
          </div>
          {results.length > visible && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Pokaż więcej ({results.length - visible})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800 sm:p-8">
          <Search size={24} className="mx-auto mb-3 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <h3 className="mb-2 font-bold text-slate-900 dark:text-white">Brak ofert dla wybranych filtrów</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {emptyHint || 'Zmień kryteria lub sprawdź wypożyczalnie w katalogu firm. Często mają więcej sprzętu niż w ogłoszeniach.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="market-action">Wyczyść filtry</button>
            <Link href="/katalog" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200">Katalog firm</Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="Wyszukiwarka ofert">
      {searchIntro ? (
        <>
          <div id="szukaj" className="relative isolate scroll-mt-16 overflow-hidden bg-slate-950">
            <div className="relative mx-auto max-w-7xl px-4 pb-5 sm:px-6 sm:pb-8 lg:pb-10">
              {searchIntro}
              <form onSubmit={(event) => {
                event.preventDefault();
                resultsRef.current?.focus({ preventScroll: true });
                resultsRef.current?.scrollIntoView({ block: 'start' });
              }} className="relative grid gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.25fr)_minmax(0,1fr)_auto]">
                {searchField}
                <div className="relative min-w-0">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  <label htmlFor="hero-city" className="sr-only">Miejscowość</label>
                  {citySelect('hero-city', `${selectClass} pl-10`)}
                </div>
                <div className="relative min-w-0">
                  <LocateFixed className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  <label htmlFor="hero-radius" className="sr-only">Promień wyszukiwania</label>
                  {radiusSelect('hero-radius', `${selectClass} pl-10`)}
                </div>
                <button type="submit" className="market-action px-6"><Search size={17} aria-hidden="true" /> Szukaj</button>
              </form>
            </div>
          </div>
          {beforeResults}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{resultsContent}</div>
        </>
      ) : (
        <>
          <div className="mb-5 flex gap-2">{searchField}{filtersButton}</div>
          <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="hidden rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 lg:block">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal size={17} aria-hidden="true" /> Filtry</h2>
              {filterControls('sidebar')}
            </aside>
            {resultsContent}
          </div>
        </>
      )}

      <dialog ref={filterDialog} aria-labelledby="filters-heading" className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-950/60 dark:bg-slate-900 dark:text-white sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="filters-heading" className="text-lg font-bold">Filtry</h2>
          <button type="button" aria-label="Zamknij filtry" className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => filterDialog.current?.close()}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {filterControls('dialog')}
        <button type="button" onClick={() => filterDialog.current?.close()} className="market-action mt-4 w-full">
          Pokaż {offersLabel(results.length)}
        </button>
      </dialog>
    </section>
  );
}
