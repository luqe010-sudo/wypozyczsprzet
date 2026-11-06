export const GA_MEASUREMENT_ID = 'G-02JHGY66TQ';
export const CONSENT_KEY = 'cookieConsent';

let initialized = false;

export function readCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const consent = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
    return typeof consent?.analytics === 'boolean' ? consent : null;
  } catch {
    return null;
  }
}

export function initializeAnalytics() {
  if (readCookieConsent()?.analytics !== true) return null;

  window.dataLayer ||= [];
  window.gtag ||= function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!initialized) {
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
    initialized = true;
  }

  return window.gtag;
}

// Consent is checked before queueing. The tag can load after the first client render.
export function trackEvent(eventName, params = {}) {
  const gtag = initializeAnalytics();
  gtag?.('event', eventName, params);
}
