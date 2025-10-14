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
};

module.exports = nextConfig;
