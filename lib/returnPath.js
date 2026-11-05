export function returnPath(value) {
  const fallback = '/dashboard';
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  try {
    const base = 'https://wypozycz.online';
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith('//') || /^\/(?:login|auth)(?:\/|$)/.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
