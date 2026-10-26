"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Menu,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Target,
  Leaf,
  Dumbbell,
  TrendingUp,
  Heart,
  Utensils,
  Lightbulb,
  FileText,
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "@/components/ui/supplement-icons";
import type { SupplementProduct } from "@/features/supplements/supplements-data";
import { getProductById, SUPPLEMENT_PRODUCTS } from "@/features/supplements/supplements-data";
import { BottomAppNav } from "@/components/layout/bottom-app-nav";

interface ProductDetailClientProps {
  product: SupplementProduct;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Gallery images list: product large image, thumbnails, etc.
  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.largeImage || product.image];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Variant selector
  const variants = product.variants || [
    { label: "Standard Pack", price: product.price, originalPrice: product.originalPrice },
  ];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const currentVariant = variants[selectedVariantIndex] || variants[0];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Similar products
  const similarProducts: SupplementProduct[] = product.similarProductIds
    .map((id) => getProductById(id))
    .filter((p): p is SupplementProduct => Boolean(p));

  const fallbackSimilar =
    similarProducts.length > 0
      ? similarProducts
      : SUPPLEMENT_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/supplements"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00c853] hover:text-[#00b048] transition group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Supplements</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00c853] ring-2 ring-white" />
            </button>
            <Link
              href="/plan/demo"
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* ================= PRODUCT HERO & DETAILS GRID ================= */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Gallery Card (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3">
            {/* Big Main Image Container */}
            <div className="relative w-full aspect-square rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden p-6 flex items-center justify-center group">
              <div className="relative w-full h-full">
                <Image
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              </div>

              {/* Prev / Next Chevrons (if multiple gallery images) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md text-gray-700 hover:text-gray-950 flex items-center justify-center transition hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md text-gray-700 hover:text-gray-950 flex items-center justify-center transition hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[5/4] rounded-xl overflow-hidden bg-white border-2 transition-all p-1 ${
                      activeImageIndex === idx
                        ? "border-[#00c853] ring-2 ring-[#00c853]/20 shadow-sm"
                        : "border-gray-200/80 hover:border-gray-300 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="70px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information, Pricing & CTA (md:col-span-7) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4">
            {/* Tag Badge */}
            {product.tagBadge && (
              <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-[#eaf8ee] text-[#035b2c]">
                {product.tagBadge}
              </span>
            )}

            {/* Product Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                {product.fullTitle || product.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            {/* Rating Row & Trusted Brand Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              {product.isTrustedBrand && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00c853]" />
                  <span>Trusted Brand</span>
                </div>
              )}
            </div>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-950">
                ₹{currentVariant.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{currentVariant.originalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-extrabold text-[#00c853] bg-[#eaf8ee] px-2 py-0.5 rounded-md">
                {Math.round(
                  ((currentVariant.originalPrice - currentVariant.price) /
                    currentVariant.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </div>

            {/* Variant Dropdown */}
            {variants.length > 1 && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Size &amp; Flavor
                </label>
                <div className="relative">
                  <select
                    value={selectedVariantIndex}
                    onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl py-2.5 pl-3.5 pr-10 font-bold focus:outline-none focus:border-[#00c853] focus:ring-2 focus:ring-[#00c853]/20"
                  >
                    {variants.map((v, i) => (
                      <option key={i} value={i}>
                        {v.label} — ₹{v.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Big Action Button: Buy on Amazon */}
            <div className="pt-2">
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0b2317] hover:bg-[#00c853] text-white hover:text-black transition-all font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md group"
              >
                <span className="font-black text-lg tracking-tighter">a</span>
                <span>Buy on Amazon</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* 3 Trust Badges Container */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
              <div className="p-2.5 rounded-xl bg-gray-50/70 space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#00c853] mx-auto" />
                <span className="block text-[11px] font-bold text-gray-900 leading-tight">
                  Original Product
                </span>
                <span className="block text-[10px] text-gray-400">Verified seller</span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50/70 space-y-1">
                <Truck className="w-4 h-4 text-[#00c853] mx-auto" />
                <span className="block text-[11px] font-bold text-gray-900 leading-tight">
                  Fast Delivery
                </span>
                <span className="block text-[10px] text-gray-400">2–5 days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50/70 space-y-1">
                <RotateCcw className="w-4 h-4 text-[#00c853] mx-auto" />
                <span className="block text-[11px] font-bold text-gray-900 leading-tight">
                  Easy Returns
                </span>
                <span className="block text-[10px] text-gray-400">7 days return</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PERSONALIZED CALLOUT ================= */}
        {product.whyRecommended && (
          <section className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#eef9f2] via-[#f3faf5] to-[#eaf8ee] border border-emerald-100/80 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00c853]/15 text-[#00c853] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-gray-950">
                Why This is Recommended for You
              </h2>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {product.whyRecommended.text}
              </p>
            </div>
          </section>
        )}

        {/* ================= KEY BENEFITS & HOW TO USE ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Benefits */}
          {product.keyBenefits && (
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#00c853] flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-gray-950">Key Benefits</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {product.keyBenefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col items-center text-center justify-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-[#00c853] flex items-center justify-center">
                      {b.icon === "muscle" && <Dumbbell className="w-4 h-4" />}
                      {b.icon === "absorption" && <TrendingUp className="w-4 h-4" />}
                      {b.icon === "lean" && <Star className="w-4 h-4" />}
                      {b.icon === "fullness" && <Utensils className="w-4 h-4" />}
                      {b.icon === "heart" && <Heart className="w-4 h-4" />}
                      {b.icon === "energy" && <Sparkles className="w-4 h-4" />}
                      {b.icon === "strength" && <Dumbbell className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-gray-800 leading-snug">
                      {b.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Use */}
          {product.howToUse && (
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#00c853] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-gray-950">How to Use</h3>
              </div>

              <div className="space-y-3 pt-1">
                {product.howToUse.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#00c853] text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================= IMPORTANT NOTE & NUTRITION FACTS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Important Note */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-gray-950">Important Note</h4>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {product.importantNote ||
                  "Supplements are not mandatory. Use them along with your meal plan and consult a healthcare professional if you have any medical condition."}
              </p>
            </div>
          </div>

          {/* Nutrition Facts */}
          {product.nutritionFacts && (
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#00c853] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-950">
                    Nutrition Facts ({product.nutritionFacts.servingSize})
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="block text-[10px] text-gray-400 font-semibold">Calories</span>
                  <span className="block text-xs sm:text-sm font-black text-gray-900 mt-0.5">
                    {product.nutritionFacts.calories}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50">
                  <span className="block text-[10px] text-emerald-700 font-semibold">Protein</span>
                  <span className="block text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                    {product.nutritionFacts.protein}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="block text-[10px] text-gray-400 font-semibold">Carbs</span>
                  <span className="block text-xs sm:text-sm font-black text-gray-900 mt-0.5">
                    {product.nutritionFacts.carbs}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="block text-[10px] text-gray-400 font-semibold">Fats</span>
                  <span className="block text-xs sm:text-sm font-black text-gray-900 mt-0.5">
                    {product.nutritionFacts.fats}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= SIMILAR PRODUCTS FOR YOU ================= */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#00c853] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-950">
                Similar Products for You
              </h3>
            </div>
            <Link
              href="/supplements"
              className="text-xs font-bold text-[#00c853] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fallbackSimilar.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <Link
                    href={`/supplements/${item.id}`}
                    className="block relative w-full aspect-square rounded-2xl bg-[#fafbfa] p-2 mb-3 overflow-hidden group-hover:scale-102 transition-transform"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="180px"
                    />
                  </Link>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 mb-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-gray-400 font-normal">
                      ({item.reviewCount.toLocaleString()})
                    </span>
                  </div>

                  <Link href={`/supplements/${item.id}`}>
                    <h4 className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-[#00c853] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                  </Link>

                  <div className="flex items-baseline gap-2 mt-2 pt-1 border-t border-gray-50">
                    <span className="text-sm font-black text-gray-950">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#00c853] bg-[#eaf8ee] px-1 py-0.2 rounded">
                      {item.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <a
                    href={item.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#0b2317] hover:bg-[#00c853] text-white hover:text-black transition font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="font-black text-xs">a</span>
                    <span>Buy on Amazon</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Floating Navigation */}
      <BottomAppNav currentTab="shop" />
    </div>
  );
}
