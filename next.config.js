/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  turbopack: {},  // Explicitly enable Turbopack
  experimental: {
    // Optimize CSS loading to prevent unused preload warnings
    optimizePackageImports: ["lucide-react"],
    optimizeCss: false,  // Safe mode - prevent phantom CSS hashes
  },
  // TypeScript configuration
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Webpack configuration for server-side modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark Remotion packages as external (not bundled)
      // These packages have native binaries and should not be bundled by Webpack
      config.externals.push('@remotion/bundler', '@remotion/renderer', 'remotion', 'esbuild');
    }
    return config;
  },
  images: {
    unoptimized: false,
    // Whitelist trusted image sources only (prevents malicious image injection)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'simplifyconvert.com',
      },
      {
        protocol: 'https',
        hostname: 'www.simplifyconvert.com',
      },
      {
        protocol: 'https',
        hostname: '*.simplifyconvert.com',
      },
      // Development - allows localhost
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  // 301 Redirects for broken/deprecated URLs to correct URLs
  // Fixes SEO issues: Google Search Console 404 errors for /tools and instagram-post-resizer
  // All redirects are permanent (301) to preserve SEO authority
  async redirects() {
    return [
      // CRITICAL: www → non-www domain redirect (consolidates domain canonicalization)
      // Prevents duplicate content indexing and preserves SEO authority
      // All requests to www.simplifyconvert.com redirect to simplifyconvert.com
      {
        source: '/:path*',
        destination: 'https://simplifyconvert.com/:path*',
        permanent: true, // 301 redirect - permanent change
        has: [
          {
            type: 'host',
            value: 'www.simplifyconvert.com',
          },
        ],
      },
      // CRITICAL: /tools → /all-tools (resolves Google Search Console 404 error)
      // Old path was '/tools', new consolidated path is '/all-tools'
      {
        source: '/tools',
        destination: '/all-tools',
        permanent: true, // 301 redirect - permanent change
      },
      // CRITICAL: instagram-post-resizer → image-resizer (resolves Google Search Console 404 error)
      // Tool was renamed from 'instagram-post-resizer' to 'image-resizer' but old URL still indexed
      {
        source: '/all-tools/instagram-post-resizer',
        destination: '/all-tools/image-resizer',
        permanent: true, // 301 redirect - permanent change
      },
      // Convert /converters/ URLs to /all-tools/ (fixes canonical URL issues)
      // Handles both direct routes (/all-tools/converters/add-border) and nested routes
      {
        source: '/all-tools/converters/:path*',
        destination: '/all-tools/:path*',
        permanent: true, // 301 redirect
      },
      // /all-tools/video → /all-tools/video-tools (consolidates video tools)
      {
        source: '/all-tools/video',
        destination: '/all-tools/video-tools',
        permanent: true, // 301 redirect
      },
    ];
  },
};

module.exports = nextConfig;

