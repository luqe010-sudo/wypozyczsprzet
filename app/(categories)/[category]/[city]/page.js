import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchMarketplaceData } from '../../../../lib/googleSheets';
import { SEO_CATEGORIES, getCitySlug } from '../../../../lib/categories';
import { getNearbyListings, getCityCoordinates } from '../../../../lib/distance';
import { isVoivodeshipSlug, getVoivodeship, getVoivodeshipSlugForCity, getCitiesInVoivodeship } from '../../../../lib/regions';
import CategoryPageClient from '../CategoryPageClient';

// Cache data for 1 hour
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlug } = await params;
  const category = SEO_CATEGORIES[categorySlug];
  
  if (!category) return {};

  const BASE_URL = 'https://wypozycz.online';
  const url = `${BASE_URL}/${categorySlug}/${citySlug}`;

  // 1. Case: Voivodeship slug (e.g., /roboty-ziemne/dolnoslaskie)
  if (isVoivodeshipSlug(citySlug)) {
    const region = getVoivodeship(citySlug);
    const title = `${category.name} — województwo ${region.name} | Wynajem sprzętu | WypożyczSprzęt`;
    const itemTypes = category.filters.slice(0, 3).map(f => f.label).join(', ');
    const description = `${category.name} w województwie ${region.name} — regionalne oferty wynajmu: ${itemTypes} i maszyn budowlanych. Porównaj cenniki i dostępność.`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
      },
    };
  }

  // 2. Case: Standard City slug (e.g., /roboty-ziemne/wroclaw)
  const { filters } = await fetchMarketplaceData();
  const cityName = filters.cities.find(c => getCitySlug(c) === citySlug);
  
  if (!cityName) return {};

  const title = `${category.name} — ${cityName} | Wynajem sprzętu | WypożyczSprzęt`;
  const itemTypes = category.filters.slice(0, 3).map(f => f.label).join(', ');
  const description = `${category.name} w miejscowości ${cityName} — lokalne oferty wynajmu: ${itemTypes} i sprzętu budowlanego. Sprawdź dostępność i porównaj ceny.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
  };
}

export default async function LocalHubPage({ params }) {
  const { category: categorySlug, city: citySlug } = await params;
  const category = SEO_CATEGORIES[categorySlug];

  if (!category) {
    notFound();
  }

  const { listings, filters } = await fetchMarketplaceData();
  
  const isRegion = isVoivodeshipSlug(citySlug);
  let cityName = '';
  let categoryListings = [];
  let nearbyListings = [];
  let citiesInView = [];
  let regionName = '';

  // Get active voivodeship slugs from all active listings
  const activeVoivodeships = [...new Set(listings.map(l => getVoivodeshipSlugForCity(l.Miasto)).filter(Boolean))];

  if (isRegion) {
    const region = getVoivodeship(citySlug);
    regionName = region.name;
    cityName = `województwo ${regionName}`;

    // Filter listings in this category belonging to any city in this voivodeship
    categoryListings = listings.filter(item => {
      const itemSeoSlug = SEO_CATEGORIES[categorySlug].dbKey === (item._rawCategory || item.category) || 
                         SEO_CATEGORIES[categorySlug].dbCategories.includes(item._rawCategory || item.category);
      const itemRegionSlug = getVoivodeshipSlugForCity(item.Miasto) === citySlug;
      return itemSeoSlug && itemRegionSlug;
    });

    // Cities in this voivodeship that have ANY listings in the system (to prevent disappearing!)
    citiesInView = [...new Set(listings.filter(l => getVoivodeshipSlugForCity(l.Miasto) === citySlug).map(l => l.Miasto).filter(Boolean))].sort();

    // No specific local proximity searches for a whole province/voivodeship needed since voivodeship has large inventory,
    // but if it is very empty, we can fallback to other listings in the same category
    const allCategoryListings = listings.filter(item => {
      return SEO_CATEGORIES[categorySlug].dbKey === (item._rawCategory || item.category) || 
             SEO_CATEGORIES[categorySlug].dbCategories.includes(item._rawCategory || item.category);
    });
    if (categoryListings.length < 3) {
      nearbyListings = allCategoryListings.filter(item => getVoivodeshipSlugForCity(item.Miasto) !== citySlug).slice(0, 6);
    }
  } else {
    // Find the original city name from the slug
    const originalCityName = filters.cities.find(c => getCitySlug(c) === citySlug);
    
    if (!originalCityName) {
      notFound();
    }
    
    cityName = originalCityName;

    // Filter listings for this category AND city
    categoryListings = listings.filter(item => {
      const itemSeoSlug = SEO_CATEGORIES[categorySlug].dbKey === (item._rawCategory || item.category) || 
                         SEO_CATEGORIES[categorySlug].dbCategories.includes(item._rawCategory || item.category);
      const itemCitySlug = getCitySlug(item.Miasto) === citySlug;
      return itemSeoSlug && itemCitySlug;
    });

    // Get all listings for this category (across all cities)
    const allCategoryListings = listings.filter(item => {
      return SEO_CATEGORIES[categorySlug].dbKey === (item._rawCategory || item.category) || 
             SEO_CATEGORIES[categorySlug].dbCategories.includes(item._rawCategory || item.category);
    });

    // Get coordinates for the current city
    const cityCoords = getCityCoordinates(allCategoryListings, cityName) 
      || getCityCoordinates(listings, cityName); // Fallback: check all listings

    // Find nearby listings from other cities (within 30 km)
    const nearbyRaw = cityCoords
      ? getNearbyListings(allCategoryListings, cityCoords.lat, cityCoords.lng, 30, cityName, 9)
      : [];

    nearbyListings = nearbyRaw;

    // Cities in this voivodeship that have ANY listings in the system (to prevent disappearing!)
    const currentCityVoivodeship = getVoivodeshipSlugForCity(cityName);
    citiesInView = [...new Set(listings.map(l => l.Miasto).filter(Boolean))]
      .filter(c => getVoivodeshipSlugForCity(c) === currentCityVoivodeship)
      .sort();
  }

  // Trim nearby listings for client (remove heavy fields)
  const trimmedNearbyListings = nearbyListings.map(l => {
    const { Opis, ...rest } = l;
    return rest;
  });

  // Prepare data for the client component
  const otherCategories = Object.values(SEO_CATEGORIES)
    .filter(c => c.slug !== categorySlug)
    .map(c => ({ name: c.name, slug: c.slug, icon: c.icon }));

  const otherCities = filters.cities
    .filter(c => getCitySlug(c) !== citySlug)
    .slice(0, 15);

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: isRegion ? [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${BASE_URL}/${category.slug}` },
      { '@type': 'ListItem', position: 3, name: `Województwo ${regionName}`, item: `${BASE_URL}/${category.slug}/${citySlug}` },
    ] : [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${BASE_URL}/${category.slug}` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${BASE_URL}/${category.slug}/${citySlug}` },
    ],
  };

  // JSON-LD ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isRegion ? `${category.name} w województwie ${regionName}` : `${category.name} w ${cityName}`,
    description: isRegion 
      ? `Lista ofert wynajmu sprzętu w kategorii ${category.name.toLowerCase()} w województwie ${regionName}`
      : `Lista ofert wynajmu sprzętu w kategorii ${category.name.toLowerCase()} w lokalizacji ${cityName}`,
    numberOfItems: categoryListings.length,
    itemListElement: categoryListings.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/${categorySlug}/${getCitySlug(listing.Miasto)}/${listing.slug}`,
      name: listing['Sprzęt'] || listing.name,
    })),
  };

  // JSON-LD LocalBusiness
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Wypozycz.online',
    url: BASE_URL,
    image: `${BASE_URL}/header.png`,
    areaServed: {
      '@type': isRegion ? 'State' : 'City',
      name: isRegion ? regionName : cityName,
    },
    description: isRegion
      ? `Regionalny marketplace wynajmu sprzętu budowlanego i ogrodowego w województwie ${regionName}.`
      : `Lokalny marketplace wynajmu sprzętu budowlanego i ogrodowego w ${cityName}.`,
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-900 animate-pulse" />}>
        <CategoryPageClient 
          category={category}
          listings={categoryListings}
          cities={citiesInView}
          otherCategories={otherCategories}
          cityName={cityName}
          otherCities={otherCities}
          nearbyListings={trimmedNearbyListings}
          isVoivodeshipPage={isRegion}
          voivodeshipSlug={isRegion ? citySlug : getVoivodeshipSlugForCity(cityName)}
          activeVoivodeships={activeVoivodeships}
        />
      </Suspense>
    </>
  );
}
