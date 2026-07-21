import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://chatkara.lagardenia.in";
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/pickup",
        "/favicon.ico",
        "/icon.png",
        "/icon-48.png",
        "/icon-192.png",
        "/icon-512.png",
        "/apple-icon.png",
        "/manifest.webmanifest",
        "/_next/static/*",
      ],
      disallow: [
        "/kitchen",
        "/admin/analytics",
        "/admin/qr",
        "/order/",
        "/table/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
