export const SITE_NAME = 'wypozycz.online';
export const SITE_URL = 'https://wypozycz.online';

// Addresses shown publicly and used for notifications.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'lukasz.szyp@gmail.com';

// A local page (category×city, city, voivodeship) is indexed from its first local offer: it also carries
// data-driven content (price table, FAQ), offers within 30 km and companies from the catalog. Until
// 2026-11-17 this was 3, which de-indexed ~90 hubs that had earned most of the hub clicks in Search Console.
export const MIN_LISTINGS_FOR_INDEXING = 1;

// A nationwide category page, or a city promoted on the home page, needs a few offers to be worth showing.
export const MIN_LISTINGS_FOR_CATEGORY_INDEXING = 3;

// A listing is confirmed by its owner at least this often.
export const CONFIRMATION_REMINDER_DAYS = 30;
export const CONFIRMATION_GRACE_DAYS = 14;

export const INQUIRY_RETENTION_MONTHS = 12;
