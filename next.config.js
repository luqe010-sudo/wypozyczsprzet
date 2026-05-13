/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.wroclaw-wypozyczalnia.pl' },
      { protocol: 'https', hostname: 'www.prkwroclaw.pl' },
      { protocol: 'https', hostname: 'www.pakop.pl' },
      { protocol: 'https', hostname: 'xraven.pl' },
      { protocol: 'https', hostname: 'www.minikoparkawroclaw.pl' },
      { protocol: 'https', hostname: 'www.rental.wroclaw.pl' },
      { protocol: 'https', hostname: 'www.szalunki-wroclaw.pl' },
      { protocol: 'https', hostname: 'www.koparki-digger.com.pl' },
      { protocol: 'https', hostname: 'www.gardenico.pl' },
      { protocol: 'https', hostname: 'www.minikoparkawro.pl' },
      { protocol: 'https', hostname: 'stromorental.pl' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    minimumCacheTTL: 3600,
  },
  async redirects() {
    return [
      {
        source: '/dodaj-ogloszenie',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
