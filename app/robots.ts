import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/result/", "/checkout/", "/plan/", "/api/"] }, sitemap: "https://bmyfit.example/sitemap.xml" }; }
