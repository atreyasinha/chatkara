import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Google Analytics/GTM + inline GA init snippet
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      // Styles: self + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs (QR) + Google Maps tiles
      "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://maps.gstatic.com",
      // Frames: Google Maps embeds only
      "frame-src https://maps.google.com https://www.google.com",
      // API calls: self + Firebase + Telegram + Google Analytics
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://api.telegram.org https://www.google-analytics.com",
      // Object/media: none
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
