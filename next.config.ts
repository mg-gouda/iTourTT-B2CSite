import type { NextConfig } from "next";

// Backend API origins used for CSP (images, fonts, API calls). Includes the
// admin API (B2C backend) and the public API. Full origins so scheme (http in
// local dev, https in prod) matches the actual fetch.
const API_ORIGINS = (() => {
  const urls = [
    process.env.NEXT_PUBLIC_ADMIN_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[];
  const origins = urls.map((u) => new URL(u).origin);
  if (origins.length === 0) origins.push("https://fulvago.itourtt.cloud");
  return Array.from(new Set(origins));
})();
const API_CONNECT = API_ORIGINS.join(" ");

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
            // microphone=(self) enables voice input for the AI booking assistant
            // (Web Speech API); still blocked for cross-origin iframes.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: ${API_CONNECT} https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com`,
              `connect-src 'self' ${API_CONNECT} https://maps.googleapis.com https://places.googleapis.com`,
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
