import 'server-only';
import { fetchAllCompanies } from './supabaseDirectory';
import { citySlug as directoryCitySlug, voivodeshipSlug as directoryVoivodeshipSlug } from './slugify';
import { SEO_CATEGORIES, getCitySlug } from './categories';
import { getVoivodeshipSlugForCity } from './regions';
import { offersLabel } from './format';
import { getCityCoordinates, getNearbyListings, haversineDistance } from './distance';
import { MIN_NEARBY_FOR_INDEXING, NEARBY_RADIUS_KM, SATELLITE_RADIUS_KM } from './site';

/**
 * Offers of one category around a town, nearest first, and whether a hub with no local offers
 * should still be indexed on their strength (rules next to MIN_NEARBY_FOR_INDEXING).
 */
export function nearbyHub(inCategory, allListings, city) {
  const center = city ? getCityCoordinates(allListings, city) : null;
  if (!center) return { nearby: [], indexable: false };
  const nearby = getNearbyListings(inCategory, center.lat, center.lng, NEARBY_RADIUS_KM, city, Infinity);

  const companies = new Set(nearby.map((l) => l.companyDetails?.id).filter(Boolean));
  const byTown = new Map();
  nearby.forEach((l) => byTown.set(l.Miasto, [...(byTown.get(l.Miasto) || []), l]));
  const suburb = [...byTown.values()].some((offers) => offers.length >= MIN_NEARBY_FOR_INDEXING
    && haversineDistance(center.lat, center.lng, Number(offers[0].lat), Number(offers[0].lng)) <= SATELLITE_RADIUS_KM);

  return {
    nearby,
    indexable: nearby.length >= MIN_NEARBY_FOR_INDEXING && companies.size >= 2 && !suburb,
  };
}

/** Catalog companies at a location: the same city first, then the rest of the voivodeship. */
export async function companiesNear({ city = null, region = null, limit = 6 }) {
  const companies = await fetchAllCompanies();
  const inCity = city
    ? companies.filter((c) => (c.branches || []).some((b) => directoryCitySlug(b.city || '') === getCitySlug(city)))
    : [];
  if (inCity.length >= limit || !region) return inCity.slice(0, limit);

  const inRegion = companies.filter(
    (c) => !inCity.includes(c) && (c.branches || []).some((b) => directoryVoivodeshipSlug(b.voivodeship || '') === region)
  );
  return [...inCity, ...inRegion].slice(0, limit);
}

export function cityLinks(listings, { categorySlug = null, exclude = null, region = null, minListings = 1 } = {}) {
  const counts = {};
  listings.forEach((listing) => {
    if (!listing.Miasto) return;
    if (region && getVoivodeshipSlugForCity(listing.Miasto) !== region) return;
    counts[listing.Miasto] = (counts[listing.Miasto] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([city, count]) => city !== exclude && count >= minListings)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .map(([city, count]) => ({
      label: `${city} (${count})`,
      href: categorySlug ? `/${categorySlug}/${getCitySlug(city)}` : `/${getCitySlug(city)}`,
    }));
}

/** Link to the catalog page of a city when one of the shown companies has a branch there. */
export function catalogHrefFor(companies, city) {
  const slug = city ? getCitySlug(city) : null;
  const hasCityPage = slug && companies.some((c) => (c.branches || []).some((b) => b.city && getCitySlug(b.city) === slug));
  return hasCityPage ? `/katalog/${slug}` : '/katalog';
}

export function categoryLinks(listings, { locationSlug = null, exclude = null } = {}) {
  return Object.values(SEO_CATEGORIES)
    .filter((category) => category.slug !== exclude)
    .map((category) => {
      const count = listings.filter((listing) => listing.seoCategory === category.slug).length;
      return {
        count,
        label: `${category.name} (${offersLabel(count)})`,
        href: locationSlug ? `/${category.slug}/${locationSlug}` : `/${category.slug}`,
      };
    })
    .filter((link) => link.count > 0)
    .map(({ label, href }) => ({ label, href }));
}

/** Category hubs of a town that have no local offers but are indexed on offers from around it. */
export function areaCategoryLinks(allListings, city, locationSlug) {
  return Object.values(SEO_CATEGORIES)
    .filter((category) => !allListings.some((l) => l.seoCategory === category.slug && l.Miasto === city))
    .map((category) => ({ category, around: nearbyHub(allListings.filter((l) => l.seoCategory === category.slug), allListings, city) }))
    .filter(({ around }) => around.indexable)
    .map(({ category, around }) => ({
      label: `${category.name} w okolicy (${offersLabel(around.nearby.length)})`,
      href: `/${category.slug}/${locationSlug}`,
      updated: around.nearby.reduce((latest, l) => {
        const date = l.updated_at || l.created_at;
        return date && (!latest || date > latest) ? date : latest;
      }, null),
    }));
}

export const breadcrumbJsonLd = (baseUrl, items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Strona główna', path: '' }, ...items].map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${baseUrl}${item.path}`,
  })),
});

export const itemListJsonLd = (baseUrl, name, listings) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: listings.length,
  itemListElement: listings.slice(0, 20).map((listing, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${baseUrl}/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`,
    name: listing['Sprzęt'],
  })),
});
