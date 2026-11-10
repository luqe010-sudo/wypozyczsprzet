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

const PERIOD_ACCUSATIVE = { godzina: 'godzinę', doba: 'dobę', tydzień: 'tydzień', miesiąc: 'miesiąc' };

const isShouting = (text) => {
  const letters = text.replace(/[^\p{L}]/gu, '');
  return letters.length > 0 && letters.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.5;
};

/**
 * First sentence of a listing description that reads as prose: no headings in capitals,
 * spec lines ("Producent: WUBER"), bullet points or greetings.
 */
export function descriptionLead(text) {
  const chunks = String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .split(/\r?\n+/)
    // Split into sentences, but not after abbreviations such as "np." or "ul.".
    .flatMap((line) => line.split(/(?<!\b(?:np|ul|tj|ok|tzw|wg|m\.in|nr|godz|al|os)\.)(?<=[.!?])\s+/i))
    .map((part) => part.replace(/\s+/g, ' ').trim().replace(/^(dzień dobry|witam)[,!.]?\s*/i, ''));
  const sentence = chunks.find((part) => (
    part.length >= 30
    && !part.includes(' | ')
    && !/^[-–•*]/.test(part)
    && !/^[^:]{0,30}:/.test(part)
    && !isShouting(part)
  ));
  if (!sentence) return '';
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return /[.!?…]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

/**
 * Search snippet for a listing: "Zagęszczarka na wynajem – Wrocław, od 120 zł za dobę. Możliwa dostawa. {zdanie z opisu} Bez prowizji."
 * Only facts stated in the listing are used.
 */
export function listingMetaDescription(listing, maxLength = 160) {
  const name = listing['Sprzęt'] || 'Sprzęt budowlany';
  const price = listing.priceType === 'fixed' && listing.priceAmount > 0
    ? `, od ${formatMoney(listing.priceAmount)} za ${PERIOD_ACCUSATIVE[listing.Czas] || listing.Czas || 'dobę'}`
    : '';
  const city = listing.Miasto ? ` – ${listing.Miasto}` : '';
  const facts = [
    listing.withOperator === true && 'Możliwy wynajem z operatorem.',
    listing.deliveryAvailable === true && 'Możliwa dostawa.',
  ].filter(Boolean);
  const head = [`${name} na wynajem${city}${price}.`, ...facts].join(' ');
  const tail = 'Bez prowizji.';
  const room = maxLength - head.length - tail.length - 2;
  const lead = descriptionLead(listing.Opis);
  const middle = lead && room >= 40 ? plainTextExcerpt(lead, room) : '';
  return plainTextExcerpt([head, middle, tail].filter(Boolean).join(' '), maxLength);
}
