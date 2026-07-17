import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://chatkara.lagardenia.in";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pickup", "/icon.png", "/_next/static/*"],
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
