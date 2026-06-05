import { notFound } from 'next/navigation';
import {
  fetchCompanyBySlug,
  generateVoivodeshipCompanyParams,
  voivodeshipSlug,
  getPrimaryCitySlug,
} from '../../../../../lib/supabaseDirectory';
import CompanyCard from '../../../../../components/directory/CompanyCard';
import DirectoryBreadcrumbs from '../../../../../components/directory/DirectoryBreadcrumbs';

/**
 * Generate all [voivodeship]/[companySlug] combinations at build time.
 */
export async function generateStaticParams() {
  return await generateVoivodeshipCompanyParams();
}

/**
 * Dynamic metadata for SEO.
 * Canonical points to the city variant to avoid duplicate content.
 */
export async function generateMetadata({ params }) {
  const company = await fetchCompanyBySlug(params.companySlug);
  if (!company) return { title: 'Firma nie znaleziona' };

  // Find the matching voivodeship name from branches
  const matchingBranch = company.branches?.find(
    (b) => b.voivodeship && voivodeshipSlug(b.voivodeship) === params.voivodeship
  );
  const voivName = matchingBranch?.voivodeship || params.voivodeship;

  const title = `${company.name} – woj. ${voivName} | Katalog firm – Wypozycz.Online`;
  const description = company.description
    ? `${company.name} w województwie ${voivName}. ${company.description.substring(0, 120)}...`
    : `${company.name} – wypożyczalnia sprzętu budowlanego w woj. ${voivName}. Sprawdź dane kontaktowe i ofertę.`;

  // Canonical → primary city variant (avoid duplicate indexing)
  const primaryCity = getPrimaryCitySlug(company);
  const slug = company.slug || params.companySlug;

  return {
    title,
    description,
    alternates: {
      canonical: primaryCity
        ? `/katalog/${primaryCity}/${slug}`
        : `/katalog/woj/${params.voivodeship}/${slug}`,
    },
    openGraph: {
      title: `${company.name} – woj. ${voivName}`,
      description,
      images: company.logo_url
        ? [{ url: company.logo_url, width: 200, height: 200, alt: company.name }]
        : [{ url: '/header.png', width: 1200, height: 630, alt: company.name }],
      type: 'website',
    },
  };
}

export default async function CompanyVoivodeshipPage({ params }) {
  const company = await fetchCompanyBySlug(params.companySlug);
  if (!company) notFound();

  // Find voivodeship name from branches
  const matchingBranch = company.branches?.find(
    (b) => b.voivodeship && voivodeshipSlug(b.voivodeship) === params.voivodeship
  );
  const voivName = matchingBranch?.voivodeship || params.voivodeship;

  // JSON-LD LocalBusiness
  const firstBranch = company.branches?.[0] || {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description:
      company.description || `Wypożyczalnia sprzętu budowlanego w woj. ${voivName}`,
    url: `https://wypozycz.online/katalog/woj/${params.voivodeship}/${params.companySlug}`,
    ...(company.logo_url ? { logo: company.logo_url } : {}),
    ...(company.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: company.rating,
            reviewCount: company.review_count || 1,
          },
        }
      : {}),
    address: company.branches
      ?.filter((b) => b.voivodeship && voivodeshipSlug(b.voivodeship) === params.voivodeship)
      .map((b) => ({
        '@type': 'PostalAddress',
        streetAddress: b.address || '',
        addressLocality: b.city || '',
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
            { label: `woj. ${voivName}`, href: `/katalog?voivodeship=${params.voivodeship}` },
            { label: company.name },
          ]}
        />
        <CompanyCard
          company={company}
          contextType="voivodeship"
          contextName={`woj. ${voivName}`}
        />
      </div>
    </>
  );
}
