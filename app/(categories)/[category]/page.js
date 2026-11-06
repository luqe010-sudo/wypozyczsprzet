import { notFound } from 'next/navigation';
import { SEO_CATEGORIES, SEO_CATEGORY_SLUGS, getCitySlug } from '../../../lib/categories';
import { fetchMarketplaceData, toCard } from '../../../lib/listings';
import { getVoivodeship, getVoivodeshipSlugForCity, isVoivodeshipSlug } from '../../../lib/regions';
import { breadcrumbJsonLd, categoryLinks, cityLinks, companiesNear, itemListJsonLd } from '../../../lib/hubs';
import { offersLabel } from '../../../lib/format';
import { MIN_LISTINGS_FOR_INDEXING, SITE_NAME, SITE_URL } from '../../../lib/site';
import HubView from '../../../components/browse/HubView';

export const revalidate = 3600;

export function generateStaticParams() {
  return SEO_CATEGORY_SLUGS.map((slug) => ({ category: slug }));
}

/** One route serves three kinds of landing page: category, voivodeship and city. */
function resolveHub(slug, listings, cities) {
  if (Object.hasOwn(SEO_CATEGORIES, slug)) {
    return { kind: 'category', category: SEO_CATEGORIES[slug], items: listings.filter((l) => l.seoCategory === slug) };
  }
  if (isVoivodeshipSlug(slug)) {
    return { kind: 'region', region: getVoivodeship(slug), items: listings.filter((l) => getVoivodeshipSlugForCity(l.Miasto) === slug) };
  }
  const city = cities.find((c) => getCitySlug(c) === slug);
  if (city) return { kind: 'city', city, items: listings.filter((l) => l.citySlug === slug) };
  return null;
}

const jsonLdScript = (data) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const { listings, filters } = await fetchMarketplaceData();
  const hub = resolveHub(slug, listings, filters.cities);
  if (!hub) return {};

  const url = `${SITE_URL}/${slug}`;
  const thin = hub.items.length < MIN_LISTINGS_FOR_INDEXING && (hub.kind !== 'category' || hub.category.minListingsForIndexing);
  const robots = thin ? { index: false, follow: true } : undefined;

  if (hub.kind === 'category') {
    const types = hub.category.filters.slice(0, 5).map((f) => f.label).join(', ');
    const description = `${hub.category.name}: ${types}. ${offersLabel(hub.items.length)} na wynajem. Kontakt bezpośrednio z wynajmującym, bez prowizji.`;
    return {
      title: hub.category.title,
      description,
      robots,
      alternates: { canonical: url },
      openGraph: { title: hub.category.title, description, url, siteName: SITE_NAME, type: 'website', locale: 'pl_PL' },
    };
  }

  const place = hub.kind === 'region' ? `województwo ${hub.region.name.toLowerCase()}` : hub.city;
  const title = `Wynajem sprzętu budowlanego i ogrodowego: ${place} | ${SITE_NAME}`;
  const description = `${offersLabel(hub.items.length)} wynajmu maszyn i narzędzi (${place}). Kontakt bezpośrednio z wynajmującym, bez prowizji.`;
  return { title, description, robots, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website' } };
}

export default async function HubPage({ params }) {
  const { category: slug } = await params;
  const { listings, filters } = await fetchMarketplaceData();
  const hub = resolveHub(slug, listings, filters.cities);
  if (!hub) notFound();

  const cards = hub.items.map(toCard);

  if (hub.kind === 'category') {
    const { category } = hub;
    return (
      <>
        {jsonLdScript(breadcrumbJsonLd(SITE_URL, [{ name: category.name, path: `/${slug}` }]))}
        {jsonLdScript(itemListJsonLd(SITE_URL, `Oferty wynajmu: ${category.name}`, hub.items))}
        <HubView
          title={category.name}
          intro={category.description}
          breadcrumbs={[{ label: category.name }]}
          listings={cards}
          allCities={[...new Set(hub.items.map((l) => l.Miasto).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'))}
          lockCategory
          fixedSubcategories={category.filters}
          resultsHeading={`Oferty: ${category.name}`}
          linkGroups={[
            { title: 'Miejscowości', links: cityLinks(hub.items, { categorySlug: slug }) },
            { title: 'Inne kategorie', links: categoryLinks(listings, { exclude: slug }) },
          ]}
        />
      </>
    );
  }

  const isRegion = hub.kind === 'region';
  const placeName = isRegion ? `Województwo ${hub.region.name.toLowerCase()}` : hub.city;
  const regionSlug = isRegion ? slug : getVoivodeshipSlugForCity(hub.city);
  const companies = await companiesNear({ city: isRegion ? null : hub.city, region: regionSlug });

  return (
    <>
      {jsonLdScript(breadcrumbJsonLd(SITE_URL, [{ name: placeName, path: `/${slug}` }]))}
      {jsonLdScript(itemListJsonLd(SITE_URL, `Oferty wynajmu: ${placeName}`, hub.items))}
      <HubView
        title={`Wynajem sprzętu: ${placeName}`}
        intro={`${offersLabel(hub.items.length)} wynajmu maszyn i narzędzi. Dzwonisz lub piszesz bezpośrednio do wynajmującego.`}
        breadcrumbs={[{ label: placeName }]}
        listings={cards}
        allCities={[...new Set(hub.items.map((l) => l.Miasto).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'))}
        lockCity={!isRegion}
        resultsHeading="Oferty wynajmu"
        companies={companies}
        linkGroups={[
          { title: 'Kategorie', links: categoryLinks(hub.items, { locationSlug: slug }) },
          { title: isRegion ? 'Miejscowości' : 'Miejscowości w regionie', links: cityLinks(listings, { region: regionSlug, exclude: hub.city }) },
        ]}
      />
    </>
  );
}
