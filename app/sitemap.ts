import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bmyfit.in";
  const routes = [
    "",
    "/details",
    "/goal",
    "/about",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/shipping-policy",
    "/disclaimer",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
