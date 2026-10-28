import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || APP_CONFIG.url || "https://bmyfit.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/goal",
          "/details",
          "/about",
          "/supplements",
          "/supplements/*",
          "/faq",
          "/contact",
          "/shop",
          "/terms",
          "/privacy",
          "/refund-policy",
          "/shipping-policy",
          "/disclaimer",
          "/images/*",
          "/icon",
          "/apple-icon",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout/*",
          "/plan/*",
          "/result/*",
          "/calculating",
          "/_next/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout/*",
          "/plan/*",
          "/result/*",
          "/calculating",
          "/_next/*",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
