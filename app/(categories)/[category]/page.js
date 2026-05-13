import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SEO_CATEGORIES, SEO_CATEGORY_SLUGS } from '../../../lib/categories';
import { fetchListingsByCategory, fetchMarketplaceData } from '../../../lib/googleSheets';
import CategoryPageClient from './CategoryPageClient';

export async function generateStaticParams() {
  return SEO_CATEGORY_SLUGS.map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = SEO_CATEGORIES[category];
  if (!cat) return {};

  const BASE_URL = 'https://wypozycz.online';
  
  // Dynamic description with subcategories
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

  // Validate slug
  if (!SEO_CATEGORY_SLUGS.includes(category)) {
    notFound();
  }

  const cat = SEO_CATEGORIES[category];
  const listings = await fetchListingsByCategory(category);
  const { filters } = await fetchMarketplaceData();

  // Extract cities for this category
  const citiesInCategory = [...new Set(listings.map((l) => l.Miasto).filter(Boolean))].sort();

  // Cross-link categories (all 5 minus current)
  const otherCategories = Object.values(SEO_CATEGORIES).filter((c) => c.slug !== category);

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: cat.name, item: `${BASE_URL}/${cat.slug}` },
    ],
  };

  // JSON-LD ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Oferty wynajmu: ${cat.name}`,
    description: `Lista ofert wynajmu sprzętu w kategorii ${cat.name.toLowerCase()}`,
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 20).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/${category}/${listing.citySlug}/${listing.slug}`,
      name: listing['Sprzęt'] || listing.name,
    })),
  };

  // Trim listings for client (don't need descriptions in the grid)
  const trimmedListings = listings.map(l => {
    const { Opis, ...rest } = l;
    return rest;
  });

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
          category={cat}
          listings={trimmedListings}
          cities={citiesInCategory}
          otherCategories={otherCategories}
        />
      </Suspense>
    </>
  );
}
