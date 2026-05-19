/** @type {import('next').NextConfig} */
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const imageRemotePatterns = [
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
];

if (supabaseHostname) {
  imageRemotePatterns.push({ protocol: 'https', hostname: supabaseHostname });
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: imageRemotePatterns,
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
