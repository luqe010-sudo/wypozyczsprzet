import { notFound } from 'next/navigation';
import { fetchMarketplaceData, toCard } from '../../../../lib/listings';
import { SEO_CATEGORIES, getCitySlug } from '../../../../lib/categories';
import { getVoivodeship, getVoivodeshipSlugForCity, isVoivodeshipSlug } from '../../../../lib/regions';
import { breadcrumbJsonLd, catalogHrefFor, categoryLinks, cityLinks, companiesNear, itemListJsonLd, nearbyHub, areaCategoryLinks } from '../../../../lib/hubs';
import { offersLabel, plainTextExcerpt } from '../../../../lib/format';
import { buildHubContent, faqJsonLd, topTypesLabel } from '../../../../lib/hubContent';
import { MIN_LISTINGS_FOR_CATEGORY_INDEXING, MIN_LISTINGS_FOR_INDEXING, NEARBY_RADIUS_KM, SITE_NAME, SITE_URL } from '../../../../lib/site';
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

/** "Świdnica, Boguszów-Gorce" – the towns the nearest offers come from. */
const nearbyTowns = (offers, limit = 3) => [...new Set(offers.map((l) => l.Miasto).filter(Boolean))].slice(0, limit).join(', ');

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

  const inCategory = listings.filter((l) => l.seoCategory === categorySlug);
  const items = inCategory.filter(inPlace(place, slug));
  const count = items.length;
  const url = `${SITE_URL}/${categorySlug}/${slug}`;
  let title = `${category.name}: ${place.name} – wynajem sprzętu | ${SITE_NAME}`;
  const types = category.filters.slice(0, 3).map((f) => f.label).join(', ');
  let description = `${category.name} (${place.name}): ${types}. ${offersLabel(count)} wynajmu, kontakt bezpośrednio z wynajmującym.`;
  // No local offers: indexed only when the offers around the town are a real answer (lib/hubs.js nearbyHub).
  const around = count === 0 && !place.isRegion ? nearbyHub(inCategory, listings, place.city) : null;
  const shown = around?.indexable ? around.nearby : items;
  const placeLabel = around?.indexable ? `${place.name} i okolice` : place.name;
  if (shown.length > 0) {
    // Query-shaped title ("Minikoparki, koparki – wynajem Wrocław od 140 zł") built from the offers on the page.
    const content = buildHubContent(shown, { place: placeLabel, categoryName: category.name, groupBy: 'subcategory' });
    const lead = topTypesLabel(content) || category.name;
    const from = content.minPrice != null ? ` od ${Math.round(content.minPrice)} zł` : '';
    title = `${lead.charAt(0).toUpperCase()}${lead.slice(1)} – wynajem ${placeLabel}${from} | ${SITE_NAME}`;
    // For an area hub the towns go right after the first sentence, so they survive the 160-character cut.
    const intro = around?.indexable
      ? content.intro.replace(/\. /, `. Oferty do ${NEARBY_RADIUS_KM} km, m.in. ${nearbyTowns(shown)}. `)
      : content.intro;
    description = plainTextExcerpt(`${intro} Kontakt bezpośrednio z wynajmującym, bez prowizji.`, 160);
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: count < MIN_LISTINGS_FOR_INDEXING && !around?.indexable ? { index: false, follow: true } : undefined,
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
  let around = null;
  if (place.isRegion) {
    if (items.length < MIN_LISTINGS_FOR_CATEGORY_INDEXING) {
      nearby = inCategory.filter((l) => getVoivodeshipSlugForCity(l.Miasto) !== slug).slice(0, 6);
      nearbyLabel = `${category.name} w innych regionach`;
    }
  } else {
    around = nearbyHub(inCategory, listings, place.city);
    nearby = around.nearby.slice(0, 8);
    nearbyLabel = `${category.name} do ${NEARBY_RADIUS_KM} km od tej miejscowości`;
  }
  const areaHub = items.length === 0 && Boolean(around?.indexable);

  const companies = await companiesNear({ city: place.city, region: place.regionSlug });
  const title = `${category.name}: ${place.name}`;
  const content = items.length > 0
    ? buildHubContent(items, { place: place.name, categoryName: category.name, groupBy: 'subcategory' })
    : areaHub
      ? buildHubContent(around.nearby, { place: `${place.name} i okolice`, categoryName: category.name, groupBy: 'subcategory' })
      : null;

  return (
    <>
      {jsonLdScript(breadcrumbJsonLd(SITE_URL, [
        { name: category.name, path: `/${categorySlug}` },
        { name: place.name, path: `/${categorySlug}/${slug}` },
      ]))}
      {jsonLdScript(itemListJsonLd(SITE_URL, title, areaHub ? around.nearby : items))}
      {content?.faqs.length > 0 && jsonLdScript(faqJsonLd(content.faqs))}
      <HubView
        title={title}
        intro={areaHub
          ? `${content.intro} W samej miejscowości nie ma jeszcze takich ofert, poniżej są najbliższe, m.in. ${nearbyTowns(around.nearby)}.`
          : content?.intro || category.description}
        summary={content}
        breadcrumbs={[{ label: category.name, href: `/${categorySlug}` }, { label: place.name }]}
        listings={(areaHub ? around.nearby : items).map(toCard)}
        allCities={[...new Set((areaHub ? around.nearby : items).map((l) => l.Miasto).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'))}
        lockCategory
        lockCity={!place.isRegion && !areaHub}
        fixedSubcategories={category.filters}
        resultsHeading={areaHub ? `Oferty do ${NEARBY_RADIUS_KM} km: ${place.name}` : `Oferty: ${place.name}`}
        emptyHint="W tej miejscowości nie ma jeszcze takich ofert. Sprawdź oferty w pobliżu i wypożyczalnie z katalogu poniżej."
        nearby={areaHub ? [] : nearby.map(toCard)}
        nearbyLabel={nearbyLabel}
        companies={companies}
        catalogHref={catalogHrefFor(companies, place.city)}
        linkGroups={[
          { title: 'Inne miejscowości', links: cityLinks(inCategory, { categorySlug, exclude: place.city }) },
          {
            title: 'Inne kategorie',
            links: [
              ...categoryLinks(listings.filter(inPlace(place, slug)), { locationSlug: slug, exclude: categorySlug }),
              ...(place.isRegion ? [] : areaCategoryLinks(listings, place.city, slug).filter((l) => l.href !== `/${categorySlug}/${slug}`)),
            ],
          },
        ]}
      />
    </>
  );
}
