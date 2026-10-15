import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://bmyfit.example"; return ["", "/details", "/goal", "/privacy", "/terms", "/refund-policy", "/contact"].map((path) => ({ url: `${base}${path}`, lastModified: new Date() })); }
