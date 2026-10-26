import React from "react";
import type { Metadata } from "next";
import { SupplementsClient } from "./supplements-client";

export const metadata: Metadata = {
  title: "Supplements & Essentials · BMYFIT",
  description:
    "Scientifically recommended supplements and fitness essentials based on your personalized body data, goal, and meal plan.",
};

export default function SupplementsPage() {
  return <SupplementsClient />;
}
