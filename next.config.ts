import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore optional keyv adapters that aren't used
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    
    config.externals = [
      ...(config.externals || []),
      {
        '@keyv/redis': 'commonjs @keyv/redis',
        '@keyv/mongo': 'commonjs @keyv/mongo',
        '@keyv/sqlite': 'commonjs @keyv/sqlite',
        '@keyv/postgres': 'commonjs @keyv/postgres',
        '@keyv/mysql': 'commonjs @keyv/mysql',
        '@keyv/etcd': 'commonjs @keyv/etcd',
        '@keyv/offline': 'commonjs @keyv/offline',
        '@keyv/tiered': 'commonjs @keyv/tiered',
      },
    ];
    
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
