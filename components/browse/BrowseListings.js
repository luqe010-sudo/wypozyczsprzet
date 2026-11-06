'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronDown, List, LocateFixed, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import FeaturedListings from '../FeaturedListings';
import ListingCard from '../ListingCard';
import { MARKET_CATEGORIES, SEO_CATEGORIES, matchesMarketCategory } from '../../lib/categories';
import { getVoivodeshipSlugForCity, VOIVODESHIPS } from '../../lib/regions';
import { offersLabel } from '../../lib/format';
import { rentalDates, todayInPoland } from '../../lib/rentalDates';
import { trackEvent } from '../../lib/gtag';
import {
  PRICE_UNITS, RADIUS_OPTIONS, SEARCH_DEFAULTS, featuredListings, findListings, listingCityCenter,
  listingCoordinates, normalizeSearchText, readSearchFilters, readSearchView, searchQuery,
} from '../../lib/search';

const MapComponent = dynamic(() => import('../MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      Ładowanie mapy…
    </div>
  ),
});

const PAGE_SIZE = 24;
const FACET_KEYS = ['category', 'sub', 'minPrice', 'maxPrice', 'priceUnit', 'delivery', 'operator', 'availability', 'spec', 'from', 'to'];

const selectClass = 'h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 disabled:opacity-55 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

function SearchUrlSync({ onChange }) {
  const params = useSearchParams();
  useEffect(() => { onChange(params); }, [onChange, params]);
  return null;
}

function writeUrlFilters(filters, view, addHistoryEntry = false) {
  const { pathname, search, hash } = window.location;
  const query = searchQuery(filters, view);
  if (query === search) return;
  window.history[addHistoryEntry ? 'pushState' : 'replaceState'](null, '', `${pathname}${query}${hash}`);
}

function RadiusOptions({ city, radius, prefix = 'Do', zeroLabel = 'Tylko miejscowość' }) {
  return (
    <>
      {city && <option value="0">{zeroLabel}</option>}
      {RADIUS_OPTIONS.map((km) => <option key={km} value={km}>{prefix} {km} km</option>)}
      {Number(radius) > 0 && !RADIUS_OPTIONS.includes(Number(radius)) && <option value={radius}>{prefix} {radius} km</option>}
    </>
  );
}

const clearSearchCancel = '[&::-webkit-search-cancel-button]:appearance-none';

function SearchFields({ filters, cities, userLocation, pending, onSubmit, onClearQuery }) {
  const [city, setCity] = useState(filters.city);
  const [query, setQuery] = useState(filters.q);
  const hasLocation = Boolean(city.trim()) || Boolean(userLocation);

  return (
    <form action="/szukaj" onSubmit={onSubmit} aria-label="Znajdź sprzęt w okolicy" className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-3 sm:shadow-sm lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]">
      <div className="relative col-span-2 min-w-0 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-3 size-5 text-slate-500" aria-hidden="true" />
        <label htmlFor="search-equipment" className="sr-only">Czego szukasz?</label>
        <input id="search-equipment" name="q" type="search" maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jakiego sprzętu szukasz?" className={`${selectClass} pl-10 pr-10 text-base ${clearSearchCancel}`} />
        {query && (
          <button type="button" aria-label="Wyczyść wyszukiwane słowo" onClick={() => { setQuery(''); if (filters.q) onClearQuery(); }} className="absolute right-0 top-0 grid size-11 place-items-center text-slate-500 hover:text-foreground">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex min-w-0 items-center rounded-lg border border-slate-300 bg-white focus-within:border-amber-500 dark:border-slate-600 dark:bg-slate-800 lg:contents">
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-3 size-5 text-slate-500" aria-hidden="true" />
          <label htmlFor="search-city" className="sr-only">Miejscowość</label>
          <input id="search-city" name="city" type="text" maxLength={80} value={city} onChange={(event) => setCity(event.target.value)} list="search-city-suggestions" placeholder={userLocation ? 'Moja lokalizacja' : 'Wpisz miejscowość'} className={`${selectClass} border-0 bg-transparent pl-10 text-base focus:ring-0 dark:bg-transparent lg:border lg:bg-white lg:focus:ring-2 lg:dark:bg-slate-800`} />
          <datalist id="search-city-suggestions">{cities.map((name) => <option key={name} value={name} />)}</datalist>
        </div>
        <label htmlFor="search-radius" className="sr-only">Promień wyszukiwania</label>
        <div className="relative shrink-0">
          <select id="search-radius" name="radius" className={`${selectClass} w-[5.75rem] appearance-none border-0 lg:w-28 bg-transparent pr-8 font-medium focus:ring-0 dark:bg-transparent lg:border lg:bg-white lg:focus:ring-2 lg:dark:bg-slate-800`} defaultValue={filters.radius} disabled={!hasLocation}>
            <RadiusOptions city={city.trim()} radius={filters.radius} prefix="+" zeroLabel="+ 0 km" />
          </select>
          <ChevronDown size={17} className="pointer-events-none absolute right-2.5 top-3.5" aria-hidden="true" />
        </div>
      </div>
      <button type="submit" disabled={pending} aria-label="Szukaj" className="market-action px-3.5 lg:px-6">
        <Search size={18} aria-hidden="true" /><span className="hidden lg:inline">{pending ? 'Szukam…' : 'Szukaj sprzętu'}</span>
      </button>
    </form>
  );
}

/** Shared browsing controls for the marketplace search and the static SEO hubs. */
export default function BrowseListings({
  listings,
  allCities = [],
  lockCategory = false,
  lockCity = false,
  fixedSubcategories = null,
  heading = null,
  emptyHint = null,
  initialFilters = SEARCH_DEFAULTS,
  initialView = 'list',
  cityCenter = null,
  splitMap = false,
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const currentFilters = useRef(initialFilters);
  const [view, setView] = useState(initialView);
  const [pending, startTransition] = useTransition();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [activeListingId, setActiveListingId] = useState(null);
  const filterDialog = useRef(null);

  const syncUrl = useCallback((params) => {
    const next = readSearchFilters(params);
    if (searchQuery(next) !== searchQuery(currentFilters.current)) {
      currentFilters.current = next;
      setFilters(next);
      setVisible(PAGE_SIZE);
      if (next.city) setUserLocation(null);
    }
    setView(readSearchView(params));
  }, []);

  const update = useCallback((patch, addHistoryEntry = false) => {
    const next = { ...currentFilters.current, ...patch };
    currentFilters.current = next;
    setFilters(next);
    writeUrlFilters(next, readSearchView(new URLSearchParams(window.location.search)), addHistoryEntry);
    setVisible(PAGE_SIZE);
  }, []);

  const changeView = (nextView) => {
    setView(nextView);
    writeUrlFilters(filters, nextView, true);
  };

  const reset = () => {
    setUserLocation(null);
    setLocationError('');
    update(SEARCH_DEFAULTS, true);
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
    if (filters.city && cityCenter && normalizeSearchText(filters.city) === normalizeSearchText(initialFilters.city)) return cityCenter;
    return listingCityCenter(listings, filters.city);
  }, [userLocation, filters.city, cityCenter, initialFilters.city, listings]);

  const results = useMemo(() => findListings(listings, filters, center), [listings, filters, center]);
  const featured = useMemo(() => featuredListings(listings, filters), [listings, filters]);
  const activeListing = view === 'map' ? results.find((listing) => listing.ID_sprzetu === activeListingId) : null;
  // With the default order the featured strip would be repeated right below itself.
  const showFeatured = view !== 'map' && featured.length > 0;
  const listOrder = showFeatured && !filters.sort && !center
    ? [...results.filter((listing) => !listing.isFeatured), ...results.filter((listing) => listing.isFeatured)]
    : results;
  const displayed = listOrder.slice(0, visible);
  const mapListings = activeListing && !displayed.includes(activeListing) ? [activeListing, ...displayed] : displayed;
  const hasMapPoints = view === 'map' && results.some(listingCoordinates);
  const activeCount = FACET_KEYS.filter((key) => filters[key]).length + (!splitMap && filters.city ? 1 : 0);
  const trackedSearch = useRef('');

  useEffect(() => {
    const hasCriteria = activeCount > 0 || filters.q || filters.city || userLocation;
    const signature = `${searchQuery(filters)}|${Boolean(userLocation)}`;
    if (!hasCriteria || trackedSearch.current === signature || pending) return;
    const timer = setTimeout(() => {
      trackedSearch.current = signature;
      trackEvent('search', {
        result_count: results.length,
        filter_count: activeCount,
        has_query: Boolean(filters.q),
        location_mode: userLocation ? 'device' : filters.city ? 'city' : 'none',
        page_location: window.location.origin + window.location.pathname,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [activeCount, filters, pending, results.length, userLocation]);

  const dateParams = new URLSearchParams();
  const dates = rentalDates(filters);
  const today = todayInPoland();
  if (dates.from) dateParams.set('from', dates.from);
  if (dates.to) dateParams.set('to', dates.to);
  const rentalQuery = dateParams.size ? `?${dateParams}` : '';
  const filterPriceError = filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice);
  const hasAvailability = listings.some((listing) => listing.availability === 'immediately');

  const applyDeviceLocation = (coordinates) => {
    setUserLocation(coordinates);
    setLocationError('');
    update({ city: '', radius: currentFilters.current.radius === '0' ? '25' : currentFilters.current.radius, sort: 'distance' }, true);
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationError('Twoja przeglądarka nie udostępnia lokalizacji.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyDeviceLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError('Nie udało się pobrać lokalizacji. Wybierz miejscowość z listy.');
      },
      { timeout: 10000 }
    );
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const typedCity = String(fields.get('city') || '').trim();
    const city = allCities.find((name) => normalizeSearchText(name) === normalizeSearchText(typedCity)) || typedCity;
    const patch = readSearchFilters({
      ...currentFilters.current,
      q: String(fields.get('q') || '').trim(),
      city,
      radius: String(fields.get('radius') || SEARCH_DEFAULTS.radius),
    });

    setLocationError('');
    if (city) setUserLocation(null);
    if (city && normalizeSearchText(city) !== normalizeSearchText(initialFilters.city) && !listingCityCenter(listings, city)) {
      startTransition(() => router.push(`/szukaj${searchQuery(patch, view)}`, { scroll: false }));
      return;
    }
    update(patch, true);
  };

  const citySelect = (id, className = selectClass, placeholder = 'Wszystkie miejscowości') => (
    <select id={id} className={className} value={filters.city} onChange={(event) => { setUserLocation(null); setLocationError(''); update({ city: event.target.value, radius: event.target.value ? filters.radius : SEARCH_DEFAULTS.radius }); }}>
      <option value="">{placeholder}</option>
      {cityOptions.map(([group, cities]) => (
        <optgroup key={group} label={group}>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const radiusSelect = (id) => (
    <select id={id} className={selectClass} value={filters.radius} onChange={(event) => update({ radius: event.target.value })}>
      <RadiusOptions city={filters.city} radius={filters.radius} />
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

      {!lockCity && !splitMap && (
        <div>
          <label htmlFor={idPrefix + '-city'} className={labelClass}>Miejscowość</label>
          {citySelect(idPrefix + '-city')}
        </div>
      )}

      {center && (
        <div>
          <label htmlFor={idPrefix + '-radius'} className={labelClass}>Odległość</label>
          {radiusSelect(idPrefix + '-radius')}
        </div>
      )}

      <fieldset>
        <legend className={labelClass}>Stawka z ogłoszenia (zł)</legend>
        <label htmlFor={idPrefix + '-price-unit'} className="sr-only">Jednostka rozliczenia</label>
        <select id={idPrefix + '-price-unit'} className={`${selectClass} mb-2`} value={filters.priceUnit} onChange={(e) => update({ priceUnit: e.target.value })}>
          <option value="">Dowolna jednostka</option>
          {Object.entries(PRICE_UNITS).map(([value, unit]) => <option key={value} value={value}>{unit}</option>)}
        </select>
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

      <div className="flex flex-col items-start">
        {hasAvailability && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
            <input type="checkbox" className="size-4 accent-brand-600" checked={filters.availability === 'immediately'} onChange={(e) => update({ availability: e.target.checked ? 'immediately' : '' })} />
            Deklarowana dostępność od ręki
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
        {(activeCount > 0 || filters.q || filters.city || userLocation) && (
          <button type="button" onClick={reset} className="min-h-[44px] text-sm font-medium text-slate-600 underline hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            Wyczyść filtry
          </button>
        )}
      </div>
      {splitMap && dateControls(idPrefix)}
    </div>
  );

  const searchField = (
    <div className="relative mb-4 min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <label htmlFor="filter-q" className="sr-only">Czego szukasz?</label>
      <input
        id="filter-q"
        type="search"
        placeholder="Np. minikoparka"
        className={`${selectClass} pl-10 text-base sm:text-sm`}
        value={filters.q}
        maxLength={120}
        onChange={(event) => update({ q: event.target.value })}
      />
    </div>
  );

  const filtersButton = (
    <button type="button" onClick={() => filterDialog.current?.showModal()} className="order-1 flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 lg:hidden">
      <SlidersHorizontal size={17} aria-hidden="true" />
      Filtry{activeCount > 0 ? ` (${activeCount})` : ''}
    </button>
  );

  const moreButton = results.length > visible && (
    <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
      Pokaż więcej ({results.length - visible})
    </button>
  );

  const resultsContent = (
    <div id="oferty" className="min-w-0 scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="order-4 mr-auto min-w-0 lg:order-1">
          <h2 className="market-heading text-lg sm:text-xl">{heading || 'Wyniki'} ({results.length})</h2>
          <p className="sr-only" aria-live="polite">{offersLabel(results.length)}</p>
        </div>
        {filtersButton}
        <div className="order-2 ml-auto flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-800 lg:ml-0" aria-label="Widok wyników" role="group">
          <button type="button" aria-label="Lista" aria-pressed={view === 'list'} onClick={() => changeView('list')} className="market-view-button">
            <List size={16} aria-hidden="true" /><span>Lista</span>
          </button>
          <button type="button" aria-label="Mapa" aria-pressed={view === 'map'} onClick={() => changeView('map')} className="market-view-button">
            <MapIcon size={16} aria-hidden="true" /><span>Mapa</span>
          </button>
        </div>
        <span className="order-3 w-full lg:hidden" aria-hidden="true" />
        <label htmlFor="results-sort" className="relative order-5 flex min-h-11 items-center gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Sortuj:</span>
          <select id="results-sort" className="min-h-11 max-w-[11rem] appearance-none bg-transparent pr-6 font-semibold text-foreground outline-none [&>option]:bg-card" value={filters.sort === 'distance' || (filters.sort === 'newest' && !center) ? '' : filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="">{center ? 'Najbliżej' : 'Najnowsze'}</option>
            {center && <option value="newest">Najnowsze</option>}
            <option value="price">Najniższa stawka</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-0" aria-hidden="true" />
        </label>
      </div>

      {filters.sort === 'price' && !filters.priceUnit && (
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Aby porównać ceny za ten sam okres, wybierz jednostkę rozliczenia w filtrach.</p>
      )}
      {filters.city && !center && filters.radius !== '0' && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200" role="status">
          Nie udało się ustalić środka miejscowości. Wyświetlamy oferty tylko dla „{filters.city}”.
        </p>
      )}
      {locationError && <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-400">{locationError}</p>}

      {hasMapPoints ? (
        <div className="grid overflow-hidden rounded-xl border border-border bg-card xl:grid-cols-[minmax(0,1fr)_17rem]">
          <div data-no-tab-swipe className="relative h-[55dvh] min-h-[20rem] lg:h-[34rem]">
            <MapComponent
              listings={results}
              searchCenter={center}
              radius={center ? Number(filters.radius) : 0}
              onLocationShared={applyDeviceLocation}
              rentalQuery={rentalQuery}
              selectedId={activeListingId}
              onSelect={setActiveListingId}
            />
          </div>
          <div aria-label="Oferty na liście" className="max-h-[28rem] space-y-2 overflow-y-auto border-t border-border p-2 xl:h-[34rem] xl:max-h-none xl:border-l xl:border-t-0">
            {mapListings.map((listing) => (
              <div key={listing.ID_sprzetu} className={`rounded-lg border p-1 ${activeListingId === listing.ID_sprzetu ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-transparent'}`}>
                <ListingCard listing={listing} layout="compact" rentalQuery={rentalQuery} />
                {listingCoordinates(listing) && (
                  <button type="button" onClick={() => setActiveListingId(listing.ID_sprzetu)} aria-label={`Pokaż na mapie: ${listing['Sprzęt']}`} aria-pressed={activeListingId === listing.ID_sprzetu} className="flex min-h-11 w-full items-center gap-1.5 rounded-lg px-2 text-left text-xs font-semibold text-brand-700 hover:bg-slate-100 dark:text-brand-400 dark:hover:bg-slate-700">
                    <MapPin size={15} aria-hidden="true" />Pokaż na mapie
                  </button>
                )}
              </div>
            ))}
            {moreButton}
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          {view === 'map' && <p role="status" className="mb-4 rounded-lg border border-border bg-card p-3 text-sm">Te oferty mają podaną miejscowość. Mapę wyświetlamy dla ofert ze współrzędnymi.</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {displayed.map((listing) => (
              <ListingCard key={listing.ID_sprzetu} listing={listing} rentalQuery={rentalQuery} />
            ))}
          </div>
          {moreButton && <div className="mt-6 text-center">{moreButton}</div>}
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
      {splitMap ? (
        <SearchFields
          key={JSON.stringify([filters.q, filters.city, filters.radius])}
          filters={filters}
          cities={allCities}
          userLocation={userLocation}
          pending={pending}
          onSubmit={submitSearch}
          onClearQuery={() => update({ q: '' }, true)}
        />
      ) : searchField}
      {showFeatured && <FeaturedListings listings={featured} rentalQuery={rentalQuery} className="mb-6" />}
      <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden rounded-xl border border-border bg-card p-4 lg:block">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal size={17} aria-hidden="true" /> Filtry{activeCount > 0 ? ` (${activeCount})` : ''}</h2>
          {filterControls('sidebar')}
        </aside>
        {resultsContent}
      </div>

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
