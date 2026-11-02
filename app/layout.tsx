import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { SiteStructuredData } from "@/components/seo/json-ld";
import { GlobalCoachChat } from "@/components/chat/global-coach-chat";
import { FootprintTracker } from "@/components/telemetry/footprint-tracker";
import { APP_CONFIG } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_CONFIG.url || "https://bmyfit.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
    template: "%s | BMYFIT",
  },
  description:
    "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
  applicationName: "BMYFIT",
  authors: [{ name: "Coach Naveen", url: `${siteUrl}/about` }],
  generator: "Next.js",
  keywords: [
    "BMYFIT",
    "BMYFIT India",
    "Coach Naveen",
    "Indian fitness plan",
    "Indian diet plan",
    "weight loss Indian food",
    "belly fat loss Indian diet",
    "custom workout plan",
    "BMI calculator India",
    "US Navy body fat calculator",
    "vegetarian muscle building diet",
    "budget fitness coaching",
    "personalized workout split",
    "Blaze Gym Bengaluru",
  ],
  creator: "BMYFIT",
  publisher: "BMYFIT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
    description:
      "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
    url: siteUrl,
    siteName: "BMYFIT",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/plan-triple-screens.jpg",
        width: 1200,
        height: 630,
        alt: "BMYFIT - Train Smart. Get Results. Feel Unstoppable.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BMYFIT — Train Smart. Get Results. Feel Unstoppable.",
    description:
      "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
    images: ["/images/plan-triple-screens.jpg"],
    creator: "@bmyfit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google19ceff572a750277",
  },
  category: "fitness",
};

export const viewport: Viewport = {
  themeColor: "#021b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const gaMeasurementId =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7P72H4FP7D";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <SiteStructuredData />
        <meta name="google-site-verification" content="google19ceff572a750277" />
        <meta name="google-site-verification" content="google19ceff572a750277.html" />
      </head>
      <body className={inter.className}>
        {/* Google Analytics (gtag.js) */}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <FootprintTracker />
        {children}
        <GlobalCoachChat />
      </body>
    </html>
  );
}
