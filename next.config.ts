import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Cache Components mode - enables use cache directive
  cacheComponents: true,

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
    unoptimized: process.env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // poweredByHeader: false,
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false // Should be false in production for type safety
  },

  reactCompiler: true

  // // Turbopack configuration
  // turbopack: {
  //   // Root should point to project root, not parent directory
  //   root: __dirname,
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js'
  //     }
  //   },
  //   resolveAlias: {
  //     underscore: 'lodash'
  //   },
  //   resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  //   debugIds: process.env.NODE_ENV === 'development' // Only enable in development
  // }
};

export default nextConfig;
