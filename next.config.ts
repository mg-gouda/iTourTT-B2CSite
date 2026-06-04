import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Canonical host: redirect www → non-www.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.transfera.ae" }],
        destination: "https://transfera.ae/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
