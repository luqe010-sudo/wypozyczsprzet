import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SEO_CATEGORIES, SEO_CATEGORY_SLUGS, getCitySlug } from '../../../lib/categories';
import { fetchListingsByCategory, fetchMarketplaceData } from '../../../lib/googleSheets';
import { isVoivodeshipSlug, getVoivodeship, getVoivodeshipSlugForCity, getCitiesInVoivodeship } from '../../../lib/regions';
import CategoryPageClient from './CategoryPageClient';

// Next.js dynamic routing optimization
export const revalidate = 3600;

export async function generateStaticParams() {
  // Static paths for both categories and voivodeships for faster builds
  const categoryPaths = SEO_CATEGORY_SLUGS.map((slug) => ({ category: slug }));
  return categoryPaths;
}

export async function generateMetadata({ params }) {
  const { category } = await params;

  const BASE_URL = 'https://wypozycz.online';

  // 1. Case: Voivodeship slug (e.g., /dolnoslaskie)
  if (isVoivodeshipSlug(category)) {
    const region = getVoivodeship(category);
    return {
      title: region.seoTitle,
      description: region.description,
      alternates: {
        canonical: `${BASE_URL}/${category}`,
      },
      openGraph: {
        title: region.seoTitle,
        description: region.description,
        url: `${BASE_URL}/${category}`,
        siteName: 'WypożyczSprzęt',
        type: 'website',
        locale: 'pl_PL',
      },
    };
  }

  // 2. Case: City slug (e.g., /wroclaw)
  const { filters } = await fetchMarketplaceData();
  const cityMatch = filters.cities.find(c => getCitySlug(c) === category);
  
  if (cityMatch) {
    const title = `Wynajem sprzętu budowlanego i ogrodowego — ${cityMatch} | WypożyczSprzęt`;
    const description = `Wszystkie ogłoszenia wynajmu maszyn i narzędzi budowlanych oraz ogrodowych w miejscowości ${cityMatch}. Sprawdź i porównaj lokalne oferty.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/${category}` },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/${category}`,
        type: 'website',
      },
    };
  }

  // 3. Case: Category slug (e.g., /roboty-ziemne)
  const cat = SEO_CATEGORIES[category];
  if (!cat) return {};

  const itemTypes = cat.filters.slice(0, 5).map(f => f.label).join(', ');
  const description = `Wynajem sprzętu: ${cat.name.toLowerCase()} w Twojej okolicy. ${itemTypes} i inne. Porównaj oferty lokalnych wypożyczalni bez pośredników.`;

  return {
    title: cat.title,
    description,
    keywords: `wynajem ${cat.name.toLowerCase()}, wypożyczalnia ${cat.name.toLowerCase()}, ${cat.filters.map(f => f.label).join(', ')}`,
    alternates: {
      canonical: `${BASE_URL}/${cat.slug}`,
    },
    openGraph: {
      title: cat.title,
      description,
      url: `${BASE_URL}/${cat.slug}`,
      siteName: 'WypożyczSprzęt',
      type: 'website',
      locale: 'pl_PL',
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

  const { listings, filters } = await fetchMarketplaceData();

  // Check if this is a Voivodeship slug (e.g. /dolnoslaskie)
  const isRegion = isVoivodeshipSlug(category);

  // Check if this is a City slug (e.g. /wroclaw)
  const cityMatch = filters.cities.find(c => getCitySlug(c) === category);
  const isCity = !!cityMatch;

  // Validate slug is either category, voivodeship, or city
  if (!SEO_CATEGORY_SLUGS.includes(category) && !isRegion && !isCity) {
    notFound();
  }

  let catObj;
  let pageListings = [];
  let citiesInView = [];
  let isRegionLanding = false;
  let regionName = '';
  let cityName = '';

  if (isRegion) {
    const region = getVoivodeship(category);
    regionName = region.name;
    isRegionLanding = true;

    // Filter by voivodeship
    pageListings = listings.filter(l => getVoivodeshipSlugForCity(l.Miasto) === category);
    
    // Create dummy category configuration
    catObj = {
      name: 'Wszystkie sprzęty',
      slug: category,
      icon: '📍',
      color: 'from-blue-600 to-indigo-700',
      description: `Wszystkie ogłoszenia wynajmu maszyn i narzędzi budowlanych oraz ogrodowych w województwie ${region.name}. Sprawdź i porównaj lokalne oferty.`,
      filters: []
    };

    // Filter cities inside this region that actually have listings
    citiesInView = [...new Set(listings.filter(l => getVoivodeshipSlugForCity(l.Miasto) === category).map((l) => l.Miasto).filter(Boolean))].sort();
  } else if (isCity) {
    cityName = cityMatch;

    // Filter listings by this city
    pageListings = listings.filter(l => getCitySlug(l.Miasto) === category);
    
    // Create dummy category configuration representing the whole marketplace for this city
    catObj = {
      name: 'Wszystkie sprzęty',
      slug: category,
      icon: '📍',
      color: 'from-blue-600 to-indigo-700',
      description: `Wszystkie ogłoszenia wynajmu maszyn i narzędzi budowlanych oraz ogrodowych w miejscowości ${cityName}. Sprawdź i porównaj lokalne oferty.`,
      filters: []
    };

    // Since we are in a specific city, citiesInView should be all cities in the same voivodeship
    const currentVoivodeship = getVoivodeshipSlugForCity(cityName);
    citiesInView = [...new Set(listings.map((l) => l.Miasto).filter(Boolean))]
      .filter(c => getVoivodeshipSlugForCity(c) === currentVoivodeship)
      .sort();
  } else {
    // Standard category page
    catObj = SEO_CATEGORIES[category];
    pageListings = await fetchListingsByCategory(category);
    citiesInView = [...new Set(pageListings.map((l) => l.Miasto).filter(Boolean))].sort();
  }

  // Cross-link categories (all 5)
  const otherCategories = Object.values(SEO_CATEGORIES).map(c => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon
  }));

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: isRegion ? [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: `Województwo ${regionName}`, item: `${BASE_URL}/${category}` },
    ] : isCity ? [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: cityName, item: `${BASE_URL}/${category}` },
    ] : [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: catObj.name, item: `${BASE_URL}/${catObj.slug}` },
    ],
  };

  // JSON-LD ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isRegion ? `Oferty wynajmu w województwie ${regionName}` : isCity ? `Oferty wynajmu w ${cityName}` : `Oferty wynajmu: ${catObj.name}`,
    description: isRegion 
      ? `Lista ofert wynajmu maszyn w województwie ${regionName}` 
      : isCity ? `Lista ofert wynajmu maszyn w lokalizacji ${cityName}` 
      : `Lista ofert wynajmu sprzętu w kategorii ${catObj.name.toLowerCase()}`,
    numberOfItems: pageListings.length,
    itemListElement: pageListings.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`,
      name: listing['Sprzęt'] || listing.name,
    })),
  };

  // Trim listings for client (don't need descriptions in the grid)
  const trimmedListings = pageListings.map(l => {
    const { Opis, ...rest } = l;
    return rest;
  });

  // Fetch all active listings to determine activeVoivodeships
  const activeVoivodeships = [...new Set(listings.map(l => getVoivodeshipSlugForCity(l.Miasto)).filter(Boolean))];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900 animate-pulse" />}>
        <CategoryPageClient
          category={catObj}
          listings={trimmedListings}
          cities={citiesInView}
          otherCategories={otherCategories}
          cityName={isRegion ? `województwo ${regionName}` : cityName || undefined}
          isVoivodeshipPage={isRegion}
          isCityPage={isCity}
          voivodeshipSlug={isRegion ? category : isCity ? getVoivodeshipSlugForCity(cityName) : undefined}
          activeVoivodeships={activeVoivodeships}
        />
      </Suspense>
    </>
  );
}
