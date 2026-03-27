import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js 16 we're aware of Turbopack
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill Node.js modules for Solana SDK in browser bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_NETWORK: process.env.NETWORK ?? 'devnet',
  },
};

export default nextConfig;
