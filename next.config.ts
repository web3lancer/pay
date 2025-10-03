import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
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
