import { fetchAllCompanies, getAllCities, getAllVoivodeships } from '../../lib/supabaseDirectory';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Katalog wypożyczalni sprzętu budowlanego – Wypozycz.Online',
  description:
    'Przeglądaj katalog sprawdzonych wypożyczalni sprzętu budowlanego w Polsce. Znajdź firmę w swoim mieście, porównaj oferty i dane kontaktowe.',
  alternates: {
    canonical: '/katalog',
  },
  openGraph: {
    title: 'Katalog wypożyczalni sprzętu budowlanego',
    description:
      'Przeglądaj katalog sprawdzonych wypożyczalni sprzętu budowlanego w Polsce.',
    images: [
      {
        url: '/header.png',
        width: 1200,
        height: 630,
        alt: 'Katalog firm – Wypozycz.Online',
      },
    ],
    type: 'website',
  },
};

export default async function CatalogPage() {
  const [companies, cities, voivodeships] = await Promise.all([
    fetchAllCompanies(),
    getAllCities(),
    getAllVoivodeships(),
  ]);

  // JSON-LD ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog wypożyczalni sprzętu budowlanego',
    description: 'Lista sprawdzonych wypożyczalni sprzętu budowlanego w Polsce.',
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
        companies={companies}
        cities={cities}
        voivodeships={voivodeships}
      />
    </>
  );
}
