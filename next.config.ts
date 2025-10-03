import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for 'fs' module not found errors in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Ignore dynamic require warnings for optional keyv adapters
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/keyv/,
        message: /Can't resolve '@keyv\//,
      },
      {
        module: /node_modules\/cacheable-request/,
      },
    ];

    return config;
  },
};

export default nextConfig;
