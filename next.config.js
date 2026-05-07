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
  // 301 Redirects for old /converters/ URLs to clean /all-tools/[slug] URLs
  // Fixes canonical URL issue where pages were under /all-tools/converters/ but should be /all-tools/
  // Handles both direct routes (/all-tools/converters/add-border) and nested routes (/all-tools/converters/ai-tools/...)
  async redirects() {
    return [
      {
        source: '/all-tools/converters/:path*',
        destination: '/all-tools/:path*',
        permanent: true, // 301 redirect
      },
    ];
  },
};

module.exports = nextConfig;
