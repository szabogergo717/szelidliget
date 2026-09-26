/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // A www változat a kanonikus — egységes URL a Google felé.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'szelidliget.hu' }],
        destination: 'https://www.szelidliget.hu/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
