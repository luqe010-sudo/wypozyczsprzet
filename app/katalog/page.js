import { getDirectoryIndexData } from '../../lib/supabaseDirectory';
import CatalogClient from './CatalogClient';
import { plainTextExcerpt } from '../../lib/format';

// Only what the cards and filters read is sent to the browser; full rows made the page about 1 MB.
const toCatalogCard = (company) => ({
  id: company.id,
  name: company.name,
  slug: company.slug,
  category: company.category,
  description: plainTextExcerpt(company.description, 200),
  logo_url: company.logo_url,
  rating: company.rating,
  review_count: company.review_count,
  branches: (company.branches || []).map((branch) => ({ city: branch.city, voivodeship: branch.voivodeship })),
});

export const metadata = {
  title: 'Wypożyczalnie sprzętu budowlanego – katalog firm według miast | wypozycz.online',
  description:
    'Katalog wypożyczalni sprzętu budowlanego w Polsce: adresy, telefony i oddziały firm. Znajdź wypożyczalnię w swoim mieście lub województwie.',
  alternates: {
    canonical: '/katalog',
  },
  openGraph: {
    title: 'Katalog wypożyczalni sprzętu budowlanego',
    description:
      'Wypożyczalnie sprzętu budowlanego w Polsce według miast i województw.',
    images: [
      {
        url: '/header.png',
        width: 1200,
        height: 630,
        alt: 'Katalog firm – wypozycz.online',
      },
    ],
    type: 'website',
  },
};

export default async function CatalogPage() {
  const { companies, cities, voivodeships } = await getDirectoryIndexData();

  // JSON-LD ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog wypożyczalni sprzętu budowlanego',
    description: 'Lista wypożyczalni sprzętu budowlanego w Polsce.',
    numberOfItems: companies.length,
    itemListElement: companies.slice(0, 50).map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: company.name,
      url: `https://wypozycz.online/katalog/${
        company.branches?.[0]?.city
          ? company.branches[0].city.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => ({
              ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z'
            }[c] || c)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          : 'polska'
      }/${company.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CatalogClient
        companies={companies.map(toCatalogCard)}
        cities={cities}
        voivodeships={voivodeships}
      />
    </>
  );
}
