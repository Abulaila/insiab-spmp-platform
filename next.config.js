/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'next-themes'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Enable linting during builds - remove this after fixing linting issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds - remove this after fixing TS issues
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;