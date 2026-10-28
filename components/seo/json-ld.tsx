import React from "react";
import { APP_CONFIG } from "@/lib/config";

interface JsonLdProps {
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Global Site JSON-LD Structured Data
 * Provides Google with:
 * 1. WebSite schema (Sitelinks Searchbox)
 * 2. SiteNavigationElement schema (Google Sitelinks under main link)
 * 3. Organization & LocalBusiness schema (Coach Naveen & Blaze Gym)
 * 4. Product & Offer schema (Personalized ₹99 Indian Transformation Plan)
 * 5. FAQPage schema (Rich FAQ Accordion in search results)
 */
export function SiteStructuredData() {
  const siteUrl = APP_CONFIG.url || "https://bmyfit.in";

  // 1. WebSite with Sitelinks SearchBox
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "BMYFIT",
    alternateName: [
      "BMYFIT India",
      "BMY FIT",
      "BMYFitness",
      "BMYFIT Coaching",
      "Coach Naveen Fitness",
    ],
    description:
      "India's #1 personalized fitness and nutrition platform for Indian bodies. Calibrated workout and diet plans by Coach Naveen for just ₹99.",
    inLanguage: "en-IN",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/supplements?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // 2. SiteNavigationElement (Guides Google to generate primary Sitelinks)
  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Start Transformation",
        description:
          "Select your personal fitness goal: Fat Loss, Muscle Gain, Body Recomp, or Workout Consistency.",
        url: `${siteUrl}/goal`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Calculate BMI & Body Fat",
        description:
          "Clinical BMI and US Navy body fat assessment tailored specifically for Indian body types.",
        url: `${siteUrl}/details`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Meet Coach Naveen",
        description:
          "7+ years experienced certified fitness coach, sports nutritionist, and Blaze Gym owner.",
        url: `${siteUrl}/about`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Authentic Supplements Store",
        description:
          "Curated lab-tested whey protein, multivitamins, and creatine for Indian fitness enthusiasts.",
        url: `${siteUrl}/supplements`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Personalized Transformation Plan (₹99)",
        description:
          "Comprehensive Indian diet plan with exact macros and video workout guidance for ₹99.",
        url: `${siteUrl}/#pricing`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 6,
        name: "Frequently Asked Questions",
        description:
          "Answers on Indian diet compatibility, gym requirements, coaching support, and refund policy.",
        url: `${siteUrl}/faq`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 7,
        name: "Contact & Athlete Support",
        description:
          "Connect directly with Coach Naveen and the BMYFIT athlete support team.",
        url: `${siteUrl}/contact`,
      },
    ],
  };

  // 3. Organization & LocalBusiness Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${siteUrl}/#organization`,
    name: "BMYFIT",
    alternateName: "BMYFIT Personal Fitness Coaching",
    url: siteUrl,
    logo: `${siteUrl}/images/coach-portrait.jpg`,
    image: `${siteUrl}/images/coach-portrait.jpg`,
    description:
      "India's premier personalized fitness and Indian nutrition coaching platform by Coach Naveen. Science-backed, practical, and made for Indian bodies.",
    telephone: "+91-9112345678",
    email: "support@bmyfit.in",
    priceRange: "₹",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Blaze Gym, Koramangala",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560034",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "12.9352",
      longitude: "77.6245",
    },
    founder: {
      "@type": "Person",
      name: "Coach Naveen",
      jobTitle: "Head Coach & Sports Nutritionist",
      image: `${siteUrl}/images/coach-naveen.jpg`,
      description:
        "Certified Fitness Coach & Sports Nutritionist with 7+ years of experience helping 1,000+ Indian adults transform their bodies through evidence-based nutrition.",
      sameAs: [
        "https://instagram.com/bmyfit",
        "https://youtube.com/@bmyfit",
      ],
    },
    sameAs: [
      "https://instagram.com/bmyfit",
      "https://youtube.com/@bmyfit",
    ],
  };

  // 4. Product & Offer Schema (Single ₹99 Indian Transformation Plan)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "BMYFIT Personalized Indian Transformation Plan",
    image: `${siteUrl}/images/plan-triple-screens.jpg`,
    description:
      "Personalized 8 to 24-week Indian meal plan, calibrated daily calorie & protein targets, video workout routines, and direct WhatsApp coach support by Coach Naveen.",
    brand: {
      "@type": "Brand",
      name: "BMYFIT",
    },
    sku: "BMYFIT-TRANSFORM-99",
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/goal`,
      priceCurrency: "INR",
      price: "99",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BMYFIT",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "384",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Rahul K.",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "Lost 12 kg in 4 months with a simple Indian diet plan that was so easy to follow!",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Priya S.",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "Best coach! Diet plan is practical and suits Indian food very effective.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Arpan M.",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "Gained strength and confidence. Training plans are amazing and tailored for home workouts.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Sneha R.",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "Results are real. No crash diets, just proper guidance and support from Coach Naveen.",
      },
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Vikram T.",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody:
          "My energy levels are so much better now. Highly recommended for busy Indian professionals!",
      },
    ],
  };

  // 5. FAQPage Schema (Rich Google SERP FAQ Accordion)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this plan suitable for beginners?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, absolutely! The program is custom-built based on your current fitness level, whether you have never worked out before or are getting back after a break.",
        },
      },
      {
        "@type": "Question",
        name: "Will the diet plan include normal Indian food like roti, rice, and dal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "100% yes! We believe in sustainable fitness. Your plan will include everyday home-cooked Indian meals—roti, rice, dal, sabzi, paneer, eggs, chicken, and curd—calibrated to your target macros.",
        },
      },
      {
        "@type": "Question",
        name: "How long will it take to see results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most clients notice improved energy and reduced bloating within the first 14 days. Visible body composition changes and weight loss typically appear within 4 to 8 weeks with consistency.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a gym to follow the plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not at all! You can choose home workouts (with bodyweight or basic dumbbells) or commercial gym workouts. Your training split is customized for your setup.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get a refund if I'm not satisfied?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we stand behind our coaching with a 7-day money-back guarantee. If you are not satisfied with your personalized roadmap, reach out to support@bmyfit.in.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

/**
 * Custom Page JSON-LD Helper
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
