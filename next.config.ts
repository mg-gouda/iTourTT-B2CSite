import type { NextConfig } from "next";

// Backend API host used for CSP (images, fonts, API calls).
const API_HOST = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).host
  : "fulvago.itourtt.cloud";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Enforce HTTPS for 1 year; include sub-domains.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prefer frame-ancestors CSP directive over X-Frame-Options, but
          // keep the legacy header for older browsers.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: https://${API_HOST} https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com`,
              `connect-src 'self' https://${API_HOST} https://maps.googleapis.com https://places.googleapis.com`,
              "frame-src 'self'",
              "media-src 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
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
