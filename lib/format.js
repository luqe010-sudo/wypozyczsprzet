/** Display helpers shared by server and client components. */

export function plural(count, one, few, many) {
  const n = Math.abs(count);
  if (n === 1) return one;
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}

export const offersLabel = (count) => `${count} ${plural(count, 'oferta', 'oferty', 'ofert')}`;

export function formatMoney(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  return `${value.toLocaleString('pl-PL', { maximumFractionDigits: 2 })} zł`;
}

/** Listing price as a single phrase: "120 zł / doba" or "Cena na zapytanie". */
export function priceText(listing) {
  if (listing?.priceType === 'fixed' && listing.priceAmount != null) {
    return `${formatMoney(listing.priceAmount)} / ${listing.Czas || 'doba'}`;
  }
  return 'Cena na zapytanie';
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Facts stated in the listing data. Unknown values are left out rather than guessed. */
export function listingFacts(listing) {
  const facts = [];
  if (listing['Dostępność'] && listing['Dostępność'] !== 'brak danych') {
    facts.push({ label: 'Dostępność', value: listing['Dostępność'] });
  }
  if (listing.deliveryAvailable === true) facts.push({ label: 'Dostawa', value: 'Możliwa dostawa' });
  if (listing.deliveryAvailable === false) facts.push({ label: 'Dostawa', value: 'Odbiór własny' });
  if (listing.withOperator === true) facts.push({ label: 'Operator', value: 'Możliwy wynajem z operatorem' });
  if (listing.withOperator === false) facts.push({ label: 'Operator', value: 'Bez operatora' });
  if (listing.vatInvoice === true) facts.push({ label: 'Faktura VAT', value: 'Tak' });
  if (listing.vatInvoice === false) facts.push({ label: 'Faktura VAT', value: 'Nie' });
  if (listing.depositAmount != null) facts.push({ label: 'Kaucja', value: formatMoney(listing.depositAmount) });
  Object.entries(listing.specs || {}).forEach(([label, value]) => {
    if (value) facts.push({ label, value: String(value) });
  });
  return facts;
}

export function plainTextExcerpt(text, maxLength = 155) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`;
}
