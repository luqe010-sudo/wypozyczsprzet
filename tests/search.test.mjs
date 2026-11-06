import assert from 'node:assert/strict';
import test from 'node:test';
import { getSeoSlugByDbKey } from '../lib/categories.js';
import { geocodeSearchCity } from '../lib/geocoding.js';
import { getVoivodeship, getVoivodeshipSlugForCity, isVoivodeshipSlug } from '../lib/regions.js';
import { featuredListings, findListings, listingCityCenter, readSearchFilters, readSearchView, searchQuery } from '../lib/search.js';

function offer(overrides) {
  return { 'Sprzęt': 'Minikoparka', Miasto: 'Łódź', lat: 51.75, lng: 19.45, ...overrides };
}

test('SEO lookups only resolve configured category and region keys', () => {
  assert.equal(getVoivodeshipSlugForCity('Wrocław'), 'dolnoslaskie');
  assert.equal(getVoivodeshipSlugForCity('constructor'), null);
  assert.equal(isVoivodeshipSlug('constructor'), false);
  assert.equal(getVoivodeship('__proto__'), null);
  assert.equal(getSeoSlugByDbKey('constructor'), 'narzedzia');
});

test('a plural search term finds the singular name and the other way round', () => {
  const singular = offer({ 'Sprzęt': 'Minikoparka' });
  const plural = offer({ 'Sprzęt': 'Minikoparki JCB' });
  const other = offer({ 'Sprzęt': 'Agregat' });
  const offers = [singular, plural, other];
  assert.deepEqual(findListings(offers, readSearchFilters({ q: 'minikoparki' })), [singular, plural]);
  assert.deepEqual(findListings(offers, readSearchFilters({ q: 'Minikoparka' })), [singular, plural]);
});

test('the default list is newest first and featured offers follow the query but not the location', () => {
  const older = offer({ isFeatured: true, created_at: '2026-01-01' });
  const newer = offer({ created_at: '2026-06-01', Miasto: 'Zgierz' });
  const featuredElsewhere = offer({ 'Sprzęt': 'Agregat', isFeatured: true, Miasto: 'Zgierz', created_at: '2026-03-01' });
  const offers = [older, featuredElsewhere, newer];
  assert.deepEqual(findListings(offers, readSearchFilters({})), [newer, featuredElsewhere, older]);
  assert.deepEqual(featuredListings(offers, { ...readSearchFilters({ city: 'Łódź' }) }), [featuredElsewhere, older]);
  assert.deepEqual(featuredListings(offers, readSearchFilters({ q: 'agregaty' })), [featuredElsewhere]);
});

test('search URLs support legacy terms and preserve price unit, exact city and map mode', () => {
  const params = new URLSearchParams('s=koparka&city=Łódź&radius=00&priceUnit=day&view=map');
  const filters = readSearchFilters(params);
  assert.equal(filters.q, 'koparka');
  assert.equal(filters.radius, '0');
  assert.equal(searchQuery(filters, readSearchView(params)), '?q=koparka&city=%C5%81%C3%B3d%C5%BA&radius=0&priceUnit=day&view=map');
});

test('city search compares names without diacritics and counts each coordinate once', () => {
  const first = offer({ lat: '51.75', lng: '19.45' });
  const second = offer({ lat: 51.85, lng: 19.55 });
  const third = offer({ Miasto: 'Zgierz' });
  const unlocated = offer({ lat: null, lng: null });
  const offers = [first, first, second, third, unlocated];
  assert.deepEqual(listingCityCenter(offers, 'lodz'), { lat: 51.8, lng: 19.5 });
  assert.deepEqual(findListings(offers, readSearchFilters({ city: 'LODZ', radius: '0' }), null), [first, first, second, unlocated]);
});

test('radius is compared before rounding and unlocated offers only match the chosen city', () => {
  const center = { lat: 51.75, lng: 19.45 };
  const nearby = offer({ lat: 51.80, Miasto: 'Zgierz' });
  const outside = offer({ lat: 51.841, Miasto: 'Zgierz' }); // About 10.1 km, rounded to 10.
  const exactCityWithoutCoordinates = offer({ lat: null });
  const anotherCityWithoutCoordinates = offer({ lat: null, Miasto: 'Zgierz' });
  const offers = [outside, nearby, exactCityWithoutCoordinates, anotherCityWithoutCoordinates];
  const matches = findListings(offers, readSearchFilters({ city: 'Łódź', radius: '10' }), center);
  assert.deepEqual(matches, [{ ...nearby, _distance: 6 }, exactCityWithoutCoordinates]);
});

test('fixed prices filter by unit and availability of delivery, with real newest and price sorting', () => {
  const cheap = offer({ priceType: 'fixed', priceAmount: 80, Czas: 'doba', deliveryAvailable: true, created_at: '2025-11-01' });
  const expensive = offer({ priceType: 'fixed', priceAmount: 120, Czas: 'doba', deliveryAvailable: true, created_at: '2026-01-01' });
  const hourly = offer({ priceType: 'fixed', priceAmount: 30, Czas: 'godzina', deliveryAvailable: true });
  const byRequest = offer({ priceType: 'on_request', priceAmount: 10, Czas: 'doba', deliveryAvailable: true });
  const noDelivery = offer({ priceType: 'fixed', priceAmount: 90, Czas: 'doba', deliveryAvailable: false });
  const offers = [cheap, expensive, hourly, byRequest, noDelivery];
  const filters = { priceUnit: 'day', delivery: '1', minPrice: '50', maxPrice: '150' };
  assert.deepEqual(findListings(offers, readSearchFilters({ ...filters, sort: 'newest' })), [expensive, cheap]);
  assert.deepEqual(findListings(offers, readSearchFilters({ ...filters, sort: 'price' })), [cheap, expensive]);
  assert.deepEqual(findListings([byRequest, cheap], readSearchFilters({ sort: 'price' })), [cheap, byRequest]);
});

test('geocoding restricts finalized locality queries to Poland and rejects ambiguous matches', async (context) => {
  const key = 'NEXT_PUBLIC_MAPTILER_KEY';
  const previousKey = process.env[key];
  process.env[key] = 'fixture';
  context.after(() => {
    if (previousKey === undefined) delete process.env[key];
    else process.env[key] = previousKey;
  });

  let features = [{ text: 'Łódź', center: [19.45, 51.75] }];
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url.searchParams.get('country'), 'pl');
    assert.equal(url.searchParams.get('autocomplete'), 'false');
    return { ok: true, json: async () => ({ features }) };
  });

  assert.deepEqual(await geocodeSearchCity('lodz'), { lat: 51.75, lng: 19.45 });
  features = [...features, { text: 'Łódź', center: [20, 52] }];
  assert.equal(await geocodeSearchCity('Łódź'), null);
  assert.equal(await geocodeSearchCity('ulica 12'), null);
});
