import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "BMYFIT · Know your Body | Transform your Body", description: "A fast, private fitness assessment and personalized plan.", metadataBase: new URL("https://bmyfit.example") };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
