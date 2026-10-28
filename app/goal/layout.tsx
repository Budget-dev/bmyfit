import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Your Transformation Goal | BMYFIT",
  description:
    "Choose your primary body transformation focus: Lose Body Fat, Build Muscle & Strength, Improve General Fitness, or Build Workout Consistency.",
  alternates: {
    canonical: "/goal",
  },
  openGraph: {
    title: "Select Your Transformation Goal | BMYFIT",
    description:
      "Choose your primary body transformation focus: Lose Body Fat, Build Muscle & Strength, Improve General Fitness, or Build Workout Consistency.",
    url: "https://bmyfit.in/goal",
    images: [
      {
        url: "/images/goal-card-lose-fat.png",
        width: 1200,
        height: 630,
        alt: "BMYFIT Goal Selection",
      },
    ],
  },
};

export default function GoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

