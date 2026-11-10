import { fetchMarketplaceData } from '../../../lib/listings';
import { listingCoordinates } from '../../../lib/search';

// Prerendered and served from the CDN like a static file. Next rebuilds it in the background on the
// schedule of the listing data cache (at most every 5 minutes, and only when someone requests it),
// and right after any listing edit, because that data carries the "listings" tag.
export const revalidate = 3600;

const round = (value) => Math.round(value * 1e5) / 1e5;

/** Map pins with just enough for the popup card: no descriptions, phones or galleries. */
export async function GET() {
  const { listings } = await fetchMarketplaceData();
  const points = [];
  for (const listing of listings) {
    const point = listingCoordinates(listing);
    if (!point) continue;
    points.push({
      ID_sprzetu: listing.ID_sprzetu,
      ['Sprzęt']: listing['Sprzęt'],
      Kategoria: listing.Kategoria,
      seoCategory: listing.seoCategory,
      citySlug: listing.citySlug,
      slug: listing.slug,
      Miasto: listing.Miasto,
      priceType: listing.priceType,
      priceAmount: listing.priceAmount,
      Czas: listing.Czas,
      Zdjecie: listing.gallery[0] || listing.Zdjecie,
      lat: round(point.lat),
      lng: round(point.lng),
    });
  }
  return Response.json({ generatedAt: new Date().toISOString(), listings: points });
}
