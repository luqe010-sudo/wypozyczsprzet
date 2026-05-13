/**
 * List of known broken or low-quality external links from the audit.
 * These will be marked with nofollow or hidden in the UI.
 */
const BROKEN_URLS = [
  'wroclaw-wypozyczalnia.pl',
  'www.wroclaw-wypozyczalnia.pl',
  'pakop.pl',
  'www.pakop.pl',
  'olx.pl/d/oferta/koparko-ladowarka-jcb-3cx-wynajem-stary-wielislaw-IDW8VzB',
  'olx.pl/oferta/koparko-ladowarka-jcb-3cx-wynajem-stary-wielislaw-IDW8VzB'
];

/**
 * Checks if a URL is in the known broken list.
 */
export function isBrokenLink(url) {
  if (!url) return false;
  return BROKEN_URLS.some(broken => url.toLowerCase().includes(broken.toLowerCase()));
}

/**
 * Returns security and SEO attributes for external links.
 */
export function getExternalLinkProps(url) {
  const props = {
    target: "_blank",
    rel: "noopener noreferrer"
  };

  if (isBrokenLink(url)) {
    props.rel = "noopener noreferrer nofollow";
    // We could also return a flag to hide the link entirely
    props.isBroken = true;
  }

  return props;
}

/**
 * Filters an array of items (e.g. partners or listings) by removing those with broken links.
 */
export function filterBrokenLinks(items, urlKey = 'url') {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(item => {
    const url = typeof item === 'string' ? item : item[urlKey];
    return !isBrokenLink(url);
  });
}
