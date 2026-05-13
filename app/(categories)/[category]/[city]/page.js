import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchMarketplaceData } from '../../../../lib/googleSheets';
import { SEO_CATEGORIES, getSeoCategoryByDbKey, getCitySlug } from '../../../../lib/categories';
import CategoryPageClient from '../CategoryPageClient';

// Cache data for 1 hour
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlug } = await params;
  const category = SEO_CATEGORIES[categorySlug];
  
  if (!category) return {};

  const { filters } = await fetchMarketplaceData();
  const cityName = filters.cities.find(c => getCitySlug(c) === citySlug);
  
  if (!cityName) return {};

  const title = `${category.name} — ${cityName} | Wynajem sprzętu | WypożyczSprzęt`;
  
  // Dynamic description with subcategories
  const itemTypes = category.filters.slice(0, 3).map(f => f.label).join(', ');
  const description = `${category.name} w miejscowości ${cityName} — lokalne oferty wynajmu: ${itemTypes} i sprzętu budowlanego. Sprawdź dostępność i porównaj ceny.`;
  
  const url = `https://wypozycz.online/${categorySlug}/${citySlug}`;

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
  
  // Find the original city name from the slug
  const cityName = filters.cities.find(c => getCitySlug(c) === citySlug);
  
  if (!cityName) {
    notFound();
  }

  // Filter listings for this category AND city
  const categoryListings = listings.filter(item => {
    const itemSeoSlug = SEO_CATEGORIES[categorySlug].dbKey === (item._rawCategory || item.category) || 
                       SEO_CATEGORIES[categorySlug].dbCategories.includes(item._rawCategory || item.category);
    const itemCitySlug = getCitySlug(item.Miasto) === citySlug;
    return itemSeoSlug && itemCitySlug;
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
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${BASE_URL}/${category.slug}` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${BASE_URL}/${category.slug}/${citySlug}` },
    ],
  };

  // JSON-LD ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} w ${cityName}`,
    description: `Lista ofert wynajmu sprzętu w kategorii ${category.name.toLowerCase()} w lokalizacji ${cityName}`,
    numberOfItems: categoryListings.length,
    itemListElement: categoryListings.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/${categorySlug}/${citySlug}/${listing.slug}`,
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
      '@type': 'City',
      name: cityName,
    },
    description: `Lokalny marketplace wynajmu sprzętu budowlanego i ogrodowego w ${cityName}.`,
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
          cities={filters.cities}
          otherCategories={otherCategories}
          cityName={cityName}
          otherCities={otherCities}
        />
      </Suspense>
    </>
  );
}
