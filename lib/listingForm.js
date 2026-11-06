/** Reads and validates the listing fields shared by the owner and admin forms. Runs on the server. */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const RENTAL_PERIODS = new Set(['hour', 'day', 'week', 'month']);
const AVAILABILITIES = new Set(['immediately', 'on_call', 'rented', 'unavailable']);
const MAX_GALLERY_IMAGES = 8;

function money(value) {
  const amount = String(value ?? '').trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(amount)) return null;
  const parsed = Number(amount);
  return parsed <= 99999999.99 ? parsed : null;
}

function triState(value) {
  if (value === 'yes') return true;
  if (value === 'no') return false;
  return null;
}

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function safeUrl(value) {
  const raw = text(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** "Waga: 80 kg" per line → { Waga: "80 kg" } */
export function parseSpecs(raw) {
  const specs = {};
  String(raw || '')
    .split('\n')
    .slice(0, 20)
    .forEach((line) => {
      const separator = line.indexOf(':');
      if (separator <= 0) return;
      const key = line.slice(0, separator).trim().slice(0, 40);
      const value = line.slice(separator + 1).trim().slice(0, 120);
      if (key && value) specs[key] = value;
    });
  return specs;
}

export function specsToText(specs) {
  return Object.entries(specs || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

/** Accepts only images uploaded to this project's Cloudinary folder, plus URLs the listing already had. */
function parseGallery(raw, existing = []) {
  let urls;
  try {
    urls = JSON.parse(raw || '[]');
  } catch {
    return [];
  }
  if (!Array.isArray(urls)) return [];

  const uploadPrefix = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
  return urls
    .filter((url) => typeof url === 'string')
    .filter((url) => existing.includes(url) || (url.startsWith(uploadPrefix) && url.includes('/listings/')))
    .slice(0, MAX_GALLERY_IMAGES);
}

export function parseListingFields(formData, { existingImages = [] } = {}) {
  const priceType = formData.get('price_type') === 'fixed' ? 'fixed' : 'ask';
  const priceAmount = priceType === 'fixed' ? money(formData.get('price_amount')) : null;
  if (priceType === 'fixed' && priceAmount === null) {
    throw new Error('Podaj poprawną cenę z dokładnością do dwóch miejsc po przecinku albo wybierz „Cena na zapytanie”.');
  }
  const deposit = text(formData.get('deposit_amount'), 30);
  const depositAmount = money(deposit);
  if (deposit && depositAmount === null) throw new Error('Podaj poprawną kwotę kaucji z dokładnością do dwóch miejsc po przecinku.');

  const name = text(formData.get('name'), 120);
  if (!name) throw new Error('Podaj nazwę sprzętu.');

  const gallery = parseGallery(formData.get('gallery'), existingImages);
  const rentalPeriod = String(formData.get('rental_period') || 'day');
  const availability = String(formData.get('availability') || '').trim();

  return {
    name,
    category: text(formData.get('category'), 60) || null,
    subcategory: text(formData.get('subcategory'), 60) || null,
    category_id: formData.get('category_id') || null,
    subcategory_id: formData.get('subcategory_id') || null,
    branch_id: formData.get('branch_id') || null,
    price_type: priceType,
    price_amount: priceAmount,
    price_from: priceType === 'fixed' ? String(priceAmount) : 'zapytaj',
    deposit_amount: depositAmount,
    delivery_available: triState(formData.get('delivery_available')),
    with_operator: triState(formData.get('with_operator')),
    vat_invoice: triState(formData.get('vat_invoice')),
    specs: parseSpecs(formData.get('specs')),
    rental_period: RENTAL_PERIODS.has(rentalPeriod) ? rentalPeriod : 'day',
    availability: AVAILABILITIES.has(availability) ? availability : 'on_call',
    description: text(formData.get('description'), 5000),
    external_olx_url: safeUrl(formData.get('external_olx_url')),
    image_url: gallery[0] || null,
    gallery_urls: gallery.slice(1),
  };
}
