"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Utensils,
  Target,
  Video,
  Send,
} from "@/components/ui/icons";
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
    const approxBodyFat = gender === "male"
      ? Math.round((1.2 * computedBmi + 0.23 * age - 16.2) * 10) / 10
      : Math.round((1.2 * computedBmi + 0.23 * age - 5.4) * 10) / 10;
    setBodyFat(Math.max(10, Math.min(45, approxBodyFat)));

    const approxLean = Math.round((weight * (1 - approxBodyFat / 100)) * 10) / 10;
    setLeanMass(approxLean);

    const bmr = gender === "male"
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    setDailyCalories(Math.round(bmr * 1.35));

    saveDraftDetails({
      age,
      gender,
      heightCm: height,
      weightKg: weight,
      waistIn: gender === "male" ? 33 : 29,
      neckIn: gender === "male" ? 15 : 13,
      hipIn: gender === "male" ? 38 : 37,
    });

    saveDraftGoal({
      goal: "fat-loss",
      activityLevel: "sedentary",
      dietPreference: "vegetarian",
    });

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
    <div className="w-full bg-[#ffffff] text-gray-900 selection:bg-[#00e676] selection:text-black">
      {/* ================= 1. DESKTOP HERO SECTION (Dark Athletic Gym Background) ================= */}
      <section className="relative w-full bg-[#080e0b] text-white pt-10 sm:pt-14 pb-16 sm:pb-20 overflow-hidden border-b border-emerald-950/40">
        {/* Radial Ambient Glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#00e676]/15 via-emerald-700/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-[#00c853]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left z-10">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1 text-xs font-black tracking-wider text-[#00e676] uppercase shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
                <span>PERSONALIZED FOR INDIAN BODIES</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black uppercase text-white leading-[1.04] tracking-tight">
                TRAIN SMART.
                <br />
                GET RESULTS.
                <br />
                <span className="text-[#00e676] drop-shadow-[0_2px_20px_rgba(0,230,118,0.4)]">
                  FEEL UNSTOPPABLE.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Your fitness journey should be simple, scientific and sustainable. Get a personalized Indian fitness plan based on your body, goal and lifestyle.
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="inline-flex items-center gap-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-base px-8 py-4 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all duration-300 active:scale-95 group"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust Features Row */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00e676] flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>Science Backed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00e676] flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>Made for Indian Bodies</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00e676] flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>Simple &amp; Practical</span>
                </div>
              </div>
            </div>

            {/* Right Photography Column (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] aspect-[4/4.8] rounded-3xl overflow-hidden shadow-2xl border border-emerald-950/60 bg-gradient-to-tr from-black via-gray-950 to-emerald-950/30 group">
                <Image
                  src="/images/hero-model.jpg"
                  alt="Athletic Indian bodybuilder curling dumbbell"
                  fill
                  priority
                  className="object-cover object-[center_12%] group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080e0b] via-transparent to-transparent pointer-events-none" />

                {/* Better Stronger Healthier You script overlay */}
                <div className="absolute top-6 right-6 text-right select-none pointer-events-none z-20">
                  <div className="font-serif italic text-2xl lg:text-3xl text-white font-bold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    <div>Better</div>
                    <div>Stronger</div>
                    <div>Healthier</div>
                    <div>You</div>
                  </div>
                  <div className="w-20 h-1 bg-[#00e676] rounded-full ml-auto mt-1 -rotate-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. FOUR STATS BANNER ================= */}
      <section className="bg-[#04120a] border-b border-emerald-950/60 py-6 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x-0 lg:divide-x divide-white/10">
            {/* Stat 1 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">3+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">CERTIFIED TRAINER</div>
              <p className="text-[11px] text-gray-400">Expert fitness &amp; nutrition coaching</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">7+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">YEARS OF EXPERIENCE</div>
              <p className="text-[11px] text-gray-400">Helping 1000+ people transform</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">384+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">CLIENTS TRAINED</div>
              <p className="text-[11px] text-gray-400">Real people. Real results.</p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">95%</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">GOAL SUCCESS</div>
              <p className="text-[11px] text-gray-400">Clients achieve their goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. CALCULATOR & MEET COACH SIDE-BY-SIDE ================= */}
      <section id="calculator-section" className="py-12 sm:py-16 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Know Your Body & Calculator (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    CALCULATE YOUR BMI
                  </span>
                  <span className="text-xs font-bold text-gray-400">Clinical Formula</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  Know Your Body.
                  <br />
                  Start Your Transformation.
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Get your clinical BMI, estimated body fat and a personalized Indian fitness plan in just a few seconds.
                </p>
              </div>

              {/* Form & Gauge Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-6">
                {/* Inputs (7 cols) */}
                <form onSubmit={handleCalculate} className="sm:col-span-7 space-y-3">
                  {/* Age */}
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-700">Age</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-bold text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-400 font-semibold">years</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-700">Height</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-bold text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-400 font-semibold">cm</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-700">Weight</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-bold text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-400 font-semibold">kg</span>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${gender === "male"
                          ? "bg-gray-950 text-white shadow-xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <span>👨 Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${gender === "female"
                          ? "bg-gray-950 text-white shadow-xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <span>👩 Female</span>
                    </button>
                  </div>

                  {/* Calculate CTA */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Calculate My Body</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Circular Gauge Display (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center text-center p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/80">
                  {/* SVG Circular Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#00c853"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * Math.min(100, (calculatedBmi / 35) * 100)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-950 leading-none">{calculatedBmi}</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700 mt-1">BMI</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-800 mt-2">Normal Weight 18.5 – 24.9</span>

                  {/* 3 Pill Stats */}
                  <div className="grid grid-cols-3 gap-1.5 w-full mt-3 pt-3 border-t border-emerald-100 text-center">
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-2xs">
                      <div className="text-xs font-black text-emerald-700">{bodyFat}%</div>
                      <div className="text-[9px] text-gray-400 font-semibold">Body Fat</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-2xs">
                      <div className="text-xs font-black text-teal-700">{leanMass} kg</div>
                      <div className="text-[9px] text-gray-400 font-semibold">Lean Mass</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-2xs">
                      <div className="text-xs font-black text-orange-600">{dailyCalories}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">Calories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Meet Coach Naveen (5 cols) */}
            <div className="lg:col-span-5 bg-[#032e1c] text-white rounded-3xl p-6 sm:p-8 border border-emerald-900/60 shadow-sm flex flex-col justify-between relative overflow-hidden text-left">
              <div className="space-y-3 z-10">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-[#00e676] px-2.5 py-0.5 rounded-full inline-block">
                  MEET YOUR COACH
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hi, I&apos;m Coach Naveen
                </h2>

                <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed">
                  Owner of Blaze Gym &amp; several fitness centers. As a Certified Fitness Coach &amp; Sports Nutritionist, I help Indian adults achieve sustainable body transformation through tailored nutrition and evidence-based training.
                </p>

                {/* Bullets */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🏋️
                    </div>
                    <span>Blaze Gym Owner</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🎓
                    </div>
                    <span>Certified Nutritionist</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      ⏳
                    </div>
                    <span>7+ Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🎯
                    </div>
                    <span>Body Recomposition Expert</span>
                  </div>
                </div>
              </div>

              {/* Cutout Photo of Coach Naveen in Green T-Shirt */}
              <div className="relative w-full h-44 sm:h-52 mt-4 flex justify-end items-end z-0">
                <div className="relative w-44 sm:w-52 h-full">
                  <Image
                    src="/images/coach-naveen-original.png"
                    alt="Coach Naveen in gym t-shirt"
                    fill
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. TAILORED TRAINING EXPERIENCE (4 Horizontal Cards) ================= */}
      <section className="py-14 sm:py-20 bg-[#04120a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e676] bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
              WHAT YOU GET
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-2">
              <span className="text-[#00e676]">TAILORED</span> TRAINING EXPERIENCE
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">
              Whether your goal is to build strength, lose fat or level up your performance, our programs are built around your body, lifestyle and Indian food habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Card 1 */}
            <div className="bg-[#081f14] p-6 rounded-3xl border border-emerald-900/60 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                PERSONAL TRAINING PLAN
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Customized workouts based on your goal, body and available time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#081f14] p-6 rounded-3xl border border-emerald-900/60 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                ONLINE COACHING
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Get expert guidance, progress tracking and continuous support.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#081f14] p-6 rounded-3xl border border-emerald-900/60 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                NUTRITION &amp; MEAL GUIDANCE
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Indian food based diet plans that fit your lifestyle and taste.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#081f14] p-6 rounded-3xl border border-emerald-900/60 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                SPECIALIZED PROGRAMS
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Fat loss, muscle gain, body recomposition and general fitness programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. ABOUT YOUR COACH FEATURE ================= */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Big Photo (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <Image
                  src="/images/coach-portrait.jpg"
                  alt="Coach Naveen in the gym"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white text-left">
                  <div className="text-2xl font-black text-[#00e676]">7+ YEARS</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    OF EXPERIENCE
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bio & Credentials (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full inline-block">
                  ABOUT YOUR COACH
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 uppercase tracking-tight">
                  COACH <span className="text-[#00c853]">NAVEEN</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed pt-1">
                  I&apos;m Naveen, a Certified Fitness Coach &amp; Sports Nutritionist with 7+ years of experience in helping Indian adults transform their bodies. My approach is simple — science, consistency and habits that actually fit real life.
                </p>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
                    🛡️
                  </div>
                  <span className="text-xs font-bold text-gray-900">Certified Fitness Coach</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
                    🥗
                  </div>
                  <span className="text-xs font-bold text-gray-900">Sports Nutritionist</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
                    👥
                  </div>
                  <span className="text-xs font-bold text-gray-900">1000+ Clients Guided</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
                    🍛
                  </div>
                  <span className="text-xs font-bold text-gray-900">Specialist in Indian Diet Plans</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
                >
                  <span>Know More About Me</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. WHAT OUR CLIENTS SAY (5 Horizontal Cards) ================= */}
      <section className="py-14 sm:py-20 bg-[#fafafa] border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                REAL PEOPLE. REAL RESULTS.
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight mt-2">
                What Our Clients Say
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Thousands of people have already started their transformation with BMYFIT.
              </p>
            </div>

            <Link
              href="/details"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group shrink-0"
            >
              <span>View All Reviews</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 5 Horizontal Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            {/* Review 1 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-emerald-500 text-xs">★★★★★</div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed italic">
                  &ldquo;Lost 12 kg in 4 months with a simple plan. So easy to follow!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  RK
                </div>
                <div>
                  <div className="text-xs font-black text-gray-950">Rahul K.</div>
                  <div className="text-[10px] text-gray-400">Software Engineer</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-emerald-500 text-xs">★★★★★</div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed italic">
                  &ldquo;Best coach! Diet plan is practical and suits Indian food. Very effective.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  PS
                </div>
                <div>
                  <div className="text-xs font-black text-gray-950">Priya S.</div>
                  <div className="text-[10px] text-gray-400">Working Professional</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-emerald-500 text-xs">★★★★★</div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed italic">
                  &ldquo;Gained strength and confidence. Training plans are amazing.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  AM
                </div>
                <div>
                  <div className="text-xs font-black text-gray-950">Arjun M.</div>
                  <div className="text-[10px] text-gray-400">College Student</div>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-emerald-500 text-xs">★★★★★</div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed italic">
                  &ldquo;Results are real. No crash diets, just proper guidance and support.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  SR
                </div>
                <div>
                  <div className="text-xs font-black text-gray-950">Sneha R.</div>
                  <div className="text-[10px] text-gray-400">Homemaker</div>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-emerald-500 text-xs">★★★★★</div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed italic">
                  &ldquo;My energy levels are so much better now. Highly recommended!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  VT
                </div>
                <div>
                  <div className="text-xs font-black text-gray-950">Vikram T.</div>
                  <div className="text-[10px] text-gray-400">Business Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. BUILT FOR INDIAN BODIES BANNER ================= */}
      <section className="py-14 sm:py-16 bg-[#04120a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            {/* Left Col (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-[#00e676] px-3 py-1 rounded-full border border-emerald-500/30">
                WHY BMYFIT?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Built for Indian Bodies
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                We combine global fitness science with Indian food habits, lifestyle and real-world practicality to give you a plan that actually works.
              </p>
              <button
                type="button"
                onClick={scrollToCalculator}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
              >
                <span>Start Your Transformation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Col: 3 Pillars (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#081f14] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <div className="text-2xl">📄</div>
                <h3 className="text-sm font-black text-white">Scientifically Backed</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Based on WHO &amp; ICMR research tailored for South Asian body compositions.
                </p>
              </div>

              <div className="bg-[#081f14] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <div className="text-2xl">👤</div>
                <h3 className="text-sm font-black text-white">Personalized Plans</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  No generic templates. 100% tailored to your biometrics and daily routine.
                </p>
              </div>

              <div className="bg-[#081f14] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <div className="text-2xl">📈</div>
                <h3 className="text-sm font-black text-white">Long-Term Results</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Build healthy, sustainable habits for a stronger, leaner, better you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. SIMPLE PRICING (Centered on ₹99 Subscription) ================= */}
      <section className="py-16 sm:py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              CHOOSE YOUR PLAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-2">
              Simple Pricing. Real Results.
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Choose the plan that fits your goal and get full support on your fitness journey.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center text-left">
            {/* Starter Plan */}
            <div className="bg-gray-50 p-6 sm:p-7 rounded-3xl border border-gray-200/90 space-y-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">Starter</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-gray-950">₹29</span>
                  <span className="text-xs text-gray-400 font-bold">/ 1 week trial</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Quick trial assessment &amp; baseline meal guide.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Basic workout plan
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> General diet guidance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Access to free resources
                </li>
              </ul>

              <button
                type="button"
                onClick={scrollToCalculator}
                className="w-full py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold transition"
              >
                Start Trial
              </button>
            </div>

            {/* Core Hero Plan: ₹99 8-Week Personalized Transformation (MOST POPULAR) */}
            <div className="bg-[#032e1c] text-white p-7 sm:p-8 rounded-3xl border-2 border-[#00e676] shadow-2xl space-y-6 relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00e676] text-gray-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                MOST POPULAR · 8 WEEKS
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Complete Transformation</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-5xl font-black text-white">₹99</span>
                  <span className="text-xs text-emerald-300 font-bold">one-time payment</span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Full 8-week customized roadmap + direct WhatsApp access to Coach Naveen.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-emerald-50 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Personalized 8-week workout progression</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Customized Indian diet plan (Dal, Roti, Rice)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Clinical medical review for joint/back pain</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Direct 1-on-1 WhatsApp &amp; In-App Coach chat</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Progress weigh-in updates every 4 weeks</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={scrollToCalculator}
                className="w-full py-3.5 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started for ₹99</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-50 p-6 sm:p-7 rounded-3xl border border-gray-200/90 space-y-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">Premium Pro</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-gray-950">₹179</span>
                  <span className="text-xs text-gray-400 font-bold">/ 16 weeks</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Extended 4-month advanced hypertrophy package.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Advanced periodization workouts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Supplement stack guidance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Bi-weekly video review
                </li>
              </ul>

              <button
                type="button"
                onClick={scrollToCalculator}
                className="w-full py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold transition"
              >
                Choose Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. STILL HAVE QUESTIONS (FAQ) ================= */}
      <section className="py-16 sm:py-20 bg-[#fafafa] border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
            {/* Left Col (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Still Have Questions?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                Find answers to common questions about our fitness plans, coaching and results.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs rounded-xl shadow-xs transition"
              >
                <span>View All FAQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right Col: Accordion Items (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-950 hover:bg-gray-50 transition"
                    >
                      <span>{faq.q}</span>
                      <span className="text-gray-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-gray-600 font-normal leading-relaxed border-t border-gray-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. READY TO FEEL UNSTOPPABLE? (CTA + Contact Form) ================= */}
      <section className="py-16 sm:py-20 bg-[#06100a] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            {/* Left Details (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-[#00e676] px-3 py-1 rounded-full border border-emerald-500/30">
                START YOUR JOURNEY TODAY
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                READY TO FEEL
                <br />
                <span className="text-[#00e676]">UNSTOPPABLE?</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-normal max-w-lg leading-relaxed">
                Let&apos;s build a stronger, healthier and happier you with a plan made just for you.
              </p>

              {/* Contact Pills */}
              <div className="space-y-3 pt-2 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-[#00e676]">
                    📞
                  </div>
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-[#00e676]">
                    ✉️
                  </div>
                  <span>support@bmyfit.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-[#00e676]">
                    📍
                  </div>
                  <span>Bengaluru, Karnataka, India</span>
                </div>
              </div>
            </div>

            {/* Right Contact Form (5 cols) */}
            <div className="lg:col-span-5 bg-[#091a11] p-6 sm:p-8 rounded-3xl border border-emerald-900/60 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white">Drop Me a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full bg-[#051009] text-white text-xs rounded-xl p-3 border border-emerald-900/60 focus:outline-none focus:border-[#00e676] transition"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="w-full bg-[#051009] text-white text-xs rounded-xl p-3 border border-emerald-900/60 focus:outline-none focus:border-[#00e676] transition"
                />
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Your Message..."
                  required
                  className="w-full bg-[#051009] text-white text-xs rounded-xl p-3 border border-emerald-900/60 focus:outline-none focus:border-[#00e676] transition"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactSent ? "Message Sent!" : "Send Message"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
