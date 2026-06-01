/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }

    return config;
  },
  images: {
    domains: (() => {
      const value = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

      if (!value) {
        return [];
      }

      try {
        return [new URL(value).hostname];
      } catch {
        return [];
      }
    })(),
  },
};

module.exports = nextConfig;
