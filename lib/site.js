export const SITE_NAME = 'wypozycz.online';
export const SITE_URL = 'https://wypozycz.online';

// Addresses shown publicly and used for notifications.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'lukasz.szyp@gmail.com';

// A hub page is worth indexing only when it has real content on it.
export const MIN_LISTINGS_FOR_INDEXING = 3;

// A listing is confirmed by its owner at least this often.
export const CONFIRMATION_REMINDER_DAYS = 30;
export const CONFIRMATION_GRACE_DAYS = 14;

export const INQUIRY_RETENTION_MONTHS = 12;
