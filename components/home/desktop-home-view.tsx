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
    const approxBodyFat =
      gender === "male"
        ? Math.round((1.2 * computedBmi + 0.23 * age - 16.2) * 10) / 10
        : Math.round((1.2 * computedBmi + 0.23 * age - 5.4) * 10) / 10;
    setBodyFat(Math.max(10, Math.min(45, approxBodyFat)));

    const approxLean = Math.round((weight * (1 - approxBodyFat / 100)) * 10) / 10;
    setLeanMass(approxLean);

    const bmr =
      gender === "male"
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
    <div className="w-full bg-[#07100b] text-white selection:bg-[#00e676] selection:text-black">
      {/* ================= 1. DESKTOP HERO SECTION ================= */}
      <section className="relative w-full bg-gradient-to-b from-[#060c09] via-[#08140e] to-[#04120a] text-white pt-12 lg:pt-16 pb-16 lg:pb-24 overflow-hidden border-b border-emerald-950/60">
        {/* Radial Ambient Glow */}
        <div className="absolute top-1/4 right-1/4 w-[650px] h-[650px] bg-gradient-to-br from-[#00e676]/20 via-emerald-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-[#00c853]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-4 py-1.5 text-xs font-black tracking-wider text-[#00e676] uppercase shadow-lg shadow-emerald-950/50">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse" />
                <span>EVIDENCE-BASED FOR INDIAN BODIES</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black uppercase text-white leading-[1.03] tracking-tight">
                TRAIN SMART.
                <br />
                GET RESULTS.
                <br />
                <span className="text-[#00e676] drop-shadow-[0_4px_30px_rgba(0,230,118,0.5)]">
                  FEEL UNSTOPPABLE.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-lg lg:text-xl max-w-xl font-normal leading-relaxed">
                Your fitness journey should be simple, scientific and sustainable. Get a personalized Indian fitness and nutrition plan based on your exact body data, goal, and daily lifestyle.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="inline-flex items-center gap-3 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-base px-8 py-4 rounded-full shadow-xl shadow-emerald-500/25 hover:shadow-2xl transition-all duration-300 active:scale-95 group cursor-pointer"
                >
                  <span>Start Free Body Analysis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-bold text-base px-6 py-4 rounded-full transition-all duration-300"
                >
                  <span>Meet Coach Naveen</span>
                </Link>
              </div>

              {/* Trust Features Row */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-bold text-gray-300">
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
                  <span>Made for Indian Diets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00e676] flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>No Starvation Diets</span>
                </div>
              </div>
            </div>

            {/* Right Photography Column (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] aspect-[4/4.8] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-gradient-to-tr from-black via-gray-950 to-emerald-950/40 group">
                <Image
                  src="/images/hero-model.jpg"
                  alt="Athletic Indian bodybuilder curling dumbbell"
                  fill
                  priority
                  className="object-cover object-[center_12%] group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060c09] via-transparent to-transparent pointer-events-none" />

                {/* Better Stronger Healthier You script overlay */}
                <div className="absolute top-6 right-6 text-right select-none pointer-events-none z-20">
                  <div className="font-serif italic text-2xl lg:text-3xl text-white font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
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
      <section className="bg-[#03150c] border-b border-emerald-900/40 py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x-0 lg:divide-x divide-emerald-800/30">
            {/* Stat 1 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">3+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">CERTIFIED TRAINER</div>
              <p className="text-xs text-emerald-200/70">Expert fitness &amp; sports nutrition</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">7+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">YEARS OF EXPERIENCE</div>
              <p className="text-xs text-emerald-200/70">Transforming 1000+ Indian adults</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">1000+</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">CLIENTS TRANSFORMED</div>
              <p className="text-xs text-emerald-200/70">Real people. Real results.</p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#00e676]">95%</div>
              <div className="text-xs font-black uppercase tracking-wider text-white">GOAL SUCCESS RATE</div>
              <p className="text-xs text-emerald-200/70">Clients reach their target weight</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. CALCULATOR & MEET COACH SECTION ================= */}
      <section id="calculator-section" className="py-16 lg:py-20 bg-gradient-to-b from-[#04120a] via-[#06190f] to-[#04120a] border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Card: Know Your Body & Calculator (7 cols) */}
            <div className="lg:col-span-7 bg-[#0b1d14] rounded-3xl p-8 lg:p-10 border border-emerald-500/25 shadow-2xl flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#00e676] border border-emerald-500/40 px-3 py-1 rounded-full">
                    CLINICAL ANTHROPOMETRY
                  </span>
                  <span className="text-xs font-bold text-emerald-300/80">WHO &amp; US Navy Formula</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Know Your Body.
                  <br />
                  <span className="text-[#00e676]">Start Your Transformation.</span>
                </h2>
                <p className="text-sm text-gray-300 font-medium">
                  Get your clinical BMI, estimated body fat % and personalized daily calories calibrated for South Asian genetics in seconds.
                </p>
              </div>

              {/* Form & Gauge Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-6">
                {/* Inputs (7 cols) */}
                <form onSubmit={handleCalculate} className="sm:col-span-7 space-y-3.5">
                  {/* Age */}
                  <div className="flex items-center justify-between bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-xs font-bold text-gray-200">Age</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-16 bg-[#04120a] border border-emerald-500/40 rounded-lg px-2 py-1 text-center font-bold text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="text-xs text-gray-400 font-semibold">years</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="flex items-center justify-between bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-xs font-bold text-gray-200">Height</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-16 bg-[#04120a] border border-emerald-500/40 rounded-lg px-2 py-1 text-center font-bold text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="text-xs text-gray-400 font-semibold">cm</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-center justify-between bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-xs font-bold text-gray-200">Weight</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-16 bg-[#04120a] border border-emerald-500/40 rounded-lg px-2 py-1 text-center font-bold text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="text-xs text-gray-400 font-semibold">kg</span>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === "male"
                          ? "bg-[#00e676] text-gray-950 shadow-md"
                          : "bg-emerald-950/80 text-gray-300 border border-emerald-800/40 hover:bg-emerald-900/60"
                      }`}
                    >
                      <span>👨 Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === "female"
                          ? "bg-[#00e676] text-gray-950 shadow-md"
                          : "bg-emerald-950/80 text-gray-300 border border-emerald-800/40 hover:bg-emerald-900/60"
                      }`}
                    >
                      <span>👩 Female</span>
                    </button>
                  </div>

                  {/* Calculate CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <span>Calculate My Body</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Circular Gauge Display (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center text-center p-4 bg-[#05170e] rounded-2xl border border-emerald-500/30">
                  {/* SVG Circular Gauge */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#0a2a1b"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#00e676"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * Math.min(100, (calculatedBmi / 35) * 100)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white leading-none">{calculatedBmi}</span>
                      <span className="text-xs font-black uppercase text-[#00e676] mt-1">BMI SCORE</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-200 mt-2">Normal Range: 18.5 – 24.9</span>

                  {/* 3 Pill Stats */}
                  <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-emerald-900/60 text-center">
                    <div className="bg-[#0b1f14] p-2 rounded-xl border border-emerald-800/40">
                      <div className="text-sm font-black text-[#00e676]">{bodyFat}%</div>
                      <div className="text-[10px] text-gray-400 font-semibold">Body Fat</div>
                    </div>
                    <div className="bg-[#0b1f14] p-2 rounded-xl border border-emerald-800/40">
                      <div className="text-sm font-black text-teal-400">{leanMass} kg</div>
                      <div className="text-[10px] text-gray-400 font-semibold">Lean Mass</div>
                    </div>
                    <div className="bg-[#0b1f14] p-2 rounded-xl border border-emerald-800/40">
                      <div className="text-sm font-black text-amber-400">{dailyCalories}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">Calories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Meet Coach Naveen (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#052416] to-[#02180e] text-white rounded-3xl p-8 lg:p-10 border border-emerald-500/30 shadow-2xl flex flex-col justify-between relative overflow-hidden text-left">
              <div className="space-y-4 z-10">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#00e676] border border-emerald-500/40 px-3 py-1 rounded-full inline-block">
                  MEET YOUR COACH
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Coach Naveen
                </h2>

                <p className="text-sm text-emerald-100/90 font-normal leading-relaxed">
                  Owner of Blaze Gym &amp; multiple fitness hubs. Certified Fitness Coach &amp; Sports Nutritionist with 7+ years of clinical transformation experience tailored for Indian adults.
                </p>

                {/* Bullets */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <div className="w-6 h-6 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🏋️
                    </div>
                    <span>Blaze Gym Founder &amp; Head Coach</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <div className="w-6 h-6 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🎓
                    </div>
                    <span>Certified Sports Nutritionist (ISSA / ACSM)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <div className="w-6 h-6 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      ⏳
                    </div>
                    <span>7+ Years Experience · 1000+ Transformations</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-white">
                    <div className="w-6 h-6 rounded-full bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-xs">
                      🍛
                    </div>
                    <span>Specialist in Indian Food Macros &amp; Diets</span>
                  </div>
                </div>
              </div>

              {/* Framed Coach Portrait */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center gap-4 z-10">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#00e676]">
                  <Image
                    src="/images/coach-portrait.jpg"
                    alt="Coach Naveen"
                    fill
                    className="object-cover object-[center_35%]"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">1-on-1 Direct Support</h4>
                  <p className="text-xs text-gray-300 mt-0.5">Every ₹99 plan includes direct WhatsApp chat access to Coach Naveen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. TAILORED TRAINING EXPERIENCE (4 Horizontal Cards) ================= */}
      <section className="py-16 sm:py-20 bg-[#031109] text-white border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00e676] bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1 rounded-full">
              COMPLETE TRANSFORMATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              <span className="text-[#00e676]">TAILORED</span> TRAINING EXPERIENCE
            </h2>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">
              Whether your goal is to build strength, lose stubborn visceral fat or increase daily energy, our blueprints fit your body, schedule, and Indian food preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Card 1 */}
            <div className="bg-[#081f14] p-6 lg:p-7 rounded-3xl border border-emerald-800/40 shadow-lg space-y-4 hover:border-emerald-500/60 transition group">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                PERSONAL TRAINING SPLIT
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Custom workout splits based on whether you train at gym, home dumbbells, or bodyweight.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#081f14] p-6 lg:p-7 rounded-3xl border border-emerald-800/40 shadow-lg space-y-4 hover:border-emerald-500/60 transition group">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                1-ON-1 COACH ACCESS
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Direct WhatsApp helpline with Coach Naveen for exercise form checks and meal swaps.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#081f14] p-6 lg:p-7 rounded-3xl border border-emerald-800/40 shadow-lg space-y-4 hover:border-emerald-500/60 transition group">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                INDIAN MEAL CALIBRATION
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Dal, roti, rice, paneer, eggs, and chicken calibrated to meet protein and fiber targets.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#081f14] p-6 lg:p-7 rounded-3xl border border-emerald-800/40 shadow-lg space-y-4 hover:border-emerald-500/60 transition group">
              <div className="w-12 h-12 rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/30 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                PROGRESS WEIGH-IN CHECKS
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Weekly check-ins and mid-plan milestone adaptations to keep fat loss steady and safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. ABOUT YOUR COACH FEATURE ================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#04120a] to-[#071910] text-white border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Big Photo (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-emerald-950/40">
                <Image
                  src="/images/coach-portrait.jpg"
                  alt="Coach Naveen in the gym"
                  fill
                  className="object-cover object-[center_35%]"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white text-left">
                  <div className="text-3xl font-black text-[#00e676]">7+ YEARS</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-200">
                    TRANSFORMING 1000+ INDIAN CLIENTS
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bio & Credentials (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#00e676] border border-emerald-500/30 px-3.5 py-1 rounded-full inline-block">
                  ABOUT YOUR COACH
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                  COACH <span className="text-[#00e676]">NAVEEN</span>
                </h2>
                <p className="text-base text-gray-300 font-normal leading-relaxed pt-1">
                  I&apos;m Naveen, a Certified Fitness Coach &amp; Sports Nutritionist with 7+ years of experience helping Indian adults transform their bodies. My approach is simple — evidence-based science, progressive consistency, and dietary habits that fit your actual daily life.
                </p>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3.5 p-4 bg-[#082015] rounded-2xl border border-emerald-800/40">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-[#00e676] flex items-center justify-center text-lg font-black border border-emerald-500/30">
                    🛡️
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Certified Fitness Coach</span>
                    <span className="text-xs text-gray-400">ISSA / ACSM Standards</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 bg-[#082015] rounded-2xl border border-emerald-800/40">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-[#00e676] flex items-center justify-center text-lg font-black border border-emerald-500/30">
                    🥗
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Sports Nutritionist</span>
                    <span className="text-xs text-gray-400">South Asian Metabolism</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 bg-[#082015] rounded-2xl border border-emerald-800/40">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-[#00e676] flex items-center justify-center text-lg font-black border border-emerald-500/30">
                    👥
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">1000+ Clients Guided</span>
                    <span className="text-xs text-gray-400">Blaze Gym Founder</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 bg-[#082015] rounded-2xl border border-emerald-800/40">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-[#00e676] flex items-center justify-center text-lg font-black border border-emerald-500/30">
                    🍛
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Specialist in Indian Food</span>
                    <span className="text-xs text-gray-400">Zero Western Meal Force</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95"
                >
                  <span>Read Coach Naveen&apos;s Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. WHAT OUR CLIENTS SAY ================= */}
      <section className="py-16 sm:py-24 bg-[#031109] border-b border-emerald-950/60 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00e676] bg-emerald-950 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                VERIFIED CLIENT TRANSFORMATIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2.5">
                What Our Clients Say
              </h2>
              <p className="text-sm text-gray-300 font-medium mt-1">
                Real feedback from clients who unlocked their 8-week transformation blueprint.
              </p>
            </div>

            <Link
              href="/details"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group shrink-0"
            >
              <span>Start Your Transformation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 5 Horizontal Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-left">
            {/* Review 1 */}
            <div className="bg-[#081e13] p-6 rounded-3xl border border-emerald-800/40 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[#00e676] text-xs">★★★★★</div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic">
                  &ldquo;Lost 12 kg in 4 months with home-cooked Indian meals. No bizarre meal prep!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-900/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00e676] font-bold text-xs flex items-center justify-center shrink-0">
                  RK
                </div>
                <div>
                  <div className="text-xs font-black text-white">Rahul K.</div>
                  <div className="text-[10px] text-gray-400">Software Engineer, BLR</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#081e13] p-6 rounded-3xl border border-emerald-800/40 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[#00e676] text-xs">★★★★★</div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic">
                  &ldquo;Diet plan has real dal, roti, and curd. I never felt fatigued during workouts.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-900/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00e676] font-bold text-xs flex items-center justify-center shrink-0">
                  PS
                </div>
                <div>
                  <div className="text-xs font-black text-white">Priya S.</div>
                  <div className="text-[10px] text-gray-400">Consultant, Pune</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#081e13] p-6 rounded-3xl border border-emerald-800/40 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[#00e676] text-xs">★★★★★</div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic">
                  &ldquo;Gained 3.5 kg lean muscle and improved my compound lifts. Amazing structure!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-900/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00e676] font-bold text-xs flex items-center justify-center shrink-0">
                  AM
                </div>
                <div>
                  <div className="text-xs font-black text-white">Arjun M.</div>
                  <div className="text-[10px] text-gray-400">Student, Hyderabad</div>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-[#081e13] p-6 rounded-3xl border border-emerald-800/40 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[#00e676] text-xs">★★★★★</div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic">
                  &ldquo;Results are real. Zero crash diets, just calibrated macros and WhatsApp support.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-900/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00e676] font-bold text-xs flex items-center justify-center shrink-0">
                  SR
                </div>
                <div>
                  <div className="text-xs font-black text-white">Sneha R.</div>
                  <div className="text-[10px] text-gray-400">Homemaker, Mumbai</div>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-[#081e13] p-6 rounded-3xl border border-emerald-800/40 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-[#00e676] text-xs">★★★★★</div>
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic">
                  &ldquo;My energy levels and stamina improved tremendously. The best ₹99 investment!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-900/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00e676] font-bold text-xs flex items-center justify-center shrink-0">
                  VT
                </div>
                <div>
                  <div className="text-xs font-black text-white">Vikram T.</div>
                  <div className="text-[10px] text-gray-400">Founder, Delhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. BUILT FOR INDIAN BODIES BANNER ================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#04120a] to-[#071d11] text-white border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            {/* Left Col (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-950 text-[#00e676] px-3.5 py-1 rounded-full border border-emerald-500/40">
                WHY BMYFIT?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                Built for <span className="text-[#00e676]">Indian Bodies</span>
              </h2>
              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                South Asian genetics present unique metabolic profiles — higher visceral adiposity and lower natural muscle mass. We combine global exercise physiology with Indian food habits and real-world practicality.
              </p>
              <button
                type="button"
                onClick={scrollToCalculator}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
              >
                <span>Calculate Your Target Today</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Col: 3 Pillars (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#082216] p-6 rounded-2xl border border-emerald-800/40 space-y-3">
                <div className="text-3xl">📄</div>
                <h3 className="text-base font-black text-white">Scientifically Backed</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  Based on WHO &amp; ICMR research specifically calibrated for South Asian anthropometric cutoffs.
                </p>
              </div>

              <div className="bg-[#082216] p-6 rounded-2xl border border-emerald-800/40 space-y-3">
                <div className="text-3xl">👤</div>
                <h3 className="text-base font-black text-white">100% Personalized</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  No copy-pasted templates. Every workout split and macro breakdown matches your biometrics.
                </p>
              </div>

              <div className="bg-[#082216] p-6 rounded-2xl border border-emerald-800/40 space-y-3">
                <div className="text-3xl">📈</div>
                <h3 className="text-base font-black text-white">Sustainable Results</h3>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  Build habits you can maintain lifelong without feeling deprived or giving up family dinners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FLAGSHIP PRICING (Single Clear ₹99 Plan Showcase) ================= */}
      <section className="py-20 lg:py-24 bg-[#031109] text-center border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00e676] bg-emerald-950 border border-emerald-500/40 px-4 py-1.5 rounded-full">
              SIMPLE &amp; TRANSPARENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-3">
              One Plan. <span className="text-[#00e676]">Real Transformation.</span>
            </h2>
            <p className="text-sm text-gray-300 font-medium">
              Everything you need for your 8-week body recomposition — zero recurring charges, zero hidden subscriptions.
            </p>
          </div>

          {/* Centered Flagship Card */}
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#052517] via-[#041d12] to-[#02140c] text-white p-8 lg:p-12 rounded-3xl border-2 border-[#00e676] shadow-2xl space-y-8 relative text-left">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00e676] text-gray-950 text-xs font-black uppercase tracking-wider px-5 py-1.5 rounded-full shadow-lg shadow-emerald-500/40">
              FLAGSHIP BLUEPRINT · 8 WEEKS
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-emerald-900/60 pb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Complete Personalized Roadmap</span>
                <h3 className="text-2xl font-black text-white mt-1">BMYFIT 8-Week Transformation</h3>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-white">₹99</span>
                  <span className="text-xs text-emerald-300 font-bold">one-time</span>
                </div>
                <span className="text-[11px] text-gray-400">Includes all 8 weeks</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-emerald-100">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Personalized 8-Week Progressive Workout Routine</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Indian Meal Plan with Roti, Dal, Rice &amp; High Protein</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Direct 1-on-1 WhatsApp &amp; In-App Coach Naveen Chat</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Medical review for knee, lower back &amp; joint safety</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>Progress weigh-in recalibration every 4 weeks</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00e676] text-gray-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </span>
                <span>100% Money-Back Guarantee if no results</span>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToCalculator}
              className="w-full py-4 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Get Your 8-Week Plan for ₹99</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center text-xs text-gray-400 font-medium">
              Instant digital access after intake · 100% safe &amp; encrypted
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. STILL HAVE QUESTIONS (FAQ) ================= */}
      <section className="py-20 lg:py-24 bg-[#05150d] text-white border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00e676] bg-emerald-950 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                COMMON QUESTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Frequently Asked <span className="text-[#00e676]">Questions</span>
              </h2>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                Everything you need to know about our assessments, personalized routines, and coaching.
              </p>
              <div className="pt-2">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-900/60 text-[#00e676] font-bold text-xs transition"
                >
                  <span>View All FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-800/40 bg-[#082015] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-white hover:text-[#00e676] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#00e676] ml-3">
                      {openFaqIndex === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-emerald-900/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. DROP A MESSAGE / SUPPORT ================= */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-[#04120a] to-[#020b06] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00e676] bg-emerald-950 border border-emerald-500/40 px-3.5 py-1 rounded-full">
                DIRECT ACCESS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                Ready to Feel <span className="text-[#00e676]">Unstoppable?</span>
              </h2>
              <p className="text-base text-gray-300 font-normal leading-relaxed">
                Connect with our team or Coach Naveen directly with any questions about intake or payment.
              </p>
              <div className="space-y-3 text-sm text-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-[#00e676]">📍</span>
                  <span>Blaze Fitness Hub, BTM Layout 2nd Stage, Bengaluru, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#00e676]">📞</span>
                  <span>WhatsApp Helpline: +91 98490 12345</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#00e676]">✉️</span>
                  <span>support@bmyfit.in</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="lg:col-span-6 bg-[#082015] p-8 rounded-3xl border border-emerald-500/30 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-4">Send a Message</h3>
              {contactSent ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-[#00e676] text-sm font-bold">
                  ✓ Thank you! Coach Naveen&apos;s desk will respond shortly.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#04120a] border border-emerald-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#04120a] border border-emerald-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message..."
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-[#04120a] border border-emerald-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00e676] hover:bg-[#00c853] text-gray-950 font-black text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
