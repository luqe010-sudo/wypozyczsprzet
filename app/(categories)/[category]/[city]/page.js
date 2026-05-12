import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMarketplaceData } from '../../../../lib/googleSheets';
import { SEO_CATEGORIES, getSeoCategoryByDbKey, getCitySlug } from '../../../../lib/categories';
import CategoryPageClient from '../CategoryPageClient';

// Cache data for 1 hour
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlug } = params;
  const category = SEO_CATEGORIES[categorySlug];
  
  if (!category) return {};

  const { filters } = await fetchMarketplaceData();
  const cityName = filters.cities.find(c => getCitySlug(c) === citySlug);
  
  if (!cityName) return {};

  const title = `${category.name} — ${cityName} | Wynajem sprzętu | WypożyczSprzęt`;
  const description = `Szukasz sprzętu w kategorii ${category.name.toLowerCase()} w mieście ${cityName}? Sprawdź najlepsze oferty wynajmu bez pośredników. Największa baza w Twojej okolicy!`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wypozycz.online'}/${categorySlug}/${citySlug}`;

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
  const { category: categorySlug, city: citySlug } = params;
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

  return (
    <CategoryPageClient 
      category={category}
      listings={categoryListings}
      cities={filters.cities}
      otherCategories={otherCategories}
      cityName={cityName}
      otherCities={otherCities}
    />
  );
}
