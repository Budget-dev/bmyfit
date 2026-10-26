export type SupplementCategory =
  | "all"
  | "protein"
  | "vitamins"
  | "fat-loss"
  | "muscle-gain"
  | "essentials";

export interface SupplementProduct {
  id: string;
  name: string;
  fullTitle?: string;
  subtitle: string;
  category: SupplementCategory;
  additionalCategories?: SupplementCategory[];
  rating: number;
  reviewCount: number;
  tagBadge?: string;
  isTrustedBrand?: boolean;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  largeImage?: string;
  gallery?: string[];
  amazonUrl: string;
  variants?: Array<{
    label: string;
    price: number;
    originalPrice: number;
  }>;
  whyRecommended?: {
    goal: string;
    text: string;
  };
  keyBenefits?: Array<{
    title: string;
    subtitle?: string;
    icon: "muscle" | "absorption" | "lean" | "fullness" | "heart" | "energy" | "strength";
  }>;
  howToUse?: Array<{
    step: number;
    text: string;
  }>;
  importantNote?: string;
  nutritionFacts?: {
    servingSize: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  similarProductIds: string[];
}

export const SUPPLEMENT_PRODUCTS: SupplementProduct[] = [
  {
    id: "muscleblaze-biozyme-whey",
    name: "MuscleBlaze Whey Protein",
    fullTitle: "MuscleBlaze Biozyme Whey Protein",
    subtitle: "Helps in muscle recovery and supports fat loss.",
    category: "protein",
    additionalCategories: ["fat-loss", "muscle-gain"],
    rating: 4.4,
    reviewCount: 12850,
    tagBadge: "Most Recommended",
    isTrustedBrand: true,
    price: 2299,
    originalPrice: 2799,
    discountPercent: 18,
    image: "/images/products/product-muscleblaze.png",
    largeImage: "/images/products/muscleblaze-biozyme-large.png",
    gallery: [
      "/images/products/muscleblaze-biozyme-large.png",
      "/images/products/thumb-mb-shake.png",
      "/images/products/thumb-mb-nutrition.png",
      "/images/products/thumb-mb-use.png",
    ],
    amazonUrl: "https://www.amazon.in/s?k=MuscleBlaze+Biozyme+Whey+Protein",
    variants: [
      { label: "1 kg (Rich Chocolate)", price: 2299, originalPrice: 2799 },
      { label: "2 kg (Rich Chocolate)", price: 4299, originalPrice: 5299 },
      { label: "1 kg (Cafe Mocha)", price: 2349, originalPrice: 2849 },
      { label: "2 kg (Ice Cream Chocolate)", price: 4399, originalPrice: 5399 },
    ],
    whyRecommended: {
      goal: "Fat Loss & Muscle Retention",
      text: "Based on your goal (Fat Loss) and workout plan, a high-quality protein can help you maintain muscle, recover faster and stay full for longer.",
    },
    keyBenefits: [
      { title: "Supports muscle recovery", icon: "muscle" },
      { title: "High protein absorption", icon: "absorption" },
      { title: "Helps maintain lean muscle", icon: "lean" },
      { title: "Keeps you full for longer", icon: "fullness" },
    ],
    howToUse: [
      { step: 1, text: "Add 1 scoop (33g) to 200–250 ml of water or milk." },
      { step: 2, text: "Shake well for 20–30 seconds in your shaker." },
      { step: 3, text: "Consume 1–2 times daily (post workout or as per your nutrition plan)." },
    ],
    importantNote:
      "Supplements are not mandatory. Use them along with your meal plan and consult a healthcare professional if you have any medical condition.",
    nutritionFacts: {
      servingSize: "per 33g scoop",
      calories: "130 kcal",
      protein: "25 g",
      carbs: "2.5 g",
      fats: "1.5 g",
    },
    similarProductIds: [
      "on-gold-standard-whey",
      "myfitness-peanut-butter",
      "healthkart-omega-3",
      "himalaya-multivitamin",
    ],
  },
  {
    id: "on-gold-standard-whey",
    name: "ON Gold Standard Whey",
    fullTitle: "Optimum Nutrition (ON) Gold Standard 100% Whey",
    subtitle: "High quality protein for lean muscle and recovery.",
    category: "protein",
    additionalCategories: ["fat-loss", "muscle-gain"],
    rating: 4.6,
    reviewCount: 28420,
    tagBadge: "Best for Fat Loss",
    isTrustedBrand: true,
    price: 5499,
    originalPrice: 6499,
    discountPercent: 15,
    image: "/images/products/product-on-gold.png",
    largeImage: "/images/products/product-on-gold.png",
    gallery: ["/images/products/product-on-gold.png"],
    amazonUrl: "https://www.amazon.in/s?k=Optimum+Nutrition+Gold+Standard+Whey",
    variants: [
      { label: "1 kg (Double Rich Chocolate)", price: 3699, originalPrice: 4299 },
      { label: "2.27 kg (Double Rich Chocolate)", price: 5499, originalPrice: 6499 },
      { label: "2.27 kg (Vanilla Ice Cream)", price: 5549, originalPrice: 6499 },
    ],
    whyRecommended: {
      goal: "Lean Muscle & Quick Digestion",
      text: "Gold standard cross-flow micro-filtered whey isolates with BCAAs and glutamine to accelerate post-workout protein synthesis.",
    },
    keyBenefits: [
      { title: "Pure Whey Isolate primary source", icon: "absorption" },
      { title: "5.5g naturally occurring BCAAs", icon: "muscle" },
      { title: "Low sugar & low fat formula", icon: "lean" },
      { title: "World's best selling protein brand", icon: "strength" },
    ],
    howToUse: [
      { step: 1, text: "Mix 1 rounded scoop (30.4g) with 180-240ml of cold water." },
      { step: 2, text: "Stir, shake, or blend for 30 seconds until completely dissolved." },
      { step: 3, text: "Drink 30-60 minutes post-workout or between meals." },
    ],
    importantNote:
      "Supplements are not mandatory. Use them along with your meal plan.",
    nutritionFacts: {
      servingSize: "per 30.4g scoop",
      calories: "120 kcal",
      protein: "24 g",
      carbs: "3 g",
      fats: "1 g",
    },
    similarProductIds: [
      "muscleblaze-biozyme-whey",
      "healthkart-omega-3",
      "myfitness-peanut-butter",
      "himalaya-multivitamin",
    ],
  },
  {
    id: "himalaya-multivitamin",
    name: "Himalaya Multivitamin",
    fullTitle: "Himalaya Multivitamin for Men & Women",
    subtitle: "Supports energy, immunity and overall health.",
    category: "vitamins",
    additionalCategories: ["essentials"],
    rating: 4.3,
    reviewCount: 4210,
    tagBadge: "Daily Essentials",
    isTrustedBrand: true,
    price: 549,
    originalPrice: 700,
    discountPercent: 22,
    image: "/images/products/product-himalaya.png",
    largeImage: "/images/products/product-himalaya.png",
    gallery: ["/images/products/product-himalaya.png"],
    amazonUrl: "https://www.amazon.in/s?k=Himalaya+Multivitamin+for+Men",
    variants: [
      { label: "60 Capsules Bottle", price: 549, originalPrice: 700 },
      { label: "120 Capsules Twin Pack", price: 999, originalPrice: 1400 },
    ],
    whyRecommended: {
      goal: "Metabolic Support & Immunity",
      text: "Fills micronutrient gaps on a calorie-deficit diet, preventing lethargy and keeping immune defenses resilient.",
    },
    keyBenefits: [
      { title: "23 essential vitamins & minerals", icon: "energy" },
      { title: "Natural herbal extracts blend", icon: "absorption" },
      { title: "Supports daily cellular energy", icon: "strength" },
      { title: "Easy on the stomach", icon: "fullness" },
    ],
    howToUse: [
      { step: 1, text: "Take 1 tablet daily with lukewarm water." },
      { step: 2, text: "Best taken after breakfast or post lunch." },
    ],
    importantNote:
      "Do not exceed recommended daily dosage. Keep out of reach of children.",
    nutritionFacts: {
      servingSize: "per 1 tablet",
      calories: "0 kcal",
      protein: "0 g",
      carbs: "0.2 g",
      fats: "0 g",
    },
    similarProductIds: [
      "healthkart-omega-3",
      "muscleblaze-biozyme-whey",
      "on-gold-standard-whey",
      "myfitness-peanut-butter",
    ],
  },
  {
    id: "healthkart-omega-3",
    name: "HealthKart Omega 3",
    fullTitle: "HK Vitals Omega 3 Fish Oil 1000mg",
    subtitle: "Supports heart, brain and joint health.",
    category: "essentials",
    additionalCategories: ["fat-loss", "vitamins"],
    rating: 4.5,
    reviewCount: 6980,
    tagBadge: "Supports Fat Loss",
    isTrustedBrand: true,
    price: 599,
    originalPrice: 799,
    discountPercent: 25,
    image: "/images/products/product-omega3.png",
    largeImage: "/images/products/product-omega3.png",
    gallery: ["/images/products/product-omega3.png"],
    amazonUrl: "https://www.amazon.in/s?k=HK+Vitals+Omega+3+Fish+Oil",
    variants: [
      { label: "60 Softgels Bottle", price: 599, originalPrice: 799 },
      { label: "120 Softgels Value Pack", price: 1049, originalPrice: 1499 },
    ],
    whyRecommended: {
      goal: "Joint Lubrication & Fat Oxidation",
      text: "EPA and DHA fatty acids support cardiovascular function, ease heavy resistance training joint friction, and improve insulin sensitivity.",
    },
    keyBenefits: [
      { title: "1000mg Pure Fish Oil per capsule", icon: "heart" },
      { title: "180mg EPA + 120mg DHA ratio", icon: "energy" },
      { title: "Anti-reflux enteric coating", icon: "absorption" },
      { title: "Zero heavy metal impurities", icon: "strength" },
    ],
    howToUse: [
      { step: 1, text: "Take 1 softgel capsule with a main meal (lunch or dinner)." },
      { step: 2, text: "Swallow whole with plenty of water." },
    ],
    importantNote:
      "Store in a cool dry place away from direct sunlight.",
    nutritionFacts: {
      servingSize: "per 1 softgel",
      calories: "10 kcal",
      protein: "0.2 g",
      carbs: "0 g",
      fats: "1 g (Omega-3 300mg)",
    },
    similarProductIds: [
      "himalaya-multivitamin",
      "muscleblaze-biozyme-whey",
      "on-gold-standard-whey",
      "myfitness-peanut-butter",
    ],
  },
  {
    id: "myfitness-peanut-butter",
    name: "MyFitness Peanut Butter",
    fullTitle: "MyFitness High Protein Dark Chocolate Peanut Butter",
    subtitle: "Crispy, high protein spread made with roasted peanuts.",
    category: "essentials",
    additionalCategories: ["muscle-gain"],
    rating: 4.4,
    reviewCount: 8210,
    tagBadge: "Healthy Fats",
    isTrustedBrand: true,
    price: 699,
    originalPrice: 899,
    discountPercent: 22,
    image: "/images/products/product-peanut-butter.png",
    largeImage: "/images/products/product-peanut-butter.png",
    gallery: ["/images/products/product-peanut-butter.png"],
    amazonUrl: "https://www.amazon.in/s?k=MyFitness+Peanut+Butter+Dark+Chocolate",
    variants: [
      { label: "1250 g (Crispy)", price: 699, originalPrice: 899 },
      { label: "2.5 kg Tub", price: 1299, originalPrice: 1699 },
    ],
    whyRecommended: {
      goal: "Clean Caloric Density & Healthy Monounsaturated Fats",
      text: "Perfect morning or pre-workout topping on brown bread or oats to sustain energy and hit high daily protein targets.",
    },
    keyBenefits: [
      { title: "26g protein per 100g", icon: "muscle" },
      { title: "100% roasted grade-A peanuts", icon: "absorption" },
      { title: "Zero trans fat & zero cholesterol", icon: "heart" },
      { title: "Rich dark Belgian chocolate flavor", icon: "fullness" },
    ],
    howToUse: [
      { step: 1, text: "Spread 1-2 tbsp (32g) over whole wheat toast, roti, or oatmeal." },
      { step: 2, text: "Can also be blended into your protein shake." },
    ],
    importantNote: "Oil separation is natural. Stir well before each use.",
    nutritionFacts: {
      servingSize: "per 32g serving (2 tbsp)",
      calories: "190 kcal",
      protein: "8 g",
      carbs: "8 g",
      fats: "15 g",
    },
    similarProductIds: [
      "muscleblaze-biozyme-whey",
      "on-gold-standard-whey",
      "healthkart-omega-3",
      "himalaya-multivitamin",
    ],
  },
  {
    id: "muscleblaze-creatine-monohydrate",
    name: "MuscleBlaze Creatine",
    fullTitle: "MuscleBlaze Micronized Creatine Monohydrate",
    subtitle: "Increases strength, explosive power, and muscle volume.",
    category: "muscle-gain",
    additionalCategories: ["fat-loss"],
    rating: 4.5,
    reviewCount: 15400,
    tagBadge: "Strength Booster",
    isTrustedBrand: true,
    price: 499,
    originalPrice: 649,
    discountPercent: 23,
    image: "/images/products/product-muscleblaze.png",
    largeImage: "/images/products/product-muscleblaze.png",
    gallery: ["/images/products/product-muscleblaze.png"],
    amazonUrl: "https://www.amazon.in/s?k=MuscleBlaze+Creatine+Monohydrate",
    variants: [
      { label: "100 g Unflavored", price: 499, originalPrice: 649 },
      { label: "250 g Unflavored", price: 949, originalPrice: 1299 },
    ],
    whyRecommended: {
      goal: "Strength & Cellular ATP Regeneration",
      text: "Scientifically proven to increase power output by 15%, preserve lean muscle during cutting, and hydrate muscle cells.",
    },
    keyBenefits: [
      { title: "100% pure micronized creatine", icon: "strength" },
      { title: "Enhances peak ATP regeneration", icon: "energy" },
      { title: "Boosts lifting capacity & endurance", icon: "muscle" },
      { title: "Unflavored, easily mixes with protein", icon: "absorption" },
    ],
    howToUse: [
      { step: 1, text: "Mix 1 scoop (3g) with 200ml water, juice, or your protein shake." },
      { step: 2, text: "Drink daily. Drink at least 3-4 liters of water throughout the day." },
    ],
    importantNote: "Maintain adequate daily water intake while supplementing with creatine.",
    nutritionFacts: {
      servingSize: "per 3g scoop",
      calories: "0 kcal",
      protein: "0 g",
      carbs: "0 g",
      fats: "0 g (Creatine: 3g)",
    },
    similarProductIds: [
      "muscleblaze-biozyme-whey",
      "on-gold-standard-whey",
      "healthkart-omega-3",
      "himalaya-multivitamin",
    ],
  },
];

export function getProductById(id: string): SupplementProduct | undefined {
  return SUPPLEMENT_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: SupplementCategory): SupplementProduct[] {
  if (category === "all") return SUPPLEMENT_PRODUCTS;
  return SUPPLEMENT_PRODUCTS.filter(
    (p) => p.category === category || p.additionalCategories?.includes(category)
  );
}

export function getRecommendedProductsForGoal(goal?: string): SupplementProduct[] {
  if (!goal) return SUPPLEMENT_PRODUCTS.slice(0, 4);
  const normalized = goal.toLowerCase();

  if (normalized.includes("fat") || normalized.includes("loss") || normalized.includes("cut")) {
    return [
      SUPPLEMENT_PRODUCTS[0], // MB Biozyme Whey (Most Recommended)
      SUPPLEMENT_PRODUCTS[1], // ON Gold Standard (Best for Fat Loss)
      SUPPLEMENT_PRODUCTS[2], // Himalaya Multivitamin
      SUPPLEMENT_PRODUCTS[3], // HK Vitals Omega 3
    ];
  }

  if (normalized.includes("muscle") || normalized.includes("bulk") || normalized.includes("gain") || normalized.includes("strength")) {
    return [
      SUPPLEMENT_PRODUCTS[0], // MB Biozyme
      SUPPLEMENT_PRODUCTS[5], // Creatine
      SUPPLEMENT_PRODUCTS[4], // Peanut Butter
      SUPPLEMENT_PRODUCTS[2], // Multivitamin
    ];
  }

  // Default balanced recommendation
  return SUPPLEMENT_PRODUCTS.slice(0, 4);
}
