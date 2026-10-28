import React from "react";
import type { Metadata } from "next";
import { SupplementsClient } from "./supplements-client";

export const metadata: Metadata = {
  title: "Authentic Supplements & Fitness Essentials | BMYFIT Store",
  description:
    "Curated lab-tested whey protein, multivitamins, fish oil, and creatine monohydrate recommended for Indian workout routines and diet plans.",
  alternates: {
    canonical: "/supplements",
  },
  openGraph: {
    title: "Authentic Supplements & Fitness Essentials | BMYFIT Store",
    description:
      "Curated lab-tested whey protein, multivitamins, fish oil, and creatine monohydrate recommended for Indian workout routines and diet plans.",
    url: "https://bmyfit.in/supplements",
  },
};

export default function SupplementsPage() {
  return <SupplementsClient />;
}
