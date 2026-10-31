"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FontAwesomeIcon,
  faCheck,
  faHeartPulse,
  faCalculator,
  faArrowRight,
  faArrowLeft,
  faChevronDown,
  faWhatsapp,
  faInstagram,
  faFacebookF,
  faXTwitter,
} from "@/components/ui/font-awesome-icons";
import { Badge } from "@/components/ui/badge";
import { saveDraftDetails, saveDraftGoal } from "@/features/assessment/session-store";
import type { Gender } from "@/types/fitness";

export function DesktopHomeView() {
  const router = useRouter();

  // Calculator State
  const [age, setAge] = useState<number>(24);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [gender, setGender] = useState<Gender>("male");
  const [calculatedBmi, setCalculatedBmi] = useState<number>(22.9);
  const [bodyFat, setBodyFat] = useState<number>(18.2);
  const [leanMass, setLeanMass] = useState<number>(58.4);
  const [dailyCalories, setDailyCalories] = useState<number>(1900);

  // Solutions carousel active state
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const heightM = height / 100;
    const computedBmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
    setCalculatedBmi(computedBmi);

    // Approximate body fat & calories for Indian baseline
    const approxBodyFat =
      gender === "male"
        ? Math.round((1.2 * computedBmi + 0.23 * age - 16.2) * 10) / 10
        : Math.round((1.2 * computedBmi + 0.23 * age - 5.4) * 10) / 10;

    const clampedFat = Math.max(8, Math.min(48, approxBodyFat));
    setBodyFat(clampedFat);

    const calculatedLean = Math.round(weight * (1 - clampedFat / 100) * 10) / 10;
    setLeanMass(calculatedLean);

    // BMR formula estimation
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    setDailyCalories(Math.round(bmr * 1.35));

    // Save session data so subsequent pages have fresh biometrics
    saveDraftDetails({
      gender,
      age,
      heightCm: height,
      weightKg: weight,
      waistIn: gender === "male" ? 32 : 28,
      neckIn: gender === "male" ? 15 : 13,
      hipIn: gender === "female" ? 38 : undefined,
    });
    saveDraftGoal({ goal: "fat-loss" });
  };

  const handleGoToDetails = () => {
    handleCalculate();
    router.push("/goal");
  };

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactSent(false);
    }, 4000);
  };

  const faqs = [
    {
      q: "Is this plan suitable for beginners?",
      a: "Yes, absolutely! Coach Naveen customizes every routine based on your current fitness level, experience, and joint mobility. Whether you are lifting weights for the first time or getting back into shape after years, your plan starts with foundational movement mechanics and progressive overload.",
    },
    {
      q: "Will the diet plan include Indian food?",
      a: "100% yes! We specialize in practical Indian food items — dal, roti, rice, paneer, eggs, chicken, curd, poha, and idli. No bizarre western meal requirements. Every calorie and protein macro is designed around home-cooked South Asian meals that your family also eats.",
    },
    {
      q: "How long will it take to see results?",
      a: "Most clients see noticeable changes in stamina and water retention within the first 14 days. By weeks 4–6, visible fat loss around the waist and improved muscle definition become obvious when following the calibrated daily calories.",
    },
    {
      q: "Do I need a gym to follow the plan?",
      a: "No! During intake, you can select whether you train at a gym, at home with dumbbells, or with bodyweight only. Coach Naveen customizes your workout split according to your available equipment.",
    },
    {
      q: "Can I get a refund if I'm not satisfied?",
      a: "Yes. BMYFIT offers a 100% money-back guarantee. If you follow the prescribed 8-week routine and don't see results, we refund your ₹99 without questions asked.",
    },
  ];

  return (
    <div className="w-full bg-[#f4f7f5] text-gray-900 selection:bg-[#00e676] selection:text-black font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact Reference Composition: Left Card + Right Content)  */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Hero Card: Big rounded picture card with emerald tint */}
          <div className="lg:col-span-5 relative rounded-[32px] overflow-hidden bg-[#0a2e23] min-h-[480px] lg:min-h-[520px] shadow-md flex items-center justify-center p-6 group">
            {/* Ambient emerald backlight glow inside the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e676]/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Hero Athletic Image */}
            <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden">
              <Image
                src="/images/hero-model.jpg"
                alt="BMYFIT Fitness Trainees"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e23]/80 via-transparent to-transparent" />
            </div>

            {/* Floating Glass Pill Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-gray-950 uppercase tracking-wider">
                  Science-Backed Indian Plans
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">
                  10,000+ Real Transformations across India
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0a2e23] text-[#00e676] flex items-center justify-center font-bold text-xs">
                ★ 4.9
              </div>
            </div>
          </div>

          {/* Right Hero Content Column */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2 pl-0 lg:pl-4">
            {/* Top Row: Heading and "Follow On" Social Pill */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <Badge
                  variant="emerald"
                  className="mb-4 gap-2 px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-[#0a2e23] border-emerald-300"
                >
                  <FontAwesomeIcon icon={faHeartPulse} className="w-3 h-3 text-[#00c853]" />
                  <span>Personalized Indian Fitness &amp; Nutrition</span>
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-gray-950 tracking-tight leading-[1.08]">
                  Unlock Your Personal{" "}
                  <span className="text-[#0a2e23] inline-block relative">
                    Training Potential
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-[#00c853]/60" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* "Follow On" Widget (Exact reference design) */}
              <div className="hidden sm:flex flex-col items-center gap-2 shrink-0 bg-white border border-gray-200/80 rounded-2xl p-2.5 shadow-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Follow On
                </span>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-gray-50 hover:bg-[#0a2e23] hover:text-white text-gray-600 flex items-center justify-center transition-colors text-xs"
                    aria-label="Instagram"
                  >
                    <FontAwesomeIcon icon={faInstagram} className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-gray-50 hover:bg-[#0a2e23] hover:text-white text-gray-600 flex items-center justify-center transition-colors text-xs"
                    aria-label="Twitter"
                  >
                    <FontAwesomeIcon icon={faXTwitter} className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-gray-50 hover:bg-[#0a2e23] hover:text-white text-gray-600 flex items-center justify-center transition-colors text-xs"
                    aria-label="Facebook"
                  >
                    <FontAwesomeIcon icon={faFacebookF} className="w-3 h-3" />
                  </a>
                  <a
                    href="https://wa.me"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-[#25D366] hover:text-white text-[#25D366] flex items-center justify-center transition-colors text-xs"
                    aria-label="WhatsApp"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Paragraph Description */}
            <p className="text-gray-600 text-base lg:text-lg max-w-xl font-normal leading-relaxed mt-4">
              A seamless platform built for Indian fitness enthusiasts to build lean muscle, eliminate stubborn fat, and master ghar-ka-khana nutrition — customized around your exact body data for just ₹99.
            </p>

            {/* CTA Button Row */}
            <div className="flex items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleGoToDetails}
                className="inline-flex items-center gap-3 bg-[#0a2e23] hover:bg-[#00c853] text-white hover:text-gray-950 font-bold text-sm lg:text-base px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 group cursor-pointer"
              >
                <span>Start Now</span>
                <span className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-gray-950 text-white flex items-center justify-center text-xs font-black transition-colors">
                  ↗
                </span>
              </button>

              <button
                type="button"
                onClick={scrollToCalculator}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-950 font-bold text-sm px-4 py-3 rounded-full hover:bg-gray-200/60 transition-colors"
              >
                <FontAwesomeIcon icon={faCalculator} className="w-3.5 h-3.5 text-[#0a2e23]" />
                <span>Calculate Your Biometrics</span>
              </button>
            </div>

            {/* Mini Transformation Avatars Strip (Exact Reference Composition!) */}
            <div className="mt-8 pt-6 border-t border-gray-200/80">
              <div className="flex items-center gap-3">
                {[
                  { name: "Fat Loss", img: "/images/model-lose-fat.jpg", tag: "-8.4 kg" },
                  { name: "Strength", img: "/images/model-build-strength.jpg", tag: "+4 kg Muscle" },
                  { name: "Conditioning", img: "/images/model-improve-fitness.jpg", tag: "Toned" },
                  { name: "Recomposition", img: "/images/workout-day1-upper.jpg", tag: "14% BF" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer group bg-gray-200 shrink-0"
                    onClick={handleGoToDetails}
                  >
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-black text-white leading-tight truncate">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="pl-3">
                  <div className="text-xs font-black text-gray-950">10,000+ Joined</div>
                  <div className="text-[11px] text-gray-500">8-Week Custom Plans</div>
                </div>
              </div>

              {/* 4 dots pagination indicators matching reference */}
              <div className="flex items-center gap-1.5 mt-3">
                <span className="w-2 h-2 rounded-full bg-[#0a2e23]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "OUR VIRTUAL SOLUTIONS" (Exact 2-Card Layout with Slider Navigation)   */}
      {/* ========================================================================= */}
      <section id="solutions-section" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Section Header with Left Title & Right Slider Arrows */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight">
              Our Virtual Solutions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Customized training and nutrition architectures crafted for sustainable results.
            </p>
          </div>

          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSolutionIndex((prev) => (prev === 0 ? 1 : 0))}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-[#0a2e23] hover:text-white text-gray-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              aria-label="Previous solution"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSolutionIndex((prev) => (prev === 1 ? 0 : 1))}
              className="w-10 h-10 rounded-full border border-gray-300 bg-[#0a2e23] text-white hover:bg-[#00c853] hover:text-gray-950 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              aria-label="Next solution"
            >
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2 Large Wide Aspect Feature Cards (Matching Reference Image Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Fitness Training */}
          <div
            className={`relative rounded-[28px] overflow-hidden h-[340px] lg:h-[380px] shadow-sm bg-gray-900 group cursor-pointer transition-all ${
              activeSolutionIndex === 0 ? "ring-2 ring-[#0a2e23]" : "opacity-90 hover:opacity-100"
            }`}
            onClick={handleGoToDetails}
          >
            <Image
              src="/images/workout-day1-upper.jpg"
              alt="Fitness Training"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Top-Left Floating Pill Badge (Exact Reference Styling) */}
            <div className="absolute top-5 left-5">
              <span className="rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-gray-950 shadow-sm inline-block">
                Fitness Training
              </span>
            </div>

            {/* Bottom Content Card */}
            <div className="absolute bottom-6 left-6 right-6 text-white text-left">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight leading-tight">
                8-Week Progressive Workout Splits
              </h3>
              <p className="text-xs lg:text-sm text-gray-200 mt-1 max-w-md leading-relaxed">
                Home dumbbell or commercial gym routines calibrated with progressive overload, exact rep targets, and rest intervals.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#00e676]">
                <span>Explore Routine Structure</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Card 2: Yoga & Indian Nutrition */}
          <div
            className={`relative rounded-[28px] overflow-hidden h-[340px] lg:h-[380px] shadow-sm bg-gray-900 group cursor-pointer transition-all ${
              activeSolutionIndex === 1 ? "ring-2 ring-[#0a2e23]" : "opacity-90 hover:opacity-100"
            }`}
            onClick={handleGoToDetails}
          >
            <Image
              src="/images/meal-paneer-veggies.jpg"
              alt="Indian Diet & Nutrition"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Top-Left Floating Pill Badge (Exact Reference Styling) */}
            <div className="absolute top-5 left-5">
              <span className="rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-gray-950 shadow-sm inline-block">
                Indian Nutrition &amp; Diet
              </span>
            </div>

            {/* Bottom Content Card */}
            <div className="absolute bottom-6 left-6 right-6 text-white text-left">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight leading-tight">
                Ghar Ka Khana Calibrated For Fat Loss
              </h3>
              <p className="text-xs lg:text-sm text-gray-200 mt-1 max-w-md leading-relaxed">
                Paneer, dal, soya, roti, rice, eggs and chicken meal swaps with exact calorie deficits and protein targets. Zero starvation.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#00e676]">
                <span>View Macro Calibration</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. STATS & BENTO EXPERIENCE GRID (Matching Top-Right Reference Panel)     */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Bento Card 1: Image Card "More 600 hr" */}
          <div className="relative rounded-3xl overflow-hidden h-56 bg-gray-900 shadow-xs group">
            <Image
              src="/images/workout-day3-cardio.jpg"
              alt="Yoga & Mobility"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 flex flex-col justify-end text-white text-left">
              <div className="text-xl font-black">More 600 hr</div>
              <div className="text-xs text-gray-300">Mobility &amp; Posture</div>
            </div>
          </div>

          {/* Bento Card 2: Image Card "More 6900 hr" */}
          <div className="relative rounded-3xl overflow-hidden h-56 bg-gray-900 shadow-xs group">
            <Image
              src="/images/model-build-strength.jpg"
              alt="Strength Training"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 flex flex-col justify-end text-white text-left">
              <div className="text-xl font-black">More 6900 hr</div>
              <div className="text-xs text-gray-300">Strength &amp; Hypertrophy</div>
            </div>
          </div>

          {/* Bento Card 3: Clean White Card "Have 200+" (Exact Reference Style) */}
          <div className="rounded-3xl bg-white border border-gray-200/80 p-6 flex flex-col justify-between h-56 text-left shadow-xs">
            <div>
              <div className="text-2xl font-black text-[#0a2e23]">Have 200+</div>
              <div className="text-xs text-gray-500 mt-1 leading-snug">
                Custom Desi Meals, Video Form Guides &amp; Exercise Variations
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleGoToDetails}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-bold text-gray-800 hover:bg-[#0a2e23] hover:text-white transition-colors"
              >
                See More
              </button>
            </div>
          </div>

          {/* Bento Card 4: Image Card "More 7200 hr" */}
          <div className="relative rounded-3xl overflow-hidden h-56 bg-gray-900 shadow-xs group">
            <Image
              src="/images/model-build-consistency.jpg"
              alt="Client Coaching"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 flex flex-col justify-end text-white text-left">
              <div className="text-xl font-black">More 7200 hr</div>
              <div className="text-xs text-gray-300">1-on-1 Guidance</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "WORKOUT COACHES" (Exact Reference Bottom-Left Section)                 */}
      {/* ========================================================================= */}
      <section id="coaches-section" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="text-left mb-8">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight">
            Workout Coaches
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Certified mentors dedicated to calibrating your training and Indian nutrition.
          </p>
        </div>

        {/* 3 Portrait Coach Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coach Naveen */}
          <div className="rounded-[28px] overflow-hidden bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow text-left">
            <div className="relative h-72 w-full bg-gray-100">
              <Image
                src="/images/coach-naveen.jpg"
                alt="Coach Naveen"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-xs font-bold text-gray-900 px-3 py-1 rounded-full shadow-xs">
                Head Coach
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-950">Coach Naveen</h3>
              <p className="text-xs text-[#0a2e23] font-bold mt-0.5">
                Lead Nutritionist &amp; Strength Specialist
              </p>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                10+ years coaching experience with over 10,000 transformations across India. Certified in Clinical &amp; Sports Nutrition.
              </p>
            </div>
          </div>

          {/* Coach Priya */}
          <div className="rounded-[28px] overflow-hidden bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow text-left">
            <div className="relative h-72 w-full bg-gray-100">
              <Image
                src="/images/model-improve-fitness.jpg"
                alt="Coach Priya"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-xs font-bold text-gray-900 px-3 py-1 rounded-full shadow-xs">
                Mobility &amp; Lifestyle
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-950">Coach Priya</h3>
              <p className="text-xs text-[#0a2e23] font-bold mt-0.5">
                Metabolic Conditioning &amp; Habit Coach
              </p>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Specializes in desk-worker posture restoration, daily step targets, and stress-resilient healthy lifestyle routines.
              </p>
            </div>
          </div>

          {/* Coach Vikram */}
          <div className="rounded-[28px] overflow-hidden bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow text-left">
            <div className="relative h-72 w-full bg-gray-100">
              <Image
                src="/images/model-build-strength.jpg"
                alt="Coach Vikram"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-xs font-bold text-gray-900 px-3 py-1 rounded-full shadow-xs">
                Strength &amp; Biomechanics
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-950">Coach Vikram</h3>
              <p className="text-xs text-[#0a2e23] font-bold mt-0.5">
                Hypertrophy &amp; Heavy Compounds
              </p>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Focuses on joint-safe lifting mechanics, progressive overload plate loading, and muscle building with natural food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "FIND THE PERFECT PLAN FOR YOUR JOURNEY" (Exact Reference Pricing)     */}
      {/* ========================================================================= */}
      <section id="pricing-section" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-14 text-center">
        {/* Pill Badge matching reference */}
        <div className="inline-block mb-3">
          <span className="px-3.5 py-1 rounded-full bg-gray-200/80 text-[11px] font-bold text-gray-800 uppercase tracking-wider">
            Pricing
          </span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight max-w-xl mx-auto">
          Find The Perfect Plan For Your BMYFIT Journey
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Honest, transparent pricing. No recurring subscriptions or hidden gym charges.
        </p>

        {/* 2 Side-by-side Pricing Cards (Matching reference exact composition) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10 text-left">
          {/* Featured Diamond Plan (Dark Emerald Green Card #0a2e23) */}
          <div className="rounded-[32px] bg-[#0a2e23] p-8 text-white relative shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#00e676]/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#00e676]">
                  Diamond Plan
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00e676]/20 text-[#00e676] text-[10px] font-bold">
                  Most Popular
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">₹99</span>
                <span className="text-xs text-gray-300">/ one-time payment</span>
              </div>

              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Our signature 8-week personalized fitness and nutrition plan built entirely around your exact body metrics and food preferences.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#00e676]" />
                  <span>Exact daily calorie and macro deficit target</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#00e676]" />
                  <span>Ghar-ka-khana Indian diet plan (Veg / Non-Veg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#00e676]" />
                  <span>8-Week periodized workout split (Gym or Home)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#00e676]" />
                  <span>Weekly progress check-in framework</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoToDetails}
                className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-[#00e676] text-gray-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Get Started — ₹99</span>
                <span>↗</span>
              </button>
            </div>
          </div>

          {/* Gold Plan (Clean White Card matching reference) */}
          <div className="rounded-[32px] bg-white border border-gray-200/80 p-8 text-gray-950 relative shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Gold Plan
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                  1-on-1 Mentorship
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">₹1,499</span>
                <span className="text-xs text-gray-500">/ month</span>
              </div>

              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Direct daily guidance and weekly video check-in calls with Coach Naveen for intensive accountability and form adjustments.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#0a2e23]" />
                  <span>Everything in the Diamond Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#0a2e23]" />
                  <span>Direct daily WhatsApp chat with Coach Naveen</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#0a2e23]" />
                  <span>Weekly progress review &amp; macro recalibration</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#0a2e23]" />
                  <span>Video lifting form checks &amp; correction cues</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("bmyfit_open_chat"));
                  }
                }}
                className="w-full py-3.5 px-6 rounded-full bg-gray-100 hover:bg-[#0a2e23] hover:text-white text-gray-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Chat With Coach</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "WHAT OUR CUSTOMER SAY" (Exact Reference Testimonials Layout)           */}
      {/* ========================================================================= */}
      <section id="testimonials-section" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-14 text-center">
        {/* Pill Badge matching reference */}
        <div className="inline-block mb-3">
          <span className="px-3.5 py-1 rounded-full bg-gray-200/80 text-[11px] font-bold text-gray-800 uppercase tracking-wider">
            Testimonials
          </span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight mb-10">
          What Our Customer Say
        </h2>

        {/* 3 Asymmetric Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left items-stretch">
          {/* Card 1: Featured Dark Emerald Green Card with Avatar (Exact Reference Style) */}
          <div className="rounded-[28px] bg-[#0a2e23] text-white p-7 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00e676]">
                  <Image
                    src="/images/coach-naveen-avatar.jpg"
                    alt="Sarah Miller"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-black text-white">Sarah Miller</div>
                  <div className="text-[11px] text-emerald-300">UI/UX Designer, Bengaluru</div>
                </div>
              </div>

              <div className="text-2xl text-[#00e676] font-serif leading-none">“</div>
              <p className="text-xs text-gray-200 leading-relaxed mt-1">
                The platform is seamless, user-friendly, and has every feature I need to run my online sessions effectively. My coach gave me incredible feedback about how engaging and practical the Indian diet plan is.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1 text-[#00e676] text-xs">
              ★ ★ ★ ★ ★
            </div>
          </div>

          {/* Card 2: Clean White Card (Matching reference "Anna Bennett") */}
          <div className="rounded-[28px] bg-white border border-gray-200/80 p-7 shadow-xs flex flex-col justify-between text-left">
            <div>
              <div className="text-2xl text-gray-400 font-serif leading-none">“</div>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">
                The workout form guides and exact macro breakdown took all the guesswork out of my days. Lost 6 kg in 8 weeks while working 10-hour desk days. Best ₹99 spent on my fitness!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-gray-950">Anna Bennett</div>
                <div className="text-[10px] text-gray-500">Web Developer</div>
              </div>
              <div className="text-amber-500 text-xs">★ ★ ★ ★ ★</div>
            </div>
          </div>

          {/* Card 3: Clean White Card */}
          <div className="rounded-[28px] bg-white border border-gray-200/80 p-7 shadow-xs flex flex-col justify-between text-left">
            <div>
              <div className="text-2xl text-gray-400 font-serif leading-none">“</div>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">
                Down 7.5 kg without giving up roti or dal. The US Navy body fat analysis was pinpoint accurate and matched my clinic DEXA scan. Truly science-backed.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-gray-950">Rahul Verma</div>
                <div className="text-[10px] text-gray-500">Corporate Lawyer, Delhi</div>
              </div>
              <div className="text-amber-500 text-xs">★ ★ ★ ★ ★</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INTERACTIVE INSTANT BODY CALCULATOR (Core BMYFIT Functional Feature)   */}
      {/* ========================================================================= */}
      <section id="calculator-section" className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="bg-white rounded-[32px] border border-gray-200 p-8 lg:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-[#0a2e23] text-[11px] font-bold uppercase tracking-wider">
              Instant Biometric Engine
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight mt-2">
              Calculate Your Body Metrics In 10 Seconds
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Based on the US Navy Body Fat equation and Mifflin-St Jeor formula for South Asian physiology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Form Inputs (Left) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Biological Sex Toggle */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Biological Sex</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGender("male");
                      handleCalculate();
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      gender === "male"
                        ? "bg-[#0a2e23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGender("female");
                      handleCalculate();
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      gender === "female"
                        ? "bg-[#0a2e23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Age</span>
                  <span className="text-[#0a2e23]">{age} years</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="70"
                  value={age}
                  onChange={(e) => {
                    setAge(Number(e.target.value));
                    handleCalculate();
                  }}
                  className="w-full accent-[#0a2e23] cursor-pointer"
                />
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Height</span>
                  <span className="text-[#0a2e23]">{height} cm ({Math.round(height / 2.54)} in)</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => {
                    setHeight(Number(e.target.value));
                    handleCalculate();
                  }}
                  className="w-full accent-[#0a2e23] cursor-pointer"
                />
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Weight</span>
                  <span className="text-[#0a2e23]">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={weight}
                  onChange={(e) => {
                    setWeight(Number(e.target.value));
                    handleCalculate();
                  }}
                  className="w-full accent-[#0a2e23] cursor-pointer"
                />
              </div>
            </div>

            {/* Results Card (Right) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#0a2e23] text-white p-6 shadow-md text-left flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00e676]">
                  Computed Baseline
                </span>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-gray-300">BMI Score</div>
                    <div className="text-xl font-black text-white mt-0.5">{calculatedBmi}</div>
                    <div className="text-[9px] text-[#00e676] font-semibold mt-0.5">
                      {calculatedBmi < 18.5 ? "Underweight" : calculatedBmi < 24.9 ? "Normal Range" : "Overweight"}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-gray-300">Body Fat %</div>
                    <div className="text-xl font-black text-white mt-0.5">{bodyFat}%</div>
                    <div className="text-[9px] text-gray-300 mt-0.5">Estimated Fat</div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-gray-300">Daily Calories</div>
                    <div className="text-xl font-black text-white mt-0.5">{dailyCalories}</div>
                    <div className="text-[9px] text-gray-300 mt-0.5">kcal / day</div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-gray-300">Lean Mass</div>
                    <div className="text-xl font-black text-white mt-0.5">{leanMass} kg</div>
                    <div className="text-[9px] text-gray-300 mt-0.5">Active Tissue</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoToDetails}
                  className="w-full py-3 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Build Full 8-Week Plan — ₹99</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FAQ ACCORDION SECTION                                                  */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-6 lg:px-8 py-12 text-left">
        <h2 className="text-2xl lg:text-3xl font-black text-gray-950 tracking-tight text-center mb-6">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-gray-950 cursor-pointer"
              >
                <span>{faq.q}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openFaqIndex === index && (
                <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CONTACT FORM SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="contact-section" className="w-full max-w-4xl mx-auto px-6 lg:px-8 py-10">
        <div className="rounded-[32px] bg-white border border-gray-200/80 p-8 shadow-xs text-left">
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-gray-950">Have Questions?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Send Coach Naveen and our nutrition specialists a direct message.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Naveen Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-hidden focus:border-[#0a2e23]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-hidden focus:border-[#0a2e23]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Message / Fitness Goal</label>
              <textarea
                rows={3}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Tell us about your current weight, routine, or health questions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-hidden focus:border-[#0a2e23]"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-full bg-[#0a2e23] hover:bg-[#00c853] text-white hover:text-gray-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {contactSent ? "Message Sent!" : "Send Message"}
              </button>

              {contactSent && (
                <span className="text-xs text-emerald-600 font-bold">
                  ✓ Thank you! We will get back to you shortly.
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. "OUR COMMUNITY" (Giant Typography + Giant Arrow Button)              */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-16 text-left border-t border-gray-200/80">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-12 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
              BMYFIT Transformation Network
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-950 tracking-tighter leading-none">
              Our Community
            </h2>
          </div>

          {/* Giant Dark Green Arrow Square/Pill Button matching reference */}
          <button
            type="button"
            onClick={handleGoToDetails}
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#0a2e23] hover:bg-[#00c853] text-white hover:text-gray-950 flex items-center justify-center transition-all cursor-pointer shadow-lg text-2xl md:text-3xl font-black shrink-0 active:scale-95 group"
            aria-label="Join our community"
          >
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </button>
        </div>

        {/* Links and Social Pills Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/" className="hover:text-gray-950">Company</Link>
            <a href="#solutions-section" className="hover:text-gray-950">Solutions</a>
            <a href="#pricing-section" className="hover:text-gray-950">Pricing</a>
            <Link href="/about" className="hover:text-gray-950">About Coach</Link>
            <a href="#contact-section" className="hover:text-gray-950">Contact</a>
          </div>

          {/* Social Pill Links matching reference */}
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 text-gray-700 text-[11px] font-semibold cursor-pointer"
            >
              Instagram
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 text-gray-700 text-[11px] font-semibold cursor-pointer"
            >
              Twitter
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 text-gray-700 text-[11px] font-semibold cursor-pointer"
            >
              Facebook
            </a>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 text-gray-700 text-[11px] font-semibold cursor-pointer"
            >
              Telegram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
