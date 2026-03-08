import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const isTauri = process.env.TAURI_ENV === 'true' || isProd; // Assuming prod build is for Tauri

const nextConfig: NextConfig = {
  // Cache Components mode - enables use cache directive
  cacheComponents: true,
  output: 'export',
  distDir: 'dist',
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'academy-public.coinmarketcap.com' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/**' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
      { protocol: 'https', hostname: 'placehold.co' }
    ],
    unoptimized: true, // MUST be true for Tauri/SSG
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  poweredByHeader: false,
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false
  },

  // React Compiler for automatic optimization
  reactCompiler: true,

  logging: {
    fetches: {
      fullUrl: true // Shows complete URLs for fetch requests in terminal
    }
  },

  // Redirects - removed automatic redirect to dashboard to allow homepage access
  async redirects() {
    return [];
  },
  // Headers are handled by the web server; Tauri doesn't use these.
  // We skip them in export mode to prevent build errors.
  ...(isTauri
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
              ]
            }
          ];
        }
      }),

  // Experimental features
  experimental: {
    // Cache life profiles for use cache directive
    cacheLife: {
      default: {
        stale: 3600, // 1 hour stale-while-revalidate
        revalidate: 7200, // 2 hours background revalidation
        expire: 86400 // 24 hours max age
      },
      hours: {
        stale: 3600,
        revalidate: 7200,
        expire: 86400
      },
      days: {
        stale: 86400,
        revalidate: 172800,
        expire: 604800 // 7 days
      },
      weeks: {
        stale: 604800,
        revalidate: 1209600,
        expire: 2592000 // 30 days
      },
      max: {
        stale: 2592000, // 30 days
        revalidate: 5184000,
        expire: 31536000 // 365 days
      }
    },
    // View Transitions API
    viewTransition: true,
    optimizePackageImports: [
      'lucide-react', // Optimize icon imports
      '@radix-ui/react-dialog', // Optimize component libraries
      '@radix-ui/react-dropdown-menu',
      'date-fns' // Optimize date utilities
    ],
    serverComponentsHmrCache: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};

export default withSentryConfig(nextConfig, {
  org: 'health-factory',
  project: 'clinic-nextjs',

  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: isTauri ? undefined : '/monitoring'
});
