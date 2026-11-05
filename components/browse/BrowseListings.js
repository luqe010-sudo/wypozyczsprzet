'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CalendarDays, List, LocateFixed, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import ListingCard from '../ListingCard';
import { MARKET_CATEGORIES, SEO_CATEGORIES, matchesMarketCategory } from '../../lib/categories';
import { getVoivodeshipSlugForCity, VOIVODESHIPS } from '../../lib/regions';
import { haversineDistance } from '../../lib/distance';
import { offersLabel } from '../../lib/format';
import { rentalDates, todayInPoland } from '../../lib/rentalDates';

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
const DEFAULTS = {
  q: '', category: '', sub: '', city: '', radius: '25', from: '', to: '',
  minPrice: '', maxPrice: '', delivery: '', operator: '', availability: '', spec: '', specValue: '', sort: '',
};

const selectClass = 'h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 disabled:opacity-55 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

function readUrlFilters(params) {
  const next = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach((key) => {
    const value = params.get(key);
    if (value !== null) next[key] = value;
  });
  // Links from before the search moved here used ?s=
  if (params.get('s') && !next.q) next.q = params.get('s');
  return { ...next, ...rentalDates(next) };
}

function SearchUrlSync({ onChange }) {
  const params = useSearchParams();
  useEffect(() => { onChange(params); }, [onChange, params]);
  return null;
}

function filterQuery(filters, view) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== DEFAULTS[key]) params.set(key, value);
  });
  if (view === 'map') params.set('view', 'map');
  const query = params.toString();
  return query ? `?${query}` : '';
}

function writeUrlFilters(filters, view) {
  const { pathname, hash } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${filterQuery(filters, view)}${hash}`);
}

function cityCenter(listings, city) {
  const points = listings.filter((l) => l.Miasto === city && l.lat != null && l.lng != null);
  if (points.length === 0) return null;
  return {
    lat: points.reduce((sum, l) => sum + Number(l.lat), 0) / points.length,
    lng: points.reduce((sum, l) => sum + Number(l.lng), 0) / points.length,
  };
}

function normalizeText(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/g, 'l');
}

function matchesText(listing, text) {
  const haystack = normalizeText(`${listing['Sprzęt']} ${listing.Kategoria} ${listing.subcategoryLabel} ${listing.companyName} ${listing.Miasto}`);
  return normalizeText(text).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
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
  splitMap = false,
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULTS);
  const currentFilters = useRef(DEFAULTS);
  const [view, setView] = useState('list');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const filterDialog = useRef(null);
  const dateDialog = useRef(null);
  const resultsRef = useRef(null);

  const syncUrl = useCallback((params) => {
    const next = readUrlFilters(params);
    if (filterQuery(next, 'list') !== filterQuery(currentFilters.current, 'list')) {
      currentFilters.current = next;
      setFilters(next);
      setVisible(PAGE_SIZE);
      if (next.city) setUserLocation(null);
    }
    setView(params.get('view') === 'map' ? 'map' : 'list');
  }, []);

  const update = useCallback((patch) => {
    const next = { ...currentFilters.current, ...patch };
    currentFilters.current = next;
    setFilters(next);
    writeUrlFilters(next, view);
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
    if (!filters.category) return [];
    const category = MARKET_CATEGORIES.find((item) => item.value === filters.category);
    const fallback = SEO_CATEGORIES[category?.hub]?.filters || [];
    const options = new Map(fallback.map(({ value, label }) => [value, label]));
    listings.forEach((listing) => {
      if (!listing.subcategory || !matchesMarketCategory(listing, filters.category)) return;
      if (listing.subcategoryLabel) options.set(listing.subcategory, listing.subcategoryLabel);
    });
    return [...options].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'pl'));
  }, [filters.category, fixedSubcategories, listings]);

  const availableSpecs = useMemo(() => {
    if (!filters.category && !lockCategory) return [];
    const names = new Set();
    listings.forEach((listing) => {
      if (filters.category && !matchesMarketCategory(listing, filters.category)) return;
      if (filters.sub && listing.subcategory !== filters.sub) return;
      Object.keys(listing.specs || {}).forEach((name) => names.add(name));
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'pl'));
  }, [filters.category, filters.sub, listings, lockCategory]);

  const center = useMemo(() => {
    if (userLocation) return userLocation;
    if (filters.city) return cityCenter(listings, filters.city);
    return null;
  }, [userLocation, filters.city, listings]);

  const results = useMemo(() => {
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);
    const radius = Number(filters.radius);
    const specValue = normalizeText(filters.specValue).trim();

    const matched = listings
      .map((listing) => {
        if (!center || listing.lat == null || listing.lng == null) return listing;
        return { ...listing, _distance: Math.round(haversineDistance(center.lat, center.lng, Number(listing.lat), Number(listing.lng))) };
      })
      .filter((listing) => {
        if (filters.q && !matchesText(listing, filters.q)) return false;
        if (filters.category && !matchesMarketCategory(listing, filters.category)) return false;
        if (filters.sub && listing.subcategory !== filters.sub) return false;
        if (filters.delivery && listing.deliveryAvailable !== true) return false;
        if (filters.operator && listing.withOperator !== true) return false;
        if (filters.availability && listing.availability !== filters.availability) return false;
        if (filters.spec && (!Object.hasOwn(listing.specs || {}, filters.spec) || !normalizeText(listing.specs[filters.spec]).includes(specValue))) return false;
        if (filters.minPrice || filters.maxPrice) {
          if (listing.priceType !== 'fixed' || listing.priceAmount == null) return false;
          if (filters.minPrice && listing.priceAmount < minPrice) return false;
          if (filters.maxPrice && listing.priceAmount > maxPrice) return false;
        }
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

  const dateParams = new URLSearchParams();
  const dates = rentalDates(filters);
  const today = todayInPoland();
  if (dates.from) dateParams.set('from', dates.from);
  if (dates.to) dateParams.set('to', dates.to);
  const rentalQuery = dateParams.size ? `?${dateParams}` : '';
  const filterPriceError = filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice);
  const hasAvailability = listings.some((listing) => listing.availability === 'immediately');

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

  const activeCount = ['category', 'sub', 'city', 'minPrice', 'maxPrice', 'delivery', 'operator', 'availability', 'spec'].filter((key) => filters[key]).length
    + (userLocation ? 1 : 0);

  const citySelect = (id, className = selectClass, placeholder = 'Wszystkie miejscowości') => (
    <select id={id} className={className} value={filters.city} onChange={(event) => { setUserLocation(null); update({ city: event.target.value }); }}>
      <option value="">{placeholder}</option>
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

  const dateControls = (idPrefix) => (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label htmlFor={idPrefix + '-from'} className={labelClass}>Wynajem od</label>
          <input id={idPrefix + '-from'} type="date" min={today} className={selectClass} value={filters.from} onInput={(e) => update(rentalDates({ ...currentFilters.current, from: e.currentTarget.value }))} />
        </div>
        <div className="min-w-0">
          <label htmlFor={idPrefix + '-to'} className={labelClass}>Wynajem do</label>
          <input id={idPrefix + '-to'} type="date" min={filters.from || today} className={selectClass} value={filters.to} onInput={(e) => update(rentalDates({ ...currentFilters.current, to: e.currentTarget.value }))} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Termin przeniesiemy do zapytania. Potwierdzi go wynajmujący.</p>
    </div>
  );

  const filterControls = (idPrefix) => (
    <div className="grid gap-4">
      {!lockCategory && (
        <div>
          <label htmlFor={idPrefix + '-category'} className={labelClass}>Kategoria</label>
          <select id={idPrefix + '-category'} className={selectClass} value={filters.category} onChange={(e) => update({ category: e.target.value, sub: '', spec: '', specValue: '' })}>
            <option value="">Wszystkie kategorie</option>
            {MARKET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}

      {subcategories.length > 0 && (
        <div>
          <label htmlFor={idPrefix + '-sub'} className={labelClass}>Typ sprzętu</label>
          <select id={idPrefix + '-sub'} className={selectClass} value={filters.sub} onChange={(e) => update({ sub: e.target.value, spec: '', specValue: '' })}>
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

      <fieldset>
        <legend className={labelClass}>Cena w ofercie (zł)</legend>
        <div className="grid grid-cols-2 gap-2">
          {[['minPrice', 'Od'], ['maxPrice', 'Do']].map(([key, label]) => (
            <div key={key} className="min-w-0">
              <label className="sr-only" htmlFor={idPrefix + '-' + key}>Cena {label.toLowerCase()} (zł)</label>
              <input id={idPrefix + '-' + key} type="number" min="0" step="any" inputMode="decimal" placeholder={label} aria-invalid={filterPriceError ? true : undefined} className={selectClass} value={filters[key]} onChange={(e) => update({ [key]: e.target.value })} />
            </div>
          ))}
        </div>
        {filterPriceError && <p role="alert" className="mt-1 text-xs text-red-700 dark:text-red-400">Cena maksymalna musi być większa lub równa minimalnej.</p>}
      </fieldset>

      {availableSpecs.length > 0 && (
        <div className="space-y-2">
          <div>
            <label htmlFor={idPrefix + '-spec'} className={labelClass}>Parametr sprzętu</label>
            <select id={idPrefix + '-spec'} className={selectClass} value={filters.spec} onChange={(e) => update({ spec: e.target.value, specValue: '' })}>
              <option value="">Dowolny parametr</option>
              {availableSpecs.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          {filters.spec && (
            <div>
              <label htmlFor={idPrefix + '-spec-value'} className={labelClass}>Wartość parametru</label>
              <input id={idPrefix + '-spec-value'} className={selectClass} value={filters.specValue} onChange={(e) => update({ specValue: e.target.value })} />
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor={idPrefix + '-sort'} className={labelClass}>Sortowanie</label>
        <select id={idPrefix + '-sort'} className={selectClass} value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
          {SORT_OPTIONS.filter((o) => o.value !== 'distance' || center).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col items-start">
        {hasAvailability && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
            <input type="checkbox" className="size-4 accent-brand-600" checked={filters.availability === 'immediately'} onChange={(e) => update({ availability: e.target.checked ? 'immediately' : '' })} />
            Dostępny od ręki
          </label>
        )}
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
      {splitMap && dateControls(idPrefix)}
    </div>
  );

  const searchField = (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <label htmlFor="filter-q" className="sr-only">Czego szukasz?</label>
      <input
        id="filter-q"
        type="search"
        placeholder="Np. minikoparka"
        className={`${selectClass} pl-10 text-base sm:text-sm`}
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
          {heading || <h2 className="market-heading">{searchIntro ? 'Oferty w Twojej okolicy' : 'Wyniki wyszukiwania'}</h2>}
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">{offersLabel(results.length)}</p>
        </div>
        <div className="flex items-center gap-2">
          {searchIntro && filtersButton}
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800" aria-label="Widok wyników" role="group">
            <button type="button" aria-label="Lista" aria-pressed={view === 'list'} onClick={() => changeView('list')} className="market-view-button">
              <List size={16} aria-hidden="true" /><span>Lista</span>
            </button>
            <button type="button" aria-label="Mapa" aria-pressed={view === 'map'} onClick={() => changeView('map')} className="market-view-button">
              <MapIcon size={16} aria-hidden="true" /><span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'map' && results.length > 0 ? (
        <div className={`grid overflow-hidden rounded-xl border border-border bg-card ${searchIntro ? 'lg:grid-cols-[19rem_minmax(0,1fr)]' : splitMap ? 'xl:grid-cols-[16rem_minmax(0,1fr)]' : ''}`}>
          {(searchIntro || splitMap) && (
            <div className={`hidden h-[34rem] space-y-2 overflow-y-auto border-r border-border p-2 ${searchIntro ? 'lg:block' : 'xl:block'}`}>
              {results.slice(0, visible).map((listing) => <ListingCard key={listing.ID_sprzetu} listing={listing} layout="compact" rentalQuery={rentalQuery} />)}
              {results.length > visible && (
                <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">
                  Pokaż więcej ({results.length - visible})
                </button>
              )}
            </div>
          )}
          <div className="relative h-[65vh] min-h-[22rem] lg:h-[34rem]">
            <MapComponent listings={results} searchCenter={center} radius={center ? Number(filters.radius) : 0} rentalQuery={rentalQuery} isCompact />
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className={searchIntro ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4' : 'grid grid-cols-1 gap-3'}>
            {results.slice(0, visible).map((listing) => (
              <ListingCard key={listing.ID_sprzetu} listing={listing} layout={searchIntro ? 'grid' : 'row'} rentalQuery={rentalQuery} />
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
          <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{lockCategory && listings.length === 0 ? 'Brak ogłoszeń w tej kategorii' : 'Brak ofert dla wybranych filtrów'}</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {emptyHint || 'Zmień kryteria lub sprawdź wypożyczalnie w katalogu firm. Często mają więcej sprzętu niż w ogłoszeniach.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {lockCategory && listings.length === 0 ? (
              <Link href="/szukaj" className="market-action">Zobacz wszystkie oferty</Link>
            ) : (
              <button type="button" onClick={reset} className="market-action">Wyczyść filtry</button>
            )}
            <Link href="/katalog" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200">Katalog firm</Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="Wyszukiwarka ofert">
      <Suspense><SearchUrlSync onChange={syncUrl} /></Suspense>
      {searchIntro ? (
        <>
          <div id="szukaj" className="relative isolate scroll-mt-16 overflow-hidden bg-market-navy">
            <div className="relative mx-auto max-w-7xl px-4 pb-5 sm:px-6 sm:pb-6 lg:pb-8">
              {searchIntro}
              <form onSubmit={(event) => {
                event.preventDefault();
                if (userLocation) {
                  resultsRef.current?.focus({ preventScroll: true });
                  resultsRef.current?.scrollIntoView({ block: 'start' });
                } else {
                  router.push(`/szukaj${filterQuery(currentFilters.current, view)}`);
                }
              }} className="relative grid gap-2 rounded-xl border border-border bg-card p-2 shadow-xl lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.35fr)_minmax(0,.75fr)_minmax(0,1fr)_auto]">
                {searchField}
                <div className="grid min-w-0 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-2 lg:contents">
                  <div className="relative min-w-0">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    <label htmlFor="hero-city" className="sr-only">Miejscowość</label>
                    {citySelect('hero-city', `${selectClass} pl-9`, 'Miejscowość')}
                  </div>
                  <div className="relative min-w-0">
                    <LocateFixed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    <label htmlFor="hero-radius" className="sr-only">Promień wyszukiwania</label>
                    {radiusSelect('hero-radius', `${selectClass} pl-9`)}
                  </div>
                </div>
                <button type="button" onClick={() => dateDialog.current?.showModal()} className={`${selectClass} flex items-center gap-2 text-left`}>
                  <CalendarDays size={17} className="shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                  <span className="truncate">{rentalQuery ? 'Termin wybrany' : 'Termin wynajmu'}</span>
                </button>
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

      {searchIntro && (
        <dialog ref={dateDialog} aria-labelledby="rental-period-heading" className="market-dialog">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="rental-period-heading" className="text-lg font-bold">Termin wynajmu</h2>
            <button type="button" aria-label="Zamknij wybór terminu" className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => dateDialog.current?.close()}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {dateControls('hero-date')}
          <button type="button" onClick={() => dateDialog.current?.close()} className="market-action mt-4 w-full">Gotowe</button>
        </dialog>
      )}

      <dialog ref={filterDialog} aria-labelledby="filters-heading" className="market-dialog">
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
