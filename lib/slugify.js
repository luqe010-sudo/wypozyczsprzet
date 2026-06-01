// ─── Polish diacritics map ───────────────────────────────────────────────────
const POLISH_MAP = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
  'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n',
  'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
};

/**
 * Generates a URL-safe slug from a Polish string.
 * Example: "PRK Wrocław Sp. z o.o." → "prk-wroclaw-sp-z-o-o"
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => POLISH_MAP[char] || char)
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .replace(/\s+/g, '-')         // spaces → hyphens
    .replace(/-+/g, '-')          // collapse multiple hyphens
    .replace(/^-|-$/g, '');       // trim leading/trailing hyphens
}

/**
 * Normalizes a city name for URL usage.
 * Example: "Wrocław" → "wroclaw"
 */
export function citySlug(city) {
  return slugify(city);
}

/**
 * Normalizes a voivodeship name for URL usage.
 * Example: "dolnośląskie" → "dolnoslaskie"
 */
export function voivodeshipSlug(voivodeship) {
  return slugify(voivodeship);
}
