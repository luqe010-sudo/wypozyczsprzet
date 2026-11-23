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

// Paid featuring of a listing: settled by hand (invoice or transfer), then turned on in /admin/featured.
export const FEATURED_PRICE_PLN = 49;
export const FEATURED_DAYS = 30;
// Reminder sent this many days before a paid period ends.
export const FEATURED_REMINDER_DAYS = 5;

// Seller of paid options, named in the terms. Selling stays off until the tax ID is filled in.
export const SELLER = {
  name: 'DevilEnergy Łukasz Szypuła',
  address: 'ul. Zimowa 6/4, 57-215 Srebrna Góra',
  nip: '8871744618',
  // Not a VAT payer (art. 113 ustawy o VAT): prices carry no VAT.
  vatExempt: true,
};
// "49 zł brutto" or "49 zł (bez VAT, sprzedawca zwolniony z VAT)", depending on the seller's VAT status.
export const featuredPriceText = () => `${FEATURED_PRICE_PLN} zł${SELLER.vatExempt ? ' (sprzedawca zwolniony z VAT)' : ' brutto'}`;
export const featuredSalesOpen = () => Boolean(SELLER.name && SELLER.address && SELLER.nip);
