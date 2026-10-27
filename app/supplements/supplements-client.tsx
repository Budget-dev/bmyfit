"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  Menu,
  CheckCircle2,
  Target,
  Flame,
  Dumbbell,
  ShoppingBag,
  Pill,
  Star,
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  Lightbulb,
  ArrowRight,
  Check,
  Layers,
} from "@/components/ui/supplement-icons";
import {
  getProductsByCategory,
  type SupplementCategory,
  type SupplementProduct,
} from "@/features/supplements/supplements-data";
import { BottomAppNav } from "@/components/layout/bottom-app-nav";

export function SupplementsClient() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<SupplementCategory>("all");
  const [userGoal, setUserGoal] = useState<string>("Fat Loss");

  // Read user's goal from query param or session storage
  useEffect(() => {
    const goalParam = searchParams.get("goal");
    if (goalParam) {
      if (goalParam.toLowerCase().includes("muscle") || goalParam.toLowerCase().includes("strength")) {
        setUserGoal("Muscle Gain");
      } else if (goalParam.toLowerCase().includes("recomp")) {
        setUserGoal("Body Recomposition");
      } else if (goalParam.toLowerCase().includes("fit")) {
        setUserGoal("General Fitness");
      } else {
        setUserGoal("Fat Loss");
      }
    } else if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("bmyfit_local_assessment");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.goal === "muscle-gain" || parsed.goal === "build-strength") {
            setUserGoal("Muscle Gain");
          } else if (parsed.goal === "body-recomp") {
            setUserGoal("Body Recomposition");
          } else if (parsed.goal === "improve-fitness") {
            setUserGoal("General Fitness");
          } else {
            setUserGoal("Fat Loss");
          }
        }
      } catch {}
    }
  }, [searchParams]);

  const filteredProducts = getProductsByCategory(activeCategory);

  const categories: Array<{
    id: SupplementCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "all", label: "All", icon: Layers },
    { id: "protein", label: "Protein", icon: Dumbbell },
    { id: "vitamins", label: "Vitamins", icon: Pill },
    { id: "fat-loss", label: "Fat Loss", icon: Flame },
    { id: "muscle-gain", label: "Muscle Gain", icon: Dumbbell },
    { id: "essentials", label: "Essentials", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-gray-950 flex items-center">
                BMY<span className="text-[#00c853]">FIT</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.18em] text-gray-400 uppercase -mt-0.5">
                Personalized Fitness &amp; Nutrition
              </span>
            </div>
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
        {/* ================= HERO BANNER ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-gray-100/90 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 space-y-3.5 z-10">
              <span className="inline-block text-xs font-black uppercase tracking-[0.16em] text-[#00c853]">
                Supplements &amp; Essentials
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-[1.15]">
                Support Your <br />
                <span className="text-[#00c853]">Fitness Journey</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-md">
                Recommended supplements and essentials based on your goal, body data and plan.
              </p>

              {/* 3 Trust Tick Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#00c853] fill-[#00c853]/20" />
                  <span>Real Products</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#00c853] fill-[#00c853]/20" />
                  <span>Trusted Brands</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#00c853] fill-[#00c853]/20" />
                  <span>Best Prices</span>
                </div>
              </div>
            </div>

            {/* Right Athlete Model Graphic */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-[190px] sm:h-[210px] rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-100/70 via-emerald-50/40 to-white flex items-center justify-center shadow-inner">
                <Image
                  src="/images/products/hero-athlete-shaker.png"
                  alt="Support Your Fitness Journey - Supplements"
                  fill
                  priority
                  className="object-contain object-right-bottom scale-105"
                  sizes="(max-width: 768px) 280px, 320px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATEGORY FILTER TABS ================= */}
        <section className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    isSelected
                      ? "bg-[#eaf8ee] text-[#034e26] border-b-2 border-[#00c853] shadow-xs"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-[#00c853]" : "text-gray-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= PERSONALIZED FOR YOU CALLOUT ================= */}
        <section className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#eef9f2] via-[#f3faf5] to-[#eaf8ee] border border-emerald-100/80 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#00c853]/15 text-[#00c853] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#00c853]">
              Personalized for You
            </span>
            <h2 className="text-sm sm:text-base font-black text-gray-950">
              Based on your goal ({userGoal}) and body data
            </h2>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              These supplements can help you get better results along with your nutrition and workout plan.
            </p>
          </div>
        </section>

        {/* ================= TOP RECOMMENDATIONS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#00c853] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-gray-950">Top Recommendations</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="text-xs font-bold text-[#00c853] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ================= TWO INFORMATIONAL CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Why Supplements Help? */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eaf8ee] text-[#00c853] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-gray-950">Why Supplements Help?</h3>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Better Recovery</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Helps in muscle recovery after workouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Improved Performance</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    More energy and strength during workouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Fill Nutritional Gaps</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Supports overall health and immunity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Faster Results</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Helps you reach your goal effectively.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-gray-950">Important Note</h3>
            </div>

            <ul className="space-y-3 pt-1 text-xs text-gray-700 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00c853] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>Supplements are not mandatory.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00c853] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>Use them along with your meal plan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00c853] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>Choose products based on your goal.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00c853] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>Consult a doctor if you have any medical condition.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00c853] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>Always buy from trusted sellers (Amazon/official store).</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ================= BOTTOM PROMO BANNER ================= */}
        <section className="rounded-3xl bg-[#022115] text-white p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#00e676] flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Get Your Fitness Essentials
              </h3>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                Trusted products. Genuine links. Best prices.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#00e676] text-black font-black text-xs sm:text-sm hover:bg-[#00c853] transition shadow-md flex items-center justify-center gap-2"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Bottom Floating Navigation */}
      <BottomAppNav currentTab="shop" />
    </div>
  );
}

// Sub-Component: Product Card (matching Screenshot 1)
function ProductCard({ product }: { product: SupplementProduct }) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Tag Badge */}
        <div className="flex items-center justify-between mb-3 min-h-[22px]">
          {product.tagBadge ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#eaf8ee] text-[#035b2c]">
              {product.tagBadge}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Product Image Link */}
        <Link
          href={`/supplements/${product.id}`}
          className="block relative w-full aspect-square rounded-2xl bg-[#fafbfa] p-3 mb-3.5 overflow-hidden group-hover:scale-102 transition-transform"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, 220px"
          />
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 mb-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{product.rating}</span>
          <span className="text-gray-400 font-normal">
            ({product.reviewCount.toLocaleString()} reviews)
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/supplements/${product.id}`}>
          <h3 className="font-black text-sm text-gray-900 group-hover:text-[#00c853] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Benefits */}
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2 min-h-[32px]">
          {product.subtitle}
        </p>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-3 pt-2 border-t border-gray-50">
          <span className="text-base sm:text-lg font-black text-gray-950">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 line-through">
            ₹{product.originalPrice.toLocaleString()}
          </span>
          <span className="text-[10px] font-extrabold text-[#00c853] bg-[#eaf8ee] px-1.5 py-0.5 rounded-md">
            {product.discountPercent}% OFF
          </span>
        </div>
      </div>

      {/* Action Button: Buy on Amazon */}
      <div className="mt-3.5 pt-1">
        <a
          href={product.amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3 rounded-2xl bg-[#0e271a] text-white hover:bg-[#02331f] transition font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-[#00c853] group-hover:text-black"
        >
          {/* Amazon 'a' icon placeholder */}
          <span className="font-black tracking-tighter text-sm">a</span>
          <span>Buy on Amazon</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
