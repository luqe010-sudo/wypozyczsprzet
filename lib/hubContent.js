/**
 * Data-derived copy for landing pages (category × city, city, region).
 * Every number and sentence comes from the listings shown on the page, so each hub
 * reads differently and nothing is invented (see "Prawda w treści" in docs/AGENTS.md).
 */
import { SEO_CATEGORIES } from './categories';
import { formatMoney, offersLabel, plural } from './format';

const DAY_UNIT = 'doba';

const dayPrice = (listing) => (
  listing.priceType === 'fixed' && listing.priceAmount > 0 && (listing.Czas || DAY_UNIT) === DAY_UNIT
    ? listing.priceAmount
    : null
);

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const roundPrice = (value) => Math.round(value / 5) * 5;

function subcategoryLabel(listing) {
  const category = SEO_CATEGORIES[listing.seoCategory];
  const filter = category?.filters.find((f) => f.value === listing.subcategory);
  return filter?.label || null;
}

/** Groups listings into rows of the price table: by equipment type, or by category on city pages. */
function groupRows(items, by) {
  const groups = new Map();
  for (const listing of items) {
    const label = by === 'category'
      ? SEO_CATEGORIES[listing.seoCategory]?.name
      : subcategoryLabel(listing) || 'inny sprzęt';
    if (!label) continue;
    const row = groups.get(label) || { label, count: 0, prices: [], href: null };
    row.count += 1;
    const price = dayPrice(listing);
    if (price != null) row.prices.push(price);
    if (by === 'category') row.href = `/${listing.seoCategory}/${listing.citySlug}`;
    groups.set(label, row);
  }
  return [...groups.values()]
    .map((row) => ({
      label: row.label,
      count: row.count,
      priced: row.prices.length,
      min: row.prices.length ? Math.min(...row.prices) : null,
      max: row.prices.length ? Math.max(...row.prices) : null,
      href: row.href,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pl'));
}

const priceRange = (min, max) => (min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`);

const joinPl = (parts) => (parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} i ${parts.at(-1)}`);

/**
 * @param {object[]} items listings shown on the page
 * @param {{ place: string, categoryName?: string, groupBy: 'subcategory' | 'category' }} options
 */
export function buildHubContent(items, { place, categoryName = null, groupBy }) {
  const rows = groupRows(items, groupBy);
  const prices = items.map(dayPrice).filter((p) => p != null);
  const companies = new Set(items.map((l) => l.companyDetails?.id).filter(Boolean)).size;
  const delivery = items.filter((l) => l.deliveryAvailable === true).length;
  const operator = items.filter((l) => l.withOperator === true).length;
  const verified = items.filter((l) => l.isVerified).length;
  const updated = items.reduce((latest, l) => {
    const date = l.lastConfirmedAt || l.updated_at || l.created_at;
    return date && (!latest || date > latest) ? date : latest;
  }, null);

  const heading = categoryName ? `${categoryName} – ${place}` : `Sprzęt budowlany i ogrodowy – ${place}`;
  // Category names are capitalized ("Roboty ziemne"); inside a sentence they read better in lower case.
  const say = (label) => (groupBy === 'category' ? label.toLowerCase() : label);
  const topTypes = rows.slice(0, 4).map((r) => `${say(r.label)} (${r.count})`);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const total = items.length;

  const introParts = [
    `${heading}: ${offersLabel(total)} wynajmu`
      + (companies > 1 ? ` od ${companies} wynajmujących` : '')
      + '.',
  ];
  if (topTypes.length > 1) introParts.push(`Najwięcej ofert: ${joinPl(topTypes)}.`);
  if (minPrice != null) introParts.push(`Stawki z ogłoszeń zaczynają się od ${formatMoney(minPrice)} za dobę.`);
  if (delivery > 0) introParts.push(`Z dostawą: ${offersLabel(delivery)}.`);
  if (operator > 0) introParts.push(`Z operatorem: ${offersLabel(operator)}.`);

  const faqs = [];
  const pricedRows = rows.filter((r) => r.priced > 0);
  if (prices.length >= 2) {
    const perType = pricedRows.slice(0, 4).map((r) => `${say(r.label)} od ${formatMoney(r.min)}`);
    faqs.push({
      question: `${heading}: ile kosztuje wynajem?`,
      answer: `W ${prices.length} ${plural(prices.length, 'ogłoszeniu', 'ogłoszeniach', 'ogłoszeniach')} z ceną za dobę stawki wynoszą ${priceRange(Math.min(...prices), Math.max(...prices))}, `
        + `typowo około ${formatMoney(roundPrice(median(prices)))}.`
        + (perType.length > 1 ? ` Według typu: ${perType.join(', ')}.` : '')
        + (prices.length < total ? ' Pozostałe oferty mają cenę na zapytanie.' : ''),
    });
  }
  if (rows.length > 1) {
    faqs.push({
      question: `${heading}: jaki sprzęt można wynająć?`,
      answer: `${rows.map((r) => `${say(r.label)}: ${offersLabel(r.count)}`).join('; ')}.`.replace(/^./, (c) => c.toUpperCase()),
    });
  }
  if (operator > 0) {
    faqs.push({
      question: `${heading}: czy można wynająć sprzęt z operatorem?`,
      answer: `Tak. Wynajem z operatorem jest możliwy w ${operator} ${plural(operator, 'ofercie', 'ofertach', 'ofertach')} na ${total}. Zaznacz filtr „Z operatorem”, aby zobaczyć tylko je.`,
    });
  }
  if (delivery > 0) {
    faqs.push({
      question: `${heading}: czy wynajmujący dowożą sprzęt?`,
      answer: `${delivery} ${plural(delivery, 'ogłoszenie', 'ogłoszenia', 'ogłoszeń')} na ${total} ${plural(delivery, 'deklaruje', 'deklarują', 'deklaruje')} dostawę na miejsce pracy. Koszt dowozu ustalasz bezpośrednio z wynajmującym.`,
    });
  }
  faqs.push({
    question: 'Jak zarezerwować sprzęt?',
    answer: 'Wybierz ofertę i zadzwoń albo wyślij zapytanie przez formularz. Umowę i płatność ustalasz bezpośrednio z wynajmującym, serwis nie pobiera prowizji.'
      + ' Gotowe wzory umów wynajmu i protokołu zdawczo-odbiorczego znajdziesz w dziale Wzory umów.',
  });

  return {
    heading,
    intro: introParts.join(' '),
    rows,
    minPrice,
    stats: { companies, delivery, operator, verified, priced: prices.length, total },
    updated,
    faqs,
  };
}

/** Short, query-shaped title fragment: "minikoparki, koparki" for the two most common types. */
export function topTypesLabel(content, limit = 2) {
  return content.rows
    .filter((r) => r.label !== 'inny sprzęt')
    .slice(0, limit)
    .map((r) => r.label)
    .join(', ');
}

export const faqJsonLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});
