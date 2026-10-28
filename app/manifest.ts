import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
    short_name: "BMYFIT",
    description:
      "India's #1 personalized fitness and nutrition platform for Indian bodies by Coach Naveen. Calibrated workout & diet plans for ₹99.",
    start_url: "/",
    display: "standalone",
    background_color: "#071811",
    theme_color: "#00e676",
    categories: ["fitness", "health", "lifestyle", "sports"],
    lang: "en-IN",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

