import 'server-only';
import { fetchAllCompanies } from './supabaseDirectory';
import { citySlug as directoryCitySlug, voivodeshipSlug as directoryVoivodeshipSlug } from './slugify';
import { SEO_CATEGORIES, getCitySlug } from './categories';
import { getVoivodeshipSlugForCity } from './regions';
import { offersLabel } from './format';

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
