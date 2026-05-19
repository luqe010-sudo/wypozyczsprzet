/**
 * Geographic distance utilities for nearby listings.
 * Uses the Haversine formula for great-circle distance.
 */

/**
 * Calculate the distance (in km) between two geographic coordinates.
 * @param {number} lat1 - Latitude of point A
 * @param {number} lng1 - Longitude of point A
 * @param {number} lat2 - Latitude of point B
 * @param {number} lng2 - Longitude of point B
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find listings near a given coordinate, excluding a specific city.
 * @param {Array} listings - All listings in the same category
 * @param {number} centerLat - Center latitude (current city)
 * @param {number} centerLng - Center longitude (current city)
 * @param {number} radiusKm - Radius in kilometers (default 30)
 * @param {string} excludeCity - City name to exclude (the current city)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Nearby listings with added `_distance` property (km)
 */
export function getNearbyListings(
  listings,
  centerLat,
  centerLng,
  radiusKm = 30,
  excludeCity = '',
  maxResults = 9
) {
  if (!centerLat || !centerLng) return [];

  const nearby = [];

  for (const listing of listings) {
    // Skip listings from the current city
    if (excludeCity && listing.Miasto === excludeCity) continue;

    // Need coordinates to calculate distance
    const lat = parseFloat(listing.lat);
    const lng = parseFloat(listing.lng);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue;

    const distance = haversineDistance(centerLat, centerLng, lat, lng);

    if (distance <= radiusKm) {
      nearby.push({
        ...listing,
        _distance: Math.round(distance),
      });
    }
  }

  // Sort by distance (closest first), then limit
  nearby.sort((a, b) => a._distance - b._distance);
  return nearby.slice(0, maxResults);
}

/**
 * Get center coordinates for a city from a list of listings.
 * Returns the coordinates of the first listing found in that city.
 * @param {Array} listings - Listings to search
 * @param {string} cityName - City name to find
 * @returns {{ lat: number, lng: number } | null}
 */
export function getCityCoordinates(listings, cityName) {
  for (const listing of listings) {
    if (listing.Miasto === cityName) {
      const lat = parseFloat(listing.lat);
      const lng = parseFloat(listing.lng);
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  return null;
}
