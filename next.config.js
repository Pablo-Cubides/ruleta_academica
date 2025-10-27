/**
 * Next.js configuration file.
 *
 * Note: ESLint is disabled during `next build` to avoid environment-specific
 * filesystem scanning issues (EPERM on some Windows profile folders). This
 * is a pragmatic decision for local builds — CI should run `npm run lint`
 * separately so linting still happens in the pipeline.
 */
const nextConfig = {
  eslint: {
    // Prevent Next.js from running ESLint during `next build`.
    // CI pipelines should run `npm run lint` explicitly.
    ignoreDuringBuilds: true,
  },

  // Security headers and CORS configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
      {
        // CORS and caching for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || '*' // Configure in production
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
