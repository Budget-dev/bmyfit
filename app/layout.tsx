import type { Metadata } from "next";
import { Inter, Oswald, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-oswald",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "BMYFIT · Know your Body | Transform your Body",
  description: "A fast, private fitness assessment and personalized plan.",
  metadataBase: new URL("https://bmyfit.example"),
};

export const viewport = {
  themeColor: "#021b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${caveat.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

