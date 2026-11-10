import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SEO_CATEGORIES, SEO_CATEGORY_SLUGS } from '../../../../../lib/categories';
import { fetchListingBySlug, fetchSuggestions, isUnpublishedSlug, toCard } from '../../../../../lib/listings';
import { formatDate, formatMoney, listingMetaDescription, plainTextExcerpt } from '../../../../../lib/format';
import { CONFIRMATION_REMINDER_DAYS, SITE_NAME, SITE_URL } from '../../../../../lib/site';
import ListingPageClient from './ListingPageClient';
import InactiveListingPage from './InactiveListingPage';

export const revalidate = 3600;

// Rendered on first request, then cached until revalidated.
export function generateStaticParams() {
  return [];
}

const jsonLdScript = (data) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);

function recentDeclaredAvailability(listing) {
  const ageInDays = (Date.now() - Date.parse(listing.lastConfirmedAt)) / 86_400_000;
  if (!listing.isClaimed || !listing.availability || !(ageInDays >= 0 && ageInDays <= CONFIRMATION_REMINDER_DAYS)) {
    return null;
  }
  return listing['Dostępność'];
}

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  if (!SEO_CATEGORY_SLUGS.includes(category)) return {};

  const data = await fetchListingBySlug(slug);
  if (!data) {
    return {
      title: `Ogłoszenie nieaktywne | ${SITE_NAME}`,
      robots: { index: false, follow: true },
    };
  }

  const { listing, canonicalPath } = data;
  const name = listing['Sprzęt'] || 'Sprzęt budowlany';
  const price = listing.priceType === 'fixed' && Number.isFinite(listing.priceAmount) ? ` od ${formatMoney(listing.priceAmount)}` : '';
  const title = `${name} – wynajem, ${listing.Miasto}${price} | ${SITE_NAME}`;
  const description = listingMetaDescription(listing);

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      type: 'website',
      ...(listing.gallery[0] ? { images: [{ url: listing.gallery[0], alt: `${name} na wynajem` }] } : {}),
    },
  };
}

export default async function ListingPage({ params }) {
  const { category, city, slug } = await params;
  if (!SEO_CATEGORY_SLUGS.includes(category)) notFound();

  const data = await fetchListingBySlug(slug);

  if (!data) {
    if (await isUnpublishedSlug(slug)) {
      const suggestions = await fetchSuggestions(6, category);
      return <InactiveListingPage suggestions={suggestions} category={category} />;
    }
    notFound();
  }

  const { listing, related, canonicalPath } = data;
  if (canonicalPath !== `/${category}/${city}/${slug}`) permanentRedirect(canonicalPath);

  const name = listing['Sprzęt'] || 'Sprzęt';
  const categoryInfo = SEO_CATEGORIES[listing.seoCategory];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: categoryInfo?.name || category, item: `${SITE_URL}/${category}` },
      { '@type': 'ListItem', position: 3, name: listing.Miasto, item: `${SITE_URL}/${category}/${city}` },
      { '@type': 'ListItem', position: 4, name, item: `${SITE_URL}${canonicalPath}` },
    ],
  };

  // Only stated facts go into structured data: no ratings or reviews exist, so none are declared.
  const productJsonLd = listing.priceType === 'fixed' && Number.isFinite(listing.priceAmount) ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: plainTextExcerpt(listing.Opis, 300) || `${name} na wynajem, ${listing.Miasto}.`,
    ...(listing.gallery.length > 0 ? { image: listing.gallery } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${canonicalPath}`,
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      price: String(listing.priceAmount),
      priceCurrency: 'PLN',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(listing.priceAmount),
        priceCurrency: 'PLN',
        unitText: listing.Czas,
      },
      areaServed: { '@type': 'City', name: listing.Miasto },
      seller: { '@type': 'Organization', name: listing.companyDetails.Nazwa },
    },
  } : null;

  return (
    <>
      {jsonLdScript(breadcrumbJsonLd)}
      {productJsonLd && jsonLdScript(productJsonLd)}

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-8">
        <nav aria-label="Ścieżka" className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:underline">Strona główna</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${category}`} className="hover:underline">{categoryInfo?.name || category}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${category}/${city}`} className="hover:underline">{listing.Miasto}</Link>
        </nav>

        <ListingPageClient
          key={listing.ID_sprzetu}
          listing={listing}
          related={related.map(toCard)}
          categorySlug={category}
          categoryName={categoryInfo?.name || category}
          canonicalPath={canonicalPath}
          confirmedDate={formatDate(listing.lastConfirmedAt)}
          declaredAvailability={recentDeclaredAvailability(listing)}
        />
      </div>
    </>
  );
}
