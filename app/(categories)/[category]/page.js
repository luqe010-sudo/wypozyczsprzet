import Link from 'next/link';
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

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';

  return {
    title: cat.title,
    description: cat.description,
    keywords: `wynajem ${cat.name.toLowerCase()}, wypożyczalnia ${cat.name.toLowerCase()}, ${cat.filters.join(', ')}`,
    alternates: {
      canonical: `${BASE_URL}/${cat.slug}`,
    },
    openGraph: {
      title: cat.title,
      description: cat.description,
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

  // JSON-LD BreadcrumbList
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: cat.name, item: `${BASE_URL}/${cat.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageClient
        category={cat}
        listings={listings}
        cities={citiesInCategory}
        otherCategories={otherCategories}
      />
    </>
  );
}
