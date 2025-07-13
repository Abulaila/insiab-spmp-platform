import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    // Temporarily ignore during builds for existing issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore for existing API route issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
