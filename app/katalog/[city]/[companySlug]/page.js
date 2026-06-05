import { notFound } from 'next/navigation';
import {
  fetchCompanyBySlug,
  generateCityCompanyParams,
  citySlug,
  getPrimaryCitySlug,
} from '../../../../lib/supabaseDirectory';
import CompanyCard from '../../../../components/directory/CompanyCard';
import DirectoryBreadcrumbs from '../../../../components/directory/DirectoryBreadcrumbs';

/**
 * Generate all [city]/[companySlug] combinations at build time.
 */
export async function generateStaticParams() {
  return await generateCityCompanyParams();
}

/**
 * Dynamic metadata for SEO.
 */
export async function generateMetadata({ params }) {
  const company = await fetchCompanyBySlug(params.companySlug);
  if (!company) return { title: 'Firma nie znaleziona' };

  // Find the matching city name from branches
  const matchingBranch = company.branches?.find(
    (b) => b.city && citySlug(b.city) === params.city
  );
  const cityName = matchingBranch?.city || params.city;

  const title = `${company.name} – ${cityName} | Katalog firm – Wypozycz.Online`;
  const description = company.description
    ? `${company.name} w ${cityName}. ${company.description.substring(0, 140)}...`
    : `${company.name} – wypożyczalnia sprzętu budowlanego w ${cityName}. Sprawdź dane kontaktowe, adres i ofertę.`;

  // Canonical points to primary city variant
  const primaryCity = getPrimaryCitySlug(company);
  const canonicalCity = primaryCity || params.city;

  return {
    title,
    description,
    alternates: {
      canonical: `/katalog/${canonicalCity}/${company.slug || params.companySlug}`,
    },
    openGraph: {
      title: `${company.name} – ${cityName}`,
      description,
      images: company.logo_url
        ? [{ url: company.logo_url, width: 200, height: 200, alt: company.name }]
        : [{ url: '/header.png', width: 1200, height: 630, alt: company.name }],
      type: 'website',
    },
  };
}

export default async function CompanyCityPage({ params }) {
  const company = await fetchCompanyBySlug(params.companySlug);
  if (!company) notFound();

  // Find city name from branches
  const matchingBranch = company.branches?.find(
    (b) => b.city && citySlug(b.city) === params.city
  );
  const cityName = matchingBranch?.city || params.city;

  // JSON-LD LocalBusiness
  const firstBranch = company.branches?.[0] || {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description: company.description || `Wypożyczalnia sprzętu budowlanego w ${cityName}`,
    url: `https://wypozycz.online/katalog/${params.city}/${params.companySlug}`,
    ...(company.logo_url ? { logo: company.logo_url } : {}),
    ...(company.rating ? { aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: company.rating,
      reviewCount: company.review_count || 1,
    }} : {}),
    address: company.branches
      ?.filter((b) => b.city)
      .map((b) => ({
        '@type': 'PostalAddress',
        streetAddress: b.address || '',
        addressLocality: b.city,
        addressRegion: b.voivodeship || '',
        addressCountry: 'PL',
      })) || [],
    ...(firstBranch.phone ? { telephone: firstBranch.phone } : {}),
    ...(firstBranch.email ? { email: firstBranch.email } : {}),
    ...(firstBranch.website ? { sameAs: [firstBranch.website] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[900px] mx-auto px-4 py-6 md:py-10">
        <DirectoryBreadcrumbs
          items={[
            { label: cityName, href: `/katalog?city=${params.city}` },
            { label: company.name },
          ]}
        />
        <CompanyCard
          company={company}
          contextType="city"
          contextName={cityName}
        />
      </div>
    </>
  );
}
