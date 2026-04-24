// Google Analytics event tracking helper
// Safely calls gtag() only when it's available (client-side with script loaded)

export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
