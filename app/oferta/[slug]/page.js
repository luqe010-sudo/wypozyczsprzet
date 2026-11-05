import { notFound, permanentRedirect } from 'next/navigation';
import { fetchListingByLegacySlug, listingPath } from '../../../lib/listings';

/** Old URL format, kept so links from before the restructure still lead to the listing. */
export default async function LegacyListingPage({ params }) {
  const { slug } = await params;
  const listing = await fetchListingByLegacySlug(slug);
  if (!listing) notFound();
  permanentRedirect(listingPath(listing));
}
