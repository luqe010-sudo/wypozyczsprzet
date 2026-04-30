/**
 * Cleans up Polish address strings for better geocoding results.
 * Removes zip codes and apartment numbers.
 * Example: "ul. Kolejowa 5/12", "02-123 Warszawa" -> "ul. Kolejowa 5, Warszawa"
 */
export const sanitizeAddress = (loc, city) => {
  if (!loc && !city) return '';
  
  // Remove zip code from city: "00-000 City" -> "City"
  const cleanCity = (city || '').replace(/^\d{2}-\d{3}\s+/, '').trim();
  
  // Remove apartment number: "Street 5/12" -> "Street 5"
  // We look for a slash after a number
  const cleanLoc = (loc || '').split('/')[0].trim();
  
  if (!cleanLoc) return cleanCity;
  
  // If location already contains city, just return location
  if (cleanLoc.toLowerCase().includes(cleanCity.toLowerCase())) {
    return cleanLoc;
  }
  
  return `${cleanLoc}, ${cleanCity}`;
};
