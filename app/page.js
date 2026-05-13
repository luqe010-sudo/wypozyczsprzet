import Marketplace from '../components/Marketplace';
import CategoryHubs from '../components/CategoryHubs';
import { fetchMarketplaceData } from '../lib/googleSheets';
import { SEO_CATEGORY_SLUGS } from '../lib/categories';

export default async function Home() {
  const data = await fetchMarketplaceData();

  // Count offers per SEO category
  const categoryCounts = {};
  SEO_CATEGORY_SLUGS.forEach((slug) => {
    categoryCounts[slug] = data.listings.filter((l) => l.seoCategory === slug).length;
  });

  const BASE_URL = 'https://wypozycz.online';
  
  // JSON-LD LocalBusiness for homepage
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Wypozycz.online',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.png`,
    image: `${BASE_URL}/header.png`,
    description: 'Największy marketplace wynajmu sprzętu budowlanego i ogrodowego. Porównaj oferty lokalnych wypożyczalni w jednym miejscu.',
    areaServed: [
      { '@type': 'State', name: 'Dolny Śląsk' },
      { '@type': 'City', name: 'Wrocław' }
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PL'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Marketplace initialData={data} />
      <CategoryHubs categoryCounts={categoryCounts} />
    </>
  );
}
