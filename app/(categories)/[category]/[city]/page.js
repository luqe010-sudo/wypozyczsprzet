import { notFound } from 'next/navigation';
import { fetchMarketplaceData, toCard } from '../../../../lib/listings';
import { SEO_CATEGORIES, getCitySlug } from '../../../../lib/categories';
import { getCityCoordinates, getNearbyListings } from '../../../../lib/distance';
import { getVoivodeship, getVoivodeshipSlugForCity, isVoivodeshipSlug } from '../../../../lib/regions';
import { breadcrumbJsonLd, categoryLinks, cityLinks, companiesNear, itemListJsonLd } from '../../../../lib/hubs';
import { offersLabel } from '../../../../lib/format';
import { MIN_LISTINGS_FOR_INDEXING, SITE_NAME, SITE_URL } from '../../../../lib/site';
import HubView from '../../../../components/browse/HubView';

export const revalidate = 3600;

// Rendered on first request, then cached until revalidated.
export function generateStaticParams() {
  return [];
}

function resolvePlace(slug, cities) {
  if (isVoivodeshipSlug(slug)) {
    const region = getVoivodeship(slug);
    return { isRegion: true, name: `województwo ${region.name.toLowerCase()}`, regionSlug: slug };
  }
  const city = cities.find((c) => getCitySlug(c) === slug);
  if (!city) return null;
  return { isRegion: false, name: city, city, regionSlug: getVoivodeshipSlugForCity(city) };
}

const inPlace = (place, slug) => (listing) => (
  place.isRegion ? getVoivodeshipSlugForCity(listing.Miasto) === slug : listing.citySlug === slug
);

const jsonLdScript = (data) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: slug } = await params;
  const category = SEO_CATEGORIES[categorySlug];
  if (!Object.hasOwn(SEO_CATEGORIES, categorySlug)) return {};

  const { listings, filters } = await fetchMarketplaceData();
  const place = resolvePlace(slug, filters.cities);
  if (!place) return {};

  const count = listings.filter((l) => l.seoCategory === categorySlug).filter(inPlace(place, slug)).length;
  const url = `${SITE_URL}/${categorySlug}/${slug}`;
  const title = `${category.name}: ${place.name} – wynajem sprzętu | ${SITE_NAME}`;
  const types = category.filters.slice(0, 3).map((f) => f.label).join(', ');
  const description = `${category.name} (${place.name}): ${types}. ${offersLabel(count)} wynajmu, kontakt bezpośrednio z wynajmującym.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: count < MIN_LISTINGS_FOR_INDEXING ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: 'website' },
  };
}

export default async function LocalHubPage({ params }) {
  const { category: categorySlug, city: slug } = await params;
  const category = SEO_CATEGORIES[categorySlug];
  if (!Object.hasOwn(SEO_CATEGORIES, categorySlug)) notFound();

  const { listings, filters } = await fetchMarketplaceData();
  const place = resolvePlace(slug, filters.cities);
  if (!place) notFound();

  const inCategory = listings.filter((l) => l.seoCategory === categorySlug);
  const items = inCategory.filter(inPlace(place, slug));

  let nearby = [];
  let nearbyLabel = '';
  if (place.isRegion) {
    if (items.length < MIN_LISTINGS_FOR_INDEXING) {
      nearby = inCategory.filter((l) => getVoivodeshipSlugForCity(l.Miasto) !== slug).slice(0, 6);
      nearbyLabel = `${category.name} w innych regionach`;
    }
  } else {
    const coordinates = getCityCoordinates(listings, place.city);
    if (coordinates) {
      nearby = getNearbyListings(inCategory, coordinates.lat, coordinates.lng, 30, place.city, 8);
      nearbyLabel = `${category.name} do 30 km od tej miejscowości`;
    }
  }

  const companies = await companiesNear({ city: place.city, region: place.regionSlug });
  const title = `${category.name}: ${place.name}`;

  return (
    <>
      {jsonLdScript(breadcrumbJsonLd(SITE_URL, [
        { name: category.name, path: `/${categorySlug}` },
        { name: place.name, path: `/${categorySlug}/${slug}` },
      ]))}
      {jsonLdScript(itemListJsonLd(SITE_URL, title, items))}
      <HubView
        title={title}
        intro={category.description}
        breadcrumbs={[{ label: category.name, href: `/${categorySlug}` }, { label: place.name }]}
        listings={items.map(toCard)}
        allCities={[...new Set(items.map((l) => l.Miasto).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'))}
        lockCategory
        lockCity={!place.isRegion}
        fixedSubcategories={category.filters}
        resultsHeading={`Oferty: ${place.name}`}
        emptyHint="W tej miejscowości nie ma jeszcze takich ofert. Sprawdź oferty w pobliżu i wypożyczalnie z katalogu poniżej."
        nearby={nearby.map(toCard)}
        nearbyLabel={nearbyLabel}
        companies={companies}
        linkGroups={[
          { title: 'Inne miejscowości', links: cityLinks(inCategory, { categorySlug, exclude: place.city }) },
          { title: 'Inne kategorie', links: categoryLinks(listings.filter(inPlace(place, slug)), { locationSlug: slug, exclude: categorySlug }) },
        ]}
      />
    </>
  );
}
