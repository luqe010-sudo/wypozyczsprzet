export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/oferta/', '/admin/', '/dashboard/', '/api/'],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
    ],
    sitemap: 'https://wypozycz.online/sitemap.xml',
  };
}
