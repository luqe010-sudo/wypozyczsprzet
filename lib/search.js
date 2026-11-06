import { matchesMarketCategory } from './categories.js';
import { haversineDistance } from './distance.js';
import { rentalDates } from './rentalDates.js';

export const RADIUS_OPTIONS = [10, 25, 50, 100];
export const PRICE_UNITS = { hour: 'godzina', day: 'doba', week: 'tydzień', month: 'miesiąc' };
export const SEARCH_DEFAULTS = {
  q: '', category: '', sub: '', city: '', radius: '25', from: '', to: '',
  minPrice: '', maxPrice: '', priceUnit: '', delivery: '', operator: '',
  availability: '', spec: '', specValue: '', sort: '',
};

function readParam(params, key) {
  const value = typeof params?.get === 'function' ? params.get(key) : params?.[key];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export function normalizeSearchText(value) {
  return String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/g, 'l');
}

/** Lets "minikoparki" find "Minikoparka": Polish plurals and cases mostly differ in the last vowel. */
function searchStem(word) {
  return word.length > 4 ? word.replace(/[aeiouy]$/, '') : word;
}

export function readSearchFilters(params) {
  const filters = { ...SEARCH_DEFAULTS };
  for (const key of Object.keys(filters)) {
    const value = readParam(params, key);
    if (value) filters[key] = value;
  }
  filters.q = (filters.q || readParam(params, 's')).slice(0, 120);
  filters.city = filters.city.trim().slice(0, 80);
  filters.radius = /^\d{1,3}$/.test(filters.radius) ? String(Number(filters.radius)) : SEARCH_DEFAULTS.radius;
  if (!Object.hasOwn(PRICE_UNITS, filters.priceUnit)) filters.priceUnit = '';
  if (!['price', 'distance', 'newest'].includes(filters.sort)) filters.sort = '';
  for (const key of ['minPrice', 'maxPrice']) {
    if (!Number.isFinite(Number(filters[key])) || Number(filters[key]) < 0) filters[key] = '';
  }
  return { ...filters, ...rentalDates(filters) };
}

export function readSearchView(params) {
  return readParam(params, 'view') === 'map' ? 'map' : 'list';
}

export function searchQuery(filters, view) {
  const params = new URLSearchParams();
  for (const key of Object.keys(SEARCH_DEFAULTS)) {
    if (filters[key] && filters[key] !== SEARCH_DEFAULTS[key]) params.set(key, filters[key]);
  }
  if (view === 'map') params.set('view', 'map');
  return params.size ? `?${params}` : '';
}

export function listingCoordinates(listing) {
  if (listing.lat == null || listing.lng == null || listing.lat === '' || listing.lng === '') return null;
  const lat = Number(listing.lat);
  const lng = Number(listing.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function listingCityCenter(listings, city) {
  const normalizedCity = normalizeSearchText(city);
  if (!normalizedCity) return null;
  const points = new Map();
  for (const listing of listings) {
    if (normalizeSearchText(listing.Miasto) !== normalizedCity) continue;
    const point = listingCoordinates(listing);
    if (point) points.set(`${point.lat},${point.lng}`, point);
  }
  if (points.size === 0) return null;
  const total = { lat: 0, lng: 0 };
  for (const point of points.values()) {
    total.lat += point.lat;
    total.lng += point.lng;
  }
  return { lat: total.lat / points.size, lng: total.lng / points.size };
}

export function findListings(listings, filters, center) {
  const city = normalizeSearchText(filters.city);
  const words = normalizeSearchText(filters.q).split(/\s+/).filter(Boolean).map(searchStem);
  const specValue = normalizeSearchText(filters.specValue);
  const radius = Number(filters.radius);
  const matched = [];

  for (const listing of listings) {
    if (words.length) {
      const haystack = normalizeSearchText(`${listing['Sprzęt']} ${listing.Kategoria} ${listing.subcategoryLabel || ''} ${listing.companyName || ''} ${listing.Miasto}`);
      if (!words.every((word) => haystack.includes(word))) continue;
    }
    if (filters.category && !matchesMarketCategory(listing, filters.category)) continue;
    if (filters.sub && listing.subcategory !== filters.sub) continue;
    if (filters.delivery && listing.deliveryAvailable !== true) continue;
    if (filters.operator && listing.withOperator !== true) continue;
    if (filters.availability && listing.availability !== filters.availability) continue;
    if (filters.spec && (!Object.hasOwn(listing.specs || {}, filters.spec) || !normalizeSearchText(listing.specs[filters.spec]).includes(specValue))) continue;
    if (filters.priceUnit || filters.minPrice || filters.maxPrice) {
      if (listing.priceType !== 'fixed' || !Number.isFinite(listing.priceAmount)) continue;
      if (filters.priceUnit && listing.Czas !== PRICE_UNITS[filters.priceUnit]) continue;
      if (filters.minPrice && listing.priceAmount < Number(filters.minPrice)) continue;
      if (filters.maxPrice && listing.priceAmount > Number(filters.maxPrice)) continue;
    }

    const point = center && listingCoordinates(listing);
    const distance = point ? haversineDistance(center.lat, center.lng, point.lat, point.lng) : Infinity;
    if (center && radius > 0 && point) {
      if (distance > radius) continue;
    } else if (city) {
      if (normalizeSearchText(listing.Miasto) !== city) continue;
    } else if (center) {
      continue;
    }
    matched.push({ listing, distance });
  }

  if (filters.sort === 'price') {
    const amount = (listing) => listing.priceType === 'fixed' && Number.isFinite(listing.priceAmount)
      ? listing.priceAmount : Infinity;
    matched.sort((a, b) => amount(a.listing) - amount(b.listing));
  }
  if (filters.sort === 'newest' || (!filters.sort && !center)) {
    const createdAt = (listing) => Date.parse(listing.created_at) || 0;
    matched.sort((a, b) => createdAt(b.listing) - createdAt(a.listing));
  }
  if (center && (!filters.sort || filters.sort === 'distance')) {
    matched.sort((a, b) => a.distance - b.distance);
  }
  return matched.map(({ listing, distance }) => (
    Number.isFinite(distance) ? { ...listing, _distance: Math.round(distance) } : listing
  ));
}

/** Featured offers matching what the visitor is looking for; location is left out on purpose. */
export function featuredListings(listings, { q = '', category = '', sub = '' } = {}) {
  return findListings(listings.filter((listing) => listing.isFeatured), { ...SEARCH_DEFAULTS, q, category, sub }, null);
}
