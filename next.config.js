/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    webpackBuildWorker: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
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
