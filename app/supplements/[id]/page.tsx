import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, SUPPLEMENT_PRODUCTS } from "@/features/supplements/supplements-data";
import { ProductDetailClient } from "./product-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Product Not Found · BMYFIT" };
  }
  const title = `${product.fullTitle || product.name} | BMYFIT Supplements`;
  const description = `${product.subtitle}. Price: ₹${product.price} (MRP: ₹${product.originalPrice}). Verified & recommended by Coach Naveen.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/supplements/${product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bmyfit.in/supplements/${product.id}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export function generateStaticParams() {
  return SUPPLEMENT_PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
