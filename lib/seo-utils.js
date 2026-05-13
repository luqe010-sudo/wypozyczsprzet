/**
 * List of known broken or low-quality external links from the audit.
 * These will be marked with nofollow or hidden in the UI.
 */
const BROKEN_URLS = [
  'wroclaw-wypozyczalnia.pl',
  'pakop.pl',
  // Specific broken OLX paths can be added here
  'olx.pl/d/oferta/koparko-ladowarka-jcb-3cx-wynajem-stary-wielislaw-IDW8VzB' 
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
