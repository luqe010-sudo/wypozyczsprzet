import { permanentRedirect, redirect } from 'next/navigation';
import { fetchListingBySlug } from '../../../lib/googleSheets';

/**
 * Legacy route: /oferta/{slug}
 * 
 * This page exists ONLY to handle old URLs that may still be indexed by Google
 * or linked from external sources. It performs a server-side redirect (301/308)
 * to the new URL structure: /{category}/{city}/{equipment-slug}
 */
export default async function LegacyListingPage({ params }) {
  const { slug } = await params;
  const data = await fetchListingBySlug(slug);

  if (data && data.listing) {
    const { listing } = data;
    const newUrl = `/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`;
    permanentRedirect(newUrl);
  }

  // If listing not found, redirect to home
  redirect('/');
}
